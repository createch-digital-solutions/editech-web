import { cn } from '@/lib/utils';

/** Faint nested-diamond ornament used on the dark brand sections. */
export function DiamondMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn('pointer-events-none absolute text-brand-light opacity-15', className)}
    >
      <path d="M20 1 39 20 20 39 1 20Z" stroke="currentColor" />
      <path d="M20 9 31 20 20 31 9 20Z" stroke="currentColor" />
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
    </svg>
  );
}
