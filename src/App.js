// skunal148/portfoliobuilder/PortfolioBuilder-ad74f8854a7d0e220f440f62c535b153baf3850c/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './components/firebase'; // db not directly used here
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
import LiveBlankPortfolioEditor from './templates/LiveBlankPortfolioEditor';
import LiveMinimalistCoderEditor from './templates/LiveMinimalistCoderEditor';
import LiveVisualStorytellerEditor from './templates/LiveVisualStorytellerEditor'; // NEW EDITOR
import LiveModernProfessionalEditor from './templates/LiveModernProfessionalEditor';

import PortfolioPreview from './components/PortfolioPreview';

import './index.css';
import './App.css';

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0, x: -50 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 50 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
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
    });
    return unsubscribe;
  }, []);

  if (loadingAuth) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-900 text-white text-xl">Loading Application...</div>;
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
            path="create-blank-portfolio"
            element={<AnimatedPage><LiveBlankPortfolioEditor /></AnimatedPage>}
          />
          <Route
            path="create-coder-portfolio/:templateIdFromUrl"
            element={<AnimatedPage><LiveMinimalistCoderEditor /></AnimatedPage>}
          />
          <Route
            path="create-visual-portfolio/:templateIdFromUrl" 
            element={<AnimatedPage><LiveVisualStorytellerEditor /></AnimatedPage>}
          />
          <Route // New Route for Modern Professional - Create
            path="create-corp-portfolio/:templateIdFromUrl"
            element={<AnimatedPage><LiveModernProfessionalEditor /></AnimatedPage>}
          />
          {/* Editing Routes for different templates */}
          <Route
            path="edit-blank/:portfolioId"
            element={<AnimatedPage><LiveBlankPortfolioEditor /></AnimatedPage>}
          />
          <Route
            path="edit-coder-portfolio/:portfolioId" 
            element={<AnimatedPage><LiveMinimalistCoderEditor /></AnimatedPage>}
          />
          <Route
            path="edit-visual-portfolio/:portfolioId" 
            element={<AnimatedPage><LiveVisualStorytellerEditor /></AnimatedPage>}
          />
          <Route // New Route for Modern Professional - Edit
            path="edit-corp-portfolio/:portfolioId"
            element={<AnimatedPage><LiveModernProfessionalEditor /></AnimatedPage>}
          />
          
          {/* Fallback for older/generic styled portfolios if any, pointing to a relevant editor.
              If 'style-1' and 'style-2' were significant, they might need their own routes
              or a more generic 'edit-styled/:portfolioId' that can handle them.
              For now, let's assume any other ID will also use the LiveMinimalistCoderEditor or you create a generic one.
          */}
          <Route 
            path="edit-styled/:portfolioId" 
            element={<AnimatedPage><LiveMinimalistCoderEditor /></AnimatedPage>} // Or a more generic styled editor
          />
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