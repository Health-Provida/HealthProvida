/**
 * AdminLayout.jsx
 * Shell layout for all admin pages — sidebar nav + top bar + content area.
 * Dark sidebar with HealthProvida blue/green accents.
 */
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Building2, Users, Calendar,
  Star, MessageSquare, Shield, Settings, LogOut, ChevronLeft,
  ChevronRight, Menu, X, Bell, ClipboardList, Home
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/applications',   icon: FileText,        label: 'Applications', badgeKey: 'pendingApps' },
  { to: '/admin/clinics',        icon: Building2,       label: 'Clinics' },
  { to: '/admin/users',          icon: Users,           label: 'Users',          minRole: 'admin' },
  { to: '/admin/appointments',   icon: Calendar,        label: 'Appointments' },
  { to: '/admin/reviews',        icon: Star,            label: 'Reviews' },
  { to: '/admin/messages',       icon: MessageSquare,   label: 'Messages',       badgeKey: 'unreadMsgs' },
  { to: '/admin/hmos',           icon: Shield,          label: 'HMOs',           minRole: 'admin' },
  { to: '/admin/audit-log',      icon: ClipboardList,   label: 'Audit Log',      minRole: 'admin' },
];

// Role hierarchy for minRole checks
const ROLE_LEVEL = { moderator: 1, admin: 2, super_admin: 3 };

function canAccess(userRole, minRole) {
  if (!minRole) return true;
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}

export default function AdminLayout({ children, badges = {} }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut, adminRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) => {
    const base = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group`;
    if (isActive) {
      return `${base} bg-gradient-to-r from-blue-600/20 to-green-600/10 text-white`;
    }
    return `${base} text-slate-400 hover:text-white hover:bg-white/5`;
  };

  const filteredNav = NAV_ITEMS.filter(item => canAccess(adminRole, item.minRole));

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-white/5`}>
        {!collapsed && (
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">HealthProvida</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Admin Panel</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const badge = item.badgeKey ? badges[item.badgeKey] : null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={navItemClass}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[20px] h-[20px] flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white min-w-[20px] text-center">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && badge > 0 && (
                <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Back to site link */}
      <div className="px-3 pb-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <Home className="w-[20px] h-[20px] flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{adminRole?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[20px] h-[20px] flex-shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 transition-all duration-300 sticky top-0 h-screen ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-slate-900 z-[70] flex flex-col lg:hidden"
            >
              <div className="flex justify-end px-3 pt-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition relative">
                <Bell className="w-5 h-5 text-gray-500" />
                {(badges.unreadMsgs || badges.pendingApps) ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                ) : null}
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
