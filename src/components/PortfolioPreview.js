import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from './firebase'; // Assuming auth is used to check if current viewer is owner
import { doc, getDoc } from 'firebase/firestore';
import PortfolioDisplay from './PortfolioDisplay'; // Your existing component for rendering the portfolio content

// Simple Edit Icon
const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);


function PortfolioPreview() {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError('');
      try {
        const portfolioRef = doc(db, 'portfolios', portfolioId);
        const docSnap = await getDoc(portfolioRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPortfolioData(data);
          // Check if the current logged-in user is the owner
          if (auth.currentUser && auth.currentUser.uid === data.userId) {
            setIsOwner(true);
          }
        } else {
          setError('Portfolio not found.');
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        setError('Failed to load portfolio data.');
      } finally {
        setLoading(false);
      }
    };

    if (portfolioId) {
      fetchPortfolio();
    } else {
      setError("No portfolio ID provided.");
      setLoading(false);
    }
  }, [portfolioId]);

  const handleBackToEdit = () => {
    if (!portfolioData) return;
    // Determine which editor to go back to based on templateId
    if (portfolioData.templateId === 'blank') {
      navigate(`/edit-blank/${portfolioId}`);
    } else {
      // Assuming other templateIds mean it's a styled template
      // The editor route for styled templates might be different, e.g., /edit-styled/:portfolioId
      // Or it might use the templateId in the route: /editor/:templateId/:portfolioId
      // For this example, I'll assume a generic edit route or direct to styled editor:
      navigate(`/edit-styled/${portfolioId}`); // Adjust if your route is different
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-900 text-slate-100 text-xl">Loading Portfolio...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-900 text-red-400 p-4">
        <h2 className="text-2xl mb-4">Error</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!portfolioData) {
    // This case should ideally be covered by error state, but as a fallback:
    return <div className="flex justify-center items-center min-h-screen bg-slate-900 text-slate-100">Portfolio data could not be loaded.</div>;
  }

  // Determine background for the PortfolioDisplay based on its own data
  // This logic is simplified here; PortfolioDisplay itself should handle its complex background logic
  let displayBackgroundClass = 'bg-white dark:bg-slate-800'; // Default if no specific template background
  if (portfolioData.templateId && portfolioData.templateId !== 'blank' && portfolioData.templateId !== 'style-coder-min') {
      // For specific styled templates like style-1, style-2, they might have their own distinct backgrounds
      // or PortfolioDisplay handles this internally.
      // For now, we'll assume PortfolioDisplay uses its passed data.
  } else if (portfolioData.templateId === 'style-coder-min') {
      displayBackgroundClass = 'bg-[#1f2937]'; // slate-800 for coder template
  } else if (portfolioData.backgroundType === 'theme' && portfolioData.selectedBackgroundTheme) {
      const theme = predefinedBackgroundThemes.find(t => t.id === portfolioData.selectedBackgroundTheme);
      // If theme has a solid color, we might not need to set it here if PortfolioDisplay handles it.
      // If it's a gradient, PortfolioDisplay must handle it.
      // For simplicity, we'll let PortfolioDisplay handle its own background based on its props.
  } else if (portfolioData.backgroundType === 'customImage' && portfolioData.customBackgroundImageUrl) {
      // PortfolioDisplay will use this URL for its background.
  }


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Simplified Navbar for Preview Page */}
      <nav className="bg-slate-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-emerald-400">
                {portfolioData.name || 'Portfolio Preview'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {isOwner && (
                <button
                  onClick={handleBackToEdit}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-150 flex items-center space-x-2"
                >
                  <EditIcon />
                  <span>Back to Edit Mode</span>
                </button>
              )}
               {/* Link to the main app for non-owners or as a general branding */}
              {!isOwner && (
                 <Link to="/" className="text-sm text-slate-300 hover:text-emerald-400">
                    Created with PortfolioBuilder
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area for the portfolio display */}
      {/* The PortfolioDisplay component will handle its own background based on its templateId or settings */}
      <div className="pt-4 pb-12"> 
        <PortfolioDisplay portfolioData={portfolioData} />
      </div>
    </div>
  );
}

// Dummy predefinedBackgroundThemes for context if PortfolioDisplay relies on it for blank templates
// This should ideally be shared or passed if PortfolioDisplay needs it.
const predefinedBackgroundThemes = [
  { id: 'blank-default', name: 'Default (Dark)', style: { backgroundColor: '#374151' } },
  { id: 'light-gentle', name: 'Light Gentle', style: { backgroundColor: '#F3F4F6' } },
];


export default PortfolioPreview;
