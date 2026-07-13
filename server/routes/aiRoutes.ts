import { Router, Request, Response } from 'express';
import {
  classifyComplaint,
  detectFundAnomaly,
  analyzeSentiment,
  governmentChatbot,
} from '../services/aiService';

const router = Router();

// POST /api/ai/classify-complaint
router.post('/classify-complaint', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'text is required' });
    const data = await classifyComplaint(text);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/detect-anomaly
router.post('/detect-anomaly', async (req: Request, res: Response) => {
  try {
    const { transaction } = req.body;
    if (!transaction) return res.status(400).json({ success: false, error: 'transaction is required' });
    const data = await detectFundAnomaly(transaction);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/sentiment
router.post('/sentiment', async (req: Request, res: Response) => {
  try {
    const { feedback } = req.body;
    if (!feedback) return res.status(400).json({ success: false, error: 'feedback is required' });
    const data = await analyzeSentiment(feedback);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, error: 'question is required' });
    const data = await governmentChatbot(question);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
