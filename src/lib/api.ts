// Centralized API client — all calls use the stored access token

const getToken = () => localStorage.getItem('accessToken') || '';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// ── Dashboard ────────────────────────────────────────────────────
export const api = {
  dashboard: {
    stats:     () => apiFetch<any>('/api/dashboard/stats'),
    workspace: () => apiFetch<any>('/api/dashboard/workspace'),
    insights:  () => apiFetch<any>('/api/dashboard/ai-insights'),
    trustScore:() => apiFetch<any>('/api/dashboard/trust-score'),
  },

  // ── Issues ────────────────────────────────────────────────────
  issues: {
    list:   ()                => apiFetch<any>('/api/issues'),
    get:    (id: string)      => apiFetch<any>(`/api/issues/${id}`),
    create: (body: any)       => apiFetch<any>('/api/issues', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id: string, body: any) =>
      apiFetch<any>(`/api/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
    feedback: (id: string, body: any) =>
      apiFetch<any>(`/api/issues/${id}/feedback`, { method: 'POST', body: JSON.stringify(body) }),
  },

  // ── Projects ──────────────────────────────────────────────────
  projects: {
    list:   ()          => apiFetch<any>('/api/projects'),
    create: (body: any) => apiFetch<any>('/api/projects', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      apiFetch<any>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // ── Funds ─────────────────────────────────────────────────────
  funds: {
    list:   ()          => apiFetch<any>('/api/funds'),
    create: (body: any) => apiFetch<any>('/api/funds', { method: 'POST', body: JSON.stringify(body) }),
    approve: (id: string, status: string) =>
      apiFetch<any>(`/api/funds/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // ── Security ─────────────────────────────────────────────────
  security: {
    alerts:       () => apiFetch<any>('/api/security/alerts'),
    stats:        () => apiFetch<any>('/api/security/stats'),
    mySessions:   () => apiFetch<any>('/api/security/my-sessions'),
    notifications:() => apiFetch<any>('/api/security/notifications'),
    resolveAlert: (id: string) =>
      apiFetch<any>(`/api/security/alerts/${id}/resolve`, { method: 'PATCH' }),
    markRead: (id: string) =>
      apiFetch<any>(`/api/security/notifications/${id}/read`, { method: 'PATCH' }),
  },

  // ── AI ────────────────────────────────────────────────────────
  ai: {
    chat: (question: string, language = 'english') =>
      apiFetch<any>('/api/ai/chat', { method: 'POST', body: JSON.stringify({ question, language }) }),
    languages:   () => apiFetch<any>('/api/ai/languages'),
    classify:    (body: any) => apiFetch<any>('/api/ai/classify', { method: 'POST', body: JSON.stringify(body) }),
    sentiment:   (text: string) =>
      apiFetch<any>('/api/ai/sentiment', { method: 'POST', body: JSON.stringify({ text }) }),
  },

  // ── Enterprise ────────────────────────────────────────────────
  enterprise: {
    submitPulse: (body: any)  => apiFetch<any>('/api/enterprise/pulse', { method: 'POST', body: JSON.stringify(body) }),
    getPulse:    ()           => apiFetch<any>('/api/enterprise/pulse'),
    pulseAnalysis: ()         => apiFetch<any>('/api/enterprise/pulse/analysis'),
    meetings:    ()           => apiFetch<any>('/api/enterprise/meetings'),
    createMeeting: (body: any)=> apiFetch<any>('/api/enterprise/meetings', { method: 'POST', body: JSON.stringify(body) }),
    compliance:  ()           => apiFetch<any>('/api/enterprise/compliance'),
    createCompliance: (body: any) => apiFetch<any>('/api/enterprise/compliance', { method: 'POST', body: JSON.stringify(body) }),
    updateCompliance: (id: string, body: any) =>
      apiFetch<any>(`/api/enterprise/compliance/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // ── Industry ─────────────────────────────────────────────────
  industry: {
    machines:    ()           => apiFetch<any>('/api/industry/machines'),
    logHealth:   (machineId: string, body: any) =>
      apiFetch<any>(`/api/industry/machines/${machineId}/health-log`, { method: 'POST', body: JSON.stringify(body) }),
    batches:     ()           => apiFetch<any>('/api/industry/batches'),
    createBatch: (body: any)  => apiFetch<any>('/api/industry/batches', { method: 'POST', body: JSON.stringify(body) }),
    qualityCheck:(batchId: string, body: any) =>
      apiFetch<any>(`/api/industry/batches/${batchId}/quality-check`, { method: 'POST', body: JSON.stringify(body) }),
    suppliers:   ()           => apiFetch<any>('/api/industry/suppliers'),
    scoreSupplier: (id: string) =>
      apiFetch<any>(`/api/industry/suppliers/${id}/score`, { method: 'POST' }),
    safetyIncidents: ()       => apiFetch<any>('/api/industry/safety-incidents'),
    reportIncident: (body: any) =>
      apiFetch<any>('/api/industry/safety-incidents', { method: 'POST', body: JSON.stringify(body) }),
  },
};

export default api;
