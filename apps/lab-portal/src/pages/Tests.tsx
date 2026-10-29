import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatNaira } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";

export default function Tests() {
  const { tests, toggleTest } = useLab();

  return (
    <AppShell>
      <PageHeader
        title="Tests & pricing"
        subtitle="Your catalogue as listed to patients on Health Provida"
        actions={
          <Button
            className="bg-brand-blue hover:bg-brand-blue/90"
            onClick={() => toast("Add test", { description: "Demo prototype — form coming soon" })}
          >
            Add test
          </Button>
        }
      />

      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13.5px]">
            <thead className="border-b border-border text-[12px] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Test</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Lab price</th>
                <th className="px-5 py-3 font-medium">Health Provida price</th>
                <th className="px-5 py-3 font-medium">Home collection</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tests.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-secondary/60">
                  <td className="px-5 py-3.5 font-medium text-foreground">{t.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{t.category}</td>
                  <td className="px-5 py-3.5 text-foreground">{formatNaira(t.labPrice)}</td>
                  <td className="px-5 py-3.5 font-semibold text-brand-blue">
                    {formatNaira(t.hpPrice)}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {t.homeCollection ? "Available" : "Not available"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={t.active ? "active" : "inactive"}
                      label={t.active ? "Active" : "Inactive"}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Switch
                      checked={t.active}
                      onCheckedChange={() => {
                        toggleTest(t.id);
                        toast.success(t.active ? "Test unlisted" : "Test listed", {
                          description: t.name,
                        });
                      }}
                      aria-label={`Toggle ${t.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>
    </AppShell>
  );
}
