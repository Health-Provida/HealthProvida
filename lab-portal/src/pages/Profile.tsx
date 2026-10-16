import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LAB_NAME } from "@/lib/lab-data";

export default function Profile() {
  return (
    <AppShell>
      <PageHeader
        title="Laboratory profile"
        subtitle="How your laboratory appears to patients and partners"
        actions={
          <Button
            className="bg-brand-blue hover:bg-brand-blue/90"
            onClick={() => toast.success("Profile saved", { description: LAB_NAME })}
          >
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Surface title="Laboratory details">
            <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <FormField label="Laboratory name" defaultValue={LAB_NAME} />
              <FormField label="Registration number" defaultValue="MLSCN/LAG/2019/4471" />
              <FormField label="Email" defaultValue="partners@meridiandiagnostics.ng" />
              <FormField label="Phone" defaultValue="+234 812 004 5566" />
              <div className="sm:col-span-2">
                <Label className="text-[13px]">About</Label>
                <Textarea
                  className="mt-1.5"
                  rows={4}
                  defaultValue="Meridian Diagnostic Centre is an ISO 15189 accredited laboratory network in Lagos offering haematology, chemistry, serology and molecular diagnostics with same-day home sample collection."
                />
              </div>
            </div>
          </Surface>

          <Surface title="Branches">
            <ul className="divide-y divide-border">
              {[
                { name: "Meridian Ikeja Branch", address: "42 Awolowo Way, Ikeja, Lagos" },
                { name: "Meridian Lekki Branch", address: "7B Admiralty Way, Lekki Phase 1, Lagos" },
                {
                  name: "Meridian Victoria Island",
                  address: "18 Adeola Odeku Street, Victoria Island, Lagos",
                },
              ].map((b) => (
                <li key={b.name} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-[14px] font-medium text-foreground">{b.name}</p>
                    <p className="text-[12.5px] text-muted-foreground">{b.address}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast("Edit branch (demo)")}>
                    Edit
                  </Button>
                </li>
              ))}
            </ul>
          </Surface>
        </div>

        <div className="space-y-6">
          <Surface title="Verification">
            <div className="px-5 py-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/25 bg-tint-green px-2.5 py-1 text-[12px] font-medium text-brand-green">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified Laboratory
              </span>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Accreditation: ISO 15189:2022 · Verified by Health Provida on 12 March 2026.
              </p>
            </div>
          </Surface>

          <Surface title="Operating hours">
            <ul className="divide-y divide-border text-[13.5px]">
              {[
                ["Monday – Friday", "07:00 – 19:00"],
                ["Saturday", "08:00 – 16:00"],
                ["Sunday", "Closed"],
              ].map(([day, hours]) => (
                <li key={day} className="flex justify-between px-5 py-3">
                  <span className="text-muted-foreground">{day}</span>
                  <span className="text-foreground">{hours}</span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>
      </div>
    </AppShell>
  );
}

function FormField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <Label className="text-[13px]">{label}</Label>
      <Input className="mt-1.5" defaultValue={defaultValue} />
    </div>
  );
}
