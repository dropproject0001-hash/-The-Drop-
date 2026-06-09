import React from 'react';
import { AlertTriangle, Copy, ExternalLink } from 'lucide-react';

interface MissingEnvBannerProps {
  errors: string[];
  warnings?: string[];
  onRetry?: () => void;
}

export const MissingEnvBanner: React.FC<MissingEnvBannerProps> = ({ 
  errors, 
  warnings = [], 
  onRetry 
}) => {
  const copyEnv = () => {
    const template = `VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=optional`;
    navigator.clipboard.writeText(template);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/50 bg-zinc-950 p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3 text-red-400 mb-6">
          <AlertTriangle className="h-8 w-8" />
          <div>
            <div className="font-bold text-2xl tracking-tight">SYSTEM OFFLINE</div>
            <div className="text-red-400/80 text-sm">Missing or invalid environment configuration</div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {errors.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-red-400 mb-2">Critical Errors</div>
              <ul className="space-y-1 text-sm text-red-300/90">
                {errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-yellow-400 mb-2">Warnings</div>
              <ul className="space-y-1 text-sm text-yellow-300/80">
                {warnings.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={copyEnv}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/20 bg-white/5 py-3 text-sm font-medium hover:bg-white/10 active:bg-white/5 transition"
          >
            <Copy className="h-4 w-4" /> COPY .env.local TEMPLATE
          </button>

          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-white py-3 text-sm font-semibold text-black hover:bg-white/90 active:bg-white transition"
          >
            RETRY AFTER UPDATING .env.local
          </button>

          <a 
            href="https://supabase.com/dashboard/project/_/settings/api" 
            target="_blank"
            className="flex items-center justify-center gap-2 text-xs text-white/50 hover:text-white/80 mt-2"
          >
            Open Supabase API Settings <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-8 text-[10px] text-center text-white/40 font-mono tracking-widest">
          DROPPIN OPS • v1.0 • SECURE MODE
        </div>
      </div>
    </div>
  );
};
