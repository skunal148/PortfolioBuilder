import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import Dashboard from './components/layout/Dashboard';
import ProfileForm from './components/forms/ProfileForm';
// ProjectForm is not used by the main portfolio creation/editing flow, assuming it's for another feature or legacy
// import ProjectForm from './components/forms/ProjectForm'; 
// PortfolioTemplate seems to be replaced by PortfolioPreview for viewing
// import PortfolioTemplate from './templates/PortfolioTemplate'; 
import MainLayout from './components/layout/MainLayout'; // Ensure this uses <Outlet />
import { auth } from './components/firebase';
import TemplateSelection from './components/TemplateSelection';
import LivePortfolioEditor from './components/LivePortfolioEditor'; // For STYLED templates
import LandingPage from './components/layout/LandingPage';
import LiveBlankPortfolioEditor from './components/LiveBlankPortfolioEditor'; // For BLANK templates
import PortfolioPreview from './components/PortfolioPreview'; // For VIEWING portfolios

import './index.css';
import './App.css';

function App() {
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
    return <div className="flex justify-center items-center min-h-screen bg-slate-800 text-white">Loading Application...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected Routes - Wrapped with MainLayout */}
        {/* MainLayout should contain an <Outlet /> for these nested routes to render */}
        <Route 
          element={currentUser ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<ProfileForm />} />
          <Route path="choose-template" element={<TemplateSelection />} />
          
          {/* Creation Routes */}
          <Route 
            path="create-styled-portfolio/:templateIdFromUrl" 
            element={<LivePortfolioEditor />} 
          />
          <Route 
            path="create-blank-portfolio" 
            element={<LiveBlankPortfolioEditor />} 
          />

          {/* Editing Routes - Distinct paths for different editors */}
          <Route 
            path="edit-styled/:portfolioId" 
            element={<LivePortfolioEditor />} 
          />
          <Route 
            path="edit-blank/:portfolioId" 
            element={<LiveBlankPortfolioEditor />} 
          />

          {/* Viewing Route (Private to owner) */}
          <Route
            path="portfolio/:portfolioId"
            element={<PortfolioPreview />}
          />
          
          {/* Legacy/Other ProjectForm routes - Keep if needed, ensure paths don't conflict */}
          {/* Example: <Route path="some-other-project-feature" element={<ProjectForm />} /> */}
        </Route>
        
        {/* Fallback for any other unmatched route */}
        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </Router>
  );
}

export default App;
