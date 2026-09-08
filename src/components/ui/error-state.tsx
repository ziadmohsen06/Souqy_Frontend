import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { ApiError } from '@/services/api';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

/** Friendly error block used by pages when a query fails. */
export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, title, className = '' }) => {
  const apiErr = error instanceof ApiError ? error : undefined;
  const isNetwork = apiErr?.isNetworkError ?? false;
  const message =
    (apiErr?.message) ||
    (error instanceof Error ? error.message : 'Something went wrong');

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 ${className}`}
    >
      <div className="p-3 rounded-full bg-destructive/10 text-destructive">
        {isNetwork ? <WifiOff className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
      </div>
      <h3 className="font-bold text-foreground">
        {title ?? (isNetwork ? "Can't reach the server" : 'Something went wrong')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      {isNetwork && (
        <p className="text-xs text-muted-foreground/80 max-w-md">
          Start the backend (<code className="font-mono">dotnet run</code>) or the mock API (
          <code className="font-mono">npm run mock</code>), then retry.
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
};
