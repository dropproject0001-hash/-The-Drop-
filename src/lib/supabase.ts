/**
 * @file src/lib/supabase.ts
 *
 * Supabase client initialization.
 * env.ts no longer throws on missing vars, so we guard here.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '@/types/database';

const envMeta = (import.meta as any).env || {};

function cleanEnvVal(val: unknown): string {
  if (typeof val !== 'string') return '';
  let str = val.trim();
  // Strip starting/ending quotes if present
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.substring(1, str.length - 1).trim();
  }
  if (str.startsWith("'") && str.endsWith("'")) {
    str = str.substring(1, str.length - 1).trim();
  }
  return str;
}

function isValidHttpUrl(str: string): boolean {
  if (str.includes('YOUR_PROJECT')) return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const rawUrl = cleanEnvVal(env.VITE_SUPABASE_URL || envMeta.VITE_SUPABASE_URL);
const url = isValidHttpUrl(rawUrl) ? rawUrl : 'https://mock.supabase.co';

const key = cleanEnvVal(env.VITE_SUPABASE_ANON_KEY || envMeta.VITE_SUPABASE_ANON_KEY) || 'mock-key';

export let supabase: any;
try {
  supabase = createClient<Database>(url, key);
} catch (e) {
  console.warn('Supabase initialization failed with configured URL. Falling back to mock client.', e);
  supabase = createClient<Database>('https://mock.supabase.co', 'mock-key');
}
