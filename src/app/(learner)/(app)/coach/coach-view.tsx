'use client';

import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { SendHorizontal, Square, WandSparkles } from 'lucide-react';
import { ApiClientError } from '@/lib/api-client';
import { streamTutorReply } from '@/lib/ai-tutor';
import { cn } from '@/lib/utils';
import type { TutorMessage, TutorPersona } from '@/types/ai';

const PERSONAS = [
  { id: 'friendly', label: 'Friendly', emoji: '😊' },
  { id: 'formal', label: 'Formal' },
  { id: 'socratic', label: 'Socratic' },
] as const satisfies readonly { id: TutorPersona; label: string; emoji?: string }[];

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

function problemText(err: unknown): string {
  if (err instanceof ApiClientError && err.status === 401) return 'Your session has ended. Please sign in again to keep chatting.';
  return "Aria couldn't answer just now. Please try again.";
}

/**
 * Chat with Aria (POST /ai/tutor/chat). Her reply streams in as she writes it, in the style picked above.
 */
export function CoachView() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [persona, setPersona] = useState<TutorPersona>('friendly');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const greeting = `Hi${user?.firstName ? ` ${user.firstName}` : ''}! 👋 I'm Aria, your AI learning coach.\n\nAsk me anything about what you're learning, in the style you pick above.`;
  const waiting = sending && messages[messages.length - 1]?.content === '';

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    const history: TutorMessage[] = [...messages.filter((m) => m.content), { role: 'user', content: question }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setProblem(null);
    setSending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let replied = false;
    try {
      await streamTutorReply(
        { messages: history, persona },
        {
          token: await getToken(),
          signal: controller.signal,
          onText: (text) => {
            if (text) replied = true;
            setMessages((current) => {
              const last = current[current.length - 1];
              return [...current.slice(0, -1), { ...last, content: last.content + text }];
            });
          },
        }
      );
      // The API answers 201 with an empty body when the AI provider fails.
      if (!replied) throw new Error('Empty reply');
    } catch (err) {
      if (controller.signal.aborted) {
        // Stopped: keep what Aria had written so far.
        setMessages((current) => (current[current.length - 1]?.content ? current : current.slice(0, -1)));
      } else {
        setMessages(history.slice(0, -1));
        setInput(question);
        setProblem(problemText(err));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setSending(false);
    }
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
                <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-green-400" aria-hidden="true" />
                AI Learning Coach
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
          <div className="flex items-start gap-[16px]">
            <AriaAvatar />
            <p className="max-w-[578px] rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[24px] py-[22px] text-[19px] leading-[33px] text-[#3d2b1f]">
              <span className="sr-only">Aria: </span>
              <RichText text={greeting} />
            </p>
          </div>
          {messages.map((m, i) =>
            m.role === 'assistant' ? (
              m.content && (
                <div key={i} className="flex items-start gap-[16px]">
                  <AriaAvatar />
                  <p className="max-w-[578px] rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[24px] py-[22px] text-[19px] leading-[33px] text-[#3d2b1f]">
                    <span className="sr-only">Aria: </span>
                    <RichText text={m.content} />
                  </p>
                </div>
              )
            ) : (
              <div key={i} className="flex justify-end">
                <p className="max-w-[512px] whitespace-pre-line rounded-3xl bg-brand px-[24px] py-[20px] text-[19px] leading-[30px] text-white">
                  <span className="sr-only">You: </span>
                  {m.content}
                </p>
              </div>
            )
          )}
          {waiting && (
            <div className="flex items-center gap-[16px]">
              <AriaAvatar />
              <span className="flex gap-1.5 rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[24px] py-[22px]" role="status" aria-label="Aria is typing">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-[#a08a78]" style={{ animationDelay: `${delay}ms` }} aria-hidden="true" />
                ))}
              </span>
            </div>
          )}
          {problem && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[16px] text-red-700" role="alert">
              {problem}
            </p>
          )}
          <div ref={listEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="sticky bottom-0 flex gap-[18px] border-t border-[#efe2d0] bg-[#fdf6ec] px-4 py-[22px] sm:px-[31px]">
          <label className="sr-only" htmlFor="ask-aria">
            Ask Aria
          </label>
          <input
            id="ask-aria"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aria anything…"
            autoComplete="off"
            className="h-[66px] min-w-0 flex-1 rounded-2xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-[25px] text-[19px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none"
          />
          {sending ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Stop Aria's reply"
              className="flex h-[68px] w-[68px] shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
            >
              <Square className="h-5 w-5" fill="currentColor" strokeWidth={1.8} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="flex h-[68px] w-[68px] shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendHorizontal className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
            </button>
          )}
        </form>
      </section>

      <aside className="shrink-0 border-t border-[#e8d5bb] bg-[#fffdf9] px-4 py-8 sm:px-[30px] lg:w-[371px] lg:border-l lg:border-t-0 lg:pt-[33px]">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-[#a08a78]">Lesson context</h2>
        <div className="mt-[18px] rounded-2xl border-2 border-dashed border-[#efe2d0] px-[19px] py-[22px]">
          <p className="text-[17px] text-[#7a6655]">Aria can help with any topic you&apos;re learning. Pick a course to keep going.</p>
          <Link href="/courses" className="mt-3 inline-block text-[16px] font-semibold text-brand hover:text-brand-light">
            Find a course →
          </Link>
        </div>
      </aside>
    </div>
  );
}
