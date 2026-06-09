/**
 * ClinicsContext.jsx
 * ──────────────────────────────────────────────────────────────
 * Top-level context that fetches all clinics from Supabase once
 * and provides them to the entire app.
 *
 * Replaces all `import { clinicsData }` patterns across the
 * codebase with a single shared data source.
 *
 * Usage:
 *   // In App.jsx — wrap above FavoritesProvider
 *   <ClinicsProvider>
 *     <FavoritesProvider>
 *       ...
 *     </FavoritesProvider>
 *   </ClinicsProvider>
 *
 *   // In any component
 *   const { clinics, loading, error, refetch } = useClinics();
 * ──────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchClinics } from '@/utils/supabaseQueries';

const ClinicsContext = createContext(null);

export function ClinicsProvider({ children }) {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchClinics();
    if (fetchError) {
      console.error('ClinicsContext: Failed to fetch clinics:', fetchError);
      setError(fetchError.message || 'Failed to load clinics');
      // Supabase unreachable — leave clinics empty so error UI shows
      setClinics([]);
    } else {
      setClinics(data ?? []);
    }
    setLoading(false);
  }, []);

  // Fetch on mount
  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  const refetch = useCallback(() => {
    return loadClinics();
  }, [loadClinics]);

  return (
    <ClinicsContext.Provider value={{ clinics, loading, error, refetch }}>
      {children}
    </ClinicsContext.Provider>
  );
}

/**
 * Hook to access clinic data from the ClinicsContext.
 * Must be used within a <ClinicsProvider>.
 */
export function useClinics() {
  const context = useContext(ClinicsContext);
  if (!context) {
    throw new Error('useClinics must be used within a ClinicsProvider');
  }
  return context;
}

export default ClinicsContext;
