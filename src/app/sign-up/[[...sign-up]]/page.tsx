'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignUp } from '@clerk/nextjs';
import { Mail } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { RoleToggle, SignUpRole } from '@/components/auth/role-toggle';
import { TextField, Divider, SocialButtons, SubmitButton, FormError } from '@/components/auth/form-controls';

const stats = [
  { value: '500+', label: 'Courses' },
  { value: '200+', label: 'Instructors' },
  { value: '50K+', label: 'Learners' },
  { value: '4.9★', label: 'Rating' },
];

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const [role, setRole] = useState<SignUpRole>('learner');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const loading = fetchStatus === 'fetching';

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const { error: signUpError } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
      unsafeMetadata: { role },
    });
    if (signUpError) {
      setError(signUpError.longMessage ?? signUpError.message);
      return;
    }

    if (signUp.status === 'complete') {
      await signUp.finalize();
      router.push('/');
      return;
    }

    const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
    if (sendCodeError) {
      setError(sendCodeError.longMessage ?? sendCodeError.message);
      return;
    }
    setStep('verify');
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
    if (verifyError) {
      setError(verifyError.longMessage ?? verifyError.message);
      return;
    }

    if (signUp.status === 'complete') {
      await signUp.finalize();
      router.push('/');
    } else {
      setError('Additional verification is required to finish creating your account.');
    }
  }

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_apple') {
    setError(null);
    const { error: ssoError } = await signUp.sso({
      strategy,
      redirectUrl: '/sso-callback',
      redirectCallbackUrl: '/sso-callback',
      unsafeMetadata: { role },
    });
    if (ssoError) {
      setError(ssoError.longMessage ?? ssoError.message);
    }
  }

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

            <SubmitButton loading={loading}>Create Account &rarr;</SubmitButton>

            <Divider />

            <SocialButtons
              disabled={loading}
              onGoogle={() => handleOAuth('oauth_google')}
              onApple={() => handleOAuth('oauth_apple')}
            />
          </form>
        </>
      ) : (
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <Mail className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Check your inbox</h2>
          <p className="mt-2 text-sm text-gray-500">
            We sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-4 text-left">
            {error && <FormError message={error} />}

            <TextField
              label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <SubmitButton loading={loading}>Verify Email &rarr;</SubmitButton>

            <button
              type="button"
              onClick={() => signUp.verifications.sendEmailCode()}
              className="w-full cursor-pointer text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Didn&apos;t get it? <span className="font-semibold text-orange-600">Resend code</span>
            </button>
          </form>
        </div>
      )}
    </AuthShell>
  );
}
