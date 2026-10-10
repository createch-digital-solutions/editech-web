import { cn } from '@/lib/utils';
import { DiamondMotif } from '@/components/landing/diamond-motif';

const tones = {
  brand: 'border-[#f5c9a8] bg-[#fdeee4] text-brand',
  success: 'border-[#bdeccc] bg-[#ecfbf1] text-[#0d5c3a]',
  danger: 'border-[#f9c9c9] bg-[#fdeeee] text-[#c62828]',
};

/** Full-screen, centred status page (payment processing / success / failure): icon, title and message. */
export function StatusScreen({
  icon,
  tone,
  title,
  children,
  motif,
}: {
  icon: React.ReactNode;
  tone: keyof typeof tones;
  title: React.ReactNode;
  children: React.ReactNode;
  motif?: boolean;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fdf6ec] px-4 py-16 font-body">
      {motif && <DiamondMotif className="left-[calc(50%-305px)] top-[calc(50%-283px)] h-[46px] w-[46px] text-[#d4920a] opacity-20" />}
      <div className="flex w-full max-w-[500px] flex-col items-center text-center">
        <span className={cn('flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px]', tones[tone])}>{icon}</span>
        <h1 className="mt-[24px] font-display text-[26px] font-extrabold leading-[34px] text-[#1c0e04]">{title}</h1>
        {children}
      </div>
    </main>
  );
}
