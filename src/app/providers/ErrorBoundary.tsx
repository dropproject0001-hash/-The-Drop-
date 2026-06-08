import { Component, type ReactNode } from 'react';

interface EBState { hasError: boolean; message: string }

export class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, message: '' };
  static getDerivedStateFromError(err: Error): EBState {
    return { hasError: true, message: err.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[--bg-primary] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-950/20 border border-red-700/30 rounded-2xl p-6 text-center backdrop-blur-md">
            <h2 className="text-xl font-bold text-red-300 mb-2">Application Error</h2>
            <p className="text-red-400 text-sm font-mono">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl bg-red-700/50 text-white text-sm hover:bg-red-600/50 transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
