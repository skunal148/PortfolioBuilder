// src/components/auth/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Import sendPasswordResetEmail
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // For login button
  const [resetLoading, setResetLoading] = useState(false); // For reset button
  const [resetMessage, setResetMessage] = useState('');
  const [showResetForm, setShowResetForm] = useState(false); // To toggle a simple reset form/input
  const [resetEmail, setResetEmail] = useState(''); // Separate email for password reset if needed

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); 
    } catch (error) {
      console.error("Firebase login error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Failed to log in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault(); // Prevent default if it's from a form submission
    setError('');
    setResetMessage('');
    
    const emailToReset = showResetForm ? resetEmail : email; // Use dedicated resetEmail if form is shown, else login email

    if (!emailToReset) {
      setError('Please enter your email address to reset your password.');
      setShowResetForm(true); // Make sure the input is visible if empty
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      setResetMessage('Password reset email sent! Please check your inbox (and spam folder).');
      setShowResetForm(false); // Hide reset form after sending
      setResetEmail(''); // Clear the reset email field
    } catch (error) {
      console.error("Firebase password reset error:", error);
      if (error.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else if (error.code === 'auth/invalid-email'){
        setError('Please enter a valid email address.');
      }else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
      <div className="bg-slate-800 shadow-2xl rounded-xl px-8 sm:px-10 pt-8 pb-10 mb-4 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-emerald-400 mb-8">
          Welcome Back!
        </h2>
        
        {error && (
          <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-6 text-center">
            {error}
          </p>
        )}
        {resetMessage && (
          <p className="bg-emerald-500/20 text-emerald-300 text-sm p-3 rounded-md mb-6 text-center">
            {resetMessage}
          </p>
        )}

        {!showResetForm ? (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setResetEmail(e.target.value); }} // Also update resetEmail for convenience
                required
              />
            </div>

            <div className="mb-4"> {/* Reduced mb from mb-8 to mb-4 */}
              <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-right mb-6"> {/* Added container for forgot password link */}
              <button 
                type="button" // Important: type="button" to not submit the login form
                onClick={() => {
                  setShowResetForm(true); 
                  setError(''); 
                  setResetMessage('');
                  // Optionally pre-fill resetEmail if email field has a value
                  if (email) setResetEmail(email); 
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex flex-col items-center justify-between space-y-5">
              <button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg text-lg shadow-md transform transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
              <Link 
                to="/signup" 
                className="inline-block align-baseline font-medium text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Don't have an account? Sign Up
              </Link>
            </div>
          </form>
        ) : (
          // Simple Password Reset Form
          <form onSubmit={handlePasswordReset} noValidate>
            <p className="text-slate-300 text-sm mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="reset-email">
                Email Address
              </label>
              <input
                className="shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail} // Use separate state for reset email
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col items-center space-y-4">
              <button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg text-lg shadow-md transform transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 disabled:opacity-50"
                type="submit"
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Send Password Reset Email'}
              </button>
              <button 
                type="button"
                onClick={() => {setShowResetForm(false); setError(''); setResetMessage('');}}
                className="text-sm text-slate-400 hover:text-emerald-400 hover:underline focus:outline-none"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
      <footer className="text-center text-xs text-slate-500 mt-8">
        © {new Date().getFullYear()} Portfolio Builder. All rights reserved.
      </footer>
    </div>
  );
}

export default Login;
