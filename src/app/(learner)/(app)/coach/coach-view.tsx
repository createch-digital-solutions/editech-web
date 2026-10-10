'use client';

import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { SendHorizontal, WandSparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAMPLE_COACH, SAMPLE_LEARNER, SAMPLE_PLAYER } from '@/lib/learner-data';

type Message = { id: number; from: 'aria' | 'learner'; text: string };
const PERSONAS = [
  { id: 'friendly', label: 'Friendly', emoji: '😊' },
  { id: 'formal', label: 'Formal' },
  { id: 'socratic', label: 'Socratic' },
] as const;

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

function AriaAvatar({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white', size === 'lg' ? 'h-[68px] w-[68px]' : 'h-[49px] w-[49px]')} aria-hidden="true">
      <WandSparkles className={size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'} strokeWidth={1.8} />
    </span>
  );
}

/**
 * Chat with Aria about the current lesson.
 * TODO: Send messages to the AI module (with the lesson context and persona) once it has a chat endpoint.
 */
export function CoachView() {
  const { user } = useUser();
  const firstName = user?.firstName || SAMPLE_LEARNER.firstName;
  const [persona, setPersona] = useState<(typeof PERSONAS)[number]['id']>('friendly');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [conversation, setConversation] = useState<Message[]>(() => SAMPLE_COACH.conversation.map((m, i) => ({ id: i + 1, ...m })));
  // The greeting uses the signed-in learner's name, so it is worked out on each render.
  const messages: Message[] = [{ id: 0, from: 'aria', text: SAMPLE_COACH.greeting(firstName) }, ...conversation];
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversation.length > SAMPLE_COACH.conversation.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [conversation, typing]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setConversation((m) => [...m, { id: m.length + 1, from: 'learner', text: trimmed }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setConversation((m) => [
        ...m,
        {
          id: m.length + 1,
          from: 'aria',
          text: "I'm not connected yet, so I can't answer that one for real. Once the AI coach goes live I'll answer questions about this lesson in your chosen style. Until then, the lesson notes and the **quiz** are a great way to check your understanding.",
        },
      ]);
      setTyping(false);
    }, 900);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <section className="flex min-w-0 flex-1 flex-col" aria-label="Chat with Aria">
        <div className="relative flex flex-col gap-5 bg-brand-night px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-[31px] lg:h-[133px] lg:py-0">
          <div className="flex items-center gap-[21px]">
            <span className="relative">
              <AriaAvatar size="lg" />
              <span className="absolute bottom-[2px] right-[2px] h-[15px] w-[15px] rounded-full border-[3px] border-[#1a0e05] bg-[#0d8a4f]" aria-label="Online" />
            </span>
            <div>
              <h1 className="font-display text-[23px] font-bold leading-7 text-white">Aria</h1>
              <p className="mt-[2px] max-w-[300px] text-[16px] leading-6 text-[#0d8a4f]">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#0d8a4f]" aria-hidden="true" />
                AI Learning Coach · Context-aware · {SAMPLE_COACH.lessonTitle} lesson
              </p>
            </div>
          </div>
          <div className="flex gap-[11px]" role="radiogroup" aria-label="Coaching style">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={persona === p.id}
                onClick={() => setPersona(p.id)}
                className={cn(
                  'flex h-[66px] min-w-[92px] cursor-pointer flex-col items-center justify-center rounded-full border-2 px-[18px] text-[16px] leading-6 transition-colors',
                  persona === p.id ? 'border-white/50 bg-white/20 font-semibold text-white' : 'border-white/15 bg-white/5 text-white/40 hover:text-white/70'
                )}
              >
                {p.label}
                {'emoji' in p && <span aria-hidden="true">{p.emoji}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-[25px] bg-[#f8efe4] px-4 pb-[30px] pt-[32px] sm:px-[31px]" aria-live="polite">
          {messages.map((m) =>
            m.from === 'aria' ? (
              <div key={m.id} className="flex items-start gap-[16px]">
                <AriaAvatar />
                <p className="max-w-[578px] rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[24px] py-[22px] text-[19px] leading-[33px] text-[#3d2b1f]">
                  <span className="sr-only">Aria: </span>
                  <RichText text={m.text} />
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[512px] rounded-3xl bg-brand px-[24px] py-[20px] text-[19px] leading-[30px] text-white">
                  <span className="sr-only">You: </span>
                  {m.text}
                </p>
              </div>
            )
          )}
          {typing && (
            <div className="flex items-center gap-[16px]">
              <AriaAvatar />
              <p className="rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-6 py-4 text-[19px] text-[#a89282]">
                Aria is typing<span className="animate-pulse">…</span>
              </p>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="sticky bottom-0 flex gap-[18px] border-t border-[#efe2d0] bg-[#fdf6ec] px-4 py-[22px] sm:px-[31px]">
          <label className="sr-only" htmlFor="ask-aria">
            Ask Aria
          </label>
          <input
            ref={inputRef}
            id="ask-aria"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask Aria anything about this lesson..."
            autoComplete="off"
            className="h-[66px] min-w-0 flex-1 rounded-2xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-[25px] text-[19px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || typing}
            aria-label="Send"
            className="flex h-[68px] w-[68px] shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendHorizontal className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </form>
      </section>

      <aside className="shrink-0 border-t border-[#e8d5bb] bg-[#fffdf9] px-4 py-8 sm:px-[30px] lg:w-[371px] lg:border-l lg:border-t-0 lg:pt-[33px]">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-[#a08a78]">Lesson context</h2>
        <Link
          href={`/learn/${SAMPLE_PLAYER.courseSlug}`}
          className="mt-[18px] block rounded-2xl border-2 border-[#f5d3bd] bg-[#fdeee4] px-[19px] pb-[19px] pt-[22px] transition-colors hover:border-brand/40"
        >
          <p className="text-[19px] font-bold leading-6 text-brand">{SAMPLE_COACH.lessonTitle}</p>
          <p className="mt-[6px] text-[16px] text-[#7a6655]">{SAMPLE_COACH.lessonMeta}</p>
          <div className="mt-[16px] h-[6px] rounded-full bg-[#f3dccb]" role="progressbar" aria-valuenow={SAMPLE_COACH.watched} aria-valuemin={0} aria-valuemax={100} aria-label="Watched">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#c1440e,#d4920a)]" style={{ width: `${SAMPLE_COACH.watched}%` }} />
          </div>
          <p className="mt-[10px] text-[14px] text-brand">{SAMPLE_COACH.watched}% watched</p>
        </Link>

        <h2 className="mt-[38px] text-[16px] font-bold uppercase tracking-[0.12em] text-[#a08a78]">Ask Aria</h2>
        <ul className="mt-[18px] space-y-[11px]">
          {SAMPLE_COACH.suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => send(s)}
                disabled={typing}
                className="flex h-14 w-full cursor-pointer items-center rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[18px] text-left text-[17px] text-[#3d2b1f] transition-colors hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
