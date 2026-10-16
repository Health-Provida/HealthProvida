/**
 * Lab Profile — laboratory organization details and branches.
 */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import LabAppShell from '@/components/lab/AppShell';
import { PageHeader, Surface } from '@/components/lab/UiKit';
import { useLabAuth } from '@/context/LabAuthContext';
import { fetchLabOrganization, updateLabOrganization, fetchLabBranches, fetchLabHours } from '@/utils/labQueries';

export default function LabProfile() {
  const { labId, isLabAdmin } = useLabAuth();
  const queryClient = useQueryClient();

  const { data: lab } = useQuery({
    queryKey: ['lab-org', labId],
    queryFn: () => fetchLabOrganization(labId),
    enabled: !!labId,
  });

  const { data: branches } = useQuery({
    queryKey: ['lab-branches', labId],
    queryFn: () => fetchLabBranches(labId),
    enabled: !!labId,
  });

  const { data: hours } = useQuery({
    queryKey: ['lab-hours', labId],
    queryFn: () => fetchLabHours(labId),
    enabled: !!labId,
  });

  const saveMutation = useMutation({
    mutationFn: (updates) => updateLabOrganization(labId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-org'] });
      toast.success('Profile saved');
    },
    onError: (err) => toast.error('Save failed', { description: err.message }),
  });

  const handleSave = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    saveMutation.mutate({
      name: form.get('name'),
      registration_number: form.get('registration'),
      email: form.get('email'),
      phone: form.get('phone'),
      about: form.get('about'),
    });
  };

  return (
    <LabAppShell>
      <PageHeader
        title="Laboratory profile"
        subtitle="How your laboratory appears to patients and partners"
        actions={
          isLabAdmin && (
            <button
              form="lab-profile-form"
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={saveMutation.isPending}
            >
              Save changes
            </button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Surface title="Laboratory details">
            <form id="lab-profile-form" onSubmit={handleSave} className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <div>
                <label className="text-[13px] font-medium text-gray-700">Laboratory name</label>
                <input name="name" defaultValue={lab?.name || ''} className="mt-1.5 h-9 w-full rounded-md border border-gray-200 px-3 text-sm" readOnly={!isLabAdmin} />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700">Registration number</label>
                <input name="registration" defaultValue={lab?.registration_number || ''} className="mt-1.5 h-9 w-full rounded-md border border-gray-200 px-3 text-sm" readOnly={!isLabAdmin} />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700">Email</label>
                <input name="email" defaultValue={lab?.email || ''} className="mt-1.5 h-9 w-full rounded-md border border-gray-200 px-3 text-sm" readOnly={!isLabAdmin} />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700">Phone</label>
                <input name="phone" defaultValue={lab?.phone || ''} className="mt-1.5 h-9 w-full rounded-md border border-gray-200 px-3 text-sm" readOnly={!isLabAdmin} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[13px] font-medium text-gray-700">About</label>
                <textarea name="about" className="mt-1.5 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" rows={4} defaultValue={lab?.about || ''} readOnly={!isLabAdmin} />
              </div>
            </form>
          </Surface>

          <Surface title="Branches">
            <ul className="divide-y divide-gray-100">
              {(branches || []).map((b) => (
                <li key={b.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.name}</p>
                    <p className="text-[12.5px] text-gray-500">{b.address}</p>
                  </div>
                  {isLabAdmin && (
                    <button
                      className="text-sm text-gray-500 hover:text-blue-600"
                      onClick={() => toast('Edit branch (coming soon)')}
                    >
                      Edit
                    </button>
                  )}
                </li>
              ))}
              {(branches || []).length === 0 && (
                <li className="py-8 text-center text-sm text-gray-500">No branches configured</li>
              )}
            </ul>
          </Surface>
        </div>

        <div className="space-y-6">
          <Surface title="Verification">
            <div className="px-5 py-4">
              {lab?.is_verified ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified Laboratory
                  </span>
                  <p className="mt-3 text-[13px] text-gray-500">
                    Verified by Health Provida.
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Verification pending.</p>
              )}
            </div>
          </Surface>

          <Surface title="Operating hours">
            <ul className="divide-y divide-gray-100 text-[13.5px]">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => {
                const h = (hours || []).find(hr => hr.day === day);
                return (
                  <li key={day} className="flex justify-between px-5 py-3">
                    <span className="text-gray-500">{day}</span>
                    <span className="text-gray-900">
                      {h ? (h.is_open ? `${h.open_time || ''} – ${h.close_time || ''}` : 'Closed') : '—'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Surface>
        </div>
      </div>
    </LabAppShell>
  );
}
