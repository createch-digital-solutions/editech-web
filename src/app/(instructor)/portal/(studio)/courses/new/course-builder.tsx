'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Check, CircleCheck, Send, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormError } from '@/components/auth/form-controls';
import { card, primaryButton } from '@/components/instructor/studio-parts';
import { apiClient } from '@/lib/api-client';
import { builderErrorText, courseBuilderApi } from '@/lib/course-builder-api';
import { CurriculumStep } from './curriculum-step';
import { DetailsStep } from './details-step';
import { CATEGORIES, clearDraft, emptyDraft, formatLength, lessonCount, LEVELS, loadDraft, saveDraft, secondaryButton, totalSeconds, type Draft } from './draft';

type Step = 'details' | 'curriculum' | 'review';
const STEPS: { id: Step; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'review', label: 'Review & submit' },
];

/** Waits for Clerk so the draft saved in this browser can be read before the builder first renders. */
export function CourseBuilder() {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24" role="status">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#f3e6d6] border-t-brand" aria-hidden="true" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }
  return <Builder key={user.id} userId={user.id} />;
}

function Builder({ userId }: { userId: string }) {
  const [draft, setDraft] = useState<Draft>(() => loadDraft(userId));
  const [step, setStep] = useState<Step>(() => (draft.courseId ? (lessonCount(draft.sections) ? 'review' : 'curriculum') : 'details'));

  useEffect(() => {
    saveDraft(userId, draft);
  }, [userId, draft]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  function startOver() {
    clearDraft(userId);
    setDraft(emptyDraft());
    setStep('details');
  }

  if (draft.submitted) return <Submitted title={draft.details.title} onAnother={startOver} />;

  const reachable = (s: Step) => s === 'details' || (!!draft.courseId && (s === 'curriculum' || lessonCount(draft.sections) > 0));

  return (
    <main className="mx-auto w-full max-w-[860px] flex-1 px-4 pb-14 pt-7 sm:px-6 lg:pt-9">
      <Link href="/portal" className="inline-flex items-center gap-1.5 font-body text-[14px] font-semibold text-[#7a6655] hover:text-brand">
        <ArrowLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        Dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="type-page-title text-[#1c0e04]">{draft.details.title.trim() || 'Create a course'}</h1>
          <p className="mt-1 font-body text-[15px] text-[#7a6655]">{draft.courseId ? 'Draft · saved as you go' : 'Start with the basics. You can change everything later.'}</p>
        </div>
        {draft.courseId && <DeleteDraft courseId={draft.courseId} onDeleted={startOver} />}
      </div>

      <ol className="mt-6 flex gap-2" aria-label="Steps">
        {STEPS.map((s, i) => {
          const current = s.id === step;
          const done = STEPS.findIndex((x) => x.id === step) > i;
          return (
            <li key={s.id} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!reachable(s.id)}
                onClick={() => setStep(s.id)}
                aria-current={current ? 'step' : undefined}
                className="group w-full cursor-pointer text-left disabled:cursor-not-allowed"
              >
                <span className={cn('block h-1.5 rounded-full', current || done ? 'bg-brand-gradient' : 'bg-[#efe2d0]')} />
                <span className={cn('mt-2 flex items-center gap-1.5 truncate font-body text-[13px] font-semibold sm:text-[14px]', current ? 'text-[#1c0e04]' : done ? 'text-[#7a6655]' : 'text-[#a89282]')}>
                  {done && <Check className="h-3.5 w-3.5 shrink-0 text-[#0d5c3a]" strokeWidth={3} aria-hidden="true" />}
                  <span className="hidden sm:inline">{i + 1}. </span>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6">
        {step === 'details' && (
          <DetailsStep
            draft={draft}
            onSaved={(saved) => {
              setDraft((d) => ({ ...d, ...saved }));
              setStep('curriculum');
            }}
          />
        )}
        {step === 'curriculum' && draft.courseId && (
          <CurriculumStep
            courseId={draft.courseId}
            sections={draft.sections}
            onChange={(update) => setDraft((d) => ({ ...d, sections: update(d.sections) }))}
            onBack={() => setStep('details')}
            onNext={() => setStep('review')}
          />
        )}
        {step === 'review' && draft.courseId && (
          <ReviewStep draft={draft} onEdit={setStep} onSubmitted={() => setDraft((d) => ({ ...d, submitted: true }))} />
        )}
      </div>
    </main>
  );
}

/**
 * Step 3: a summary and the API's submit checks (a cover image and at least one lesson), then
 * POST /instructor/courses/:id/submit sends it to the admin team.
 */
function ReviewStep({ draft, onEdit, onSubmitted }: { draft: Draft; onEdit: (step: Step) => void; onSubmitted: () => void }) {
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const { details, sections } = draft;
  const lessons = lessonCount(sections);
  const missingVideos = sections.flatMap((s) => s.lessons).filter((l) => l.type === 'VIDEO' && l.video === 'none').length;
  const previews = sections.flatMap((s) => s.lessons).filter((l) => l.isPreview).length;

  const checks = [
    { ok: !!details.thumbnailUrl.trim(), text: 'Cover image added', fix: 'details' as Step, required: true },
    { ok: lessons > 0, text: 'At least one lesson', fix: 'curriculum' as Step, required: true },
    { ok: missingVideos === 0, text: missingVideos ? `${missingVideos} video ${missingVideos === 1 ? 'lesson has' : 'lessons have'} no video yet` : 'Every video lesson has a video', fix: 'curriculum' as Step, required: false },
    { ok: previews > 0, text: previews ? `${previews} free preview ${previews === 1 ? 'lesson' : 'lessons'}` : 'No free preview lesson (recommended)', fix: 'curriculum' as Step, required: false },
  ];
  const ready = checks.every((c) => c.ok || !c.required);

  async function submit() {
    setSending(true);
    setProblem(null);
    try {
      await courseBuilderApi.submitCourse(draft.courseId!);
      onSubmitted();
    } catch (err) {
      setProblem(builderErrorText(err));
      setSending(false);
    }
  }

  const level = LEVELS.find((l) => l.value === details.level)?.label;
  const facts = [
    details.free ? 'Free' : `₦${Number(details.price).toLocaleString('en-NG')}`,
    CATEGORIES.includes(details.category) ? details.category : null,
    level,
    `${sections.length} ${sections.length === 1 ? 'section' : 'sections'}`,
    `${lessons} ${lessons === 1 ? 'lesson' : 'lessons'}`,
    formatLength(totalSeconds(sections)) || null,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <section className={cn(card, 'overflow-hidden')} aria-labelledby="review-title">
        <div className="grid gap-0 sm:grid-cols-[240px_minmax(0,1fr)]">
          <div className="relative aspect-video bg-brand-night sm:aspect-auto">
            {details.thumbnailUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element -- any host the instructor links to
              <img src={details.thumbnailUrl.trim()} alt="Course cover" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-body text-[13px] text-white/60">No cover image</span>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <h2 id="review-title" className="type-section-title text-[#1c0e04]">
              {details.title}
            </h2>
            {details.description && <p className="mt-2 line-clamp-3 font-body text-[14px] leading-6 text-[#7a6655]">{details.description}</p>}
            <p className="mt-3 font-body text-[13px] font-semibold text-[#3d2b1f]">{facts.join(' · ')}</p>
            <button type="button" onClick={() => onEdit('details')} className="mt-3 cursor-pointer font-body text-[14px] font-semibold text-brand hover:text-brand-light">
              Edit details
            </button>
          </div>
        </div>
      </section>

      <section className={cn(card, 'p-5 sm:p-6')} aria-labelledby="checks-title">
        <h2 id="checks-title" className="type-section-title text-[#1c0e04]">
          Before you submit
        </h2>
        <ul className="mt-4 space-y-3">
          {checks.map((c) => (
            <li key={c.text} className="flex items-center gap-3 font-body text-[15px]">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  c.ok ? 'bg-[#e6f0ea] text-[#0d5c3a]' : c.required ? 'bg-[#fdecea] text-[#b42318]' : 'bg-[#fdf5e1] text-[#a86f00]'
                )}
                aria-hidden="true"
              >
                {c.ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className={cn('flex-1', c.ok ? 'text-[#3d2b1f]' : 'text-[#1c0e04]')}>
                {c.text}
                {!c.ok && c.required && <span className="sr-only"> (required)</span>}
              </span>
              {!c.ok && (
                <button type="button" onClick={() => onEdit(c.fix)} className="cursor-pointer font-body text-[14px] font-semibold text-brand hover:text-brand-light">
                  Fix
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-5 font-body text-[14px] text-[#7a6655]">Our team reviews new courses within 48 hours.</p>

        {problem && (
          <div className="mt-4">
            <FormError message={problem} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => onEdit('curriculum')} className={secondaryButton}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Curriculum
          </button>
          <button type="button" onClick={submit} disabled={!ready || sending} className={cn(primaryButton, 'h-11 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60')}>
            <Send className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            {sending ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </section>
    </div>
  );
}

/** Deletes the draft course (DELETE /instructor/courses/:id) after a second click to confirm. */
function DeleteDraft({ courseId, onDeleted }: { courseId: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function remove() {
    setDeleting(true);
    try {
      await apiClient.delete(`/instructor/courses/${courseId}`);
      onDeleted();
    } catch (err) {
      setProblem(builderErrorText(err));
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="font-body text-[14px] text-[#3d2b1f]">Delete this draft?</span>
          <button type="button" onClick={() => setConfirming(false)} className={cn(secondaryButton, 'h-9 px-3')}>
            Keep
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="inline-flex h-9 cursor-pointer items-center rounded-xl bg-[#b42318] px-3 font-body text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="inline-flex cursor-pointer items-center gap-1.5 font-body text-[14px] font-semibold text-[#7a6655] hover:text-[#b42318]">
          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Delete draft
        </button>
      )}
      {problem && <p className="font-body text-[13px] text-red-600">{problem}</p>}
    </div>
  );
}

function Submitted({ title, onAnother }: { title: string; onAnother: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className={cn(card, 'w-full max-w-[480px] px-6 py-10 text-center sm:px-10')}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f0ea] text-[#0d5c3a]" aria-hidden="true">
          <CircleCheck className="h-7 w-7" strokeWidth={2} />
        </span>
        <h1 className="type-page-title mt-5 text-[#1c0e04]">Course submitted</h1>
        <p className="mt-2 font-body text-[15px] leading-6 text-[#7a6655]">
          <strong className="text-[#1c0e04]">{title}</strong> is with our review team. Expect a decision within 48 hours.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/portal" className={cn(primaryButton, 'h-11')}>
            Back to dashboard
          </Link>
          <button type="button" onClick={onAnother} className={cn(secondaryButton, 'h-11')}>
            Create another course
          </button>
        </div>
      </div>
    </main>
  );
}
