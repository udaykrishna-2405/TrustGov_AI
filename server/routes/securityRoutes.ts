import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';

const router = Router();
router.use(authenticate);

// GET /api/security/alerts — managers and above
router.get(
  '/alerts',
  requireRole('admin', 'department_head', 'manager', 'plant_head'),
  async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*, users!user_id(name, email)')
      .eq('workspace_id', req.user!.workspaceId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, alerts: data });
  }
);

// GET /api/security/login-sessions — admin only
router.get(
  '/login-sessions',
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
      .from('login_sessions')
      .select('*, users!user_id(name, email)')
      .eq('workspace_id', req.user!.workspaceId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, sessions: data });
  }
);

// GET /api/security/my-sessions — any authenticated user
router.get('/my-sessions', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('login_sessions')
    .select('*')
    .eq('user_id', req.user!.userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, sessions: data });
});

// PATCH /api/security/alerts/:id/resolve
router.patch(
  '/alerts/:id/resolve',
  requireRole('admin', 'manager', 'department_head', 'plant_head'),
  async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
      .from('security_alerts')
      .update({
        is_resolved: true,
        resolved_by: req.user!.userId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('workspace_id', req.user!.workspaceId)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, alert: data });
  }
);

// GET /api/security/stats — summary counts for dashboard badge
router.get(
  '/stats',
  requireRole('admin', 'department_head', 'manager', 'plant_head'),
  async (req: AuthRequest, res: Response) => {
    const wid = req.user!.workspaceId;
    const [unresolvedAlerts, flaggedSessions, criticalAlerts] = await Promise.all([
      supabase.from('security_alerts').select('id', { count: 'exact' }).eq('workspace_id', wid).eq('is_resolved', false),
      supabase.from('login_sessions').select('id', { count: 'exact' }).eq('workspace_id', wid).eq('is_flagged', true),
      supabase.from('security_alerts').select('id', { count: 'exact' }).eq('workspace_id', wid).eq('severity', 'critical').eq('is_resolved', false),
    ]);
    res.json({
      success: true,
      stats: {
        unresolvedAlerts: unresolvedAlerts.count || 0,
        flaggedSessions: flaggedSessions.count || 0,
        criticalAlerts: criticalAlerts.count || 0,
      },
    });
  }
);

// GET /api/security/notifications — for current user
router.get('/notifications', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user!.userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, notifications: data });
});

// PATCH /api/security/notifications/:id/read
router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('user_id', req.user!.userId)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, notification: data });
});

export default router;
