// skunal148/portfoliobuilder/PortfolioBuilder-ad74f8854a7d0e220f440f62c535b153baf3850c/src/components/layout/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { collection, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

// Define placeholder images for dashboard cards
const templateBackgroundImages = {
    'blank': '/images/template-blank-preview.png', // Replace with your actual preview
    'style-coder-min': '/images/template-coder-preview.png', // Replace with your actual preview
    'style-visual-heavy': '/images/template-visual-preview.png', // Replace with your actual preview
    'style-corp-sleek': '/images/template-corp-preview.png', // Added new template
    'style-bold-asymm': '/images/template-bold-asymm-preview.png', // Added new template
    'default': 'https://placehold.co/600x400/334155/94a3b8?text=Portfolio' // Fallback
};


function Dashboard() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        setError("User not authenticated. Please log in to view your dashboard.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'portfolios'),
          where('userId', '==', auth.currentUser.uid), 
          orderBy('lastUpdated', 'desc') 
        );

        const querySnapshot = await getDocs(q);
        const userPortfolios = [];
        querySnapshot.forEach((doc) => {
          userPortfolios.push({ id: doc.id, ...doc.data() });
        });
        setPortfolios(userPortfolios);
      } catch (err) {
        setError(err.message || "Failed to load portfolios.");
        console.error("Error fetching portfolios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []); 

  const handleAddProjectClick = () => {
    navigate('/choose-template');
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm("Are you sure you want to delete this portfolio? This action cannot be undone.")) {
      return;
    }
    try {
      const portfolioDoc = doc(db, 'portfolios', id);
      await deleteDoc(portfolioDoc);
      setPortfolios(portfolios.filter(portfolio => portfolio.id !== id));
    } catch (err) {
      setError("Could not delete portfolio. " + err.message);
    }
  };

  const handleEditPortfolio = (portfolio) => {
    if (!portfolio || !portfolio.id) {
      console.error("Invalid portfolio data for editing", portfolio);
      setError("Cannot edit portfolio: Missing portfolio ID.");
      return;
    }
    
    if (portfolio.templateId === 'blank') {
      navigate(`/edit-blank/${portfolio.id}`);
    } else if (portfolio.templateId === 'style-coder-min') {
      navigate(`/edit-coder-portfolio/${portfolio.id}`);
    } else if (portfolio.templateId === 'style-visual-heavy') {
      navigate(`/edit-visual-portfolio/${portfolio.id}`);
    } else if (portfolio.templateId === 'style-corp-sleek') { // New Case for Modern Professional
      navigate(`/edit-corp-portfolio/${portfolio.id}`);
    } else if (portfolio.templateId === 'style-bold-asymm') { // New Case
      navigate(`/edit-bold-asymm-portfolio/${portfolio.id}`);
    } else {
      // Fallback for older styled portfolios or a generic editor if they don't have specific routes
      console.warn(`Editing portfolio with unknown or older templateId: ${portfolio.templateId}. Routing to generic editor.`);
      navigate(`/edit-styled/${portfolio.id}`); 
    }
  };
  
  const handleViewPortfolio = (portfolioId) => {
    navigate(`/portfolio/${portfolioId}`);
  };


  if (loading) {
    return <div className="p-6 text-center text-slate-300 text-xl">Loading your portfolios...</div>;
  }

  if (error && error === "User not authenticated. Please log in to view your dashboard.") {
     return (
      <div className="p-4 md:p-6 container mx-auto">
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative text-center" role="alert">
          <strong className="font-bold block text-lg mb-2">Authentication Required</strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6"> 
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10"> 
          <h1 className="text-4xl font-bold text-slate-100 mb-6 sm:mb-0">Your Dashboard</h1>
          <button
            onClick={handleAddProjectClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 text-lg transform hover:scale-105"
          >
            + Add New Project
          </button>
        </div>

        {error && !error.includes("User not authenticated") && ( 
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && portfolios.length === 0 && !error && (
          <div className="text-center text-slate-400 py-20 mt-8 bg-slate-800 rounded-xl shadow-xl p-8">
            <svg className="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-2xl font-semibold text-slate-200">No portfolios yet</h3>
            <p className="mt-2 text-md text-slate-400">It looks a bit empty here. Why not create your first masterpiece?</p>
            <p className="mt-1 text-sm text-slate-500">Click "Add New Project" to get started!</p>
          </div>
        )}

        {!loading && portfolios.length > 0 && !error && (
          <div className="mt-2"> 
            <h2 className="text-3xl font-semibold text-slate-200 mb-8">Your Portfolios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-slate-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-emerald-500/30 hover:scale-[1.02] flex flex-col group"
                >
                  <div
                    className="h-52 bg-slate-700 bg-cover bg-center relative group-hover:opacity-90 transition-opacity"
                    style={{ backgroundImage: `url(${templateBackgroundImages[portfolio.templateId] || templateBackgroundImages['default']})` }}
                  >
                     <div className="absolute top-3 right-3 bg-slate-900 bg-opacity-70 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-medium">
                      Template: {portfolio.templateId || 'N/A'}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-semibold text-slate-100 mb-2 truncate group-hover:text-emerald-400 transition-colors">
                      {portfolio.name || 'Untitled Portfolio'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-1">
                      ID: <span className="font-mono text-xs">{portfolio.id}</span>
                    </p>
                    <p className="text-slate-400 text-sm mb-5 flex-grow">
                      Last updated: {portfolio.lastUpdated ? new Date(portfolio.lastUpdated.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto pt-4 border-t border-slate-700">
                      <button
                        onClick={() => handleEditPortfolio(portfolio)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;