import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  getIdToken: () => Promise<string | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Sync or fetch minimal user profile
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const initialProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Anonymous Explorer',
              photoURL: currentUser.photoURL || undefined,
              createdAt: serverTimestamp(),
              lastActiveAt: serverTimestamp()
            };
            await setDoc(userRef, initialProfile);
          } else {
            // Update lastActiveAt
            await setDoc(userRef, { lastActiveAt: serverTimestamp() }, { merge: true });
          }
        } catch (err: any) {
          console.warn('Profile sync notification:', err?.message);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let userFriendlyMessage = 'Failed to complete Google Sign-In.';
      if (err.code === 'auth/popup-blocked') {
        userFriendlyMessage = 'Popup was blocked by your browser. Please allow popups for this site or open in a new tab.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'Sign-in window was closed before completing.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        userFriendlyMessage = 'Previous sign-in request was cancelled.';
      } else if (err.message) {
        userFriendlyMessage = err.message;
      }
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign-Out Error:', err);
      setError(err.message || 'Failed to sign out.');
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await getIdToken(auth.currentUser, false);
    } catch (err) {
      console.error('Failed to get auth token:', err);
      return null;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        signInWithGoogle,
        signOut,
        getToken,
        getIdToken: getToken,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
