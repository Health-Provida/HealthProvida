/**
 * ApplicationDetailPage.jsx
 * Full detail view of a single provider application with approve/reject actions.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Building2, Mail, Phone, MapPin,
  Clock, Stethoscope, Shield, Tag, Wrench, Image, FileText, AlertCircle, Calendar
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { fetchApplicationById, approveApplication, rejectApplication, updateApplicationNotes } from '@/utils/adminQueries';
import { useAuth } from '@/context/AuthContext';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasAdminWrite } = useAuth();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    setLoading(true);
    const { data, error: fetchError } = await fetchApplicationById(id);
    if (fetchError) {
      setError(fetchError.message || 'Failed to load application');
    } else {
      setApp(data);
      setAdminNotes(data?.admin_notes || '');
    }
    setLoading(false);
  };

  const handleApprove = async (notes) => {
    setActionLoading(true);
    const { error } = await approveApplication(id, notes);
    setActionLoading(false);
    if (!error) {
      setApproveDialog(false);
      loadApplication();
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    const { error } = await rejectApplication(id, reason);
    setActionLoading(false);
    if (!error) {
      setRejectDialog(false);
      loadApplication();
    }
  };

  const saveNotes = async () => {
    setNotesSaving(true);
    await updateApplicationNotes(id, adminNotes);
    setNotesSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 animate-pulse">
          <div className="h-6 w-64 bg-gray-100 rounded" />
          <div className="h-4 w-96 bg-gray-100 rounded" />
          <div className="h-4 w-80 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/admin/applications')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error || 'Application not found'}</p>
        </div>
      </div>
    );
  }

  const operatingHours = (() => {
    try {
      if (typeof app.operating_hours === 'string') return JSON.parse(app.operating_hours);
      return app.operating_hours || [];
    } catch { return []; }
  })();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/applications')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Applications
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{app.practitioner_name}</h1>
            <StatusBadge status={app.status} showDot />
          </div>
          <p className="text-sm text-gray-500">
            Submitted {new Date(app.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-5">
        {/* Basic Info */}
        <Section icon={Building2} title="Basic Information">
          <InfoGrid>
            <InfoItem icon={Building2} label="Practitioner Type" value={app.practitioner_type} />
            <InfoItem icon={Mail} label="Email" value={app.email} />
            <InfoItem icon={Phone} label="Phone" value={app.phone} />
            <InfoItem icon={MapPin} label="Address" value={app.address} />
          </InfoGrid>
        </Section>

        {/* Specialties */}
        {app.specialties?.length > 0 && (
          <Section icon={Stethoscope} title="Specialties">
            <div className="flex flex-wrap gap-2">
              {app.specialties.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Equipment */}
        {app.equipment?.length > 0 && (
          <Section icon={Wrench} title="Equipment & Facilities">
            <div className="flex flex-wrap gap-2">
              {app.equipment.map((e) => (
                <span key={e} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                  {e}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Tags */}
        {app.tags?.length > 0 && (
          <Section icon={Tag} title="Tags">
            <div className="flex flex-wrap gap-2">
              {app.tags.map((t) => (
                <span key={t} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* HMOs */}
        {app.supported_hmos?.length > 0 && (
          <Section icon={Shield} title="Supported HMOs">
            <div className="flex flex-wrap gap-2">
              {app.supported_hmos.map((h) => (
                <span key={h} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium border border-teal-100">
                  {h}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Operating Hours */}
        {operatingHours.length > 0 && (
          <Section icon={Clock} title="Operating Hours">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {operatingHours.map((h) => (
                <div key={h.day} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{h.day}</span>
                  <span className="text-sm text-gray-500">
                    {h.isOpen ? `${h.openTime} – ${h.closeTime}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Facility Image */}
        {app.facility_image_url && (
          <Section icon={Image} title="Facility Image">
            <img
              src={app.facility_image_url}
              alt="Facility"
              className="rounded-xl max-w-full max-h-[400px] object-cover border border-gray-200"
            />
          </Section>
        )}

        {/* Admin Notes */}
        <Section icon={FileText} title="Admin Notes">
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes about this application..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm resize-none"
          />
          <button
            onClick={saveNotes}
            disabled={notesSaving}
            className="mt-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
          >
            {notesSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </Section>
      </div>

      {/* Action bar */}
      {hasAdminWrite && app.status === 'pending' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-4 bg-white rounded-2xl border border-gray-200 shadow-xl p-4 flex items-center justify-between gap-4"
        >
          <p className="text-sm text-gray-500 hidden sm:block">
            Review this application and take action
          </p>
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => setRejectDialog(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => setApproveDialog(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </div>
        </motion.div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={approveDialog}
        onOpenChange={setApproveDialog}
        title="Approve Application"
        description="This will create a new verified clinic from the application data and promote the applicant to a provider role."
        confirmLabel="Approve & Create Clinic"
        showTextarea
        textareaLabel="Admin Notes (optional)"
        textareaPlaceholder="Any notes about this approval..."
        onConfirm={handleApprove}
        loading={actionLoading}
      />
      <ConfirmDialog
        open={rejectDialog}
        onOpenChange={setRejectDialog}
        title="Reject Application"
        description="Provide a reason for rejection."
        confirmLabel="Reject Application"
        variant="danger"
        showTextarea
        textareaLabel="Rejection Reason"
        textareaPlaceholder="Explain why this application is being rejected..."
        textareaRequired
        onConfirm={handleReject}
        loading={actionLoading}
      />
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function Section({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
      </div>
    </div>
  );
}
