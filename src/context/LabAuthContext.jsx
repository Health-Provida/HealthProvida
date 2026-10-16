/**
 * LabAuthContext.jsx
 * ──────────────────────────────────────────────────────────────
 * Provides laboratory-specific authentication state and methods.
 * Wraps the existing AuthContext and adds:
 *  - Current lab organization ID & data
 *  - Staff role within the current lab
 *  - Lab-specific permission checks
 *
 * Must be used INSIDE <AuthProvider> (it reads from useAuth).
 * ──────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';

const LabAuthContext = createContext(null);

const LAB_ROLES_CAN_PUBLISH = ['lab_admin', 'lab_scientist'];
const LAB_ROLES_CAN_MANAGE_STAFF = ['lab_admin'];

export function LabAuthProvider({ children }) {
  const { user, session, loading: authLoading } = useAuth();

  const [labStaff, setLabStaff] = useState(null);        // current lab_staff row
  const [currentLab, setCurrentLab] = useState(null);     // lab_organizations row
  const [userLabs, setUserLabs] = useState([]);           // all labs user is staff of
  const [labLoading, setLabLoading] = useState(true);

  // Fetch all labs the user is staff of
  const fetchUserLabs = useCallback(async () => {
    if (!supabase || !user?.id) {
      setUserLabs([]);
      setLabStaff(null);
      setCurrentLab(null);
      setLabLoading(false);
      return;
    }

    try {
      const { data: staffRecords, error } = await supabase
        .from('lab_staff')
        .select(`
          id, lab_id, role, is_active,
          lab:lab_id(id, name, slug, is_verified, is_active)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('LabAuthContext: Failed to fetch lab staff:', error);
        setUserLabs([]);
        setLabStaff(null);
        setCurrentLab(null);
        setLabLoading(false);
        return;
      }

      const labs = (staffRecords || []).filter(r => r.lab?.is_active);
      setUserLabs(labs);

      if (labs.length > 0) {
        // Use first lab by default (or restore from localStorage)
        const savedLabId = localStorage.getItem('hp_current_lab_id');
        const savedRecord = labs.find(l => String(l.lab_id) === savedLabId);
        const activeRecord = savedRecord || labs[0];

        setLabStaff(activeRecord);
        setCurrentLab(activeRecord.lab);
        localStorage.setItem('hp_current_lab_id', String(activeRecord.lab_id));
      } else {
        setLabStaff(null);
        setCurrentLab(null);
      }
    } catch (err) {
      console.error('LabAuthContext: Fetch exception:', err);
    } finally {
      setLabLoading(false);
    }
  }, [user?.id]);

  // Re-fetch when auth user changes
  useEffect(() => {
    if (!authLoading) {
      fetchUserLabs();
    }
  }, [authLoading, fetchUserLabs]);

  // Switch active lab
  const switchLab = useCallback((labId) => {
    const record = userLabs.find(l => l.lab_id === labId);
    if (record) {
      setLabStaff(record);
      setCurrentLab(record.lab);
      localStorage.setItem('hp_current_lab_id', String(labId));
    }
  }, [userLabs]);

  const value = useMemo(() => {
    const labRole = labStaff?.role || null;
    const labId = currentLab?.id || null;

    return {
      // State
      currentLab,
      labStaff,
      labId,
      labRole,
      userLabs,
      labLoading: authLoading || labLoading,

      // Checks
      isLabStaff: !!labStaff,
      isLabAdmin: labRole === 'lab_admin',
      isLabScientist: labRole === 'lab_scientist',
      isLabTechnician: labRole === 'lab_technician',
      isLabPhlebotomist: labRole === 'lab_phlebotomist',
      canPublishResults: LAB_ROLES_CAN_PUBLISH.includes(labRole),
      canManageStaff: LAB_ROLES_CAN_MANAGE_STAFF.includes(labRole),
      canManageTests: LAB_ROLES_CAN_MANAGE_STAFF.includes(labRole),

      // Actions
      switchLab,
      refreshLabs: fetchUserLabs,
    };
  }, [currentLab, labStaff, userLabs, authLoading, labLoading, switchLab, fetchUserLabs]);

  return (
    <LabAuthContext.Provider value={value}>
      {children}
    </LabAuthContext.Provider>
  );
}

/**
 * Hook to access lab auth state and methods.
 * Must be used within a <LabAuthProvider>.
 */
export function useLabAuth() {
  const context = useContext(LabAuthContext);
  if (!context) {
    throw new Error('useLabAuth must be used within a LabAuthProvider');
  }
  return context;
}

export default LabAuthContext;
