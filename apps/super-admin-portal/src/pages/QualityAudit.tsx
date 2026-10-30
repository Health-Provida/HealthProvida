import { Link } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { providers } from "@/lib/mock-data";

function band(score: number) {
  if (score >= 85) return { label: "Excellent", tone: "text-success" };
  if (score >= 70) return { label: "Acceptable", tone: "text-info" };
  if (score >= 55) return { label: "Watchlist", tone: "text-warning-foreground" };
  return { label: "Critical", tone: "text-destructive" };
}

export default function QualityAudit() {
  const ranked = [...providers].sort((a, b) => a.auditScore - b.auditScore);
  const average = Math.round(
    providers.reduce((sum, p) => sum + p.auditScore, 0) / providers.length,
  );
  const atRisk = providers.filter((p) => p.auditScore < 70);

  return (
    <>
      <PageHeader
        title="Quality audit"
        description="Composite score from facility photographs, documentation currency, patient ratings and encounter wait times."
        actions={
          <Button variant="outline" onClick={() => toast.success("Audit cycle scheduled for 12 facilities")}>
            Schedule audit cycle
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Network average</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{average} / 100</p>
            <Progress value={average} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Facilities below threshold</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{atRisk.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">Score under 70 triggers a re-audit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Audited facilities</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{providers.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">Rolling 90-day audit window</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Facilities ranked by audit score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Audit score</TableHead>
                  <TableHead>Band</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Wait signal</TableHead>
                  <TableHead>Last audited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map((p) => {
                  const b = band(p.auditScore);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          to={`/providers/${p.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {p.city}, {p.state}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{p.auditScore}</TableCell>
                      <TableCell className={`text-sm font-medium ${b.tone}`}>{b.label}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.averageRating.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.reviewCount} reviews
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.lastAuditedAt}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
