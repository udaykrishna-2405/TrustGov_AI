import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../services/authService';
import { supabase } from '../db/supabase';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    req.user = verifyToken(header.split(' ')[1]);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireWorkspaceType(...types: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !types.includes(req.user.workspaceType)) {
      return res.status(403).json({ error: 'This feature is not available for your workspace type' });
    }
    next();
  };
}

// Async audit logging — fire-and-forget after response
export function auditLog(action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    next();
    if (req.user) {
      void supabase.from('audit_logs').insert({
        workspace_id: req.user.workspaceId,
        user_id: req.user.userId,
        action,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { method: req.method, path: req.path },
      });
    }
  };
}

// Legacy alias kept for backward compat
export const authenticateToken = authenticate;
