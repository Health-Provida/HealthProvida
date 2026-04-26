import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Heart } from 'lucide-react';
import { clinicsData, commonGallery } from '../components/ClinicGrid';

export default function ClinicPhotosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const clinic = clinicsData.find(c => c.id === parseInt(id));
  const gallery = clinic?.gallery || [clinic?.image_src, ...commonGallery];

  useEffect(() => {
    window.scrollTo(0, 0);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate hidden sm:block">
              {clinic.practitioner_name} - Photos
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700" title="Share">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700" title="Save">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((image, index) => (
            <div 
              key={index} 
              className={`rounded-xl overflow-hidden group cursor-pointer ${
                index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
              }`}
            >
              <img 
                src={image} 
                alt={`${clinic.practitioner_name} ward ${index + 1}`} 
                className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
