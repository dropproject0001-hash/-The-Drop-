import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6 bg-[#050505] text-white select-none">
          <div className="relative glass-card max-w-md w-full border border-red-500/30 p-6 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500" />

            {/* Error header */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/35 animate-pulse">
                <AlertOctagon size={32} className="text-red-500" />
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-red-400 tracking-wider mb-2 uppercase">
              {this.props.fallbackTitle || 'Telemetry Vector Failure'}
            </h3>
            
            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              A critical rendering or telemetry initialization exception occurred. Map buffer may contain corrupt cache or WebGL context was lost.
            </p>

            {this.state.error && (
              <div className="bg-black/80 border border-red-950/40 rounded p-3 mb-5 max-h-[120px] overflow-y-auto text-left">
                <code className="text-[10px] font-mono text-red-500/90 break-all leading-normal whitespace-pre-wrap">
                  {this.state.error.name}: {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-500/60 transition-all duration-300 rounded text-xs font-mono tracking-widest uppercase cursor-pointer"
            >
              <RotateCcw size={13} className="animate-spin-reverse-slow" />
              Reset Connection & WebGL
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
