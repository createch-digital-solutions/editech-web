'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAMPLE_QUIZ, type QuizQuestion } from '@/lib/learner-data';

type Result = 'correct' | 'wrong' | 'skipped';

/** A question's prompt, with its `code` word (written {code} in the prompt) shown as inline code. */
function Prompt({ q }: { q: QuizQuestion }) {
  if (!q.code) return <>{q.prompt}</>;
  const [before, after] = q.prompt.includes('{code}') ? q.prompt.split('{code}') : [q.prompt, ''];
  return (
    <>
      {before}
      {q.prompt.includes('{code}') && <code className="mx-1 rounded-md bg-[#fbebe2] px-[7px] py-[2px] font-mono text-[13px] font-normal text-brand">{q.code}</code>}
      {after}
    </>
  );
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** One quiz, a question at a time: answer, see if it was right, move on; a score at the end. */
export function QuizView({ courseSlug }: { courseSlug: string }) {
  const quiz = SAMPLE_QUIZ;
  const total = quiz.questions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(quiz.seconds);
  const finished = results.length === total || secondsLeft === 0;

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const q = quiz.questions[index];

  function next(result?: Result) {
    setResults((r) => (result ? [...r, result] : r));
    setSelected(null);
    setSubmitted(false);
    setIndex((i) => Math.min(i + 1, total - 1));
  }

  function submit() {
    if (selected === null) return;
    if (!submitted) {
      setSubmitted(true);
      return;
    }
    next(selected === q.answer ? 'correct' : 'wrong');
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setResults([]);
    setSecondsLeft(quiz.seconds);
  }

  const score = results.filter((r) => r === 'correct').length;

  return (
    <main className="mx-auto w-full max-w-[579px] flex-1 px-4 pb-[60px] pt-10 sm:px-0 lg:pt-[96px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[19px] font-bold leading-6 text-[#1c0e04]">{quiz.title}</h1>
          <p className="mt-[2px] text-[13px] text-[#7a6655]">{finished ? 'Finished' : `Question ${index + 1} of ${total}`}</p>
        </div>
        <p className={cn('mt-[3px] flex items-center gap-[5px] text-[13px] font-bold', secondsLeft <= 30 ? 'text-[#c62828]' : 'text-[#d4920a]')}>
          <Clock className="h-[14px] w-[14px]" strokeWidth={2.2} aria-hidden="true" />
          <span aria-label={`${mmss(secondsLeft)} left`}>{mmss(secondsLeft)}</span>
        </p>
      </div>

      <ol className="mt-[23px] grid gap-[6px]" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-label="Progress">
        {quiz.questions.map((_, i) => {
          const r = results[i];
          return (
            <li
              key={i}
              className={cn(
                'h-[5px] rounded-full',
                r === 'correct' ? 'bg-[#0d5c3a]' : r === 'wrong' ? 'bg-[#c62828]' : r === 'skipped' ? 'bg-[#cdbba5]' : !finished && i === index ? 'bg-brand' : 'bg-[#ebdcc4]'
              )}
            >
              <span className="sr-only">
                Question {i + 1}: {r ?? (i === index ? 'current' : 'not answered')}
              </span>
            </li>
          );
        })}
      </ol>

      <section className="relative mt-[27px] overflow-hidden rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 pb-[28px] pt-[29px] sm:px-[27px]">
        <span className="absolute left-[2px] top-[2px] h-4 w-4 bg-[#fdf6ec]" aria-hidden="true" />
        {finished ? (
          <div className="py-6 text-center">
            <p className="font-display text-[40px] font-extrabold text-[#1c0e04]">
              {score}/{total}
            </p>
            <p className="mt-2 text-base text-[#7a6655]">
              {secondsLeft === 0 && results.length < total ? "Time's up! " : ''}
              {score === total ? 'Perfect score — brilliant work!' : score >= Math.ceil(total * 0.6) ? 'Nicely done — you passed.' : 'Keep going — review the lesson and try again.'}
            </p>
            <div className="mt-6 flex justify-center gap-[13px]">
              <button
                type="button"
                onClick={restart}
                className="h-[37px] cursor-pointer rounded-lg border-2 border-[#efe2d0] bg-[#fdf6ec] px-4 text-[13px] font-semibold text-[#3d2b1f] hover:bg-white"
              >
                Retake quiz
              </button>
              <Link
                href={`/learn/${courseSlug}`}
                className="flex h-[37px] items-center gap-1 rounded-lg bg-brand-gradient px-5 text-[13px] font-bold text-white shadow-md shadow-brand/30 hover:opacity-90"
              >
                Back to lesson <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <fieldset>
            <legend className="text-[15px] font-bold leading-6 text-[#1c0e04]">
              <Prompt q={q} />
            </legend>
            <div className="mt-[21px] space-y-[12px]" role="radiogroup">
              {q.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = selected === i;
                const showRight = submitted && i === q.answer;
                const showWrong = submitted && isSelected && i !== q.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={submitted}
                    onClick={() => setSelected(i)}
                    className={cn(
                      'flex min-h-[53px] w-full cursor-pointer items-center gap-[13px] rounded-xl border-2 px-[17px] py-2 text-left text-[14px] transition-colors disabled:cursor-default',
                      showRight
                        ? 'border-[#0d5c3a] bg-[#ecfbf1] font-semibold text-[#0d5c3a]'
                        : showWrong
                          ? 'border-[#c62828] bg-[#fdeeee] font-semibold text-[#c62828]'
                          : isSelected
                            ? 'border-brand bg-[#fdeee4] font-semibold text-brand'
                            : 'border-[#efe2d0] bg-[#fffdf9] text-[#3d2b1f] hover:border-brand/40'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2',
                        isSelected || showRight ? 'border-current' : 'border-[#efd9bd]'
                      )}
                      aria-hidden="true"
                    >
                      {(isSelected || showRight) && <span className="h-[10px] w-[10px] rounded-full bg-current" />}
                    </span>
                    {letter}. {option}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className={cn('mt-4 text-[14px] font-semibold', selected === q.answer ? 'text-[#0d5c3a]' : 'text-[#c62828]')} role="status">
                {selected === q.answer ? 'Correct!' : `Not quite — the answer is ${String.fromCharCode(65 + q.answer)}.`}
              </p>
            )}
            <div className="mt-[25px] flex gap-[13px]">
              {!submitted && (
                <button
                  type="button"
                  onClick={() => next('skipped')}
                  className="h-[37px] cursor-pointer rounded-lg border-2 border-[#efe2d0] bg-[#fdf6ec] px-[17px] text-[13px] font-semibold text-[#3d2b1f] hover:bg-white"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={selected === null}
                className="flex h-[37px] cursor-pointer items-center gap-1 rounded-lg bg-brand-gradient px-[20px] text-[13px] font-bold text-white shadow-md shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitted ? (index === total - 1 ? 'See results' : 'Next question') : 'Submit Answer'}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          </fieldset>
        )}
      </section>
    </main>
  );
}
