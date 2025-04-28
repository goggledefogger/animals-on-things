import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';

const FinishLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [needsEmail, setNeedsEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    console.log('FinishLoginPage loaded, checking link...');
    if (isSignInWithEmailLink(auth, window.location.href)) {
      console.log('Link is a sign-in link.');
      const savedEmail = window.localStorage.getItem('emailForSignIn');

      if (savedEmail) {
        console.log('Email found in localStorage:', savedEmail);
        setEmail(savedEmail);
        completeSignIn(savedEmail);
      } else {
        // If no email found, ask the user for it
        console.log('Email not found in localStorage, prompting user.');
        setNeedsEmail(true);
        setLoading(false);
      }
    } else {
      // Not a sign-in link, redirect to login
      console.log('Not a sign-in link, redirecting to /login.');
      setLoading(false);
      navigate('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const completeSignIn = async (emailToUse: string) => {
    console.log(`Attempting sign-in for ${emailToUse}...`);
    setLoading(true);
    setError(null);

    try {
      // Simple sign-in, no linking/migration logic needed now
      await signInWithEmailLink(auth, emailToUse, window.location.href);

      // Clear email from storage
      window.localStorage.removeItem('emailForSignIn');
      console.log('Sign-in successful, email removed from localStorage.');

      // Redirect to main app
      navigate('/');
    } catch (err) {
      console.error('Error signing in with email link:', err);
      if (err instanceof Error) {
          setError(err.message);
      } else {
          setError('Failed to sign in. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
        completeSignIn(email);
    }
  };

  // Loading state while initially processing the link
  if (loading && !needsEmail) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner className="h-12 w-12 mb-4 text-sky-600 dark:text-sky-400" />
          <p className="text-gray-600 dark:text-gray-400">Verifying sign-in link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-md py-12 min-h-screen flex items-center">
      <Card className="w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-300">Complete Sign In</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Almost there!</p>
        </div>

        {needsEmail ? (
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              We couldn't find the email associated with this link. Please enter your email again to complete the sign-in:
            </p>
            <div className="mb-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full"
                required
              />
            </div>

            {error && (
              <div className="mb-4 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Complete Sign In'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            {error ? (
              <>
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Sign-in failed</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <Button onClick={() => navigate('/login')} variant="secondary">
                  Try Again
                </Button>
              </>
            ) : (
                // Should only show loading indicator briefly before redirect,
                // but adding a placeholder in case something unexpected happens
                <p className="text-gray-500 dark:text-gray-400">Processing...</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FinishLoginPage;
