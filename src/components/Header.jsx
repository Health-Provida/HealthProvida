import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Shield, HelpCircle, UserPlus, Stethoscope, Heart,
  User, Settings, Globe, LogOut, MessageSquare, CalendarCheck,
  ChevronRight, LogIn, Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import logo from '../components/ui/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const { isAuthenticated, profile, isAdmin, isProvider, adminRole, signOut } = useAuth();
  const { favoritesCount } = useFavorites();
  const menuRef = useRef(null);

  const handleSearchClick = () => {
    navigate('/search');
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

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate('/');
  };

  // Get user initial for avatar
  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() || (isAuthenticated ? 'U' : 'G');

  const isClinicPage = location.pathname.startsWith('/clinic/') && !location.pathname.endsWith('/review');

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50 ${
        isSearchPage || isClinicPage ? 'relative' : 'sticky top-0'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <img src={logo} className="w-28 sm:w-36 md:w-40 h-auto" alt="logo" />
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => {
                let baseClass = 'nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium';
                if (isActive) return `${baseClass} active`;
                return baseClass;
              }}
            >
              Home
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) => {
                let baseClass = 'nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium';
                if (isActive) return `${baseClass} active`;
                return baseClass;
              }}
            >
              Services
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => {
                let baseClass = 'nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium';
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
                let baseClass =
                  'hidden sm:block nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium';
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

            {/* Provider Dashboard Link — visible only to providers */}
            {isProvider && (
              <Link
                to="/provider/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-green-600 text-white text-xs font-semibold hover:from-teal-700 hover:to-green-700 transition shadow-sm"
                title="Provider Dashboard"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            )}

            {/* User Avatar — navigates to /profile */}
            {isAuthenticated && (
              <button
                id="user-avatar-button"
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex-shrink-0"
                title="Go to profile"
              >
                {userInitial}
              </button>
            )}

            {/* Hamburger menu */}
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
                    className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full"
                  >
                    {/* Mobile nav links (hidden on md+) */}
                    <div className="md:hidden px-4 pt-4 pb-2 flex flex-col gap-1">
                      <NavLink
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        Home
                      </NavLink>
                      <NavLink
                        to="/services"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        Services
                      </NavLink>
                      <NavLink
                        to="/about"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        About
                      </NavLink>
                      {isAuthenticated && isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Admin Panel
                        </Link>
                      )}
                      {isAuthenticated && isProvider && (
                        <Link
                          to="/provider/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          Provider Dashboard
                        </Link>
                      )}
                    </div>

                    {/* ── Main account links ── */}
                    <div className="px-3 pt-3 pb-1 flex flex-col gap-0.5 border-t border-gray-100 md:border-t-0 md:pt-3">
                      {/* Favorites — visible to all users */}
                      <NavLink
                        to="/favorites"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Heart className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">Favorites</span>
                        {favoritesCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white min-w-[18px] text-center leading-none">
                            {favoritesCount}
                          </span>
                        )}
                      </NavLink>

                      {/* Auth-only items */}
                      {isAuthenticated && (
                        <>
                          <Link
                            to="/appointments"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <CalendarCheck className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">Appointments</span>
                          </Link>

                          <Link
                            to="/messages"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">Messages</span>
                          </Link>

                          <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">Profile</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* ── Settings & support ── */}
                    <div className="mx-4 my-1 border-t border-gray-100" />
                    <div className="px-3 pb-1 flex flex-col gap-0.5">
                      {isAuthenticated && (
                        <>
                          <Link
                            to="#"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Bell className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">Notifications</span>
                          </Link>

                          {/* <Link
                            to="#"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">Account settings</span>
                          </Link> */}

                          {/* <Link
                            to="#"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">Languages &amp; currency</span>
                          </Link> */}
                        </>
                      )}

                      <NavLink
                        to="/help"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">Help Center</span>
                      </NavLink>
                    </div>

                    {/* ── Become a Provider CTA ── */}
                    {!isProvider && (
                      <>
                        <div className="mx-4 my-1 border-t border-gray-100" />
                        <div className="px-4 py-3">
                          <NavLink
                            to="/join-provider"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 border border-gray-100 hover:shadow-md transition-all duration-300 group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Stethoscope className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition">
                                Join as a Provider
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                It's easy to register your hospital, clinic, or private practice
                              </p>
                            </div>
                          </NavLink>
                        </div>
                      </>
                    )}

                    {/* ── Auth section ── */}
                    <div className="mx-4 my-1 border-t border-gray-100" />
                    <div className="px-3 pt-1 pb-3">
                      {isAuthenticated ? (
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-sm font-medium py-2.5 px-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          <span>Log out</span>
                        </button>
                      ) : (
                        <div className="pt-1">
                          <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition-all shadow-sm"
                          >
                            Sign in
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;