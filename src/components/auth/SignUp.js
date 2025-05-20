import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'; // Ensure this path is correct
import { doc, setDoc } from 'firebase/firestore'; 
import { useNavigate, Link } from 'react-router-dom'; // Import Link

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added for password confirmation
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state for button
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    // Basic password strength check (optional, but good practice)
    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        // Create a new document in the 'users' collection with the user's UID
        // This is good for storing user-specific profile data later
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email, // Store email by default
          displayName: '', // Or try to get from profile, or ask later
          photoURL: '',
          createdAt: new Date().toISOString(), // Good to have a creation timestamp
          // Initialize other fields as needed
          name: '', 
          githubUrl: '',
          linkedinUrl: '',
          aboutMe: '',
        });
        console.log("User document created in Firestore for UID:", user.uid);
        navigate('/dashboard'); // Navigate to dashboard on successful sign-up
      }
    } catch (error) {
      console.error("Firebase signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (error.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger password.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Applied gradient background and flex properties from LandingPage/Login page
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
      {/* SignUp form container */}
      <div className="bg-slate-800 shadow-2xl rounded-xl px-8 sm:px-10 pt-8 pb-10 mb-4 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-emerald-400 mb-8">
          Create Your Account
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

          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
              id="password"
              type="password"
              placeholder="•••••••• (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col items-center justify-between space-y-5">
            <button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg text-lg shadow-md transform transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <Link 
              to="/login" 
              className="inline-block align-baseline font-medium text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Already have an account? Log In
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

export default SignUp;
