import { Link } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TableSkeleton,
} from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";

const eligibilityTone = {
  eligible: "success",
  review: "warning",
  ineligible: "danger",
} as const;

export default function HmoPatientsPage() {
  const store = useProvider();
  const [term, setTerm] = useState("");
  const [hmo, setHmo] = useState("all");

  const patients = useMemo(() => {
    const q = term.trim().toLowerCase();
    return store.patients.filter((p) => {
      if (p.payer !== "hmo") return false;
      if (hmo !== "all" && p.hmoId !== hmo) return false;
      if (q) {
        const hay = `${p.reference} ${p.displayName} ${p.policyNumber ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [store.patients, term, hmo]);

  if (store.loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeading title="HMO Patients" description="Loading covered patients…" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const connected = store.hmos.filter((h) => h.networkStatus === "connected").length;
  const eligible = store.patients.filter((p) => p.eligibility === "eligible").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeading
        title="HMO Patients"
        description="Patients booked under a health maintenance organisation plan."
        actions={
          <Button asChild>
            <Link to="/authorizations">Request authorization</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="HMO patients"
          value={store.patients.filter((p) => p.payer === "hmo").length}
          icon={ShieldCheck}
          tone="info"
        />
        <KpiCard label="Eligible" value={eligible} icon={ShieldCheck} tone="success" />
        <KpiCard
          label="Connected HMOs"
          value={`${connected}/${store.hmos.length}`}
          icon={ShieldCheck}
          tone="brand"
        />
      </div>

      <SectionCard className="mt-4" bodyClassName="p-0">
        <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search patient reference or policy number"
              aria-label="Search HMO patients"
              className="pl-8"
            />
          </div>
          <Select value={hmo} onValueChange={setHmo}>
            <SelectTrigger aria-label="Filter by HMO">
              <SelectValue placeholder="HMO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All HMOs</SelectItem>
              {store.hmos.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {patients.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No HMO patients match"
            description="Try a different HMO or clear the search term."
          />
        ) : (
          <ScrollTable>
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>HMO</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Policy number</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => {
                  const org = p.hmoId ? store.hmoById(p.hmoId) : undefined;
                  const tone = p.eligibility ? eligibilityTone[p.eligibility] : "neutral";
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">{p.displayName}</p>
                        <p className="num text-xs text-muted-foreground">
                          {p.reference} · {p.sex} · {p.ageBand}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{org?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{p.plan ?? "—"}</TableCell>
                      <TableCell className="num text-sm">{p.policyNumber ?? "—"}</TableCell>
                      <TableCell>
                        <Pill tone={tone} dot>
                          {p.eligibility ?? "unknown"}
                        </Pill>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/authorizations">Authorize</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollTable>
        )}
      </SectionCard>

      <SectionCard
        className="mt-4"
        title="HMO network connections"
        description="Connection status determines whether authorizations can be submitted electronically."
        bodyClassName="p-0"
      >
        <ScrollTable>
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>HMO</TableHead>
                <TableHead>Plans mapped</TableHead>
                <TableHead>Network status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {store.hmos.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {h.plans.join(", ")}
                  </TableCell>
                  <TableCell>
                    <Pill
                      dot
                      tone={
                        h.networkStatus === "connected"
                          ? "success"
                          : h.networkStatus === "pending"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {h.networkStatus.replace("_", " ")}
                    </Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollTable>
      </SectionCard>
    </div>
  );
}
