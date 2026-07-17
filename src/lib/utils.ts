import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Legacy User interface (kept for backward compat with older components)
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  workspace_id?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Activity {
  id: number | string;
  type: string;
  status: string;
  timestamp: string;
  location: string;
}

export type WorkspaceType = 'government' | 'corporate' | 'industry';

export const WORKSPACE_LABELS: Record<WorkspaceType, { issues: string; officers: string; departments: string }> = {
  government: { issues: 'Complaints', officers: 'Officers', departments: 'Departments' },
  corporate: { issues: 'Issues', officers: 'Team Members', departments: 'Divisions' },
  industry: { issues: 'NCRs', officers: 'Plant Staff', departments: 'Units' },
};
