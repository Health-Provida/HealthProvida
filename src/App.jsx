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
import ScrollToTop from '@/components/ScrollToTop';


function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 flex flex-col">
      <Header />
      <ScrollToTop /> {/* Place it here */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/join-provider" element={<JoinProviderPage />} />
          <Route path="/contact" element={<ContactPage/>} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;