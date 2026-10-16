/**
 * Lab Notifications — unread/read notification list.
 */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2 } from 'lucide-react';
import LabAppShell from '@/components/lab/AppShell';
import { EmptyState, PageHeader, Surface } from '@/components/lab/UiKit';
import { timeAgo } from '@/lib/lab-data';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabNotifications, markNotificationRead, markAllNotificationsRead } from '@/utils/labQueries';

export default function LabNotifications() {
  const { labId } = useLabAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['lab-notifications', labId],
    queryFn: () => fetchLabNotifications(labId),
    enabled: !!labId,
  });

  const markReadMutation = useMutation({
    mutationFn: (notifId) => markNotificationRead(notifId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lab-notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(labId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lab-notifications'] }),
  });

  const unread = (notifications || []).filter((n) => !n.is_read).length;

  return (
    <LabAppShell>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread updates` : "You're all caught up"}
        actions={
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => markAllMutation.mutate()}
            disabled={unread === 0 || markAllMutation.isPending}
          >
            Mark all as read
          </button>
        }
      />

      <Surface>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
        ) : (notifications || []).length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Order, sample and result updates will appear here in real time."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {(notifications || []).map((n) => (
              <li
                key={n.id}
                className={
                  'flex items-start gap-3 px-5 py-4 transition-colors ' +
                  (!n.is_read ? 'bg-blue-50/40' : '')
                }
              >
                <span
                  className={
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ' +
                    (n.type === 'success'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-blue-50 text-blue-600')
                  }
                >
                  {n.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-[13px] text-gray-500">{n.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => markReadMutation.mutate(n.id)}
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </LabAppShell>
  );
}
