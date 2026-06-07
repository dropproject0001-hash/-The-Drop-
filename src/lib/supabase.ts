/**
 * @file src/lib/supabase.ts
 *
 * Supabase client initialization.
 * env.ts no longer throws on missing vars, so we guard here.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '@/types/database';

const url = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient<Database>(url, key);
