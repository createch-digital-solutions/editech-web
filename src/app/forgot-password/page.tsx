'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignIn } from '@clerk/nextjs';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { StripeDivider } from '@/components/landing/stripe-divider';
import { TextField, SubmitButton, FormError } from '@/components/auth/form-controls';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loading = fetchStatus === 'fetching' || isSubmitting;

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: createError } = await signIn.create({ identifier: email });
      if (createError) {
        setError(createError.longMessage ?? createError.message);
        setIsSubmitting(false);
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(sendError.longMessage ?? sendError.message);
        setIsSubmitting(false);
        return;
      }

      setStep('reset');
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code.');
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyError) {
        setError(verifyError.longMessage ?? verifyError.message);
        setIsSubmitting(false);
        return;
      }

      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (submitError) {
        setError(submitError.longMessage ?? submitError.message);
        setIsSubmitting(false);
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize();
        router.push('/');
        return;
      }
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#fdf6ec]">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-orange-100 bg-white p-8 shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          </span>

          {step === 'email' ? (
            <>
              <h1 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
                Forgot your password?
              </h1>
              <p className="mt-2 text-center text-sm text-gray-500">
                Enter the email on your account — we will send a reset link.
              </p>

              <form onSubmit={handleSendCode} className="mt-6 space-y-4">
                {error && <FormError message={error} />}
                <TextField
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="adaeze@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <SubmitButton loading={loading} loadingText="Sending link...">Send Reset Link</SubmitButton>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
                Check your inbox
              </h1>
              <p className="mt-2 text-center text-sm text-gray-500">
                Enter the code we sent to <span className="font-semibold text-gray-900">{email}</span>{' '}
                and choose a new password.
              </p>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
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
                <TextField
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <SubmitButton loading={loading} loadingText="Resetting password...">Reset Password</SubmitButton>
              </form>
            </>
          )}

          <Link
            href="/sign-in"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>

      <StripeDivider />
    </main>
  );
}
