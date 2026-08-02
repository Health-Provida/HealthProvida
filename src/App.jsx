import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import JoinProviderPage from '@/pages/JoinProviderPage';
import ContactPage from '@/pages/ContactPage';
import ClinicPage from '@/pages/ClinicPage';
import ClinicPhotosPage from '@/pages/ClinicPhotosPage';
import MapPage from '@/pages/MapPage';
import FavoritesPage from '@/pages/FavoritesPage';
import LoginPage from '@/pages/LoginPage';
import AuthConfirmPage from '@/pages/AuthConfirmPage';
import HelpCenterPage from '@/pages/HelpCenterPage';
import WriteReviewPage from '@/pages/WriteReviewPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';
import SearchPage from '@/pages/SearchPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import MessagesPage from '@/pages/MessagesPage';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRouter from '@/pages/admin/AdminRouter';
import ProviderRouter from '@/pages/provider/ProviderRouter';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ClinicsProvider } from '@/context/ClinicsContext';


function App() {
  return (
    <AuthProvider>
      <ClinicsProvider>
        <FavoritesProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 flex flex-col">
            <ScrollToTop />
            <Routes>
              {/* Auth pages — no header/footer */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/confirm" element={<AuthConfirmPage />} />

              {/* Redirects for removed pages */}
              <Route path="/signup" element={<Navigate to="/login" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
              <Route path="/reset-password" element={<Navigate to="/login" replace />} />
              <Route path="/verify-email" element={<Navigate to="/login" replace />} />

              {/* Admin panel — its own layout, protected */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminRouter />
                  </ProtectedRoute>
                }
              />

              {/* Provider dashboard — its own layout, protected */}
              <Route
                path="/provider/*"
                element={
                  <ProtectedRoute requiredRole="provider">
                    <ProviderRouter />
                  </ProtectedRoute>
                }
              />

              {/* Standalone pages (no header/footer) */}
              <Route path="/clinic/:slug/photos" element={<ClinicPhotosPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/join-provider" element={<JoinProviderPage />} />

              {/* Public pages with header/footer */}
              <Route path="*" element={
                <>
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/clinic/:slug" element={<ClinicPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/help" element={<HelpCenterPage />} />
                      <Route path="/clinic/:slug/review" element={<WriteReviewPage />} />
                      <Route path="/appointments" element={
                        <ProtectedRoute>
                          <AppointmentsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      {/* Legal placeholder routes */}
                      <Route path="/terms" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1><p className="text-gray-500">Coming soon.</p></div>} />
                      <Route path="/payment-terms" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Terms of Service</h1><p className="text-gray-500">Coming soon.</p></div>} />
                      <Route path="/non-discrimination" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold text-gray-900 mb-4">Non-discrimination Policy</h1><p className="text-gray-500">Coming soon.</p></div>} />
                      <Route path="/privacy" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1><p className="text-gray-500">Coming soon.</p></div>} />
                      {/* 404 catch-all */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
            <Toaster />
          </div>
        </FavoritesProvider>
      </ClinicsProvider>
    </AuthProvider>
  );
}

export default App;