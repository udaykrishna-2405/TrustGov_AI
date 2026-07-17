import { Router, Request, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { submitToBlockchain } from '../services/blockchain';

const router = Router();

// GET /api/projects — workspace-scoped, optionally public for government
router.get('/', async (req: any, res: Response) => {
  try {
    const workspaceId = req.query.workspaceId || req.user?.workspaceId;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
    const { data, error } = await supabase
      .from('projects')
      .select('*, departments(name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ success: true, projects: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/projects/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, departments(name)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, project: data });
});

// POST /api/projects — admin/heads only
router.post(
  '/',
  authenticate,
  requireRole('department_head', 'manager', 'plant_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, budget, startDate, endDate, departmentId, isPublic } = req.body;
      if (!name) return res.status(400).json({ error: 'name required' });
      const { txId } = await submitToBlockchain({
        type: 'project_created',
        name,
        workspaceId: req.user!.workspaceId,
        createdBy: req.user!.userId,
        timestamp: new Date().toISOString(),
      });
      const { data, error } = await supabase
        .from('projects')
        .insert({
          workspace_id: req.user!.workspaceId,
          name,
          description,
          budget,
          start_date: startDate,
          end_date: endDate,
          department_id: departmentId,
          is_public: isPublic || false,
          blockchain_tx_id: txId,
          created_by: req.user!.userId,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.status(201).json({ success: true, project: data });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

// PATCH /api/projects/:id
router.patch(
  '/:id',
  authenticate,
  requireRole('officer', 'team_member', 'partner', 'department_head', 'manager', 'plant_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const allowed = ['name', 'description', 'status', 'completion_percentage', 'budget', 'end_date'];
      const updates: any = {};
      allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
      updates.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', req.params.id)
        .eq('workspace_id', req.user!.workspaceId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.json({ success: true, project: data });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

export default router;
