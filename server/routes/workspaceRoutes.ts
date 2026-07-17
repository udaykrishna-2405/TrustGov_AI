import { Router, Request, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';

const router = Router();

// GET /api/workspaces — public, used by login/register dropdowns
router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('workspaces')
    .select('id, name, type, logo_url, description')
    .eq('is_active', true)
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, workspaces: data });
});

// POST /api/workspaces — create a new workspace (public during setup)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, description, logoUrl } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
    if (!['government', 'corporate', 'industry'].includes(type)) {
      return res.status(400).json({ error: 'type must be government, corporate, or industry' });
    }

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name: name.trim(),
        type,
        description: description?.trim() || null,
        logo_url: logoUrl || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      const isDupe = error.message?.includes('duplicate') || error.code === '23505';
      return res.status(isDupe ? 409 : 500).json({
        error: isDupe ? 'A workspace with this name already exists.' : error.message,
      });
    }

    res.status(201).json({ success: true, workspace: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/workspaces/:id — update workspace (admin only)
router.patch('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ['name', 'description', 'logo_url', 'is_active'];
    const updates: any = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, workspace: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
