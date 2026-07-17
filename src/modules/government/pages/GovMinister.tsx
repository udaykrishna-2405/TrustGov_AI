import React from 'react';
import { Shield, TrendingUp, Users, Activity, Target, Landmark, Award } from 'lucide-react';
import { motion } from 'motion/react';

export function GovMinister() {
  const kpis = [
    { label: 'State Trust Score', value: '92.4', trend: '+1.2', isScore: true },
    { label: 'Active Grievances', value: '12,450', trend: '-8%' },
    { label: 'Funds Allocated (Cr)', value: '₹4,250', trend: '+12%' },
    { label: 'Avg Resolution Time', value: '3.1 Days', trend: '-0.4 Days' },
  ];

  const leaders = [
    { rank: 1, dept: 'Revenue Department', score: 96, districts: 38 },
    { rank: 2, dept: 'Health & Family Welfare', score: 94, districts: 38 },
    { rank: 3, dept: 'School Education', score: 91, districts: 38 },
    { rank: 4, dept: 'Public Works', score: 88, districts: 38 },
    { rank: 5, dept: 'Transport', score: 85, districts: 38 },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0f1a] -m-4 lg:-m-8 p-4 lg:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield className="w-3.5 h-3.5" />
              Executive Dashboard
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Minister's Portal</h2>
            <p className="text-slate-400 mt-2">Statewide Performance & Trust Analytics for Tamil Nadu.</p>
          </div>
          <div className="text-right bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Live Status</p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={kpi.label} 
              className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
              <p className="text-sm font-medium text-slate-400 mb-2">{kpi.label}</p>
              <div className="flex items-end gap-3">
                <p className={`text-4xl font-bold ${kpi.isScore ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400' : 'text-white'}`}>
                  {kpi.value}
                </p>
                <span className={`text-sm font-bold mb-1 ${kpi.trend.startsWith('+') && !kpi.isScore ? 'text-emerald-400' : kpi.trend.startsWith('-') && !kpi.isScore ? 'text-emerald-400' : 'text-emerald-400'}`}>
                  {kpi.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Department Leaderboard
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                    <th className="pb-3 font-semibold pl-4">Rank</th>
                    <th className="pb-3 font-semibold">Department</th>
                    <th className="pb-3 font-semibold">Coverage</th>
                    <th className="pb-3 font-semibold text-right pr-4">Trust Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaders.map((d) => (
                    <tr key={d.rank} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${d.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : d.rank === 2 ? 'bg-slate-300/20 text-slate-300' : d.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400'}`}>
                          {d.rank}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-white">{d.dept}</td>
                      <td className="py-4 text-slate-400">{d.districts} Districts</td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 bg-white/10 rounded-full h-1.5 hidden sm:block">
                            <div className="bg-gradient-to-r from-blue-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${d.score}%` }} />
                          </div>
                          <span className="font-bold text-emerald-400">{d.score}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              Strategic Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Fund Utilization</p>
                <p className="text-sm text-slate-300">Revenue Dept shows 94% optimal fund utilization this quarter. Recommend expanding the pilot project.</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">Attention Required</p>
                <p className="text-sm text-slate-300">Transport department grievance resolution time has increased by 12% in the last month.</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Citizen Sentiment</p>
                <p className="text-sm text-slate-300">Positive sentiment up 8% following the launch of the new digital services portal.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
