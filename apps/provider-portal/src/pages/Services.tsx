import { AlertTriangle, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatNaira, useProvider } from "@/lib/provider-store";

export default function ServicesPage() {
  const store = useProvider();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const tariffs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.tariffs.filter(
      (t) =>
        !q || t.service.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    );
  }, [store.tariffs, query]);

  const aboveBenchmark = store.tariffs.filter((t) => t.providerPrice > t.benchmark);
  const activeCount = store.tariffs.filter((t) => t.status === "active").length;
  const categories = new Set(store.tariffs.map((t) => t.category)).size;

  async function save(id: string) {
    const price = Number(draft);
    if (!Number.isNaN(price) && price > 0) {
      await store.updateTariff(id, { providerPrice: price });
    }
    setEditing(null);
  }

  return (
    <div>
      <PageHeading
        title="Services & Tariffs"
        description="Services listed for booking. Prices above the HMO benchmark trigger manual authorization review."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Listed services" value={store.tariffs.length} icon={Receipt} tone="brand" />
        <KpiCard label="Active" value={activeCount} icon={TrendingUp} tone="success" />
        <KpiCard
          label="Above benchmark"
          value={aboveBenchmark.length}
          icon={AlertTriangle}
          tone="warning"
          hint="These require manual HMO review"
        />
        <KpiCard label="Categories" value={categories} icon={Receipt} tone="info" />
      </div>

      <SectionCard
        title="Service catalogue"
        description="Click a price to edit it."
        actions={
          <Input
            placeholder="Search services…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-56"
          />
        }
        bodyClassName="p-0"
      >
        {store.loading ? (
          <TableSkeleton />
        ) : tariffs.length === 0 ? (
          <EmptyState icon={Receipt} title="No services match" description="Adjust your search." />
        ) : (
          <ScrollTable>
            <Table className="data-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Your price</TableHead>
                  <TableHead className="text-right">HMO benchmark</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead className="text-right">Listed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs.map((t) => {
                  const diff = t.providerPrice - t.benchmark;
                  const pct = t.benchmark ? Math.round((diff / t.benchmark) * 100) : 0;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.service}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {t.category}
                      </TableCell>
                      <TableCell className="text-right">
                        {editing === t.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              autoFocus
                              inputMode="numeric"
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void save(t.id);
                                if (e.key === "Escape") setEditing(null);
                              }}
                              className="h-8 w-28"
                            />
                            <Button size="sm" onClick={() => save(t.id)}>
                              Save
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="num rounded px-2 py-1 font-medium hover:bg-muted"
                            onClick={() => {
                              setEditing(t.id);
                              setDraft(String(t.providerPrice));
                            }}
                          >
                            {formatNaira(t.providerPrice)}
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="num text-right whitespace-nowrap text-muted-foreground">
                        {formatNaira(t.benchmark)}
                      </TableCell>
                      <TableCell>
                        {diff === 0 ? (
                          <Pill tone="neutral">At benchmark</Pill>
                        ) : diff > 0 ? (
                          <Pill tone="warning">
                            <TrendingUp className="size-3" />+{pct}%
                          </Pill>
                        ) : (
                          <Pill tone="success">
                            <TrendingDown className="size-3" />
                            {pct}%
                          </Pill>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={t.status === "active"}
                          onCheckedChange={(checked) =>
                            store.updateTariff(t.id, { status: checked ? "active" : "inactive" })
                          }
                          aria-label={`Toggle ${t.service}`}
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
