import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, HelpCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileSidebar from '@/components/ProfileSidebar';
import { useAuth } from '@/context/AuthContext';
import logo from '../components/ui/logo.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, profile, isAdmin } = useAuth();
  const menuRef = useRef(null);

  const handleSearchClick = () => {
    navigate('/', { state: { scrollToSearch: true } });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

              {/* User Avatar (when authenticated) */}
              {isAuthenticated && (
                <button
                  id="user-avatar-button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex-shrink-0"
                  title="Open profile menu"
                >
                  {userInitial}
                </button>
              )}

              {/* Hamburger menu — replaces Log in / Sign up buttons */}
              <div className="relative" ref={menuRef}>
                <button
                  id="hamburger-menu-button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isMenuOpen ? (
                      <motion.span
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <X className="w-4 h-4 text-gray-700" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Menu className="w-4 h-4 text-gray-700" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {/* Mobile nav links (hidden on md+) */}
                      <div className="md:hidden px-4 pt-4 pb-2 flex flex-col gap-1">
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) => `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          Home
                        </NavLink>
                        <NavLink to="/services" onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) => `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          Services
                        </NavLink>
                        <NavLink to="/about" onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) => `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          About
                        </NavLink>
                        {/* <NavLink to="/join-provider" onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) => `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          Join as a Provider
                        </NavLink> */}
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Shield className="w-3.5 h-3.5" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Quick links — always visible */}
                      <div className="px-4 pt-3 pb-2 flex flex-col gap-1 border-t border-gray-100">
                        <NavLink to="/join-provider" onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) => `flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                          Join as a Provider
                        </NavLink>
                        <NavLink to="/help" onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) => `flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          Help Center
                        </NavLink>
                      </div>

                      {/* Auth links */}
                      {!isAuthenticated && (
                        <div className="px-4 pt-2 pb-4 flex flex-col gap-2 border-t border-gray-100">
                          <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Log in
                          </Link>
                          <Link
                            to="/signup"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition-all shadow-sm"
                          >
                            Sign up
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>


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