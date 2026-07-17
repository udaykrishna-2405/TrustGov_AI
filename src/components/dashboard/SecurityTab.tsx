import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, AlertTriangle, CheckCircle, Clock, Loader2,
  MapPin, Monitor, Globe
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../AuthContext';

const SEVERITY_COLOR: Record<string, string> = {
  low:      'bg-blue-50 text-blue-600',
  medium:   'bg-amber-50 text-amber-600',
  high:     'bg-orange-50 text-orange-600',
  critical: 'bg-red-50 text-red-700',
};

const ROLE_ADMIN = ['admin','manager','department_head','plant_head'];

export function SecurityTab() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'sessions'>('alerts');
  const isAdmin = ROLE_ADMIN.includes(user?.role || '');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [st, se] = await Promise.all([
        api.security.stats(),
        api.security.mySessions(),
      ]);
      setStats(st.stats);
      setSessions(se.sessions || []);
      if (isAdmin) {
        const al = await api.security.alerts();
        setAlerts(al.alerts || []);
      }
    } catch {} finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const resolveAlert = async (id: string) => {
    try {
      await api.security.resolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Center</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time threat detection & session monitoring</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Unresolved Alerts', value: stats.unresolvedAlerts, color: 'text-red-600' },
            { label: 'Flagged Sessions', value: stats.flaggedSessions, color: 'text-amber-600' },
            { label: 'Critical Alerts', value: stats.criticalAlerts, color: 'text-red-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sub-tabs */}
      {isAdmin && (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['alerts', 'sessions'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'alerts' ? `Security Alerts (${alerts.filter(a => !a.is_resolved).length})` : `My Sessions (${sessions.length})`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : (isAdmin && activeTab === 'alerts') ? (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No security alerts</p>
              <p className="text-sm mt-1">Your workspace is clean 🎉</p>
            </div>
          ) : alerts.map((alert, i) => (
            <motion.div key={alert.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl border p-5 shadow-sm ${alert.is_resolved ? 'opacity-50 border-gray-100' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${SEVERITY_COLOR[alert.severity] || 'bg-gray-100 text-gray-500'}`}>
                      {alert.severity}
                    </span>
                    {alert.is_resolved && <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Resolved</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900">{alert.alert_type?.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                    {alert.ip_address && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{alert.ip_address}</span>}
                    {alert.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{alert.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(alert.created_at).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {!alert.is_resolved && (
                  <button onClick={() => resolveAlert(alert.id)}
                    className="flex-shrink-0 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors">
                    Resolve
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">My Login Sessions</h3>
          {sessions.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No sessions found</p></div>
          ) : sessions.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`bg-white rounded-xl border p-4 shadow-sm ${s.is_flagged ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{s.ip_address || 'Unknown IP'}</p>
                    {s.is_flagged && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-600">🚨 Flagged</span>}
                  </div>
                  {s.location && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</p>}
                  <p className="text-xs text-gray-400 mt-1">{s.user_agent?.slice(0, 60)}…</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleString('en-IN')}</p>
                  {s.distance_km && <p className="text-xs font-mono text-amber-600">{s.distance_km}km jump</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
