import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'gov-secure-secret-key-123';
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  departmentId?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function registerUser(
  name: string,
  email: string,
  phone: string,
  password: string,
  role = 'citizen'
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ name, email: email.toLowerCase(), phone, password_hash: passwordHash, role })
    .select('id, name, email, phone, role, department_id, created_at')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, department_id, password_hash, is_active')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) throw new Error('Invalid email or password');
  if (!user.is_active) throw new Error('Account is deactivated. Contact admin.');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid email or password');

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    departmentId: user.department_id,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('refresh_tokens')
    .insert({ user_id: user.id, token: refreshToken, expires_at: expiresAt });

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  const payload = verifyToken(refreshToken);

  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('id, expires_at')
    .eq('token', refreshToken)
    .single();

  if (error || !data) throw new Error('Invalid refresh token');
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
    throw new Error('Refresh token expired');
  }

  const newAccessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    departmentId: payload.departmentId,
  });

  return { accessToken: newAccessToken };
}
