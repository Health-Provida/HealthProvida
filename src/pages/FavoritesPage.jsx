import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, MapPin, ArrowLeft } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

function FavoriteClinicCard({ clinic, onRemove, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={clinic.image_src}
          alt={clinic.practitioner_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Heart remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(clinic.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:scale-110 transition-all duration-200 z-10"
        >
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </button>

        {/* Rating badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-gray-900">{clinic.rating}</span>
          <span className="text-xs text-gray-500">({clinic.number_of_reviews})</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
          {clinic.practitioner_name}
        </h3>
        <p className="text-sm text-gray-500 truncate mt-0.5">{clinic.practice_type}</p>
        <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{clinic.distance_from_location} away</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function FavoritesPage() {
  const { getFavoriteClinics, toggleFavorite, favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const favoriteClinics = getFavoriteClinics();

  return (
    <>
      <Helmet>
        <title>Wishlists — HealthProvida</title>
        <meta name="description" content="View your saved hospitals and clinics on HealthProvida." />
      </Helmet>

      <div className="min-h-[60vh] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500 hover:text-blue-600 transition mb-4 font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Wishlists</h1>
            {favoritesCount > 0 && (
              <p className="text-gray-500 mt-2 text-sm">
                {favoritesCount} saved {favoritesCount === 1 ? 'hospital' : 'hospitals'}
              </p>
            )}
          </div>

          {/* Grid */}
          {favoriteClinics.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {favoriteClinics.map((clinic) => (
                  <FavoriteClinicCard
                    key={clinic.id}
                    clinic={clinic}
                    onRemove={toggleFavorite}
                    onClick={() => navigate(`/clinic/${clinic.id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center mb-6 shadow-inner">
                <Heart className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No wishlists yet</h2>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                As you search, tap the heart icon to save your favourite hospitals and clinics to a wishlist.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Start Exploring
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
