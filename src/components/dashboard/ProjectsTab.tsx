import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, FolderOpen, DollarSign, AlertTriangle, Loader2, X, CheckCircle, Flag
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../AuthContext';

const STATUS_COLOR: Record<string, string> = {
  'Planning':   'bg-blue-50 text-blue-600',
  'In Progress':'bg-amber-50 text-amber-600',
  'Completed':  'bg-emerald-50 text-emerald-600',
  'On Hold':    'bg-gray-100 text-gray-500',
  'Failed':     'bg-red-50 text-red-600',
};

const FUND_STATUS_COLOR: Record<string, string> = {
  Pending:  'bg-blue-50 text-blue-600',
  Approved: 'bg-emerald-50 text-emerald-600',
  Flagged:  'bg-red-50 text-red-600',
  Rejected: 'bg-gray-100 text-gray-500',
};

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', budget: '', startDate: '', endDate: '', isPublic: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setSubmitting(true);
    try {
      await api.projects.create({ ...form, budget: form.budget ? Number(form.budget) : null });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Project Name *', key: 'name', placeholder: 'e.g. Road Infrastructure Phase 2' },
            { label: 'Description', key: 'description', placeholder: 'Brief overview…' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Budget (₹)</label>
              <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                placeholder="500000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Start</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">End</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-600">Make project publicly visible</span>
          </label>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          <button onClick={submit} disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewFundModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ amount: '', vendorName: '', invoiceNumber: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);

  const submit = async () => {
    if (!form.amount) { setError('Amount is required.'); return; }
    setSubmitting(true);
    try {
      const res = await api.funds.create({ ...form, amount: Number(form.amount) });
      setAiResult(res.aiRisk);
      setTimeout(() => { onCreated(); onClose(); }, 2000);
    } catch (e: any) { setError(e.message); } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Fund Allocation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        {aiResult ? (
          <div className={`rounded-2xl p-6 ${aiResult.isSuspicious ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              {aiResult.isSuspicious ? <AlertTriangle className="w-6 h-6 text-red-500" /> : <CheckCircle className="w-6 h-6 text-emerald-500" />}
              <span className="font-bold text-lg">{aiResult.isSuspicious ? 'Flagged by AI' : 'AI Cleared'}</span>
            </div>
            <p className="text-sm text-gray-700">{aiResult.recommendation}</p>
            {aiResult.flags?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {aiResult.flags.map((f: string, i: number) => <li key={i} className="text-xs text-red-700 flex items-center gap-2"><Flag className="w-3 h-3" />{f}</li>)}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Amount (₹) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="250000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Vendor Name</label>
                <input value={form.vendorName} onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
                  placeholder="Vendor Co."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Invoice Number</label>
              <input value={form.invoiceNumber} onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))}
                placeholder="INV-2026-001"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Purpose of allocation…" rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
            <button onClick={submit} disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Running AI Check…' : 'Submit Allocation'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function ProjectsTab() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'projects' | 'funds'>('projects');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewFund, setShowNewFund] = useState(false);

  const isManager = ['department_head','manager','plant_head','admin'].includes(user?.role || '');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, f] = await Promise.all([api.projects.list(), api.funds.list()]);
      setProjects(p.projects || []);
      setFunds(f.allocations || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects & Funds</h2>
          <p className="text-sm text-gray-500 mt-1">Blockchain-anchored transparency</p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <button onClick={() => setShowNewProject(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-sm hover:opacity-90">
              <Plus className="w-4 h-4" /> Project
            </button>
            <button onClick={() => setShowNewFund(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl text-sm hover:opacity-90">
              <DollarSign className="w-4 h-4" /> Allocation
            </button>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['projects', 'funds'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'projects' ? `Projects (${projects.length})` : `Fund Allocations (${funds.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : tab === 'projects' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-gray-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No projects yet</p>
            </div>
          ) : projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
              </div>
              {p.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>}
              {p.completion_percentage !== null && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span><span>{p.completion_percentage ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.completion_percentage ?? 0}%` }}
                      transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                  </div>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{p.budget ? `₹${Number(p.budget).toLocaleString('en-IN')}` : 'No budget set'}</span>
                {p.blockchain_tx_id && <span className="font-mono text-emerald-500">✓ on-chain</span>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {funds.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No fund allocations yet</p>
            </div>
          ) : funds.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${FUND_STATUS_COLOR[f.status] || 'bg-gray-100 text-gray-500'}`}>{f.status}</span>
                    {f.ai_is_suspicious && <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-50 text-red-600">🚨 AI Flagged</span>}
                  </div>
                  <p className="font-semibold text-gray-900">₹{Number(f.amount).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500">{f.vendor_name || 'No vendor'} · {f.description || '—'}</p>
                  {f.blockchain_tx_id && <p className="text-[10px] font-mono text-emerald-500 mt-1">✓ {f.blockchain_tx_id.slice(0,20)}…</p>}
                </div>
                {f.ai_risk_score && (
                  <div className="text-center px-4">
                    <div className={`text-2xl font-black ${f.ai_risk_score > 0.7 ? 'text-red-500' : f.ai_risk_score > 0.4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {Math.round(f.ai_risk_score * 100)}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">AI Risk</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onCreated={load} />}
        {showNewFund && <NewFundModal onClose={() => setShowNewFund(false)} onCreated={load} />}
      </AnimatePresence>
    </div>
  );
}
