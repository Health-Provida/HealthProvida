import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { providers } from "@/lib/mock-data";
import type { VerificationStatus } from "@/lib/types";

const QUEUE_STATES: VerificationStatus[] = ["Submitted", "Under Review", "Changes Required"];

export default function Verification() {
  const queue = providers.filter((p) => QUEUE_STATES.includes(p.verification));
  const [selectedId, setSelectedId] = useState(queue[0]?.id ?? "");
  const [decisions, setDecisions] = useState<Record<string, VerificationStatus>>({});
  const [note, setNote] = useState("");

  const selected = queue.find((p) => p.id === selectedId) ?? queue[0];

  const decide = (status: VerificationStatus) => {
    if (!selected) return;
    setDecisions((d) => ({ ...d, [selected.id]: status }));
    setNote("");
    toast.success(`${selected.name} marked as ${status}`);
  };

  return (
    <>
      <PageHeader
        title="Verification queue"
        description={`${queue.length} facilities awaiting a governance decision. Review documents, photographs and HMO desk readiness.`}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending facilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-2">
            {queue.map((p) => {
              const status = decisions[p.id] ?? p.verification;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                    selected?.id === p.id ? "bg-primary/10" : "hover:bg-accent"
                  }`}
                >
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.city}, {p.state} · submitted {p.submittedAt}
                  </p>
                  <span className="mt-1.5 inline-block">
                    <StatusBadge status={status} />
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {selected ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <Link
                  to={`/providers/${selected.id}`}
                  className="hover:text-primary"
                >
                  {selected.name}
                </Link>
                <StatusBadge status={decisions[selected.id] ?? selected.verification} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p className="text-muted-foreground">
                  Type: <span className="text-foreground">{selected.type}</span>
                </p>
                <p className="text-muted-foreground">
                  Address: <span className="text-foreground">{selected.address}</span>
                </p>
                <p className="text-muted-foreground">
                  Contact: <span className="text-foreground">{selected.email}</span>
                </p>
                <p className="text-muted-foreground">
                  Phone: <span className="text-foreground">{selected.phone}</span>
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Facility photographs
                </p>
                <div className="space-y-2">
                  {selected.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5"
                    >
                      <div>
                        <p className="text-sm">{photo.label}</p>
                        <p className="text-xs text-muted-foreground">{photo.category}</p>
                      </div>
                      <StatusBadge status={photo.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-note"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Admin comment
                </label>
                <Textarea
                  id="review-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain the decision — this is recorded in the audit log."
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => decide("Verified")}>Approve verification</Button>
                <Button variant="outline" onClick={() => decide("Changes Required")}>
                  Request changes
                </Button>
                <Button variant="destructive" onClick={() => decide("Rejected")}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
