import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, Users, BarChart2, BookOpen, Plus, Loader2,
  X, CheckCircle, AlertTriangle, ClipboardList
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../AuthContext';

function PulseModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [form, setForm] = useState({ workloadScore: 3, satisfactionScore: 3, managementScore: 3, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.enterprise.submitPulse(form);
      setDone(true);
      setTimeout(() => { onSubmitted(); onClose(); }, 1500);
    } catch {} finally { setSubmitting(false); }
  };

  const ScoreRow = ({ label, key: k }: { label: string; key: string }) => (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label>
        <span className="text-sm font-bold text-blue-600">{(form as any)[k]}/5</span>
      </div>
      <input type="range" min={1} max={5} value={(form as any)[k]}
        onChange={e => setForm(p => ({ ...p, [k]: Number(e.target.value) }))}
        className="w-full accent-blue-600" />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>Very Low</span><span>Very High</span>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Pulse Submitted!</h2>
            <p className="text-sm text-gray-500 mt-2">Thank you for your feedback.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Weekly Pulse Check</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-6">
              <ScoreRow label="Workload" key="workloadScore" />
              <ScoreRow label="Job Satisfaction" key="satisfactionScore" />
              <ScoreRow label="Management Support" key="managementScore" />
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Comment (optional)</label>
                <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Any thoughts this week…" rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>
              <button onClick={submit} disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Pulse
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function MeetingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', transcript: '', meetingDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (!form.title || !form.transcript) return;
    setSubmitting(true);
    try {
      const res = await api.enterprise.createMeeting(form);
      setResult(res.aiAnalysis);
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Analyze Meeting</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        {result ? (
          <div className="space-y-5">
            <div className="bg-violet-50 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">AI Summary</p>
              <p className="text-sm text-gray-800">{result.summary}</p>
            </div>
            {result.actionItems?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Action Items</p>
                <ul className="space-y-2">
                  {result.actionItems.map((a: any, i: number) => (
                    <li key={i} className="bg-white border border-gray-100 rounded-xl p-3 text-sm flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                      <div>
                        <p className="font-medium text-gray-800">{a.task}</p>
                        <p className="text-xs text-gray-500">{a.assignee} · {a.deadline}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.effectivenessScore && (
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4">
                <div className={`text-3xl font-black ${result.effectivenessScore >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{result.effectivenessScore}</div>
                <div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Meeting Effectiveness</p><p className="text-xs text-gray-500">/100</p></div>
              </div>
            )}
            <button onClick={() => { onCreated(); onClose(); }}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl">Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Meeting Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Q2 Review Meeting"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Date</label>
              <input type="datetime-local" value={form.meetingDate} onChange={e => setForm(p => ({ ...p, meetingDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Transcript / Notes *</label>
              <textarea value={form.transcript} onChange={e => setForm(p => ({ ...p, transcript: e.target.value }))}
                placeholder="Paste or type the meeting transcript…" rows={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none" />
            </div>
            <button onClick={submit} disabled={submitting || !form.title || !form.transcript}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Analyzing with AI…' : 'Analyze Meeting'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function EnterpriseTab() {
  const { user } = useAuth();
  const [pulseAnalysis, setPulseAnalysis] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pulse' | 'meetings' | 'compliance'>('pulse');
  const [showPulse, setShowPulse] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);

  const isManager = ['admin','manager','department_head'].includes(user?.role || '');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([api.enterprise.meetings(), api.enterprise.compliance()]);
      setMeetings(m.meetings || []);
      setCompliance(c.items || []);
      if (isManager) {
        try {
          const pa = await api.enterprise.pulseAnalysis();
          setPulseAnalysis(pa);
        } catch {}
      }
    } catch {} finally { setLoading(false); }
  }, [isManager]);

  useEffect(() => { load(); }, [load]);

  const overdueCounts = compliance.filter((c: any) => new Date(c.due_date) < new Date() && c.status !== 'Completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">EnterpriseAI</h2>
          <p className="text-sm text-gray-500 mt-1">Pulse · Meetings · Compliance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPulse(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl text-sm hover:opacity-90 shadow">
            <Heart className="w-4 h-4" /> Pulse Check
          </button>
          <button onClick={() => setShowMeeting(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl text-sm hover:opacity-90 shadow">
            <BookOpen className="w-4 h-4" /> New Meeting
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['pulse', 'meetings', 'compliance'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'compliance' && overdueCounts > 0
              ? <span className="flex items-center gap-1.5">Compliance <span className="w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{overdueCounts}</span></span>
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : activeTab === 'pulse' ? (
        <div className="space-y-4">
          {isManager && pulseAnalysis?.analysis ? (
            <div className="space-y-4">
              <div className={`rounded-2xl p-6 ${
                pulseAnalysis.analysis.overallHealth === 'Healthy' ? 'bg-emerald-50 border border-emerald-200' :
                pulseAnalysis.analysis.overallHealth === 'At Risk' ? 'bg-amber-50 border border-amber-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-2xl font-black ${
                    pulseAnalysis.analysis.overallHealth === 'Healthy' ? 'text-emerald-600' :
                    pulseAnalysis.analysis.overallHealth === 'At Risk' ? 'text-amber-600' : 'text-red-600'}`}>
                    {pulseAnalysis.analysis.overallHealth}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{pulseAnalysis.analysis.insights}</p>
                {pulseAnalysis.rawStats && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Workload', v: pulseAnalysis.rawStats.avgWorkload },
                      { label: 'Satisfaction', v: pulseAnalysis.rawStats.avgSatisfaction },
                      { label: 'Management', v: pulseAnalysis.rawStats.avgManagement },
                    ].map(s => (
                      <div key={s.label} className="bg-white/60 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-gray-800">{s.v?.toFixed(1)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {pulseAnalysis.analysis.recommendations?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">AI Recommendations</p>
                  <ul className="space-y-2">
                    {pulseAnalysis.analysis.recommendations.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pulse data yet</p>
              <p className="text-sm mt-1">Submit your weekly pulse check to get started</p>
              <button onClick={() => setShowPulse(true)}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90">
                Submit Pulse
              </button>
            </div>
          )}
        </div>
      ) : activeTab === 'meetings' ? (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No meetings analyzed yet</p>
              <button onClick={() => setShowMeeting(true)}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90">
                Analyze Meeting
              </button>
            </div>
          ) : meetings.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{m.title}</h3>
                {m.ai_effectiveness_score && (
                  <div className="text-center">
                    <p className={`text-2xl font-black ${m.ai_effectiveness_score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{m.ai_effectiveness_score}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Score</p>
                  </div>
                )}
              </div>
              {m.ai_summary && <p className="text-sm text-gray-600 mb-3">{m.ai_summary}</p>}
              {m.ai_action_items?.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{m.ai_action_items.length} Action Items</p>
                  {m.ai_action_items.slice(0, 2).map((a: any, j: number) => (
                    <p key={j} className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3 h-3 text-violet-400" />{a.task}
                    </p>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">{new Date(m.meeting_date || m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {compliance.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No compliance items</p>
            </div>
          ) : compliance.map((c, i) => {
            const isOverdue = new Date(c.due_date) < new Date() && c.status !== 'Completed';
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl border p-5 shadow-sm ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{c.category}</p>
                    <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                      Due: {new Date(c.due_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    c.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                    c.status === 'In Progress' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                  }`}>{c.status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showPulse && <PulseModal onClose={() => setShowPulse(false)} onSubmitted={load} />}
        {showMeeting && <MeetingModal onClose={() => setShowMeeting(false)} onCreated={load} />}
      </AnimatePresence>
    </div>
  );
}
