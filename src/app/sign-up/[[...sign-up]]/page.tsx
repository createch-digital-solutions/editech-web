'use client';

import { FormEvent, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignUp, useUser } from '@clerk/nextjs';
import { Mail, Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { RoleToggle, SignUpRole } from '@/components/auth/role-toggle';
import { TextField, Divider, SocialButtons, SubmitButton, FormError } from '@/components/auth/form-controls';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { useSignOut } from '@/hooks/auth';
import { getAuthDestination } from '@/lib/auth-redirect';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '500+', label: 'Courses' },
  { value: '200+', label: 'Instructors' },
  { value: '50K+', label: 'Learners' },
  { value: '4.9★', label: 'Rating' },
];

function SignUpForm() {
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
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [isSessionExists, setIsSessionExists] = useState(false);

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
    }
  }

  async function handleVerifyCode(verificationCode: string): Promise<{ success: boolean; error?: string }> {
    setIsSubmitting(true);
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code: verificationCode });
      if (verifyError) {
        setIsSubmitting(false);
        return { success: false, error: verifyError.longMessage ?? verifyError.message };
      }

      if (signUp.status === 'complete') {
        await signUp.finalize();
        const destination = getAuthDestination(redirectUrl, role.toUpperCase());
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

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_apple') {
    setError(null);
    setIsSessionExists(false);
    const provider = strategy === 'oauth_google' ? 'google' : 'apple';
    setSocialLoading(provider);
    try {
      const callbackDestination = getAuthDestination(redirectUrl, role.toUpperCase());
      const { error: ssoError } = await signUp.sso({
        strategy,
        redirectUrl: '/sso-callback',
        redirectCallbackUrl: callbackDestination,
        unsafeMetadata: { role },
      });
      if (ssoError) {
        setError(ssoError.longMessage ?? ssoError.message);
        setSocialLoading(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate social sign up.');
      setSocialLoading(null);
    }
  }

  // If already signed in, show a clean, minimal spinner while redirecting to avoid layout flash
  if (isUserLoaded && isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-sm font-medium text-gray-600">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {step === 'form' ? (
        <>
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Already have one?{' '}
            <Link href="/sign-in" className="font-semibold text-orange-600 hover:text-orange-700">
              Sign in
            </Link>
          </p>

          <div className="mt-6">
            <RoleToggle value={role} onChange={setRole} />
          </div>

          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            {error && <FormError message={error} />}

            {isSessionExists && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center space-y-3">
                <p className="text-xs text-gray-600">
                  Would you like to proceed to your dashboard or sign out of your current session to create a new account?
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

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="First name"
                autoComplete="given-name"
                placeholder="Adaeze"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <TextField
                label="Last name"
                autoComplete="family-name"
                placeholder="Okafor"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
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
            />

            <TextField
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <TextField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <SubmitButton loading={loading} loadingText="Creating account...">Create Account &rarr;</SubmitButton>

            <Divider />

            <SocialButtons
              disabled={loading || !!socialLoading}
              loadingProvider={socialLoading}
              onGoogle={() => handleOAuth('oauth_google')}
              onApple={() => handleOAuth('oauth_apple')}
            />
          </form>
        </>
      ) : (
        <VerifyEmailForm
          email={email}
          loading={loading}
          onVerify={handleVerifyCode}
          onResend={handleResendCode}
          onCancel={async () => {
            try {
              await signUp.reset?.();
            } catch {
              // ignore
            }
            setStep('form');
          }}
        />
      )}
    </>
  );
}

export default function SignUpPage() {
  return (
    <AuthShell
      leftContent={
        <div>
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-orange-200">
            JOIN 50,000+ LEARNERS
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white">
            Join thousands learning skills that pay.
          </h1>

          <dl className="mt-10 grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/10 px-4 py-3">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-bold text-orange-400">{stat.value}</dd>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </dl>
        </div>
      }
    >
      <Suspense fallback={<div className="py-12 text-center text-sm text-gray-500">Loading sign up...</div>}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
