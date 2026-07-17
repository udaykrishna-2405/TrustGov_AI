import React from 'react';
import { ShieldCheck, MapPin, Monitor, Clock, AlertTriangle } from 'lucide-react';

export function GovSecurity() {
  const sessions = [
    { id: 1, device: 'Chrome on Windows', ip: '117.193.152.12', location: 'Chennai, India', time: 'Active Now', current: true },
    { id: 2, device: 'Safari on iPhone', ip: '49.207.56.23', location: 'Chennai, India', time: '2 hours ago', current: false },
    { id: 3, device: 'Firefox on Linux', ip: '103.44.172.90', location: 'Bengaluru, India', time: 'Yesterday', current: false },
  ];

  const alerts = [
    { id: 1, type: 'suspicious', msg: 'Multiple failed login attempts from IP 45.22.x.x', time: '4 hours ago' },
    { id: 2, type: 'impossible_travel', msg: 'Login from Bengaluru detected 1 hr after Chennai session. Blocked.', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Security & Access Log</h2>
        <p className="text-slate-500">Monitor active sessions and security alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-600" />
            Active Sessions
          </h3>
          <div className="space-y-4">
            {sessions.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center ${s.current ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <Monitor className={`w-5 h-5 ${s.current ? 'text-emerald-600' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                      {s.device}
                      {s.current && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Current</span>}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.location}</span>
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" />{s.ip}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {s.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Security Alerts
          </h3>
          <div className="space-y-4">
            {alerts.map(a => (
              <div key={a.id} className="p-4 rounded-xl border border-orange-200 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">{a.msg}</p>
                    <p className="text-xs text-orange-600 mt-1 font-medium">{a.time}</p>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No recent security alerts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
