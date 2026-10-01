'use client';

import { ReactNode, SVGProps, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ChartLine,
  CircleCheckBig,
  DollarSign,
  Globe,
  Laptop,
  Megaphone,
  Palette,
  Percent,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeLogo } from '@/components/landing/logo';
import { StripeDivider } from '@/components/landing/stripe-divider';
import { OnboardingStepper } from '@/components/onboarding/stepper';
import { OptionCard } from '@/components/onboarding/option-card';

/** Money bag (no lucide equivalent) drawn in lucide's 24px stroke style. */
function MoneyBagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 3h6l-1.5 3h-3z" />
      <path d="M10.5 6C6.5 8 4 11.5 4 15a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6c0-3.5-2.5-7-6.5-9" />
      <path d="M13.5 11.5h-2a1.25 1.25 0 0 0 0 2.5h1a1.25 1.25 0 0 1 0 2.5h-2M12 10.5v1M12 16v1" />
    </svg>
  );
}

const tints = {
  navy: 'bg-[#ecedf3] text-[#1b2b6b]',
  blue: 'bg-[#ecedf3] text-[#2f6fe0]',
  orange: 'bg-[#fbebe2] text-brand',
  green: 'bg-[#e8efe9] text-[#0d5c3a]',
  amber: 'bg-[#fbf3e0] text-brand-light',
};

const iconClass = 'h-4 w-4';

type Choice = { id: string; label: string; icon: ReactNode; tint: string };

const goals: Choice[] = [
  { id: 'tech-job', label: 'Land a tech job', icon: <DollarSign className={iconClass} />, tint: tints.navy },
  { id: 'ai-ml', label: 'Learn AI & ML', icon: <Brain className={iconClass} />, tint: tints.orange },
  { id: 'startup', label: 'Build a startup', icon: <Users className={iconClass} />, tint: tints.green },
  { id: 'side-income', label: 'Earn side income', icon: <Percent className={iconClass} />, tint: tints.amber },
  { id: 'growth', label: 'Personal growth', icon: <Trophy className={iconClass} />, tint: tints.orange },
  { id: 'explore', label: 'Explore interests', icon: <Sparkles className={iconClass} />, tint: tints.navy },
];

const topics: Choice[] = [
  { id: 'product', label: 'Product Management', icon: <Laptop className={iconClass} />, tint: tints.blue },
  { id: 'uiux', label: 'UI/UX Design', icon: <Palette className={iconClass} />, tint: tints.orange },
  { id: 'web', label: 'Web Development', icon: <Globe className={iconClass} />, tint: tints.orange },
  { id: 'data-ai', label: 'Data & AI', icon: <ChartLine className={iconClass} />, tint: tints.amber },
  { id: 'business', label: 'Business & Strategy', icon: <MoneyBagIcon className={iconClass} />, tint: tints.orange },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className={iconClass} />, tint: tints.navy },
];

const levels = [
  { id: 'BEGINNER', label: 'Beginner', description: 'New to this topic — start from the fundamentals' },
  { id: 'INTERMEDIATE', label: 'Intermediate', description: 'I know the basics and want to build real skills' },
  { id: 'ADVANCED', label: 'Advanced', description: "I'm experienced and want to sharpen specific skills" },
];

const stepCopy = {
  1: { title: 'What are your learning goals?', subtitle: 'Select all that apply — Aria will craft your personal path' },
  2: { title: 'Which topics interest you?', subtitle: 'Pick as many as you like — Aria will tailor course suggestions' },
  3: { title: "What's your current level?", subtitle: 'This helps Aria set the right starting pace' },
} as const;

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function labelsFor(choices: Choice[], ids: string[]) {
  return choices
    .filter((c) => ids.includes(c.id))
    .map((c) => c.label)
    .join(', ');
}

export default function OnboardingPage() {
  const { user } = useUser();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [level, setLevel] = useState<string | null>(null);

  const canContinue =
    (step === 1 && selectedGoals.length > 0) ||
    (step === 2 && selectedTopics.length > 0) ||
    (step === 3 && level !== null);

  function handleContinue() {
    if (!canContinue) return;
    // TODO: Persist goals/topics/level to the backend once the learner-preferences endpoint exists.
    setStep((s) => (s < 4 ? ((s + 1) as 2 | 3 | 4) : s));
  }

  const copy = step !== 4 ? stepCopy[step] : null;

  const summary = [
    { label: 'Goal', value: labelsFor(goals, selectedGoals) },
    { label: 'Topics', value: labelsFor(topics, selectedTopics) },
    { label: 'Level', value: levels.find((l) => l.id === level)?.label ?? '' },
    // TODO: Replace with the recommended path returned by the backend.
    { label: 'Recommended path', value: '6 courses · 14 hrs' },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      <div className="flex flex-1 flex-col items-center px-4 pb-12 pt-[71px] sm:px-6">
        <Link href="/" aria-label="Createch Elevate home">
          <BadgeLogo size="sm" />
        </Link>

        <div className="mt-8 w-full max-w-[560px]">
          <OnboardingStepper current={step} />

          <section className="relative mt-[42px] overflow-hidden rounded-2xl border border-[#efe2d0] bg-[#fffdf9] px-5 py-[33px] sm:px-[33px]">
            <span className="absolute left-[15px] top-[15px] h-4 w-[17px] bg-[#fdf6ec]" aria-hidden="true" />

            {copy ? (
              <>
                <span className="relative inline-flex h-[26px] items-center rounded-full border border-[#c9c8ce] bg-[#ebe9ea] px-[13px] text-[11px] font-bold tracking-[0.02em] text-[#1b2b6b]">
                  STEP {step} OF 4
                </span>
                <h1 className="mt-[14px] font-display text-[22px] font-extrabold leading-8 tracking-[-0.01em] text-[#1c0e04] sm:text-[26px]">
                  {copy.title}
                </h1>
                <p className="mt-[6px] text-sm leading-[22px] text-[#7a6655]">{copy.subtitle}</p>

                <div
                  className={cn('mt-[27px] grid gap-[13px]', step < 3 && 'sm:grid-cols-2')}
                  role="group"
                  aria-label={copy.title}
                >
                  {step === 1 &&
                    goals.map((g) => (
                      <OptionCard
                        key={g.id}
                        role="checkbox"
                        label={g.label}
                        icon={g.icon}
                        iconTint={g.tint}
                        selected={selectedGoals.includes(g.id)}
                        onToggle={() => setSelectedGoals((prev) => toggle(prev, g.id))}
                      />
                    ))}
                  {step === 2 &&
                    topics.map((t) => (
                      <OptionCard
                        key={t.id}
                        role="checkbox"
                        label={t.label}
                        icon={t.icon}
                        iconTint={t.tint}
                        selected={selectedTopics.includes(t.id)}
                        onToggle={() => setSelectedTopics((prev) => toggle(prev, t.id))}
                      />
                    ))}
                  {step === 3 &&
                    levels.map((l) => (
                      <OptionCard
                        key={l.id}
                        role="radio"
                        label={l.label}
                        description={l.description}
                        selected={level === l.id}
                        onToggle={() => setLevel(l.id)}
                      />
                    ))}
                </div>

                <div className="mt-[29px] flex items-center justify-between">
                  {step === 1 ? (
                    <Link
                      href="/"
                      className="flex h-[38px] w-20 items-center justify-center gap-1 rounded-lg border border-[#e8d5bb] bg-[#fdf6ec] text-[13px] font-semibold text-[#3d2b1f] transition-colors hover:bg-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                      Back
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                      className="flex h-[38px] w-20 cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#e8d5bb] bg-[#fdf6ec] text-[13px] font-semibold text-[#3d2b1f] transition-colors hover:bg-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="flex h-[38px] w-28 cursor-pointer items-center justify-center gap-1 rounded-lg bg-brand-gradient text-[13px] font-semibold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <span className="mx-auto flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-[#0b4f31] bg-[linear-gradient(135deg,#0d5c3a,#16a34a)] text-white">
                  <CircleCheckBig className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <h1 className="mt-[14px] font-display text-[22px] font-extrabold leading-8 tracking-[-0.01em] text-[#1c0e04] sm:text-[26px]">
                  You are all set{user?.firstName ? `, ${user.firstName}` : ''}!
                </h1>
                <p className="mx-auto mt-[5px] max-w-[380px] text-sm leading-[21px] text-[#7a6655]">
                  Aria has built your personal learning path based on your goals, topics, and level.
                </p>

                <dl className="mt-[35px] rounded-xl border-2 border-[#e8d5bb] bg-[#fffdf9] py-[13px] pl-5 pr-5 text-left sm:pr-[27px]">
                  {summary.map((row, i) => (
                    <div
                      key={row.label}
                      className={cn(
                        'flex min-h-[37px] items-center justify-between gap-4 py-1.5',
                        i > 0 && 'border-t border-[#e8e0d5]'
                      )}
                    >
                      <dt className="shrink-0 text-base text-[#7a6655]">{row.label}</dt>
                      <dd className="text-right text-base font-semibold text-[#1c0e04]">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <Link
                  href="/dashboard"
                  className="mx-auto mt-6 flex h-[46px] w-full max-w-[352px] items-center justify-center gap-1 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
                >
                  Go to my dashboard
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      <StripeDivider />
    </main>
  );
}
