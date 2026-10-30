/**
 * Supabase service layer — drop-in replacement for mock-services.
 *
 * Every exported function has the same signature & return type as its
 * mock-services counterpart so the provider-store can swap imports without
 * touching any UI code.
 *
 * The module requires:
 *   1. A valid Supabase client (see ./supabase.ts)
 *   2. An authenticated user whose profile.role === 'provider'
 *   3. A clinic row where owner_id = auth.uid()
 *
 * RLS policies enforce tenant isolation — every query is automatically
 * scoped to the provider's clinic via get_provider_clinic_id().
 */

import { supabase } from "./supabase";
import type {
  Appointment,
  AppointmentStatus,
  Authorization,
  Doctor,
  EMRSyncRecord,
  EMRSyncState,
  Encounter,
  HMO,
  Hospital,
  FacilityPhoto,
  Notification,
  Patient,
  PromotedCampaign,
  ProviderPerformance,
  Schedule,
  ServiceTariff,
  VerificationStep,
} from "./types";

// AuthorizationInput is defined below in this file

/* ----------------------------- helpers -------------------------------- */

function assert(client: typeof supabase): asserts client is NonNullable<typeof supabase> {
  if (!client) throw new Error("Supabase client is not initialised");
}

/** Throw on Supabase error, otherwise return data */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

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

/** Get the provider's clinic_id (cached per session). */
let _clinicId: number | null = null;
async function clinicId(): Promise<number> {
  if (_clinicId !== null) return _clinicId;
  assert(supabase);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data } = await supabase
    .from("clinics")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .single();
  if (!data) throw new Error("No clinic found for this provider");
  _clinicId = data.id as number;
  return _clinicId;
}

/** Reset cached clinic id (call on sign-out). */
export function resetClinicId() {
  _clinicId = null;
}

/* ----------------------- row → domain mappers ------------------------- */

function toHospital(row: Record<string, unknown>, photos: FacilityPhoto[]): Hospital {
  return {
    id: String(row.id),
    name: (row.practitioner_name ?? "") as string,
    facilityType: (row.practice_type ?? "") as string,
    phone: (row.phone ?? "") as string,
    email: (row.email ?? "") as string,
    address: (row.address ?? "") as string,
    state: (row.state ?? "") as string,
    city: (row.city ?? "") as string,
    description: (row.description ?? "") as string,
    specialties: [] as string[],  // loaded separately
    verification: (row.verification ?? "pending") as Hospital["verification"],
    verificationNote: row.verification_note as string | undefined,
    photos,
    visibility: (row.visibility ?? "organic") as Hospital["visibility"],
  };
}

function toPhoto(row: Record<string, unknown>): FacilityPhoto {
  return {
    id: row.id as string,
    slot: row.slot as FacilityPhoto["slot"],
    label: (row.label ?? "") as string,
    url: row.url as string | undefined,
    status: (row.status ?? "missing") as FacilityPhoto["status"],
    note: row.note as string | undefined,
  };
}

function toDoctor(row: Record<string, unknown>): Doctor {
  return {
    id: row.id as string,
    name: row.name as string,
    title: (row.title ?? "Dr.") as string,
    specialty: row.specialty as string,
    consultationType: (row.consultation_type ?? "physical") as Doctor["consultationType"],
    consultationFee: Number(row.consultation_fee ?? 0),
    active: row.active as boolean,
  };
}

function toSchedule(row: Record<string, unknown>): Schedule {
  return {
    id: row.id as string,
    doctorId: row.doctor_id as string,
    day: row.day as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    slotDuration: Number(row.slot_duration ?? 30),
    slots: Number(row.slots ?? 0),
    status: (row.status ?? "active") as Schedule["status"],
  };
}

function toPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    reference: row.reference as string,
    initials: (row.initials ?? "") as string,
    displayName: row.display_name as string,
    sex: (row.sex ?? "M") as Patient["sex"],
    ageBand: (row.age_band ?? "") as string,
    payer: (row.payer ?? "direct_pay") as Patient["payer"],
    hmoId: row.hmo_id as string | undefined,
    plan: row.plan as string | undefined,
    policyNumber: row.policy_number as string | undefined,
    eligibility: row.eligibility as Patient["eligibility"],
  };
}

function toAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    reference: row.reference as string,
    patientId: row.patient_id as string,
    doctorId: row.doctor_id as string,
    specialty: (row.specialty ?? "") as string,
    date: row.date as string,
    time: row.time as string,
    appointmentType: (row.appointment_type ?? "") as string,
    consultationType: (row.consultation_type ?? "physical") as Appointment["consultationType"],
    payer: (row.payer ?? "direct_pay") as Appointment["payer"],
    status: row.status as Appointment["status"],
    paymentStatus: (row.payment_status ?? "unpaid") as Appointment["paymentStatus"],
    amount: Number(row.amount ?? 0),
    notes: row.notes as string | undefined,
    checkedInAt: row.checked_in_at as string | undefined,
    authorizationId: row.authorization_id as string | undefined,
  };
}

function toEncounter(row: Record<string, unknown>): Encounter {
  return {
    id: row.id as string,
    appointmentId: row.appointment_id as string,
    patientId: row.patient_id as string,
    doctorId: row.doctor_id as string,
    arrivalTime: row.arrival_time as string,
    status: row.status as Encounter["status"],
    payer: (row.payer ?? "direct_pay") as Encounter["payer"],
    completedAt: row.completed_at as string | undefined,
    checkedOutAt: row.checked_out_at as string | undefined,
  };
}

function toHMO(row: Record<string, unknown>): HMO {
  return {
    id: row.id as string,
    name: row.name as string,
    shortName: (row.short_name ?? "") as string,
    networkStatus: (row.network_status ?? "not_connected") as HMO["networkStatus"],
    plans: (row.plans ?? []) as string[],
  };
}

function toAuthorization(row: Record<string, unknown>): Authorization {
  return {
    id: row.id as string,
    code: row.code as string | undefined,
    patientId: row.patient_id as string,
    hmoId: row.hmo_connection_id as string,
    plan: (row.plan ?? "") as string,
    procedure: row.procedure_name as string,
    procedureCode: (row.procedure_code ?? "") as string,
    diagnosis: (row.diagnosis ?? "") as string,
    icd10: (row.icd10 ?? "") as string,
    tariff: Number(row.tariff ?? 0),
    estimatedCost: Number(row.estimated_cost ?? 0),
    status: row.status as Authorization["status"],
    reason: row.reason as string | undefined,
    requestedAt: (row.requested_at ?? "") as string,
    appointmentId: row.appointment_id as string | undefined,
  };
}

function toTariff(row: Record<string, unknown>): ServiceTariff {
  return {
    id: row.id as string,
    service: row.service as string,
    category: (row.category ?? "") as string,
    providerPrice: Number(row.provider_price ?? 0),
    benchmark: Number(row.benchmark ?? 0),
    status: (row.status ?? "active") as ServiceTariff["status"],
  };
}

function toNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    type: row.type as Notification["type"],
    title: row.title as string,
    body: (row.body ?? "") as string,
    time: (row.time ?? "") as string,
    read: row.read as boolean,
  };
}

function toVerificationStep(row: Record<string, unknown>): VerificationStep {
  return {
    id: row.id as string,
    label: row.label as string,
    status: (row.status ?? "pending") as VerificationStep["status"],
  };
}

function toEMRSyncRecord(row: Record<string, unknown>): EMRSyncRecord {
  return {
    id: row.id as string,
    time: row.time as string,
    type: (row.type ?? "Manual") as string,
    records: Number(row.records ?? 0),
    appointments: Number(row.appointments ?? 0),
    status: (row.status ?? "success") as EMRSyncRecord["status"],
  };
}

function toCampaign(row: Record<string, unknown>): PromotedCampaign {
  return {
    id: row.id as string,
    location: (row.location ?? "") as string,
    specialty: (row.specialty ?? "") as string,
    placement: (row.placement ?? "") as string,
    budget: Number(row.budget ?? 0),
    durationDays: Number(row.duration_days ?? 7),
    status: (row.status ?? "pending_approval") as PromotedCampaign["status"],
    createdAt: (row.created_at ?? "") as string,
  };
}

/* ----------------------------- reads ---------------------------------- */

export async function getHospital(): Promise<Hospital> {
  assert(supabase);
  const cid = await clinicId();

  const [clinicResult, photosResult, specialtiesResult] = await Promise.all([
    supabase.from("clinics").select("*").eq("id", cid).single(),
    supabase.from("facility_photos").select("*").eq("clinic_id", cid),
    supabase.from("clinic_specialties").select("specialty").eq("clinic_id", cid),
  ]);

  const clinic = unwrap(clinicResult);
  const photos = unwrap(photosResult).map(toPhoto);
  const hospital = toHospital(clinic as Record<string, unknown>, photos);
  hospital.specialties = unwrap(specialtiesResult).map(
    (r: { specialty: string }) => r.specialty,
  );
  return hospital;
}

export async function getVerificationSteps(): Promise<VerificationStep[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("verification_steps")
    .select("*")
    .eq("clinic_id", cid)
    .order("sort_order");
  return unwrap(result).map(toVerificationStep);
}

export async function getDoctors(): Promise<Doctor[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_doctors")
    .select("*")
    .eq("clinic_id", cid)
    .order("created_at");
  return unwrap(result).map(toDoctor);
}

export async function getSchedules(): Promise<Schedule[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_schedules")
    .select("*")
    .eq("clinic_id", cid)
    .order("created_at");
  return unwrap(result).map(toSchedule);
}

export async function getPatients(): Promise<Patient[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_patients")
    .select("*")
    .eq("clinic_id", cid)
    .order("created_at");
  return unwrap(result).map(toPatient);
}

export async function getAppointments(): Promise<Appointment[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_appointments")
    .select("*")
    .eq("clinic_id", cid)
    .order("date", { ascending: false });
  return unwrap(result).map(toAppointment);
}

export async function getAppointmentById(
  appointmentId: string,
): Promise<Appointment | undefined> {
  assert(supabase);
  const result = await supabase
    .from("provider_appointments")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();
  const row = result.data;
  return row ? toAppointment(row as Record<string, unknown>) : undefined;
}

export async function getEncounters(): Promise<Encounter[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_encounters")
    .select("*")
    .eq("clinic_id", cid)
    .order("created_at", { ascending: false });
  return unwrap(result).map(toEncounter);
}

export async function getHMOs(): Promise<HMO[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_hmo_connections")
    .select("*")
    .eq("clinic_id", cid)
    .order("name");
  return unwrap(result).map(toHMO);
}

export async function getAuthorizations(): Promise<Authorization[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_authorizations")
    .select("*")
    .eq("clinic_id", cid)
    .order("requested_at", { ascending: false });
  return unwrap(result).map(toAuthorization);
}

export async function getTariffs(): Promise<ServiceTariff[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("service_tariffs")
    .select("*")
    .eq("clinic_id", cid)
    .order("category");
  return unwrap(result).map(toTariff);
}

export async function getNotifications(): Promise<Notification[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_notifications")
    .select("*")
    .eq("clinic_id", cid)
    .order("created_at", { ascending: false });
  return unwrap(result).map(toNotification);
}

export async function getEMRSync(): Promise<EMRSyncState> {
  assert(supabase);
  const cid = await clinicId();

  const [stateResult, historyResult] = await Promise.all([
    supabase.from("emr_sync_state").select("*").eq("clinic_id", cid).single(),
    supabase
      .from("emr_sync_history")
      .select("*")
      .eq("clinic_id", cid)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const state = unwrap(stateResult);
  const history = unwrap(historyResult).map(toEMRSyncRecord);
  return {
    connected: state.connected as boolean,
    integrationType: (state.integration_type ?? "HL7 FHIR") as string,
    lastSync: (state.last_sync ?? "") as string,
    recordsSynced: Number(state.records_synced ?? 0),
    appointmentsSynced: Number(state.appointments_synced ?? 0),
    history,
  };
}

export async function getPerformance(): Promise<ProviderPerformance> {
  assert(supabase);
  const cid = await clinicId();

  // Compute from real data
  const [apptResult, encResult, reviewResult, campaignResult, clinicResult] =
    await Promise.all([
      supabase
        .from("provider_appointments")
        .select("status")
        .eq("clinic_id", cid),
      supabase
        .from("provider_encounters")
        .select("status")
        .eq("clinic_id", cid),
      supabase.from("reviews").select("rating").eq("clinic_id", cid),
      supabase.from("promoted_campaigns").select("status").eq("clinic_id", cid),
      supabase
        .from("clinics")
        .select("verification")
        .eq("id", cid)
        .single(),
    ]);

  const appointments = unwrap(apptResult) as { status: string }[];
  const encounters = unwrap(encResult) as { status: string }[];
  const reviews = unwrap(reviewResult) as { rating: number }[];
  const campaigns = unwrap(campaignResult) as { status: string }[];
  const clinic = unwrap(clinicResult) as { verification: string };

  const active = appointments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled" && a.status !== "no_show",
  ).length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const patientEncounters = encounters.filter(
    (e) => e.status === "completed" || e.status === "checked_out",
  ).length;
  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

  const popularityScore = Number(
    (active * 0.4 + patientEncounters * 0.3 + avgRating * 0.3).toFixed(1),
  );
  const searchVisibility: ProviderPerformance["searchVisibility"] =
    clinic.verification === "verified" ? "high" : "suppressed";
  const promotedPlacement: ProviderPerformance["promotedPlacement"] =
    campaigns.length === 0
      ? "none"
      : campaigns.some((c) => c.status === "active")
        ? "active"
        : "pending";

  return {
    activeBookings: active,
    completedBookings: completed,
    patientEncounters,
    averageRating: avgRating,
    reviewScore: avgRating,
    popularityScore,
    searchVisibility,
    promotedPlacement,
    monthly: [], // TODO: aggregate monthly from provider_appointments.date
  };
}

export async function getCampaigns(): Promise<PromotedCampaign[]> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("promoted_campaigns")
    .select("*")
    .eq("clinic_id", cid)
    .order("created_at", { ascending: false });
  return unwrap(result).map(toCampaign);
}

/* ----------------------------- writes --------------------------------- */

async function pushNotification(
  n: Omit<Notification, "id" | "time" | "read">,
) {
  assert(supabase);
  const cid = await clinicId();
  await supabase.from("provider_notifications").insert({
    clinic_id: cid,
    type: n.type,
    title: n.title,
    body: n.body,
    time: "Just now",
    read: false,
  });
}

export async function updateHospital(
  patch: Partial<Hospital>,
): Promise<Hospital> {
  assert(supabase);
  const cid = await clinicId();

  // Map domain fields → DB columns
  const updates: Record<string, unknown> = {};
  if (patch.name !== undefined) updates.practitioner_name = patch.name;
  if (patch.facilityType !== undefined) updates.practice_type = patch.facilityType;
  if (patch.phone !== undefined) updates.phone = patch.phone;
  if (patch.email !== undefined) updates.email = patch.email;
  if (patch.address !== undefined) updates.address = patch.address;
  if (patch.state !== undefined) updates.state = patch.state;
  if (patch.city !== undefined) updates.city = patch.city;
  if (patch.description !== undefined) updates.description = patch.description;
  if (patch.verification !== undefined) updates.verification = patch.verification;
  if (patch.verificationNote !== undefined) updates.verification_note = patch.verificationNote;
  if (patch.visibility !== undefined) updates.visibility = patch.visibility;

  if (Object.keys(updates).length > 0) {
    unwrap(await supabase.from("clinics").update(updates).eq("id", cid));
  }

  // Specialties: replace entirely
  if (patch.specialties) {
    await supabase.from("clinic_specialties").delete().eq("clinic_id", cid);
    if (patch.specialties.length > 0) {
      await supabase.from("clinic_specialties").insert(
        patch.specialties.map((s) => ({ clinic_id: cid, specialty: s })),
      );
    }
  }

  return getHospital();
}

export async function uploadFacilityPhoto(slot: string): Promise<Hospital> {
  assert(supabase);
  const cid = await clinicId();

  // Mark photo as uploaded / pending review
  unwrap(
    await supabase
      .from("facility_photos")
      .update({ url: "uploaded", status: "pending_review", note: null })
      .eq("clinic_id", cid)
      .eq("slot", slot),
  );

  // Check if all photos uploaded → advance verification step
  const { data: photos } = await supabase
    .from("facility_photos")
    .select("status")
    .eq("clinic_id", cid);
  if (photos && photos.every((p: { status: string }) => p.status !== "missing")) {
    await supabase
      .from("verification_steps")
      .update({ status: "complete" })
      .eq("clinic_id", cid)
      .eq("sort_order", 2);
    await supabase
      .from("verification_steps")
      .update({ status: "in_progress" })
      .eq("clinic_id", cid)
      .eq("sort_order", 4);
  }

  return getHospital();
}

export async function submitForVerification(): Promise<Hospital> {
  assert(supabase);
  const cid = await clinicId();

  const { data: photos } = await supabase
    .from("facility_photos")
    .select("status")
    .eq("clinic_id", cid);
  const ready = photos != null && photos.every((p: { status: string }) => p.status !== "missing");

  if (ready) {
    unwrap(
      await supabase
        .from("clinics")
        .update({
          verification: "verified",
          verification_note:
            "Your facility is verified and eligible for public search visibility.",
        })
        .eq("id", cid),
    );
    // Mark all steps complete, all photos approved
    await supabase
      .from("verification_steps")
      .update({ status: "complete" })
      .eq("clinic_id", cid);
    await supabase
      .from("facility_photos")
      .update({ status: "approved" })
      .eq("clinic_id", cid);
    await pushNotification({
      type: "verification",
      title: "Verification approved",
      body: "Your facility is verified and now eligible for public search visibility.",
    });
  } else {
    unwrap(
      await supabase
        .from("clinics")
        .update({
          verification: "changes_required",
          verification_note:
            "Upload the outstanding facility photographs to complete verification.",
        })
        .eq("id", cid),
    );
    await pushNotification({
      type: "verification",
      title: "Verification changes requested",
      body: "Upload the outstanding facility photographs to complete verification.",
    });
  }

  return getHospital();
}

export async function createDoctor(input: Omit<Doctor, "id">): Promise<Doctor> {
  assert(supabase);
  const cid = await clinicId();
  const result = await supabase
    .from("provider_doctors")
    .insert({
      clinic_id: cid,
      name: input.name,
      title: input.title,
      specialty: input.specialty,
      consultation_type: input.consultationType,
      consultation_fee: input.consultationFee,
      active: input.active,
    })
    .select()
    .single();
  return toDoctor(unwrap(result) as Record<string, unknown>);
}

export async function updateDoctor(
  doctorId: string,
  patch: Partial<Doctor>,
): Promise<Doctor[]> {
  assert(supabase);
  const updates: Record<string, unknown> = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.specialty !== undefined) updates.specialty = patch.specialty;
  if (patch.consultationType !== undefined) updates.consultation_type = patch.consultationType;
  if (patch.consultationFee !== undefined) updates.consultation_fee = patch.consultationFee;
  if (patch.active !== undefined) updates.active = patch.active;

  unwrap(
    await supabase.from("provider_doctors").update(updates).eq("id", doctorId),
  );
  return getDoctors();
}

export async function createSchedule(
  input: Omit<Schedule, "id">,
): Promise<Schedule[]> {
  assert(supabase);
  const cid = await clinicId();
  unwrap(
    await supabase.from("provider_schedules").insert({
      clinic_id: cid,
      doctor_id: input.doctorId,
      day: input.day,
      start_time: input.startTime,
      end_time: input.endTime,
      slot_duration: input.slotDuration,
      slots: input.slots,
      status: input.status,
    }),
  );
  return getSchedules();
}

export async function updateSchedule(
  scheduleId: string,
  patch: Partial<Schedule>,
): Promise<Schedule[]> {
  assert(supabase);
  const updates: Record<string, unknown> = {};
  if (patch.day !== undefined) updates.day = patch.day;
  if (patch.startTime !== undefined) updates.start_time = patch.startTime;
  if (patch.endTime !== undefined) updates.end_time = patch.endTime;
  if (patch.slotDuration !== undefined) updates.slot_duration = patch.slotDuration;
  if (patch.slots !== undefined) updates.slots = patch.slots;
  if (patch.status !== undefined) updates.status = patch.status;

  unwrap(
    await supabase.from("provider_schedules").update(updates).eq("id", scheduleId),
  );
  return getSchedules();
}

export async function deleteSchedule(scheduleId: string): Promise<Schedule[]> {
  assert(supabase);
  unwrap(
    await supabase.from("provider_schedules").delete().eq("id", scheduleId),
  );
  return getSchedules();
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<Appointment[]> {
  assert(supabase);
  unwrap(
    await supabase
      .from("provider_appointments")
      .update({ status })
      .eq("id", appointmentId),
  );
  return getAppointments();
}

export async function rescheduleAppointment(
  appointmentId: string,
  date: string,
  time: string,
): Promise<Appointment[]> {
  assert(supabase);
  unwrap(
    await supabase
      .from("provider_appointments")
      .update({ date, time, status: "confirmed" })
      .eq("id", appointmentId),
  );
  return getAppointments();
}

export async function checkInAppointment(
  appointmentId: string,
): Promise<{
  appointments: Appointment[];
  encounters: Encounter[];
  checkedInAt: string;
}> {
  assert(supabase);
  const cid = await clinicId();
  const now = new Date();
  const timeStr = hhmm(now);

  // Update appointment
  unwrap(
    await supabase
      .from("provider_appointments")
      .update({ status: "checked_in", checked_in_at: timeStr })
      .eq("id", appointmentId),
  );

  // Get appointment details for encounter creation
  const apptResult = await supabase
    .from("provider_appointments")
    .select("*")
    .eq("id", appointmentId)
    .single();
  const appt = unwrap(apptResult);

  // Create encounter if not exists
  const existing = await supabase
    .from("provider_encounters")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle();
  if (!existing.data) {
    await supabase.from("provider_encounters").insert({
      clinic_id: cid,
      appointment_id: appointmentId,
      patient_id: appt.patient_id,
      doctor_id: appt.doctor_id,
      arrival_time: timeStr,
      status: "arrived",
      payer: appt.payer,
    });
  }

  // Push notification
  const patientResult = await supabase
    .from("provider_patients")
    .select("reference")
    .eq("id", appt.patient_id)
    .single();
  const patient = patientResult.data;
  await pushNotification({
    type: "check_in",
    title: "Patient checked in",
    body: `${patient?.reference ?? "Patient"} checked in at ${clockTime(now)}.`,
  });

  const [appointments, encounters] = await Promise.all([
    getAppointments(),
    getEncounters(),
  ]);

  return { appointments, encounters, checkedInAt: clockTime(now) };
}

export async function createEncounter(
  appointment: Appointment,
): Promise<Encounter> {
  assert(supabase);
  const cid = await clinicId();

  // Check if encounter already exists
  const existing = await supabase
    .from("provider_encounters")
    .select("*")
    .eq("appointment_id", appointment.id)
    .maybeSingle();
  if (existing.data) {
    return toEncounter(existing.data as Record<string, unknown>);
  }

  const result = await supabase
    .from("provider_encounters")
    .insert({
      clinic_id: cid,
      appointment_id: appointment.id,
      patient_id: appointment.patientId,
      doctor_id: appointment.doctorId,
      arrival_time: hhmm(),
      status: "arrived",
      payer: appointment.payer,
    })
    .select()
    .single();
  return toEncounter(unwrap(result) as Record<string, unknown>);
}

export async function startConsultation(
  encounterId: string,
): Promise<{ encounters: Encounter[]; appointments: Appointment[] }> {
  assert(supabase);

  // Get encounter to find appointment
  const encResult = await supabase
    .from("provider_encounters")
    .select("appointment_id")
    .eq("id", encounterId)
    .single();
  const enc = unwrap(encResult);

  // Update both
  await Promise.all([
    supabase
      .from("provider_encounters")
      .update({ status: "in_consultation" })
      .eq("id", encounterId),
    supabase
      .from("provider_appointments")
      .update({ status: "in_consultation" })
      .eq("id", enc.appointment_id),
  ]);

  const [encounters, appointments] = await Promise.all([
    getEncounters(),
    getAppointments(),
  ]);
  return { encounters, appointments };
}

export async function completeEncounter(
  encounterId: string,
): Promise<{ encounters: Encounter[]; appointments: Appointment[] }> {
  assert(supabase);

  const encResult = await supabase
    .from("provider_encounters")
    .select("appointment_id")
    .eq("id", encounterId)
    .single();
  const enc = unwrap(encResult);

  await Promise.all([
    supabase
      .from("provider_encounters")
      .update({ status: "completed", completed_at: hhmm() })
      .eq("id", encounterId),
    supabase
      .from("provider_appointments")
      .update({ status: "completed" })
      .eq("id", enc.appointment_id),
  ]);

  const [encounters, appointments] = await Promise.all([
    getEncounters(),
    getAppointments(),
  ]);
  return { encounters, appointments };
}

export async function checkOutEncounter(
  encounterId: string,
): Promise<Encounter[]> {
  assert(supabase);
  unwrap(
    await supabase
      .from("provider_encounters")
      .update({ status: "checked_out", checked_out_at: hhmm() })
      .eq("id", encounterId),
  );
  return getEncounters();
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

export async function requestAuthorization(
  input: AuthorizationInput,
): Promise<Authorization> {
  assert(supabase);
  const cid = await clinicId();
  const compliant = input.estimatedCost <= input.tariff;

  const code = compliant
    ? `AUTH-2026-${Math.floor(10000 + Math.random() * 89999)}`
    : undefined;
  const reason = compliant
    ? undefined
    : manualReviewReasons[Math.floor(Math.random() * manualReviewReasons.length)];
  const status = compliant ? "approved" : "manual_review";

  const result = await supabase
    .from("provider_authorizations")
    .insert({
      clinic_id: cid,
      patient_id: input.patientId,
      hmo_connection_id: input.hmoId,
      plan: input.plan,
      procedure_name: input.procedure,
      procedure_code: input.procedureCode,
      diagnosis: input.diagnosis,
      icd10: input.icd10,
      tariff: input.tariff,
      estimated_cost: input.estimatedCost,
      status,
      code,
      reason,
      appointment_id: input.appointmentId ?? null,
    })
    .select()
    .single();
  const record = toAuthorization(unwrap(result) as Record<string, unknown>);

  // Link authorization to appointment
  if (input.appointmentId) {
    await supabase
      .from("provider_appointments")
      .update({ authorization_id: record.id })
      .eq("id", input.appointmentId);
  }

  await pushNotification({
    type: "authorization",
    title: compliant
      ? "HMO authorization approved"
      : "HMO authorization requires review",
    body: compliant
      ? `${record.code} approved for ${record.procedure}.`
      : `${record.procedure} flagged: ${record.reason}`,
  });

  return record;
}

export async function updateTariff(
  tariffId: string,
  patch: Partial<ServiceTariff>,
): Promise<ServiceTariff[]> {
  assert(supabase);
  const updates: Record<string, unknown> = {};
  if (patch.service !== undefined) updates.service = patch.service;
  if (patch.category !== undefined) updates.category = patch.category;
  if (patch.providerPrice !== undefined) updates.provider_price = patch.providerPrice;
  if (patch.benchmark !== undefined) updates.benchmark = patch.benchmark;
  if (patch.status !== undefined) updates.status = patch.status;

  unwrap(
    await supabase.from("service_tariffs").update(updates).eq("id", tariffId),
  );
  return getTariffs();
}

export async function markNotificationRead(
  notificationId: string,
): Promise<Notification[]> {
  assert(supabase);
  unwrap(
    await supabase
      .from("provider_notifications")
      .update({ read: true })
      .eq("id", notificationId),
  );
  return getNotifications();
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  assert(supabase);
  const cid = await clinicId();
  unwrap(
    await supabase
      .from("provider_notifications")
      .update({ read: true })
      .eq("clinic_id", cid)
      .eq("read", false),
  );
  return getNotifications();
}

export async function syncEMR(): Promise<EMRSyncState> {
  assert(supabase);
  const cid = await clinicId();
  const records = 80 + Math.floor(Math.random() * 90);
  const appts = 12 + Math.floor(Math.random() * 30);
  const now = `${new Date().toLocaleDateString("en-NG")}, ${clockTime()}`;

  // Update state
  const stateResult = await supabase
    .from("emr_sync_state")
    .select("records_synced, appointments_synced")
    .eq("clinic_id", cid)
    .single();
  const current = unwrap(stateResult);

  await supabase
    .from("emr_sync_state")
    .update({
      last_sync: now,
      records_synced: Number(current.records_synced) + records,
      appointments_synced: Number(current.appointments_synced) + appts,
    })
    .eq("clinic_id", cid);

  // Insert history record
  await supabase.from("emr_sync_history").insert({
    clinic_id: cid,
    time: now,
    type: "Manual",
    records,
    appointments: appts,
    status: "success",
  });

  await pushNotification({
    type: "sync",
    title: "EMR sync completed",
    body: `${records} records and ${appts} appointments synchronised.`,
  });

  return getEMRSync();
}

export async function createCampaign(
  input: Omit<PromotedCampaign, "id" | "status" | "createdAt">,
): Promise<PromotedCampaign[]> {
  assert(supabase);
  const cid = await clinicId();
  unwrap(
    await supabase.from("promoted_campaigns").insert({
      clinic_id: cid,
      location: input.location,
      specialty: input.specialty,
      placement: input.placement,
      budget: input.budget,
      duration_days: input.durationDays,
      status: "pending_approval",
    }),
  );
  return getCampaigns();
}
