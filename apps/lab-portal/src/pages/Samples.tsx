import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { sampleStatusLabel, type SampleStatus } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";

const next: Record<SampleStatus, { status: SampleStatus; label: string } | null> = {
  awaiting: { status: "collected", label: "Mark collected" },
  collected: { status: "processing", label: "Start processing" },
  processing: { status: "completed", label: "Mark completed" },
  completed: null,
};

export default function Samples() {
  const { samples, setSampleStatus, pushActivity } = useLab();

  return (
    <AppShell>
      <PageHeader
        title="Sample tracking"
        subtitle="Chain of custody for every sample in your laboratory"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {samples.map((s) => {
          const action = next[s.status];
          return (
            <Surface key={s.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{s.patientName}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {s.id} ·{" "}
                    <Link
                      to={`/orders/${s.orderId}`}
                      className="text-brand-blue hover:underline"
                    >
                      {s.orderId}
                    </Link>
                  </p>
                </div>
                <StatusBadge status={s.status} label={sampleStatusLabel[s.status]} />
              </div>
              <dl className="mt-4 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Test</dt>
                  <dd className="text-foreground">{s.test}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Collection</dt>
                  <dd className="text-foreground">
                    {s.collection === "home" ? "Home" : "Walk-in"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Scheduled</dt>
                  <dd className="text-foreground">{s.collectionTime}</dd>
                </div>
              </dl>
              {action && (
                <Button
                  className="mt-4 w-full bg-brand-blue hover:bg-brand-blue/90"
                  size="sm"
                  onClick={() => {
                    setSampleStatus(s.id, action.status);
                    pushActivity({
                      title: `${action.label} — ${s.id}`,
                      meta: `${s.orderId} · just now`,
                      type: "success",
                    });
                    toast.success(action.label, { description: `${s.id} · ${s.patientName}` });
                  }}
                >
                  {action.label}
                </Button>
              )}
            </Surface>
          );
        })}
      </div>
    </AppShell>
  );
}
