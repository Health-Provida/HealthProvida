import { CalendarSync, Database, Plug, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pill } from "@/components/provider/status-badges";
import {
  DataField,
  EmptyState,
  KpiCard,
  LoadingBlock,
  PageHeading,
  ScrollTable,
  SectionCard,
} from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";

const statusTone = { success: "success", partial: "warning", failed: "danger" } as const;

export default function EmrSyncPage() {
  const store = useProvider();
  const emr = store.emr;
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  if (!emr) return <LoadingBlock label="Loading EMR integration" />;

  return (
    <div>
      <PageHeading
        title="EMR Sync"
        description="Health Provida mirrors appointments and encounters into your hospital record system."
        actions={
          <Button
            disabled={syncing || !emr.connected}
            onClick={async () => {
              setSyncing(true);
              try {
                await store.runSync();
              } finally {
                setSyncing(false);
              }
            }}
          >
            <RefreshCw className={syncing ? "size-4 animate-spin" : "size-4"} />
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Connection"
          value={emr.connected ? "Connected" : "Disconnected"}
          icon={Plug}
          tone={emr.connected ? "success" : "warning"}
          hint={emr.integrationType}
        />
        <KpiCard label="Records synced" value={emr.recordsSynced} icon={Database} tone="brand" />
        <KpiCard
          label="Appointments synced"
          value={emr.appointmentsSynced}
          icon={CalendarSync}
          tone="info"
        />
        <KpiCard label="Last sync" value={emr.lastSync} icon={RefreshCw} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Sync history"
          description="Most recent synchronisation runs."
          className="xl:col-span-2"
          bodyClassName="p-0"
        >
          {emr.history.length === 0 ? (
            <EmptyState
              icon={RefreshCw}
              title="No sync runs yet"
              description="Run a manual sync to populate history."
            />
          ) : (
            <ScrollTable>
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Records</TableHead>
                    <TableHead className="text-right">Appointments</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emr.history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="num whitespace-nowrap font-medium">{h.time}</TableCell>
                      <TableCell className="whitespace-nowrap">{h.type}</TableCell>
                      <TableCell className="num text-right">{h.records}</TableCell>
                      <TableCell className="num text-right">{h.appointments}</TableCell>
                      <TableCell>
                        <Pill tone={statusTone[h.status]} dot>
                          {h.status === "success"
                            ? "Success"
                            : h.status === "partial"
                              ? "Partial"
                              : "Failed"}
                        </Pill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollTable>
          )}
        </SectionCard>

        <div className="grid gap-4 self-start">
          <SectionCard title="Integration settings">
            <div className="grid gap-4">
              <DataField label="Integration type" value={emr.integrationType} />
              <DataField
                label="Connection status"
                value={
                  <Pill tone={emr.connected ? "success" : "warning"} dot>
                    {emr.connected ? "Connected" : "Disconnected"}
                  </Pill>
                }
              />
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Automatic sync</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Sync every 15 minutes and on every check-in.
                  </p>
                </div>
                <Switch
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                  aria-label="Toggle automatic sync"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="What gets synced">
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>• Confirmed and rescheduled appointments</li>
              <li>• Patient check-in and arrival times</li>
              <li>• Encounter start, completion and check-out</li>
              <li>• HMO authorization codes and coverage status</li>
              <li>• Service and tariff catalogue updates</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
