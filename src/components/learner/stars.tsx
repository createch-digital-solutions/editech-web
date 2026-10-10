import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Five gold stars, filled up to the rating (rounded down), e.g. ★★★★☆ for 4.7. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className="flex gap-[3px]" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          strokeWidth={2}
          className={cn('h-3.5 w-3.5 text-[#d4920a]', n <= Math.floor(rating) && 'fill-[#d4920a]', className)}
        />
      ))}
    </span>
  );
}
