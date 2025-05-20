import React from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom'; // Outlet is imported here
import { auth } from '../firebase'; // Ensure this path is correct

function MainLayout() { // {children} prop is removed
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <nav className="bg-slate-800 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0">
                <span className="font-bold text-2xl text-emerald-400 hover:text-emerald-300 transition-colors">
                  PortfolioBuilder
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/dashboard') 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/profile') 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-md text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-75"
              >
                Logout
              </button>
            </div>
            {/* Mobile menu button can be added here later if needed */}
          </div>
        </div>
      </nav>

      <main>
        {/* THIS IS THE CRITICAL PART: <Outlet /> renders the matched child route's component */}
        <Outlet /> 
      </main>
    </div>
  );
}

export default MainLayout;
