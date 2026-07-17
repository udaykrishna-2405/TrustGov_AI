import React from 'react';
import { OverviewTab } from '../../../components/dashboard/OverviewTab';

export function GovDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Citizen Dashboard</h2>
        <p className="text-slate-500">Welcome to your digital government portal.</p>
      </div>
      <OverviewTab />
    </div>
  );
}
