'use client';

import { FormEvent, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignIn, useUser } from '@clerk/nextjs';
import { ArrowRight, Award, Sparkles, Trophy } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import {
  Checkbox,
  TextField,
  Divider,
  SocialButtons,
  SubmitButton,
  FormError,
} from '@/components/auth/form-controls';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { Logo } from '@/components/landing/logo';
import { useSignOut } from '@/hooks/auth';
import { getAuthDestination } from '@/lib/auth-redirect';

const perks = [
  { icon: Sparkles, label: 'AI-personalised learning paths' },
  { icon: Trophy, label: 'Track your XP and\nachievements' },
  { icon: Award, label: 'Earn verifiable certificates' },
];

function SignInLeftPanel() {
  return (
    <div className="lg:pl-[48px] lg:pt-[126px]">
      <Logo tone="light" size="lg" className="lg:ml-[2px]" />

      <h1 className="mt-10 font-display text-[36px] font-extrabold leading-[44px] text-white sm:text-[46px] sm:leading-[53px] lg:mt-[75px]">
        Welcome back,
        <br />
        keep elevating.
      </h1>
      <p className="mt-[10px] text-[17px] leading-[30px] text-white/85">
        Your AI coach Aria has been
        <br />
        keeping your path warm.
      </p>

      <ul className="mt-[49px] hidden space-y-[21px] lg:block">
        {perks.map((perk) => (
          <li key={perk.label} className="flex items-center gap-4">
            <span className="flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-light">
              <perk.icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="whitespace-pre-line text-[16.5px] leading-[25px] text-white/90">{perk.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');

  const { signIn, fetchStatus } = useSignIn();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { signOut } = useSignOut();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [isSessionExists, setIsSessionExists] = useState(false);

  const loading = fetchStatus === 'fetching' || isSubmitting;

  // Auto-redirect if already signed in
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      const role = user?.publicMetadata?.role as string | undefined;
      const destination = getAuthDestination(redirectUrl, role);
      router.replace(destination);
    }
  }, [isUserLoaded, isSignedIn, user, redirectUrl, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSessionExists(false);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await signIn.password({ identifier: email, password });
      if (signInError) {
        if (
          signInError.code === 'session_exists' ||
          signInError.message?.toLowerCase().includes('already signed in')
        ) {
          setIsSessionExists(true);
          setError('You are already signed in to an active session.');
        } else {
          setError(signInError.longMessage ?? signInError.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize();
        const role = user?.publicMetadata?.role as string | undefined;
        const destination = getAuthDestination(redirectUrl, role);
        window.location.href = destination;
        return;
      }

      // If email verification is pending / factor is missing
      if (signIn.status === 'needs_first_factor') {
        const { error: sendError } = await signIn.emailCode.sendCode();
        if (sendError) {
          setError(sendError.longMessage ?? sendError.message);
          setIsSubmitting(false);
          return;
        }
        setStep('verify');
        setIsSubmitting(false);
        return;
      }

      setError('Additional verification is required to finish signing in.');
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during sign in.');
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(verificationCode: string): Promise<{ success: boolean; error?: string }> {
    setIsSubmitting(true);
    try {
      const { error: verifyError } = await signIn.emailCode.verifyCode({ code: verificationCode });
      if (verifyError) {
        setIsSubmitting(false);
        return { success: false, error: verifyError.longMessage ?? verifyError.message };
      }

      if (signIn.status === 'complete') {
        await signIn.finalize();
        const role = user?.publicMetadata?.role as string | undefined;
        const destination = getAuthDestination(redirectUrl, role);
        window.location.href = destination;
        return { success: true };
      }

      setIsSubmitting(false);
      return { success: false, error: 'Verification succeeded but session is incomplete.' };
    } catch (err) {
      setIsSubmitting(false);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to verify code.' };
    }
  }

  async function handleResendCode(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error: sendError } = await signIn.emailCode.sendCode();
      if (sendError) {
        return { success: false, error: sendError.longMessage ?? sendError.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to resend code.' };
    }
  }

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_apple') {
    setError(null);
    setIsSessionExists(false);
    const provider = strategy === 'oauth_google' ? 'google' : 'apple';
    setSocialLoading(provider);
    try {
      const callbackDestination = getAuthDestination(redirectUrl);
      const { error: ssoError } = await signIn.sso({
        strategy,
        redirectUrl: '/sso-callback',
        redirectCallbackUrl: callbackDestination,
      });
      if (ssoError) {
        setError(ssoError.longMessage ?? ssoError.message);
        setSocialLoading(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate social login.');
      setSocialLoading(null);
    }
  }

  // If already signed in, let the useEffect / window.location redirect cleanly without UI flash
  if (isUserLoaded && isSignedIn) {
    return null;
  }

  if (step === 'verify') {
    return (
      <VerifyEmailForm
        email={email}
        loading={loading}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
      />
    );
  }

  return (
    <AuthShell leftContent={<SignInLeftPanel />}>
      <div className="w-full max-w-[404px]">
        <h2 className="font-display text-[30px] font-extrabold leading-10 tracking-[-0.01em] text-[#1c0e04] sm:text-[34px]">
          Sign in to your account
        </h2>
        <p className="mt-[10px] text-[17px] leading-6 text-[#7a6655]">
          No account yet?{' '}
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-light"
          >
            Sign up free
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-10">
          {error && (
            <div className="mb-5">
              <FormError message={error} />
            </div>
          )}

          {isSessionExists && (
            <div className="mb-5 space-y-3 rounded-xl border border-[#e8d5bb] bg-[#fdeee4] p-4 text-center">
              <p className="text-sm text-[#7a6655]">
                Would you like to proceed to your dashboard or sign out of your current session?
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

          <div className="space-y-5">
            <TextField
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="kofi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mt-[19px] flex items-center justify-between gap-3">
            <Checkbox label="Remember me" checked={rememberMe} onChange={setRememberMe} />
            <Link
              href="/forgot-password"
              className="text-base font-semibold text-brand hover:text-brand-light"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton loading={loading} loadingText="Signing in..." arrow className="mt-[19px]">
            Sign In
          </SubmitButton>

          <div className="mt-5">
            <Divider />
          </div>

          <div className="mt-5">
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

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthShell leftContent={<SignInLeftPanel />}>
          <p className="text-sm text-[#7a6655]">Loading sign in...</p>
        </AuthShell>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
