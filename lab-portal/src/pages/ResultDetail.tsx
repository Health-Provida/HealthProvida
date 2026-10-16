import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { resultStatusLabel } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";

export default function ResultDetail() {
  const { resultId } = useParams<{ resultId: string }>();
  const { results, updateResult, setResultStatus, pushActivity } = useLab();
  const result = results.find((r) => r.id === resultId);

  if (!result) {
    return (
      <AppShell>
        <PageHeader title="Result not found" subtitle={`No result matches ${resultId}.`} />
        <Button asChild variant="outline">
          <Link to="/results">Back to results</Link>
        </Button>
      </AppShell>
    );
  }

  const readOnly = result.status === "published";

  return (
    <AppShell>
      <Link
        to="/results"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-brand-blue"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </Link>

      <PageHeader
        title={`${result.test} — ${result.patientName}`}
        subtitle={`${result.orderId} · Sample ${result.sampleId} · ${result.date}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={result.status} label={resultStatusLabel[result.status]} />
            <Button
              variant="outline"
              onClick={() => toast("Preparing PDF", { description: "Demo export only" })}
            >
              <Download className="mr-1.5 h-4 w-4" /> Download PDF
            </Button>
            {!readOnly && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResultStatus(result.id, "review");
                    toast.success("Saved as draft", { description: result.orderId });
                  }}
                >
                  Save draft
                </Button>
                <Button
                  className="bg-brand-green hover:bg-brand-green/90"
                  onClick={() => {
                    setResultStatus(result.id, "published");
                    pushActivity({
                      title: "Result published to Health Provida",
                      meta: `${result.orderId} · just now`,
                      type: "success",
                    });
                    toast.success("Result published", {
                      description: `${result.patientName} has been notified`,
                    });
                  }}
                >
                  Publish result
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Surface className="lg:col-span-2" title="Analyte values">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13.5px]">
              <thead className="border-b border-border text-[12px] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Analyte</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Reference range</th>
                  <th className="px-5 py-3 font-medium">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.rows.map((row, i) => (
                  <tr key={row.analyte}>
                    <td className="px-5 py-3 text-foreground">{row.analyte}</td>
                    <td className="px-5 py-3">
                      <Input
                        value={row.value}
                        readOnly={readOnly}
                        onChange={(e) =>
                          updateResult(result.id, {
                            rows: result.rows.map((r, idx) =>
                              idx === i ? { ...r, value: e.target.value } : r,
                            ),
                          })
                        }
                        className="h-9 w-40"
                      />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{row.range}</td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={row.flag === "Normal" ? "completed" : "review"}
                        label={row.flag}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface title="Summary">
            <div className="px-5 py-4">
              <Textarea
                value={result.summary}
                readOnly={readOnly}
                placeholder="Short summary of findings"
                onChange={(e) => updateResult(result.id, { summary: e.target.value })}
                rows={4}
              />
            </div>
          </Surface>
          <Surface title="Clinical interpretation">
            <div className="px-5 py-4">
              <Textarea
                value={result.comment}
                readOnly={readOnly}
                placeholder="Pathologist comment"
                onChange={(e) => updateResult(result.id, { comment: e.target.value })}
                rows={5}
              />
            </div>
          </Surface>
        </div>
      </div>
    </AppShell>
  );
}
