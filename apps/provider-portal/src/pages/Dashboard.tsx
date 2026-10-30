import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AppointmentStatusBadge,
  EncounterStatusBadge,
  PayerBadge,
  Pill,
  VerificationBadge,
} from "@/components/provider/status-badges";
import {
  DataField,
  EmptyState,
  KpiCard,
  PageHeading,
  SectionCard,
  TableSkeleton,
} from "@/components/provider/ui-bits";
import { TODAY, useProvider } from "@/lib/provider-store";

export default function Dashboard() {
  const store = useProvider();
  const { appointments, encounters, hospital, verificationSteps, authorizations, loading } = store;

  if (loading || !hospital) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeading title="Dashboard" description="Loading facility operations…" />
        <TableSkeleton rows={7} />
      </div>
    );
  }

  const todays = appointments.filter((a) => a.date === TODAY);
  const pending = todays.filter((a) => a.status === "confirmed");
  const active = encounters.filter((e) => e.status === "arrived" || e.status === "in_consultation");
  const completedToday = todays.filter((a) => a.status === "completed");
  const hmoToday = todays.filter((a) => a.payer === "hmo");
  const directToday = todays.filter((a) => a.payer === "direct_pay");
  const authIssues = authorizations.filter((a) => a.status === "manual_review");

  const completedSteps = verificationSteps.filter((s) => s.status === "complete").length;

  const scheduleGroups = Object.entries(
    todays.reduce<Record<string, typeof todays>>((acc, apt) => {
      const hour = `${apt.time.slice(0, 2)}:00`;
      acc[hour] = [...(acc[hour] ?? []), apt];
      return acc;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeading
        title={`Good morning, ${hospital.name}`}
        description="Thursday, 20 August 2026 — operational overview"
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/today">Today's schedule</Link>
            </Button>
            <Button asChild>
              <Link to="/appointments">Manage appointments</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Today's Appointments" value={todays.length} icon={CalendarDays} tone="info" />
        <KpiCard label="Pending Appointments" value={pending.length} icon={Clock} tone="warning" hint="Awaiting check-in" />
        <KpiCard label="Active Encounters" value={active.length} icon={Activity} tone="brand" />
        <KpiCard label="Completed Today" value={completedToday.length} icon={CalendarCheck2} tone="success" />
        <KpiCard label="HMO Patients" value={hmoToday.length} icon={ShieldCheck} tone="info" />
        <KpiCard label="Direct Pay Patients" value={directToday.length} icon={CircleDollarSign} />
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
        <SectionCard
          title="Active encounters"
          description="Patients currently in the facility"
          className="xl:col-span-2"
          bodyClassName="p-0"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/encounters">Open workspace</Link>
            </Button>
          }
        >
          {active.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No active encounters"
              description="Check a patient in from the appointments list to open an encounter."
            />
          ) : (
            <ul className="divide-y divide-border">
              {active.map((enc) => {
                const patient = store.patientById(enc.patientId);
                const doctor = store.doctorById(enc.doctorId);
                return (
                  <li
                    key={enc.id}
                    className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_90px_auto] sm:items-center"
                  >
                    <DataField label="Patient" value={<span className="ref">{patient?.reference ?? "—"}</span>} />
                    <DataField label="Doctor" value={`${doctor?.title} ${doctor?.name}`} />
                    <DataField label="Arrived" value={<span className="num">{enc.arrivalTime}</span>} />
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <EncounterStatusBadge status={enc.status} />
                      <PayerBadge payer={enc.payer} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>


        <div className="space-y-4">
          <SectionCard title="Verification" description="Public search eligibility">
            <div className="flex items-center justify-between gap-2">
              <VerificationBadge state={hospital.verification} />
              <span className="num text-xs text-muted-foreground">
                {completedSteps}/{verificationSteps.length} steps
              </span>
            </div>
            <Progress
              value={(completedSteps / verificationSteps.length) * 100}
              className="mt-3 h-2"
            />
            <p className="mt-3 text-xs text-muted-foreground">{hospital.verificationNote}</p>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/verification">
                <BadgeCheck className="size-4" /> Open verification centre
              </Link>
            </Button>
          </SectionCard>

          <SectionCard title="Authorization issues" description="Requests needing attention">
            {authIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outstanding authorization issues.</p>
            ) : (
              <ul className="space-y-3">
                {authIssues.map((a) => (
                  <li key={a.id} className="rounded-md border border-warning/25 bg-warning-soft p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{a.procedure}</p>
                        <p className="text-xs text-muted-foreground">{a.reason}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/authorizations">View authorizations</Link>
            </Button>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Who is coming today"
        description="Grouped by consulting hour"
        className="mt-4"
        bodyClassName="p-0"
      >
        <ul className="divide-y divide-border">
          {scheduleGroups.map(([hour, items]) => (
            <li key={hour} className="grid gap-2 p-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-4">
              <p className="num pt-0.5 text-sm leading-5 font-semibold">{hour}</p>
              <ul className="space-y-2">
                {items.map((apt) => {
                  const doctor = store.doctorById(apt.doctorId);
                  const patient = store.patientById(apt.patientId);
                  return (
                    <li
                      key={apt.id}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm leading-5"
                    >
                      <Link
                        to={"/appointments/" + apt.id}
                        className="ref font-medium hover:underline"
                      >
                        {patient?.reference}
                      </Link>
                      <span className="min-w-0 truncate text-muted-foreground">
                        {doctor?.title} {doctor?.name} · {apt.specialty}
                      </span>
                      <Pill tone="neutral">{apt.time}</Pill>
                      <PayerBadge payer={apt.payer} />
                      <AppointmentStatusBadge status={apt.status} />
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
