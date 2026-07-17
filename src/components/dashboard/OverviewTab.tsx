import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp, Shield,
  DollarSign, Users, BarChart2, RefreshCw, Activity
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../AuthContext';

const MODE_COLOR: Record<string, string> = {
  government: 'from-blue-600 to-indigo-600',
  corporate:  'from-violet-600 to-purple-600',
  industry:   'from-orange-500 to-amber-600',
};
const MODE_LABEL: Record<string, string> = {
  government: 'CivicAI',
  corporate:  'EnterpriseAI',
  industry:   'IndustrialAI',
};

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color || 'from-blue-500 to-indigo-500'} flex items-center justify-center shadow`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export function OverviewTab() {
  const { workspaceType } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [trustScore, setTrustScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([api.dashboard.stats(), api.dashboard.trustScore()]);
      setStats(s.stats);
      setTrustScore(t.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const modeColor = MODE_COLOR[workspaceType || 'government'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trust Score Banner */}
      {trustScore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${modeColor} rounded-2xl p-6 text-white shadow-lg`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">
                {MODE_LABEL[workspaceType || 'government']} Trust Score
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black">{trustScore.score ?? 72}</span>
                <span className="text-xl opacity-80">/100</span>
              </div>
              <p className="text-sm opacity-80 mt-1">{trustScore.interpretation || 'Good — Above average transparency'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {trustScore.breakdown && Object.entries(trustScore.breakdown).map(([k, v]: any) => (
                <div key={k} className="bg-white/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs opacity-70 capitalize">{k}</p>
                  <p className="text-lg font-bold">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle}  label="Total Issues"     value={stats?.totalIssues}     sub="All submitted" color="from-red-400 to-rose-500" />
        <StatCard icon={CheckCircle}    label="Resolved"         value={stats?.resolvedIssues}  sub={`${stats?.resolutionRate ?? 0}% rate`} color="from-emerald-400 to-green-500" />
        <StatCard icon={BarChart2}      label="Projects"         value={stats?.totalProjects}   sub={`${stats?.activeProjects ?? 0} active`} color="from-blue-400 to-indigo-500" />
        <StatCard icon={DollarSign}     label="Budget Allocated" value={stats?.totalBudgetAllocated ? `₹${(stats.totalBudgetAllocated / 100000).toFixed(1)}L` : '₹0'} sub={`${stats?.flaggedTransactions ?? 0} flagged`} color="from-amber-400 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Activity}       label="Security Alerts"  value={stats?.securityAlerts ?? 0}  sub={`${stats?.criticalAlerts ?? 0} critical`} color="from-purple-400 to-violet-500" />
        <StatCard icon={TrendingUp}     label="Avg Rating"       value={stats?.avgRating ?? '—'}     sub="Citizen feedback" color="from-pink-400 to-rose-500" />
        <StatCard icon={Shield}         label="Flagged Funds"    value={stats?.flaggedTransactions ?? 0} sub="AI detected" color="from-slate-400 to-gray-500" />
      </div>

      {/* Category Breakdown */}
      {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-5">Issues by Category</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryBreakdown)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 8)
              .map(([cat, count]: any) => {
                const pct = Math.round((count / stats.totalIssues) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-400 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${modeColor}`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* AI Predictions */}
      {trustScore?.recommendations?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">AI Recommendations</h3>
          <ul className="space-y-3">
            {trustScore.recommendations.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className={`mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${modeColor} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
