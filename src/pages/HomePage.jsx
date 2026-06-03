import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import SearchSection from '@/components/SearchSection';
import ClinicGrid from '@/components/ClinicGrid';
import MapSection from '@/components/MapSection';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>HealthProvida - Find Quality Clinics Near You</title>
        <meta name="description" content="Discover and book appointments at the best medical clinics in your area. Compare ratings, services, and availability with HealthProvida." />
      </Helmet>
      <Hero />
      {/* <SearchSection /> */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <ClinicGrid />
          </div>
          <div className="lg:col-span-1">
            <MapSection/>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;