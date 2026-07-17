import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';
import { detectAnomaly } from '../services/aiService';
import { submitToBlockchain } from '../services/blockchain';

const router = Router();
router.use(authenticate);

// GET /api/funds
router.get('/', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('fund_allocations')
    .select('*, projects(name), departments(name)')
    .eq('workspace_id', req.user!.workspaceId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, allocations: data });
});

// POST /api/funds
router.post(
  '/',
  requireRole('department_head', 'manager', 'plant_head', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, departmentId, amount, vendorName, description } = req.body;
      if (!amount) return res.status(400).json({ error: 'amount required' });

      const txPayload = { projectId, departmentId, amount, vendorName, description };
      let aiData: any = {};
      try {
        aiData = await detectAnomaly(txPayload, req.user!.workspaceType);
      } catch (e) { console.warn('[Fund] AI anomaly detection skipped:', e); }

      const { txId } = await submitToBlockchain({
        type: 'fund_allocation',
        ...txPayload,
        workspaceId: req.user!.workspaceId,
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from('fund_allocations')
        .insert({
          workspace_id: req.user!.workspaceId,
          project_id: projectId,
          department_id: departmentId,
          amount,
          vendor_name: vendorName,
          description,
          status: aiData.isSuspicious ? 'Flagged' : 'Pending',
          ai_risk_score: aiData.riskScore,
          ai_flags: aiData.flags,
          ai_recommendation: aiData.recommendation,
          ai_is_suspicious: aiData.isSuspicious,
          blockchain_tx_id: txId,
          created_by: req.user!.userId,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.status(201).json({ success: true, allocation: data, aiRisk: aiData });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
);

export default router;
