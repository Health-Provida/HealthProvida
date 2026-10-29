import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const prefs = [
  { id: "orders", label: "New order alerts", desc: "Notify me when a new order is routed here" },
  { id: "samples", label: "Sample updates", desc: "Collection and processing status changes" },
  { id: "results", label: "Result reminders", desc: "Remind me about results awaiting review" },
  { id: "pricing", label: "Pricing changes", desc: "Updates to listed Health Provida prices" },
];

export default function Settings() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Account, notifications and team access" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Account">
          <div className="grid gap-4 px-5 py-4">
            <div>
              <Label className="text-[13px]">Full name</Label>
              <Input className="mt-1.5" defaultValue="Dr. Ifeoma Nnamdi" />
            </div>
            <div>
              <Label className="text-[13px]">Email</Label>
              <Input className="mt-1.5" defaultValue="ifeoma@meridiandiagnostics.ng" />
            </div>
            <div>
              <Label className="text-[13px]">Role</Label>
              <Input className="mt-1.5" defaultValue="Laboratory Administrator" readOnly />
            </div>
            <Button
              className="w-fit bg-brand-blue hover:bg-brand-blue/90"
              onClick={() => toast.success("Account updated")}
            >
              Save account
            </Button>
          </div>
        </Surface>

        <Surface title="Notification preferences">
          <ul className="divide-y divide-border">
            {prefs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-[14px] font-medium text-foreground">{p.label}</p>
                  <p className="text-[12.5px] text-muted-foreground">{p.desc}</p>
                </div>
                <Switch
                  defaultChecked
                  aria-label={p.label}
                  onCheckedChange={(v) =>
                    toast(v ? "Enabled" : "Disabled", { description: p.label })
                  }
                />
              </li>
            ))}
          </ul>
        </Surface>

        <Surface title="Team access" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {[
              ["Dr. Ifeoma Nnamdi", "Laboratory Administrator"],
              ["Samuel Okoro", "Phlebotomist"],
              ["Ngozi Umeh", "Medical Laboratory Scientist"],
            ].map(([name, role]) => (
              <li key={name} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-[14px] font-medium text-foreground">{name}</p>
                  <p className="text-[12.5px] text-muted-foreground">{role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast("Manage access (demo)")}>
                  Manage
                </Button>
              </li>
            ))}
          </ul>
        </Surface>
      </div>
    </AppShell>
  );
}
