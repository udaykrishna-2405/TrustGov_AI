import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { classifyIssue, analyzeSentiment } from '../services/aiService';
import { submitToBlockchain } from '../services/blockchain';

const router = Router();
router.use(authenticate);

// POST /api/issues
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'title and description required' });

    let aiData: any = {};
    try {
      aiData = await classifyIssue(title, description, req.user!.workspaceType);
    } catch (e) { console.warn('[Issue] AI skipped:', e); }

    const { txId, mode } = await submitToBlockchain({
      type: 'issue_submitted',
      workspaceId: req.user!.workspaceId,
      title,
      submittedBy: req.user!.userId,
      timestamp: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from('issues')
      .insert({
        workspace_id: req.user!.workspaceId,
        submitted_by: req.user!.userId,
        title,
        description,
        category: aiData.category || category || 'Other',
        priority: aiData.priority || 'Medium',
        ai_category: aiData.category,
        ai_priority: aiData.priority,
        ai_summary: aiData.summary,
        ai_estimated_days: aiData.estimatedResolutionDays,
        ai_confidence_score: aiData.confidenceScore,
        blockchain_tx_id: txId,
        blockchain_mode: mode,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, issue: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/issues
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const endUserRoles = ['citizen', 'employee', 'vendor'];
    let query = supabase
      .from('issues')
      .select('*, departments(name), users!submitted_by(name, email)')
      .eq('workspace_id', req.user!.workspaceId)
      .order('created_at', { ascending: false });

    if (endUserRoles.includes(req.user!.role)) {
      query = query.eq('submitted_by', req.user!.userId);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json({ success: true, issues: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/issues/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('issues')
    .select('*, departments(name), issue_updates(*, users!updated_by(name, role))')
    .eq('id', req.params.id)
    .eq('workspace_id', req.user!.workspaceId)
    .single();
  if (error) return res.status(404).json({ error: 'Issue not found' });
  res.json({ success: true, issue: data });
});

// PATCH /api/issues/:id/status
router.patch(
  '/:id/status',
  requireRole('officer', 'team_member', 'partner', 'department_head', 'manager', 'plant_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, note } = req.body;
      const { txId } = await submitToBlockchain({
        type: 'issue_status_updated',
        issueId: req.params.id,
        status,
        updatedBy: req.user!.userId,
        timestamp: new Date().toISOString(),
      });

      await supabase.from('issue_updates').insert({
        issue_id: req.params.id,
        updated_by: req.user!.userId,
        status,
        note,
        blockchain_tx_id: txId,
      });

      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === 'Resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_note = note;
      }

      const { data, error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', req.params.id)
        .eq('workspace_id', req.user!.workspaceId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.json({ success: true, issue: data });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

// POST /api/issues/:id/feedback
router.post('/:id/feedback', async (req: AuthRequest, res: Response) => {
  try {
    const { rating, feedbackText } = req.body;
    let sentimentData: any = {};
    if (feedbackText) {
      try { sentimentData = await analyzeSentiment(feedbackText); } catch {}
    }
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        workspace_id: req.user!.workspaceId,
        issue_id: req.params.id,
        submitted_by: req.user!.userId,
        rating,
        feedback_text: feedbackText,
        ai_sentiment: sentimentData.sentiment,
        ai_sentiment_score: sentimentData.score,
        ai_insight: sentimentData.insight,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, feedback: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
