/**
 * ScheduleManagementPage.jsx
 * ──────────────────────────────────────────────────────────────
 * Manage operating hours per day, generate appointment slots,
 * and configure doctor/service availability.
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Save, AlertCircle, CheckCircle, Zap, User, Plus,
  Trash2, Stethoscope, FlaskConical,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProviderClinic,
  updateOperatingHours,
  generateAppointmentSlots,
} from '@/utils/providerQueries';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS = DAYS.map((day) => ({
  day,
  isOpen: day !== 'Sunday',
  openTime: '08:00',
  closeTime: '17:00',
}));

const SERVICE_OPTIONS = [
  'General Practitioner',
  'Cardiologist',
  'Dermatologist',
  'Paediatrician',
  'Gynaecologist',
  'ENT Specialist',
  'Orthopaedic Surgeon',
  'Neurologist',
  'Ophthalmologist',
  'Laboratory',
];

export default function ScheduleManagementPage() {
  const [clinic, setClinic] = useState(null);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [slotDuration, setSlotDuration] = useState(30);
  const [slotStartDate, setSlotStartDate] = useState('');
  const [slotEndDate, setSlotEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  // Doctor/service availability
  const [doctors, setDoctors] = useState([
    {
      id: 'doc-1',
      name: 'Dr. Default',
      service: 'General Practitioner',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      available: true,
    },
  ]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    service: 'General Practitioner',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    available: true,
  });

  const { user } = useAuth();

  useEffect(() => { if (user?.id) loadSchedule(); }, [user?.id]);

  // Default slot dates to next 7 days
  useEffect(() => {
    const today = new Date();
    const next = new Date(today);
    next.setDate(today.getDate() + 7);
    setSlotStartDate(today.toISOString().split('T')[0]);
    setSlotEndDate(next.toISOString().split('T')[0]);
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    const { data } = await fetchProviderClinic(user.id);
    if (data) {
      setClinic(data);
      if (data.clinic_operating_hours?.length > 0) {
        const mapped = DAYS.map((day) => {
          const existing = data.clinic_operating_hours.find(
            (h) => h.day.toLowerCase() === day.toLowerCase()
          );
          return existing
            ? { day, isOpen: existing.is_open, openTime: existing.open_time?.slice(0, 5) || '08:00', closeTime: existing.close_time?.slice(0, 5) || '17:00' }
            : { day, isOpen: false, openTime: '08:00', closeTime: '17:00' };
        });
        setHours(mapped);
      }
      setSlotDuration(data.appointment_slot_duration || 30);
    }
    setLoading(false);
  };

  const updateDay = (dayIndex, field, value) => {
    const updated = [...hours];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setHours(updated);
  };

  const handleSaveHours = async () => {
    setSaving(true);
    setMessage(null);
    const { error } = await updateOperatingHours(clinic.id, hours);
    if (error) {
      setMessage({ type: 'error', text: 'Failed to save operating hours.' });
    } else {
      setMessage({ type: 'success', text: 'Operating hours updated!' });
    }
    setSaving(false);
  };

  const handleGenerateSlots = async () => {
    if (!slotStartDate || !slotEndDate) {
      setMessage({ type: 'error', text: 'Please select both start and end dates.' });
      return;
    }
    setGenerating(true);
    setMessage(null);
    const { error, count } = await generateAppointmentSlots(clinic.id, {
      startDate: slotStartDate,
      endDate: slotEndDate,
      durationMinutes: slotDuration,
      operatingHours: hours,
    });
    if (error) {
      setMessage({ type: 'error', text: 'Failed to generate slots.' });
    } else {
      setMessage({ type: 'success', text: `Generated ${count} appointment slots!` });
    }
    setGenerating(false);
  };

  const handleAddDoctor = () => {
    if (!newDoctor.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a doctor name.' });
      return;
    }
    setDoctors(prev => [...prev, {
      ...newDoctor,
      id: `doc-${Date.now()}`,
    }]);
    setNewDoctor({
      name: '',
      service: 'General Practitioner',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      available: true,
    });
    setShowAddDoctor(false);
    setMessage({ type: 'success', text: 'Doctor availability added!' });
  };

  const handleRemoveDoctor = (docId) => {
    setDoctors(prev => prev.filter(d => d.id !== docId));
  };

  const toggleDoctorAvailability = (docId) => {
    setDoctors(prev => prev.map(d =>
      d.id === docId ? { ...d, available: !d.available } : d
    ));
  };

  const toggleDoctorDay = (day) => {
    setNewDoctor(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">Set your operating hours, manage doctor availability, and generate appointment slots</p>
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

      {/* Operating Hours */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" /> Operating Hours
          </h2>
          <button
            onClick={handleSaveHours}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Hours'}
          </button>
        </div>

        <div className="space-y-3">
          {hours.map((h, idx) => (
            <div
              key={h.day}
              className={`flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition ${h.isOpen ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              {/* Toggle */}
              <label className="flex items-center gap-3 min-w-[140px] cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={h.isOpen}
                    onChange={(e) => updateDay(idx, 'isOpen', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-teal-500 rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className={`text-sm font-medium ${h.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                  {h.day}
                </span>
              </label>

              {/* Times */}
              {h.isOpen ? (
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => updateDay(idx, 'openTime', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 outline-none text-sm w-[110px]"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => updateDay(idx, 'closeTime', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 outline-none text-sm w-[110px]"
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-400 flex-1 text-right">Closed</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Doctor / Service Availability */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-500" /> Doctor Availability
          </h2>
          <button
            onClick={() => setShowAddDoctor(!showAddDoctor)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        </div>

        {/* Existing doctors */}
        <div className="space-y-3 mb-4">
          {doctors.map((doc) => (
            <div key={doc.id} className={`p-4 rounded-xl border transition ${doc.available ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{doc.service}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {doc.days.map((day) => (
                      <span key={day} className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {doc.startTime} – {doc.endTime} · {doc.slotDuration} min slots
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doc.available}
                      onChange={() => toggleDoctorAvailability(doc.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-500 rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </label>
                  <button
                    onClick={() => handleRemoveDoctor(doc.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add doctor form */}
        {showAddDoctor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-gray-100 pt-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Doctor Name</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Dr. Adeyemi"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Service</label>
                <select
                  value={newDoctor.service}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none text-sm"
                >
                  {SERVICE_OPTIONS.map((svc) => (
                    <option key={svc} value={svc}>{svc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Consultation Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDoctorDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      newDoctor.days.includes(day)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={newDoctor.startTime}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">End Time</label>
                <input
                  type="time"
                  value={newDoctor.endTime}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Slot Duration</label>
                <select
                  value={newDoctor.slotDuration}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, slotDuration: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 outline-none text-sm"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddDoctor}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={() => setShowAddDoctor(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Generate Slots */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" /> Generate Appointment Slots
        </h2>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          Auto-generate bookable time slots for a date range based on your operating hours above.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
            <input
              type="date"
              value={slotStartDate}
              onChange={(e) => setSlotStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
            <input
              type="date"
              value={slotEndDate}
              onChange={(e) => setSlotEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Slot Duration</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 outline-none text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerateSlots}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition"
        >
          <Zap className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Slots'}
        </button>
      </div>
    </div>
  );
}
