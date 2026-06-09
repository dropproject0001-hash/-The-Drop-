import { createClient } from '@supabase/supabase-js';

let url = (import.meta as any).env.VITE_SUPABASE_URL?.trim() || '';
const rawAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY?.trim() || '';
export const isMock = !url || !rawAnonKey;

if (url && !url.startsWith('https://') && !url.startsWith('http://')) {
    url = 'https://' + url;
}
const supabaseUrl = url || 'https://mock-supabase-placeholder.co';
const supabaseAnonKey = rawAnonKey || 'mock-anon-key';

if (isMock) {
  console.warn('Supabase credentials missing. App is running in MOCK mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
