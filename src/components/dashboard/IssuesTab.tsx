import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, AlertTriangle, CheckCircle, Clock, Loader2,
  ChevronRight, MessageSquare, Star, X
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../AuthContext';

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  Low:      'bg-green-100 text-green-700',
};
const STATUS_COLOR: Record<string, string> = {
  Open:        'bg-blue-100 text-blue-700',
  'In Progress':'bg-amber-100 text-amber-700',
  Resolved:    'bg-emerald-100 text-emerald-700',
  Closed:      'bg-gray-100 text-gray-500',
};
const STATUS_ICON: Record<string, React.ElementType> = {
  Open: Clock,
  'In Progress': Loader2,
  Resolved: CheckCircle,
  Closed: CheckCircle,
};

function NewIssueModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', isAnonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.issues.create(form);
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Submit New Issue</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Brief description of the issue"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detailed description — AI will auto-classify priority and category"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-600">Submit anonymously</span>
          </label>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Submitting with AI…' : 'Submit Issue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FeedbackModal({ issueId, onClose }: { issueId: string; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.issues.feedback(issueId, { rating, feedbackText: text });
      onClose();
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Rate Resolution</h2>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)}>
              <Star className={`w-8 h-8 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Optional feedback…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            onClick={submit}
            disabled={submitting || rating === 0}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Submit'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function IssuesTab() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  const isStaff = ['officer','team_member','partner','department_head','manager','plant_head','admin'].includes(user?.role || '');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.issues.list();
      setIssues(data.issues || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter);
  const statuses = ['All','Open','In Progress','Resolved','Closed'];

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.issues.updateStatus(id, { status, note: `Status updated to ${status}` });
      load();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Issues & Complaints</h2>
          <p className="text-sm text-gray-500 mt-1">{issues.length} total · AI-classified automatically</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm shadow"
        >
          <Plus className="w-4 h-4" />
          New Issue
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === s
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No issues {filter !== 'All' && `with status "${filter}"`}</p>
          <p className="text-sm mt-1">Submit one to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((issue, i) => {
              const SIcon = STATUS_ICON[issue.status] || Clock;
              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_COLOR[issue.status] || 'bg-gray-100 text-gray-500'}`}>
                          {issue.status}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${PRIORITY_COLOR[issue.priority] || 'bg-gray-100 text-gray-500'}`}>
                          {issue.priority}
                        </span>
                        {issue.ai_category && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                            {issue.ai_category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{issue.title}</h3>
                      {issue.ai_summary && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{issue.ai_summary}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(issue.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        {issue.blockchain_tx_id && (
                          <span className="ml-2 font-mono text-emerald-500 text-[9px]">✓ {issue.blockchain_tx_id.slice(0, 16)}…</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <SIcon className={`w-5 h-5 ${issue.status === 'Resolved' ? 'text-emerald-500' : 'text-gray-400'}`} />
                      {isStaff && issue.status !== 'Resolved' && (
                        <select
                          defaultValue=""
                          onChange={e => { if (e.target.value) updateStatus(issue.id, e.target.value); }}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none"
                        >
                          <option value="" disabled>Update…</option>
                          {['In Progress','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      )}
                      {issue.status === 'Resolved' && (
                        <button
                          onClick={() => setFeedbackId(issue.id)}
                          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewIssueModal onClose={() => setShowNew(false)} onCreated={load} />}
        {feedbackId && <FeedbackModal issueId={feedbackId} onClose={() => { setFeedbackId(null); load(); }} />}
      </AnimatePresence>
    </div>
  );
}
