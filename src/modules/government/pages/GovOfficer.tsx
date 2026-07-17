import React, { useState } from 'react';
import { Shield, Clock, CheckCircle, AlertCircle, Search, Edit2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_ASSIGNED_ISSUES = [
  { id: 'GRV-2026-0892', title: 'Potholes on Main Street', status: 'In Progress', priority: 'High', date: '2026-07-16', citizen: 'Rajesh K.', location: 'Sector 4', txId: '0x8f7a...3b21' },
  { id: 'GRV-2026-0885', title: 'Illegal Garbage Dumping', status: 'Open', priority: 'Medium', date: '2026-07-14', citizen: 'Anita M.', location: 'Anna Nagar', txId: '0x9d1c...4a55' },
];

export function GovOfficer() {
  const [issues, setIssues] = useState(MOCK_ASSIGNED_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [latestTx, setLatestTx] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const handleUpdate = async () => {
    if (!newStatus || !note) return;
    setIsUpdating(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const generatedTx = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      setIssues(issues.map(iss => 
        iss.id === selectedIssue.id ? { ...iss, status: newStatus, txId: generatedTx.substring(0,6) + '...' + generatedTx.substring(36) } : iss
      ));
      setLatestTx(generatedTx);
      setTimeout(() => {
        setLatestTx('');
        setSelectedIssue(null);
        setNewStatus('');
        setNote('');
      }, 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Officer Dashboard</h2>
        <p className="text-slate-500">Manage and resolve assigned citizen grievances.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assignments..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Grievance ID</th>
                <th className="px-6 py-4 font-semibold">Citizen & Details</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">{issue.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{issue.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{issue.citizen} • {issue.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">{issue.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => { setSelectedIssue(issue); setNewStatus(issue.status); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isUpdating && setSelectedIssue(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Update Grievance Status</h3>
                <button 
                  onClick={() => !isUpdating && setSelectedIssue(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {latestTx ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                    <p className="font-bold text-emerald-800 mb-1">Status Updated Successfully</p>
                    <p className="text-xs text-emerald-600 mb-3">Blockchain Record Created</p>
                    <div className="bg-white/60 p-2 rounded text-xs font-mono text-slate-600 break-all border border-emerald-100">
                      TX: {latestTx}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Issue</p>
                      <p className="font-medium text-slate-900">{selectedIssue.id} - {selectedIssue.title}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">New Status</label>
                      <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Update Note (Public)</label>
                      <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add details about action taken..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-24"
                      />
                    </div>

                    <button 
                      onClick={handleUpdate}
                      disabled={isUpdating || !note}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? 'Recording on Blockchain...' : 'Update on Blockchain'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
