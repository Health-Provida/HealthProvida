import { Link } from "react-router-dom";
import { Bell, Building2, ShieldCheck, UserCog } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Pill, VerificationBadge } from "@/components/provider/status-badges";
import { DataField, PageHeading, SectionCard } from "@/components/provider/ui-bits";
import { useProvider } from "@/lib/provider-store";

export default function SettingsPage() {
  const store = useProvider();
  const hospital = store.hospital;
  const [prefs, setPrefs] = useState({
    newBookings: true,
    checkIns: true,
    authorizations: true,
    reviews: false,
    weeklyDigest: true,
  });
  const [booking, setBooking] = useState({
    autoConfirm: true,
    allowTelemedicine: true,
    leadTimeHours: "2",
    cancellationWindow: "12",
  });
  const [account, setAccount] = useState({
    contactName: "Mrs. Folake Adeniyi",
    role: "Facility Administrator",
    email: hospital?.email ?? "operations@lifebridgehospital.ng",
    phone: hospital?.phone ?? "+234 802 445 1180",
  });

  return (
    <div>
      <PageHeading
        title="Settings"
        description="Account, notification and booking preferences for this facility."
        actions={hospital ? <VerificationBadge state={hospital.verification} /> : null}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid gap-4 xl:col-span-2">
          <SectionCard title="Account contact" description="Primary portal administrator.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="a-name">Full name</Label>
                <Input
                  id="a-name"
                  value={account.contactName}
                  onChange={(e) => setAccount({ ...account, contactName: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="a-role">Role</Label>
                <Input
                  id="a-role"
                  value={account.role}
                  onChange={(e) => setAccount({ ...account, role: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="a-email">Email</Label>
                <Input
                  id="a-email"
                  type="email"
                  value={account.email}
                  onChange={(e) => setAccount({ ...account, email: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="a-phone">Phone</Label>
                <Input
                  id="a-phone"
                  value={account.phone}
                  onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Notification preferences" description="Choose what alerts you receive.">
            <ul className="grid gap-3">
              {(
                [
                  ["newBookings", "New bookings", "Alert when a patient books an appointment."],
                  ["checkIns", "Patient check-ins", "Alert when front desk checks a patient in."],
                  [
                    "authorizations",
                    "HMO authorizations",
                    "Alert on approval, decline or manual review.",
                  ],
                  ["reviews", "Patient reviews", "Alert when a patient leaves a review."],
                  ["weeklyDigest", "Weekly performance digest", "Summary email every Monday."],
                ] as const
              ).map(([key, title, desc]) => (
                <li
                  key={key}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={prefs[key]}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, [key]: checked })}
                    aria-label={title}
                  />
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Booking rules" description="How patients can book your facility.">
            <div className="grid gap-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Auto-confirm bookings</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Confirm slots instantly instead of requiring manual approval.
                  </p>
                </div>
                <Switch
                  checked={booking.autoConfirm}
                  onCheckedChange={(v) => setBooking({ ...booking, autoConfirm: v })}
                  aria-label="Auto-confirm bookings"
                />
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Accept telemedicine</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Allow virtual consultations for eligible doctors.
                  </p>
                </div>
                <Switch
                  checked={booking.allowTelemedicine}
                  onCheckedChange={(v) => setBooking({ ...booking, allowTelemedicine: v })}
                  aria-label="Accept telemedicine"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Minimum booking lead time</Label>
                  <Select
                    value={booking.leadTimeHours}
                    onValueChange={(v) => setBooking({ ...booking, leadTimeHours: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "4", "12", "24"].map((h) => (
                        <SelectItem key={h} value={h}>
                          {h} hour{h === "1" ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Free cancellation window</Label>
                  <Select
                    value={booking.cancellationWindow}
                    onValueChange={(v) => setBooking({ ...booking, cancellationWindow: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["6", "12", "24", "48"].map((h) => (
                        <SelectItem key={h} value={h}>
                          {h} hours before
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 self-start">
          <SectionCard title="Facility">
            <div className="grid gap-4">
              <DataField label="Facility" value={hospital?.name ?? "—"} />
              <DataField
                label="Listing"
                value={
                  <Pill tone={hospital?.visibility === "promoted" ? "brand" : "neutral"}>
                    {hospital?.visibility === "promoted" ? "Promoted" : "Organic"}
                  </Pill>
                }
              />
              <Button asChild variant="outline">
                <Link to="/facility">
                  <Building2 className="size-4" />
                  Edit facility profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/verification">
                  <ShieldCheck className="size-4" />
                  Verification centre
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/notifications">
                  <Bell className="size-4" />
                  Notification history
                </Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Team access">
            <ul className="grid gap-3">
              {[
                ["Mrs. Folake Adeniyi", "Facility Administrator"],
                ["Chinedu Okafor", "Front Desk"],
                ["Dr. Amaka Eze", "Clinical Lead"],
              ].map(([name, role]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <UserCog className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
