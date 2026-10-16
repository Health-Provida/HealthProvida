import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNaira, orderStatusLabel, orderTotal, type OrderStatus } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";

const filters: Array<{ key: OrderStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "awaiting_sample", label: "Awaiting Sample" },
  { key: "processing", label: "Processing" },
  { key: "results_ready", label: "Results Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersIndex() {
  const { orders } = useLab();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");

  const rows = orders.filter((o) => {
    const matchStatus = status === "all" || o.status === status;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      o.patientName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.tests.some((t) => t.name.toLowerCase().includes(q));
    return matchStatus && matchQuery;
  });

  return (
    <AppShell>
      <PageHeader
        title="Laboratory orders"
        subtitle="All diagnostic requests routed to Meridian Diagnostic Centre"
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={
                "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors " +
                (status === f.key
                  ? "border-brand-blue bg-tint-blue text-brand-blue"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient, order ID or test"
          className="lg:w-72"
        />
      </div>

      <Surface>
        {rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders match this view"
            description="Try a different status filter or clear your search to see all laboratory orders."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("all");
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-[13.5px]">
              <thead className="border-b border-border text-[12px] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Test(s)</th>
                  <th className="px-5 py-3 font-medium">Collection</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-secondary/60">
                    <td className="px-5 py-3.5 font-medium text-foreground">{o.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="block text-foreground">{o.patientName}</span>
                      <span className="block text-[12px] text-muted-foreground">
                        {o.age} · {o.gender}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {o.tests.map((t) => t.name).join(", ")}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {o.collection === "home" ? "Home collection" : "Walk-in"}
                      <span className="block text-[12px]">
                        {o.collectionDate} · {o.collectionTime}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      {formatNaira(orderTotal(o))}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.status} label={orderStatusLabel[o.status]} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          to={`/orders/${o.id}`}
                          className="text-brand-blue"
                        >
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Surface>
    </AppShell>
  );
}
