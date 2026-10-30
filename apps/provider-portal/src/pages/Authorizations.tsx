import { FileCheck2, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AuthorizationStatusBadge } from "@/components/provider/status-badges";
import {
  EmptyState,
  KpiCard,
  PageHeading,
  ScrollTable,
  SectionCard,
  TableSkeleton,
} from "@/components/provider/ui-bits";
import { formatNaira, useProvider } from "@/lib/provider-store";
import type { AuthorizationStatus } from "@/lib/types";

type Filter = "all" | AuthorizationStatus;

export default function AuthorizationsPage() {
  const store = useProvider();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () => store.authorizations.filter((a) => filter === "all" || a.status === filter),
    [store.authorizations, filter],
  );

  if (store.loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeading title="HMO Authorizations" description="Loading requests…" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const approved = store.authorizations.filter((a) => a.status === "approved").length;
  const review = store.authorizations.filter((a) => a.status === "manual_review").length;
  const pending = store.authorizations.filter((a) => a.status === "pending").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeading
        title="HMO Authorizations"
        description="Pre-authorization requests submitted to connected HMOs."
        actions={<RequestDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total requests" value={store.authorizations.length} icon={FileCheck2} tone="brand" />
        <KpiCard label="Approved" value={approved} icon={FileCheck2} tone="success" />
        <KpiCard label="Manual review" value={review} icon={FileCheck2} tone="warning" />
        <KpiCard label="Pending" value={pending} icon={FileCheck2} tone="info" />
      </div>

      <Tabs className="mt-4" value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="manual_review">Manual review</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      <SectionCard className="mt-4" bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No authorization requests here"
            description="Submit a new request to check coverage against the patient's plan tariff."
            action={<RequestDialog />}
          />
        ) : (
          <ScrollTable>
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>HMO / Plan</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead className="text-right">Tariff</TableHead>
                  <TableHead className="text-right">Estimate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => {
                  const patient = store.patientById(a.patientId);
                  const hmo = store.hmoById(a.hmoId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-muted-foreground">{a.requestedAt}</TableCell>
                      <TableCell>
                        <p className="font-medium">{patient?.displayName ?? "—"}</p>
                        <p className="num text-xs text-muted-foreground">{patient?.reference}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{hmo?.shortName ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{a.plan}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{a.procedure}</p>
                        <p className="num text-xs text-muted-foreground">{a.procedureCode}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{a.diagnosis}</p>
                        <p className="num text-xs text-muted-foreground">{a.icd10}</p>
                      </TableCell>
                      <TableCell className="num text-right text-sm">{formatNaira(a.tariff)}</TableCell>
                      <TableCell className="num text-right text-sm">
                        {formatNaira(a.estimatedCost)}
                      </TableCell>
                      <TableCell>
                        <AuthorizationStatusBadge status={a.status} />
                        <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                          {a.code ?? a.reason ?? ""}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollTable>
        )}
      </SectionCard>
    </div>
  );
}

function RequestDialog() {
  const store = useProvider();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hmoPatients = store.patients.filter((p) => p.payer === "hmo");

  const [patientId, setPatientId] = useState(hmoPatients[0]?.id ?? "");
  const [procedure, setProcedure] = useState(store.tariffs[0]?.service ?? "");
  const [procedureCode, setProcedureCode] = useState("PRC-1042");
  const [diagnosis, setDiagnosis] = useState("");
  const [icd10, setIcd10] = useState("");
  const [estimate, setEstimate] = useState("");

  const patient = store.patients.find((p) => p.id === patientId);
  const tariff = store.tariffs.find((t) => t.service === procedure);
  const benchmark = tariff?.benchmark ?? 0;
  const estimateValue = Number(estimate || benchmark);
  const overTariff = estimateValue > benchmark;

  async function submit() {
    if (!patient?.hmoId) return;
    setSubmitting(true);
    try {
      await store.requestAuthorization({
        patientId: patient.id,
        hmoId: patient.hmoId,
        plan: patient.plan ?? "Standard",
        procedure,
        procedureCode,
        diagnosis: diagnosis || "Unspecified clinical presentation",
        icd10: icd10 || "R69",
        tariff: benchmark,
        estimatedCost: estimateValue,
      });
      setOpen(false);
      setDiagnosis("");
      setIcd10("");
      setEstimate("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New authorization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request HMO authorization</DialogTitle>
          <DialogDescription>
            The request is validated against the patient&apos;s plan tariff. Requests above the
            benchmark are routed to manual review.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="auth-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="auth-patient">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {hmoPatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.displayName} — {p.reference}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patient ? (
              <p className="text-xs text-muted-foreground">
                {store.hmoById(patient.hmoId ?? "")?.name} · {patient.plan} ·{" "}
                <span className="num">{patient.policyNumber}</span>
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="auth-procedure">Procedure</Label>
            <Select value={procedure} onValueChange={setProcedure}>
              <SelectTrigger id="auth-procedure">
                <SelectValue placeholder="Select procedure" />
              </SelectTrigger>
              <SelectContent>
                {store.tariffs.map((t) => (
                  <SelectItem key={t.id} value={t.service}>
                    {t.service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="auth-code">Procedure code</Label>
              <Input
                id="auth-code"
                value={procedureCode}
                onChange={(e) => setProcedureCode(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="auth-icd">ICD-10 code</Label>
              <Input
                id="auth-icd"
                value={icd10}
                placeholder="e.g. H25.1"
                onChange={(e) => setIcd10(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="auth-diagnosis">Diagnosis</Label>
            <Textarea
              id="auth-diagnosis"
              rows={2}
              value={diagnosis}
              placeholder="Clinical summary supporting this request"
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="auth-estimate">Estimated cost (₦)</Label>
            <Input
              id="auth-estimate"
              inputMode="numeric"
              value={estimate}
              placeholder={String(benchmark)}
              onChange={(e) => setEstimate(e.target.value.replace(/[^0-9]/g, ""))}
            />
            <p className="text-xs text-muted-foreground">
              Plan benchmark tariff: <span className="num">{formatNaira(benchmark)}</span>
              {overTariff ? " — above benchmark, expect manual review." : ""}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting || !patient}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Checking coverage…
              </>
            ) : (
              "Submit request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
