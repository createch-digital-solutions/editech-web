import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="bg-gradient-to-br from-[#241a12] via-[#1e2740] to-[#1a2a52] py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to build your future?
          </h2>
          <p className="mt-2 text-gray-300">Join 50,000 learners growing with Createch Elevate.</p>
        </div>
        <Link
          href="/sign-up"
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Create Free Account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
