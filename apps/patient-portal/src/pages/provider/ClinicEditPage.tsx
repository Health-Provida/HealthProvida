/**
 * ClinicEditPage.jsx
 * Edit clinic details, specialties, equipment, facilities, HMOs, and tags.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Save, AlertCircle, CheckCircle, X, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProviderClinic,
  updateClinicDetails,
  updateClinicTags,
  updateClinicSpecialties,
  updateClinicEquipment,
  updateClinicHMOs,
} from '@/utils/providerQueries';
import { fetchHMOs } from '@/utils/supabaseQueries';

// Options mirrored from JoinProviderPage
const SPECIALTY_OPTIONS = [
  'General Practice',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Gynecology',
  'Ophthalmology',
  'Dentistry',
  'Surgery',
  'Emergency Medicine',
  'Radiology',
  'Neurology',
];

const EQUIPMENT_OPTIONS = [
  'X-Ray Machine',
  'Ultrasound',
  'ECG Monitor',
  'CT Scan',
  'MRI Machine',
  'Laboratory',
  'Pharmacy',
  'Operating Theater',
  'ICU Facilities',
  'Dental Equipment',
  'Dialysis Machine',
  'Ambulance',
];

function DropdownChipPicker({ label, options, selected, onAdd, onRemove, color }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const colorMap = {
    green: { chip: 'bg-green-50 text-green-700 border-green-200', hover: 'hover:bg-green-50' },
    blue:  { chip: 'bg-blue-50 text-blue-700 border-blue-200',   hover: 'hover:bg-blue-50'  },
  };
  const c = colorMap[color] || colorMap.green;

  const filtered = options.filter(
    (o) => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (option) => { onAdd(option); setQuery(''); };
  const handleAddCustom = () => {
    const t = query.trim();
    if (t && !selected.includes(t)) { onAdd(t); setQuery(''); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{label}</h2>
      <div className="relative" ref={ref}>
        <div
          className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-text transition ${open ? 'border-teal-400 ring-2 ring-teal-100 bg-white' : 'hover:border-gray-300'}`}
          onClick={() => setOpen(true)}
        >
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder={`Search or add ${label.toLowerCase()}...`}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto"
            >
              {filtered.length > 0 ? filtered.map((opt) => (
                <button
                  key={opt}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                  className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 ${c.hover} transition`}
                >
                  {opt}
                </button>
              )) : (
                <div className="px-4 py-3 text-xs text-gray-400">
                  {query.trim() ? `Press Enter to add "${query.trim()}"` : 'All options already selected'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((item) => (
            <span key={item} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${c.chip}`}>
              {item}
              <button onClick={() => onRemove(item)} className="hover:opacity-70 transition"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 mt-3">No {label.toLowerCase()} added yet.</p>
      )}
    </div>
  );
}

function HMOPicker({ hmos, selectedIds, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-500" /> Accepted HMOs
      </h2>
      <p className="text-xs text-gray-500 mb-4">Select all health maintenance organisations your clinic accepts.</p>
      {hmos.length === 0 ? (
        <p className="text-xs text-gray-400">No HMOs available.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hmos.map((hmo) => {
              const active = selectedIds.includes(hmo.id);
              return (
                <button
                  key={hmo.id}
                  type="button"
                  onClick={() => onToggle(hmo.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition text-left ${active ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/40'}`}
                >
                  <Shield className={`w-4 h-4 flex-shrink-0 ${active ? 'text-purple-500' : 'text-gray-400'}`} />
                  <span className="flex-1">{hmo.name}</span>
                  {active && <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          {selectedIds.length > 0 && (
            <p className="text-xs text-purple-600 font-medium mt-3">{selectedIds.length} HMO{selectedIds.length !== 1 ? 's' : ''} selected</p>
          )}
        </>
      )}
    </div>
  );
}

function TagSection({ title, items, setItems, newValue, setNewValue, addItem, removeItem }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="flex gap-2 mb-3">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(items, setItems, newValue, setNewValue); } }}
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
        />
        <button onClick={() => addItem(items, setItems, newValue, setNewValue)} className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">+</button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              {item}
              <button onClick={() => removeItem(items, setItems, item)} className="hover:opacity-70 transition"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No {title.toLowerCase()} added yet.</p>
      )}
    </div>
  );
}

export default function ClinicEditPage() {
  const [clinic, setClinic] = useState(null);
  const [form, setForm] = useState({ practitionerName: '', practiceType: '', address: '', phone: '', email: '' });
  const [tags, setTags] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedHmoIds, setSelectedHmoIds] = useState([]);
  const [availableHmos, setAvailableHmos] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const { user } = useAuth();

  useEffect(() => { if (user?.id) loadData(); }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    const [clinicRes, hmosRes] = await Promise.all([fetchProviderClinic(user.id), fetchHMOs()]);
    if (hmosRes.data) setAvailableHmos(hmosRes.data);
    const { data, error } = clinicRes;
    if (data) {
      setClinic(data);
      setForm({ practitionerName: data.practitioner_name || '', practiceType: data.practice_type || '', address: data.address || '', phone: data.phone || '', email: data.email || '' });
      setTags(data.clinic_tags?.map((t) => t.tag) || []);
      setSpecialties(data.clinic_specialties?.map((s) => s.specialty) || []);
      setEquipment(data.clinic_equipment?.map((e) => e.equipment_name) || []);
      setSelectedHmoIds(data.clinic_hmos?.map((ch) => ch.hmo_id).filter(Boolean) || []);
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
      updateClinicHMOs(clinic.id, selectedHmoIds),
    ]);
    if (results.some((r) => r.error)) {
      setMessage({ type: 'error', text: 'Some changes could not be saved. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Clinic updated successfully!' });
    }
    setSaving(false);
  };

  const addItem = (list, setList, value, setValue) => {
    const t = value.trim();
    if (t && !list.includes(t)) setList([...list, t]);
    setValue('');
  };
  const removeItem = (list, setList, item) => setList(list.filter((i) => i !== item));
  const toggleHmo = (id) => setSelectedHmoIds((prev) => prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Clinic</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-10 bg-gray-100 rounded-xl" />))}
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
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-teal-500" /> Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinic Name</label>
            <input value={form.practitionerName} onChange={(e) => setForm({ ...form, practitionerName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Practice Type</label>
            <input value={form.practiceType} onChange={(e) => setForm({ ...form, practiceType: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm resize-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm" />
          </div>
        </div>
      </div>

      <DropdownChipPicker label="Specialties" options={SPECIALTY_OPTIONS} selected={specialties} onAdd={(v) => setSpecialties((p) => p.includes(v) ? p : [...p, v])} onRemove={(v) => setSpecialties((p) => p.filter((s) => s !== v))} color="green" />
      <DropdownChipPicker label="Equipment & Facilities" options={EQUIPMENT_OPTIONS} selected={equipment} onAdd={(v) => setEquipment((p) => p.includes(v) ? p : [...p, v])} onRemove={(v) => setEquipment((p) => p.filter((e) => e !== v))} color="blue" />
      <HMOPicker hmos={availableHmos} selectedIds={selectedHmoIds} onToggle={toggleHmo} />
      <TagSection title="Tags" items={tags} setItems={setTags} newValue={newTag} setNewValue={setNewTag} addItem={addItem} removeItem={removeItem} />
    </div>
  );
}
