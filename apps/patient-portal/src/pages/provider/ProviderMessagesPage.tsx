/**
 * ProviderMessagesPage.jsx
 * Split-pane messaging UI: conversation list on the left, message thread on the right.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, ArrowLeft, Search, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchProviderClinic } from '@/utils/providerQueries';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationRead,
} from '@/utils/messagingQueries';

export default function ProviderMessagesPage() {
  const [clinicId, setClinicId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => { if (user?.id) init(); }, [user?.id]);

  const init = async () => {
    const { data } = await fetchProviderClinic(user.id);
    if (data) {
      setClinicId(data.id);
      await loadConversations(data.id);
    }
    setLoading(false);
  };

  const loadConversations = async (cId) => {
    const { data } = await fetchConversations(cId || clinicId);
    setConversations(data || []);
  };

  const selectConversation = useCallback(async (conv) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    const { data } = await fetchMessages(conv.id);
    setMessages(data || []);
    setLoadingMsgs(false);
    await markConversationRead(conv.id);
    scrollToBottom();
  }, []);

  const handleSend = async () => {
    if (!draft.trim() || !activeConv || sending) return;

    setSending(true);
    const { data, error } = await sendMessage(activeConv.id, draft);
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setDraft('');
      scrollToBottom();
      await loadConversations(clinicId);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const name = conv.profiles?.full_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="bg-white rounded-2xl border border-gray-100 h-[600px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Communicate with your patients</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex h-[calc(100vh-240px)] min-h-[500px]">
        {/* ── Left: Conversation List ──────────────── */}
        <div className={`w-full sm:w-80 lg:w-96 border-r border-gray-100 flex flex-col flex-shrink-0 ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-400 text-center">
                  {search ? 'No conversations found' : 'No messages yet'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition flex items-start gap-3 ${
                    activeConv?.id === conv.id ? 'bg-teal-50/30 border-l-2 border-l-teal-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {conv.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {conv.profiles?.full_name || 'Patient'}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {conv.lastMessage ? formatTime(conv.lastMessage.created_at) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage
                        ? `${conv.lastMessage.sender_type === 'provider' ? 'You: ' : ''}${conv.lastMessage.content}`
                        : 'No messages'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Right: Message Thread ────────────────── */}
        <div className={`flex-1 flex flex-col min-w-0 ${!activeConv ? 'hidden sm:flex' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Select a conversation</p>
              <p className="text-gray-400 text-sm mt-1">Choose a patient from the list to view messages</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-4 lg:px-6 py-3.5 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setActiveConv(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 sm:hidden transition"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {activeConv.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activeConv.profiles?.full_name || 'Patient'}</p>
                  <p className="text-[10px] text-gray-400">{activeConv.profiles?.email || ''}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-3">
                {loadingMsgs ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isProvider = msg.sender_type === 'provider';
                    return (
                      <div key={msg.id} className={`flex ${isProvider ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isProvider
                              ? 'bg-gradient-to-br from-teal-600 to-green-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1.5 ${isProvider ? 'text-teal-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 lg:px-6 py-3 border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm resize-none transition"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                    onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    className="p-3 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 text-white hover:from-teal-700 hover:to-green-700 disabled:opacity-40 transition shadow-sm flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
