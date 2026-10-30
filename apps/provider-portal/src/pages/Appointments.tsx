import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarX2, Search } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentStatusBadge, PayerBadge } from "@/components/provider/status-badges";
import {
  EmptyState,
  PageHeading,
  ScrollTable,
  SectionCard,
  TableSkeleton,
} from "@/components/provider/ui-bits";
import { TODAY, formatDate, useProvider } from "@/lib/provider-store";
import type { Appointment } from "@/lib/types";

type TabKey = "all" | "today" | "upcoming" | "completed" | "cancelled" | "no_show";

const PAGE_SIZE = 8;

export default function AppointmentsPage() {
  const store = useProvider();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("all");
  const [doctor, setDoctor] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [payer, setPayer] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const specialties = useMemo(
    () => Array.from(new Set(store.appointments.map((a) => a.specialty))),
    [store.appointments],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.appointments
      .filter((a) => {
        if (tab === "today" && a.date !== TODAY) return false;
        if (tab === "upcoming" && !(a.date > TODAY)) return false;
        if (tab === "completed" && a.status !== "completed") return false;
        if (tab === "cancelled" && a.status !== "cancelled") return false;
        if (tab === "no_show" && a.status !== "no_show") return false;
        if (doctor !== "all" && a.doctorId !== doctor) return false;
        if (specialty !== "all" && a.specialty !== specialty) return false;
        if (payer !== "all" && a.payer !== payer) return false;
        if (status !== "all" && a.status !== status) return false;
        if (date && a.date !== date) return false;
        if (term) {
          const patient = store.patientById(a.patientId);
          const haystack = `${a.reference} ${patient?.reference ?? ""} ${patient?.displayName ?? ""}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [store, tab, doctor, specialty, payer, status, date, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function resetFilters() {
    setDoctor("all");
    setSpecialty("all");
    setPayer("all");
    setStatus("all");
    setDate("");
    setPage(1);
    void navigate("/appointments");
  }

  if (store.loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeading title="Appointments" description="Loading bookings…" />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeading
        title="Appointments"
        description="All bookings made through Health Provida for this facility."
        actions={<Button variant="outline" onClick={resetFilters}>Reset filters</Button>}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as TabKey);
          setPage(1);
        }}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="no_show">No-show</TabsTrigger>
        </TabsList>
      </Tabs>

      <SectionCard className="mt-4" bodyClassName="p-0">
        <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="relative sm:col-span-2 xl:col-span-2">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setPage(1);
                setSearchParams(e.target.value ? { q: e.target.value } : {});
              }}
              placeholder="Search patient or appointment reference"
              aria-label="Search appointments"
              className="pl-8"
            />
          </div>
          <Input
            type="date"
            value={date}
            aria-label="Filter by date"
            className="num"
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />
          <Select value={doctor} onValueChange={(v) => { setDoctor(v); setPage(1); }}>
            <SelectTrigger aria-label="Filter by doctor" className="w-full">
              <SelectValue placeholder="Doctor" />
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
          <Select value={specialty} onValueChange={(v) => { setSpecialty(v); setPage(1); }}>
            <SelectTrigger aria-label="Filter by specialty" className="w-full">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All specialties</SelectItem>
              {specialties.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={payer} onValueChange={(v) => { setPayer(v); setPage(1); }}>
            <SelectTrigger aria-label="Filter by payer" className="w-full">
              <SelectValue placeholder="Payer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payers</SelectItem>
              <SelectItem value="direct_pay">Direct Pay</SelectItem>
              <SelectItem value="hmo">HMO Covered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger aria-label="Filter by status" className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="in_consultation">In Consultation</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No-show</SelectItem>
            </SelectContent>
          </Select>
        </div>


        {rows.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="No appointments match these filters"
            description="Adjust the date, doctor or payer filters to widen the result set."
            action={<Button variant="outline" onClick={resetFilters}>Reset filters</Button>}
          />
        ) : (
          <>
            <ScrollTable>
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Time</TableHead>
                    <TableHead className="w-[160px]">Patient</TableHead>
                    <TableHead className="w-[180px]">Doctor</TableHead>
                    <TableHead className="w-[170px]">Specialty</TableHead>
                    <TableHead className="w-[180px]">Type</TableHead>
                    <TableHead className="w-[130px]">Payer</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                    <TableHead className="w-[92px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((apt) => (
                    <Row key={apt.id} appointment={apt} />
                  ))}
                </TableBody>
              </Table>
            </ScrollTable>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border p-3">
              <p className="text-xs text-muted-foreground">
                Showing {rows.length} of {filtered.length} appointments
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                >
                  Previous
                </Button>
                <span className="num text-xs text-muted-foreground">
                  {current} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === pageCount}
                  onClick={() => setPage(current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

function Row({ appointment }: { appointment: Appointment }) {
  const store = useProvider();
  const patient = store.patientById(appointment.patientId);
  const doctor = store.doctorById(appointment.doctorId);

  return (
    <TableRow>
      <TableCell className="num align-middle whitespace-nowrap">
        <span className="font-medium">{appointment.time}</span>
        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
          {formatDate(appointment.date)}
        </span>
      </TableCell>
      <TableCell className="align-middle">
        <span className="ref block font-medium">{patient?.reference}</span>
        <span className="ref mt-0.5 block text-xs leading-4 text-muted-foreground">
          {appointment.reference}
        </span>
      </TableCell>
      <TableCell className="align-middle whitespace-nowrap">
        {doctor?.title} {doctor?.name}
      </TableCell>
      <TableCell className="align-middle whitespace-nowrap">{appointment.specialty}</TableCell>
      <TableCell className="align-middle whitespace-nowrap">
        {appointment.appointmentType}
      </TableCell>
      <TableCell className="align-middle"><PayerBadge payer={appointment.payer} /></TableCell>
      <TableCell className="align-middle">
        <AppointmentStatusBadge status={appointment.status} />
      </TableCell>

      <TableCell className="text-right">
        <Button asChild size="sm" variant="outline">
          <Link to={"/appointments/" + appointment.id}>
            View
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
