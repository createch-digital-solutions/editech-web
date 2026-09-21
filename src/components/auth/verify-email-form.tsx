'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { TextField, SubmitButton, FormError } from '@/components/auth/form-controls';
import { Button } from '@/components/ui/button';

interface VerifyEmailFormProps {
  email: string;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  onResend: () => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
  onCancel?: () => void;
}

export function VerifyEmailForm({
  email,
  onVerify,
  onResend,
  loading = false,
  onCancel,
}: VerifyEmailFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResendMessage(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    const res = await onVerify(trimmed);
    if (!res.success && res.error) {
      setError(res.error);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || isResending) return;
    setError(null);
    setIsResending(true);
    setResendMessage(null);

    try {
      const res = await onResend();
      if (res.success) {
        setResendMessage('A new verification code has been sent to your email.');
        setResendCooldown(60);
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
        {error && <FormError message={error} />}

        {resendMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center text-xs font-medium text-green-800">
            {resendMessage}
          </div>
        )}

        <TextField
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <SubmitButton loading={loading} loadingText="Verifying code...">Verify Email &rarr;</SubmitButton>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={resendCooldown > 0 || isResending}
            onClick={handleResendCode}
            className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend code'}
          </button>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Use different email
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
