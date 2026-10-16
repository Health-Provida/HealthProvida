/**
 * LabRouter.jsx
 * ──────────────────────────────────────────────────────────────
 * Sub-router for all /lab/* routes. Wraps lab pages in the
 * LabAuthProvider and React Query QueryClientProvider.
 * ──────────────────────────────────────────────────────────────
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { LabAuthProvider, useLabAuth } from '@/context/LabAuthContext';
import LabDashboard from '@/pages/lab/Dashboard';
import LabOrdersIndex from '@/pages/lab/OrdersIndex';
import LabOrderDetail from '@/pages/lab/OrderDetail';
import LabSamples from '@/pages/lab/Samples';
import LabResultsIndex from '@/pages/lab/ResultsIndex';
import LabResultDetail from '@/pages/lab/ResultDetail';
import LabTests from '@/pages/lab/Tests';
import LabPatients from '@/pages/lab/Patients';
import LabProfile from '@/pages/lab/Profile';
import LabNotifications from '@/pages/lab/Notifications';
import LabSettings from '@/pages/lab/Settings';
import LabNotFound from '@/pages/lab/NotFound';

// Separate QueryClient for the lab portal to avoid cache collisions
const labQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30 seconds
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

/**
 * Gate component — shows loading or "no lab access" message
 * while lab auth resolves.
 */
function LabGate({ children }) {
  const { labLoading, isLabStaff } = useLabAuth();

  if (labLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading laboratory portal...</p>
        </div>
      </div>
    );
  }

  if (!isLabStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center px-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Laboratory Access Required</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your account does not have access to any laboratory on Health Provida.
            If you believe this is an error, please contact your laboratory administrator.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Health Provida
          </a>
        </div>
      </div>
    );
  }

  return children;
}

export default function LabRouter() {
  return (
    <QueryClientProvider client={labQueryClient}>
      <LabAuthProvider>
        <LabGate>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LabDashboard />} />
            <Route path="orders" element={<LabOrdersIndex />} />
            <Route path="orders/:orderId" element={<LabOrderDetail />} />
            <Route path="samples" element={<LabSamples />} />
            <Route path="results" element={<LabResultsIndex />} />
            <Route path="results/:resultId" element={<LabResultDetail />} />
            <Route path="tests" element={<LabTests />} />
            <Route path="patients" element={<LabPatients />} />
            <Route path="profile" element={<LabProfile />} />
            <Route path="notifications" element={<LabNotifications />} />
            <Route path="settings" element={<LabSettings />} />
            <Route path="*" element={<LabNotFound />} />
          </Routes>
        </LabGate>
        <Toaster position="top-right" richColors />
      </LabAuthProvider>
    </QueryClientProvider>
  );
}
