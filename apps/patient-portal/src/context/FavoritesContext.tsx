import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useClinics } from '@/context/ClinicsContext';

export interface FavoritesContextValue {
  favorites: string[];
  toggleFavorite: (clinicId: string) => void;
  isFavorite: (clinicId: string) => boolean;
  getFavoriteClinics: () => any[];
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const STORAGE_KEY = 'healthprovida_favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { clinics } = useClinics();

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // localStorage might be full or unavailable
    }
  }, [favorites]);

  const toggleFavorite = useCallback((clinicId: string) => {
    setFavorites(prev => {
      if (prev.includes(clinicId)) {
        return prev.filter(id => id !== clinicId);
      }
      return [...prev, clinicId];
    });
  }, []);

  const isFavorite = useCallback((clinicId: string) => {
    return favorites.includes(clinicId);
  }, [favorites]);

  const getFavoriteClinics = useCallback(() => {
    return clinics.filter((clinic: any) => favorites.includes(clinic.id));
  }, [favorites, clinics]);

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavoriteClinics, favoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export default FavoritesContext;
