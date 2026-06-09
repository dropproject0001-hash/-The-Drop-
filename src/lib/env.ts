// src/lib/env.ts
// Cleaned: Removed all legacy variables (project migrated to Supabase)
// NOTE: Validation happens in validateEnv.ts — do NOT duplicate logic here

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  STADIA_API_KEY?: string;
}

function getEnvVar(key: string, required = true): string {
  const value = ((import.meta as any).env[key] as string | undefined)?.trim();

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', false),
  VAPID_PUBLIC_KEY: getEnvVar('VITE_VAPID_PUBLIC_KEY', false),
  STADIA_API_KEY: getEnvVar('VITE_STADIA_API_KEY', false),
};
