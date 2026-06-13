import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileSidebar from '@/components/ProfileSidebar';
import { useAuth } from '@/context/AuthContext';
import logo from '../components/ui/logo.png'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, profile, isAdmin } = useAuth();

  const handleSearchClick = () => {
    navigate('/', { state: { scrollToSearch: true } });
  };

  // Get user initial for avatar
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() || (isAuthenticated ? 'U' : 'G');

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <img src={logo}
                  style={{ width: "10rem" }} alt='logo' />
              </motion.div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) => {
                  let baseClass = "nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  if (isActive) return `${baseClass} active`;
                  return baseClass;
                }}
              >
                Home
              </NavLink>
              <NavLink
                to="/services"
                className={({ isActive }) => {
                  let baseClass = "nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  if (isActive) return `${baseClass} active`;
                  return baseClass;
                }}
              >
                Services
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => {
                  let baseClass = "nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  if (isActive) return `${baseClass} active`;
                  return baseClass;
                }}
              >
                About
              </NavLink>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <NavLink
                to="/join-provider"
                className={({ isActive }) => {
                  let baseClass = "hidden sm:block nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  if (isActive) return `${baseClass} active`;
                  return baseClass;
                }}
              >
                Join as a Provider
              </NavLink>
              <Button
                size="sm"
                onClick={handleSearchClick}
                className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-xs sm:text-sm px-2 sm:px-4"
              >
                Find a Provider
              </Button>

              {/* Admin Panel Link — visible only to admins */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                  title="Admin Panel"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              {/* Auth buttons or User Avatar */}
              {isAuthenticated ? (
                <button
                  id="user-avatar-button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex-shrink-0"
                  title="Open profile menu"
                >
                  {userInitial}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition hidden sm:block"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-green-700 shadow-sm transition"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}  
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 py-4 border-t border-gray-100 flex flex-col space-y-4"
            >
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `text-gray-700 hover:text-blue-600 font-medium ${isActive ? 'text-blue-600' : ''}`}
              >
                Home
              </NavLink>
              <NavLink
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `text-gray-700 hover:text-blue-600 font-medium ${isActive ? 'text-blue-600' : ''}`}
              >
                Services
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `text-gray-700 hover:text-blue-600 font-medium ${isActive ? 'text-blue-600' : ''}`}
              >
                About
              </NavLink>
              <NavLink
                to="/join-provider"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `sm:hidden text-gray-700 hover:text-blue-600 font-medium ${isActive ? 'text-blue-600' : ''}`}
              >
                Join as a Provider
              </NavLink>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              {!isAuthenticated && (
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

export default Header;