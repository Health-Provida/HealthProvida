import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { NGN, tariffs as seedTariffs } from "@/lib/mock-data";
import type { Tariff } from "@/lib/types";

const ALL = "All";
const CATEGORIES = ["Consultation", "Laboratory", "Procedures"] as const;

export default function Tariffs() {
  const [rows, setRows] = useState<Tariff[]>(seedTariffs);
  const [category, setCategory] = useState<string>(ALL);
  const [region, setRegion] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Tariff | null>(null);
  const [open, setOpen] = useState(false);

  const regions = useMemo(
    () => [ALL, ...Array.from(new Set(seedTariffs.map((t) => t.region))).sort()],
    [],
  );

  const filtered = rows.filter(
    (t) =>
      (category === ALL || t.category === category) &&
      (region === ALL || t.region === region) &&
      (!query.trim() ||
        t.service.toLowerCase().includes(query.toLowerCase()) ||
        t.code.toLowerCase().includes(query.toLowerCase())),
  );

  const startNew = () => {
    setEditing({
      id: `TRF-${String(rows.length + 1).padStart(3, "0")}`,
      service: "",
      code: "",
      category: "Consultation",
      region: "South-West",
      state: "Lagos",
      benchmark: 0,
      min: 0,
      max: 0,
      status: "Draft",
      effectiveDate: "2026-09-01",
      updatedAt: "2026-08-21",
      updatedBy: "Adaeze Okafor",
      providersUsing: 0,
      history: [],
    });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.service.trim() || !editing.code.trim()) {
      toast.error("Service name and code are required");
      return;
    }
    if (editing.min > editing.benchmark || editing.benchmark > editing.max) {
      toast.error("Benchmark must sit between the minimum and maximum price");
      return;
    }
    setRows((prev) => {
      const exists = prev.some((t) => t.id === editing.id);
      return exists ? prev.map((t) => (t.id === editing.id ? editing : t)) : [editing, ...prev];
    });
    setOpen(false);
    toast.success(`${editing.service} saved`);
  };

  return (
    <>
      <PageHeader
        title="Tariff management"
        description="Benchmark pricing per service and region. Providers listing outside the min/max band are flagged for review."
        actions={
          <Button onClick={startNew}>
            <Plus className="mr-2 h-4 w-4" /> New tariff
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search service or code"
              className="min-w-[220px] flex-1"
              aria-label="Search tariffs"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[170px]" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[ALL, ...CATEGORIES].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === ALL ? "All categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[170px]" aria-label="Filter by region">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === ALL ? "All regions" : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Benchmark</TableHead>
                  <TableHead className="text-right">Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Providers</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-medium">{t.service}</p>
                      <p className="text-xs text-muted-foreground">{t.code}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.region} · {t.state}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{NGN(t.benchmark)}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                      {NGN(t.min, true)} – {NGN(t.max, true)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{t.providersUsing}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(t);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No tariffs match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing && rows.some((t) => t.id === editing.id) ? "Edit tariff" : "New tariff"}</DialogTitle>
            <DialogDescription>
              Benchmarks guide provider pricing and power out-of-band alerts.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="service">Service</Label>
                <Input
                  id="service"
                  value={editing.service}
                  onChange={(e) => setEditing({ ...editing, service: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="code">Service code</Label>
                <Input
                  id="code"
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={editing.state}
                  onChange={(e) => setEditing({ ...editing, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="min">Minimum (₦)</Label>
                <Input
                  id="min"
                  type="number"
                  value={editing.min}
                  onChange={(e) => setEditing({ ...editing, min: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="benchmark">Benchmark (₦)</Label>
                <Input
                  id="benchmark"
                  type="number"
                  value={editing.benchmark}
                  onChange={(e) => setEditing({ ...editing, benchmark: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="max">Maximum (₦)</Label>
                <Input
                  id="max"
                  type="number"
                  value={editing.max}
                  onChange={(e) => setEditing({ ...editing, max: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="effective">Effective date</Label>
                <Input
                  id="effective"
                  type="date"
                  value={editing.effectiveDate}
                  onChange={(e) => setEditing({ ...editing, effectiveDate: e.target.value })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save tariff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
