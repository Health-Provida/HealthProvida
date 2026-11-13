/**
 * UsersManagementPage.jsx
 * Manage all platform users — view, search, change roles.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import SearchFilter from '@/components/admin/SearchFilter';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { fetchUsers, updateUserRole } from '@/utils/adminQueries';
import { useAuth } from '@/context/AuthContext';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleDialog, setRoleDialog] = useState({ open: false, userId: null, userName: '', currentRole: '', newRole: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const { isSuperAdmin, hasAdminWrite, profile } = useAuth();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchUsers({ role: roleFilter || undefined, search: search || undefined });
    setUsers(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [roleFilter, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async () => {
    setActionLoading(true);
    const { error } = await updateUserRole(roleDialog.userId, roleDialog.newRole);
    setActionLoading(false);
    if (!error) {
      setRoleDialog({ open: false, userId: null, userName: '', currentRole: '', newRole: '' });
      loadUsers();
    }
  };

  const canChangeRole = (targetRole) => {
    if (isSuperAdmin) return true;
    if (hasAdminWrite && !['super_admin', 'admin', 'moderator'].includes(targetRole)) return true;
    return false;
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-900">{val || 'Unnamed'}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (val) => (
        <span className="text-sm text-gray-500">
          {new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Change Role',
      sortable: false,
      render: (_, row) => {
        if (row.id === profile?.id) return <span className="text-xs text-gray-400">You</span>;
        if (!canChangeRole(row.role)) return null;
        
        const roleOptions = isSuperAdmin
          ? ['patient', 'provider', 'moderator', 'admin', 'super_admin']
          : ['patient', 'provider'];

        return (
          <select
            value={row.role}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              setRoleDialog({
                open: true,
                userId: row.id,
                userName: row.full_name || row.email,
                currentRole: row.role,
                newRole: e.target.value,
              });
            }}
            className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
          >
            {roleOptions.map(r => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-600" />
          Users Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} users total</p>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={[{
          key: 'role', label: 'All roles', value: roleFilter,
          options: [
            { value: 'patient', label: 'Patient' },
            { value: 'provider', label: 'Provider' },
            { value: 'moderator', label: 'Moderator' },
            { value: 'admin', label: 'Admin' },
            { value: 'super_admin', label: 'Super Admin' },
          ],
        }]}
        onFilterChange={(_, val) => setRoleFilter(val)}
        onClearAll={() => { setSearch(''); setRoleFilter(''); }}
      />

      <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found" rowKey="id" />

      <ConfirmDialog
        open={roleDialog.open}
        onOpenChange={(v) => !v && setRoleDialog({ ...roleDialog, open: false })}
        title="Change User Role"
        description={`Change "${roleDialog.userName}" from ${roleDialog.currentRole?.replace('_',' ')} to ${roleDialog.newRole?.replace('_',' ')}?`}
        confirmLabel="Change Role"
        variant={['super_admin', 'admin', 'moderator'].includes(roleDialog.newRole) ? 'default' : 'danger'}
        onConfirm={handleRoleChange}
        loading={actionLoading}
      />
    </div>
  );
}
