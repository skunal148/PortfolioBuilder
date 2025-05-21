import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, db } from './components/firebase'; // Ensure this path is correct
// import { doc, getDoc } from 'firebase/firestore'; // Not used in this App.js version directly for profile check
import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence and motion

// Layouts
import MainLayout from './components/layout/MainLayout';
import LandingPage from './components/layout/LandingPage';
import Dashboard from './components/layout/Dashboard';

// Auth
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';

// Forms & Editors
import ProfileForm from './components/forms/ProfileForm';
import TemplateSelection from './components/TemplateSelection';
import LiveBlankPortfolioEditor from './components/LiveBlankPortfolioEditor';
import LivePortfolioEditor from './components/LivePortfolioEditor';
import PortfolioPreview from './components/PortfolioPreview'; // For VIEWING portfolios

import './index.css';
import './App.css';

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate", // Or "easeInOut", "linear"
  duration: 0.5 // Adjust duration (in seconds)
};

// Wrapper for individual route elements to apply motion
const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    // style={{ position: 'absolute', width: '100%' }} // This can help with layout shifts during transitions with mode="wait"
                                                    // However, it can also cause issues if pages have different heights or scroll positions.
                                                    // Test with and without this style based on your layout.
                                                    // For simple fades, it might not be strictly necessary if content reflow isn't an issue.
  >
    {children}
  </motion.div>
);

function AppContent() { // Renamed App to AppContent to use useLocation
  const location = useLocation(); // React Router's useLocation hook
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
      if (user) {
        console.log("[App.js] User is logged in:", user.uid);
      } else {
        console.log("[App.js] User is logged out.");
      }
    });
    return unsubscribe; 
  }, []);

  if (loadingAuth) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-800 text-white text-xl">Loading Application...</div>;
  }

  return (
    <AnimatePresence mode="wait"> {/* mode="wait" ensures one page animates out before the next animates in */}
      <Routes location={location} key={location.pathname}> {/* Pass location and a unique key */}
        {/* Public Routes */}
        <Route 
          path="/" 
          // LandingPage is not wrapped with AnimatedPage for instant load, or you can wrap it too
          element={currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route path="/signup" element={!currentUser ? <AnimatedPage><SignUp /></AnimatedPage> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!currentUser ? <AnimatedPage><Login /></AnimatedPage> : <Navigate to="/dashboard" replace />} />
        
        {/* This is a public route for viewing portfolios by ID */}
        <Route
          path="/portfolio/:portfolioId"
          element={<AnimatedPage><PortfolioPreview /></AnimatedPage>} // PortfolioPreview is now animated
        />
        
        {/* Protected Routes - Wrapped with MainLayout */}
        <Route 
          element={currentUser ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><ProfileForm /></AnimatedPage>} />
          <Route path="choose-template" element={<AnimatedPage><TemplateSelection /></AnimatedPage>} />
          
          <Route 
            path="create-styled-portfolio/:templateIdFromUrl" 
            element={<AnimatedPage><LivePortfolioEditor /></AnimatedPage>} 
          />
          <Route 
            path="create-blank-portfolio" 
            element={<AnimatedPage><LiveBlankPortfolioEditor /></AnimatedPage>} 
          />
          <Route 
            path="edit-styled/:portfolioId" 
            element={<AnimatedPage><LivePortfolioEditor /></AnimatedPage>} 
          />
          <Route 
            path="edit-blank/:portfolioId" 
            element={<AnimatedPage><LiveBlankPortfolioEditor /></AnimatedPage>} 
          />
          
          {/* The PortfolioPreview under /portfolio/:portfolioId is public.
              If you need an *authenticated* preview, you might have a different route here.
              For now, assuming the existing PortfolioPreview is sufficient.
          */}
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </AnimatePresence>
  );
}

// Main App component that includes the Router
function App() {
  return (
    <Router>
      {/* If you have ThemeProvider, it should wrap AppContent */}
      {/* <ThemeProvider> */}
        <AppContent />
      {/* </ThemeProvider> */}
    </Router>
  );
}

export default App;
