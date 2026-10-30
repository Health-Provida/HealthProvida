import { CalendarPlus, Clock, Trash2, Users } from "lucide-react";
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
import { Pill } from "@/components/provider/status-badges";
import {
  EmptyState,
  KpiCard,
  PageHeading,
  SectionCard,
  TableSkeleton,
} from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function slotCount(start: string, end: string, duration: number) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const minutes = (eh! * 60 + em!) - (sh! * 60 + sm!);
  return minutes > 0 && duration > 0 ? Math.floor(minutes / duration) : 0;
}

export default function SchedulesPage() {
  const store = useProvider();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [form, setForm] = useState({
    doctorId: "",
    day: "Monday",
    startTime: "09:00",
    endTime: "13:00",
    slotDuration: "30",
  });

  const doctorId = form.doctorId || store.doctors[0]?.id || "";

  const schedules = useMemo(
    () =>
      store.schedules.filter((s) => doctorFilter === "all" || s.doctorId === doctorFilter),
    [store.schedules, doctorFilter],
  );

  const totalSlots = schedules.reduce((sum, s) => sum + s.slots, 0);
  const blocked = schedules.filter((s) => s.status === "blocked").length;

  async function submit() {
    if (!doctorId) return;
    const duration = Number(form.slotDuration) || 30;
    setSaving(true);
    try {
      await store.addSchedule({
        doctorId,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        slotDuration: duration,
        slots: slotCount(form.startTime, form.endTime, duration),
        status: "active",
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeading
        title="Doctor Schedules"
        description="Weekly consultation availability. Patients can only book published, active sessions."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={store.doctors.length === 0}>
                <CalendarPlus className="size-4" />
                Add session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add availability session</DialogTitle>
                <DialogDescription>
                  Slots are generated automatically from the session window and slot duration.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label>Doctor</Label>
                  <Select
                    value={doctorId}
                    onValueChange={(v) => setForm({ ...form, doctorId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {store.doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.title} {d.name} — {d.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Day</Label>
                  <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="s-start">Start</Label>
                    <Input
                      id="s-start"
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="s-end">End</Label>
                    <Input
                      id="s-end"
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="s-dur">Slot (min)</Label>
                    <Input
                      id="s-dur"
                      inputMode="numeric"
                      value={form.slotDuration}
                      onChange={(e) => setForm({ ...form, slotDuration: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This session will generate{" "}
                  <span className="font-semibold text-foreground">
                    {slotCount(form.startTime, form.endTime, Number(form.slotDuration) || 30)}
                  </span>{" "}
                  bookable slots.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={saving}>
                  {saving ? "Saving…" : "Publish session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Published sessions" value={schedules.length} icon={Clock} tone="brand" />
        <KpiCard label="Weekly slots" value={totalSlots} icon={Users} tone="success" />
        <KpiCard label="Blocked sessions" value={blocked} icon={Clock} tone="warning" />
        <KpiCard
          label="Doctors with availability"
          value={new Set(schedules.map((s) => s.doctorId)).size}
          icon={Users}
          tone="info"
        />
      </div>

      <div className="mb-4 max-w-xs">
        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All doctors</SelectItem>
            {store.doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.title} {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {store.loading ? (
        <SectionCard bodyClassName="p-0">
          <TableSkeleton />
        </SectionCard>
      ) : schedules.length === 0 ? (
        <SectionCard bodyClassName="p-0">
          <EmptyState
            icon={Clock}
            title="No availability published"
            description="Add a weekly session so patients can book this doctor."
          />
        </SectionCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {DAYS.map((day) => {
            const daySchedules = schedules.filter((s) => s.day === day);
            if (daySchedules.length === 0) return null;
            return (
              <SectionCard key={day} title={day} description={`${daySchedules.length} session(s)`}>
                <ul className="grid gap-3">
                  {daySchedules.map((s) => {
                    const doctor = store.doctorById(s.doctorId);
                    return (
                      <li
                        key={s.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {doctor ? `${doctor.title} ${doctor.name}` : "Unassigned"}
                          </p>
                          <p className="num mt-0.5 text-xs text-muted-foreground">
                            {s.startTime} – {s.endTime} · {s.slotDuration} min · {s.slots} slots
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Pill tone={s.status === "active" ? "success" : "warning"} dot>
                            {s.status === "active" ? "Active" : "Blocked"}
                          </Pill>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              store.updateSchedule(s.id, {
                                status: s.status === "active" ? "blocked" : "active",
                              })
                            }
                          >
                            {s.status === "active" ? "Block" : "Unblock"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete session"
                            onClick={() => store.removeSchedule(s.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
