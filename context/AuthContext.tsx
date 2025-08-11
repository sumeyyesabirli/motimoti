import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../firebaseConfig';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    signInWithEmail: async (email: string, password: string) => {
      const normalizedEmail = email.trim();
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
    },
    signUpWithEmail: async (email: string, password: string) => {
      const normalizedEmail = email.trim();
      await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    },
    signOutUser: async () => {
      await signOut(auth);
    },
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};


