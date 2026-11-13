/**
 * Lab Settings — account, notification preferences, and team management.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import LabAppShell from '@/components/lab/AppShell';
import { PageHeader, Surface } from '@/components/lab/UiKit';
import { labRoleLabel } from '@/lib/lab-data';
import { useAuth } from '@/context/AuthContext';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabStaff } from '@/utils/labQueries';

const prefs = [
  { id: 'orders', label: 'New order alerts', desc: 'Notify me when a new order is routed here' },
  { id: 'samples', label: 'Sample updates', desc: 'Collection and processing status changes' },
  { id: 'results', label: 'Result reminders', desc: 'Remind me about results awaiting review' },
  { id: 'pricing', label: 'Pricing changes', desc: 'Updates to listed Health Provida prices' },
];

export default function LabSettings() {
  const { profile } = useAuth();
  const { labId, labRole, isLabAdmin } = useLabAuth();

  const { data: staffList } = useQuery({
    queryKey: ['lab-staff', labId],
    queryFn: () => fetchLabStaff(labId),
    enabled: !!labId,
  });

  return (
    <LabAppShell>
      <PageHeader title="Settings" subtitle="Account, notifications and team access" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Account">
          <div className="grid gap-4 px-5 py-4">
            <div>
              <label className="text-[13px] font-medium text-gray-700">Full name</label>
              <input className="mt-1.5 h-9 w-full rounded-md border border-gray-200 px-3 text-sm" defaultValue={profile?.full_name || ''} />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700">Email</label>
              <input className="mt-1.5 h-9 w-full rounded-md border border-gray-200 px-3 text-sm" defaultValue={profile?.email || ''} readOnly />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700">Role</label>
              <input className="mt-1.5 h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm" defaultValue={labRoleLabel[labRole] || labRole || ''} readOnly />
            </div>
            <button
              className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => toast.success('Account updated')}
            >
              Save account
            </button>
          </div>
        </Surface>

        <Surface title="Notification preferences">
          <ul className="divide-y divide-gray-100">
            {prefs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.label}</p>
                  <p className="text-[12.5px] text-gray-500">{p.desc}</p>
                </div>
                <button
                  className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-600 transition-colors"
                  role="switch"
                  aria-checked="true"
                  aria-label={p.label}
                  onClick={() => toast(p.label + ' toggled')}
                >
                  <span className="inline-block h-3.5 w-3.5 translate-x-[18px] rounded-full bg-white transition-transform" />
                </button>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface title="Team access" className="lg:col-span-2">
          <ul className="divide-y divide-gray-100">
            {(staffList || []).map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {s.profiles?.full_name || 'Staff member'}
                  </p>
                  <p className="text-[12.5px] text-gray-500">
                    {labRoleLabel[s.role] || s.role}
                  </p>
                </div>
                {isLabAdmin && (
                  <button
                    className="text-sm text-gray-500 hover:text-blue-600"
                    onClick={() => toast('Manage access (coming soon)')}
                  >
                    Manage
                  </button>
                )}
              </li>
            ))}
            {(staffList || []).length === 0 && (
              <li className="py-8 text-center text-sm text-gray-500">No team members found</li>
            )}
          </ul>
        </Surface>
      </div>
    </LabAppShell>
  );
}
