/**
 * Lab Patients — patients referred through Health Provida.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { PageHeader, Surface } from '@/components/lab/UiKit';
import { formatDate } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabPatients } from '@/utils/labQueries';

export default function LabPatients() {
  const { labId } = useLabAuth();
  const [query, setQuery] = useState('');

  const { data: patients, isLoading } = useQuery({
    queryKey: ['lab-patients', labId],
    queryFn: () => fetchLabPatients(labId),
    enabled: !!labId,
  });

  const rows = (patients || []).filter((p) =>
    (p.full_name + p.id + (p.phone || '')).toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <LabAppShell>
      <PageHeader
        title="Patients"
        subtitle="Patients referred to your laboratory through Health Provida"
        actions={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients"
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
          />
        }
      />

      <Surface>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-[13.5px]">
              <thead className="border-b border-gray-100 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Last order</th>
                  <th className="px-5 py-3 font-medium">Last visit</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-gray-900">{p.full_name || '—'}</span>
                      <span className="block text-xs text-gray-500">{p.email || ''}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{p.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-900">{p.order_count || 0}</td>
                    <td className="px-5 py-3.5">
                      {p.last_order_number ? (
                        <span className="text-blue-600">{p.last_order_number}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(p.last_order_date)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        status={p.last_order_status === 'completed' ? 'active' : 'active'}
                        label="Active"
                      />
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
