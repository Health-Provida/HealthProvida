/**
 * Lab Dashboard — real-time KPI cards, recent orders, and activity feed.
 * Converted from Lovable TSX to JSX. Uses Supabase via React Query.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FlaskConical, TestTubes, Wallet, ArrowRight } from 'lucide-react';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { KpiCard, PageHeader, Surface } from '@/components/lab/UiKit';
import { formatNaira, orderStatusLabel, orderTotal, formatDate, timeAgo } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchDashboardStats, fetchLabOrders, fetchLabActivity } from '@/utils/labQueries';

export default function LabDashboard() {
  const { labId, currentLab } = useLabAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['lab-dashboard-stats', labId],
    queryFn: () => fetchDashboardStats(labId),
    enabled: !!labId,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['lab-recent-orders', labId],
    queryFn: () => fetchLabOrders(labId),
    enabled: !!labId,
    select: (data) => (data || []).slice(0, 6),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['lab-activity', labId],
    queryFn: () => fetchLabActivity(labId, 8),
    enabled: !!labId,
  });

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <LabAppShell>
      <PageHeader
        title="Today's laboratory activity"
        subtitle={`${currentLab?.name || 'Laboratory'} · ${today}`}
        actions={
          <Link
            to="/lab/orders"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            View all orders
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="New orders"
          value={statsLoading ? '—' : (stats?.newOrders ?? 0)}
          hint="Awaiting acceptance"
          icon={ClipboardList}
          to="/lab/orders"
        />
        <KpiCard
          label="Samples pending"
          value={statsLoading ? '—' : (stats?.pendingSamples ?? 0)}
          hint="Collection & processing"
          icon={TestTubes}
          to="/lab/samples"
        />
        <KpiCard
          label="Results to review"
          value={statsLoading ? '—' : (stats?.awaitingReview ?? 0)}
          hint="Ready for approval"
          icon={FlaskConical}
          to="/lab/results"
          tone="green"
        />
        <KpiCard
          label="Revenue (this week)"
          value={statsLoading ? '—' : formatNaira(stats?.revenue ?? 0)}
          hint="Delivered & completed orders"
          icon={Wallet}
          to="/lab/tests"
          tone="green"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Surface
          className="lg:col-span-2"
          title="Recent orders"
          description="Latest requests routed to your laboratory"
          action={
            <Link to="/lab/orders" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              All orders <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          }
        >
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            </div>
          ) : (recentOrders || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No orders yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(recentOrders || []).map((o) => (
                <li key={o.id}>
                  <Link
                    to={`/lab/orders/${o.id}`}
                    className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 sm:px-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900">
                        {o.patient?.full_name || 'Unknown Patient'}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {o.order_number} · {(o.tests || []).map((t) => t.test_name).join(', ')}
                      </span>
                    </span>
                    <span className="text-[13px] font-semibold text-gray-900">
                      {formatNaira(orderTotal(o.tests))}
                    </span>
                    <StatusBadge status={o.status} label={orderStatusLabel[o.status] || o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <Surface title="Activity feed" description="Live updates across the portal">
          {activityLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            </div>
          ) : (activity || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No activity yet</p>
          ) : (
            <ul className="space-y-4 px-4 py-4 sm:px-5">
              {(activity || []).map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span
                    className={
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full ' +
                      (a.action?.includes('publish') || a.action?.includes('complet')
                        ? 'bg-green-500'
                        : 'bg-blue-500')
                    }
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-[13.5px] font-medium text-gray-900">{a.action}</span>
                    <span className="block text-xs text-gray-500">{timeAgo(a.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </LabAppShell>
  );
}
