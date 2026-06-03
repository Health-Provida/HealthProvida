import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import ScrollToTop from '@/components/ScrollToTop';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ClinicsProvider } from '@/context/ClinicsContext';


function App() {
  return (
    <ClinicsProvider>
    <FavoritesProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 flex flex-col">
        <ScrollToTop />
        <Routes>
          <Route path="/clinic/:id/photos" element={<ClinicPhotosPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={
            <>
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/join-provider" element={<JoinProviderPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/clinic/:id" element={<ClinicPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
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
  );
}

export default App;