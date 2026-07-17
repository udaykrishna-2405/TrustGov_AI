import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, Target, Activity } from 'lucide-react';

export function GovCollector() {
  const stats = [
    { label: 'Total Grievances', value: '1,492', trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Resolution Rate', value: '87.4%', trend: '+3.2%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Avg Resolution Time', value: '4.2 Days', trend: '-1.1 Days', icon: Activity, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Pending Critical', value: '24', trend: '-5', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const depts = [
    { name: 'Public Works Dept', resolved: 450, total: 520, score: 92 },
    { name: 'Water Board', resolved: 310, total: 380, score: 85 },
    { name: 'Electricity Board', resolved: 280, total: 340, score: 88 },
    { name: 'Municipal Corp', resolved: 410, total: 510, score: 81 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">District Collector Dashboard</h2>
          <p className="text-slate-500">Chennai District Analytics & Performance.</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm font-semibold text-slate-700">
          District Trust Score: <span className="text-emerald-600">88.5</span>/100
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-bold ${stat.trend.startsWith('+') && stat.label !== 'Pending Critical' ? 'text-emerald-600' : 'text-slate-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Department Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Resolution Rate</th>
                  <th className="pb-3 font-semibold text-right">Performance Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depts.map((d) => (
                  <tr key={d.name}>
                    <td className="py-4 font-medium text-slate-900">{d.name}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px]">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(d.resolved/d.total)*100}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{Math.round((d.resolved/d.total)*100)}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${d.score >= 90 ? 'bg-emerald-100 text-emerald-700' : d.score >= 85 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {d.score} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            AI Predictions
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-1">Surge Warning</p>
              <p className="text-sm text-slate-700 font-medium">Expected 15% increase in water logging complaints next week due to forecasted rain.</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Performance Trend</p>
              <p className="text-sm text-slate-700 font-medium">PWD resolution time expected to decrease by 0.5 days based on recent staffing changes.</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">Resource Allocation</p>
              <p className="text-sm text-slate-700 font-medium">Recommend shifting 3 field units to Sector 4 to handle backlog.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
