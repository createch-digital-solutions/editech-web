import { ReactNode } from 'react';
import { CircleCheckBig } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  selected: boolean;
  onToggle: () => void;
  /** Rendered inside the 36px tinted tile on the left; omit for text-only options. */
  icon?: ReactNode;
  iconTint?: string;
  label: string;
  description?: string;
  /** checkbox for multi-select steps, radio for single choice. */
  role: 'checkbox' | 'radio';
}

export function OptionCard({ selected, onToggle, icon, iconTint, label, description, role }: OptionCardProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'flex min-h-[67px] w-full cursor-pointer items-center rounded-xl border-2 px-[16px] py-2 text-left font-body transition-colors',
        selected ? 'border-brand bg-[#fdf3ee]' : 'border-[#e8d5bb] bg-[#fffdf9] hover:bg-white'
      )}
    >
      {icon && (
        <span
          className={cn('mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconTint)}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-[13px] leading-5',
            selected && !description ? 'font-bold text-brand' : 'font-medium text-[#3d2b1f]'
          )}
        >
          {label}
        </span>
        {description && (
          <span className="mt-[6px] block text-sm leading-[22px] text-[#7a6655]">{description}</span>
        )}
      </span>
      {selected && (
        <CircleCheckBig className="ml-2 h-4 w-4 shrink-0 text-brand" strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}
