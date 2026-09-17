'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { monitor } from '@/lib/monitor';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
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
    monitor.logError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 border border-border/60 rounded-2xl bg-panel/30 text-center font-mono space-y-5 select-none animate-in fade-in duration-200">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-full animate-pulse">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold text-foreground">Rendering Pipeline Exception</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A critical rendering or telemetry exception occurred in the client portal frame.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-500/10 p-2.5 rounded overflow-x-auto text-left mt-2 font-mono">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-secondary border border-border hover:bg-secondary/80 text-foreground font-bold rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
