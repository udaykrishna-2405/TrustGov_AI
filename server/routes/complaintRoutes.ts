import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { classifyComplaint } from '../services/aiService';
import { submitToBlockchain } from '../services/blockchainService';

const router = Router();
router.use(authenticate);

// POST /api/complaints — citizen submits complaint
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'title and description required' });
    }

    // AI classification (non-blocking)
    let aiData: any = {};
    try {
      aiData = await classifyComplaint(`${title}. ${description}`);
    } catch (e) {
      console.warn('[Complaint] AI classification skipped:', e);
    }

    // Blockchain record
    const { txId } = await submitToBlockchain({
      type: 'complaint_submitted',
      title,
      citizenId: req.user!.userId,
      timestamp: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        citizen_id: req.user!.userId,
        title,
        description,
        category: aiData.category || category || 'Other',
        priority: aiData.priority || 'Medium',
        ai_category: aiData.category || null,
        ai_priority: aiData.priority || null,
        ai_summary: aiData.summary || null,
        ai_estimated_days: aiData.estimatedResolutionDays || null,
        blockchain_tx_id: txId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, complaint: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/complaints
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let query = supabase
      .from('complaints')
      .select('*, departments(name)')
      .order('created_at', { ascending: false });

    if (req.user!.role === 'citizen') {
      query = query.eq('citizen_id', req.user!.userId);
    } else if (req.user!.role === 'officer' && req.user!.departmentId) {
      query = query.eq('department_id', req.user!.departmentId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json({ success: true, complaints: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/complaints/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*, departments(name), complaint_updates(*)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ success: false, error: 'Complaint not found' });
  res.json({ success: true, complaint: data });
});

// PATCH /api/complaints/:id/status — officer/admin
router.patch(
  '/:id/status',
  requireRole('officer', 'department_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, note } = req.body;
      const { txId } = await submitToBlockchain({
        type: 'complaint_updated',
        id: req.params.id,
        status,
        updatedBy: req.user!.userId,
      });

      await supabase.from('complaint_updates').insert({
        complaint_id: req.params.id,
        updated_by: req.user!.userId,
        status,
        note,
        blockchain_tx_id: txId,
      });

      const { data, error } = await supabase
        .from('complaints')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      res.json({ success: true, complaint: data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

export default router;
