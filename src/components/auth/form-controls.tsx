'use client';

import { InputHTMLAttributes, ReactNode, forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleIcon, AppleIcon } from './provider-icons';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, type, className, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div>
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        <div className="relative mt-1.5">
          <input
            ref={ref}
            id={fieldId}
            type={isPassword && showPassword ? 'text' : type}
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100',
              isPassword && 'pr-10',
              error && 'border-red-400',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
TextField.displayName = 'TextField';

export function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">or</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

interface SocialButtonsProps {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
}

export function SocialButtons({ onGoogle, onApple, disabled }: SocialButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onGoogle}
        disabled={disabled}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={onApple}
        disabled={disabled}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <AppleIcon className="h-4 w-4" />
        Continue with Apple
      </button>
    </div>
  );
}

interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function SubmitButton({ children, loading, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}
