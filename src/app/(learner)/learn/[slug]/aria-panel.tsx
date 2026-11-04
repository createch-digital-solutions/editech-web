'use client';

import { FormEvent, Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/nextjs';
import { SendHorizontal, WandSparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PERSONAS = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'formal', label: 'Formal' },
  { id: 'socratic', label: 'Socratic' },
] as const;

/**
 * Where the learner is, for Aria: the course and lesson open in the player and their enrolment progress.
 * This is what the AI module should receive with every message (proposed: POST /ai/coach/messages
 * { message, persona, context }).
 */
export interface CoachContext {
  courseId: string;
  courseTitle: string;
  sectionTitle: string;
  lessonId: string;
  lessonTitle: string;
  /** 1-based place of the lesson in the course. */
  lessonNumber: number;
  totalLessons: number;
  /** Enrolment progress, 0–100; null when not enrolled. */
  progress: number | null;
}

/** Aria's text with **bold** spans and line breaks kept. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-semibold text-[#1c0e04]">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            )
          )}
        </Fragment>
      ))}
    </>
  );
}

function AriaAvatar({ className }: { className?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white', className)} aria-hidden="true">
      <WandSparkles className="h-[45%] w-[45%]" strokeWidth={1.8} />
    </span>
  );
}

/** What Aria says first: who she is, what she can see of the learner's progress, and that she is not live yet. */
function greetingFor(firstName: string | null | undefined, c: CoachContext) {
  const hi = `Hi${firstName ? ` ${firstName}` : ''}! 👋 I'm Aria, your AI learning coach.`;
  const where = `\n\nI can see you're on **${c.lessonTitle}**: lesson ${c.lessonNumber} of ${c.totalLessons}${
    c.progress !== null ? `, and you're **${c.progress}%** through the course` : ', while previewing the course'
  }.`;
  return `${hi}${where}\n\nI'm **not switched on yet**. Once I am, you'll be able to ask me about this lesson in the style you pick above.`;
}

/**
 * Aria, popping up over the player: she sees the lesson being watched and the learner's progress. The
 * AI module has no chat endpoint yet, so she says so and the message box stays disabled rather than
 * answering with made-up replies.
 * TODO: Send messages, the persona and `context` to the AI module once it has a chat endpoint.
 */
export function AriaPanel({ open, onClose, context }: { open: boolean; onClose: () => void; context: CoachContext }) {
  const { user } = useUser();
  const [persona, setPersona] = useState<(typeof PERSONAS)[number]['id']>('friendly');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  // Rendered into <body>, outside the player's zoomed frame, so it sits at true size over the video.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-end font-body sm:inset-auto sm:bottom-6 sm:right-6">
      <div className="absolute inset-0 bg-black/50 sm:hidden" onClick={onClose} aria-hidden="true" />
      <section
        role="dialog"
        aria-label="Ask Aria"
        className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#fffdf9] shadow-2xl sm:h-[min(600px,calc(100vh-7rem))] sm:w-[400px] sm:rounded-3xl"
      >
        <header className="flex items-center gap-3 bg-brand-night px-5 py-4 text-white">
          <AriaAvatar className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[17px] font-bold leading-6">Aria</h2>
            <p className="truncate text-[13px] text-white/60">AI Learning Coach · Coming soon</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Aria" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex gap-2 border-b border-[#efe2d0] px-5 py-3" role="radiogroup" aria-label="Coaching style">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={persona === p.id}
              onClick={() => setPersona(p.id)}
              className={cn(
                'h-8 cursor-pointer rounded-full border px-3.5 text-[13px] font-medium transition-colors',
                persona === p.id ? 'border-brand bg-brand text-white' : 'border-[#e3d6c4] bg-white text-[#3d2b1f] hover:border-brand/50 hover:text-brand'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8efe4] px-5 py-5" aria-live="polite">
          <div className="rounded-2xl border border-[#f5d3bd] bg-[#fdeee4] px-4 py-3">
            <p className="truncate text-[12px] text-[#7a6655]">{context.courseTitle}</p>
            <p className="mt-0.5 truncate text-[15px] font-bold text-brand">{context.lessonTitle}</p>
            <p className="mt-0.5 text-[12px] text-[#7a6655]">
              {context.sectionTitle} · Lesson {context.lessonNumber} of {context.totalLessons}
            </p>
            {context.progress !== null ? (
              <div className="mt-2.5 h-[5px] rounded-full bg-[#f3dccb]" role="progressbar" aria-valuenow={context.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#c1440e,#d4920a)]" style={{ width: `${context.progress}%` }} />
              </div>
            ) : (
              <p className="mt-1.5 text-[12px] font-medium text-brand">Previewing — not enrolled yet</p>
            )}
          </div>

          <div className="flex items-start gap-3">
            <AriaAvatar className="h-8 w-8" />
            <p className="rounded-2xl rounded-tl-md border border-[#efe2d0] bg-[#fffdf9] px-4 py-3 text-[14px] leading-[22px] text-[#3d2b1f]">
              <span className="sr-only">Aria: </span>
              <RichText text={greetingFor(user?.firstName, context)} />
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2.5 border-t border-[#efe2d0] bg-[#fdf6ec] px-4 py-3">
          <label className="sr-only" htmlFor="ask-aria">
            Ask Aria
          </label>
          <input
            id="ask-aria"
            disabled
            placeholder="Aria isn't available yet"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 cursor-not-allowed rounded-xl border border-[#efe2d0] bg-white px-4 text-[14px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-brand-gradient text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendHorizontal className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>,
    document.body
  );
}
