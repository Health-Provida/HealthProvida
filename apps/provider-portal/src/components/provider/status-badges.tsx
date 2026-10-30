import { cn } from "@/lib/utils";
import type {
  AppointmentStatus,
  AuthorizationStatus,
  EncounterStatus,
  PayerType,
  VerificationState,
} from "@/lib/types";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-muted-foreground border-border",
  info: "bg-info-soft text-info border-info/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-destructive-soft text-destructive border-destructive/20",
  brand: "bg-accent text-accent-foreground border-brand/25",
};

export function Pill({
  tone = "neutral",
  children,
  className,
  dot = false,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

const appointmentMap: Record<AppointmentStatus, { label: string; tone: Tone }> = {
  confirmed: { label: "Confirmed", tone: "info" },
  checked_in: { label: "Checked In", tone: "brand" },
  in_consultation: { label: "In Consultation", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  no_show: { label: "No-show", tone: "neutral" },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const s = appointmentMap[status];
  return (
    <Pill tone={s.tone} dot>
      {s.label}
    </Pill>
  );
}

const encounterMap: Record<EncounterStatus, { label: string; tone: Tone }> = {
  arrived: { label: "Arrived", tone: "brand" },
  in_consultation: { label: "In Consultation", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  checked_out: { label: "Checked Out", tone: "neutral" },
};

export function EncounterStatusBadge({ status }: { status: EncounterStatus }) {
  const s = encounterMap[status];
  return (
    <Pill tone={s.tone} dot>
      {s.label}
    </Pill>
  );
}

export function PayerBadge({ payer }: { payer: PayerType }) {
  return payer === "hmo" ? (
    <Pill tone="info" className="font-semibold tracking-wide uppercase">
      HMO Covered
    </Pill>
  ) : (
    <Pill tone="neutral" className="font-semibold tracking-wide uppercase">
      Direct Pay
    </Pill>
  );
}

const authMap: Record<AuthorizationStatus, { label: string; tone: Tone }> = {
  approved: { label: "Approved", tone: "success" },
  manual_review: { label: "Manual Review Required", tone: "warning" },
  pending: { label: "Pending", tone: "info" },
  declined: { label: "Declined", tone: "danger" },
};

export function AuthorizationStatusBadge({ status }: { status: AuthorizationStatus }) {
  const s = authMap[status];
  return (
    <Pill tone={s.tone} dot>
      {s.label}
    </Pill>
  );
}

const verificationMap: Record<VerificationState, { label: string; tone: Tone }> = {
  pending: { label: "Verification Pending", tone: "warning" },
  verified: { label: "Verified Provider", tone: "success" },
  changes_required: { label: "Changes Required", tone: "warning" },
  rejected: { label: "Verification Rejected", tone: "danger" },
};

export function VerificationBadge({ state }: { state: VerificationState }) {
  const s = verificationMap[state];
  return (
    <Pill tone={s.tone} dot className="font-semibold">
      {s.label}
    </Pill>
  );
}