'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bot, Check, ChevronRight, Lock, Maximize, Pause, Play, SkipBack, SkipForward, VideoOff, Volume1, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/learner/app-header';
import { clock, type CourseDetail, type Lesson } from '@/lib/learner-data';
import { embedUrl } from '@/lib/video';
import { AriaPanel } from './aria-panel';

const SPEEDS = [1, 1.25, 1.5, 2];


/**
 * The course player: the lesson video (with play, seek, speed, volume and full screen), Prev / Mark
 * Complete / Next, and the course content list. Lessons without a video link show why: locked until
 * the learner enrols, or not uploaded yet.
 * TODO: Save completed lessons to the learner module once it has a progress endpoint; until then
 * Mark Complete only lasts for this visit.
 */
export function PlayerView({ course, startLessonId }: { course: CourseDetail; startLessonId: string }) {
  const lessons = useMemo(() => course.curriculum.flatMap((s, si) => s.lessons.map((l, li) => ({ ...l, section: s.title, sectionIndex: si, indexInSection: li, sectionSize: s.lessons.length }))), [course]);
  const [currentId, setCurrentId] = useState(lessons.some((l) => l.id === startLessonId) ? startLessonId : lessons[0]?.id);
  const [done, setDone] = useState<Set<string>>(() => new Set(lessons.filter((l) => l.done).map((l) => l.id)));
  const [position, setPosition] = useState(0);
  const [length, setLength] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Once the learner has pressed play, the next lesson starts on its own.
  const [started, setStarted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  // 0–1; kept from lesson to lesson.
  const [volume, setVolume] = useState(1);
  // Lessons whose video link failed to load (a dead or blocked link).
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const [ariaOpen, setAriaOpen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const index = Math.max(0, lessons.findIndex((l) => l.id === currentId));
  const lesson = lessons[index];

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#140b05] px-6 text-center font-body text-white">
        <h1 className="type-page-title">No lessons yet</h1>
        <p className="max-w-md text-[#a08a78]">The instructor hasn&apos;t published any lessons for {course.title} yet.</p>
        <Link href={`/courses/${course.slug}`} className="font-semibold text-[#e8a33d] hover:text-[#f2bd61]">
          Back to the course
        </Link>
      </div>
    );
  }

  const embed = lesson.videoUrl ? embedUrl(lesson.videoUrl) : null;
  // Our own controls drive a <video>; an embedded player brings its own.
  const canPlay = !!lesson.videoUrl && !embed && !failed.has(lesson.id);
  const total = length || lesson.seconds;

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    if (v.paused) void v.play();
    else v.pause();
  }

  function go(to: number) {
    const next = lessons[to];
    if (!next) return;
    setCurrentId(next.id);
    setPosition(0);
    setLength(0);
    setPlaying(false);
  }

  function seek(seconds: number) {
    if (videoRef.current) videoRef.current.currentTime = seconds;
    setPosition(seconds);
  }

  function changeSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }

  function toggleMute() {
    const next = !muted;
    // Unmuting from a slider dragged to zero brings the sound back at half volume.
    if (!next && volume === 0) changeVolume(0.5);
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  }

  function changeVolume(value: number) {
    setVolume(value);
    setMuted(value === 0);
    const v = videoRef.current;
    if (v) {
      v.volume = value;
      v.muted = value === 0;
    }
  }

  const silent = muted || volume === 0;
  const VolumeIcon = silent ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const volumeShown = silent ? 0 : volume;

  function markComplete() {
    setDone((d) => new Set(d).add(lesson.id));
    go(index + 1);
  }

  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void playerRef.current?.requestFullscreen?.();
  }

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
              {lesson.section}
            </span>
          </nav>
          <button
            type="button"
            onClick={() => setAriaOpen(!ariaOpen)}
            aria-expanded={ariaOpen}
            className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 text-[15px] font-semibold lg:text-[19px] text-[#e8a33d] hover:text-[#f2bd61]"
          >
            <Bot className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
            Ask Aria
          </button>
        </header>
        <AriaPanel
          open={ariaOpen}
          onClose={() => setAriaOpen(false)}
          context={{
            courseId: course.id,
            courseSlug: course.slug,
            courseTitle: course.title,
            sectionTitle: lesson.section,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonNumber: index + 1,
            totalLessons: lessons.length,
            progress: course.enrolment ? Math.round(course.enrolment.progress) : null,
          }}
        />

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="flex min-w-0 flex-1 flex-col" aria-label="Lesson">
            <div ref={playerRef} className="relative min-h-[260px] flex-1 overflow-hidden bg-black">
              {embed ? (
                <iframe
                  key={lesson.id}
                  src={embed}
                  title={lesson.title}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : canPlay ? (
                <video
                  key={lesson.id}
                  ref={videoRef}
                  src={lesson.videoUrl}
                  autoPlay={started}
                  playsInline
                  preload="metadata"
                  onClick={togglePlay}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onError={() => {
                    setFailed((f) => new Set(f).add(lesson.id));
                    setPlaying(false);
                  }}
                  onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => {
                    setLength(e.currentTarget.duration || lesson.seconds);
                    e.currentTarget.playbackRate = speed;
                    e.currentTarget.muted = muted;
                    e.currentTarget.volume = volume;
                  }}
                  className="absolute inset-0 h-full w-full bg-black object-contain"
                />
              ) : (
                <>
                  <Image src={course.image} alt="" fill unoptimized priority className="object-cover opacity-30" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10" aria-hidden="true">
                      {lesson.locked ? <Lock className="h-8 w-8" strokeWidth={1.6} /> : <VideoOff className="h-8 w-8" strokeWidth={1.6} />}
                    </span>
                    {lesson.locked ? (
                      <>
                        <p className="type-section-title max-w-md">This lesson unlocks when you enrol</p>
                        <Link
                          href={`/checkout/${course.slug}`}
                          className="flex h-12 items-center rounded-xl bg-brand-gradient px-6 text-[17px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90"
                        >
                          Enroll in this course
                        </Link>
                      </>
                    ) : failed.has(lesson.id) ? (
                      <p className="type-section-title max-w-md">This video couldn&apos;t be loaded. Please try again later.</p>
                    ) : (
                      <p className="type-section-title max-w-md">This lesson&apos;s video isn&apos;t available yet</p>
                    )}
                  </div>
                </>
              )}

              {canPlay && !playing && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play"
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 sm:h-24 sm:w-24 cursor-pointer items-center justify-center rounded-full border-2 border-white/40 bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <Play className="ml-1 h-7 w-7 sm:h-10 sm:w-10" strokeWidth={1.6} />
                </button>
              )}

              {canPlay && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-[24px] pt-12 sm:px-[32px]">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, Math.floor(total))}
                    step={1}
                    value={Math.floor(position)}
                    onChange={(e) => seek(Number(e.target.value))}
                    aria-label="Seek"
                    aria-valuetext={`${clock(position)} of ${clock(total)}`}
                    className="player-range h-1 w-full cursor-pointer appearance-none rounded-full"
                    style={{ background: `linear-gradient(90deg,#c1440e 0%,#d4920a ${(position / Math.max(1, total)) * 100}%,rgba(255,255,255,0.25) ${(position / Math.max(1, total)) * 100}%)` }}
                  />
                  <div className="mt-[22px] flex items-center gap-3 sm:gap-[24px]">
                    <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous lesson" className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                      <SkipBack className="h-[22px] w-[22px]" strokeWidth={1.8} />
                    </button>
                    <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="cursor-pointer">
                      {playing ? <Pause className="h-[26px] w-[26px]" strokeWidth={1.8} /> : <Play className="h-[26px] w-[26px]" strokeWidth={1.8} />}
                    </button>
                    <button type="button" onClick={() => go(index + 1)} disabled={index === lessons.length - 1} aria-label="Next lesson" className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                      <SkipForward className="h-[22px] w-[22px]" strokeWidth={1.8} />
                    </button>
                    <span className="whitespace-nowrap font-mono text-[14px] text-white/80 sm:text-[18px]">
                      {clock(position)} / {clock(total)}
                    </span>
                    <span className="ml-auto flex items-center gap-3 sm:gap-[24px]">
                      <span className="flex items-center gap-2.5">
                        <button type="button" onClick={toggleMute} aria-label={silent ? 'Unmute' : 'Mute'} className="cursor-pointer">
                          <VolumeIcon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                        </button>
                        {/* Phones use their own volume buttons (and iPhones ignore a page's volume), so the slider shows from tablet up. */}
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={volumeShown}
                          onChange={(e) => changeVolume(Number(e.target.value))}
                          aria-label="Volume"
                          aria-valuetext={`${Math.round(volumeShown * 100)}%`}
                          className="player-range hidden h-1 w-20 cursor-pointer appearance-none rounded-full sm:block lg:w-24"
                          style={{ background: `linear-gradient(90deg,#fff 0%,#fff ${volumeShown * 100}%,rgba(255,255,255,0.25) ${volumeShown * 100}%)` }}
                        />
                      </span>
                      <button type="button" onClick={changeSpeed} aria-label={`Playback speed ${speed}x`} className="min-w-[44px] cursor-pointer font-mono text-[17px] text-white/80">
                        {speed}x
                      </button>
                      <button type="button" onClick={fullscreen} aria-label="Full screen" className="cursor-pointer">
                        <Maximize className="h-[22px] w-[22px]" strokeWidth={1.8} />
                      </button>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-4 border-t border-[#2a1a0e] bg-[#140b05] px-4 py-4 sm:flex-row sm:gap-5 sm:py-6 sm:items-center sm:justify-between sm:px-[37px] lg:h-[157px] lg:py-0">
              <div className="min-w-0">
                <h1 className="type-section-title line-clamp-2 text-white">{lesson.title}</h1>
                <p className="type-body mt-1 text-[#5d4a3a]">
                  Section {lesson.sectionIndex + 1} · Lesson {lesson.indexInSection + 1} of {lesson.sectionSize} · {lesson.duration} min
                </p>
              </div>
              <div className="flex gap-2 sm:gap-[13px]">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#fdf3e7] text-[14px] sm:flex-none lg:h-[68px] lg:w-[91px] lg:flex-col lg:gap-0 lg:text-[16px] font-bold text-[#1c0e04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={markComplete}
                  disabled={!canPlay && !embed}
                  className="flex h-11 flex-[1.7] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-brand-gradient px-3 text-[14px] sm:flex-none sm:px-4 lg:h-[68px] lg:min-w-[168px] lg:flex-col lg:gap-0 lg:text-[16px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDone(lesson) ? 'Completed' : 'Mark Complete'}
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  disabled={index === lessons.length - 1}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#fdf3e7] text-[14px] sm:flex-none lg:h-[68px] lg:w-[93px] lg:flex-col lg:gap-0 lg:text-[16px] font-bold text-[#1c0e04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          <aside className="relative shrink-0 overflow-y-auto border-t border-[#2a1a0e] bg-[#140b05] lg:w-[442px] lg:border-l lg:border-t-0" aria-label="Course content">
            <div className="px-4 pb-3 pt-4 lg:px-[25px] lg:pb-[17px] lg:pt-[25px]">
              <h2 className="type-section-title text-white">Course Content</h2>
              <p className="type-body mt-[3px] text-[#5d4a3a]">
                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                {course.duration && ` · ${course.duration} total`}
              </p>
            </div>
            {course.curriculum.map((section) => (
              <div key={section.title}>
                <h3 className="flex min-h-11 items-center border-y border-[#2a1a0e] bg-[#22140a] px-4 py-2 text-[14px] font-bold leading-5 text-[#6b5644] lg:min-h-14 lg:px-[25px] lg:text-[17px]">{section.title}</h3>
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
                            'flex h-16 w-full cursor-pointer items-center gap-3 border-l-[3px] px-4 text-left transition-colors lg:h-[83px] lg:gap-[15px] lg:px-[25px]',
                            current ? 'border-brand bg-[#2a1a0e]' : 'border-transparent hover:bg-[#1c1108]'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full lg:h-[34px] lg:w-[34px]',
                              complete ? 'bg-[#0d5c3a] text-[#7ee0c0]' : current ? 'bg-brand text-white' : 'bg-[#2a1a0e] text-[#4a3424]'
                            )}
                            aria-hidden="true"
                          >
                            {complete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : l.locked ? <Lock className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                          </span>
                          <span className="min-w-0">
                            <span className={cn('block truncate text-[14px] leading-5 lg:text-[18px] lg:leading-6', complete ? 'text-[#5fd3b5]' : current ? 'font-semibold text-[#e8a33d]' : 'text-[#5d4a3a]')}>
                              {l.title}
                            </span>
                            <span className="block text-[12px] text-[#4a3a2c] lg:text-[14px]">
                              {l.duration}
                              {l.preview && ' · Free preview'}
                              <span className="sr-only">{complete ? ' — completed' : current ? ' — selected' : l.locked ? ' — locked' : ''}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
