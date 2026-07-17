import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';
import { getLocationFromIP, analyzeTravelSpeed } from './geoService';
import { submitToBlockchain } from './blockchain';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  workspaceId: string;
  workspaceType: 'government' | 'corporate' | 'industry';
  departmentId?: string;
}

export function signAccess(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions);
}

export function signRefresh(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function registerUser(params: {
  workspaceId: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}) {
  const { workspaceId, name, email, phone, password, role = 'citizen' } = params;

  const { data: ws, error: wsErr } = await supabase
    .from('workspaces')
    .select('id, type, is_active')
    .eq('id', workspaceId)
    .single();
  if (wsErr || !ws) throw new Error('Workspace not found');
  if (!ws.is_active) throw new Error('Workspace is inactive');

  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({
      workspace_id: workspaceId,
      name,
      email: email.toLowerCase(),
      phone,
      password_hash: passwordHash,
      role,
    })
    .select('id, name, email, role, workspace_id')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function loginUser(
  email: string,
  password: string,
  workspaceId: string | undefined,
  ipAddress: string,
  userAgent: string
) {
  // Fetch ALL users with this email
  console.log(`[Login Attempt] Finding users for email: ${email}`);
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id, name, email, role, workspace_id, department_id,
      password_hash, is_active, last_login,
      workspaces(id, name, type)
    `)
    .eq('email', email.toLowerCase());

  if (error || !users || users.length === 0) {
    console.log(`[Login Failed] No users found or DB error: ${error?.message}`);
    throw new Error('Invalid email or password');
  }

  console.log(`[Login Attempt] Found ${users.length} user(s) with this email. Checking passwords...`);
  let targetUser = null;

  for (const u of users) {
    const valid = await bcrypt.compare(password, u.password_hash);
    if (valid) {
      console.log(`[Login Attempt] Password matched for user in workspace ${u.workspace_id}`);
      targetUser = u;
      if (workspaceId && u.workspace_id === workspaceId) {
        console.log(`[Login Attempt] Exact workspace match found. Break.`);
        break;
      }
    } else {
       console.log(`[Login Attempt] Password DID NOT MATCH for user in workspace ${u.workspace_id}`);
    }
  }

  if (!targetUser) {
    console.log(`[Login Failed] Password did not match any of the ${users.length} accounts.`);
    throw new Error('Invalid email or password');
  }

  console.log(`[Login Success] Logging in user ${targetUser.id}`);
  return loginWithUser(targetUser, ipAddress, userAgent);
}

// Extracted login logic shared by both paths
async function loginWithUser(
  user: any,
  ipAddress: string,
  userAgent: string
) {
  if (!user.is_active) throw new Error('Account is deactivated');

  // Password was already verified above.

  // Geolocate new login IP
  const geo = await getLocationFromIP(ipAddress);
  const now = new Date();

  // ── Impossible travel detection ──────────────────────────────
  let travelAlert = null;
  
  // Get last successful login session
  const { data: lastSession } = await supabase
    .from('login_sessions')
    .select('created_at, latitude, longitude, city, country')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lastSession && lastSession.latitude && lastSession.longitude && geo) {
    const lastLoginTime = new Date(lastSession.created_at);
    const timeDiffMinutes = (now.getTime() - lastLoginTime.getTime()) / 60000;

    const travelAnalysis = analyzeTravelSpeed(
      Number(lastSession.latitude),
      Number(lastSession.longitude),
      lastSession.city || 'Unknown',
      lastSession.country || 'Unknown',
      geo.lat,
      geo.lng,
      geo.city,
      geo.country,
      timeDiffMinutes
    );

    if (travelAnalysis.isSuspicious || travelAnalysis.isImpossible) {
      travelAlert = travelAnalysis;

      // Stamp on blockchain
      const { txId } = await submitToBlockchain({
        type: 'security_alert',
        userId: user.id,
        alertType: 'impossible_travel',
        severity: travelAnalysis.riskLevel,
        details: travelAnalysis,
      });

      // Persist security alert
      await supabase.from('security_alerts').insert({
        workspace_id: user.workspace_id,
        user_id: user.id,
        alert_type: 'impossible_travel',
        severity: travelAnalysis.riskLevel,
        description: travelAnalysis.reason,
        metadata: {
          lastLogin: {
            city: lastSession.city,
            country: lastSession.country,
            time: lastSession.created_at,
          },
          newLogin: {
            city: geo.city,
            country: geo.country,
            ip: ipAddress,
            userAgent,
          },
          analysis: travelAnalysis,
        },
        blockchain_tx_id: txId,
      });

      // Notify the user
      await supabase.from('notifications').insert({
        workspace_id: user.workspace_id,
        user_id: user.id,
        title: '🔴 Security Alert: Suspicious Login Detected',
        message: `${travelAnalysis.reason}. If this was not you, contact your administrator immediately.`,
        type: 'security',
        link: '/security',
      });
    }
  }

  // ── Log this login session ────────────────────────────────────
  await supabase.from('login_sessions').insert({
    user_id: user.id,
    workspace_id: user.workspace_id,
    ip_address: ipAddress,
    city: geo?.city || 'Unknown',
    country: geo?.country || 'Unknown',
    latitude: geo?.lat || 0,
    longitude: geo?.lng || 0,
    device_info: userAgent,
    browser: extractBrowser(userAgent),
    os: extractOS(userAgent),
    is_flagged: travelAlert?.isSuspicious || false,
    flag_reason: travelAlert?.reason || null,
    distance_from_last_km: travelAlert?.distanceKm || null,
    time_from_last_minutes: travelAlert?.timeMinutes || null,
    speed_kmph: travelAlert?.speedKmph || null,
    risk_level: travelAlert?.riskLevel || 'low',
    is_active: true,
  });

  // ── Update last login geo on user record ─────────────────────
  await supabase.from('users').update({
    last_login: now.toISOString()
  }).eq('id', user.id);

  // ── Issue tokens ─────────────────────────────────────────────
  const workspace = (user as any).workspaces as any;
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    workspaceId: user.workspace_id,
    workspaceType: workspace?.type || 'government',
    departmentId: user.department_id || undefined,
  };

  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('refresh_tokens').insert({
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
  });

  const { password_hash, workspaces, ...safeUser } = user as any;
  return {
    user: { ...safeUser, workspace },
    accessToken,
    refreshToken,
    securityAlert: travelAlert, // null if no suspicious activity
  };
}

function extractBrowser(ua: string): string {
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
}

function extractOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}
