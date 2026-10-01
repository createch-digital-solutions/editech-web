'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignIn } from '@clerk/nextjs';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { SimpleNavbar } from '@/components/landing/simple-navbar';
import { CenteredCardPage, IconCircle } from '@/components/auth/centered-card-page';
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
    <CenteredCardPage header={<SimpleNavbar />}>
      <div className="w-full max-w-[418px] rounded-2xl border border-[#efe2d0] bg-[#fffdf9] px-5 pb-[21px] pt-5">
        <IconCircle icon={step === 'email' ? Lock : Mail} className="h-16 w-16" iconClassName="h-6 w-6" />

        {step === 'email' ? (
          <>
            <h1 className="mt-[22px] text-center font-display text-2xl font-extrabold leading-7 text-[#1c0e04]">
              Forgot your password?
            </h1>
            <p className="mt-[10px] text-center text-sm leading-[23px] text-[#7a6655]">
              Enter the email on your account — we will send a reset link.
            </p>

            <form onSubmit={handleSendCode} className="mt-[28px]">
              {error && (
                <div className="mb-4">
                  <FormError message={error} />
                </div>
              )}
              <TextField
                label="Email address"
                type="email"
                size="md"
                autoComplete="email"
                placeholder="adaeze@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2"
              />
              <SubmitButton
                loading={loading}
                loadingText="Sending link..."
                className="mt-[15px] h-[38px] text-[13px]"
              >
                Send Reset Link
              </SubmitButton>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-[22px] text-center font-display text-2xl font-extrabold leading-7 text-[#1c0e04]">
              Check your inbox
            </h1>
            <p className="mt-[10px] text-center text-sm leading-[23px] text-[#7a6655]">
              Enter the code we sent to{' '}
              <span className="break-all font-semibold text-[#1c0e04]">{email}</span> and choose a new
              password.
            </p>

            <form onSubmit={handleResetPassword} className="mt-[28px] space-y-4">
              {error && <FormError message={error} />}
              <TextField
                label="Verification code"
                size="md"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="mt-2"
              />
              <TextField
                label="New password"
                type="password"
                size="md"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-2"
              />
              <SubmitButton
                loading={loading}
                loadingText="Resetting password..."
                className="h-[38px] text-[13px]"
              >
                Reset Password
              </SubmitButton>
            </form>
          </>
        )}

        <Link
          href="/sign-in"
          className="mt-[13px] flex items-center justify-center gap-1 text-[13px] font-semibold leading-5 text-brand hover:text-brand-light"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </CenteredCardPage>
  );
}
