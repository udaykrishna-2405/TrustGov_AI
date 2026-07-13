import { Router, Request, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { submitToBlockchain } from '../services/blockchainService';

const router = Router();

// GET /api/projects — public
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, departments(name)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, projects: data });
});

// GET /api/projects/:id — public
router.get('/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, departments(name)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ success: false, error: 'Project not found' });
  res.json({ success: true, project: data });
});

// POST /api/projects — admin/dept head only
router.post(
  '/',
  authenticate,
  requireRole('department_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, budget, startDate, endDate, departmentId } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'name is required' });

      const { txId } = await submitToBlockchain({
        type: 'project_created',
        name,
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          budget,
          start_date: startDate,
          end_date: endDate,
          department_id: departmentId,
          blockchain_tx_id: txId,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      res.status(201).json({ success: true, project: data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// PATCH /api/projects/:id — officer/admin
router.patch(
  '/:id',
  authenticate,
  requireRole('officer', 'department_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      res.json({ success: true, project: data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

export default router;
