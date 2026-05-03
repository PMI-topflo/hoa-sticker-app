import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const env = process.env;
  const url = env.SUPABASE_URL || env['NEXT_PUBLIC_SUPABASE_URL'];
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin env vars missing');
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const client = getSupabaseAdmin();
    return Reflect.get(client, prop, client);
  },
});
