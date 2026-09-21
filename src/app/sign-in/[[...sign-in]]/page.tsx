'use client';

import { FormEvent, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignIn, useUser } from '@clerk/nextjs';
import { Award, Sparkles, Trophy } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { TextField, Divider, SocialButtons, SubmitButton, FormError } from '@/components/auth/form-controls';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { useSignOut } from '@/hooks/auth';
import { getAuthDestination } from '@/lib/auth-redirect';
import { Button } from '@/components/ui/button';

const perks = [
  { icon: Sparkles, label: 'AI-personalised learning paths' },
  { icon: Trophy, label: 'Track your XP and achievements' },
  { icon: Award, label: 'Earn verifiable certificates' },
];

function SignInForm() {
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
    const callbackDestination = getAuthDestination(redirectUrl);
    const { error: ssoError } = await signIn.sso({
      strategy,
      redirectUrl: '/sso-callback',
      redirectCallbackUrl: callbackDestination,
    });
    if (ssoError) {
      setError(ssoError.longMessage ?? ssoError.message);
    }
  }

  // If already signed in, show status banner with dashboard and sign-out controls
  if (isUserLoaded && isSignedIn) {
    const role = user?.publicMetadata?.role as string | undefined;
    const destination = getAuthDestination(redirectUrl, role);

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
        <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            You are currently signed in as{' '}
            <span className="font-semibold text-gray-900">
              {user?.primaryEmailAddress?.emailAddress ?? 'Active User'}
            </span>
          </p>
          <p className="text-xs text-gray-500">Redirecting to your dashboard...</p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => { window.location.href = destination; }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Go to Dashboard &rarr;
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => signOut()}
            >
              Sign Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <VerifyEmailForm
        email={email}
        loading={loading}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        onCancel={async () => {
          try {
            await signIn.reset?.();
          } catch {
            // ignore
          }
          setStep('form');
        }}
      />
    );
  }

  return (
    <>
      <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      <p className="mt-2 text-sm text-gray-500">
        No account yet?{' '}
        <Link href="/sign-up" className="font-semibold text-orange-600 hover:text-orange-700">
          Sign up free &rarr;
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <FormError message={error} />}

        {isSessionExists && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center space-y-3">
            <p className="text-xs text-gray-600">
              Would you like to proceed to your dashboard or sign out of your current session?
            </p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => { window.location.href = getAuthDestination(redirectUrl); }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              >
                Go to Dashboard
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => signOut()}
                className="text-xs"
              >
                Sign Out & Clear Session
              </Button>
            </div>
          </div>
        )}

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

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading}>Sign In &rarr;</SubmitButton>

        <Divider />

        <SocialButtons
          disabled={loading}
          onGoogle={() => handleOAuth('oauth_google')}
          onApple={() => handleOAuth('oauth_apple')}
        />
      </form>
    </>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      leftContent={
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Welcome back, keep elevating.
          </h1>
          <p className="mt-4 max-w-sm text-gray-300">
            Your AI coach Aria has been keeping your path warm.
          </p>

          <ul className="mt-10 space-y-4">
            {perks.map((perk) => (
              <li key={perk.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-400">
                  <perk.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm text-gray-200">{perk.label}</span>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <Suspense fallback={<div className="py-12 text-center text-sm text-gray-500">Loading sign in...</div>}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
