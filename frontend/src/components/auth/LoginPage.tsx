import React, { useState } from 'react';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const auth = getAuth();

      // Use environment variable for the base URL
      const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
      console.log(`Using base URL for sign-in link: ${baseUrl}`); // Debug log

      const actionCodeSettings = {
        // URL must be whitelisted in Firebase Console -> Auth -> Sign-in method
        // Use VITE_APP_BASE_URL from .env / .env.production
        url: `${baseUrl}/finishLogin`,
        handleCodeInApp: true
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Save the email locally to use on the finishLogin page
      window.localStorage.setItem('emailForSignIn', email);
      console.log(`Sign-in link sent to ${email}, email saved to localStorage`);

      setSent(true);
    } catch (err) {
      // Check if it's an Error instance
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while sending the email');
      }
      console.error('Error sending sign in link:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md py-12 min-h-screen flex items-center">
      <Card className="w-full">
        <div className="text-center mb-6">
          {/* Re-use logo and title style from App.tsx header if possible */}
          <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-300">Animals On Things</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in with your email</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Check your email</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We've sent a sign-in link to <strong>{email}</strong>.
              Click the link in the email to sign in.
            </p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                variant="secondary"
              >
                Use a different email
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendLink}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <Input
                id="email"
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
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Sign-in Link'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
