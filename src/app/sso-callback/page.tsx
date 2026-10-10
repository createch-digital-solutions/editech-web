import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

/**
 * Return point from Google / Apple. Clerk finishes the sign-in or sign-up here, then every outcome
 * continues to /sso-callback/complete, which provisions the account if needed before the proxy sees it.
 */
export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/sso-callback/complete"
      signUpForceRedirectUrl="/sso-callback/complete"
    />
  );
}
