/**
 * Lab NotFound — 404 page for unrecognized lab routes.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import LabAppShell from '@/components/lab/AppShell';

export default function LabNotFound() {
  return (
    <LabAppShell>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          The laboratory page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/lab/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to dashboard
        </Link>
      </div>
    </LabAppShell>
  );
}
