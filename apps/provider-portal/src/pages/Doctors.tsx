import { Stethoscope, UserPlus, Video } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
import type { ConsultationType } from "@/lib/types";
import { formatNaira, useProvider } from "@/lib/provider-store";

const SPECIALTIES = [
  "General Practice",
  "Ophthalmology",
  "Cardiology",
  "Obstetrics & Gynaecology",
  "Paediatrics",
  "Dermatology",
  "Orthopaedics",
];

export default function DoctorsPage() {
  const store = useProvider();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "Dr.",
    specialty: SPECIALTIES[0]!,
    consultationType: "physical" as ConsultationType,
    consultationFee: "15000",
  });

  const active = store.doctors.filter((d) => d.active);
  const telemedicine = store.doctors.filter((d) => d.consultationType === "telemedicine");
  const avgFee = store.doctors.length
    ? Math.round(
        store.doctors.reduce((sum, d) => sum + d.consultationFee, 0) / store.doctors.length,
      )
    : 0;

  async function submit() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await store.addDoctor({
        name: form.name.trim(),
        title: form.title,
        specialty: form.specialty,
        consultationType: form.consultationType,
        consultationFee: Number(form.consultationFee) || 0,
        active: true,
      });
      setOpen(false);
      setForm((f) => ({ ...f, name: "" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeading
        title="Doctors & Specialists"
        description="Clinicians listed under this facility. Only active doctors appear in patient search and booking."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="size-4" />
                Add doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a doctor</DialogTitle>
                <DialogDescription>
                  The doctor becomes bookable once your facility verification is approved.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2 sm:grid-cols-[110px_minmax(0,1fr)]">
                  <div className="grid gap-1.5">
                    <Label htmlFor="doc-title">Title</Label>
                    <Input
                      id="doc-title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="doc-name">Full name</Label>
                    <Input
                      id="doc-name"
                      placeholder="Adaeze Nwachukwu"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
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
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Consultation type</Label>
                    <Select
                      value={form.consultationType}
                      onValueChange={(v) =>
                        setForm({ ...form, consultationType: v as ConsultationType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="telemedicine">Telemedicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="doc-fee">Consultation fee (₦)</Label>
                    <Input
                      id="doc-fee"
                      inputMode="numeric"
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={saving || !form.name.trim()}>
                  {saving ? "Adding…" : "Add doctor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Listed doctors" value={store.doctors.length} icon={Stethoscope} tone="brand" />
        <KpiCard label="Active & bookable" value={active.length} icon={Stethoscope} tone="success" />
        <KpiCard label="Telemedicine" value={telemedicine.length} icon={Video} tone="info" />
        <KpiCard
          label="Average fee"
          value={formatNaira(avgFee)}
          icon={Stethoscope}
          hint="Across all listed clinicians"
        />
      </div>

      <SectionCard title="Doctor roster" bodyClassName="p-0">
        {store.loading ? (
          <TableSkeleton />
        ) : store.doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors listed"
            description="Add your first clinician to start accepting bookings."
          />
        ) : (
          <ScrollTable>
            <Table className="data-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Consultation</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Schedules</TableHead>
                  <TableHead className="text-right">Bookable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.doctors.map((d) => {
                  const schedules = store.schedules.filter((s) => s.doctorId === d.id).length;
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {d.title} {d.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{d.specialty}</TableCell>
                      <TableCell>
                        <Pill tone={d.consultationType === "telemedicine" ? "info" : "neutral"}>
                          {d.consultationType === "telemedicine" ? "Telemedicine" : "Physical"}
                        </Pill>
                      </TableCell>
                      <TableCell className="num text-right whitespace-nowrap">
                        {formatNaira(d.consultationFee)}
                      </TableCell>
                      <TableCell className="num">{schedules}</TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={d.active}
                          onCheckedChange={(checked) => store.updateDoctor(d.id, { active: checked })}
                          aria-label={`Toggle ${d.name}`}
                        />
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
