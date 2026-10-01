'use client';

import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  /** `lg` is the split-screen auth form; `md` is the compact centred card (forgot password). */
  size?: 'md' | 'lg';
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className, size = 'lg', ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <div>
        <label
          htmlFor={fieldId}
          className={cn(
            'block font-body font-semibold text-[#3d2b1f]',
            size === 'lg' ? 'text-[15px] leading-5' : 'text-[13px] leading-[18px]'
          )}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            'w-full border bg-[#fffdf9] font-body text-[#1c0e04] placeholder:text-[#a89282] focus:outline-none',
            size === 'lg'
              ? 'mt-[11px] h-[53px] rounded-xl border-[#e8d5bb] px-4 text-base focus:border-2 focus:border-brand focus:px-[15px]'
              : 'mt-[10px] h-[43px] rounded-lg border-2 border-[#e8d5bb] px-[14px] text-[13px] focus:border-brand',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 font-body text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
TextField.displayName = 'TextField';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Brand-filled checkbox from the sign-in design. */
export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-[10px] font-body text-base text-[#3d2b1f]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex h-[19px] w-[19px] items-center justify-center rounded-[5px] border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30',
          checked ? 'border-brand bg-brand text-white' : 'border-[#e8d5bb] bg-[#fffdf9]'
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-[29px]">
      <div className="h-px flex-1 bg-[#e8d5bb]" />
      <span className="font-body text-sm text-[#a89282]">or</span>
      <div className="h-px flex-1 bg-[#e8d5bb]" />
    </div>
  );
}

interface SocialButtonsProps {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
  loadingProvider?: 'google' | 'apple' | null;
}

const socialButtonClass =
  'flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e8d5bb] bg-[#fffdf9] font-body text-[15px] font-semibold text-[#3d2b1f] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60';

export function SocialButtons({ onGoogle, onApple, disabled, loadingProvider }: SocialButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-[13px]">
      <button type="button" onClick={onGoogle} disabled={disabled || !!loadingProvider} className={socialButtonClass}>
        {loadingProvider === 'google' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <span>Continue with Google</span>
        )}
      </button>
      <button type="button" onClick={onApple} disabled={disabled || !!loadingProvider} className={socialButtonClass}>
        {loadingProvider === 'apple' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <span>Continue with Apple</span>
        )}
      </button>
    </div>
  );
}

interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  loadingText?: ReactNode;
  disabled?: boolean;
  className?: string;
  /** Adds the small trailing arrow used on most CTAs in the designs. */
  arrow?: boolean;
}

export function SubmitButton({
  children,
  loading = false,
  loadingText,
  disabled = false,
  className,
  arrow = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={cn(
        'flex h-11 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-brand-gradient font-body text-base font-semibold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-75',
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{loading && loadingText ? loadingText : children}</span>
      {arrow && !loading && <ArrowRight className="h-[0.9em] w-[0.9em]" strokeWidth={2.5} aria-hidden="true" />}
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-700">
      {message}
    </div>
  );
}
