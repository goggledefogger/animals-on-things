import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase'; // Assuming firebase config is in src/firebase.ts

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error?: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true); // Start loading when effect runs
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => { // Make async
      if (user) {
        // User is signed in or state changed to signed in
        setCurrentUser(user);
        setLoading(false);
      } else {
        // User is signed out or no user initially found
        // Attempt to sign in anonymously
        try {
          console.log("No user found, attempting anonymous sign-in...");
          const userCredential = await signInAnonymously(auth);
          // setCurrentUser(userCredential.user); // Listener will trigger this automatically
          console.log("Anonymous sign-in successful:", userCredential.user.uid);
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          setError(error instanceof Error ? error : new Error("Anonymous sign-in failed"));
          setCurrentUser(null); // Ensure user is null on failure
          setLoading(false); // Stop loading on error
        }
        // setLoading(false); // Set loading false after sign-in attempt completes (or listener catches it)
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    error,
  };

  // Don't render children until loading is complete to ensure currentUser is set
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 