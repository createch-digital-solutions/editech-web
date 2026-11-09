'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Phones and tablets: the course's price and enrol button in a bar along the bottom of the screen, once the
 * purchase card (the element with id `watch`) has scrolled up out of view, the way desktop keeps its card
 * beside the page. It slides away again when the card comes back.
 */
export function EnrollBar({ watch, title, price, oldPrice, href, cta }: { watch: string; title: string; price: string; oldPrice?: string; href: string; cta: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const card = document.getElementById(watch);
    if (!card) return;
    // Shown only once the card is above the screen, not while the page is still loading below it.
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(card);
    return () => observer.disconnect();
  }, [watch]);

  return (
    <>
      {/* Room at the end of the page, so the bar never covers the last lines. */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-[#ece1d3] bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_-12px_rgba(28,14,4,0.25)] backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden',
          shown ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        )}
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
        aria-hidden={!shown}
      >
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-[13px] text-[#7a6655]">{title}</p>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-[20px] font-extrabold leading-7 text-[#1c0e04]">{price}</span>
              {oldPrice && <span className="text-[13px] text-[#9a8574] line-through">{oldPrice}</span>}
            </p>
          </div>
          <Link
            href={href}
            tabIndex={shown ? undefined : -1}
            className="flex h-11 shrink-0 items-center justify-center rounded-lg bg-brand-gradient px-5 font-body text-[15px] font-bold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90"
          >
            {cta}
          </Link>
        </div>
      </div>
    </>
  );
}
