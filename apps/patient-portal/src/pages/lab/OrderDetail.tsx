/**
 * Lab Order Detail — view order details and advance status.
 */
import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import LabAppShell from '@/components/lab/AppShell';
import StatusBadge from '@/components/lab/StatusBadge';
import { PageHeader, Surface, Timeline } from '@/components/lab/UiKit';
import { formatNaira, orderStatusLabel, orderTotal, orderTimelineSteps, orderStepIndex } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabOrder, updateOrderStatus, logLabActivity } from '@/utils/labQueries';

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export default function LabOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { labId } = useLabAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ['lab-order', orderId],
    queryFn: () => fetchLabOrder(orderId),
    enabled: !!orderId,
  });

  const mutation = useMutation({
    mutationFn: ({ status }) => updateOrderStatus(orderId, status),
    onSuccess: (_, { status, message }) => {
      queryClient.invalidateQueries({ queryKey: ['lab-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      queryClient.invalidateQueries({ queryKey: ['lab-dashboard-stats'] });
      toast.success(message, { description: order?.order_number });
      if (labId) {
        logLabActivity(labId, message, 'order', Number(orderId));
      }
    },
    onError: (err) => toast.error('Failed to update order', { description: err.message }),
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

  if (!order) {
    return (
      <LabAppShell>
        <PageHeader title="Order not found" subtitle={`No laboratory order matches ID ${orderId}.`} />
        <Link to="/lab/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to orders
        </Link>
      </LabAppShell>
    );
  }

  const advance = (status, message) => mutation.mutate({ status, message });
  const tests = order.tests || [];
  const patientName = order.patient?.full_name || 'Unknown Patient';

  return (
    <LabAppShell>
      <Link
        to="/lab/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <PageHeader
        title={order.order_number}
        subtitle={`Ordered ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · ${order.payer || 'Self-pay'}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} label={orderStatusLabel[order.status] || order.status} />
            {order.status === 'new' && (
              <>
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => advance('awaiting_sample', 'Order accepted')}
                  disabled={mutation.isPending}
                >
                  Accept order
                </button>
                <button
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => advance('cancelled', 'Order declined')}
                  disabled={mutation.isPending}
                >
                  Decline
                </button>
              </>
            )}
            {order.status === 'awaiting_sample' && (
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={() => advance('processing', 'Sample marked as collected')}
                disabled={mutation.isPending}
              >
                Mark sample collected
              </button>
            )}
            {order.status === 'processing' && (
              <button
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                onClick={() => {
                  advance('results_ready', 'Result marked ready');
                  navigate('/lab/results');
                }}
                disabled={mutation.isPending}
              >
                Upload result
              </button>
            )}
            {order.status === 'results_ready' && (
              <button
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                onClick={() => advance('completed', 'Result delivered to patient')}
                disabled={mutation.isPending}
              >
                Deliver result
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Surface title="Patient information">
            <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <Field label="Full name" value={patientName} />
              <Field label="Payer" value={order.payer || 'Self-pay'} />
              <Field
                label="Phone"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> {order.patient?.phone || '—'}
                  </span>
                }
              />
              <Field label="Email" value={order.patient?.email || '—'} />
            </dl>
          </Surface>

          <Surface title="Requested tests">
            <ul className="divide-y divide-gray-100">
              {tests.map((t) => (
                <li key={t.id || t.test_name} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-gray-900">{t.test_name}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatNaira(t.price)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between bg-gray-50 px-5 py-3.5">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-[15px] font-semibold text-blue-600">
                  {formatNaira(orderTotal(tests))}
                </span>
              </li>
            </ul>
          </Surface>

          <Surface title="Collection details">
            <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <Field
                label="Type"
                value={order.collection_type === 'home' ? 'Home collection' : 'Walk-in visit'}
              />
              <Field
                label="Scheduled"
                value={order.collection_date ? `${order.collection_date} · ${order.collection_time || ''}` : '—'}
              />
              <Field
                label={order.collection_type === 'home' ? 'Address' : 'Branch'}
                value={
                  <span className="inline-flex items-start gap-1.5">
                    {order.collection_type === 'home' ? (
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    ) : (
                      <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    )}
                    {order.collection_address || order.branch?.name || '—'}
                  </span>
                }
              />
              <Field label="Instructions" value={order.instructions || 'None provided'} />
            </dl>
          </Surface>
        </div>

        <Surface title="Order timeline">
          <div className="px-5 py-4">
            <Timeline steps={orderTimelineSteps} currentIndex={orderStepIndex[order.status] ?? 0} />
          </div>
        </Surface>
      </div>
    </LabAppShell>
  );
}
