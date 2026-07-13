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
    const { text } = req.body as { text?: string };
    if (!text) {
      return res.status(400).json({ error: 'Complaint text is required' });
    }
    const result = await classifyComplaint(text);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AI] Classify complaint error:', error);
    return res.status(500).json({ error: 'AI classification failed', details: String(error) });
  }
});

// POST /api/ai/detect-anomaly
router.post('/detect-anomaly', async (req: Request, res: Response) => {
  try {
    const { transaction } = req.body as { transaction?: object };
    if (!transaction) {
      return res.status(400).json({ error: 'Transaction data is required' });
    }
    const result = await detectFundAnomaly(transaction);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AI] Anomaly detection error:', error);
    return res.status(500).json({ error: 'AI anomaly detection failed', details: String(error) });
  }
});

// POST /api/ai/sentiment
router.post('/sentiment', async (req: Request, res: Response) => {
  try {
    const { feedback } = req.body as { feedback?: string };
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }
    const result = await analyzeSentiment(feedback);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AI] Sentiment error:', error);
    return res.status(500).json({ error: 'Sentiment analysis failed', details: String(error) });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body as { question?: string; context?: string };
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const result = await governmentChatbot(question, context);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AI] Chatbot error:', error);
    return res.status(500).json({ error: 'Chatbot failed', details: String(error) });
  }
});

export default router;
