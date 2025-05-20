import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Ensure this path is correct
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Navigate to dashboard on successful login
    } catch (error) {
      console.error("Firebase login error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Failed to log in. Please try again later.');
      }
    }
  };

  return (
    // Applied gradient background and flex properties from LandingPage
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
      {/* Login form container */}
      <div className="bg-slate-800 shadow-2xl rounded-xl px-8 sm:px-10 pt-8 pb-10 mb-4 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-emerald-400 mb-8">
          Welcome Back!
        </h2>
        
        {error && (
          <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-6 text-center">
            {error}
          </p>
        )}

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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
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
            {/* Optional: Add a "Forgot Password" link here if needed */}
            {/* <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-emerald-400 hover:underline">
                Forgot Password?
              </Link>
            </div> */}
          </div>

          <div className="flex flex-col items-center justify-between space-y-5">
            <button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg text-lg shadow-md transform transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
              type="submit"
            >
              Log In
            </button>
            <Link 
              to="/signup" 
              className="inline-block align-baseline font-medium text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
      <footer className="text-center text-xs text-slate-500 mt-8">
        © {new Date().getFullYear()} Portfolio Builder. All rights reserved.
      </footer>
    </div>
  );
}

export default Login;
