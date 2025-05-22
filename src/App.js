import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, db } from './components/firebase';
// import { doc, getDoc } from 'firebase/firestore'; // Not directly used here for profile check
import { AnimatePresence, motion } from 'framer-motion';

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

// Specific Template Editors
import LiveBlankPortfolioEditor from './templates/LiveBlankPortfolioEditor'
// Assuming you have renamed LivePortfolioEditor.js to LiveMinimalistCoderEditor.js
// and placed it in src/components/ or src/templates/
// For this example, I'll assume it's in src/templates/
import LiveMinimalistCoderEditor from './templates/LiveMinimalistCoderEditor'; // ADJUST PATH IF NEEDED
import LiveVisualStorytellerEditor from './templates/LiveVisualStorytellerEditor'; // NEW EDITOR

import PortfolioPreview from './components/PortfolioPreview';

import './index.css';
import './App.css';

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function AppContent() {
  const location = useLocation();
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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route path="/signup" element={!currentUser ? <AnimatedPage><SignUp /></AnimatedPage> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!currentUser ? <AnimatedPage><Login /></AnimatedPage> : <Navigate to="/dashboard" replace />} />
        
        <Route
          path="/portfolio/:portfolioId"
          element={<AnimatedPage><PortfolioPreview /></AnimatedPage>}
        />
        
        {/* Protected Routes - Wrapped with MainLayout */}
        <Route
          element={currentUser ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><ProfileForm /></AnimatedPage>} />
          <Route path="choose-template" element={<AnimatedPage><TemplateSelection /></AnimatedPage>} />
          
          {/* Creation Routes for different templates */}
          <Route
            path="create-blank-portfolio" // No :templateIdFromUrl needed for blank
            element={<AnimatedPage><LiveBlankPortfolioEditor /></AnimatedPage>}
          />
          <Route
            path="create-coder-portfolio/:templateIdFromUrl" // For Minimalist Coder
            element={<AnimatedPage><LiveMinimalistCoderEditor /></AnimatedPage>}
          />
          <Route
            path="create-visual-portfolio/:templateIdFromUrl" // NEW: For Visual Storyteller
            element={<AnimatedPage><LiveVisualStorytellerEditor /></AnimatedPage>}
          />

          {/* Editing Routes for different templates */}
          <Route
            path="edit-blank/:portfolioId"
            element={<AnimatedPage><LiveBlankPortfolioEditor /></AnimatedPage>}
          />
          <Route
            path="edit-coder-portfolio/:portfolioId" // For Minimalist Coder
            element={<AnimatedPage><LiveMinimalistCoderEditor /></AnimatedPage>}
          />
          <Route
            path="edit-visual-portfolio/:portfolioId" // NEW: For Visual Storyteller
            element={<AnimatedPage><LiveVisualStorytellerEditor /></AnimatedPage>}
          />
          
          {/* Fallback/Generic styled editor route (if you still need one, otherwise remove) */}
          {/* <Route 
            path="edit-styled/:portfolioId" 
            element={<AnimatedPage><LiveMinimalistCoderEditor /></AnimatedPage>} // Or a generic styled editor
          /> */}
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
