import Image from 'next/image';
import { cn } from '@/lib/utils';
import { initialsOf } from '@/lib/learner-data';

/** Someone else's round photo (an instructor, a reviewer), or their initials when there is none. */
export function PersonAvatar({ name, src, size, className }: { name: string; src?: string; size: number; className?: string }) {
  if (src) return <Image src={src} alt="" width={size} height={size} unoptimized className={cn('shrink-0 rounded-full object-cover', className)} style={{ width: size, height: size }} />;
  return (
    <span
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-[#fbece4] font-display font-bold text-brand', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initialsOf(name)}
    </span>
  );
}
