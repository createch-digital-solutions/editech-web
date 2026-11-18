'use client';

import { FormEvent, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignUp, useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { HomeLink } from '@/components/auth/home-link';
import { RoleToggle, SignUpRole } from '@/components/auth/role-toggle';
import { TextField, Divider, SocialButtons, SubmitButton, FormError } from '@/components/auth/form-controls';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { BadgeLogo } from '@/components/landing/logo';
import { POST_AUTH_REDIRECT_KEY, useSignOut } from '@/hooks/auth';
import { getAuthDestination } from '@/lib/auth-redirect';
import { apiClient } from '@/lib/api-client';

const stats = [
  { value: '500+', label: 'Courses' },
  { value: '200+', label: 'Instructors' },
  { value: '50K+', label: 'Learners' },
  { value: '4.9★', label: 'Rating' },
];

// Fields are paired two to a row (names, passwords) so the whole form fits one screen.
const fieldClass = 'h-12 lg:h-[53px]';

function SignUpLeftPanel() {
  return (
    <div className="pl-[30px] pt-[clamp(24px,calc(50vh-291px),81px)]">
      <HomeLink className="inline-block">
        <BadgeLogo tone="light" />
      </HomeLink>

      <span className="mt-[22px] flex h-8 w-full max-w-[346px] items-center rounded-full border border-brand-light/30 bg-brand-light/10 px-4 text-[13px] font-bold tracking-[0.02em] text-[#e8a33d]">
        JOIN 50,000+ LEARNERS
      </span>

      <h1 className="mt-[23px] font-sora text-[47px] font-extrabold leading-[52px] tracking-[-0.02em] text-white">
        Join
        <br />
        thousands
        <br />
        learning skills
        <br />
        that pay.
      </h1>

      <dl className="mt-[43px] grid grid-cols-[147px_147px] gap-x-3 gap-y-[13px]">
        {stats.map((stat) => (
          <div key={stat.label} className="flex h-[88px] flex-col justify-center rounded-[10px] bg-white/[0.08] pl-[17px]">
            <dt className="sr-only">{stat.label}</dt>
            <dd className="font-mono text-2xl font-bold leading-7 text-[#e8a33d]">{stat.value}</dd>
            <div className="mt-[3px] text-[13px] leading-5 text-white/85">{stat.label}</div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');

  const { signUp, fetchStatus } = useSignUp();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { signOut } = useSignOut();

  const [role, setRole] = useState<SignUpRole>('LEARNER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Clerk's bot check can take a minute; after a few seconds say so, so it doesn't look frozen.
  const [slowCheck, setSlowCheck] = useState(false);
  const [verifyLoadingText, setVerifyLoadingText] = useState('Verifying code...');
  const [isSessionExists, setIsSessionExists] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const loading = fetchStatus === 'fetching' || isSubmitting;

  // Auto-redirect if already signed in
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      const userRole = user?.publicMetadata?.role as string | undefined;
      const destination = getAuthDestination(redirectUrl, userRole);
      router.replace(destination);
    }
  }, [isUserLoaded, isSignedIn, user, redirectUrl, router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSessionExists(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const slowTimer = setTimeout(() => setSlowCheck(true), 8000);
    try {
      const { error: signUpError } = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: { role },
      });

      if (signUpError) {
        if (
          signUpError.code === 'session_exists' ||
          signUpError.message?.toLowerCase().includes('already signed in')
        ) {
          setIsSessionExists(true);
          setError('You are already signed in to an active session.');
        } else {
          setError(signUpError.longMessage ?? signUpError.message);
        }
        setIsSubmitting(false);
        return;
      }

      // Email verification is mandatory before proceeding to complete account creation.
      const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
      if (sendCodeError) {
        setError(sendCodeError.longMessage ?? sendCodeError.message);
        setIsSubmitting(false);
        return;
      }
      setStep('verify');
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during account creation.');
      setIsSubmitting(false);
    } finally {
      clearTimeout(slowTimer);
      setSlowCheck(false);
    }
  }

  async function handleVerifyCode(verificationCode: string): Promise<{ success: boolean; error?: string }> {
    setIsSubmitting(true);
    setVerifyLoadingText('Verifying code...');
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code: verificationCode });
      if (verifyError) {
        setIsSubmitting(false);
        return { success: false, error: verifyError.longMessage ?? verifyError.message };
      }

      if (signUp.status === 'complete') {
        const clerkId = signUp.createdUserId;
        if (clerkId) {
          setVerifyLoadingText('Setting up your account...');
          try {
            await apiClient.post('/auth/provision', { clerkId }, { skipAuth: true });
          } catch (provisionErr) {
            console.error('Provisioning error before finalize:', provisionErr);
            // Even if provision network call errors, we do not swallow silently without informing,
            // but we allow finalize to proceed so user is not stuck.
          }
        }

        await signUp.finalize();
        // New learners pick goals/topics/level first; everyone else goes straight to their dashboard.
        const destination =
          !redirectUrl && role === 'LEARNER'
            ? '/onboarding'
            : getAuthDestination(redirectUrl, role.toUpperCase());
        window.location.href = destination;
        return { success: true };
      }

      setIsSubmitting(false);
      return { success: false, error: 'Additional verification is required to complete your account.' };
    } catch (err) {
      setIsSubmitting(false);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to verify code.' };
    }
  }

  /**
   * Google / Apple sign-up. The chosen role goes with it (as for email sign-up); the round-trip ends on
   * /sso-callback/complete, which provisions the account (social sign-up skips the email-code step that
   * does it here) before continuing — new learners then land on onboarding.
   */
  async function handleOAuth(strategy: 'oauth_google' | 'oauth_apple') {
    setError(null);
    setIsSessionExists(false);
    setSocialLoading(strategy === 'oauth_google' ? 'google' : 'apple');
    // The same bot check runs before Google / Apple opens; on success the page leaves, so only a failure clears it.
    const slowTimer = setTimeout(() => setSlowCheck(true), 8000);
    try {
      try {
        sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, redirectUrl ?? '');
      } catch {
        // Private mode: they land on their dashboard (or onboarding) instead.
      }
      const { error: ssoError } = await signUp.sso({
        strategy,
        // Signed in: straight to the last step. Needs another step (e.g. the Google account already has an
        // account here, so it becomes a sign-in): /sso-callback, where Clerk finishes it.
        redirectUrl: '/sso-callback/complete',
        redirectCallbackUrl: '/sso-callback',
        unsafeMetadata: { role },
      });
      if (ssoError) {
        setError(ssoError.longMessage ?? ssoError.message);
        setSocialLoading(null);
        clearTimeout(slowTimer);
        setSlowCheck(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sign-up with that provider.');
      setSocialLoading(null);
      clearTimeout(slowTimer);
      setSlowCheck(false);
    }
  }

  async function handleResendCode(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        return { success: false, error: sendError.longMessage ?? sendError.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to resend code.' };
    }
  }

  // If already signed in or completing sign-up, show setting up your account state
  if (isUserLoaded && isSignedIn) {
    return (
      <AuthShell leftContent={<SignUpLeftPanel />}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="mt-4 text-sm font-medium text-[#3d2b1f]">Setting up your account...</p>
        </div>
      </AuthShell>
    );
  }

  if (step === 'verify') {
    return (
      <VerifyEmailForm
        email={email}
        loading={loading}
        loadingText={verifyLoadingText}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
      />
    );
  }

  return (
    <AuthShell leftContent={<SignUpLeftPanel />}>
      <div className="w-full max-w-[426px] lg:max-w-[460px]">
        <h2 className="type-page-title text-[#1c0e04] lg:text-[32px] lg:leading-10">
          Create your account
        </h2>
        <p className="mt-1.5 text-[15px] leading-6 text-[#7a6655] sm:text-[17px]">
          Already have one?{' '}
          <Link href="/sign-in" className="font-semibold text-brand hover:text-brand-light">
            Sign in
          </Link>
        </p>

        <div className="mt-5 sm:mt-6">
          <RoleToggle value={role} onChange={setRole} />
        </div>

        <form onSubmit={handleCreate} className="mt-4 sm:mt-5">
          {error && (
            <div className="mb-4">
              <FormError message={error} />
            </div>
          )}

          {isSessionExists && (
            <div className="mb-4 space-y-3 rounded-xl border border-[#e8d5bb] bg-[#fdeee4] p-4 text-center">
              <p className="text-sm text-[#7a6655]">
                Would you like to proceed to your dashboard or sign out of your current session to create a new account?
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = getAuthDestination(redirectUrl);
                  }}
                  className="cursor-pointer rounded-lg bg-brand-gradient px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Go to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="cursor-pointer rounded-lg border border-[#e8d5bb] bg-[#fffdf9] px-3 py-2 text-xs font-semibold text-[#3d2b1f] hover:bg-white"
                >
                  Sign Out & Clear Session
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3.5 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-[15px]">
              <TextField
                label="First name"
                autoComplete="given-name"
                placeholder="Adaeze"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={fieldClass}
              />
              <TextField
                label="Last name"
                autoComplete="family-name"
                placeholder="Okafor"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={fieldClass}
              />
            </div>

            <TextField
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="adaeze@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldClass}
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-[15px]">
              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={fieldClass}
              />
              <TextField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat it"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          {/* Clerk's bot check shows here when it needs the person to confirm they're human. Without this
              spot it falls back to an invisible check that can fail and leave sign-up waiting forever. */}
          <div id="clerk-captcha" className="mt-4 empty:hidden" />

          <SubmitButton
            loading={loading}
            loadingText="Creating account..."
            arrow
            className="mt-5 h-12 text-[17px] lg:h-[52px]"
          >
            Create Account
          </SubmitButton>
          {slowCheck && (
            <p className="mt-2 text-center text-[13px] text-[#7a6655]" role="status">
              Running a quick security check. This can take up to a minute, please keep this page open.
            </p>
          )}

          <div className="mt-4">
            <Divider />
          </div>

          <div className="mt-4">
            <SocialButtons
              disabled={loading || !!socialLoading}
              loadingProvider={socialLoading}
              onGoogle={() => handleOAuth('oauth_google')}
              onApple={() => handleOAuth('oauth_apple')}
            />
          </div>
        </form>
      </div>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <AuthShell leftContent={<SignUpLeftPanel />}>
          <p className="text-sm text-[#7a6655]">Loading sign up...</p>
        </AuthShell>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
