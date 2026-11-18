import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

/**
 * Return point from Google / Apple when the round-trip did not sign the person in straight away: Clerk
 * finishes it here (an existing account signing up becomes a sign-in, a new one signing in becomes a
 * sign-up), then continues to /sso-callback/complete, which provisions the account if needed.
 */
export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/sso-callback/complete"
      signUpForceRedirectUrl="/sso-callback/complete"
    />
  );
}
