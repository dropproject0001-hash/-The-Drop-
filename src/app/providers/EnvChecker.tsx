import { validateEnv } from '@/lib/validateEnv';

function MissingEnvBanner({ errors }: { errors: string[] }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-amber-950/20 border border-amber-700/30 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-amber-300 mb-2">Missing Configuration</h2>
        <p className="text-amber-400 text-sm mb-3">
          The following required environment variables are not set. Create a{' '}
          <code className="bg-amber-900/50 px-1 rounded">.env.local</code> file and add:
        </p>
        <ul className="list-disc list-inside text-amber-300 text-sm font-mono space-y-1">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>
    </div>
  );
}

export function EnvChecker({ children }: { children: React.ReactNode }) {
  const { isValid, errors } = validateEnv();
  
  if (!isValid) {
    return <MissingEnvBanner errors={errors} />;
  }
  
  return <>{children}</>;
}
