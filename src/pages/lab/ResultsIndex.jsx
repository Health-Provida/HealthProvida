/**
 * Lab Results Index — table listing all results.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { PageHeader, Surface } from '@/components/lab/UiKit';
import { resultStatusLabel, formatDate } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabResults } from '@/utils/labQueries';

export default function LabResultsIndex() {
  const { labId } = useLabAuth();

  const { data: results, isLoading } = useQuery({
    queryKey: ['lab-results', labId],
    queryFn: () => fetchLabResults(labId),
    enabled: !!labId,
  });

  return (
    <LabAppShell>
      <PageHeader
        title="Results management"
        subtitle="Enter values, review and publish results to Health Provida"
      />

      <Surface>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
        ) : (results || []).length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No results recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13.5px]">
              <thead className="border-b border-gray-100 text-xs text-gray-500">
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
              <tbody className="divide-y divide-gray-100">
                {(results || []).map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {r.order?.order_number || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-900">
                      {r.patient?.full_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{r.test_name}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {r.sample?.sample_number || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} label={resultStatusLabel[r.status] || r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/lab/results/${r.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {r.status === 'published' ? 'View' : 'Open'}
                      </Link>
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
