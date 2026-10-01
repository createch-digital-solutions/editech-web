'use client';

import { cn } from '@/lib/utils';

export type SignUpRole = 'LEARNER' | 'INSTRUCTOR';

interface RoleToggleProps {
  value: SignUpRole;
  onChange: (role: SignUpRole) => void;
}

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-[10px]" role="radiogroup" aria-label="I am signing up as a">
      {(
        [
          { value: 'LEARNER', label: 'I am a Learner' },
          { value: 'INSTRUCTOR', label: 'I am an Instructor' },
        ] as const
      ).map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-[54px] cursor-pointer items-center justify-center rounded-xl px-2 font-body text-base transition-colors',
              selected
                ? 'border-2 border-brand bg-[#fdeee6] font-semibold text-brand'
                : 'border border-[#e8d5bb] bg-[#fffdf9] font-medium text-[#7a6655] hover:bg-white'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
