import type { ReactNode } from 'react';
import { Logo } from '@/components/landing/logo';

/** The card the not-found and error pages share: logo, a big code, heading, message and actions. */
export function ErrorScreen({ code, title, message, children }: { code?: string; title: string; message: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#fdf6ec] px-4 py-12 font-body">
      <Logo size="app" />
      <div className="mt-8 w-full max-w-[460px] rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] px-6 py-10 text-center shadow-sm sm:px-10">
        {code && <p className="font-display text-[64px] font-extrabold leading-none text-brand">{code}</p>}
        <h1 className="type-page-title mt-4 text-[#1c0e04]">{title}</h1>
        <p className="mt-3 text-[15px] leading-6 text-[#7a6655]">{message}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </main>
  );
}

export const primaryAction =
  'inline-flex h-11 cursor-pointer items-center rounded-lg bg-brand-gradient px-5 text-[15px] font-semibold text-white shadow-md shadow-brand/30 hover:opacity-90';
export const secondaryAction =
  'inline-flex h-11 cursor-pointer items-center rounded-lg border border-[#e8d5bb] bg-white px-5 text-[15px] font-semibold text-[#3d2b1f] hover:bg-[#fdf6ec]';
