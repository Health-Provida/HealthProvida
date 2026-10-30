import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  bookingsSeries,
  ecosystemEvents,
  encounters,
  kpis,
  latencySeries,
  providers,
} from "@/lib/mock-data";

const chartTooltip = {
  contentStyle: {
    borderRadius: 8,
    border: "1px solid hsl(var(--border))",
    fontSize: 12,
  },
} as const;

export default function Dashboard() {
  const pendingVerification = providers.filter(
    (p) => p.verification === "Submitted" || p.verification === "Under Review",
  );
  const longWaits = encounters.filter((e) => e.status === "High Wait Time");

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Ecosystem health across providers, patients, HMOs and revenue — updated every 60 seconds."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/analytics">Open analytics</Link>
            </Button>
            <Button asChild>
              <Link to="/verification">Review queue ({pendingVerification.length})</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            description={kpi.description}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Bookings and completed encounters
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingsSeries} margin={{ left: -18, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="gBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip {...chartTooltip} />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-primary)"
                  fill="url(#gBookings)"
                  strokeWidth={2}
                  name="Bookings"
                />
                <Area
                  type="monotone"
                  dataKey="encounters"
                  stroke="var(--color-brand-blue)"
                  fill="transparent"
                  strokeWidth={2}
                  name="Encounters"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Median HMO authorization latency (mins)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencySeries} margin={{ left: -22, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip {...chartTooltip} />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="var(--color-brand-blue)"
                  strokeWidth={2}
                  dot={false}
                  name="Minutes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">Ecosystem activity today</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/activity">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border p-0">
            {ecosystemEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 px-6 py-3">
                <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {event.timestamp}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{event.action}</p>
                  <p className="truncate text-xs text-muted-foreground">{event.entity}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">Attention required</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/encounters">Encounters</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">
                {longWaits.length} encounters breaching wait-time SLA
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Longest: {Math.max(...longWaits.map((e) => e.waitMinutes))} minutes at{" "}
                {longWaits[0]?.hospital}
              </p>
            </div>
            <div className="rounded-lg border border-warning/35 bg-warning/10 p-3">
              <p className="text-sm font-medium text-foreground">
                {pendingVerification.length} facilities awaiting verification
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Target decision window is 72 hours from submission.
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium text-foreground">Tariff reviews open</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Two regional benchmarks are pending sign-off.
              </p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link to="/tariffs">Open tariffs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
