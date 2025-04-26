import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path as necessary

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider mounted, setting up auth listener...');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.uid);
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      } else {
        // No user, try anonymous sign-in
        console.log('No user found, attempting anonymous sign-in...');
        setLoading(true); // Keep loading until sign-in attempt is complete
        setError(null);
        try {
          await signInAnonymously(auth);
          // Listener will pick up the new user state
          console.log('Anonymous sign-in successful (listener will update state).');
        } catch (err: any) {
          console.error("Anonymous sign-in error:", err);
          setError(`Failed to sign in anonymously: ${err.message}`);
          setUser(null);
          setLoading(false); // Stop loading on error
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('AuthProvider unmounting, unsubscribing from auth listener...');
      unsubscribe();
    }
  }, []);

  // Value provided by the context
  const value = {
    user,
    loading,
    error,
  };

  // Render children only when loading is complete? Or show loading indicator?
  // For now, we pass loading state down, App can decide how to render.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 