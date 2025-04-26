// import { useState, useEffect } from 'react'
// import { auth } from './firebase' // Import the configured auth instance
// import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
// Removed default vite logos/css imports for clarity
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css' // Keep if needed for base styles alongside Tailwind
import { useAuth } from './context/AuthContext'; // Import the custom hook

function App() {
  // Get auth state from context
  const { user, loading, error } = useAuth();

  // Removed the useEffect hook that handled auth state changes
  // as this logic is now encapsulated in AuthProvider

  return (
    // Using Tailwind classes for basic layout/styling
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Animals On Things</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Auth Status (via Context)</h2>
        {loading && <p>Authenticating...</p>} {/* Updated loading text */}
        {error && <p className="text-red-500">Auth Error: {error}</p>}
        {user && (
          <div>
            <p>Signed in via Context!</p>
            <p className="text-sm break-all">User ID: {user.uid}</p>
            <p className="text-xs">(This is an anonymous user)</p>
          </div>
        )}
        {!loading && !user && !error && <p>Not signed in.</p>}
      </div>

      {/* Components that need auth state can now use useAuth() */}
    </div>
  )
}

export default App
