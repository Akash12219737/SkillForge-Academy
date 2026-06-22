import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

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
    console.error('ErrorBoundary caught an unhandled client error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
          <div className="rounded-2xl bg-destructive/10 p-4 text-destructive mb-6">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-black text-foreground md:text-3xl mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            An unexpected error occurred within the application shell. You can attempt to refresh the page or return to the main dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center space-x-1.5">
              <span>Refresh Page</span>
            </Button>
            <Button variant="primary" onClick={this.handleReset} className="flex items-center space-x-1.5">
              <RotateCcw className="h-4 w-4" />
              <span>Back to Safety</span>
            </Button>
          </div>
          {this.state.error && (
            <pre className="mt-8 max-w-2xl overflow-x-auto rounded-lg bg-slate-100 dark:bg-slate-900 p-4 text-left text-xs text-muted-foreground border border-slate-200 dark:border-slate-800">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
