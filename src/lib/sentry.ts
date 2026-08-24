/**
 * Sentry Monitoring Setup (Stub / Wrapper)
 * Full error boundaries and telemetry deferred to Phase 6.
 */

export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || dsn.includes('placeholder')) {
    // Disabled in placeholder state
    return;
  }
  // TODO: Initialize Sentry client when real DSN is configured
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  // TODO: Send exception to Sentry
  if (process.env.NODE_ENV === 'development') {
    console.error('[Sentry Stub] Captured exception:', error, context);
  }
}
