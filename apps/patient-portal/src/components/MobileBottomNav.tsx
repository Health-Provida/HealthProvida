import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, CalendarCheck, User } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';

const tabs = [
  {
    to: '/',
    label: 'Explore',
    Icon: Home,
    exact: true,
  },
  {
    to: '/search',
    label: 'Search',
    Icon: Search,
  },
  {
    to: '/favorites',
    label: 'Favourites',
    Icon: Heart,
    showBadge: true,
  },
  {
    to: '/appointments',
    label: 'Trips',
    Icon: CalendarCheck,
    authRequired: true,
  },
  {
    to: '/profile',
    label: 'Profile',
    Icon: User,
    authRequired: true,
    fallbackTo: '/login',
  },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { favoritesCount } = useFavorites();
  const { isAuthenticated } = useAuth();

  // Hide on pages that have their own bottom UI or full-screen pages
  const hiddenPaths = ['/login', '/auth/confirm', '/map'];
  const isHidden = hiddenPaths.some((p) => location.pathname.startsWith(p))
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/provider')
    || location.pathname.endsWith('/photos');

  if (isHidden) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {tabs.map(({ to, label, Icon, exact, showBadge, authRequired, fallbackTo }) => {
          const dest = authRequired && !isAuthenticated ? (fallbackTo || '/login') : to;
          const isActive =
            exact ? location.pathname === to : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={dest}
              end={exact}
              className="flex flex-col items-center justify-center gap-0.5 pt-1 transition-colors duration-150 relative group"
            >
              <span className={`relative flex items-center justify-center w-7 h-7 ${isActive ? '' : ''}`}>
                {/* Favorites heart — filled when active */}
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive
                      ? label === 'Favourites'
                        ? 'text-red-500 fill-red-500 scale-110'
                        : 'text-blue-600 scale-110'
                      : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Favorites badge */}
                {showBadge && favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                  isActive
                    ? label === 'Favourites'
                      ? 'text-red-500'
                      : 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
