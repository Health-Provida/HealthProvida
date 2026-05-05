import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clinicsData } from '@/components/ClinicGrid';

const FavoritesContext = createContext(null);

const STORAGE_KEY = 'healthprovida_favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // localStorage might be full or unavailable
    }
  }, [favorites]);

  const toggleFavorite = useCallback((clinicId) => {
    setFavorites(prev => {
      if (prev.includes(clinicId)) {
        return prev.filter(id => id !== clinicId);
      }
      return [...prev, clinicId];
    });
  }, []);

  const isFavorite = useCallback((clinicId) => {
    return favorites.includes(clinicId);
  }, [favorites]);

  const getFavoriteClinics = useCallback(() => {
    return clinicsData.filter(clinic => favorites.includes(clinic.id));
  }, [favorites]);

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavoriteClinics, favoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export default FavoritesContext;
