import { Router, Request, Response } from 'express';
import { registerUser, loginUser, verifyToken, signAccess } from '../services/authService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';

const router = Router();

// GET /api/workspaces — list all active workspaces for login page dropdown
router.get('/workspaces', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('workspaces')
    .select('id, name, type, logo_url')
    .eq('is_active', true)
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, workspaces: data });
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { workspaceId, name, email, phone, password, role } = req.body;
    if (!workspaceId || !name || !email || !password) {
      return res.status(400).json({ error: 'workspaceId, name, email, password are required' });
    }
    const user = await registerUser({ workspaceId, name, email, phone, password, role });
    res.status(201).json({ success: true, message: 'Registration successful', user });
  } catch (err: any) {
    const isDupe = err.message?.includes('duplicate') || err.message?.includes('unique');
    res.status(isDupe ? 409 : 500).json({ error: isDupe ? 'Email already registered in this workspace' : err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, workspaceId } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const ua = req.headers['user-agent'] || '';
    const result = await loginUser(email, password, workspaceId, ip, ua);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
    const payload = verifyToken(refreshToken);
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('expires_at')
      .eq('token', refreshToken)
      .single();
    if (error || !data) return res.status(401).json({ error: 'Invalid refresh token' });
    if (new Date(data.expires_at) < new Date()) return res.status(401).json({ error: 'Refresh token expired' });
    res.json({ success: true, accessToken: signAccess(payload) });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, role, workspace_id, department_id, last_login, created_at, workspaces(id, name, type, logo_url)')
    .eq('id', req.user!.userId)
    .single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user: data });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
  res.json({ success: true, message: 'Logged out' });
});

export default router;
