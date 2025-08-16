// Firebase entegreli AuthContext
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase dinleyicisi: kullanıcı giriş/çıkış yaptığında tetiklenir
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Firebase auth state changed:', currentUser?.email); // Debug için
      setUser(currentUser);
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
    <AuthContext.Provider value={{ user, isLoading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

