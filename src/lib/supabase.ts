import { createClient } from '@supabase/supabase-js';

let url = (import.meta as any).env.VITE_SUPABASE_URL?.trim() || '';
if (url && !url.startsWith('https://') && !url.startsWith('http://')) {
    url = 'https://' + url;
}
const supabaseUrl = url;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY?.trim() || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isMock = !supabaseUrl || !supabaseAnonKey;
