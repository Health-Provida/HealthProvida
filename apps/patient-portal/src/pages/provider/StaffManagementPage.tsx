/**
 * StaffManagementPage.jsx
 * List, add, edit, and remove staff members with role assignment.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Save, Trash2, AlertCircle, CheckCircle, Mail, Phone, Edit2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchProviderClinic } from '@/utils/providerQueries';
import { fetchClinicStaff, addStaffMember, updateStaffMember, removeStaffMember } from '@/utils/staffQueries';

const ROLES = ['Doctor', 'Nurse', 'Receptionist', 'Lab Technician', 'Pharmacist', 'Administrator', 'Other'];

const ROLE_COLORS = {
  Doctor: 'bg-blue-50 text-blue-700 border-blue-200',
  Nurse: 'bg-green-50 text-green-700 border-green-200',
  Receptionist: 'bg-purple-50 text-purple-700 border-purple-200',
  'Lab Technician': 'bg-amber-50 text-amber-700 border-amber-200',
  Pharmacist: 'bg-teal-50 text-teal-700 border-teal-200',
  Administrator: 'bg-slate-50 text-slate-700 border-slate-200',
  Other: 'bg-gray-50 text-gray-700 border-gray-200',
};

const emptyForm = { fullName: '', role: 'Doctor', email: '', phone: '' };

export default function StaffManagementPage() {
  const [clinicId, setClinicId] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState(null);

  const { user } = useAuth();

  useEffect(() => { if (user?.id) init(); }, [user?.id]);

  const init = async () => {
    const { data } = await fetchProviderClinic(user.id);
    if (data) {
      setClinicId(data.id);
      await load(data.id);
    }
    setLoading(false);
  };

  const load = async (cId) => {
    const { data } = await fetchClinicStaff(cId || clinicId);
    setStaff(data || []);
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMessage(null);
  };

  const handleEdit = (member) => {
    setForm({
      fullName: member.full_name,
      role: member.role,
      email: member.email || '',
      phone: member.phone || '',
    });
    setEditingId(member.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return;
    }
    setSaving(true);
    setMessage(null);

    if (editingId) {
      const { error } = await updateStaffMember(editingId, form);
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update.' });
      } else {
        setMessage({ type: 'success', text: 'Staff member updated!' });
        setShowForm(false);
        setEditingId(null);
      }
    } else {
      const { error } = await addStaffMember(clinicId, form);
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to add.' });
      } else {
        setMessage({ type: 'success', text: 'Staff member added!' });
        setShowForm(false);
      }
    }

    await load(clinicId);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    setDeleting(id);
    await removeStaffMember(id);
    await load(clinicId);
    setDeleting(null);
    setMessage({ type: 'success', text: 'Staff member removed.' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your clinic's team members</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Dr. Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@clinic.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {staff.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No staff members yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your team to manage your clinic together</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {staff.map((member) => (
              <div key={member.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50/30 transition ${deleting === member.id ? 'opacity-50' : ''}`}>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{member.full_name}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${ROLE_COLORS[member.role] || ROLE_COLORS.Other}`}>
                      {member.role}
                    </span>
                    {!member.is_active && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-600 border border-red-200">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {member.email && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {member.email}
                      </span>
                    )}
                    {member.phone && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {member.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleEdit(member)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} disabled={deleting === member.id} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
