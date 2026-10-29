import { Link } from "react-router-dom";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader, Surface } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { useLab } from "@/lib/lab-store";

export default function Patients() {
  const { patients } = useLab();
  const [query, setQuery] = useState("");
  const rows = patients.filter((p) =>
    (p.name + p.id + p.phone).toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <AppShell>
      <PageHeader
        title="Patients"
        subtitle="Patients referred to your laboratory through Health Provida"
        actions={
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients"
            className="sm:w-64"
          />
        }
      />

      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-[13.5px]">
            <thead className="border-b border-border text-[12px] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Patient ID</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Payer</th>
                <th className="px-5 py-3 font-medium">Last test</th>
                <th className="px-5 py-3 font-medium">Last order</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-secondary/60">
                  <td className="px-5 py-3.5">
                    <span className="block font-medium text-foreground">{p.name}</span>
                    <span className="block text-[12px] text-muted-foreground">
                      {p.age} · {p.gender}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.id}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.phone}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.payer}</td>
                  <td className="px-5 py-3.5 text-foreground">{p.lastTest}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/orders/${p.lastOrder}`}
                      className="text-brand-blue hover:underline"
                    >
                      {p.lastOrder}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status.toLowerCase()} label={p.status} />
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
