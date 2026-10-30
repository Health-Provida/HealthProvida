export type VerificationState = "pending" | "verified" | "changes_required" | "rejected";

export type PayerType = "direct_pay" | "hmo";

export type AppointmentStatus =
  | "confirmed"
  | "checked_in"
  | "in_consultation"
  | "completed"
  | "cancelled"
  | "no_show";

export type EncounterStatus = "arrived" | "in_consultation" | "completed" | "checked_out";

export type AuthorizationStatus = "approved" | "manual_review" | "pending" | "declined";

export type ConsultationType = "physical" | "telemedicine";

export interface Hospital {
  id: string;
  name: string;
  facilityType: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  description: string;
  specialties: string[];
  verification: VerificationState;
  verificationNote?: string | undefined;
  photos: FacilityPhoto[];
  visibility: "organic" | "promoted";
}

export interface FacilityPhoto {
  id: string;
  slot: "exterior" | "reception" | "consultation_room";
  label: string;
  url?: string | undefined;
  status: "missing" | "pending_review" | "approved" | "rejected";
  note?: string | undefined;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  consultationType: ConsultationType;
  consultationFee: number;
  active: boolean;
}

export interface Schedule {
  id: string;
  doctorId: string;
  day: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  slots: number;
  status: "active" | "blocked";
}

export interface Patient {
  id: string;
  reference: string;
  initials: string;
  displayName: string;
  sex: "M" | "F";
  ageBand: string;
  payer: PayerType;
  hmoId?: string | undefined;
  plan?: string | undefined;
  policyNumber?: string | undefined;
  eligibility?: "eligible" | "review" | "ineligible" | undefined;
}

export interface Appointment {
  id: string;
  reference: string;
  patientId: string;
  doctorId: string;
  specialty: string;
  date: string;
  time: string;
  appointmentType: string;
  consultationType: ConsultationType;
  payer: PayerType;
  status: AppointmentStatus;
  paymentStatus: "paid" | "unpaid" | "covered" | "pending";
  amount: number;
  notes?: string | undefined;
  checkedInAt?: string | undefined;
  authorizationId?: string | undefined;
}

export interface Encounter {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  arrivalTime: string;
  status: EncounterStatus;
  payer: PayerType;
  completedAt?: string | undefined;
  checkedOutAt?: string | undefined;
}

export interface HMO {
  id: string;
  name: string;
  shortName: string;
  networkStatus: "connected" | "pending" | "not_connected";
  plans: string[];
}

export interface Authorization {
  id: string;
  code?: string | undefined;
  patientId: string;
  hmoId: string;
  plan: string;
  procedure: string;
  procedureCode: string;
  diagnosis: string;
  icd10: string;
  tariff: number;
  estimatedCost: number;
  status: AuthorizationStatus;
  reason?: string | undefined;
  requestedAt: string;
  appointmentId?: string | undefined;
}

export interface ServiceTariff {
  id: string;
  service: string;
  category: string;
  providerPrice: number;
  benchmark: number;
  status: "active" | "inactive";
}

export interface Notification {
  id: string;
  type:
    | "appointment"
    | "check_in"
    | "authorization"
    | "verification"
    | "review"
    | "sync";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface VerificationStep {
  id: string;
  label: string;
  status: "complete" | "in_progress" | "pending";
}

export interface EMRSyncRecord {
  id: string;
  time: string;
  type: string;
  records: number;
  appointments: number;
  status: "success" | "partial" | "failed";
}

export interface EMRSyncState {
  connected: boolean;
  integrationType: string;
  lastSync: string;
  recordsSynced: number;
  appointmentsSynced: number;
  history: EMRSyncRecord[];
}

export interface ProviderPerformance {
  activeBookings: number;
  completedBookings: number;
  patientEncounters: number;
  averageRating: number;
  reviewScore: number;
  popularityScore: number;
  searchVisibility: "high" | "medium" | "low" | "suppressed";
  promotedPlacement: "none" | "pending" | "active";
  monthly: { month: string; bookings: number; encounters: number }[];
}

export interface PromotedCampaign {
  id: string;
  location: string;
  specialty: string;
  placement: string;
  budget: number;
  durationDays: number;
  status: "pending_approval" | "active" | "ended";
  createdAt: string;
}