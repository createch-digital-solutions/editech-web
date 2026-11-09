'use client';

import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { SendHorizontal, Square, WandSparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiClientError } from '@/lib/api-client';
import { lessonConversation, streamTutorReply } from '@/lib/ai-tutor';
import type { TutorMessage, TutorPersona } from '@/types/ai';

const PERSONAS: { id: TutorPersona; label: string }[] = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'formal', label: 'Formal' },
  { id: 'socratic', label: 'Socratic' },
];

/** Where the learner is, for Aria: the course and lesson open in the player and their enrolment progress. */
export interface CoachContext {
  courseId: string;
  courseSlug: string;
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

/** Aria's text: **bold**, `code`, "* " / "- " list lines as bullets, and line breaks kept. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((raw, i) => {
        const bullet = /^\s*[*-]\s+/.test(raw);
        const line = bullet ? raw.replace(/^\s*[*-]\s+/, '') : raw;
        return (
          <Fragment key={i}>
            {i > 0 && <br />}
            {bullet && <span aria-hidden="true">• </span>}
            {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="font-semibold text-[#1c0e04]">
                  {part.slice(2, -2)}
                </strong>
              ) : part.startsWith('`') && part.endsWith('`') ? (
                <code key={j} className="rounded bg-[#f6efe6] px-1 py-px font-mono text-[13px] text-[#1c0e04]">
                  {part.slice(1, -1)}
                </code>
              ) : (
                <Fragment key={j}>{part}</Fragment>
              )
            )}
          </Fragment>
        );
      })}
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

/** What Aria says first: who she is and what she can see of the learner's progress. */
function greetingFor(firstName: string | null | undefined, c: CoachContext) {
  const hi = `Hi${firstName ? ` ${firstName}` : ''}! 👋 I'm Aria, your AI learning coach.`;
  if (c.progress === null) return `${hi}\n\nI can see you're previewing **${c.lessonTitle}**. Enrol in the course and I can help you with every lesson in it.`;
  return `${hi}\n\nI can see you're on **${c.lessonTitle}**: lesson ${c.lessonNumber} of ${c.totalLessons}, and you're **${c.progress}%** through the course. Ask me anything about it.`;
}

/** A plain reason when Aria cannot answer. */
function problemText(err: unknown) {
  if (err instanceof ApiClientError) {
    if (err.status === 403) return 'Aria is only available in courses you are enrolled in.';
    if (err.status === 401) return 'Your session has ended. Please sign in again to keep chatting.';
  }
  return 'Aria could not answer just now. Please try again.';
}

/**
 * Aria, popping up over the player (POST /ai/tutor/chat). She is told the course and lesson open in the
 * player, so she knows exactly where the learner is, and answers in the coaching style picked above; her
 * reply appears as it is written. The chat for each lesson is saved by the AI module and picked up again
 * (GET /ai/conversations). Learners who are not enrolled are asked to enrol first, as the AI module requires.
 */
export function AriaPanel({ open, onClose, context }: { open: boolean; onClose: () => void; context: CoachContext }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const enrolled = context.progress !== null;
  const [persona, setPersona] = useState<TutorPersona>('friendly');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // One conversation per lesson: moving to another lesson starts (or picks up) that lesson's chat.
  const [chat, setChat] = useState<{ lessonId: string; messages: TutorMessage[] }>({ lessonId: context.lessonId, messages: [] });
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (chat.lessonId !== context.lessonId) {
    setChat({ lessonId: context.lessonId, messages: [] });
    setProblem(null);
  }
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // The first time Aria opens on a lesson: pick up the earlier chat about it, if there is one.
  useEffect(() => {
    if (!open || !enrolled || loadedFor === context.lessonId) return;
    const lessonId = context.lessonId;
    let cancelled = false;
    (async () => {
      try {
        const past = await lessonConversation(lessonId, await getToken());
        if (!cancelled && past.length > 0) setChat((c) => (c.lessonId === lessonId && c.messages.length === 0 ? { lessonId, messages: past } : c));
      } catch {
        // No earlier chat to show; Aria still answers new questions.
      } finally {
        if (!cancelled) setLoadedFor(lessonId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, enrolled, context.lessonId, loadedFor, getToken]);

  // A reply still coming in for a lesson the learner has left is stopped.
  useEffect(() => () => abortRef.current?.abort(), [context.lessonId]);

  // Keep the newest message in view as it is written.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [chat.messages, open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !enrolled) return;
    const lessonId = context.lessonId;
    // A reply stopped before it began left nothing to send back.
    const history: TutorMessage[] = [...chat.messages.filter((m) => m.content), { role: 'user', content: text }];
    // Aria's reply starts empty and fills in as it streams.
    setChat({ lessonId, messages: [...history, { role: 'assistant', content: '' }] });
    setInput('');
    setProblem(null);
    setSending(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let replied = false;
    try {
      await streamTutorReply(
        { messages: history, courseId: context.courseId, lessonId, persona },
        {
          token: await getToken(),
          signal: controller.signal,
          onText: (piece) => {
            if (piece) replied = true;
            setChat((c) => (c.lessonId === lessonId ? { lessonId, messages: c.messages.map((m, i) => (i === c.messages.length - 1 ? { ...m, content: m.content + piece } : m)) } : c));
          },
        }
      );
      // The API answers 201 with an empty body when the AI provider fails.
      if (!replied) throw new Error('Empty reply');
    } catch (err) {
      // Stopped by the learner (or by leaving the lesson): keep whatever Aria had written.
      if (controller.signal.aborted) {
        setChat((c) => (c.lessonId === lessonId ? { lessonId, messages: c.messages.filter((m) => m.content) } : c));
        return;
      }
      // Drop the empty reply and give the question back to edit or resend.
      setChat((c) => (c.lessonId === lessonId ? { lessonId, messages: history.slice(0, -1) } : c));
      setInput(text);
      setProblem(problemText(err));
    } finally {
      setSending(false);
    }
  }

  const waiting = sending && chat.messages.at(-1)?.content === '';

  // Rendered into <body>, outside the player's zoomed frame, so it sits at true size over the video.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-end font-body sm:inset-auto sm:bottom-6 sm:right-6">
      <div className="absolute inset-0 bg-black/50 sm:hidden" onClick={onClose} aria-hidden="true" />
      <section
        role="dialog"
        aria-label="Ask Aria"
        className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#fffdf9] shadow-2xl sm:h-[min(620px,calc(100vh-7rem))] sm:w-[400px] sm:rounded-3xl"
      >
        <header className="flex items-center gap-3 bg-brand-night px-5 py-4 text-white">
          <AriaAvatar className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[17px] font-bold leading-6">Aria</h2>
            <p className="flex items-center gap-1.5 truncate text-[13px] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5fd3b5]" aria-hidden="true" />
              AI Learning Coach
            </p>
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

        <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8efe4] px-5 py-5" aria-live="polite">
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

          {[{ role: 'assistant' as const, content: greetingFor(user?.firstName, context) }, ...chat.messages].map((m, i) =>
            m.role === 'assistant' ? (
              // An empty reply is still on its way: shown below as the typing dots.
              m.content && (
                <div key={i} className="flex items-start gap-3">
                  <AriaAvatar className="h-8 w-8" />
                  <p className="min-w-0 rounded-2xl rounded-tl-md border border-[#efe2d0] bg-[#fffdf9] px-4 py-3 text-[14px] leading-[22px] text-[#3d2b1f] [overflow-wrap:anywhere]">
                    <span className="sr-only">Aria: </span>
                    <RichText text={m.content} />
                  </p>
                </div>
              )
            ) : (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-[14px] leading-[22px] text-white [overflow-wrap:anywhere]">
                  <span className="sr-only">You: </span>
                  {m.content}
                </p>
              </div>
            )
          )}

          {waiting && (
            <div className="flex items-center gap-3" aria-label="Aria is typing">
              <AriaAvatar className="h-8 w-8" />
              <span className="flex gap-1 rounded-2xl rounded-tl-md border border-[#efe2d0] bg-[#fffdf9] px-4 py-3.5" aria-hidden="true">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b9a593]" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </span>
            </div>
          )}

          {problem && (
            <p className="rounded-xl border border-[#f3c9b8] bg-[#fdeee4] px-3 py-2 text-[13px] text-[#9a3412]" role="alert">
              {problem}
            </p>
          )}
        </div>

        {enrolled ? (
          <form onSubmit={handleSubmit} className="flex gap-2.5 border-t border-[#efe2d0] bg-[#fdf6ec] px-4 py-3">
            <label className="sr-only" htmlFor="ask-aria">
              Ask Aria
            </label>
            <input
              id="ask-aria"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aria about this lesson…"
              autoComplete="off"
              autoFocus
              className="h-11 min-w-0 flex-1 rounded-xl border border-[#efe2d0] bg-white px-4 text-[14px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
            />
            {sending ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                aria-label="Stop Aria's reply"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#e3d6c4] bg-white text-[#3d2b1f] hover:text-brand"
              >
                <Square className="h-4 w-4 fill-current" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-brand-gradient text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendHorizontal className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
              </button>
            )}
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3 border-t border-[#efe2d0] bg-[#fdf6ec] px-4 py-3">
            <p className="text-[13px] leading-5 text-[#7a6655]">Enrol to chat with Aria about this course.</p>
            <Link href={`/checkout/${context.courseSlug}`} className="flex h-10 shrink-0 items-center rounded-xl bg-brand-gradient px-4 text-[14px] font-bold text-white transition-opacity hover:opacity-90">
              Enrol
            </Link>
          </div>
        )}
      </section>
    </div>,
    document.body
  );
}
