/**
 * Lab AppShell — sidebar navigation layout for the laboratory portal.
 * Converted from the Lovable-generated TSX to JSX for the main app.
 * Preserves the identical visual design.
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell, BadgeCheck, Building2, ClipboardList, FlaskConical,
  HelpCircle, LayoutDashboard, LogOut, Menu, Receipt,
  Search, Settings, TestTubes, Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLabAuth } from '@/context/LabAuthContext';

const nav = [
  { to: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lab/orders', label: 'Orders', icon: ClipboardList },
  { to: '/lab/samples', label: 'Samples', icon: TestTubes },
  { to: '/lab/results', label: 'Results', icon: FlaskConical },
  { to: '/lab/tests', label: 'Tests & Pricing', icon: Receipt },
  { to: '/lab/patients', label: 'Patients', icon: Users },
  { to: '/lab/profile', label: 'Laboratory Profile', icon: Building2 },
  { to: '/lab/notifications', label: 'Notifications', icon: Bell },
  { to: '/lab/settings', label: 'Settings', icon: Settings },
];

function NavItems({ onNavigate, unreadCount }) {
  const { pathname } = useLocation();

  return (
    <nav className="space-y-1" aria-label="Main">
      {nav.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={
              'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ' +
              (active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
            }
          >
            {active && (
              <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
            )}
            <Icon
              className={'h-[18px] w-[18px]' + (active ? ' text-blue-600' : '')}
              aria-hidden="true"
            />
            <span className="flex-1">{item.label}</span>
            {item.to === '/lab/notifications' && unreadCount > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ labName }) {
  const initials = labName
    ? labName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'LP';

  return (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      <Link
        to="/lab/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <HelpCircle className="h-[18px] w-[18px]" aria-hidden="true" />
        Help &amp; Support
      </Link>
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
          {initials}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-gray-900">
            {labName || 'Laboratory'}
          </span>
          <span className="block text-[11px] text-gray-500">Laboratory account</span>
        </span>
      </div>
    </div>
  );
}

export default function LabAppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { signOut, profile } = useAuth();
  const { currentLab } = useLabAuth();

  const labName = currentLab?.name || 'Laboratory Portal';
  const isVerified = currentLab?.is_verified || false;
  const unreadCount = 0; // Will be replaced with real query

  const initials = labName
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[264px] flex-col justify-between border-r border-gray-200 bg-white px-4 py-5 lg:flex z-40">
        <div>
          <Link to="/lab/dashboard" className="mb-6 flex items-center gap-2 px-1">
            <span className="text-lg font-bold text-blue-600">Health Provida</span>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">LAB</span>
          </Link>
          <NavItems unreadCount={unreadCount} />
        </div>
        <SidebarFooter labName={labName} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white p-4 shadow-xl">
            <Link to="/lab/dashboard" className="mb-6 flex items-center gap-2 px-1">
              <span className="text-lg font-bold text-blue-600">Health Provida</span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">LAB</span>
            </Link>
            <NavItems onNavigate={() => setMobileOpen(false)} unreadCount={unreadCount} />
            <div className="mt-6">
              <SidebarFooter labName={labName} />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-[264px]">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <span className="text-[15px] font-semibold text-gray-900">{labName}</span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified Laboratory
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="relative hidden sm:block">
              <span className="sr-only">Search orders, patients, samples</span>
              <Search
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, patients…"
                className="h-9 w-56 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 lg:w-72"
              />
            </label>
            <Link
              to="/lab/notifications"
              className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-green-500" />
              )}
            </Link>
            <div className="relative">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                aria-label="Account menu"
                onClick={() => {/* Dropdown can be added later */}}
              >
                {initials}
              </button>
            </div>
            <button
              onClick={signOut}
              className="hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:block"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
