/**
 * NVIDIA NIM Rate Limiter
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces the STRICTEST possible limits to protect your NGC API key:
 *
 *  Per-IP  window  : 2 requests / 60 seconds
 *  Global  window  : 10 requests / 60 seconds  (all IPs combined)
 *  Daily   hard cap: 50 requests / 24 hours     (global, resets at midnight UTC)
 *
 * When any limit is hit the request is rejected with HTTP 429 and a JSON body
 * that tells the caller how many seconds to wait before retrying.
 */

import { NextFunction, Request, Response } from 'express';

// ─── Sliding-window store ─────────────────────────────────────────────────────

interface Window {
  timestamps: number[];
}

const perIpStore = new Map<string, Window>();  // keyed by IP
let globalWindow: Window = { timestamps: [] };
let dailyCount = 0;
let dailyResetAt = nextMidnightUTC();

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_IP_LIMIT   = 2;           // max requests per IP per minute
const GLOBAL_LIMIT   = 10;          // max requests from all IPs per minute
const DAILY_HARD_CAP = 50;          // absolute daily ceiling
const WINDOW_MS      = 60 * 1000;   // 1-minute sliding window

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nextMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return midnight.getTime();
}

function pruned(w: Window): number[] {
  const cutoff = Date.now() - WINDOW_MS;
  return w.timestamps.filter(t => t > cutoff);
}

function ttlSeconds(w: Window): number {
  if (w.timestamps.length === 0) return 0;
  const oldest = Math.min(...w.timestamps);
  return Math.max(1, Math.ceil((oldest + WINDOW_MS - Date.now()) / 1000));
}

function resetDailyIfNeeded(): void {
  if (Date.now() >= dailyResetAt) {
    dailyCount  = 0;
    dailyResetAt = nextMidnightUTC();
    console.log('[NIM] Daily request counter reset.');
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export const nimRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  resetDailyIfNeeded();

  const ip = (req.ip ?? req.socket?.remoteAddress ?? 'unknown').replace(/^::ffff:/, '');

  // ── Daily hard cap ──────────────────────────────────────────────────────────
  if (dailyCount >= DAILY_HARD_CAP) {
    const resetIn = Math.ceil((dailyResetAt - Date.now()) / 1000 / 60);
    res.status(429).json({
      success: false,
      error: 'Daily NIM API quota exhausted.',
      retryAfterMinutes: resetIn,
      limit: { daily: DAILY_HARD_CAP, used: dailyCount },
    });
    return;
  }

  // ── Global per-minute limit ─────────────────────────────────────────────────
  globalWindow.timestamps = pruned(globalWindow);
  if (globalWindow.timestamps.length >= GLOBAL_LIMIT) {
    res.status(429).json({
      success: false,
      error: 'Global NIM rate limit reached. Please try again shortly.',
      retryAfterSeconds: ttlSeconds(globalWindow),
      limit: { globalPerMinute: GLOBAL_LIMIT },
    });
    return;
  }

  // ── Per-IP per-minute limit ─────────────────────────────────────────────────
  const ipWindow: Window = perIpStore.get(ip) ?? { timestamps: [] };
  ipWindow.timestamps = pruned(ipWindow);
  if (ipWindow.timestamps.length >= PER_IP_LIMIT) {
    res.status(429).json({
      success: false,
      error: 'You are sending requests too fast. Max 2 NIM requests per minute.',
      retryAfterSeconds: ttlSeconds(ipWindow),
      limit: { perIpPerMinute: PER_IP_LIMIT },
    });
    return;
  }

  // ── All clear — record request ──────────────────────────────────────────────
  const now = Date.now();
  ipWindow.timestamps.push(now);
  perIpStore.set(ip, ipWindow);
  globalWindow.timestamps.push(now);
  dailyCount += 1;

  // Attach quota info for downstream use / response headers
  res.setHeader('X-NIM-Daily-Used',      String(dailyCount));
  res.setHeader('X-NIM-Daily-Remaining', String(DAILY_HARD_CAP - dailyCount));

  console.log(`[NIM] Request accepted — IP: ${ip} | daily: ${dailyCount}/${DAILY_HARD_CAP}`);
  next();
};

// ─── Status helper (not a middleware) ────────────────────────────────────────

export const nimQuotaStatus = () => {
  resetDailyIfNeeded();
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  return {
    daily: {
      used:      dailyCount,
      limit:     DAILY_HARD_CAP,
      remaining: Math.max(0, DAILY_HARD_CAP - dailyCount),
      resetsAt:  new Date(dailyResetAt).toISOString(),
    },
    currentMinute: {
      globalUsed:  globalWindow.timestamps.filter(t => t > cutoff).length,
      globalLimit: GLOBAL_LIMIT,
      perIpLimit:  PER_IP_LIMIT,
    },
  };
};
