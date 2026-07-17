import React, { useEffect, useState } from 'react';
import { History, Download, ShieldCheck, ExternalLink, Clock, MapPin, Search } from 'lucide-react';
import type { VerificationSession } from '../components/BlockchainVerificationOverlay';
import { motion } from 'motion/react';

export function GovSessionHistory() {
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('trustos_gov_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse session history', e);
      }
    }
  }, []);

  const handleExport = (session: VerificationSession) => {
    // Simulated export
    const content = JSON.stringify(session, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustOS_Verification_${session.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredSessions = sessions.filter(s => 
    s.portalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.txHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Verification History</h2>
          <p className="text-slate-500 text-lg">Secure cryptographic log of all your portal access sessions.</p>
        </div>
        
        <div className="flex items-center bg-white rounded-xl border border-slate-200 px-4 py-2 shadow-sm">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search by ID, Hash, or Portal..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none outline-none bg-transparent text-sm w-64 text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Verification Records Found</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              Your blockchain session logs will appear here after you securely access integrated government portals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Portal Access</th>
                  <th className="px-6 py-4 font-bold">Blockchain Status</th>
                  <th className="px-6 py-4 font-bold">Session ID & Hash</th>
                  <th className="px-6 py-4 font-bold">Context</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((session, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={session.sessionId} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{session.portalName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(session.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        {session.status}
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 ml-1 font-mono">BLK: {session.blockId}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <p className="text-blue-600 font-bold mb-1">{session.sessionId}</p>
                      <p className="text-slate-500 truncate w-32" title={session.txHash}>
                        {session.txHash.substring(0,14)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-medium">{session.device}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {session.geo}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={session.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Reopen Portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleExport(session)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors font-medium text-xs shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
