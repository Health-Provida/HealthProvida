import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, Clock, LogIn, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentStatusBadge, PayerBadge } from "@/components/provider/status-badges";
import {
  EmptyState,
  KpiCard,
  PageHeading,
  ScrollTable,
  SectionCard,
  TableSkeleton,
} from "@/components/provider/ui-bits";
import { TODAY, formatDate, useProvider } from "@/lib/provider-store";

export default function TodayPage() {
  const store = useProvider();
  const [busy, setBusy] = useState<string | null>(null);

  const today = useMemo(
    () =>
      store.appointments
        .filter((a) => a.date === TODAY)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [store.appointments],
  );

  const byDoctor = useMemo(() => {
    const map = new Map<string, typeof today>();
    for (const apt of today) {
      map.set(apt.doctorId, [...(map.get(apt.doctorId) ?? []), apt]);
    }
    return Array.from(map.entries());
  }, [today]);

  if (store.loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeading title="Today's Schedule" description="Loading clinic day…" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const arrived = today.filter((a) => a.status !== "confirmed" && a.status !== "cancelled").length;
  const waiting = today.filter((a) => a.status === "checked_in").length;
  const done = today.filter((a) => a.status === "completed").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeading
        title="Today's Schedule"
        description={`${formatDate(TODAY)} — clinic day at ${store.hospital?.name ?? "your facility"}.`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/appointments">All appointments</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Booked today" value={today.length} icon={CalendarClock} tone="brand" />
        <KpiCard label="Arrived" value={arrived} icon={LogIn} tone="info" />
        <KpiCard label="Waiting" value={waiting} icon={Clock} tone="warning" />
        <KpiCard label="Completed" value={done} icon={CheckCircle2} tone="success" />
      </div>

      {byDoctor.length === 0 ? (
        <SectionCard className="mt-4" bodyClassName="p-0">
          <EmptyState
            icon={Users}
            title="No appointments scheduled today"
            description="Bookings made through Health Provida for today will appear here automatically."
          />
        </SectionCard>
      ) : (
        <div className="mt-4 space-y-4">
          {byDoctor.map(([doctorId, list]) => {
            const doctor = store.doctorById(doctorId);
            return (
              <SectionCard
                key={doctorId}
                title={doctor ? `${doctor.title} ${doctor.name}` : "Unassigned"}
                description={`${doctor?.specialty ?? ""} · ${list.length} appointment${list.length === 1 ? "" : "s"}`}
                bodyClassName="p-0"
              >
                <ScrollTable>
                  <Table className="min-w-[760px] table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[90px]">Time</TableHead>
                        <TableHead className="w-[220px]">Patient</TableHead>
                        <TableHead className="w-[150px]">Type</TableHead>
                        <TableHead className="w-[140px]">Payer</TableHead>
                        <TableHead className="w-[160px]">Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((apt) => {
                        const patient = store.patientById(apt.patientId);
                        return (
                          <TableRow key={apt.id}>
                            <TableCell className="num align-middle font-medium">
                              {apt.time}
                            </TableCell>
                            <TableCell className="align-middle">
                              <p className="truncate font-medium">{patient?.displayName}</p>
                              <p className="ref mt-0.5 text-xs leading-4 text-muted-foreground">
                                {patient?.reference}
                              </p>
                            </TableCell>
                            <TableCell className="align-middle text-sm capitalize">
                              {apt.consultationType}
                            </TableCell>
                            <TableCell className="align-middle">
                              <PayerBadge payer={apt.payer} />
                            </TableCell>
                            <TableCell className="align-middle">
                              <AppointmentStatusBadge status={apt.status} />
                            </TableCell>
                            <TableCell className="align-middle text-right">

                              {apt.status === "confirmed" ? (
                                <Button
                                  size="sm"
                                  disabled={busy === apt.id}
                                  onClick={async () => {
                                    setBusy(apt.id);
                                    try {
                                      await store.checkIn(apt.id);
                                    } finally {
                                      setBusy(null);
                                    }
                                  }}
                                >
                                  {busy === apt.id ? "Checking in…" : "Check in"}
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" asChild>
                                  <Link
                                    to={"/appointments/" + apt.id}
                                  >
                                    View
                                  </Link>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollTable>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
