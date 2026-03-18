import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6 text-center">
          <div className="max-w-md w-full bg-[var(--surface)] rounded-3xl p-8 shadow-2xl border border-[var(--border)] animate-slide-up">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Oops! Something went wrong</h1>
            <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
              We encountered an unexpected error while rendering this page. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-semibold hover:bg-[var(--primary-hover)] transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20"
            >
              Refresh Application
            </button>
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-muted)] font-mono break-all opacity-60">
                {this.state.error?.message}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 
