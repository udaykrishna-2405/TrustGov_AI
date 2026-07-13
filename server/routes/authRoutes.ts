import { Router, Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken } from '../services/authService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../db/supabase';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email, and password are required' });
    }
    const user = await registerUser(name, email, phone || '', password, role || 'citizen');
    res.status(201).json({ success: true, message: 'Registration successful. You can now log in.', user });
  } catch (err: any) {
    const isDuplicate = err.message?.includes('duplicate') || err.message?.includes('unique');
    res.status(isDuplicate ? 409 : 500).json({
      success: false,
      error: isDuplicate ? 'Email already registered' : err.message,
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }
    const result = await loginUser(email, password);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'refreshToken required' });
    }
    const result = await refreshAccessToken(refreshToken);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, role, department_id, created_at')
    .eq('id', req.user!.userId)
    .single();
  if (error) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user: data });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refresh_token;
  if (refreshToken) {
    await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
  }
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
