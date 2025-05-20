import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase'; 
import PortfolioDisplay from './PortfolioDisplay'; 

function ViewPortfolioPage() {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // console.log("[ViewPortfolioPage] useEffect triggered. Portfolio ID from URL:", portfolioId);
    const fetchPortfolio = async () => {
      setLoading(true);
      setError('');
      setPortfolioData(null); 
      if (!portfolioId) { 
        setError("No portfolio ID provided.");
        setLoading(false);
        return;
      }
      if (!auth.currentUser) { 
        setError("You must be logged in.");
        setLoading(false);
        return;
      }
      try {
        const portfolioDocRef = doc(db, 'portfolios', portfolioId);
        const docSnap = await getDoc(portfolioDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userId === auth.currentUser.uid) {
            setPortfolioData({ id: docSnap.id, ...data });
          } else {
            setError("Access Denied: You do not own this portfolio.");
          }
        } else {
          setError("Portfolio not found.");
        }
      } catch (err) {
        setError("Failed to load portfolio: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (portfolioId) fetchPortfolio();
    else { setLoading(false); setError("No Portfolio ID specified.");}
  }, [portfolioId]); 

  const handleBackToEdit = () => {
    if (portfolioData && portfolioData.id) {
        if (portfolioData.templateId === 'blank') {
            navigate(`/edit-blank/${portfolioData.id}`);
        } else {
            navigate(`/edit-styled/${portfolioData.id}`); 
        }
    } else if (portfolioId) { 
        console.warn("[ViewPortfolioPage] Attempting 'Back to Edit' without full portfolio data. Navigating to dashboard.");
        navigate('/dashboard'); 
    } else {
        navigate('/dashboard'); 
    }
  };

  // console.log("[ViewPortfolioPage] Rendering. Loading:", loading, "Error:", error, "PortfolioData (state):", portfolioData);

  // This page is rendered within MainLayout, which provides the overall page gradient.
  // The root div here is for content within MainLayout.
  return (
    <div className="relative p-4 md:p-6 text-slate-100 min-h-[calc(100vh-theme.headerHeight)]"> {/* Added relative for potential absolute positioning of button */}
      
      {/* "Back to Edit" button - Placed at the top, made prominent */}
      {/* This button will be rendered if not loading and no error, REGARDLESS of portfolioData for now for testing */}
      {!loading && !error && (
          <div className="mb-6 text-right sticky top-20 z-10 pr-4"> {/* Sticky positioning below navbar */}
              <button 
                  onClick={handleBackToEdit}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition duration-150 ease-in-out text-sm transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                  Back to Edit Mode
              </button>
          </div>
      )}


      {loading && (
        <div className="flex justify-center items-center py-20">
            <p className="text-xl text-slate-300">Loading Portfolio...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-auto mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-red-400">Unable to Display Portfolio</h2>
          <p className="mb-6 text-slate-300">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* The Back to Edit button is already above, but we can keep one here too for error state */}
            <button 
              onClick={handleBackToEdit}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
            >
              Back to Edit
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out w-full sm:w-auto"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {!loading && !error && portfolioData && (
        // The PortfolioDisplay component will take the available space.
        // The button is now outside and above this conditional block for testing.
        <div className="w-full max-w-5xl mx-auto"> 
          <PortfolioDisplay portfolioData={portfolioData} />
        </div>
      )}
      
      {!loading && !error && !portfolioData && (
         <div className="text-center bg-slate-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-auto mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-slate-300">Portfolio Not Available</h2>
            <p className="mb-6 text-slate-400">The requested portfolio could not be displayed. It might have been deleted or you may not have access.</p>
            <button 
                onClick={() => navigate('/dashboard')} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
                Go to Dashboard
            </button>
        </div>
      )}
    </div>
  );
}

export default ViewPortfolioPage;
