import Link from 'next/link';

/** A centred "nothing here yet" message for a page whose content does not exist, with a way onward. */
export function EmptyPage({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action: { href: string; label: string } }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center font-body">
      <span className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[#f5c9a8] bg-[#fdeee4] text-brand" aria-hidden="true">
        {icon}
      </span>
      <h1 className="mt-6 font-display text-[26px] font-extrabold leading-[34px] text-[#1c0e04]">{title}</h1>
      <p className="mt-2 max-w-md text-base leading-7 text-[#7a6655]">{message}</p>
      <Link
        href={action.href}
        className="mt-6 flex h-11 items-center rounded-xl bg-brand-gradient px-6 text-[15px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
      >
        {action.label}
      </Link>
    </main>
  );
}
