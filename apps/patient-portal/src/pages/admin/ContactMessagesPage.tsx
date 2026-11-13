/**
 * ContactMessagesPage.jsx
 * Inbox-style view of contact form submissions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Mail, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import SearchFilter from '@/components/admin/SearchFilter';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { fetchContactMessages, toggleMessageRead, deleteMessage } from '@/utils/adminQueries';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchContactMessages({
      read: readFilter || undefined,
      search: search || undefined,
    });
    setMessages(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [readFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleToggleRead = async (id, currentVal) => {
    await toggleMessageRead(id, !currentVal);
    load();
    if (selectedMessage?.id === id) {
      setSelectedMessage(prev => ({ ...prev, is_read: !currentVal }));
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    await deleteMessage(deleteDialog.id);
    setActionLoading(false);
    setDeleteDialog({ open: false, id: null });
    if (selectedMessage?.id === deleteDialog.id) setSelectedMessage(null);
    load();
  };

  const openMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await toggleMessageRead(msg.id, true);
      load();
    }
  };

  const columns = [
    {
      key: 'is_read',
      label: '',
      sortable: false,
      className: 'w-8',
      render: (val) => (
        <span className={`w-2.5 h-2.5 rounded-full inline-block ${val ? 'bg-transparent' : 'bg-blue-500'}`} />
      ),
    },
    {
      key: 'sender_name',
      label: 'From',
      render: (val, row) => (
        <div>
          <p className={`text-sm ${row.is_read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{val}</p>
          <p className="text-xs text-gray-500">{row.sender_email}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (val, row) => (
        <p className={`text-sm max-w-xs truncate ${row.is_read ? 'text-gray-600' : 'font-medium text-gray-900'}`}>
          {val || 'No subject'}
        </p>
      ),
    },
    {
      key: 'sender_type',
      label: 'Type',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (val) => (
        <span className="text-xs text-gray-500">
          {new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-24',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleToggleRead(row.id, row.is_read)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            title={row.is_read ? 'Mark as unread' : 'Mark as read'}
          >
            {row.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setDeleteDialog({ open: true, id: row.id })}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          Contact Messages
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} messages · {unreadCount > 0 && <span className="text-blue-600 font-medium">{unreadCount} unread</span>}
        </p>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search messages..."
        filters={[{
          key: 'read', label: 'All messages', value: readFilter,
          options: [
            { value: 'false', label: 'Unread' },
            { value: 'true', label: 'Read' },
          ],
        }]}
        onFilterChange={(_, val) => setReadFilter(val)}
        onClearAll={() => { setSearch(''); setReadFilter(''); }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Messages list */}
        <div className={selectedMessage ? 'lg:col-span-2' : 'lg:col-span-5'}>
          <DataTable
            columns={selectedMessage ? columns.filter(c => ['is_read', 'sender_name', 'created_at'].includes(c.key)) : columns}
            data={messages}
            loading={loading}
            emptyMessage="No messages found"
            rowKey="id"
            onRowClick={openMessage}
          />
        </div>

        {/* Message detail panel */}
        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedMessage.subject || 'No subject'}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    From <span className="font-medium text-gray-700">{selectedMessage.sender_name}</span>
                    {' · '}
                    {new Date(selectedMessage.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 transition p-1"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${selectedMessage.sender_email}`} className="text-blue-600 hover:underline">
                      {selectedMessage.sender_email}
                    </a>
                  </div>
                  <StatusBadge status={selectedMessage.sender_type} />
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <a
                    href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject || 'Your message to HealthProvida'}`}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.is_read)}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Mark as {selectedMessage.is_read ? 'Unread' : 'Read'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(v) => !v && setDeleteDialog({ open: false, id: null })}
        title="Delete Message"
        description="Are you sure you want to permanently delete this message?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
