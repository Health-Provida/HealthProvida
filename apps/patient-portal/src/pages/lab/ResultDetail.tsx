/**
 * Lab Result Detail — view and edit analyte values, publish results.
 */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { PageHeader, Surface } from '@/components/lab/UiKit';
import { resultStatusLabel, formatDate } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabResult, updateLabResult, upsertResultRows, publishResult, logLabActivity } from '@/utils/labQueries';

export default function LabResultDetail() {
  const { resultId } = useParams();
  const queryClient = useQueryClient();
  const { labId, canPublishResults } = useLabAuth();

  const { data: result, isLoading } = useQuery({
    queryKey: ['lab-result', resultId],
    queryFn: () => fetchLabResult(resultId),
    enabled: !!resultId,
  });

  const [localRows, setLocalRows] = useState([]);
  const [summary, setSummary] = useState('');
  const [comment, setComment] = useState('');

  // Sync local state when result loads
  useEffect(() => {
    if (result) {
      setLocalRows(result.rows || []);
      setSummary(result.summary || '');
      setComment(result.comment || '');
    }
  }, [result]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateLabResult(resultId, { summary, comment, status: 'review' });
      await upsertResultRows(resultId, localRows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-result', resultId] });
      queryClient.invalidateQueries({ queryKey: ['lab-results'] });
      toast.success('Saved as draft', { description: result?.order?.order_number });
    },
    onError: (err) => toast.error('Save failed', { description: err.message }),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      await updateLabResult(resultId, { summary, comment });
      await upsertResultRows(resultId, localRows);
      return publishResult(resultId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-result', resultId] });
      queryClient.invalidateQueries({ queryKey: ['lab-results'] });
      queryClient.invalidateQueries({ queryKey: ['lab-dashboard-stats'] });
      toast.success('Result published', { description: `${result?.patient?.full_name} has been notified` });
      if (labId) logLabActivity(labId, 'Result published', 'result', Number(resultId));
    },
    onError: (err) => toast.error('Publish failed', { description: err.message }),
  });

  if (isLoading) {
    return (
      <LabAppShell>
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        </div>
      </LabAppShell>
    );
  }

  if (!result) {
    return (
      <LabAppShell>
        <PageHeader title="Result not found" subtitle={`No result matches ID ${resultId}.`} />
        <Link to="/lab/results" className="text-sm font-medium text-blue-600">← Back to results</Link>
      </LabAppShell>
    );
  }

  const readOnly = result.status === 'published';

  return (
    <LabAppShell>
      <Link
        to="/lab/results"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </Link>

      <PageHeader
        title={`${result.test_name} — ${result.patient?.full_name || 'Patient'}`}
        subtitle={`${result.order?.order_number || ''} · Sample ${result.sample?.sample_number || ''} · ${formatDate(result.created_at)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={result.status} label={resultStatusLabel[result.status] || result.status} />
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => toast('Preparing PDF', { description: 'Demo export only' })}
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            {!readOnly && (
              <>
                <button
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || publishMutation.isPending}
                >
                  Save draft
                </button>
                {canPublishResults && (
                  <button
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    onClick={() => publishMutation.mutate()}
                    disabled={saveMutation.isPending || publishMutation.isPending}
                  >
                    Publish result
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Surface className="lg:col-span-2" title="Analyte values">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13.5px]">
              <thead className="border-b border-gray-100 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Analyte</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Reference range</th>
                  <th className="px-5 py-3 font-medium">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {localRows.map((row, i) => (
                  <tr key={row.id || row.analyte || i}>
                    <td className="px-5 py-3 text-gray-900">{row.analyte}</td>
                    <td className="px-5 py-3">
                      <input
                        value={row.value}
                        readOnly={readOnly}
                        onChange={(e) =>
                          setLocalRows((prev) =>
                            prev.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r))
                          )
                        }
                        className="h-9 w-40 rounded-md border border-gray-200 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                        disabled={readOnly}
                      />
                    </td>
                    <td className="px-5 py-3 text-gray-500">{row.ref_range}</td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={row.flag === 'Normal' ? 'completed' : 'review'}
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
              <textarea
                value={summary}
                readOnly={readOnly}
                placeholder="Short summary of findings"
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                disabled={readOnly}
              />
            </div>
          </Surface>
          <Surface title="Clinical interpretation">
            <div className="px-5 py-4">
              <textarea
                value={comment}
                readOnly={readOnly}
                placeholder="Pathologist comment"
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                disabled={readOnly}
              />
            </div>
          </Surface>
        </div>
      </div>
    </LabAppShell>
  );
}
