// Firebase entegreli AuthContext
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';

interface UserData {
  uid: string;
  email: string | null;
  displayName?: string;
  anonymousName?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  signIn: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kullanıcı bilgilerini Firestore'dan yükle
  const loadUserData = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: data.displayName,
          anonymousName: data.anonymousName,
        });
      } else {
        // Kullanıcı dokümanı yoksa temel bilgileri kullan
        setUserData({
          uid: currentUser.uid,
          email: currentUser.email,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Hata durumunda temel bilgileri kullan
      setUserData({
        uid: currentUser.uid,
        email: currentUser.email,
      });
    }
  };

  useEffect(() => {
    // Firebase dinleyicisi: kullanıcı giriş/çıkış yaptığında tetiklenir
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Firebase auth state changed:', currentUser?.email); // Debug için
      setUser(currentUser);
      
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext signIn called with:', email, password); // Debug için
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase signIn successful:', userCredential.user.email); // Debug için
    } catch (error: any) {
      console.error('Firebase signIn error:', error); // Debug için
      throw new Error(error.message || 'Giriş yapılamadı');
    }
  };

  const signOutUser = async () => {
    console.log('Signing out user'); // Debug için
    try {
      await signOut(auth);
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, isLoading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

