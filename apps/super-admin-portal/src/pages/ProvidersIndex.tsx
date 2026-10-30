import { Link } from "react-router-dom";
import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { providers } from "@/lib/mock-data";
import { toast } from "sonner";

const ALL = "All";

export default function ProvidersIndex() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [verification, setVerification] = useState(ALL);

  const states = useMemo(
    () => [ALL, ...Array.from(new Set(providers.map((p) => p.state))).sort()],
    [],
  );

  const rows = providers.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      (!q ||
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.specialties.join(" ").toLowerCase().includes(q)) &&
      (state === ALL || p.state === state) &&
      (status === ALL || p.status === status) &&
      (verification === ALL || p.verification === verification)
    );
  });

  return (
    <>
      <PageHeader
        title="Hospitals & clinics"
        description="Every facility registered on Health Provida, with verification state, HMO reach and popularity ranking."
        actions={
          <Button
            variant="outline"
            onClick={() => toast.success(`Exported ${rows.length} facilities to CSV`)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by facility, city or specialty"
                className="pl-8"
                aria-label="Search facilities"
              />
            </div>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-[160px]" aria-label="Filter by state">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === ALL ? "All states" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={verification} onValueChange={setVerification}>
              <SelectTrigger className="w-[170px]" aria-label="Filter by verification">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[ALL, "Verified", "Under Review", "Submitted", "Rejected", "Changes Required"].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s === ALL ? "All verification" : s}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[ALL, "Active", "Pending", "Suspended", "Inactive"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === ALL ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">HMOs</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Popularity</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        to={`/providers/${p.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.id}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.city}, {p.state}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.type}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.verification} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.visibility} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.hmoNetworks}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.averageRating.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.popularityScore}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/providers/${p.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No facilities match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {rows.length} of {providers.length} facilities
          </p>
        </CardContent>
      </Card>
    </>
  );
}
