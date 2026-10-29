/**
 * ProviderRouter.jsx
 * Nested router for all provider dashboard pages at /provider/*.
 * Wraps all pages in ProviderLayout.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProviderLayout from '@/components/provider/ProviderLayout';
import ProviderDashboard from './ProviderDashboard';
import ClinicEditPage from './ClinicEditPage';
import ProviderAppointmentsPage from './ProviderAppointmentsPage';
import ProviderReviewsPage from './ProviderReviewsPage';
import ScheduleManagementPage from './ScheduleManagementPage';
import ProviderSettingsPage from './ProviderSettingsPage';
import AnalyticsDashboardPage from './AnalyticsDashboardPage';
import StaffManagementPage from './StaffManagementPage';
import ProviderMessagesPage from './ProviderMessagesPage';

export default function ProviderRouter() {
  return (
    <ProviderLayout>
      <Routes>
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="clinic" element={<ClinicEditPage />} />
        <Route path="appointments" element={<ProviderAppointmentsPage />} />
        <Route path="reviews" element={<ProviderReviewsPage />} />
        <Route path="schedule" element={<ScheduleManagementPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="messages" element={<ProviderMessagesPage />} />
        <Route path="settings" element={<ProviderSettingsPage />} />
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </ProviderLayout>
  );
}
