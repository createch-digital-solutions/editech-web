'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Award, CircleCheck, Download, ShieldCheck } from 'lucide-react';
import { DiamondMotif } from '@/components/landing/diamond-motif';
import { SAMPLE_CERTIFICATE, SAMPLE_LEARNER } from '@/lib/learner-data';

type Certificate = typeof SAMPLE_CERTIFICATE;

const secondaryButton =
  'flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[18px] font-body text-[17px] font-semibold text-[#3d2b1f] transition-colors hover:bg-white';

/** The certificate card, its actions, and the learner's results for the course. */
export function CertificateView({ certificate: c }: { certificate: Certificate }) {
  const { user } = useUser();
  const name = user?.fullName || `${SAMPLE_LEARNER.firstName} ${SAMPLE_LEARNER.lastName}`;

  function shareToLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  }

  const performance = [
    ['Completion time', c.completionTime],
    ['Quiz average', c.quizAverage],
    ['Lessons watched', c.lessonsWatched],
    ['XP earned', c.xpEarned],
  ];

  return (
    <main className="mx-auto w-full max-w-[1231px] flex-1 px-4 pb-[60px] pt-10 text-center sm:px-6 lg:px-[75px] lg:pt-[73px]">
      <span className="text-[56px] leading-[60px]" aria-hidden="true">
        🎓
      </span>
      <h1 className="mt-[28px] font-display text-[34px] font-extrabold leading-[46px] text-[#1c0e04] sm:text-[41px]">Certificate Earned!</h1>
      <p className="mt-[7px] text-[18px] text-[#7a6655] sm:text-[21px]">Congratulations — you&apos;ve successfully completed the course</p>

      <section className="mt-[40px] overflow-hidden rounded-3xl border-2 border-[#efe2d0] bg-[#fdf6ec] text-left shadow-lg" aria-label="Certificate">
        <div className="relative overflow-hidden bg-[linear-gradient(160deg,#1a0e05_0%,#1b2b6b_45%,#1b2b6b_70%,#0d5c3a_115%)] px-6 pb-[72px] pt-[76px] sm:px-[86px]">
          <DiamondMotif className="left-[8px] top-[6px] h-[64px] w-[64px]" />
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="font-body text-[15px] font-bold uppercase tracking-[0.2em] text-[#e8a33d]">Certificate of Completion</p>
              <p className="mt-[20px] text-[19px] text-[#8a7462]">This certifies that</p>
              <p className="mt-[20px] font-display text-[36px] font-extrabold leading-[52px] text-white sm:text-[45px]">{name}</p>
              <p className="mt-[20px] text-[19px] text-[#5d6280]">has successfully completed</p>
              <p className="mt-[20px] font-display text-[26px] font-bold leading-9 text-white sm:text-[31px]">{c.courseTitle}</p>
              <p className="mt-[30px] flex flex-wrap items-center gap-x-[36px] gap-y-2 text-[18px] text-[#3a3f5a]">
                <span>Issued: {c.issued}</span>
                <span>ID: {c.id}</span>
                <span className="flex items-center gap-2 text-[#5fd3b5]">
                  <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                  Blockchain Verified
                </span>
              </p>
            </div>
            <span className="flex h-[134px] w-[134px] shrink-0 items-center justify-center rounded-full bg-brand-gradient shadow-xl" aria-hidden="true">
              <Award className="h-[54px] w-[54px] text-white" strokeWidth={2} />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-[21px] sm:px-[37px] md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-[10px] text-[19px] text-[#0d5c3a]">
            <CircleCheck className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            Verified Credential
          </p>
          <div className="flex flex-wrap gap-[25px]">
            <button type="button" onClick={() => window.print()} className={secondaryButton}>
              <Download className="h-[18px] w-[18px] text-[#1e6fd9]" strokeWidth={2.2} aria-hidden="true" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={shareToLinkedIn}
              className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-[22px] font-body text-[17px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
            >
              Share to LinkedIn
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
            <Link href="/profile" className={secondaryButton}>
              Add to Portfolio
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-[34px] grid gap-[27px] text-left md:grid-cols-2">
        <section className="rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[30px] pb-[30px] pt-[34px]" aria-labelledby="performance-title">
          <h2 id="performance-title" className="font-body text-[20px] font-bold leading-7 text-[#1c0e04]">
            Your Performance
          </h2>
          <dl className="mt-[17px] space-y-[13px] text-[19px]">
            {performance.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-[#7a6655]">{label}</dt>
                <dd className="font-bold text-[#1c0e04]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[30px] pb-[30px] pt-[34px]" aria-labelledby="unlocked-title">
          <h2 id="unlocked-title" className="font-body text-[20px] font-bold leading-7 text-[#1c0e04]">
            Achievements Unlocked <span aria-hidden="true">🏅</span>
          </h2>
          <ul className="mt-[18px] flex flex-wrap gap-[15px]">
            {c.achievements.map((a) => (
              <li key={a.name} className="flex w-[71px] flex-col items-center">
                <span className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-[#f3dd9c] bg-[#fcf6e6] text-[32px]" aria-hidden="true">
                  {a.emoji}
                </span>
                <span className="mt-[9px] text-[15px] text-[#7a6655]">{a.name}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/achievements"
            className="mt-[22px] flex h-11 items-center justify-center rounded-xl bg-brand-gradient font-body text-[17px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
          >
            View All Achievements
          </Link>
        </section>
      </div>
    </main>
  );
}
