import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeading({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 border-b border-border pb-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
          <h1 className="display truncate text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "brand" | "success" | "warning" | "info";
}) {
  const iconTone = {
    default: "bg-neutral-soft text-muted-foreground ring-border",
    brand: "bg-accent text-accent-foreground ring-brand/20",
    success: "bg-success-soft text-success ring-success/20",
    warning: "bg-warning-soft text-warning ring-warning/20",
    info: "bg-info-soft text-info ring-info/20",
  }[tone];

  return (
    <div className="card-surface group relative flex h-full flex-col justify-between gap-4 overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow min-h-8 min-w-0 break-words">{label}</p>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
            iconTone,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div>
        <p className="num display text-[1.75rem] leading-none font-semibold">{value}</p>
        {hint ? <p className="mt-2 text-xs leading-4 text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border bg-muted/35 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="display truncate text-sm leading-5 font-semibold">{title}</h2>
            {description ? (
              <p className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}


export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}…
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function DataField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-1 text-sm font-medium break-words">{value}</div>
    </div>
  );
}

export function ScrollTable({ children }: { children: React.ReactNode }) {
  return <div className="w-full overflow-x-auto">{children}</div>;
}