import { validateEnv } from '@/lib/validateEnv';
import { MissingEnvBanner } from '@/components/ui/MissingEnvBanner';

export function EnvChecker({ children }: { children: React.ReactNode }) {
  const result = validateEnv();
  console.log('🔍 [EnvChecker.tsx] Environment validation result:', result);
  
  if (!result.isValid) {
    return <MissingEnvBanner errors={result.errors} warnings={result.warnings} onRetry={() => window.location.reload()} />;
  }
  
  console.log('✅ [EnvChecker.tsx] Environment is valid. Rendering children...');
  return <>{children}</>;
}

