/**
 * Lab Samples — sample tracking cards with status advancement.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { PageHeader, Surface } from '@/components/lab/UiKit';
import { sampleStatusLabel, sampleNextAction, formatDate } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabSamples, updateSampleStatus, logLabActivity } from '@/utils/labQueries';

export default function LabSamples() {
  const { labId } = useLabAuth();
  const queryClient = useQueryClient();

  const { data: samples, isLoading } = useQuery({
    queryKey: ['lab-samples', labId],
    queryFn: () => fetchLabSamples(labId),
    enabled: !!labId,
  });

  const mutation = useMutation({
    mutationFn: ({ sampleId, status }) => updateSampleStatus(sampleId, status),
    onSuccess: (data, { label, sampleId }) => {
      queryClient.invalidateQueries({ queryKey: ['lab-samples'] });
      queryClient.invalidateQueries({ queryKey: ['lab-dashboard-stats'] });
      toast.success(label, { description: data?.sample_number });
      if (labId) logLabActivity(labId, label, 'sample', sampleId);
    },
    onError: (err) => toast.error('Failed to update sample', { description: err.message }),
  });

  return (
    <LabAppShell>
      <PageHeader
        title="Sample tracking"
        subtitle="Chain of custody for every sample in your laboratory"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        </div>
      ) : (samples || []).length === 0 ? (
        <Surface>
          <p className="py-12 text-center text-sm text-gray-500">No samples recorded yet</p>
        </Surface>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(samples || []).map((s) => {
            const action = sampleNextAction[s.status];
            return (
              <Surface key={s.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-gray-900">
                      {s.patient?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.sample_number} ·{' '}
                      <Link
                        to={`/lab/orders/${s.order?.id || s.order_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {s.order?.order_number || '—'}
                      </Link>
                    </p>
                  </div>
                  <StatusBadge status={s.status} label={sampleStatusLabel[s.status] || s.status} />
                </div>
                <dl className="mt-4 space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Test</dt>
                    <dd className="text-gray-900">{s.test_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Collection</dt>
                    <dd className="text-gray-900">
                      {s.collection_type === 'home' ? 'Home' : 'Walk-in'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-900">{formatDate(s.created_at)}</dd>
                  </div>
                </dl>
                {action && (
                  <button
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => mutation.mutate({ sampleId: s.id, status: action.status, label: action.label })}
                    disabled={mutation.isPending}
                  >
                    {action.label}
                  </button>
                )}
              </Surface>
            );
          })}
        </div>
      )}
    </LabAppShell>
  );
}
