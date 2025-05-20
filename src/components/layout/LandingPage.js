import React from 'react';
import { useNavigate } from 'react-router-dom';
// You can add an illustrative image or SVG to your public/images folder
// import landingImage from '/images/portfolio-builder-landing.svg'; // Example image

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
      <div className="text-center max-w-3xl">
        {/* Optional: Logo or Icon */}
        {/* <img src="/logo.svg" alt="Portfolio Builder Logo" className="w-24 h-24 mx-auto mb-6" /> */}
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Craft Your <span className="text-emerald-400">Stunning</span> Online Portfolio
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl mx-auto">
          Showcase your projects, skills, and experience with beautifully designed templates.
          Easy to build, effortless to impress.
        </p>

        {/* Optional: Illustrative image */}
        {/* <div className="my-10">
          <img 
            src={landingImage || 'https://placehold.co/800x450/1e293b/94a3b8?text=Portfolio+Showcase'} 
            alt="Portfolio Builder Illustration" 
            className="rounded-xl shadow-2xl mx-auto"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x450/1e293b/94a3b8?text=Portfolio+Showcase'; }}
          />
        </div>
        */}

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={() => navigate('/signup')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-10 rounded-lg text-lg shadow-lg transform transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 w-full sm:w-auto"
          >
            Get Started (Sign Up)
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-10 rounded-lg text-lg shadow-lg transform transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 w-full sm:w-auto"
          >
            Login
          </button>
        </div>

        <p className="mt-12 text-sm text-slate-400">
          Already have an account? <a href="/login" className="text-emerald-400 hover:underline">Log in here</a>.
        </p>
      </div>
      
      {/* Optional: Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Portfolio Builder. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
