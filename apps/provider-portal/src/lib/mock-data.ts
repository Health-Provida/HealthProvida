import type {
  Appointment,
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

export const TODAY = "2026-08-20";

export const hospital: Hospital = {
  id: "hosp-001",
  name: "Lifebridge Specialist Hospital",
  facilityType: "Multi-specialist Hospital",
  phone: "+234 802 445 1180",
  email: "operations@lifebridgehospital.ng",
  address: "14 Adeola Odeku Street, Victoria Island",
  state: "Lagos",
  city: "Victoria Island",
  description:
    "A 42-bed multi-specialist facility offering general practice, ophthalmology, cardiology, obstetrics and diagnostic services to patients across Lagos Island.",
  specialties: [
    "General Practice",
    "Ophthalmology",
    "Cardiology",
    "Obstetrics & Gynaecology",
    "Paediatrics",
    "Radiology",
  ],
  verification: "pending",
  verificationNote:
    "Facility documents and imagery received. Awaiting Health Provida admin review.",
  visibility: "organic",
  photos: [
    {
      id: "photo-1",
      slot: "exterior",
      label: "Facility exterior",
      url: "uploaded",
      status: "approved",
    },
    {
      id: "photo-2",
      slot: "reception",
      label: "Reception area",
      url: "uploaded",
      status: "pending_review",
    },
    {
      id: "photo-3",
      slot: "consultation_room",
      label: "Consultation room",
      status: "missing",
      note: "Required for public search visibility.",
    },
  ],
};

export const verificationSteps: VerificationStep[] = [
  { id: "vs-1", label: "Profile Information", status: "complete" },
  { id: "vs-2", label: "Facility Photos", status: "in_progress" },
  { id: "vs-3", label: "HMO Mapping", status: "complete" },
  { id: "vs-4", label: "Admin Review", status: "pending" },
];

export const hmos: HMO[] = [
  {
    id: "hmo-1",
    name: "Reliance Health HMO",
    shortName: "Reliance",
    networkStatus: "connected",
    plans: ["Blue Beta", "Red Beta", "Yellow"],
  },
  {
    id: "hmo-2",
    name: "Hygeia HMO",
    shortName: "Hygeia",
    networkStatus: "connected",
    plans: ["Bronze", "Silver", "Gold"],
  },
  {
    id: "hmo-3",
    name: "AXA Mansard Health",
    shortName: "AXA Mansard",
    networkStatus: "pending",
    plans: ["Essential", "Premium"],
  },
  {
    id: "hmo-4",
    name: "Avon HMO",
    shortName: "Avon",
    networkStatus: "not_connected",
    plans: ["Standard", "Family"],
  },
];

export const doctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Adebayo Ogunlesi",
    title: "Dr.",
    specialty: "General Practice",
    consultationType: "physical",
    consultationFee: 10000,
    active: true,
  },
  {
    id: "doc-2",
    name: "Sarah Umeh",
    title: "Dr.",
    specialty: "Ophthalmology",
    consultationType: "physical",
    consultationFee: 50000,
    active: true,
  },
  {
    id: "doc-3",
    name: "John Aliyu",
    title: "Dr.",
    specialty: "Cardiology",
    consultationType: "physical",
    consultationFee: 65000,
    active: true,
  },
  {
    id: "doc-4",
    name: "Ngozi Okafor",
    title: "Dr.",
    specialty: "Obstetrics & Gynaecology",
    consultationType: "physical",
    consultationFee: 45000,
    active: true,
  },
  {
    id: "doc-5",
    name: "Ibrahim Danladi",
    title: "Dr.",
    specialty: "Paediatrics",
    consultationType: "telemedicine",
    consultationFee: 20000,
    active: false,
  },
];

export const schedules: Schedule[] = [
  { id: "sch-1", doctorId: "doc-1", day: "Monday", startTime: "09:00", endTime: "12:00", slotDuration: 30, slots: 6, status: "active" },
  { id: "sch-2", doctorId: "doc-1", day: "Thursday", startTime: "09:00", endTime: "10:00", slotDuration: 15, slots: 5, status: "active" },
  { id: "sch-3", doctorId: "doc-2", day: "Thursday", startTime: "10:00", endTime: "11:00", slotDuration: 20, slots: 5, status: "active" },
  { id: "sch-4", doctorId: "doc-3", day: "Thursday", startTime: "11:00", endTime: "12:00", slotDuration: 20, slots: 5, status: "active" },
  { id: "sch-5", doctorId: "doc-4", day: "Thursday", startTime: "14:00", endTime: "16:00", slotDuration: 30, slots: 4, status: "active" },
  { id: "sch-6", doctorId: "doc-2", day: "Tuesday", startTime: "17:00", endTime: "18:00", slotDuration: 12, slots: 5, status: "blocked" },
];

export const patients: Patient[] = [
  { id: "pat-1", reference: "HP-PT-48210", initials: "A.O.", displayName: "Patient A.O.", sex: "F", ageBand: "30-39", payer: "hmo", hmoId: "hmo-1", plan: "Blue Beta", policyNumber: "RLC/2026/884120", eligibility: "eligible" },
  { id: "pat-2", reference: "HP-PT-48211", initials: "C.E.", displayName: "Patient C.E.", sex: "M", ageBand: "40-49", payer: "direct_pay" },
  { id: "pat-3", reference: "HP-PT-48212", initials: "M.B.", displayName: "Patient M.B.", sex: "M", ageBand: "50-59", payer: "hmo", hmoId: "hmo-2", plan: "Gold", policyNumber: "HYG/GLD/551903", eligibility: "eligible" },
  { id: "pat-4", reference: "HP-PT-48213", initials: "T.A.", displayName: "Patient T.A.", sex: "F", ageBand: "20-29", payer: "direct_pay" },
  { id: "pat-5", reference: "HP-PT-48214", initials: "K.I.", displayName: "Patient K.I.", sex: "M", ageBand: "60-69", payer: "hmo", hmoId: "hmo-3", plan: "Premium", policyNumber: "AXA/PRM/210774", eligibility: "review" },
  { id: "pat-6", reference: "HP-PT-48215", initials: "F.Y.", displayName: "Patient F.Y.", sex: "F", ageBand: "30-39", payer: "hmo", hmoId: "hmo-1", plan: "Red Beta", policyNumber: "RLC/2026/889051", eligibility: "eligible" },
  { id: "pat-7", reference: "HP-PT-48216", initials: "O.S.", displayName: "Patient O.S.", sex: "M", ageBand: "10-19", payer: "direct_pay" },
  { id: "pat-8", reference: "HP-PT-48217", initials: "B.N.", displayName: "Patient B.N.", sex: "F", ageBand: "40-49", payer: "hmo", hmoId: "hmo-2", plan: "Silver", policyNumber: "HYG/SLV/338219", eligibility: "eligible" },
  { id: "pat-9", reference: "HP-PT-48218", initials: "D.U.", displayName: "Patient D.U.", sex: "M", ageBand: "20-29", payer: "direct_pay" },
  { id: "pat-10", reference: "HP-PT-48219", initials: "R.A.", displayName: "Patient R.A.", sex: "F", ageBand: "50-59", payer: "hmo", hmoId: "hmo-1", plan: "Yellow", policyNumber: "RLC/2026/771044", eligibility: "eligible" },
];

export const appointments: Appointment[] = [
  { id: "apt-1", reference: "HP-APT-90211", patientId: "pat-1", doctorId: "doc-1", specialty: "General Practice", date: TODAY, time: "09:00", appointmentType: "General Consultation", consultationType: "physical", payer: "hmo", status: "completed", paymentStatus: "covered", amount: 10000, notes: "Follow-up on medication review.", authorizationId: "auth-1" },
  { id: "apt-2", reference: "HP-APT-90212", patientId: "pat-2", doctorId: "doc-1", specialty: "General Practice", date: TODAY, time: "09:30", appointmentType: "General Consultation", consultationType: "physical", payer: "direct_pay", status: "in_consultation", paymentStatus: "paid", amount: 10000 },
  { id: "apt-3", reference: "HP-APT-90213", patientId: "pat-3", doctorId: "doc-2", specialty: "Ophthalmology", date: TODAY, time: "10:00", appointmentType: "Specialist Consultation", consultationType: "physical", payer: "hmo", status: "checked_in", paymentStatus: "covered", amount: 50000, checkedInAt: "09:52", authorizationId: "auth-2" },
  { id: "apt-4", reference: "HP-APT-90214", patientId: "pat-4", doctorId: "doc-2", specialty: "Ophthalmology", date: TODAY, time: "10:20", appointmentType: "Specialist Consultation", consultationType: "physical", payer: "direct_pay", status: "confirmed", paymentStatus: "paid", amount: 50000 },
  { id: "apt-5", reference: "HP-APT-90215", patientId: "pat-5", doctorId: "doc-3", specialty: "Cardiology", date: TODAY, time: "11:00", appointmentType: "Specialist Consultation", consultationType: "physical", payer: "hmo", status: "confirmed", paymentStatus: "pending", amount: 65000, notes: "ECG requested by referring GP." },
  { id: "apt-6", reference: "HP-APT-90216", patientId: "pat-6", doctorId: "doc-3", specialty: "Cardiology", date: TODAY, time: "11:20", appointmentType: "Follow-up", consultationType: "physical", payer: "hmo", status: "confirmed", paymentStatus: "covered", amount: 30000, authorizationId: "auth-3" },
  { id: "apt-7", reference: "HP-APT-90217", patientId: "pat-7", doctorId: "doc-1", specialty: "General Practice", date: TODAY, time: "12:00", appointmentType: "General Consultation", consultationType: "physical", payer: "direct_pay", status: "no_show", paymentStatus: "unpaid", amount: 10000 },
  { id: "apt-8", reference: "HP-APT-90218", patientId: "pat-8", doctorId: "doc-4", specialty: "Obstetrics & Gynaecology", date: TODAY, time: "14:00", appointmentType: "Antenatal Review", consultationType: "physical", payer: "hmo", status: "confirmed", paymentStatus: "covered", amount: 45000 },
  { id: "apt-9", reference: "HP-APT-90219", patientId: "pat-9", doctorId: "doc-1", specialty: "General Practice", date: TODAY, time: "15:00", appointmentType: "General Consultation", consultationType: "telemedicine", payer: "direct_pay", status: "cancelled", paymentStatus: "unpaid", amount: 10000 },
  { id: "apt-10", reference: "HP-APT-90220", patientId: "pat-10", doctorId: "doc-2", specialty: "Ophthalmology", date: "2026-08-21", time: "10:00", appointmentType: "Specialist Consultation", consultationType: "physical", payer: "hmo", status: "confirmed", paymentStatus: "covered", amount: 50000 },
  { id: "apt-11", reference: "HP-APT-90221", patientId: "pat-2", doctorId: "doc-3", specialty: "Cardiology", date: "2026-08-21", time: "11:40", appointmentType: "Follow-up", consultationType: "physical", payer: "direct_pay", status: "confirmed", paymentStatus: "paid", amount: 30000 },
  { id: "apt-12", reference: "HP-APT-90222", patientId: "pat-4", doctorId: "doc-4", specialty: "Obstetrics & Gynaecology", date: "2026-08-22", time: "14:30", appointmentType: "Antenatal Review", consultationType: "physical", payer: "direct_pay", status: "confirmed", paymentStatus: "pending", amount: 45000 },
  { id: "apt-13", reference: "HP-APT-90205", patientId: "pat-3", doctorId: "doc-1", specialty: "General Practice", date: "2026-08-19", time: "09:00", appointmentType: "General Consultation", consultationType: "physical", payer: "hmo", status: "completed", paymentStatus: "covered", amount: 10000 },
  { id: "apt-14", reference: "HP-APT-90206", patientId: "pat-9", doctorId: "doc-2", specialty: "Ophthalmology", date: "2026-08-19", time: "10:40", appointmentType: "Specialist Consultation", consultationType: "physical", payer: "direct_pay", status: "completed", paymentStatus: "paid", amount: 50000 },
];

export const encounters: Encounter[] = [
  { id: "enc-1", appointmentId: "apt-2", patientId: "pat-2", doctorId: "doc-1", arrivalTime: "09:24", status: "in_consultation", payer: "direct_pay" },
  { id: "enc-2", appointmentId: "apt-3", patientId: "pat-3", doctorId: "doc-2", arrivalTime: "09:52", status: "arrived", payer: "hmo" },
  { id: "enc-3", appointmentId: "apt-1", patientId: "pat-1", doctorId: "doc-1", arrivalTime: "08:51", status: "checked_out", payer: "hmo", completedAt: "09:26", checkedOutAt: "09:31" },
];

export const authorizations: Authorization[] = [
  { id: "auth-1", code: "AUTH-2026-77120", patientId: "pat-1", hmoId: "hmo-1", plan: "Blue Beta", procedure: "General Consultation", procedureCode: "GC-001", diagnosis: "Essential hypertension", icd10: "I10", tariff: 10000, estimatedCost: 10000, status: "approved", requestedAt: "20 Aug 2026, 08:55 AM", appointmentId: "apt-1" },
  { id: "auth-2", code: "AUTH-2026-77134", patientId: "pat-3", hmoId: "hmo-2", plan: "Gold", procedure: "Ophthalmic Assessment", procedureCode: "OPH-204", diagnosis: "Primary open-angle glaucoma", icd10: "H40.11", tariff: 50000, estimatedCost: 50000, status: "approved", requestedAt: "20 Aug 2026, 09:40 AM", appointmentId: "apt-3" },
  { id: "auth-3", patientId: "pat-6", hmoId: "hmo-1", plan: "Red Beta", procedure: "Echocardiography", procedureCode: "CAR-118", diagnosis: "Cardiomyopathy, unspecified", icd10: "I42.9", tariff: 30000, estimatedCost: 42000, status: "manual_review", reason: "Tariff mismatch — submitted cost exceeds plan benchmark.", requestedAt: "20 Aug 2026, 10:12 AM", appointmentId: "apt-6" },
];

export const serviceTariffs: ServiceTariff[] = [
  { id: "srv-1", service: "General Consultation", category: "Consultation", providerPrice: 10000, benchmark: 10000, status: "active" },
  { id: "srv-2", service: "Specialist Consultation", category: "Consultation", providerPrice: 50000, benchmark: 50000, status: "active" },
  { id: "srv-3", service: "Follow-up Consultation", category: "Consultation", providerPrice: 30000, benchmark: 25000, status: "active" },
  { id: "srv-4", service: "Echocardiography", category: "Diagnostics", providerPrice: 42000, benchmark: 30000, status: "active" },
  { id: "srv-5", service: "Full Blood Count", category: "Laboratory", providerPrice: 8500, benchmark: 8000, status: "active" },
  { id: "srv-6", service: "Antenatal Review", category: "Obstetrics", providerPrice: 45000, benchmark: 45000, status: "active" },
  { id: "srv-7", service: "Ophthalmic Assessment", category: "Diagnostics", providerPrice: 50000, benchmark: 50000, status: "active" },
  { id: "srv-8", service: "Abdominal Ultrasound", category: "Radiology", providerPrice: 25000, benchmark: 22000, status: "inactive" },
];

export const notifications: Notification[] = [
  { id: "ntf-1", type: "appointment", title: "New appointment booked", body: "Patient HP-PT-48219 booked Ophthalmology with Dr. Sarah Umeh for 21 Aug, 10:00.", time: "8 min ago", read: false },
  { id: "ntf-2", type: "authorization", title: "Authorization requires review", body: "Echocardiography for HP-PT-48215 flagged: tariff mismatch.", time: "26 min ago", read: false },
  { id: "ntf-3", type: "check_in", title: "Patient checked in", body: "HP-PT-48212 checked in at 09:52 for Ophthalmology.", time: "1 hr ago", read: false },
  { id: "ntf-4", type: "authorization", title: "Authorization approved", body: "AUTH-2026-77134 approved by Hygeia HMO.", time: "1 hr ago", read: true },
  { id: "ntf-5", type: "verification", title: "Verification changes requested", body: "Consultation room photograph is still outstanding.", time: "Yesterday", read: true },
  { id: "ntf-6", type: "review", title: "New provider review", body: "Patient HP-PT-48211 rated your facility 5.0.", time: "Yesterday", read: true },
  { id: "ntf-7", type: "sync", title: "EMR sync completed", body: "1,284 records and 342 appointments synchronised.", time: "2 days ago", read: true },
];

export const emrSync: EMRSyncState = {
  connected: true,
  integrationType: "Health Provida EMR Bridge (simulated)",
  lastSync: "20 Aug 2026, 11:32 AM",
  recordsSynced: 1284,
  appointmentsSynced: 342,
  history: [
    { id: "sync-1", time: "20 Aug 2026, 11:32 AM", type: "Scheduled", records: 128, appointments: 34, status: "success" },
    { id: "sync-2", time: "20 Aug 2026, 07:02 AM", type: "Scheduled", records: 96, appointments: 21, status: "success" },
    { id: "sync-3", time: "19 Aug 2026, 06:58 PM", type: "Manual", records: 143, appointments: 40, status: "partial" },
    { id: "sync-4", time: "19 Aug 2026, 11:30 AM", type: "Scheduled", records: 117, appointments: 29, status: "success" },
    { id: "sync-5", time: "18 Aug 2026, 11:31 AM", type: "Scheduled", records: 0, appointments: 0, status: "failed" },
  ],
};

export const performance: ProviderPerformance = {
  activeBookings: 38,
  completedBookings: 264,
  patientEncounters: 241,
  averageRating: 4.6,
  reviewScore: 4.6,
  popularityScore: 0,
  searchVisibility: "suppressed",
  promotedPlacement: "none",
  monthly: [
    { month: "Mar", bookings: 148, encounters: 131 },
    { month: "Apr", bookings: 162, encounters: 149 },
    { month: "May", bookings: 173, encounters: 158 },
    { month: "Jun", bookings: 191, encounters: 176 },
    { month: "Jul", bookings: 208, encounters: 194 },
    { month: "Aug", bookings: 226, encounters: 211 },
  ],
};

export const campaigns: PromotedCampaign[] = [];

export const specialtyOptions = [
  "General Practice",
  "Ophthalmology",
  "Cardiology",
  "Obstetrics & Gynaecology",
  "Paediatrics",
  "Radiology",
  "Dermatology",
  "Orthopaedics",
  "ENT",
  "Dentistry",
  "Endocrinology",
  "Neurology",
];