/**
 * @file src/lib/env.ts
 * @description Typed environment variable accessor with runtime validation.
 * Ensures the application fails fast if required configurations are missing.
 */

// Define all required environment variables here
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

// Define optional environment variables here
const optionalEnvVars = [
  'VITE_VAPID_PUBLIC_KEY',
  'VITE_STADIA_API_KEY',
] as const;

type RequiredEnvKeys = typeof requiredEnvVars[number];
type OptionalEnvKeys = typeof optionalEnvVars[number];

type Env = Record<RequiredEnvKeys, string> & Partial<Record<OptionalEnvKeys, string>>;

export const env: Env = {} as Env;

// Validate at boot time based on Vite's import.meta.env
export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredEnvVars) {
    const val = (import.meta as any).env[key];
    if (!val) {
      missing.push(key);
    } else {
      env[key] = val;
    }
  }

  for (const key of optionalEnvVars) {
    const val = (import.meta as any).env[key];
    if (val) {
      env[key] = val;
    }
  }

  if (missing.length > 0) {
    // WHY: Fail fast pattern. Prevents cascading failures from missing config deep in the component tree.
    throw new Error(`[AXIOM/FATAL] Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Automatically validate when imported
validateEnv();
