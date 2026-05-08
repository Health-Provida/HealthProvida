import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Heart } from 'lucide-react';
import { clinicsData, commonGallery } from '../components/ClinicGrid';

export default function ClinicPhotosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(commonGallery[0]?.id || '');

  const clinic = clinicsData.find(c => c.id === parseInt(id));

  // Create refs for each section to handle scrolling
  const sectionRefs = useRef({});
  // Ref for the active category thumbnail to scroll it into view
  const categoryNavRef = useRef(null);
  const categoryBtnRefs = useRef({});

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

  // Auto-scroll category nav to keep active thumbnail visible
  useEffect(() => {
    const activeBtn = categoryBtnRefs.current[activeSection];
    const nav = categoryNavRef.current;
    if (activeBtn && nav) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const scrollLeft = activeBtn.offsetLeft - navRect.width / 2 + btnRect.width / 2;
      nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeSection]);

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
      const headerOffset = window.innerWidth < 640 ? 110 : 140;
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
    <div className="min-h-screen bg-white sm:bg-gray-50 pb-20">
      {/* Top Main Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center">
          <div className="flex items-center flex-1 gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg flex-1 grow text-center font-semibold sm:font-bold text-gray-900 truncate">
              Photo tour
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700" title="Share">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700" title="Save">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation — horizontal scroll on mobile, centered on desktop */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto hide-scrollbar" ref={categoryNavRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="px-3 sm:px-6 lg:px-8 flex items-start gap-3 sm:gap-6 py-3 sm:py-4 sm:justify-center w-max sm:w-auto sm:mx-auto">
          {commonGallery.map((ward) => (
            <button
              key={ward.id}
              ref={el => categoryBtnRefs.current[ward.id] = el}
              onClick={() => scrollToSection(ward.id)}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 min-w-0 transition group flex-shrink-0 ${
                activeSection === ward.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`w-16 h-16 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                activeSection === ward.id
                  ? 'border-gray-900 shadow-md sm:scale-105'
                  : 'border-transparent group-hover:border-gray-300'
              }`}>
                <img
                  src={ward.images[0]}
                  alt={ward.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-[11px] sm:text-xs font-medium sm:font-semibold text-center leading-tight max-w-[72px] sm:max-w-none transition-colors ${
                activeSection === ward.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'
              }`}>
                {ward.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-10 sm:space-y-16">
        {commonGallery.map((ward) => (
          <div
            key={ward.id}
            id={ward.id}
            ref={el => sectionRefs.current[ward.id] = el}
            className="scroll-mt-32 sm:scroll-mt-40"
          >
            {/* Mobile: stacked layout. Desktop: side-by-side */}
            <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
              {/* Title & Description */}
              <div className="md:w-1/3 flex-shrink-0">
                <div className="md:sticky md:top-24">
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-3">{ward.title}</h2>
                  <p className="text-gray-600 leading-relaxed text-sm hidden sm:block">
                    {ward.description}
                  </p>
                </div>
              </div>

              {/* Photo Grid */}
              <div className="md:w-2/3 flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                  {ward.images.map((imgSrc, index) => (
                    <div
                      key={index}
                      className={`rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group ${
                        index === 0 ? 'col-span-2 aspect-[16/10] sm:aspect-[16/9]' : 'aspect-square'
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
          </div>
        ))}
      </div>
    </div>
  );
}
