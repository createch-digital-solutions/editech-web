/**
 * PostHog Analytics Setup (Stub / Wrapper)
 * Event tracking and user telemetry deferred to Phase 6.
 */

export function initPostHog() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    // Disabled in placeholder state
    return;
  }
  // TODO: Initialize PostHog client when real API key is configured
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  // TODO: Send event to PostHog
  if (process.env.NODE_ENV === 'development') {
    console.log(`[PostHog Stub] Event: ${eventName}`, properties);
  }
}
