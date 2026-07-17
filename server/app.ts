import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import issueRoutes from './routes/issueRoutes';
import projectRoutes from './routes/projectRoutes';
import fundRoutes from './routes/fundRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import aiRoutes from './routes/aiRoutes';
import securityRoutes from './routes/securityRoutes';
import industryRoutes from './routes/industryRoutes';
import enterpriseRoutes from './routes/enterpriseRoutes';
import securitySimulationRoutes from './routes/securitySimulationRoutes';
import serviceRoutes from './routes/serviceRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import { assertCriticalEnv } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { corsConfig, securityHeaders } from './middleware/securityHeaders';

const app = express();

assertCriticalEnv();

// Core middleware
app.use(express.json());
app.use(cookieParser());
app.use(corsConfig);
app.use(securityHeaders);
app.use(requestLogger);

// ── AI TrustOS API Routes ────────────────────────────────────────

// Auth + workspace listing
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Core domain routes (all modes)
app.use('/api/issues', issueRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Mode-specific routes
app.use('/api/security', securityRoutes);       // Security alerts + login sessions (all modes)
app.use('/api/industry', industryRoutes);       // IndustrialAI: machines, batches, suppliers, safety
app.use('/api/enterprise', enterpriseRoutes);   // EnterpriseAI: pulse, meetings, compliance

// Security simulation (demo feature — legacy)
app.use('/api/security-sim', securitySimulationRoutes);

// Government services + activity
app.use('/api', serviceRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'AI TrustOS',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    blockchain: process.env.BLOCKCHAIN_MODE || 'demo',
    database: 'supabase',
    modes: {
      government: 'CivicAI',
      corporate: 'EnterpriseAI',
      industry: 'IndustrialAI',
    },
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/workspaces',
      'GET  /api/issues',
      'POST /api/issues',
      'GET  /api/projects',
      'GET  /api/funds',
      'GET  /api/dashboard/stats',
      'POST /api/ai/chat',
      'GET  /api/ai/languages',
      'GET  /api/security/alerts',
      'GET  /api/industry/machines',
      'GET  /api/industry/batches',
      'GET  /api/industry/suppliers',
      'GET  /api/industry/safety-incidents',
      'POST /api/enterprise/pulse',
      'GET  /api/enterprise/pulse/analysis',
      'POST /api/enterprise/meetings',
      'GET  /api/enterprise/compliance',
    ],
  });
});

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[AI TrustOS Error]', err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

export default app;
