'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bot, Check, ChevronRight, Maximize, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/learner/app-header';
import type { CourseDetail, Lesson } from '@/lib/learner-data';

const SPEEDS = [1, 1.25, 1.5, 2];

/** "14:10" → 850 seconds. */
const toSeconds = (d: string) => d.split(':').reduce((t, part) => t * 60 + Number(part), 0);
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * The course player: the lesson (with play, seek, speed, volume and full screen), Prev / Mark Complete /
 * Next, and the course content list.
 * TODO: Play the lesson's videoUrl and save progress to the learner module once enrolments exist; the
 * sample course has no video, so playback is simulated over its cover image.
 */
export function PlayerView({ course, startLessonId, startPosition }: { course: CourseDetail; startLessonId: string; startPosition: number }) {
  const lessons = useMemo(() => course.curriculum.flatMap((s, si) => s.lessons.map((l, li) => ({ ...l, section: s.title, sectionIndex: si, indexInSection: li, sectionSize: s.lessons.length }))), [course]);
  const [currentId, setCurrentId] = useState(lessons.some((l) => l.id === startLessonId) ? startLessonId : lessons[0]?.id);
  const [done, setDone] = useState<Set<string>>(() => new Set(lessons.filter((l) => l.done).map((l) => l.id)));
  const [position, setPosition] = useState(startPosition);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.25);
  const [muted, setMuted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const index = Math.max(0, lessons.findIndex((l) => l.id === currentId));
  const lesson = lessons[index];
  const length = lesson ? toSeconds(lesson.duration) : 0;
  // Playback stops by itself at the end of the lesson.
  const isPlaying = playing && position < length;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setPosition((p) => Math.min(length, p + speed)), 1000);
    return () => clearInterval(t);
  }, [isPlaying, speed, length]);

  if (!lesson) return null;

  function togglePlay() {
    if (!isPlaying && position >= length) setPosition(0);
    setPlaying(!isPlaying);
  }

  function go(to: number) {
    const next = lessons[to];
    if (!next) return;
    setCurrentId(next.id);
    setPosition(0);
    setPlaying(true);
  }

  function markComplete() {
    setDone((d) => new Set(d).add(lesson.id));
    go(index + 1);
  }

  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void playerRef.current?.requestFullscreen?.();
  }

  const sectionTitle = lesson.section;
  const isDone = (l: Lesson) => done.has(l.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#140b05] font-body text-white lg:h-screen">
      {/* Zoomed inside the full-height frame, so the frame itself still fills the screen. */}
      <div className="learner-compact flex min-h-0 flex-1 flex-col">
        <header className="flex h-[80px] shrink-0 items-center gap-6 border-b border-[#3a2a1a] bg-[#120a04] px-4 sm:px-[31px]">
          <Link href="/dashboard" aria-label="Back to your dashboard" className="shrink-0">
            <AppLogo tone="light" />
          </Link>
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-[18px] text-[19px] md:ml-[24px] md:flex">
            <Link href={`/courses/${course.slug}`} className="truncate text-[#8a7462] hover:text-white">
              {course.title}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#5d4a3a]" aria-hidden="true" />
            <span className="truncate font-semibold text-[#e8a33d]" aria-current="page">
              {sectionTitle}
            </span>
          </nav>
          <Link href="/coach" className="ml-auto flex shrink-0 items-center gap-2 text-[19px] font-semibold text-[#e8a33d] hover:text-[#f2bd61]">
            <Bot className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
            Ask Aria
          </Link>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="flex min-w-0 flex-1 flex-col" aria-label="Lesson">
            <div ref={playerRef} className="relative min-h-[260px] flex-1 overflow-hidden bg-black">
              <Image src={course.image} alt="" fill unoptimized priority className="object-cover opacity-90" />
              <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white/40 bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                {isPlaying ? <Pause className="h-10 w-10" strokeWidth={1.6} /> : <Play className="ml-1 h-10 w-10" strokeWidth={1.6} />}
              </button>

              <div className="absolute inset-x-0 bottom-0 px-4 pb-[24px] sm:px-[32px]">
                <input
                  type="range"
                  min={0}
                  max={length}
                  step={1}
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  aria-label="Seek"
                  aria-valuetext={`${clock(position)} of ${lesson.duration}`}
                  className="player-range h-1 w-full cursor-pointer appearance-none rounded-full"
                  style={{ background: `linear-gradient(90deg,#c1440e 0%,#d4920a ${(position / Math.max(1, length)) * 100}%,rgba(255,255,255,0.25) ${(position / Math.max(1, length)) * 100}%)` }}
                />
                <div className="mt-[22px] flex items-center gap-3 sm:gap-[24px]">
                  <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous lesson" className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                    <SkipBack className="h-[22px] w-[22px]" strokeWidth={1.8} />
                  </button>
                  <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="cursor-pointer">
                    {isPlaying ? <Pause className="h-[26px] w-[26px]" strokeWidth={1.8} /> : <Play className="h-[26px] w-[26px]" strokeWidth={1.8} />}
                  </button>
                  <button type="button" onClick={() => go(index + 1)} disabled={index === lessons.length - 1} aria-label="Next lesson" className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                    <SkipForward className="h-[22px] w-[22px]" strokeWidth={1.8} />
                  </button>
                  <span className="whitespace-nowrap font-mono text-[14px] text-white/80 sm:text-[18px]">
                    {clock(position)} / {lesson.duration}
                  </span>
                  <span className="ml-auto flex items-center gap-3 sm:gap-[24px]">
                    <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'} className="cursor-pointer">
                      {muted ? <VolumeX className="h-[22px] w-[22px]" strokeWidth={1.8} /> : <Volume2 className="h-[22px] w-[22px]" strokeWidth={1.8} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
                      aria-label={`Playback speed ${speed}x`}
                      className="min-w-[44px] cursor-pointer font-mono text-[17px] text-white/80"
                    >
                      {speed}x
                    </button>
                    <button type="button" onClick={fullscreen} aria-label="Full screen" className="cursor-pointer">
                      <Maximize className="h-[22px] w-[22px]" strokeWidth={1.8} />
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-5 border-t border-[#2a1a0e] bg-[#140b05] px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-[37px] lg:h-[157px] lg:py-0">
              <div className="min-w-0">
                <h1 className="font-display text-[24px] font-bold leading-8 text-white">{lesson.title}</h1>
                <p className="mt-[6px] max-w-[300px] text-[17px] leading-[29px] text-[#5d4a3a]">
                  Section {lesson.sectionIndex + 1} · Lesson {lesson.indexInSection + 1} of {lesson.sectionSize} · {lesson.duration} min
                </p>
              </div>
              <div className="flex gap-[13px]">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                  className="flex h-[68px] w-[91px] cursor-pointer flex-col items-center justify-center rounded-xl bg-[#fdf3e7] text-[16px] font-bold text-[#1c0e04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={markComplete}
                  className="flex h-[68px] min-w-[168px] cursor-pointer flex-col items-center justify-center rounded-xl bg-brand-gradient px-4 text-[16px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
                >
                  {isDone(lesson) ? 'Completed' : 'Mark Complete'}
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  disabled={index === lessons.length - 1}
                  className="flex h-[68px] w-[93px] cursor-pointer flex-col items-center justify-center rounded-xl bg-[#fdf3e7] text-[16px] font-bold text-[#1c0e04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          <aside className="relative shrink-0 overflow-y-auto border-t border-[#2a1a0e] bg-[#140b05] lg:w-[442px] lg:border-l lg:border-t-0" aria-label="Course content">
            <div className="px-[25px] pb-[17px] pt-[25px]">
              <h2 className="font-display text-[20px] font-bold leading-7 text-white">Course Content</h2>
              <p className="mt-[3px] text-[16px] text-[#5d4a3a]">
                {lessons.length} lessons · {course.duration || `${course.curriculum.length} sections`} total
              </p>
            </div>
            {course.curriculum.map((section) => (
              <div key={section.title}>
                <h3 className="flex h-14 items-center border-y border-[#2a1a0e] bg-[#22140a] px-[25px] text-[17px] font-bold text-[#6b5644]">{section.title}</h3>
                <ul>
                  {section.lessons.map((l) => {
                    const current = l.id === lesson.id;
                    const complete = isDone(l);
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => go(lessons.findIndex((x) => x.id === l.id))}
                          aria-current={current ? 'true' : undefined}
                          className={cn(
                            'flex h-[83px] w-full cursor-pointer items-center gap-[15px] border-l-[3px] px-[25px] text-left transition-colors',
                            current ? 'border-brand bg-[#2a1a0e]' : 'border-transparent hover:bg-[#1c1108]'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full',
                              complete ? 'bg-[#0d5c3a] text-[#7ee0c0]' : current ? 'bg-brand text-white' : 'bg-[#2a1a0e] text-[#4a3424]'
                            )}
                            aria-hidden="true"
                          >
                            {complete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                          </span>
                          <span className="min-w-0">
                            <span className={cn('block truncate text-[18px] leading-6', complete ? 'text-[#5fd3b5]' : current ? 'font-semibold text-[#e8a33d]' : 'text-[#5d4a3a]')}>
                              {l.title}
                            </span>
                            <span className="block text-[14px] text-[#4a3a2c]">
                              {l.duration}
                              <span className="sr-only">{complete ? ' — completed' : current ? ' — playing' : ''}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <div className="px-[25px] py-6">
              <Link
                href={`/learn/${course.slug}/quiz`}
                className="flex h-12 items-center justify-center rounded-xl border-2 border-[#3a2a1a] text-[16px] font-semibold text-[#e8a33d] transition-colors hover:bg-[#1c1108]"
              >
                Take the lesson quiz
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
