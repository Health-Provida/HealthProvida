import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "neutral" | "danger";

const toneClasses: Record<Tone, string> = {
  info: "bg-tint-blue text-brand-blue border-brand-blue/20",
  success: "bg-tint-green text-brand-green border-brand-green/25",
  warning: "bg-warning/10 text-warning-foreground border-warning/30",
  neutral: "bg-muted text-muted-foreground border-border",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
};

const dotClasses: Record<Tone, string> = {
  info: "bg-brand-blue",
  success: "bg-brand-green",
  warning: "bg-warning",
  neutral: "bg-muted-foreground",
  danger: "bg-destructive",
};

const map: Record<string, Tone> = {
  new: "info",
  awaiting_sample: "warning",
  awaiting: "warning",
  processing: "info",
  collected: "info",
  results_ready: "success",
  review: "warning",
  ready: "success",
  completed: "success",
  published: "success",
  cancelled: "danger",
  pending: "neutral",
  inactive: "neutral",
  active: "success",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className?: string;
}) {
  const tone = map[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}
