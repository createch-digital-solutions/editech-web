import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DiamondMotif } from './diamond-motif';

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-brand-night">
      <DiamondMotif className="left-[5px] top-[8px] h-10 w-10" />
      <div className="relative mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:min-h-[207px] lg:px-[66px] lg:py-0">
        <div>
          <h2 className="font-display text-[28px] font-extrabold leading-10 tracking-[-0.01em] text-white sm:text-[36px]">
            Ready to build your future?
          </h2>
          <p className="mt-[13px] font-body text-sm text-[#e8a33d]">
            Join 50,000 learners growing with Createch Elevate.
          </p>
        </div>
        <Link
          href="/sign-up"
          className="inline-flex h-11 w-[211px] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md bg-brand-gradient font-body text-[13px] font-semibold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
        >
          Create Free Account
          <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
