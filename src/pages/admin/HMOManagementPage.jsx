/**
 * HMOManagementPage.jsx
 * Manage HMOs — add, edit, toggle active, delete.
 */
import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { fetchAllHMOs, createHMO, updateHMO, deleteHMO } from '@/utils/adminQueries';

export default function HMOManagementPage() {
  const [hmos, setHmos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchAllHMOs();
    setHmos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddLoading(true);
    await createHMO(newName.trim());
    setAddLoading(false);
    setNewName('');
    load();
  };

  const handleToggleActive = async (id, current) => {
    await updateHMO(id, { is_active: !current });
    load();
  };

  const handleDelete = async () => {
    setActionLoading(true);
    await deleteHMO(deleteDialog.id);
    setActionLoading(false);
    setDeleteDialog({ open: false, id: null, name: '' });
    load();
  };

  const columns = [
    {
      key: 'name',
      label: 'HMO Name',
      render: (val) => <span className="font-medium text-gray-900">{val}</span>,
    },
    {
      key: 'clinic_count',
      label: 'Clinics',
      render: (val) => <span className="text-sm text-gray-500">{val} clinics</span>,
    },
    {
      key: 'is_active',
      label: 'Active',
      sortable: false,
      render: (val, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(row.id, val); }}
          className={`transition ${val ? 'text-emerald-600' : 'text-gray-400'} hover:opacity-80`}
        >
          {val ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
        </button>
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-12',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: row.id, name: row.name }); }}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-7 h-7 text-teal-600" />
          HMO Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">{hmos.length} HMOs registered</p>
      </div>

      {/* Add new HMO */}
      <motion.form
        onSubmit={handleAdd}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-3"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new HMO name..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
        />
        <button
          type="submit"
          disabled={addLoading || !newName.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {addLoading ? 'Adding...' : 'Add HMO'}
        </button>
      </motion.form>

      <DataTable columns={columns} data={hmos} loading={loading} emptyMessage="No HMOs found" rowKey="id" />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(v) => !v && setDeleteDialog({ open: false, id: null, name: '' })}
        title="Delete HMO"
        description={`Delete "${deleteDialog.name}"? Clinics currently linked to this HMO will lose the association.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
