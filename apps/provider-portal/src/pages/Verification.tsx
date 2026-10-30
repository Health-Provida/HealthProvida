import { Link } from "react-router-dom";
import { BadgeCheck, Camera, CheckCircle2, Circle, Clock, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, VerificationBadge } from "@/components/provider/status-badges";
import {
  DataField,
  LoadingBlock,
  PageHeading,
  SectionCard,
} from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";

export default function VerificationPage() {
  const store = useProvider();
  const hospital = store.hospital;
  const [submitting, setSubmitting] = useState(false);

  if (!hospital) return <LoadingBlock label="Loading verification status" />;

  const steps = store.verificationSteps;
  const complete = steps.filter((s) => s.status === "complete").length;
  const pct = steps.length ? Math.round((complete / steps.length) * 100) : 0;
  const photosReady = hospital.photos.every((p) => p.status !== "missing");
  const canSubmit = pct === 100 || (photosReady && hospital.verification !== "verified");

  return (
    <div>
      <PageHeading
        title="Verification Centre"
        description="Health Provida verifies every facility before it appears in patient search results."
        actions={<VerificationBadge state={hospital.verification} />}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid gap-4 xl:col-span-2">
          <SectionCard
            title="Verification progress"
            description={`${complete} of ${steps.length} steps complete`}
          >
            <Progress value={pct} className="h-2" />
            <ul className="mt-5 grid gap-3">
              {steps.map((step) => (
                <li
                  key={step.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3"
                >
                  {step.status === "complete" ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : step.status === "in_progress" ? (
                    <Clock className="size-5 text-warning" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <p className="min-w-0 truncate text-sm font-medium">{step.label}</p>
                  <Pill
                    tone={
                      step.status === "complete"
                        ? "success"
                        : step.status === "in_progress"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {step.status === "complete"
                      ? "Complete"
                      : step.status === "in_progress"
                        ? "In progress"
                        : "Pending"}
                  </Pill>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Required photographs"
            description="Exterior, reception and a consultation room."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link to="/facility">
                  <Camera className="size-4" />
                  Manage photos
                </Link>
              </Button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {hospital.photos.map((p) => (
                <div key={p.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{p.label}</p>
                  <div className="mt-2">
                    <Pill
                      tone={
                        p.status === "approved"
                          ? "success"
                          : p.status === "pending_review"
                            ? "warning"
                            : p.status === "rejected"
                              ? "danger"
                              : "neutral"
                      }
                      dot
                    >
                      {p.status === "approved"
                        ? "Approved"
                        : p.status === "pending_review"
                          ? "Pending review"
                          : p.status === "rejected"
                            ? "Rejected"
                            : "Not uploaded"}
                    </Pill>
                  </div>
                  {p.note ? (
                    <p className="mt-2 text-xs text-muted-foreground">{p.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 self-start">
          <SectionCard title="Submit for review">
            <div className="grid gap-4">
              <DataField
                label="Current status"
                value={<VerificationBadge state={hospital.verification} />}
              />
              {hospital.verificationNote ? (
                <div className="flex items-start gap-3 rounded-lg bg-warning-soft p-3">
                  <ShieldAlert className="mt-0.5 size-4 text-warning" />
                  <p className="text-sm text-warning">{hospital.verificationNote}</p>
                </div>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Submitting sends your profile, licence details and photographs to the Health
                Provida verification team. Reviews typically complete within 48 hours.
              </p>
              <Button
                disabled={submitting || !canSubmit}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await store.submitVerification();
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <BadgeCheck className="size-4" />
                {submitting ? "Submitting…" : "Submit for verification"}
              </Button>
              {!canSubmit ? (
                <p className="text-xs text-muted-foreground">
                  Upload all three facility photographs before submitting.
                </p>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title="Why verification matters">
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>• Verified facilities appear in patient search and booking.</li>
              <li>• Unverified facilities are suppressed from search results.</li>
              <li>• HMO authorization requests require a verified provider.</li>
              <li>• Verification unlocks promoted placement eligibility.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
