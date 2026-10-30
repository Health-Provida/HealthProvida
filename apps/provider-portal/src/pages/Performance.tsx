import { Activity, BarChart3, CalendarCheck, Star, TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Pill } from "@/components/provider/status-badges";
import {
  DataField,
  KpiCard,
  LoadingBlock,
  PageHeading,
  SectionCard,
} from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";

const visibilityTone = {
  high: "success",
  medium: "info",
  low: "warning",
  suppressed: "danger",
} as const;

export default function PerformancePage() {
  const store = useProvider();
  const perf = store.performance;

  if (!perf) return <LoadingBlock label="Loading performance metrics" />;

  const maxBookings = Math.max(...perf.monthly.map((m) => m.bookings), 1);

  return (
    <div>
      <PageHeading
        title="Provider Performance"
        description="Popularity score combines booking volume, completed encounters and patient review scores."
        actions={
          <Pill tone={visibilityTone[perf.searchVisibility]} dot className="font-semibold">
            Search visibility: {perf.searchVisibility}
          </Pill>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active bookings"
          value={perf.activeBookings}
          icon={CalendarCheck}
          tone="brand"
        />
        <KpiCard
          label="Completed bookings"
          value={perf.completedBookings}
          icon={TrendingUp}
          tone="success"
        />
        <KpiCard
          label="Patient encounters"
          value={perf.patientEncounters}
          icon={Activity}
          tone="info"
        />
        <KpiCard
          label="Average rating"
          value={perf.averageRating.toFixed(1)}
          icon={Star}
          tone="warning"
          hint="Out of 5.0"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Bookings & encounters"
          description="Last six months"
          className="xl:col-span-2"
        >
          <div className="grid gap-4">
            {perf.monthly.map((m) => (
              <div key={m.month} className="grid gap-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{m.month}</span>
                  <span className="num text-muted-foreground">
                    {m.bookings} bookings · {m.encounters} encounters
                  </span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-brand"
                    style={{ width: `${(m.bookings / maxBookings) * 100}%` }}
                  />
                  <div
                    className="bg-info/60"
                    style={{
                      width: `${((m.encounters / maxBookings) * 100) / 2}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand" /> Bookings
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-info/60" /> Encounters
              </span>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-4 self-start">
          <SectionCard title="Popularity score" description="Drives ranking in patient search.">
            <p className="num text-4xl font-semibold">{perf.popularityScore}</p>
            <p className="mt-1 text-xs text-muted-foreground">out of 100</p>
            <Progress value={perf.popularityScore} className="mt-4 h-2" />
            <div className="mt-5 grid gap-4">
              <DataField
                label="Review score"
                value={`${perf.reviewScore.toFixed(1)} / 5.0`}
              />
              <DataField
                label="Promoted placement"
                value={
                  <Pill
                    tone={
                      perf.promotedPlacement === "active"
                        ? "brand"
                        : perf.promotedPlacement === "pending"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {perf.promotedPlacement === "active"
                      ? "Active"
                      : perf.promotedPlacement === "pending"
                        ? "Pending approval"
                        : "Not running"}
                  </Pill>
                }
              />
            </div>
          </SectionCard>

          <SectionCard title="How to improve">
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>• Complete verification to lift search suppression.</li>
              <li>• Check patients in promptly to raise completion rate.</li>
              <li>• Publish more weekly availability slots.</li>
              <li>• Keep tariffs at or below HMO benchmarks.</li>
              <li>
                • Consider promoted placement for priority position in your location and
                specialty.
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <div className="mt-4">
        <SectionCard title="Ranking signals">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DataField label="Booking volume" value={<Pill tone="success">Strong</Pill>} />
            <DataField label="Encounter completion" value={<Pill tone="success">Strong</Pill>} />
            <DataField label="Profile completeness" value={<Pill tone="info">Good</Pill>} />
            <DataField
              label="Verification"
              value={
                store.hospital?.verification === "verified" ? (
                  <Pill tone="success">Verified</Pill>
                ) : (
                  <Pill tone="warning">Incomplete</Pill>
                )
              }
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
