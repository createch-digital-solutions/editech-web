'use client';

import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubmitButton, FormError } from '@/components/auth/form-controls';
import { CenteredCardPage, IconCircle } from '@/components/auth/centered-card-page';

const CODE_LENGTH = 6;
// Clerk email codes stay valid for 10 minutes.
const CODE_LIFETIME_SECONDS = 10 * 60;

interface VerifyEmailFormProps {
  email: string;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  onResend: () => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
  loadingText?: string;
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Full-page "Check your inbox" screen with a 6-box one-time-code input. */
export function VerifyEmailForm({
  email,
  onVerify,
  onResend,
  loading = false,
  loadingText = 'Verifying code...',
}: VerifyEmailFormProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CODE_LIFETIME_SECONDS);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function fillFrom(index: number, value: string) {
    const chars = value.replace(/\D/g, '').slice(0, CODE_LENGTH - index).split('');
    if (chars.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => (next[index + i] = c));
      return next;
    });
    inputs.current[Math.min(index + chars.length, CODE_LENGTH - 1)]?.focus();
  }

  function handleChange(index: number, value: string) {
    if (value === '') {
      setDigits((prev) => prev.map((d, i) => (i === index ? '' : d)));
      return;
    }
    fillFrom(index, value);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setDigits((prev) => prev.map((d, i) => (i === index - 1 ? '' : d)));
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    fillFrom(index, e.clipboardData.getData('text'));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResendMessage(null);

    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    const res = await onVerify(code);
    if (!res.success && res.error) {
      setError(res.error);
    }
  }

  async function handleResend() {
    if (isResending) return;
    setError(null);
    setResendMessage(null);
    setIsResending(true);
    try {
      const res = await onResend();
      if (res.success) {
        setResendMessage('A new verification code has been sent to your email.');
        setDigits(Array(CODE_LENGTH).fill(''));
        setSecondsLeft(CODE_LIFETIME_SECONDS);
        inputs.current[0]?.focus();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <CenteredCardPage>
      <div className="w-full max-w-[459px] rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[19px] pb-[19px] pt-[19px] text-center sm:px-[19px]">
        <IconCircle icon={Mail} className="h-[72px] w-[72px]" />

        <h1 className="mt-[22px] font-display text-2xl font-extrabold leading-7 text-[#1c0e04]">
          Check your inbox
        </h1>
        <p className="mt-[9px] text-sm leading-[23px] text-[#7a6655]">
          We sent a 6-digit verification code to
          <br />
          <span className="break-all font-semibold text-[#1c0e04]">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-[33px]">
          <div className="flex justify-center gap-[6px] sm:gap-[10px]" role="group" aria-label="Verification code">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={CODE_LENGTH}
                value={digit}
                aria-label={`Digit ${i + 1}`}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={(e) => handlePaste(i, e)}
                onFocus={(e) => e.target.select()}
                className={cn(
                  'h-[60px] w-[46px] rounded-xl border-2 text-center font-body text-2xl font-bold text-[#1c0e04] focus:border-brand/60 focus:outline-none sm:w-[52px]',
                  digit ? 'border-brand bg-[#fdeee4]' : 'border-[#e8d5bb] bg-[#fffdf9]'
                )}
              />
            ))}
          </div>

          {(error || resendMessage) && (
            <div className="mt-5 text-left">
              {error && <FormError message={error} />}
              {resendMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-800">
                  {resendMessage}
                </div>
              )}
            </div>
          )}

          <SubmitButton
            loading={loading}
            loadingText={loadingText}
            arrow
            className="mx-auto mt-[28px] h-[37px] max-w-[417px] text-[13px]"
          >
            Verify Email
          </SubmitButton>
        </form>

        <p className="mt-[20px] text-[13px] leading-5 text-[#7a6655]">
          Didn&apos;t get it?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="cursor-pointer font-bold text-brand hover:text-brand-light disabled:cursor-wait disabled:opacity-60"
          >
            {isResending ? 'Sending...' : 'Resend code'}
          </button>{' '}
          &middot; {secondsLeft > 0 ? `expires in ${formatCountdown(secondsLeft)}` : 'code expired'}
        </p>
      </div>
    </CenteredCardPage>
  );
}
