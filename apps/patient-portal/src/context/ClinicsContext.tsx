import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchClinics } from '@/utils/supabaseQueries';

export interface ClinicsContextValue {
  clinics: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ClinicsContext = createContext<ClinicsContextValue | null>(null);

export function ClinicsProvider({ children }: { children: React.ReactNode }) {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchClinics();
    if (fetchError) {
      console.error('ClinicsContext: Failed to fetch clinics:', fetchError);
      setError(fetchError.message || 'Failed to load clinics');
      setClinics([]);
    } else {
      setClinics(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  const refetch = useCallback(async () => {
    return loadClinics();
  }, [loadClinics]);

  return (
    <ClinicsContext.Provider value={{ clinics, loading, error, refetch }}>
      {children}
    </ClinicsContext.Provider>
  );
}

export function useClinics(): ClinicsContextValue {
  const context = useContext(ClinicsContext);
  if (!context) {
    throw new Error('useClinics must be used within a ClinicsProvider');
  }
  return context;
}

export default ClinicsContext;
