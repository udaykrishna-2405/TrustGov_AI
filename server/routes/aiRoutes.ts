import { Router, Request, Response } from 'express';
import {
  classifyComplaint,
  detectFundAnomaly,
  analyzeSentiment,
  governmentChatbot,
} from '../services/aiService';
import { nimChat } from '../services/nimService';
import { nimRateLimiter, nimQuotaStatus } from '../middleware/nimRateLimiter';

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

// ─── NVIDIA NIM Routes (/api/ai/nim/*) ───────────────────────────────────────

/**
 * POST /api/ai/nim/chat
 * Body: { prompt: string, imageUrl?: string, maxTokens?: number, enableThinking?: boolean }
 *
 * Rate limited: 2 req/min per IP · 10 req/min global · 50 req/day hard cap
 */
router.post('/nim/chat', nimRateLimiter, async (req: Request, res: Response) => {
  try {
    const { prompt, imageUrl, maxTokens, enableThinking } = req.body as {
      prompt?: string;
      imageUrl?: string;
      maxTokens?: number;
      enableThinking?: boolean;
    };

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'prompt is required and must be a non-empty string.' });
    }

    if (prompt.length > 4000) {
      return res.status(400).json({ success: false, error: 'prompt exceeds 4000 character limit.' });
    }

    if (maxTokens !== undefined && (maxTokens < 1 || maxTokens > 4096)) {
      return res.status(400).json({ success: false, error: 'maxTokens must be between 1 and 4096.' });
    }

    const result = await nimChat({
      prompt: prompt.trim(),
      imageUrl,
      maxTokens,
      enableThinking,
    });

    return res.json({
      success: true,
      data: {
        text:   result.text,
        model:  result.model,
        usage:  result.usage,
        quota:  nimQuotaStatus().daily,
      },
    });
  } catch (error) {
    console.error('[NIM] Chat error:', error);
    const message = error instanceof Error ? error.message : String(error);
    const status  = message.includes('not configured') ? 503 : 500;
    return res.status(status).json({ success: false, error: message });
  }
});

/**
 * GET /api/ai/nim/status
 * Returns current quota usage — no rate limit on this read-only endpoint.
 */
router.get('/nim/status', (_req: Request, res: Response) => {
  res.json({ success: true, data: nimQuotaStatus() });
});

export default router;
