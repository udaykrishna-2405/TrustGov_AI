import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('[Supabase] SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function verifySupabaseConnection(): Promise<void> {
  const { error } = await supabase.from('users').select('count').limit(1);
  // Table may not exist yet — only fail on real auth errors
  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    throw new Error(`[Supabase] Connection failed: ${error.message}`);
  }
}
