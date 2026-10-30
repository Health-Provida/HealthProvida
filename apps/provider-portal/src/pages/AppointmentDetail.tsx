import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AppointmentStatusBadge,
  AuthorizationStatusBadge,
  PayerBadge,
  Pill,
} from "@/components/provider/status-badges";
import { DataField, PageHeading, SectionCard, TableSkeleton } from "@/components/provider/ui-bits";
import { formatDate, formatNaira, useProvider } from "@/lib/provider-store";

export default function AppointmentDetail() {
  const { appointmentId } = useParams();
  const store = useProvider();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmCheckIn, setConfirmCheckIn] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [checkInAt, setCheckInAt] = useState<string | null>(null);

  if (store.loading) return <TableSkeleton rows={6} />;

  const appointment = store.appointments.find((a) => a.id === appointmentId);
  if (!appointment) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeading title="Appointment not found" description="This booking is no longer available." />
        <Button asChild variant="outline">
          <Link to="/appointments">Back to appointments</Link>
        </Button>
      </div>
    );
  }

  const patient = store.patientById(appointment.patientId);
  const doctor = store.doctorById(appointment.doctorId);
  const hmo = patient?.hmoId ? store.hmoById(patient.hmoId) : undefined;
  const authorization = store.authorizationFor(appointment.id);
  const encounter = store.encounterFor(appointment.id);

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="mb-2">
        <Link to="/appointments">
          <ArrowLeft className="size-4" /> Appointments
        </Link>
      </Button>

      <PageHeading
        title={patient?.reference ?? "Appointment"}
        description={`${appointment.appointmentType} · ${appointment.reference}`}
        actions={
          <>
            <AppointmentStatusBadge status={appointment.status} />
            <PayerBadge payer={appointment.payer} />
          </>
        }
      />

      {checkInAt ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-4 py-3 text-sm text-success">
          <CheckCircle2 className="size-4" /> Patient checked in at {checkInAt}. An active encounter has
          been created.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Appointment" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <DataField label="Patient reference" value={patient?.reference ?? "—"} />
            <DataField label="Patient" value={`${patient?.displayName} · ${patient?.sex}, ${patient?.ageBand}`} />
            <DataField label="Date & time" value={`${formatDate(appointment.date)} at ${appointment.time}`} />
            <DataField label="Doctor" value={`${doctor?.title} ${doctor?.name}`} />
            <DataField label="Specialty" value={appointment.specialty} />
            <DataField
              label="Consultation type"
              value={appointment.consultationType === "physical" ? "Physical visit" : "Telemedicine"}
            />
            <DataField label="Booking status" value={<AppointmentStatusBadge status={appointment.status} />} />
            <DataField
              label="Payment status"
              value={
                <Pill tone={appointment.paymentStatus === "paid" || appointment.paymentStatus === "covered" ? "success" : "warning"}>
                  {appointment.paymentStatus === "covered"
                    ? "Covered by HMO"
                    : appointment.paymentStatus === "paid"
                      ? "Paid"
                      : appointment.paymentStatus === "pending"
                        ? "Pending"
                        : "Unpaid"}
                </Pill>
              }
            />
            <DataField label="Consultation fee" value={formatNaira(appointment.amount)} />
            <DataField label="Appointment reference" value={appointment.reference} />
          </div>
          <div className="mt-4">
            <DataField
              label="Notes"
              value={appointment.notes ?? "No operational notes recorded for this appointment."}
            />
          </div>
        </SectionCard>

        <div className="space-y-4">
          {appointment.payer === "hmo" ? (
            <SectionCard title="HMO information">
              <div className="space-y-3">
                <DataField label="HMO" value={hmo?.name ?? "—"} />
                <DataField label="Plan" value={patient?.plan ?? "—"} />
                <DataField label="Policy reference" value={patient?.policyNumber ?? "—"} />
                <DataField
                  label="Authorization"
                  value={
                    authorization ? (
                      <div className="space-y-1">
                        <AuthorizationStatusBadge status={authorization.status} />
                        {authorization.code ? (
                          <p className="num text-xs text-muted-foreground">{authorization.code}</p>
                        ) : null}
                      </div>
                    ) : (
                      <Pill tone="warning">Not requested</Pill>
                    )
                  }
                />
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link to="/authorizations">Manage authorizations</Link>
              </Button>
            </SectionCard>
          ) : (
            <SectionCard title="Payer">
              <p className="text-sm text-muted-foreground">
                This patient pays directly. No HMO authorization is required for this encounter.
              </p>
            </SectionCard>
          )}

          <SectionCard title="Actions">
            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={appointment.status !== "confirmed"}
                onClick={() => setConfirmCheckIn(true)}
              >
                Check In
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                onClick={() => {
                  setNewDate(appointment.date);
                  setNewTime(appointment.time);
                  setRescheduleOpen(true);
                }}
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!encounter || encounter.status !== "arrived" || busy === "start"}
                onClick={() =>
                  encounter && void run("start", () => store.startConsultation(encounter.id))
                }
              >
                {busy === "start" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                Start Encounter
              </Button>
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                disabled={appointment.status === "cancelled" || appointment.status === "completed"}
                onClick={() => setConfirmCancel(true)}
              >
                <XCircle className="size-4" /> Cancel appointment
              </Button>
              {encounter ? (
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/encounters">Open encounter workspace</Link>
                </Button>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>

      <AlertDialog open={confirmCheckIn} onOpenChange={setConfirmCheckIn}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check in {patient?.reference}?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the appointment as Checked In and creates an active encounter for{" "}
              {doctor?.title} {doctor?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                void run("checkin", async () => {
                  const at = await store.checkIn(appointment.id);
                  setCheckInAt(at);
                })
              }
            >
              Confirm check in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              The patient will be notified through Health Provida that the booking was cancelled by the
              facility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                void run("cancel", async () => {
                  await store.setAppointmentStatus(appointment.id, "cancelled");
                  void navigate("/appointments");
                })
              }
            >
              Cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time. The patient receives an updated confirmation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newDate || !newTime || busy === "reschedule"}
              onClick={() =>
                void run("reschedule", async () => {
                  await store.reschedule(appointment.id, newDate, newTime);
                  setRescheduleOpen(false);
                })
              }
            >
              {busy === "reschedule" ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
