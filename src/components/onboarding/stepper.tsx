import { Fragment } from 'react';
import { CircleCheckBig } from 'lucide-react';
import { cn } from '@/lib/utils';

export const onboardingSteps = ['Goals', 'Topics', 'Level', 'Done'] as const;

interface StepperProps {
  /** 1-based index of the step being shown. */
  current: number;
}

/**
 * Four-step progress bar. Steps before `current` show a check, `current` and any
 * reached step show its number on the gradient. On the final "Done" step the design
 * keeps step 3 as a number, so only steps 1–2 are ever drawn as checks.
 */
export function OnboardingStepper({ current }: StepperProps) {
  return (
    <ol className="flex w-full items-start pb-[22px]" aria-label="Onboarding progress">
      {onboardingSteps.map((label, i) => {
        const step = i + 1;
        const reached = step <= current;
        const checked = step < current && step <= 2;

        return (
          <Fragment key={label}>
            {i > 0 && (
              <li
                aria-hidden="true"
                className={cn(
                  'mt-[15px] h-[2px] flex-1',
                  reached ? 'bg-[linear-gradient(90deg,#c1440e,#d4920a)]' : 'bg-[#e8d5bb]'
                )}
              />
            )}
            <li
              className="relative flex w-8 shrink-0 flex-col items-center"
              aria-current={step === current ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 font-body text-xs font-bold',
                  reached
                    ? 'border-[#b8410d] bg-brand-gradient text-white'
                    : 'border-[#e8d5bb] bg-[#fffdf9] text-[#a89282]'
                )}
              >
                {checked ? <CircleCheckBig className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> : step}
              </span>
              <span
                className={cn(
                  'absolute top-[38px] whitespace-nowrap font-body text-[11px] leading-4',
                  reached ? 'font-bold text-brand' : 'font-medium text-[#a89282]'
                )}
              >
                {label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
