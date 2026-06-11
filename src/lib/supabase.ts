import { createClient } from '@supabase/supabase-js';

const rawUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const rawKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

// Ensure a valid URL format for Supabase client creation to avoid "Invalid URL" crash
const isUrlValid = rawUrl.includes('.') && (rawUrl.startsWith('http') || rawUrl.length > 4);
const supabaseUrl = isUrlValid 
  ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
  : 'https://placeholder.supabase.co';

const supabaseAnonKey = rawKey.length > 10 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-key';

const hasValidCredentials = isUrlValid && rawUrl.includes('supabase.co') && rawKey.length > 20;

if (!hasValidCredentials) {
  console.warn(
    '[Supabase] Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.\n' +
    'The app is running in offline/placeholder mode.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const isSupabaseConfigured = hasValidCredentials;

