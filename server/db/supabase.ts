import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('[Supabase] SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function verifySupabaseConnection(): Promise<void> {
  // Try querying workspaces (TrustOS schema); fall back gracefully if schema not yet applied
  const { error } = await supabase.from('workspaces').select('id').limit(1);
  if (error) {
    // PGRST116 = row not found (table exists, just empty)
    // 42P01 = table doesn't exist (schema not applied yet — warn but don't crash)
    if (error.code === '42P01') {
      console.warn('[AI TrustOS] ⚠️  workspaces table missing — run supabase/schema.sql in Supabase SQL Editor');
      return; // Non-fatal in dev: server can still start
    }
    // Any other error = real connectivity problem
    throw new Error(`[Supabase] Connection failed: ${error.message}`);
  }
  console.log('[AI TrustOS] ✅ Supabase connected');
}
