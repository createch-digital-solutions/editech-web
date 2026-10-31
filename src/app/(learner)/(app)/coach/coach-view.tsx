'use client';

import { FormEvent, Fragment, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { SendHorizontal, WandSparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 * Chat with Aria about the current lesson. The AI module has no chat endpoint yet, so Aria says so and
 * the message box stays disabled rather than answering with made-up replies.
 * TODO: Send messages (with the lesson context and persona) to the AI module once it has a chat endpoint.
 */
export function CoachView() {
  const { user } = useUser();
  const [persona, setPersona] = useState<(typeof PERSONAS)[number]['id']>('friendly');
  const greeting = `Hi${user?.firstName ? ` ${user.firstName}` : ''}! 👋 I'm Aria, your AI learning coach.\n\nI'm **not switched on yet**. Once I am, you'll be able to ask me about any lesson you're watching, in the style you pick above.`;
  const messages: Message[] = [{ id: 0, from: 'aria', text: greeting }];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="learner-compact flex flex-1 flex-col lg:flex-row">
      <section className="flex min-w-0 flex-1 flex-col" aria-label="Chat with Aria">
        <div className="relative flex flex-col gap-5 bg-brand-night px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-[31px] lg:h-[133px] lg:py-0">
          <div className="flex items-center gap-[21px]">
            <AriaAvatar size="lg" />
            <div>
              <h1 className="font-display text-[23px] font-bold leading-7 text-white">Aria</h1>
              <p className="mt-[2px] max-w-[300px] text-[16px] leading-6 text-[#a08a78]">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#a08a78]" aria-hidden="true" />
                AI Learning Coach · Coming soon
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
        </div>

        <form onSubmit={handleSubmit} className="sticky bottom-0 flex gap-[18px] border-t border-[#efe2d0] bg-[#fdf6ec] px-4 py-[22px] sm:px-[31px]">
          <label className="sr-only" htmlFor="ask-aria">
            Ask Aria
          </label>
          <input
            id="ask-aria"
            disabled
            placeholder="Aria isn't available yet"
            autoComplete="off"
            className="h-[66px] min-w-0 flex-1 cursor-not-allowed rounded-2xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-[25px] text-[19px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled
            aria-label="Send"
            className="flex h-[68px] w-[68px] shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendHorizontal className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </form>
      </section>

      <aside className="shrink-0 border-t border-[#e8d5bb] bg-[#fffdf9] px-4 py-8 sm:px-[30px] lg:w-[371px] lg:border-l lg:border-t-0 lg:pt-[33px]">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-[#a08a78]">Lesson context</h2>
        <div className="mt-[18px] rounded-2xl border-2 border-dashed border-[#efe2d0] px-[19px] py-[22px]">
          <p className="text-[17px] text-[#7a6655]">When Aria is live, the lesson you&apos;re watching will show here so she can help with it.</p>
          <Link href="/courses" className="mt-3 inline-block text-[16px] font-semibold text-brand hover:text-brand-light">
            Find a course →
          </Link>
        </div>
      </aside>
    </div>
  );
}
