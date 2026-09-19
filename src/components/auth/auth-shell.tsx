import { ReactNode } from 'react';
import Link from 'next/link';
import { trianglePatternBackground } from '@/lib/patterns';

interface AuthShellProps {
  leftContent: ReactNode;
  children: ReactNode;
}

export function AuthShell({ leftContent, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#241a12] via-[#1e2740] to-[#1a2a52] px-8 py-10 lg:w-1/2 lg:px-16 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: trianglePatternBackground, backgroundSize: '60px 52px' }}
          aria-hidden="true"
        />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
              cE
            </span>
            <span className="text-lg font-bold text-white">
              Createch<span className="text-orange-500">Elevate</span>
            </span>
          </Link>
        </div>

        <div className="relative py-12 lg:py-0">{leftContent}</div>

        <p className="relative text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Createch Elevate
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#fffaf3] px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
