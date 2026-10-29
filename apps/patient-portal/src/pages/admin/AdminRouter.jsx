/**
 * AdminRouter.jsx
 * Nested router for all admin pages, wrapped in AdminLayout.
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ApplicationsListPage from '@/pages/admin/ApplicationsListPage';
import ApplicationDetailPage from '@/pages/admin/ApplicationDetailPage';
import ClinicsManagementPage from '@/pages/admin/ClinicsManagementPage';
import UsersManagementPage from '@/pages/admin/UsersManagementPage';
import AppointmentsManagementPage from '@/pages/admin/AppointmentsManagementPage';
import ReviewsModerationPage from '@/pages/admin/ReviewsModerationPage';
import ContactMessagesPage from '@/pages/admin/ContactMessagesPage';
import HMOManagementPage from '@/pages/admin/HMOManagementPage';
import AuditLogPage from '@/pages/admin/AuditLogPage';
import { supabase } from '@/utils/supabase';

export default function AdminRouter() {
  const [badges, setBadges] = useState({ pendingApps: 0, unreadMsgs: 0 });

  // Fetch badge counts for sidebar
  useEffect(() => {
    const loadBadges = async () => {
      if (!supabase) return;
      try {
        const [appsRes, msgsRes] = await Promise.all([
          supabase.from('provider_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
        ]);
        setBadges({
          pendingApps: appsRes.count ?? 0,
          unreadMsgs: msgsRes.count ?? 0,
        });
      } catch (err) {
        console.error('Failed to load badge counts:', err);
      }
    };

    loadBadges();
    // Refresh badge counts every 60 seconds
    const interval = setInterval(loadBadges, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout badges={badges}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="applications" element={<ApplicationsListPage />} />
        <Route path="applications/:id" element={<ApplicationDetailPage />} />
        <Route path="clinics" element={<ClinicsManagementPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="appointments" element={<AppointmentsManagementPage />} />
        <Route path="reviews" element={<ReviewsModerationPage />} />
        <Route path="messages" element={<ContactMessagesPage />} />
        <Route path="hmos" element={<HMOManagementPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}
