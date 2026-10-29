/**
 * Lab Orders Index — filterable table of all laboratory orders.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { EmptyState, PageHeader, Surface } from '@/components/lab/UiKit';
import { formatNaira, orderStatusLabel, orderTotal } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabOrders } from '@/utils/labQueries';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'awaiting_sample', label: 'Awaiting Sample' },
  { key: 'processing', label: 'Processing' },
  { key: 'results_ready', label: 'Results Ready' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function LabOrdersIndex() {
  const { labId } = useLabAuth();
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['lab-orders', labId],
    queryFn: () => fetchLabOrders(labId),
    enabled: !!labId,
  });

  const rows = (orders || []).filter((o) => {
    const matchStatus = status === 'all' || o.status === status;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      (o.patient?.full_name || '').toLowerCase().includes(q) ||
      o.order_number.toLowerCase().includes(q) ||
      (o.tests || []).some((t) => t.test_name.toLowerCase().includes(q));
    return matchStatus && matchQuery;
  });

  return (
    <LabAppShell>
      <PageHeader
        title="Laboratory orders"
        subtitle="All diagnostic requests routed to your laboratory"
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={
                'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ' +
                (status === f.key
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 bg-white text-gray-500 hover:text-gray-900')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient, order ID or test"
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 lg:w-72"
        />
      </div>

      <Surface>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders match this view"
            description="Try a different status filter or clear your search to see all laboratory orders."
            action={
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => { setStatus('all'); setQuery(''); }}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-[13.5px]">
              <thead className="border-b border-gray-100 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Test(s)</th>
                  <th className="px-5 py-3 font-medium">Collection</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{o.order_number}</td>
                    <td className="px-5 py-3.5">
                      <span className="block text-gray-900">{o.patient?.full_name || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {(o.tests || []).map((t) => t.test_name).join(', ')}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {o.collection_type === 'home' ? 'Home collection' : 'Walk-in'}
                      {o.collection_date && (
                        <span className="block text-xs">
                          {o.collection_date} · {o.collection_time || ''}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {formatNaira(orderTotal(o.tests))}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.status} label={orderStatusLabel[o.status] || o.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/lab/orders/${o.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View
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
