import { Link } from "react-router-dom";
import { ClipboardList, FlaskConical, TestTubes, Wallet, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard, PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { formatNaira, orderStatusLabel, orderTotal, LAB_NAME } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";

export default function Dashboard() {
  const { orders, samples, results, activity } = useLab();

  const newOrders = orders.filter((o) => o.status === "new").length;
  const pendingSamples = samples.filter((s) => s.status !== "completed").length;
  const awaitingReview = results.filter((r) => r.status === "review").length;
  const revenue = orders
    .filter((o) => o.status === "completed" || o.status === "results_ready")
    .reduce((sum, o) => sum + orderTotal(o), 0);

  const recent = orders.slice(0, 6);

  return (
    <AppShell>
      <PageHeader
        title="Today's laboratory activity"
        subtitle={`${LAB_NAME} · Friday, 21 August 2026`}
        actions={
          <Button asChild className="bg-brand-blue hover:bg-brand-blue/90">
            <Link to="/orders">View all orders</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="New orders"
          value={newOrders}
          hint="Awaiting acceptance"
          icon={ClipboardList}
          to="/orders"
        />
        <KpiCard
          label="Samples pending"
          value={pendingSamples}
          hint="Collection & processing"
          icon={TestTubes}
          to="/samples"
        />
        <KpiCard
          label="Results to review"
          value={awaitingReview}
          hint="Ready for approval"
          icon={FlaskConical}
          to="/results"
          tone="green"
        />
        <KpiCard
          label="Revenue (this week)"
          value={formatNaira(revenue)}
          hint="Delivered & completed orders"
          icon={Wallet}
          to="/tests"
          tone="green"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Surface
          className="lg:col-span-2"
          title="Recent orders"
          description="Latest requests routed to your laboratory"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders" className="text-brand-blue">
                All orders <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  to={`/orders/${o.id}`}
                  className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/60 sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-foreground">
                      {o.patientName}
                    </span>
                    <span className="block truncate text-[12px] text-muted-foreground">
                      {o.id} · {o.tests.map((t) => t.name).join(", ")}
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold text-foreground">
                    {formatNaira(orderTotal(o))}
                  </span>
                  <StatusBadge status={o.status} label={orderStatusLabel[o.status]} />
                </Link>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface title="Activity feed" description="Live updates across the portal">
          <ul className="space-y-4 px-4 py-4 sm:px-5">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span
                  className={
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
                    (a.type === "success" ? "bg-brand-green" : "bg-brand-blue")
                  }
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-[13.5px] font-medium text-foreground">{a.title}</span>
                  <span className="block text-[12px] text-muted-foreground">{a.meta}</span>
                </span>
              </li>
            ))}
          </ul>
        </Surface>
      </div>
    </AppShell>
  );
}
