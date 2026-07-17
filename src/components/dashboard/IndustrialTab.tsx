import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Package, Truck, AlertOctagon, Plus, Loader2,
  X, Activity, CheckCircle, AlertTriangle, TrendingDown
} from 'lucide-react';
import api from '../../lib/api';

const HEALTH_COLOR = (score: number) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-600';
};

const HEALTH_BG = (score: number) => {
  if (score >= 80) return 'from-emerald-400 to-green-500';
  if (score >= 60) return 'from-amber-400 to-orange-400';
  if (score >= 40) return 'from-orange-400 to-red-400';
  return 'from-red-500 to-rose-600';
};

function HealthLogModal({ machine, onClose, onLogged }: { machine: any; onClose: () => void; onLogged: () => void }) {
  const [form, setForm] = useState({ symptomType: 'Mechanical', severity: 'Minor', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (!form.description) return;
    setSubmitting(true);
    try {
      const res = await api.industry.logHealth(machine.id, form);
      setResult(res.aiPrediction);
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Log Health Issue</h2>
            <p className="text-sm text-gray-500">{machine.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        {result ? (
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 ${(result.failureProbability || 0) > 0.7 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`text-3xl font-black ${(result.failureProbability || 0) > 0.7 ? 'text-red-600' : 'text-amber-600'}`}>
                  {Math.round((result.failureProbability || 0) * 100)}%
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Failure Probability</p>
                  <p className="text-xs text-gray-600 capitalize">{result.urgency} urgency</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium">{result.recommendedAction}</p>
              {result.predictedFailureDays && (
                <p className="text-xs text-gray-500 mt-1">Predicted failure in ~{result.predictedFailureDays} days</p>
              )}
            </div>
            <button onClick={() => { onLogged(); onClose(); }}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl">Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Symptom Type</label>
                <select value={form.symptomType} onChange={e => setForm(p => ({ ...p, symptomType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {['Mechanical','Electrical','Hydraulic','Vibration','Temperature','Noise','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Severity</label>
                <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {['Minor','Moderate','Major','Critical'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe the symptom in detail for AI analysis…" rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <button onClick={submit} disabled={submitting || !form.description}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Running AI Prediction…' : 'Log & Predict'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function SafetyModal({ onClose, onReported }: { onClose: () => void; onReported: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', incidentType: 'Near Miss', severity: 'Medium', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (!form.title || !form.description) return;
    setSubmitting(true);
    try {
      const res = await api.industry.reportIncident(form);
      setResult(res.aiAnalysis);
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Report Safety Incident</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        {result ? (
          <div className="space-y-4">
            {result.rootCauses?.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Root Causes (AI)</p>
                <ul className="space-y-1">{result.rootCauses.map((c: string, i: number) => <li key={i} className="text-sm text-gray-700 flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-red-400" />{c}</li>)}</ul>
              </div>
            )}
            {result.correctiveActions?.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Corrective Actions</p>
                <ul className="space-y-1">{result.correctiveActions.map((a: string, i: number) => <li key={i} className="text-sm text-gray-700 flex items-center gap-2"><CheckCircle className="w-3 h-3 text-amber-500" />{a}</li>)}</ul>
              </div>
            )}
            {result.regulatoryReference && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">{result.regulatoryReference}</div>
            )}
            <button onClick={() => { onReported(); onClose(); }}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl">Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Brief title of the incident"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Type', key: 'incidentType', options: ['Near Miss','Injury','Equipment Damage','Fire','Chemical Spill','Other'] },
                { label: 'Severity', key: 'severity', options: ['Low','Medium','High','Critical'] },
              ].map(f => (
                <div key={f.key} className="col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{f.label}</label>
                  <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location</label>
                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="Plant A"
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Detailed description for AI root cause analysis…" rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <button onClick={submit} disabled={submitting || !form.title || !form.description}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Analyzing…' : 'Report Incident'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function IndustrialTab() {
  const [machines, setMachines] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'machines' | 'batches' | 'suppliers' | 'safety'>('machines');
  const [logMachine, setLogMachine] = useState<any>(null);
  const [showSafety, setShowSafety] = useState(false);
  const [scoringId, setScoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, b, s, i] = await Promise.all([
        api.industry.machines(), api.industry.batches(),
        api.industry.suppliers(), api.industry.safetyIncidents(),
      ]);
      setMachines(m.machines || []);
      setBatches(b.batches || []);
      setSuppliers(s.suppliers || []);
      setIncidents(i.incidents || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const scoreSupplier = async (id: string) => {
    setScoringId(id);
    try { await api.industry.scoreSupplier(id); load(); } catch {} finally { setScoringId(null); }
  };

  const tabs = [
    { key: 'machines',  label: `Machines (${machines.length})`, icon: Cpu },
    { key: 'batches',   label: `Batches (${batches.length})`,   icon: Package },
    { key: 'suppliers', label: `Suppliers (${suppliers.length})`, icon: Truck },
    { key: 'safety',    label: `Safety (${incidents.length})`,   icon: AlertOctagon },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IndustrialAI</h2>
          <p className="text-sm text-gray-500 mt-1">Machines · Batches · Suppliers · Safety</p>
        </div>
        <button onClick={() => setShowSafety(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl text-sm hover:opacity-90 shadow">
          <AlertOctagon className="w-4 h-4" /> Report Incident
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : activeTab === 'machines' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No machines registered</p>
            </div>
          ) : machines.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{m.name}</h3>
                  <p className="text-xs text-gray-400">{m.model || 'Unknown model'}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${HEALTH_COLOR(m.health_score || 75)}`}>{m.health_score || 75}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Health</p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <motion.div initial={{ width: 0 }} animate={{ width: `${m.health_score || 75}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full bg-gradient-to-r ${HEALTH_BG(m.health_score || 75)}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  m.status === 'Operational' ? 'bg-emerald-50 text-emerald-600' :
                  m.status === 'At Risk' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-600'
                }`}>{m.status || 'Operational'}</span>
                <button onClick={() => setLogMachine(m)}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-700 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Log Issue
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : activeTab === 'batches' ? (
        <div className="space-y-3">
          {batches.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No production batches</p>
            </div>
          ) : batches.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">{b.product_name}</p>
                    <span className="font-mono text-xs text-gray-400">#{b.batch_number}</span>
                  </div>
                  <p className="text-xs text-gray-500">{b.quantity ? `${b.quantity} ${b.unit || 'units'}` : ''}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {b.quality_gate_checks?.length || 0} quality checks
                    {b.blockchain_tx_id && <span className="font-mono text-emerald-500 ml-2">✓ on-chain</span>}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  b.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                  b.status === 'Failed' ? 'bg-red-50 text-red-600' :
                  b.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>{b.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : activeTab === 'suppliers' ? (
        <div className="space-y-3">
          {suppliers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No suppliers registered</p>
            </div>
          ) : suppliers.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{s.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{s.material_category || 'General'}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>On-time: <b className="text-gray-800">{s.on_time_rate ?? '—'}%</b></span>
                    <span>Quality: <b className="text-gray-800">{s.quality_pass_rate ?? '—'}%</b></span>
                    <span>Orders: <b className="text-gray-800">{s.total_orders ?? 0}</b></span>
                  </div>
                  {s.ai_recommendation && (
                    <p className="text-xs text-blue-600 mt-1 bg-blue-50 rounded-lg px-2 py-1">{s.ai_recommendation}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  {s.ai_risk_level && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      s.ai_risk_level === 'Low' ? 'bg-emerald-50 text-emerald-600' :
                      s.ai_risk_level === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      s.ai_risk_level === 'High' ? 'bg-orange-50 text-orange-600' :
                      'bg-red-50 text-red-600'
                    }`}>{s.ai_risk_level}</span>
                  )}
                  <button onClick={() => scoreSupplier(s.id)}
                    disabled={scoringId === s.id}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-700 disabled:opacity-50 flex items-center gap-1">
                    {scoringId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    AI Score
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <AlertOctagon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No safety incidents reported</p>
              <button onClick={() => setShowSafety(true)}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl">
                Report Incident
              </button>
            </div>
          ) : incidents.map((inc, i) => (
            <motion.div key={inc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl border p-5 shadow-sm ${inc.severity === 'Critical' || inc.severity === 'High' ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      inc.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      inc.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{inc.severity}</span>
                    <span className="text-xs text-gray-400">{inc.incident_type}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{inc.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{inc.description}</p>
                  {inc.location && <p className="text-xs text-gray-400 mt-1">📍 {inc.location}</p>}
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0 ml-4">{new Date(inc.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              {inc.ai_corrective_actions?.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">AI Corrective Actions</p>
                  {inc.ai_corrective_actions.slice(0, 2).map((a: string, j: number) => (
                    <p key={j} className="text-xs text-gray-600 flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" />{a}</p>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {logMachine && <HealthLogModal machine={logMachine} onClose={() => setLogMachine(null)} onLogged={load} />}
        {showSafety && <SafetyModal onClose={() => setShowSafety(false)} onReported={load} />}
      </AnimatePresence>
    </div>
  );
}
