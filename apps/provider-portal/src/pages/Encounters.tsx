import { Link } from "react-router-dom";
import { Activity, LogOut, PlayCircle, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EncounterStatusBadge, PayerBadge } from "@/components/provider/status-badges";
import {
  DataField,
  EmptyState,
  KpiCard,
  PageHeading,
  SectionCard,
  TableSkeleton,
} from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";
import type { EncounterStatus } from "@/lib/types";

type Filter = "active" | "all" | EncounterStatus;

export default function EncountersPage() {
  const store = useProvider();
  const [filter, setFilter] = useState<Filter>("active");
  const [busy, setBusy] = useState<string | null>(null);

  const encounters = useMemo(() => {
    return store.encounters.filter((e) => {
      if (filter === "all") return true;
      if (filter === "active") return e.status === "arrived" || e.status === "in_consultation";
      return e.status === filter;
    });
  }, [store.encounters, filter]);

  if (store.loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeading title="Patient Encounters" description="Loading encounters…" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  const active = store.encounters.filter(
    (e) => e.status === "arrived" || e.status === "in_consultation",
  ).length;
  const completed = store.encounters.filter((e) => e.status === "completed").length;
  const checkedOut = store.encounters.filter((e) => e.status === "checked_out").length;

  async function run(action: () => Promise<void>, key: string) {
    setBusy(key);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeading
        title="Patient Encounters"
        description="An encounter is created automatically when a patient is checked in."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Active now" value={active} icon={Activity} tone="warning" />
        <KpiCard label="Completed" value={completed} icon={Stethoscope} tone="success" />
        <KpiCard label="Checked out" value={checkedOut} icon={LogOut} />
      </div>

      <Tabs className="mt-4" value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="arrived">Arrived</TabsTrigger>
          <TabsTrigger value="in_consultation">In consultation</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="checked_out">Checked out</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {encounters.length === 0 ? (
        <SectionCard className="mt-4" bodyClassName="p-0">
          <EmptyState
            icon={Activity}
            title="No encounters in this view"
            description="Check a patient in from Today's Schedule to open a new encounter."
            action={
              <Button variant="outline" asChild>
                <Link to="/today">Go to today's schedule</Link>
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {encounters.map((enc) => {
            const patient = store.patientById(enc.patientId);
            const doctor = store.doctorById(enc.doctorId);
            return (
              <SectionCard key={enc.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{patient?.displayName}</p>
                    <p className="num text-xs text-muted-foreground">{patient?.reference}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <PayerBadge payer={enc.payer} />
                    <EncounterStatusBadge status={enc.status} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <DataField
                    label="Doctor"
                    value={doctor ? `${doctor.title} ${doctor.name}` : "—"}
                  />
                  <DataField label="Arrived" value={<span className="num">{enc.arrivalTime}</span>} />
                  <DataField
                    label="Completed"
                    value={<span className="num">{enc.completedAt ?? "—"}</span>}
                  />
                  <DataField
                    label="Checked out"
                    value={<span className="num">{enc.checkedOutAt ?? "—"}</span>}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {enc.status === "arrived" ? (
                    <Button
                      size="sm"
                      disabled={busy === enc.id}
                      onClick={() => run(() => store.startConsultation(enc.id), enc.id)}
                    >
                      <PlayCircle className="size-4" /> Start consultation
                    </Button>
                  ) : null}
                  {enc.status === "in_consultation" ? (
                    <Button
                      size="sm"
                      disabled={busy === enc.id}
                      onClick={() => run(() => store.completeEncounter(enc.id), enc.id)}
                    >
                      Complete encounter
                    </Button>
                  ) : null}
                  {enc.status === "completed" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === enc.id}
                      onClick={() => run(() => store.checkOut(enc.id), enc.id)}
                    >
                      <LogOut className="size-4" /> Check out
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" asChild>
                    <Link
                      to={"/appointments/" + enc.appointmentId}
                    >
                      Appointment details
                    </Link>
                  </Button>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
