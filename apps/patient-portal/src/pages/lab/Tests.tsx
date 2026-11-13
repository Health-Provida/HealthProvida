/**
 * Lab Tests & Pricing — test catalog management.
 */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { PageHeader, Surface } from '@/components/lab/UiKit';
import { formatNaira } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabTests, toggleLabTest } from '@/utils/labQueries';

export default function LabTests() {
  const { labId, canManageTests } = useLabAuth();
  const queryClient = useQueryClient();

  const { data: tests, isLoading } = useQuery({
    queryKey: ['lab-tests', labId],
    queryFn: () => fetchLabTests(labId),
    enabled: !!labId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ testId, isActive }) => toggleLabTest(testId, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success(data.is_active ? 'Test listed' : 'Test unlisted', { description: data.name });
    },
    onError: (err) => toast.error('Failed to update test', { description: err.message }),
  });

  return (
    <LabAppShell>
      <PageHeader
        title="Tests & pricing"
        subtitle="Your catalogue as listed to patients on Health Provida"
        actions={
          canManageTests && (
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => toast('Add test', { description: 'Form coming soon' })}
            >
              Add test
            </button>
          )
        }
      />

      <Surface>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13.5px]">
              <thead className="border-b border-gray-100 text-xs text-gray-500">
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
              <tbody className="divide-y divide-gray-100">
                {(tests || []).map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{t.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{t.category}</td>
                    <td className="px-5 py-3.5 text-gray-900">{formatNaira(t.lab_price)}</td>
                    <td className="px-5 py-3.5 font-semibold text-blue-600">{formatNaira(t.hp_price)}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {t.home_collection ? 'Available' : 'Not available'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        status={t.is_active ? 'active' : 'inactive'}
                        label={t.is_active ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {canManageTests && (
                        <button
                          onClick={() => toggleMutation.mutate({ testId: t.id, isActive: !t.is_active })}
                          disabled={toggleMutation.isPending}
                          className={
                            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors ' +
                            (t.is_active ? 'bg-blue-600' : 'bg-gray-300')
                          }
                          role="switch"
                          aria-checked={t.is_active}
                          aria-label={`Toggle ${t.name}`}
                        >
                          <span
                            className={
                              'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ' +
                              (t.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]')
                            }
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Surface>
    </LabAppShell>
  );
}
