import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  classifyIssue, detectAnomaly, analyzeSentiment, chatbotResponse,
  chatbot, INDIA_LANGUAGES,
  predictMachineHealth, analyzeQualityReading, scoreSupplierRisk,
  analyzeMeeting, analyzePulseData, analyzeSafetyIncident,
} from '../services/aiService';
import { supabase } from '../db/supabase';
import { calculateTrustScore } from '../services/aiService';

const router = Router();

// GET /api/ai/languages — list all supported languages
router.get('/languages', (_req: Request, res: Response) => {
  res.json({ success: true, languages: INDIA_LANGUAGES });
});

// POST /api/ai/classify — workspace-aware issue classification
router.post('/classify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'title and description required' });
    const data = await classifyIssue(title, description, req.user!.workspaceType);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/detect-anomaly — workspace-aware fraud detection
router.post('/detect-anomaly', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { transaction } = req.body;
    if (!transaction) return res.status(400).json({ error: 'transaction is required' });
    const data = await detectAnomaly(transaction, req.user!.workspaceType);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/sentiment
router.post('/sentiment', async (req: Request, res: Response) => {
  try {
    const { text, feedback } = req.body;
    const input = text || feedback;
    if (!input) return res.status(400).json({ error: 'text or feedback is required' });
    const data = await analyzeSentiment(input);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat — workspace-aware, multi-language chatbot
router.post('/chat', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { question, language = 'english' } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });
    const { data: ws } = await supabase
      .from('workspaces')
      .select('name, type')
      .eq('id', req.user!.workspaceId)
      .single();
    const data = await chatbot(question, language, req.user!.workspaceType, ws?.name || 'AI TrustOS');
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/predict-machine
router.post('/predict-machine', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await predictMachineHealth(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/quality-gate
router.post('/quality-gate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await analyzeQualityReading(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/supplier-risk
router.post('/supplier-risk', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await scoreSupplierRisk(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/meeting
router.post('/meeting', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: 'transcript required' });
    const result = await analyzeMeeting(transcript);
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/pulse
router.post('/pulse', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await analyzePulseData(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/safety-incident
router.post('/safety-incident', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await analyzeSafetyIncident(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Legacy alias for backward compat
router.post('/classify-complaint', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { text, title, description } = req.body;
    const t = title || text || '';
    const d = description || text || '';
    if (!t) return res.status(400).json({ error: 'text or title+description required' });
    const data = await classifyIssue(t, d, req.user?.workspaceType || 'government');
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/trust-score
router.get('/trust-score', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const wid = req.user!.workspaceId;
    const [issues, feedback, resolvedIssues, flaggedFunds] = await Promise.all([
      supabase.from('issues').select('id', { count: 'exact' }).eq('workspace_id', wid),
      supabase.from('feedback').select('rating').eq('workspace_id', wid),
      supabase.from('issues').select('id').eq('workspace_id', wid).eq('status', 'Resolved'),
      supabase.from('fund_allocations').select('id').eq('workspace_id', wid).eq('status', 'Flagged'),
    ]);

    const totalIssues = issues.count || 0;
    const resolvedCount = resolvedIssues.data?.length || 0;
    const avgRating = feedback.data?.length
      ? feedback.data.reduce((s, f) => s + ((f as any).rating || 0), 0) / feedback.data.length
      : 0;

    const trustScore = await calculateTrustScore({
      totalIssues,
      resolvedIssues: resolvedCount,
      avgResolutionDays: 7,
      overdueIssues: 0,
      citizenRating: avgRating,
      flaggedTransactions: flaggedFunds.data?.length || 0,
    });

    res.json({ success: true, data: trustScore });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
