import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import complaintRoutes from './routes/complaintRoutes';
import projectRoutes from './routes/projectRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import aiRoutes from './routes/aiRoutes';
import securitySimulationRoutes from './routes/securitySimulationRoutes';
import serviceRoutes from './routes/serviceRoutes';
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/security', securitySimulationRoutes);
app.use('/api', serviceRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    blockchain: process.env.BLOCKCHAIN_MODE || 'demo',
    database: 'supabase',
  });
});

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

export default app;
