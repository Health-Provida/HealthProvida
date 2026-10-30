import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  positive: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/35",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  info: "bg-info/10 text-info border-info/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

const map: Record<string, keyof typeof tones> = {
  Active: "positive",
  Verified: "positive",
  Approved: "positive",
  Settled: "positive",
  Matched: "positive",
  Completed: "positive",
  Success: "positive",
  Pending: "warning",
  Invited: "warning",
  Trial: "warning",
  Waiting: "warning",
  Submitted: "info",
  "Under Review": "info",
  "In Consultation": "info",
  Info: "info",
  Paused: "neutral",
  Draft: "neutral",
  Hidden: "neutral",
  Public: "neutral",
  Inactive: "neutral",
  Retired: "neutral",
  Expired: "neutral",
  Disabled: "neutral",
  Wallet: "neutral",
  "Silent Network": "neutral",
  Promoted: "info",
  Rejected: "danger",
  Suspended: "danger",
  Reversed: "danger",
  "Past Due": "danger",
  Churned: "danger",
  "High Wait Time": "danger",
  "Changes Required": "warning",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = tones[map[status] ?? "neutral"];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone,
        className,
      )}
    >
      {status}
    </span>
  );
}
