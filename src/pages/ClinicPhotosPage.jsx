import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Heart, LayoutGrid } from 'lucide-react';
import { clinicsData, commonGallery } from '../components/ClinicGrid';

export default function ClinicPhotosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(commonGallery[0]?.id || '');

  const clinic = clinicsData.find(c => c.id === parseInt(id));

  // Create refs for each section to handle scrolling
  const sectionRefs = useRef({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Intersection Observer to detect which section is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  if (!clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Clinic Not Found</h1>
        <button
          onClick={() => navigate('/services')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Providers
        </button>
      </div>
    );
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 140; // Height of both sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Main Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"> */}
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center"> */}
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="flex items-center flex-1 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg flex-1 grow text-center font-bold text-gray-900 truncate">
              {/* Photo Tour: {clinic.practitioner_name} */}
              Photo Tour
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 hidden sm:block" title="Share">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 hidden sm:block" title="Save">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      {/* <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm overflow-x-auto hide-scrollbar"> */}
      <div className="top-16 z-40 bg-white border-b border-gray-200 shadow-sm overflow-x-auto hide-scrollbar">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 py-4"> */}
        <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-6 py-4 justify-center">
          {commonGallery.map((ward) => (
            <button
              key={ward.id}
              onClick={() => scrollToSection(ward.id)}
              className={`flex flex-col items-center gap-2 min-w-[100px] transition group ${activeSection === ward.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
            >
              <div className={`w-32 h-32 rounded-xl overflow-hidden border-2 transition-all ${activeSection === ward.id ? 'border-gray-900 shadow-md scale-105' : 'border-transparent group-hover:border-gray-300'
                }`}>
                <img
                  src={ward.images[0]}
                  alt={ward.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap transition-colors ${activeSection === ward.id ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                {ward.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {/* <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16"> */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {commonGallery.map((ward) => (
          <div
            key={ward.id}
            id={ward.id}
            ref={el => sectionRefs.current[ward.id] = el}
            className="scroll-mt-40"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Side: Title & Description (Sticky on Desktop) */}
              <div className="md:w-1/3 flex-shrink-0">
                <div className="sticky top-24">
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">{ward.title}</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {ward.description}
                  </p>
                </div>
              </div>

              {/* Right Side: Photo Grid */}
              <div className="md:w-2/3 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ward.images.map((imgSrc, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl overflow-hidden cursor-pointer group ${index === 0 ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-square'
                        }`}
                    >
                      <img
                        src={imgSrc}
                        alt={`${ward.title} - Photo ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider between sections except the last one */}
            {/* <div className="mt-16 border-t border-gray-200"></div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
