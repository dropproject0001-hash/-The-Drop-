import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // You can send to Sentry here later
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
          <div className="text-center">
            <h1 className="text-2xl font-mono text-red-500 mb-4">Something went wrong</h1>
            <p className="text-zinc-400 mb-6">Please refresh the page or try again later.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-mono text-sm"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
