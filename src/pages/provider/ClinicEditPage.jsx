/**
 * ClinicEditPage.jsx
 * Edit clinic details, specialties, equipment, and tags.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, AlertCircle, CheckCircle, X, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProviderClinic,
  updateClinicDetails,
  updateClinicTags,
  updateClinicSpecialties,
  updateClinicEquipment,
} from '@/utils/providerQueries';

export default function ClinicEditPage() {
  const [clinic, setClinic] = useState(null);
  const [form, setForm] = useState({
    practitionerName: '',
    practiceType: '',
    address: '',
    phone: '',
    email: '',
  });
  const [tags, setTags] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const { user } = useAuth();

  useEffect(() => { if (user?.id) loadClinic(); }, [user?.id]);

  const loadClinic = async () => {
    setLoading(true);
    const { data, error } = await fetchProviderClinic(user.id);
    if (data) {
      setClinic(data);
      setForm({
        practitionerName: data.practitioner_name || '',
        practiceType: data.practice_type || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
      });
      setTags(data.clinic_tags?.map((t) => t.tag) || []);
      setSpecialties(data.clinic_specialties?.map((s) => s.specialty) || []);
      setEquipment(data.clinic_equipment?.map((e) => e.equipment_name) || []);
    }
    if (error) setMessage({ type: 'error', text: 'Failed to load clinic data.' });
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const results = await Promise.all([
      updateClinicDetails(clinic.id, form),
      updateClinicTags(clinic.id, tags),
      updateClinicSpecialties(clinic.id, specialties),
      updateClinicEquipment(clinic.id, equipment),
    ]);

    const hasError = results.some((r) => r.error);
    if (hasError) {
      setMessage({ type: 'error', text: 'Some changes could not be saved. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Clinic updated successfully!' });
    }
    setSaving(false);
  };

  const addItem = (list, setList, value, setValue) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setValue('');
  };

  const removeItem = (list, setList, item) => {
    setList(list.filter((i) => i !== item));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Clinic</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Clinic</h1>
          <p className="text-gray-500 text-sm mt-1">Edit your clinic's information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-500" /> Basic Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinic Name</label>
            <input
              value={form.practitionerName}
              onChange={(e) => setForm({ ...form, practitionerName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Practice Type</label>
            <input
              value={form.practiceType}
              onChange={(e) => setForm({ ...form, practiceType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tag Sections */}
      <TagSection title="Specialties" items={specialties} setItems={setSpecialties} newValue={newSpecialty} setNewValue={setNewSpecialty} addItem={addItem} removeItem={removeItem} color="green" />
      <TagSection title="Equipment & Facilities" items={equipment} setItems={setEquipment} newValue={newEquipment} setNewValue={setNewEquipment} addItem={addItem} removeItem={removeItem} color="blue" />
      <TagSection title="Tags" items={tags} setItems={setTags} newValue={newTag} setNewValue={setNewTag} addItem={addItem} removeItem={removeItem} color="teal" />
    </div>
  );
}

function TagSection({ title, items, setItems, newValue, setNewValue, addItem, removeItem, color }) {
  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  };
  const c = colorMap[color] || colorMap.teal;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="flex gap-2 mb-3">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addItem(items, setItems, newValue, setNewValue); }
          }}
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
        />
        <button
          onClick={() => addItem(items, setItems, newValue, setNewValue)}
          className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
              {item}
              <button onClick={() => removeItem(items, setItems, item)} className="hover:opacity-70 transition">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {items.length === 0 && (
        <p className="text-xs text-gray-400">No {title.toLowerCase()} added yet.</p>
      )}
    </div>
  );
}
