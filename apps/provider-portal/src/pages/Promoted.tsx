import { Megaphone, Rocket, Target, TrendingUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pill } from "@/components/provider/status-badges";
import {
  EmptyState,
  KpiCard,
  PageHeading,
  ScrollTable,
  SectionCard,
} from "@/components/provider/ui-bits";
import { formatNaira, useProvider } from "@/lib/provider-store";

const LOCATIONS = ["Victoria Island, Lagos", "Ikeja, Lagos", "Lekki, Lagos", "Lagos State (all)"];
const PLACEMENTS = ["Top of search results", "Specialty spotlight", "Homepage featured"];

const statusTone = {
  pending_approval: "warning",
  active: "success",
  ended: "neutral",
} as const;

const statusLabel = {
  pending_approval: "Pending approval",
  active: "Active",
  ended: "Ended",
} as const;

export default function PromotedPage() {
  const store = useProvider();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    location: LOCATIONS[0]!,
    specialty: "General Practice",
    placement: PLACEMENTS[0]!,
    budget: "75000",
    durationDays: "30",
  });

  const specialties = store.hospital?.specialties.length
    ? store.hospital.specialties
    : ["General Practice"];
  const active = store.campaigns.filter((c) => c.status === "active");
  const pending = store.campaigns.filter((c) => c.status === "pending_approval");
  const totalSpend = store.campaigns.reduce((sum, c) => sum + c.budget, 0);
  const verified = store.hospital?.verification === "verified";

  async function submit() {
    setSaving(true);
    try {
      await store.addCampaign({
        location: form.location,
        specialty: form.specialty,
        placement: form.placement,
        budget: Number(form.budget) || 0,
        durationDays: Number(form.durationDays) || 30,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeading
        title="Promoted Placement"
        description="Sponsored positions appear above organic results for the location and specialty you choose."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!verified}>
                <Rocket className="size-4" />
                New campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create promoted placement</DialogTitle>
                <DialogDescription>
                  Campaigns go live once approved by the Health Provida team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label>Target location</Label>
                  <Select
                    value={form.location}
                    onValueChange={(v) => setForm({ ...form, location: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Specialty</Label>
                  <Select
                    value={form.specialty}
                    onValueChange={(v) => setForm({ ...form, specialty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Placement</Label>
                  <Select
                    value={form.placement}
                    onValueChange={(v) => setForm({ ...form, placement: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENTS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="c-budget">Budget (₦)</Label>
                    <Input
                      id="c-budget"
                      inputMode="numeric"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="c-days">Duration (days)</Label>
                    <Input
                      id="c-days"
                      inputMode="numeric"
                      value={form.durationDays}
                      onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={saving}>
                  {saving ? "Submitting…" : "Submit campaign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {!verified ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-warning/25 bg-warning-soft p-4">
          <Target className="mt-0.5 size-4 text-warning" />
          <p className="text-sm text-warning">
            Promoted placement is available to verified facilities only. Complete verification to
            unlock sponsored campaigns.
          </p>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active campaigns" value={active.length} icon={Rocket} tone="success" />
        <KpiCard label="Pending approval" value={pending.length} icon={Megaphone} tone="warning" />
        <KpiCard label="Total committed" value={formatNaira(totalSpend)} icon={TrendingUp} tone="brand" />
        <KpiCard
          label="Listing status"
          value={store.hospital?.visibility === "promoted" ? "Promoted" : "Organic"}
          icon={Target}
          tone="info"
        />
      </div>

      <SectionCard title="Campaigns" bodyClassName="p-0">
        {store.campaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Create a promoted placement to appear above organic search results."
          />
        ) : (
          <ScrollTable>
            <Table className="data-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium whitespace-nowrap">{c.location}</TableCell>
                    <TableCell className="whitespace-nowrap">{c.specialty}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {c.placement}
                    </TableCell>
                    <TableCell className="num text-right whitespace-nowrap">
                      {formatNaira(c.budget)}
                    </TableCell>
                    <TableCell className="num text-right whitespace-nowrap">
                      {c.durationDays} days
                    </TableCell>
                    <TableCell>
                      <Pill tone={statusTone[c.status]} dot>
                        {statusLabel[c.status]}
                      </Pill>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollTable>
        )}
      </SectionCard>
    </div>
  );
}
