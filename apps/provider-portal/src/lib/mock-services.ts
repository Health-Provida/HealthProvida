/**
 * Mock service layer.
 *
 * Every function here is async and returns plain data, so each one can later be
 * swapped for a real API/server-function call without touching UI code.
 */
import * as seed from "./mock-data";
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

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const db = {
  hospital: clone(seed.hospital),
  verificationSteps: clone(seed.verificationSteps),
  doctors: clone(seed.doctors),
  schedules: clone(seed.schedules),
  patients: clone(seed.patients),
  appointments: clone(seed.appointments),
  encounters: clone(seed.encounters),
  hmos: clone(seed.hmos),
  authorizations: clone(seed.authorizations),
  tariffs: clone(seed.serviceTariffs),
  notifications: clone(seed.notifications),
  emr: clone(seed.emrSync),
  performance: clone(seed.performance),
  campaigns: clone(seed.campaigns) as PromotedCampaign[],
};

export const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));
const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function clockTime(date = new Date()) {
  return date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function hhmm(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function pushNotification(n: Omit<Notification, "id" | "time" | "read">) {
  db.notifications.unshift({ ...n, id: id("ntf"), time: "Just now", read: false });
}

/* ---------------------------------- reads --------------------------------- */

export async function getHospital(): Promise<Hospital> {
  await delay(200);
  return clone(db.hospital);
}
export async function getVerificationSteps(): Promise<VerificationStep[]> {
  await delay(150);
  return clone(db.verificationSteps);
}
export async function getDoctors(): Promise<Doctor[]> {
  await delay(200);
  return clone(db.doctors);
}
export async function getSchedules(): Promise<Schedule[]> {
  await delay(200);
  return clone(db.schedules);
}
export async function getPatients(): Promise<Patient[]> {
  await delay(150);
  return clone(db.patients);
}
export async function getAppointments(): Promise<Appointment[]> {
  await delay(250);
  return clone(db.appointments);
}
export async function getAppointmentById(appointmentId: string): Promise<Appointment | undefined> {
  await delay(150);
  return clone(db.appointments.find((a) => a.id === appointmentId));
}
export async function getEncounters(): Promise<Encounter[]> {
  await delay(200);
  return clone(db.encounters);
}
export async function getHMOs(): Promise<HMO[]> {
  await delay(150);
  return clone(db.hmos);
}
export async function getAuthorizations(): Promise<Authorization[]> {
  await delay(200);
  return clone(db.authorizations);
}
export async function getTariffs(): Promise<ServiceTariff[]> {
  await delay(200);
  return clone(db.tariffs);
}
export async function getNotifications(): Promise<Notification[]> {
  await delay(150);
  return clone(db.notifications);
}
export async function getEMRSync(): Promise<EMRSyncState> {
  await delay(200);
  return clone(db.emr);
}
export async function getPerformance(): Promise<ProviderPerformance> {
  await delay(200);
  const p = db.performance;
  p.patientEncounters = seed.performance.patientEncounters + db.encounters.filter((e) => e.status === "completed" || e.status === "checked_out").length;
  p.popularityScore = Number(
    (p.activeBookings * 0.4 + p.patientEncounters * 0.3 + p.averageRating * 0.3).toFixed(1),
  );
  p.searchVisibility = db.hospital.verification === "verified" ? "high" : "suppressed";
  p.promotedPlacement =
    db.campaigns.length === 0
      ? "none"
      : db.campaigns.some((c) => c.status === "active")
        ? "active"
        : "pending";
  return clone(p);
}
export async function getCampaigns(): Promise<PromotedCampaign[]> {
  await delay(150);
  return clone(db.campaigns);
}

/* --------------------------------- writes --------------------------------- */

export async function updateHospital(patch: Partial<Hospital>): Promise<Hospital> {
  await delay(600);
  db.hospital = { ...db.hospital, ...patch };
  return clone(db.hospital);
}

export async function uploadFacilityPhoto(slot: string): Promise<Hospital> {
  await delay(900);
  db.hospital.photos = db.hospital.photos.map((p) =>
    p.slot === slot ? { ...p, url: "uploaded", status: "pending_review", note: undefined } : p,
  );
  if (db.hospital.photos.every((p) => p.status !== "missing")) {
    db.verificationSteps = db.verificationSteps.map((s) =>
      s.id === "vs-2" ? { ...s, status: "complete" } : s.id === "vs-4" ? { ...s, status: "in_progress" } : s,
    );
  }
  return clone(db.hospital);
}

export async function submitForVerification(): Promise<Hospital> {
  await delay(1200);
  const ready = db.hospital.photos.every((p) => p.status !== "missing");
  db.hospital.verification = ready ? "verified" : "changes_required";
  db.hospital.verificationNote = ready
    ? "Your facility is verified and eligible for public search visibility."
    : "Consultation room photograph is required before verification can be completed.";
  if (ready) {
    db.verificationSteps = db.verificationSteps.map((s) => ({ ...s, status: "complete" }));
    db.hospital.photos = db.hospital.photos.map((p) => ({ ...p, status: "approved" }));
    pushNotification({
      type: "verification",
      title: "Verification approved",
      body: "Your facility is verified and now eligible for public search visibility.",
    });
  } else {
    pushNotification({
      type: "verification",
      title: "Verification changes requested",
      body: "Upload the outstanding facility photographs to complete verification.",
    });
  }
  return clone(db.hospital);
}

export async function createDoctor(input: Omit<Doctor, "id">): Promise<Doctor> {
  await delay(700);
  const doctor: Doctor = { ...input, id: id("doc") };
  db.doctors.push(doctor);
  return clone(doctor);
}

export async function updateDoctor(doctorId: string, patch: Partial<Doctor>): Promise<Doctor[]> {
  await delay(500);
  db.doctors = db.doctors.map((d) => (d.id === doctorId ? { ...d, ...patch } : d));
  return clone(db.doctors);
}

export async function createSchedule(input: Omit<Schedule, "id">): Promise<Schedule[]> {
  await delay(600);
  db.schedules.push({ ...input, id: id("sch") });
  return clone(db.schedules);
}

export async function updateSchedule(scheduleId: string, patch: Partial<Schedule>): Promise<Schedule[]> {
  await delay(450);
  db.schedules = db.schedules.map((s) => (s.id === scheduleId ? { ...s, ...patch } : s));
  return clone(db.schedules);
}

export async function deleteSchedule(scheduleId: string): Promise<Schedule[]> {
  await delay(450);
  db.schedules = db.schedules.filter((s) => s.id !== scheduleId);
  return clone(db.schedules);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<Appointment[]> {
  await delay(500);
  db.appointments = db.appointments.map((a) => (a.id === appointmentId ? { ...a, status } : a));
  return clone(db.appointments);
}

export async function rescheduleAppointment(
  appointmentId: string,
  date: string,
  time: string,
): Promise<Appointment[]> {
  await delay(600);
  db.appointments = db.appointments.map((a) =>
    a.id === appointmentId ? { ...a, date, time, status: "confirmed" as AppointmentStatus } : a,
  );
  return clone(db.appointments);
}

export async function checkInAppointment(
  appointmentId: string,
): Promise<{ appointments: Appointment[]; encounters: Encounter[]; checkedInAt: string }> {
  await delay(800);
  const now = new Date();
  const appointment = db.appointments.find((a) => a.id === appointmentId);
  if (!appointment) throw new Error("Appointment not found");
  appointment.status = "checked_in";
  appointment.checkedInAt = hhmm(now);
  const encounter = await createEncounter(appointment);
  pushNotification({
    type: "check_in",
    title: "Patient checked in",
    body: `${db.patients.find((p) => p.id === appointment.patientId)?.reference} checked in at ${clockTime(now)}.`,
  });
  return {
    appointments: clone(db.appointments),
    encounters: clone(db.encounters),
    checkedInAt: clockTime(now),
  };
}

export async function createEncounter(appointment: Appointment): Promise<Encounter> {
  const existing = db.encounters.find((e) => e.appointmentId === appointment.id);
  if (existing) return clone(existing);
  const encounter: Encounter = {
    id: id("enc"),
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    arrivalTime: hhmm(),
    status: "arrived",
    payer: appointment.payer,
  };
  db.encounters.push(encounter);
  return clone(encounter);
}

export async function startConsultation(
  encounterId: string,
): Promise<{ encounters: Encounter[]; appointments: Appointment[] }> {
  await delay(500);
  const encounter = db.encounters.find((e) => e.id === encounterId);
  if (encounter) {
    encounter.status = "in_consultation";
    db.appointments = db.appointments.map((a) =>
      a.id === encounter.appointmentId ? { ...a, status: "in_consultation" as AppointmentStatus } : a,
    );
  }
  return { encounters: clone(db.encounters), appointments: clone(db.appointments) };
}

export async function completeEncounter(
  encounterId: string,
): Promise<{ encounters: Encounter[]; appointments: Appointment[] }> {
  await delay(600);
  const encounter = db.encounters.find((e) => e.id === encounterId);
  if (encounter) {
    encounter.status = "completed";
    encounter.completedAt = hhmm();
    db.appointments = db.appointments.map((a) =>
      a.id === encounter.appointmentId ? { ...a, status: "completed" as AppointmentStatus } : a,
    );
  }
  return { encounters: clone(db.encounters), appointments: clone(db.appointments) };
}

export async function checkOutEncounter(encounterId: string): Promise<Encounter[]> {
  await delay(500);
  const encounter = db.encounters.find((e) => e.id === encounterId);
  if (encounter) {
    encounter.status = "checked_out";
    encounter.checkedOutAt = hhmm();
  }
  return clone(db.encounters);
}

export interface AuthorizationInput {
  patientId: string;
  appointmentId?: string;
  hmoId: string;
  plan: string;
  procedure: string;
  procedureCode: string;
  diagnosis: string;
  icd10: string;
  tariff: number;
  estimatedCost: number;
}

const manualReviewReasons = [
  "Tariff mismatch — submitted cost exceeds the plan benchmark.",
  "Policy exception — procedure requires HMO case manager sign-off.",
  "Non-covered service under the patient's current plan.",
  "Additional clinical review required before approval.",
];

/**
 * Simulated rule-based review: procedure code + diagnosis are validated against
 * the plan tariff. Compliant requests auto-approve, others fall to manual review.
 */
export async function requestAuthorization(input: AuthorizationInput): Promise<Authorization> {
  await delay(2400);
  const compliant = input.estimatedCost <= input.tariff;
  const record: Authorization = {
    id: id("auth"),
    patientId: input.patientId,
    appointmentId: input.appointmentId,
    hmoId: input.hmoId,
    plan: input.plan,
    procedure: input.procedure,
    procedureCode: input.procedureCode,
    diagnosis: input.diagnosis,
    icd10: input.icd10,
    tariff: input.tariff,
    estimatedCost: input.estimatedCost,
    status: compliant ? "approved" : "manual_review",
    code: compliant ? `AUTH-2026-${Math.floor(10000 + Math.random() * 89999)}` : undefined,
    reason: compliant ? undefined : manualReviewReasons[Math.floor(Math.random() * manualReviewReasons.length)],
    requestedAt: `20 Aug 2026, ${clockTime()}`,
  };
  db.authorizations.unshift(record);
  if (input.appointmentId) {
    db.appointments = db.appointments.map((a) =>
      a.id === input.appointmentId ? { ...a, authorizationId: record.id } : a,
    );
  }
  pushNotification({
    type: "authorization",
    title: compliant ? "HMO authorization approved" : "HMO authorization requires review",
    body: compliant
      ? `${record.code} approved for ${record.procedure}.`
      : `${record.procedure} flagged: ${record.reason}`,
  });
  return clone(record);
}

export async function updateTariff(tariffId: string, patch: Partial<ServiceTariff>): Promise<ServiceTariff[]> {
  await delay(450);
  db.tariffs = db.tariffs.map((t) => (t.id === tariffId ? { ...t, ...patch } : t));
  return clone(db.tariffs);
}

export async function markNotificationRead(notificationId: string): Promise<Notification[]> {
  await delay(150);
  db.notifications = db.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  return clone(db.notifications);
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  await delay(250);
  db.notifications = db.notifications.map((n) => ({ ...n, read: true }));
  return clone(db.notifications);
}

export async function syncEMR(): Promise<EMRSyncState> {
  await delay(2200);
  const records = 80 + Math.floor(Math.random() * 90);
  const appts = 12 + Math.floor(Math.random() * 30);
  db.emr.recordsSynced += records;
  db.emr.appointmentsSynced += appts;
  db.emr.lastSync = `20 Aug 2026, ${clockTime()}`;
  db.emr.history.unshift({
    id: id("sync"),
    time: db.emr.lastSync,
    type: "Manual",
    records,
    appointments: appts,
    status: "success",
  });
  pushNotification({
    type: "sync",
    title: "EMR sync completed",
    body: `${records} records and ${appts} appointments synchronised.`,
  });
  return clone(db.emr);
}

export async function createCampaign(
  input: Omit<PromotedCampaign, "id" | "status" | "createdAt">,
): Promise<PromotedCampaign[]> {
  await delay(900);
  db.campaigns.unshift({
    ...input,
    id: id("cmp"),
    status: "pending_approval",
    createdAt: "20 Aug 2026",
  });
  return clone(db.campaigns);
}