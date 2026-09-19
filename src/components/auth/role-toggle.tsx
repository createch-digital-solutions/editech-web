'use client';

import { cn } from '@/lib/utils';

export type SignUpRole = 'learner' | 'instructor';

interface RoleToggleProps {
  value: SignUpRole;
  onChange: (role: SignUpRole) => void;
}

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="I am signing up as a">
      {(
        [
          { value: 'learner', label: 'I am a Learner' },
          { value: 'instructor', label: 'I am an Instructor' },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'cursor-pointer rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors',
            value === option.value
              ? 'border-orange-500 bg-orange-50 text-orange-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
