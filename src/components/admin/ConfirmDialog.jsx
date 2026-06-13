/**
 * ConfirmDialog.jsx
 * Modal confirmation dialog — no external dependencies.
 * Supports danger variant and optional textarea for notes/reasons.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default', // 'default' | 'danger'
  showTextarea = false,
  textareaLabel = 'Notes',
  textareaPlaceholder = 'Enter your notes...',
  textareaRequired = false,
  onConfirm,
  loading = false,
}) {
  const [textValue, setTextValue] = useState('');
  const overlayRef = useRef(null);

  const isDanger = variant === 'danger';

  // Reset textarea when dialog opens
  useEffect(() => {
    if (open) setTextValue('');
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) {
        onOpenChange?.(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, loading, onOpenChange]);

  const handleConfirm = () => {
    if (textareaRequired && showTextarea && !textValue.trim()) return;
    onConfirm?.(showTextarea ? textValue.trim() : undefined);
  };

  const handleCancel = () => {
    if (loading) return;
    onOpenChange?.(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current && !loading) {
      onOpenChange?.(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDanger ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {isDanger
                  ? <AlertTriangle className="w-5 h-5 text-red-600" />
                  : <CheckCircle className="w-5 h-5 text-blue-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="confirm-dialog-title" className="text-lg font-bold text-gray-900">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {showTextarea && (
              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {textareaLabel}
                  {textareaRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={textareaPlaceholder}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm resize-none"
                />
              </div>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || (textareaRequired && showTextarea && !textValue.trim())}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200/50 shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-blue-200/50 shadow-lg'
                }`}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
