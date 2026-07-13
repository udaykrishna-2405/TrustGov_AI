import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import aiRoutes from './routes/aiRoutes';
import gatewayRoutes from './gateway/routes/gatewayRoutes';
import securitySimulationRoutes from './routes/securitySimulationRoutes';
import { assertCriticalEnv } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { corsConfig, securityHeaders } from './middleware/securityHeaders';
import { securityEventQueue } from './services/securityEventQueue';
import { attackSimulator } from './services/securityAttackSimulator';

const app = express();

assertCriticalEnv();
securityEventQueue.start();
attackSimulator.start();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(corsConfig);
app.use(securityHeaders);
app.use(requestLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/security', securitySimulationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', serviceRoutes);
app.use('/api/gateway', gatewayRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong on the server.",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
