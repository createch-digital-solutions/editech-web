'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

/**
 * Last resort for very short laptop screens: shrinks its content (CSS zoom) exactly as much as needed to
 * fit the height its parent gives it, so the auth pages never scroll. On most screens it does nothing.
 * Phones keep full size (their text boxes must stay at 16px).
 */
export function FitHeight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const desktop = window.matchMedia('(min-width: 1024px)');

    const fit = () => {
      if (!desktop.matches) {
        el.style.zoom = '';
        return;
      }
      const current = Number(getComputedStyle(el).zoom) || 1;
      const natural = el.getBoundingClientRect().height / current;
      const style = getComputedStyle(box);
      const room = box.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const zoom = Math.min(1, Math.floor((room / natural) * 1000) / 1000);
      if (natural > 0 && Math.abs(zoom - current) > 0.003) el.style.zoom = zoom === 1 ? '' : String(zoom);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(el);
    desktop.addEventListener('change', fit);
    return () => {
      observer.disconnect();
      desktop.removeEventListener('change', fit);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
