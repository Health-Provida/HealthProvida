import { Link } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { resultStatusLabel } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";

export default function ResultsIndex() {
  const { results } = useLab();

  return (
    <AppShell>
      <PageHeader
        title="Results management"
        subtitle="Enter values, review and publish results to Health Provida"
      />

      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13.5px]">
            <thead className="border-b border-border text-[12px] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Test</th>
                <th className="px-5 py-3 font-medium">Sample</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-secondary/60">
                  <td className="px-5 py-3.5 font-medium text-foreground">{r.orderId}</td>
                  <td className="px-5 py-3.5 text-foreground">{r.patientName}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.test}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.sampleId}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} label={resultStatusLabel[r.status]} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to={`/results/${r.id}`}
                        className="text-brand-blue"
                      >
                        {r.status === "published" ? "View" : "Open"}
                      </Link>
                    </Button>
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
