import { createClient } from '@supabase/supabase-js';

const rawUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const rawKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

const supabaseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
const supabaseAnonKey = rawKey;

const hasValidCredentials = supabaseUrl.includes('supabase.co') && supabaseAnonKey.length > 20;

if (!hasValidCredentials) {
  console.error(
    '[Supabase] Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.\n' +
    'Create a .env file from .env.example and restart the dev server.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = hasValidCredentials;
