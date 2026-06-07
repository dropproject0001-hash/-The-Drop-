/**
 * @file src/lib/env.ts
 * @description Typed environment variable accessor with runtime validation.
 *
 * FIX C-1: validateEnv() no longer throws at module-import time.
 * Instead it returns { ok, missing } so callers can render a proper
 * error UI rather than crashing the entire React tree.
 */

const REQUIRED = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

const OPTIONAL = [
  'VITE_VAPID_PUBLIC_KEY',
  'VITE_STADIA_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_FIRESTORE_DB',
] as const;

type RequiredKey = typeof REQUIRED[number];
type OptionalKey = typeof OPTIONAL[number];

export type Env = Record<RequiredKey, string> & Partial<Record<OptionalKey, string>>;

export const env: Env = {} as Env;

export interface EnvValidationResult {
  ok: boolean;
  missing: string[];
}

/**
 * Validates env vars without throwing. Call once at app boot.
 * Returns { ok: false, missing } if required vars are absent.
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const viteEnv = (import.meta as any).env ?? {};

  for (const key of REQUIRED) {
    const val = viteEnv[key];
    if (val) {
      env[key] = val;
    } else {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL) {
    const val = viteEnv[key];
    if (val) env[key] = val;
  }

  return { ok: missing.length === 0, missing };
}
