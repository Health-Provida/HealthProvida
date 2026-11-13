/**
 * MessagesPage.jsx
 * ──────────────────────────────────────────────────────────────
 * Dedicated messaging page for patients.
 * Split-pane layout: conversation list (left) + message thread (right).
 * Responsive: on mobile shows list first, then thread with back button.
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Send, ArrowLeft, Stethoscope,
  MoreVertical, Clock, CheckCircle2, ChevronRight, X, Inbox
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchPatientConversations,
  fetchMessages,
  sendPatientMessage,
  markPatientConversationRead,
} from '@/utils/messagingQueries';

// ─── Time formatter ───────────────────────────────────────────────────────────
function formatMessageTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateSeparator(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// ─── Conversation list item ───────────────────────────────────────────────────
function ConversationItem({ conversation, isActive, onClick }) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 transition-all duration-200 border-b border-gray-50 last:border-0 ${
        isActive
          ? 'bg-blue-50/70 border-l-2 border-l-blue-500'
          : 'hover:bg-gray-50/80 border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-white">
          {conversation.clinicImage ? (
            <img
              src={conversation.clinicImage}
              alt={conversation.clinicName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Stethoscope className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
              {conversation.clinicName}
            </h4>
            {conversation.lastMessage && (
              <span className="text-[10px] text-gray-400 flex-shrink-0 font-medium">
                {formatMessageTime(conversation.lastMessage.created_at)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{conversation.clinicType}</p>
          {conversation.lastMessage && (
            <p className={`text-xs mt-1 truncate ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {conversation.lastMessage.sender_type === 'patient' && (
                <span className="text-gray-400">You: </span>
              )}
              {conversation.lastMessage.content}
            </p>
          )}
        </div>

        {/* Unread badge */}
        {hasUnread && (
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, showTime }) {
  const isPatient = message.sender_type === 'patient';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isPatient ? 'justify-end' : 'justify-start'} mb-1`}
    >
      <div className={`max-w-[80%] sm:max-w-[70%] ${isPatient ? 'order-1' : ''}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isPatient
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md shadow-sm'
              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
          }`}
        >
          {message.content}
        </div>
        {showTime && (
          <p className={`text-[10px] mt-1 px-1 ${isPatient ? 'text-right text-gray-400' : 'text-gray-400'}`}>
            {formatFullTime(message.created_at)}
            {isPatient && message.is_read && (
              <span className="ml-1 inline-flex items-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
              </span>
            )}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Date separator ───────────────────────────────────────────────────────────
function DateSeparator({ date }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 px-2">
        {formatDateSeparator(date)}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Conversation list skeleton ───────────────────────────────────────────────
function ConversationSkeleton() {
  return (
    <div className="p-4 animate-pulse border-b border-gray-50">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Message skeleton ─────────────────────────────────────────────────────────
function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="flex justify-start">
        <div className="h-10 w-48 bg-gray-100 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-40 bg-blue-100 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start">
        <div className="h-16 w-56 bg-gray-100 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-36 bg-blue-100 rounded-2xl rounded-br-md" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [conversations, setConversations] = useState([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // ── Load conversations ─────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    setConvsLoading(true);
    const { data } = await fetchPatientConversations(user.id);
    setConversations(data || []);
    setConvsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages for active conversation ──────────────────────────────────
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    setMsgsLoading(true);
    const { data } = await fetchMessages(convId);
    setMessages(data || []);
    setMsgsLoading(false);
    // Mark as read
    await markPatientConversationRead(convId);
    // Update unread count locally
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId, loadMessages]);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConvId || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    // Optimistic update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConvId,
      sender_type: 'patient',
      sender_id: user?.id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await sendPatientMessage(activeConvId, content);

    if (error) {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setMessageInput(content);
    } else {
      // Reload messages to get real IDs
      await loadMessages(activeConvId);
      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: { content, sender_type: 'patient', created_at: tempMsg.created_at }, updated_at: tempMsg.created_at }
            : c
        ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );
    }

    setSending(false);
    inputRef.current?.focus();
  };

  // ── Select conversation ────────────────────────────────────────────────────
  const handleSelectConversation = (convId) => {
    setActiveConvId(convId);
    setMobileShowThread(true);
  };

  // ── Search filter ──────────────────────────────────────────────────────────
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.clinicName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clinicType?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  // ── Active conversation details ────────────────────────────────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId);

  // ── Group messages by date ─────────────────────────────────────────────────
  const groupedMessages = messages.reduce((groups, msg, idx) => {
    const dateKey = new Date(msg.created_at).toDateString();
    const prevDateKey = idx > 0 ? new Date(messages[idx - 1].created_at).toDateString() : null;
    if (dateKey !== prevDateKey) {
      groups.push({ type: 'date', date: msg.created_at, key: `date-${dateKey}` });
    }
    // Show time if it's the last message or the next message is from a different sender or > 5min apart
    const nextMsg = messages[idx + 1];
    const showTime =
      !nextMsg ||
      nextMsg.sender_type !== msg.sender_type ||
      new Date(nextMsg.created_at) - new Date(msg.created_at) > 300000;
    groups.push({ type: 'message', message: msg, showTime, key: msg.id });
    return groups;
  }, []);

  return (
    <>
      <Helmet>
        <title>Messages | HealthProvida</title>
        <meta name="description" content="Chat with your healthcare providers on HealthProvida." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-teal-50/40">
        <div className="container mx-auto px-4 py-6 max-w-6xl">

          {/* ── Title ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Messages
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              Chat with your healthcare providers
            </p>
          </motion.div>

          {/* ── Split pane ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
          >
            <div className="flex h-full">

              {/* ── Conversation list (left) ──────────────────────────────── */}
              <div className={`w-full md:w-[360px] md:min-w-[320px] border-r border-gray-100 flex flex-col ${
                mobileShowThread ? 'hidden md:flex' : 'flex'
              }`}>
                {/* Search header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                      >
                        <X className="w-2.5 h-2.5 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Conversation items */}
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {convsLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <ConversationSkeleton key={i} />
                      ))}
                    </>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={activeConvId === conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                      />
                    ))
                  ) : conversations.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <Search className="w-8 h-8 text-gray-200 mb-3" />
                      <p className="text-sm font-medium text-gray-500">No conversations found</p>
                      <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-blue-300" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">No messages yet</h3>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                        When you contact a clinic, your conversations will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Message thread (right) ────────────────────────────────── */}
              <div className={`flex-1 flex flex-col ${
                !mobileShowThread ? 'hidden md:flex' : 'flex'
              }`}>
                {activeConv ? (
                  <>
                    {/* Thread header */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
                      {/* Back button (mobile) */}
                      <button
                        onClick={() => setMobileShowThread(false)}
                        className="md:hidden w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                      >
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                      </button>

                      {/* Clinic avatar */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {activeConv.clinicImage ? (
                          <img
                            src={activeConv.clinicImage}
                            alt={activeConv.clinicName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Stethoscope className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{activeConv.clinicName}</h3>
                        <p className="text-[10px] text-gray-400 truncate">{activeConv.clinicType}</p>
                      </div>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 bg-gradient-to-b from-gray-50/50 to-white [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {msgsLoading ? (
                        <MessageSkeleton />
                      ) : messages.length > 0 ? (
                        <>
                          {groupedMessages.map((item) => {
                            if (item.type === 'date') {
                              return <DateSeparator key={item.key} date={item.date} />;
                            }
                            return (
                              <MessageBubble
                                key={item.key}
                                message={item.message}
                                showTime={item.showTime}
                              />
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                            <MessageSquare className="w-7 h-7 text-blue-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-500 mb-1">No messages yet</p>
                          <p className="text-xs text-gray-400">Send a message to start the conversation</p>
                        </div>
                      )}
                    </div>

                    {/* Compose area */}
                    <form
                      onSubmit={handleSend}
                      className="p-4 border-t border-gray-100 bg-white flex items-end gap-3"
                    >
                      <div className="flex-1 relative">
                        <textarea
                          ref={inputRef}
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend(e);
                            }
                          }}
                          placeholder="Type a message…"
                          rows={1}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition resize-none"
                          style={{ maxHeight: '120px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!messageInput.trim() || sending}
                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-teal-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:shadow-none flex-shrink-0"
                      >
                        {sending ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  /* No conversation selected */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center mb-5">
                      <MessageSquare className="w-10 h-10 text-blue-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Conversation</h3>
                    <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                      Choose a conversation from the list to view and reply to messages from your healthcare providers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
