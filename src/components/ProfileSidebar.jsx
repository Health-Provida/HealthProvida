import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart, X, User, Settings, Globe, HelpCircle,
  LogOut, MessageSquare, CalendarCheck, ChevronRight,
  Stethoscope
} from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

const menuItems = [
  {
    section: 'main',
    items: [
      { icon: Heart, label: 'Wishlists', to: '/favorites', highlight: true },
      { icon: CalendarCheck, label: 'Appointments', to: '#' },
      { icon: MessageSquare, label: 'Messages', to: '#' },
      { icon: User, label: 'Profile', to: '#' },
    ]
  },
  {
    section: 'settings',
    items: [
      { icon: Settings, label: 'Account settings', to: '#' },
      { icon: Globe, label: 'Language & currency', to: '#' },
      { icon: HelpCircle, label: 'Help Center', to: '#' },
    ]
  }
];

export default function ProfileSidebar({ isOpen, onClose }) {
  const { favoritesCount } = useFavorites();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[340px] max-w-[85vw] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Account</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                  D
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">Daniel Achonduh</h3>
                  <p className="text-sm text-gray-500 truncate">daniel@healthprovida.com</p>
                  <Link
                    to="#"
                    onClick={onClose}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-0.5 inline-block"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2">
              {menuItems.map((section, sectionIdx) => (
                <div key={section.section}>
                  {sectionIdx > 0 && (
                    <div className="mx-6 my-2 border-t border-gray-100" />
                  )}
                  <nav className="px-3">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isWishlist = item.label === 'Wishlists';
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                            ${item.highlight
                              ? 'text-gray-900 hover:bg-blue-50'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition
                            ${item.highlight
                              ? 'bg-gradient-to-br from-blue-100 to-green-100 text-blue-600 group-hover:from-blue-200 group-hover:to-green-200'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                            }`}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </div>
                          <span className="flex-1">{item.label}</span>
                          {isWishlist && favoritesCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white min-w-[20px] text-center">
                              {favoritesCount}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}

              {/* Join as Provider CTA */}
              <div className="mx-6 my-4 border-t border-gray-100" />
              <div className="mx-6 mb-4">
                <Link
                  to="/join-provider"
                  onClick={onClose}
                  className="block p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 border border-gray-100 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition">Become a Provider</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        It's easy to start hosting and earn extra income.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => {
                  onClose();
                  alert('Logged out!');
                }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition">
                  <LogOut className="w-[18px] h-[18px]" />
                </div>
                <span>Log out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
