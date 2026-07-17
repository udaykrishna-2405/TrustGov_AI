import React, { useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, Clock, Shield, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_ISSUES = [
  { id: 'GRV-2026-0892', title: 'Potholes on Main Street', status: 'In Progress', priority: 'High', date: '2026-07-16', aiCategory: 'Infrastructure', txId: '0x8f7a...3b21' },
  { id: 'GRV-2026-0891', title: 'Water supply disruption', status: 'Open', priority: 'Critical', date: '2026-07-17', aiCategory: 'Public Utilities', txId: '0x3c2b...9a12' },
  { id: 'GRV-2026-0890', title: 'Streetlight not working', status: 'Resolved', priority: 'Medium', date: '2026-07-15', aiCategory: 'Maintenance', txId: '0x1a9f...4c8d' },
];

export function GovIssues() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const filteredIssues = MOCK_ISSUES.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    issue.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Citizen Grievances</h2>
          <p className="text-slate-500">Track and monitor your filed issues.</p>
        </div>
        <button 
          onClick={() => navigate('/gov/issues/new')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          File New Grievance
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Grievance ID</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">AI Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Blockchain TX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{issue.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-medium">{issue.title}</span>
                      <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">{issue.aiCategory}</span>
                        • {issue.date}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(issue.status)}
                      <span className="text-sm font-medium text-slate-700">{issue.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 border border-slate-200">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      {issue.txId}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No grievances found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
