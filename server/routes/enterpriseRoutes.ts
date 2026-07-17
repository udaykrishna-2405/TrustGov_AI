import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { analyzePulseData, analyzeMeeting } from '../services/aiService';

const router = Router();
router.use(authenticate);

// ── PULSE CHECKS ──────────────────────────────────────────────────

// POST /api/enterprise/pulse
router.post('/pulse', async (req: AuthRequest, res: Response) => {
  try {
    const { workloadScore, satisfactionScore, managementScore, comment } = req.body;
    const now = new Date();
    const { data, error } = await supabase
      .from('pulse_checks')
      .insert({
        workspace_id: req.user!.workspaceId,
        user_id: req.user!.userId,
        department_id: req.user!.departmentId || null,
        week_number: Math.ceil(now.getDate() / 7),
        year: now.getFullYear(),
        workload_score: workloadScore,
        satisfaction_score: satisfactionScore,
        management_score: managementScore,
        comment: comment || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, pulse: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/enterprise/pulse — my own history
router.get('/pulse', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('pulse_checks')
    .select('*')
    .eq('workspace_id', req.user!.workspaceId)
    .eq('user_id', req.user!.userId)
    .order('created_at', { ascending: false })
    .limit(12);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, pulses: data });
});

// GET /api/enterprise/pulse/analysis — manager view with AI themes
router.get(
  '/pulse/analysis',
  requireRole('admin', 'manager', 'department_head'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: pulses } = await supabase
        .from('pulse_checks')
        .select('*')
        .eq('workspace_id', req.user!.workspaceId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!pulses || pulses.length === 0) {
        return res.json({ success: true, analysis: null, message: 'No pulse data in the last 30 days' });
      }

      const avg = (key: string) =>
        pulses.reduce((s: number, p: any) => s + (p[key] || 0), 0) / pulses.length;

      const comments = pulses.filter((p: any) => p.comment).map((p: any) => p.comment as string);

      const analysis = await analyzePulseData({
        avgWorkload: avg('workload_score'),
        avgSatisfaction: avg('satisfaction_score'),
        avgManagement: avg('management_score'),
        comments: comments.slice(0, 10),
        departmentName: 'Organization',
      });

      res.json({
        success: true,
        analysis,
        rawStats: {
          avgWorkload: Math.round(avg('workload_score') * 10) / 10,
          avgSatisfaction: Math.round(avg('satisfaction_score') * 10) / 10,
          avgManagement: Math.round(avg('management_score') * 10) / 10,
          totalResponses: pulses.length,
        },
      });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

// ── MEETINGS ──────────────────────────────────────────────────────

// GET /api/enterprise/meetings
router.get('/meetings', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('workspace_id', req.user!.workspaceId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, meetings: data });
});

// POST /api/enterprise/meetings — AI summary + action items
router.post('/meetings', async (req: AuthRequest, res: Response) => {
  try {
    const { title, transcript, meetingDate } = req.body;
    if (!title || !transcript) {
      return res.status(400).json({ error: 'title and transcript required' });
    }
    const aiResult = await analyzeMeeting(transcript);
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        workspace_id: req.user!.workspaceId,
        title,
        meeting_date: meetingDate || new Date().toISOString(),
        transcript,
        ai_summary: aiResult.summary,
        ai_action_items: aiResult.actionItems,
        ai_effectiveness_score: aiResult.effectivenessScore,
        created_by: req.user!.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, meeting: data, aiAnalysis: aiResult });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/enterprise/meetings/:id
router.get('/meetings/:id', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', req.params.id)
    .eq('workspace_id', req.user!.workspaceId)
    .single();
  if (error) return res.status(404).json({ error: 'Meeting not found' });
  res.json({ success: true, meeting: data });
});

// ── COMPLIANCE ────────────────────────────────────────────────────

// GET /api/enterprise/compliance
router.get('/compliance', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('compliance_items')
    .select('*, users!responsible_user_id(name, email)')
    .eq('workspace_id', req.user!.workspaceId)
    .order('due_date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, items: data });
});

// POST /api/enterprise/compliance
router.post(
  '/compliance',
  requireRole('admin', 'department_head', 'manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, category, description, dueDate, responsibleUserId } = req.body;
      if (!title || !dueDate) {
        return res.status(400).json({ error: 'title and dueDate required' });
      }
      const { data, error } = await supabase
        .from('compliance_items')
        .insert({
          workspace_id: req.user!.workspaceId,
          title, category: category || 'General',
          description: description || null,
          due_date: dueDate,
          responsible_user_id: responsibleUserId || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.status(201).json({ success: true, item: data });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

// PATCH /api/enterprise/compliance/:id
router.patch(
  '/compliance/:id',
  requireRole('admin', 'department_head', 'manager', 'officer', 'team_member'),
  async (req: AuthRequest, res: Response) => {
    try {
      const allowed = ['status', 'document_url'];
      const updates: any = {};
      allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
      const { data, error } = await supabase
        .from('compliance_items')
        .update(updates)
        .eq('id', req.params.id)
        .eq('workspace_id', req.user!.workspaceId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.json({ success: true, item: data });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

export default router;
