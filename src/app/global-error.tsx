'use client';

import { useEffect } from 'react';
import './globals.css';

/** Last resort when the root layout itself fails; it replaces the whole document, so it brings its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#fdf6ec] px-4 text-center font-sans">
        <h1 className="text-[24px] font-bold text-[#1c0e04]">Something went wrong</h1>
        <p className="mt-3 max-w-[400px] text-[15px] leading-6 text-[#7a6655]">Createch Elevate couldn&apos;t load. Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 h-11 cursor-pointer rounded-lg bg-brand-gradient px-5 text-[15px] font-semibold text-white shadow-md shadow-brand/30 hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
