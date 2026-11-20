'use client';

import { CircleCheck, Clock, Mail, Sparkles } from 'lucide-react';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { ApplicationHeader } from '@/components/instructor/application-header';

const STEPS = [
  { icon: CircleCheck, title: 'Application sent', note: 'Done', tint: 'bg-[#e6f0ea] text-[#0d5c3a]' },
  { icon: Clock, title: 'Our team reviews it', note: 'Usually within 24–48 hours', tint: 'bg-[#fdf5e1] text-[#a86f00]' },
  { icon: Mail, title: 'You get an email', note: 'Once your account has been reviewed', tint: 'bg-[#ecedf3] text-[#1e2a78]' },
  { icon: Sparkles, title: 'Your studio opens', note: 'Create courses, upload videos and get paid', tint: 'bg-[#fbebe2] text-brand' },
];

/**
 * /portal/pending-approval — shown while an instructor's application (sent from /portal/onboarding)
 * waits for an administrator's review (profileStatus PENDING_APPROVAL). Always light, like the rest of
 * the site.
 */
export default function InstructorPendingApprovalPage() {
  const { user } = useCurrentUser();
  const name = user?.firstName || user?.email;

  return (
    <main className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      <ApplicationHeader />
      <div className="flex flex-1 justify-center px-4 pb-12 pt-4 sm:px-6 sm:pt-8">
        <div className="w-full max-w-[600px]">
          <section className="rounded-2xl border border-[#efe2d0] bg-[#fffdf9] p-6 text-center shadow-sm sm:p-10" aria-labelledby="review-title">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf5e1] text-[#d4920a]" aria-hidden="true">
              <Clock className="h-8 w-8" strokeWidth={1.8} />
            </span>
            <h1 id="review-title" className="type-page-title mt-5 text-[#1c0e04]">
              Your application is under review
            </h1>
            <p className="type-body mx-auto mt-2 max-w-[440px] text-[#7a6655]">
              Thanks for applying{name ? `, ${name}` : ''}! Our team checks every instructor before their courses go live, to keep Createch Elevate&apos;s quality high.
            </p>
            <span className="mt-4 inline-flex rounded-full border border-[#d4920a]/25 bg-[#fdf5e1] px-3 py-1 font-body text-[13px] font-bold text-[#a86f00]">
              Waiting for review
            </span>

            <ol className="mt-8 space-y-4 text-left">
              {STEPS.map((s) => (
                <li key={s.title} className="flex items-center gap-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.tint}`} aria-hidden="true">
                    <s.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span>
                    <span className="type-card-title block text-[#1c0e04]">{s.title}</span>
                    <span className="type-small block text-[#7a6655]">{s.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
