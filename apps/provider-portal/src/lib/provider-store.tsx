import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import * as api from "./mock-services";
import type {
  Appointment,
  AppointmentStatus,
  Authorization,
  Doctor,
  EMRSyncState,
  Encounter,
  HMO,
  Hospital,
  Notification,
  Patient,
  PromotedCampaign,
  ProviderPerformance,
  Schedule,
  ServiceTariff,
  VerificationStep,
} from "./types";

interface StoreState {
  loading: boolean;
  hospital: Hospital | null;
  verificationSteps: VerificationStep[];
  doctors: Doctor[];
  schedules: Schedule[];
  patients: Patient[];
  appointments: Appointment[];
  encounters: Encounter[];
  hmos: HMO[];
  authorizations: Authorization[];
  tariffs: ServiceTariff[];
  notifications: Notification[];
  emr: EMRSyncState | null;
  performance: ProviderPerformance | null;
  campaigns: PromotedCampaign[];
}

const initialState: StoreState = {
  loading: true,
  hospital: null,
  verificationSteps: [],
  doctors: [],
  schedules: [],
  patients: [],
  appointments: [],
  encounters: [],
  hmos: [],
  authorizations: [],
  tariffs: [],
  notifications: [],
  emr: null,
  performance: null,
  campaigns: [],
};

interface StoreValue extends StoreState {
  patientById: (id: string) => Patient | undefined;
  doctorById: (id: string) => Doctor | undefined;
  hmoById: (id: string) => HMO | undefined;
  authorizationFor: (appointmentId: string) => Authorization | undefined;
  encounterFor: (appointmentId: string) => Encounter | undefined;
  refreshPerformance: () => Promise<void>;
  updateHospital: (patch: Partial<Hospital>) => Promise<void>;
  uploadPhoto: (slot: string) => Promise<void>;
  submitVerification: () => Promise<void>;
  addDoctor: (input: Omit<Doctor, "id">) => Promise<void>;
  updateDoctor: (id: string, patch: Partial<Doctor>) => Promise<void>;
  addSchedule: (input: Omit<Schedule, "id">) => Promise<void>;
  updateSchedule: (id: string, patch: Partial<Schedule>) => Promise<void>;
  removeSchedule: (id: string) => Promise<void>;
  setAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  reschedule: (id: string, date: string, time: string) => Promise<void>;
  checkIn: (id: string) => Promise<string>;
  startConsultation: (encounterId: string) => Promise<void>;
  completeEncounter: (encounterId: string) => Promise<void>;
  checkOut: (encounterId: string) => Promise<void>;
  requestAuthorization: (input: api.AuthorizationInput) => Promise<Authorization>;
  updateTariff: (id: string, patch: Partial<ServiceTariff>) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  runSync: () => Promise<void>;
  addCampaign: (input: Omit<PromotedCampaign, "id" | "status" | "createdAt">) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function ProviderStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);

  const patch = useCallback((next: Partial<StoreState>) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [
        hospital,
        verificationSteps,
        doctors,
        schedules,
        patients,
        appointments,
        encounters,
        hmos,
        authorizations,
        tariffs,
        notifications,
        emr,
        performance,
        campaigns,
      ] = await Promise.all([
        api.getHospital(),
        api.getVerificationSteps(),
        api.getDoctors(),
        api.getSchedules(),
        api.getPatients(),
        api.getAppointments(),
        api.getEncounters(),
        api.getHMOs(),
        api.getAuthorizations(),
        api.getTariffs(),
        api.getNotifications(),
        api.getEMRSync(),
        api.getPerformance(),
        api.getCampaigns(),
      ]);
      if (!active) return;
      setState({
        loading: false,
        hospital,
        verificationSteps,
        doctors,
        schedules,
        patients,
        appointments,
        encounters,
        hmos,
        authorizations,
        tariffs,
        notifications,
        emr,
        performance,
        campaigns,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  const refreshPerformance = useCallback(async () => {
    const performance = await api.getPerformance();
    patch({ performance });
  }, [patch]);

  const refreshNotifications = useCallback(async () => {
    const notifications = await api.getNotifications();
    patch({ notifications });
  }, [patch]);

  const value = useMemo<StoreValue>(() => {
    return {
      ...state,
      patientById: (id) => state.patients.find((p) => p.id === id),
      doctorById: (id) => state.doctors.find((d) => d.id === id),
      hmoById: (id) => state.hmos.find((h) => h.id === id),
      authorizationFor: (appointmentId) =>
        state.authorizations.find((a) => a.appointmentId === appointmentId),
      encounterFor: (appointmentId) =>
        state.encounters.find((e) => e.appointmentId === appointmentId),
      refreshPerformance,
      async updateHospital(p) {
        const hospital = await api.updateHospital(p);
        patch({ hospital });
        toast.success("Facility profile updated");
      },
      async uploadPhoto(slot) {
        const hospital = await api.uploadFacilityPhoto(slot);
        const verificationSteps = await api.getVerificationSteps();
        patch({ hospital, verificationSteps });
        toast.success("Photograph uploaded", { description: "Pending Health Provida review." });
      },
      async submitVerification() {
        const hospital = await api.submitForVerification();
        const verificationSteps = await api.getVerificationSteps();
        patch({ hospital, verificationSteps });
        await refreshNotifications();
        await refreshPerformance();
        if (hospital.verification === "verified") {
          toast.success("Facility verified", { description: hospital.verificationNote });
        } else {
          toast.error("Changes required", { description: hospital.verificationNote });
        }
      },
      async addDoctor(input) {
        await api.createDoctor(input);
        const doctors = await api.getDoctors();
        patch({ doctors });
        toast.success(`${input.title} ${input.name} added`);
      },
      async updateDoctor(id, p) {
        const doctors = await api.updateDoctor(id, p);
        patch({ doctors });
        toast.success("Doctor updated");
      },
      async addSchedule(input) {
        const schedules = await api.createSchedule(input);
        patch({ schedules });
        toast.success("Schedule added");
      },
      async updateSchedule(id, p) {
        const schedules = await api.updateSchedule(id, p);
        patch({ schedules });
        toast.success("Schedule updated");
      },
      async removeSchedule(id) {
        const schedules = await api.deleteSchedule(id);
        patch({ schedules });
        toast.success("Schedule deleted");
      },
      async setAppointmentStatus(id, status) {
        const appointments = await api.updateAppointmentStatus(id, status);
        patch({ appointments });
        await refreshPerformance();
        toast.success("Appointment updated");
      },
      async reschedule(id, date, time) {
        const appointments = await api.rescheduleAppointment(id, date, time);
        patch({ appointments });
        toast.success("Appointment rescheduled", { description: `${date} at ${time}` });
      },
      async checkIn(id) {
        const result = await api.checkInAppointment(id);
        patch({ appointments: result.appointments, encounters: result.encounters });
        await refreshNotifications();
        toast.success(`Patient checked in at ${result.checkedInAt}`, {
          description: "An active encounter has been created.",
        });
        return result.checkedInAt;
      },
      async startConsultation(encounterId) {
        const result = await api.startConsultation(encounterId);
        patch({ encounters: result.encounters, appointments: result.appointments });
        toast.success("Consultation started");
      },
      async completeEncounter(encounterId) {
        const result = await api.completeEncounter(encounterId);
        patch({ encounters: result.encounters, appointments: result.appointments });
        await refreshPerformance();
        toast.success("Encounter completed", { description: "Dashboard metrics updated." });
      },
      async checkOut(encounterId) {
        const encounters = await api.checkOutEncounter(encounterId);
        patch({ encounters });
        toast.success("Patient checked out");
      },
      async requestAuthorization(input) {
        const record = await api.requestAuthorization(input);
        const [authorizations, appointments] = await Promise.all([
          api.getAuthorizations(),
          api.getAppointments(),
        ]);
        patch({ authorizations, appointments });
        await refreshNotifications();
        if (record.status === "approved") {
          toast.success("Authorization approved", { description: record.code });
        } else {
          toast.warning("Manual review required", { description: record.reason });
        }
        return record;
      },
      async updateTariff(id, p) {
        const tariffs = await api.updateTariff(id, p);
        patch({ tariffs });
        toast.success("Service updated");
      },
      async markRead(id) {
        const notifications = await api.markNotificationRead(id);
        patch({ notifications });
      },
      async markAllRead() {
        const notifications = await api.markAllNotificationsRead();
        patch({ notifications });
        toast.success("All notifications marked as read");
      },
      async runSync() {
        const emr = await api.syncEMR();
        patch({ emr });
        await refreshNotifications();
        toast.success("Sync complete", { description: `Last sync ${emr.lastSync}` });
      },
      async addCampaign(input) {
        const campaigns = await api.createCampaign(input);
        patch({ campaigns });
        await refreshPerformance();
        toast.success("Campaign submitted", { description: "Pending Health Provida approval." });
      },
    };
  }, [state, patch, refreshPerformance, refreshNotifications]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useProvider() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useProvider must be used inside ProviderStoreProvider");
  return ctx;
}

export const TODAY = "2026-08-20";

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}