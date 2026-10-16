import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Surface({
  children,
  className,
  title,
  description,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <div>
            {title && <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
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
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="bg-brand-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-full opacity-90">
        <Icon className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
      </span>
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  to,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: LucideIcon;
  to: string;
  tone?: "blue" | "green";
}) {
  return (
    <Link
      to={to}
      className="group block rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-brand-blue/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
    >
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "green" ? "bg-tint-green text-brand-green" : "bg-tint-blue text-brand-blue",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-[30px] leading-none font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-[12px] text-muted-foreground group-hover:text-brand-blue">{hint}</p>
    </Link>
  );
}

export function Timeline({
  steps,
  currentIndex,
}: {
  steps: string[];
  currentIndex: number;
}) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                  done && "border-brand-green bg-brand-green text-primary-foreground",
                  active && "border-brand-blue bg-tint-blue text-brand-blue",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={cn("my-1 w-0.5 flex-1", done ? "bg-brand-green/50" : "bg-border")}
                />
              )}
            </div>
            <div className="pb-5">
              <p
                className={cn(
                  "text-[14px]",
                  active ? "font-semibold text-brand-blue" : "text-foreground",
                  !done && !active && "text-muted-foreground",
                )}
              >
                {step}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {done ? "Completed" : active ? "Current stage" : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
