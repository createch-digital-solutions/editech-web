'use client';

import React from 'react';
import Link from 'next/link';
import { ApiClientError } from '@/lib/api-client';

interface ApiErrorBoundaryState {
  error: ApiClientError | Error | null;
}

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback UI — receives the error and a reset function */
  fallback?: (error: ApiClientError | Error, reset: () => void) => React.ReactNode;
  /** Called when the boundary catches an error */
  onError?: (error: ApiClientError | Error) => void;
}

/**
 * Error boundary for ApiClientError thrown during render or in query suspense.
 *
 * Distinguishes error types and renders appropriate default UI:
 * - 401: session expired message (redirect to sign-in)
 * - 403: permission denied message
 * - 404: not found message
 * - 5xx: generic server error with retry
 *
 * Provide a `fallback` prop to fully customise the error UI.
 *
 * @example
 * ```tsx
 * <ApiErrorBoundary>
 *   <CourseList />
 * </ApiErrorBoundary>
 * ```
 */
export class ApiErrorBoundary extends React.Component<
  ApiErrorBoundaryProps,
  ApiErrorBoundaryState
> {
  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown): ApiErrorBoundaryState {
    if (error instanceof ApiClientError || error instanceof Error) {
      return { error };
    }
    return { error: new Error(String(error)) };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    if (this.props.onError && (error instanceof ApiClientError || error instanceof Error)) {
      this.props.onError(error);
    }
    console.error('[ApiErrorBoundary]', error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    // Default error UI (no styling — screens handle that)
    if (error instanceof ApiClientError) {
      return (
        <DefaultErrorUI
          status={error.status}
          message={error.message}
          code={error.code}
          onReset={this.reset}
        />
      );
    }

    return (
      <DefaultErrorUI
        status={500}
        message={error.message || 'An unexpected error occurred.'}
        onReset={this.reset}
      />
    );
  }
}

// --- Default Error UI --------------------------------------------------------

interface DefaultErrorUIProps {
  status: number;
  message: string;
  code?: string;
  onReset: () => void;
}

function DefaultErrorUI({ status, message, code, onReset }: DefaultErrorUIProps) {
  if (status === 401) {
    return (
      <div role="alert" data-error-type="unauthorized">
        <p>Your session has expired. Please sign in again.</p>
        <Link href="/sign-in">Sign in</Link>
      </div>
    );
  }

  if (status === 403) {
    return (
      <div role="alert" data-error-type="forbidden">
        <p>You do not have permission to view this content.</p>
        <Link href="/">Go home</Link>
      </div>
    );
  }

  if (status === 404) {
    return (
      <div role="alert" data-error-type="not-found">
        <p>The requested resource was not found.</p>
        <Link href="/">Go home</Link>
      </div>
    );
  }

  return (
    <div role="alert" data-error-type="server-error" data-error-code={code}>
      <p>Something went wrong: {message}</p>
      <button type="button" onClick={onReset}>
        Try again
      </button>
    </div>
  );
}
