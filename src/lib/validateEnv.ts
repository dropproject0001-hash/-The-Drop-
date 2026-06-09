// src/lib/validateEnv.ts
// Single source of truth for environment validation (Supabase-only)

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates critical environment variables at runtime.
 * Runs synchronously and returns validation result.
 * Does NOT throw — allows graceful error handling in UI.
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get raw env values from Vite (import.meta.env)
  const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
  const supabaseKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

  // CRITICAL: Supabase URL validation
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing. The app cannot connect to the database.');
  } else if (!supabaseUrl.includes('supabase.co')) {
    errors.push(
      'VITE_SUPABASE_URL does not look like a valid Supabase URL. ' +
      'Expected format: https://YOUR_PROJECT.supabase.co'
    );
  }

  // CRITICAL: Supabase Key validation
  if (!supabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing. Authentication will fail.');
  } else if (supabaseKey.length < 30) {
    errors.push(
      'VITE_SUPABASE_ANON_KEY appears to be invalid (too short). ' +
      'Please verify your key is at least 30 characters.'
    );
  }

  // OPTIONAL: Gemini API (nice-to-have for AI features)
  const geminiKey = ((import.meta as any).env.GEMINI_API_KEY || '').trim();
  if (!geminiKey) {
    warnings.push('GEMINI_API_KEY is not set. AI features will be unavailable.');
  }

  // OPTIONAL: Vapid key (nice-to-have for push notifications)
  const vapidKey = ((import.meta as any).env.VITE_VAPID_PUBLIC_KEY || '').trim();
  if (!vapidKey) {
    warnings.push('VITE_VAPID_PUBLIC_KEY is not set. Push notifications will not work.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Helper: Exported for testing or conditional logic
 */
export function getEnvValidationResult(): EnvValidationResult {
  return validateEnv();
}

/**
 * Helper: Check if critical env vars are loaded
 */
export function hasCriticalEnv(): boolean {
  const result = validateEnv();
  return result.isValid;
}
