// Domain types for the Health Provida Super Admin Portal.
// The mock repository in `services.ts` implements these contracts so a real
// REST/API layer can be swapped in without touching page components.

export type Region =
  | "South-West"
  | "South-South"
  | "South-East"
  | "North-Central"
  | "North-West"
  | "North-East";

export type VerificationStatus =
  | "Submitted"
  | "Under Review"
  | "Verified"
  | "Rejected"
  | "Changes Required";

export type ProviderStatus = "Active" | "Suspended" | "Pending" | "Inactive";
export type ProviderType =
  | "General Hospital"
  | "Specialist Clinic"
  | "Diagnostic Laboratory"
  | "Primary Care Clinic"
  | "Teaching Hospital";
export type Visibility = "Public" | "Hidden" | "Promoted";
export type PhotoStatus = "Approved" | "Pending" | "Rejected";

export interface ProviderPhoto {
  id: string;
  label: string;
  category: "Exterior" | "Reception" | "Consultation Room" | "Ward" | "Laboratory";
  status: PhotoStatus;
  uploadedAt: string;
  note?: string;
}

export interface HmoMatch {
  hmoId: string;
  hmoName: string;
  status: "Matched" | "Pending" | "Silent Network";
  plans: string[];
}

export interface ProviderReview {
  id: string;
  patientRef: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  city: string;
  state: string;
  region: Region;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
  status: ProviderStatus;
  verification: VerificationStatus;
  visibility: Visibility;
  hmoNetworks: number;
  dateAdded: string;
  submittedAt: string;
  /** Popularity = (activeBookings x .4) + (timestampedEncounters x .3) + (avgRating x .3) */
  activeBookings: number;
  completedEncounters: number;
  averageRating: number;
  reviewCount: number;
  popularityScore: number;
  photos: ProviderPhoto[];
  hmoMatches: HmoMatch[];
  reviews: ProviderReview[];
  auditScore: number;
  lastAuditedAt: string;
  rejectionReason?: string;
  adminComments?: string;
}

export type TariffCategory = "Consultation" | "Laboratory" | "Procedures";
export type TariffStatus = "Active" | "Draft" | "Under Review" | "Retired";

export interface TariffHistoryPoint {
  date: string;
  benchmark: number;
}

export interface Tariff {
  id: string;
  service: string;
  code: string;
  category: TariffCategory;
  region: Region;
  state: string;
  benchmark: number;
  min: number;
  max: number;
  status: TariffStatus;
  effectiveDate: string;
  updatedAt: string;
  updatedBy: string;
  providersUsing: number;
  history: TariffHistoryPoint[];
}

export type TariffInput = Omit<
  Tariff,
  "id" | "updatedAt" | "updatedBy" | "providersUsing" | "history"
>;

export type HmoPlan = "FREE" | "PREMIUM";
export type HmoStatus = "Active" | "Trial" | "Past Due" | "Churned";

export interface HmoAccount {
  id: string;
  name: string;
  members: number;
  networkProviders: number;
  plan: HmoPlan;
  status: HmoStatus;
  monthlyRevenue: number;
  renewalDate: string;
  contact: string;
  authorizationLatencyMins: number;
}

export type CampaignStatus = "Pending" | "Active" | "Paused" | "Expired" | "Rejected";
export type Placement = "Featured Top Placement" | "Category Spotlight" | "Search Boost";
export type BidModel = "CPC" | "Monthly Sponsorship";

export interface Campaign {
  id: string;
  providerId: string;
  provider: string;
  specialty: string;
  location: string;
  campaign: string;
  placement: Placement;
  model: BidModel;
  budget: number;
  bid: number;
  reservePrice: number;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
}

export type EncounterStatus = "Waiting" | "In Consultation" | "Completed" | "High Wait Time";
export type Payer = "DIRECT PAY" | "HMO COVERED";

export interface Encounter {
  id: string;
  hospital: string;
  patientRef: string;
  type: string;
  payer: Payer;
  hmo?: string;
  checkInTime: string;
  waitMinutes: number;
  status: EncounterStatus;
}

export type TransactionChannel =
  | "Consultation Commission"
  | "Laboratory Margin"
  | "Promoted Placement"
  | "HMO SaaS"
  | "No-show Fee";

export interface Transaction {
  id: string;
  reference: string;
  counterparty: string;
  channel: TransactionChannel;
  gross: number;
  platformRevenue: number;
  status: "Settled" | "Pending" | "Reversed";
  date: string;
  method: "Card" | "Transfer" | "HMO Settlement" | "Wallet";
}

export interface AdminAction {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  entity: string;
  entityId: string;
  previousStatus: string;
  newStatus: string;
  device: string;
  details: string;
}

export interface PlatformNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  kind: "verification" | "tariff" | "sponsored" | "hmo" | "audit";
  unread: boolean;
}

export interface EcosystemEvent {
  id: string;
  timestamp: string;
  entity: string;
  action: string;
  status: "Success" | "Pending" | "Rejected" | "Info";
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  change: number;
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Governance Analyst" | "Tariff Manager" | "Monetization Lead";
  status: "Active" | "Invited" | "Disabled";
  lastActive: string;
}

export interface SeriesPoint {
  label: string;
  [key: string]: string | number;
}
