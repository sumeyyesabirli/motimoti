// context/AuthContext.tsx
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase dinleyicisi: kullanıcı giriş/çıkış yaptığında tetiklenir
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

