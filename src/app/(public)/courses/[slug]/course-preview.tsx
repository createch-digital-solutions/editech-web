'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Play, VideoOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { embedUrl } from '@/lib/video';

export interface PreviewLesson {
  id: string;
  title: string;
  duration: string;
  url: string;
}

const PreviewContext = createContext<{ lessons: PreviewLesson[]; open: () => void }>({ lessons: [], open: () => {} });

function PreviewDialog({ title, lessons, onClose }: { title: string; lessons: PreviewLesson[]; onClose: () => void }) {
  const [currentId, setCurrentId] = useState(lessons[0]?.id);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const closeRef = useRef<HTMLButtonElement>(null);
  const lesson = lessons.find((l) => l.id === currentId) ?? lessons[0];
  const embed = lesson ? embedUrl(lesson.url) : null;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6" onClick={onClose}>
      {/*
       * Fits any screen: never taller than the window, and on short screens (laptops, phones turned
       * sideways) the width shrinks so the 16:9 video plus the title still fit; the lesson list scrolls.
       */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[min(760px,max(300px,calc((100dvh-15rem)*16/9)))] flex-col overflow-hidden rounded-2xl bg-[#1c1108] text-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#a08a78]">Course Preview</p>
            <h2 id="preview-title" className="type-section-title mt-1 line-clamp-2">
              {title}
            </h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close preview" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full shrink-0 bg-black">
          {failed.has(lesson.id) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <VideoOff className="h-8 w-8" strokeWidth={1.6} aria-hidden="true" />
              <p className="font-semibold">This video couldn&apos;t be loaded. Please try again later.</p>
            </div>
          ) : embed ? (
            <iframe key={lesson.id} src={embed} title={lesson.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
          ) : (
            <video
              key={lesson.id}
              src={lesson.url}
              controls
              autoPlay
              playsInline
              onError={() => setFailed((f) => new Set(f).add(lesson.id))}
              className="absolute inset-0 h-full w-full bg-black object-contain"
            />
          )}
        </div>

        <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <h3 className="font-semibold">Free sample videos</h3>
          <ul className="mt-2 space-y-1">
            {lessons.map((l) => {
              const active = l.id === lesson.id;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentId(l.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn('flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors', active ? 'bg-white/10' : 'hover:bg-white/5')}
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', active ? 'bg-brand text-white' : 'bg-white/10 text-white/70')} aria-hidden="true">
                      <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                    </span>
                    <span className={cn('flex-1 text-[15px]', active ? 'font-semibold text-[#e8a33d]' : 'text-white/85')}>{l.title}</span>
                    <span className="text-[13px] text-white/50">{l.duration}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Holds the course's free preview lessons (GET /courses/{slug}/preview) and the preview pop-up, so the
 * cover image and the "Preview this course" button inside it can both open it, as on Udemy. Works
 * signed out.
 */
export function PreviewProvider({ title, lessons, children }: { title: string; lessons: PreviewLesson[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <PreviewContext.Provider value={{ lessons, open: () => setOpen(true) }}>
      {children}
      {/* Rendered into <body>: inside the enrol card (its own layer) it would sit under the sticky top bar. */}
      {open && createPortal(<PreviewDialog title={title} lessons={lessons} onClose={() => setOpen(false)} />, document.body)}
    </PreviewContext.Provider>
  );
}

/** The course cover; with preview lessons it is a button that opens the preview. */
export function PreviewCover({ src, alt, foldAfter }: { src: string; alt: string; foldAfter?: string }) {
  const { lessons, open } = useContext(PreviewContext);
  const [folded, setFolded] = useState(false);

  // Desktop: once the element with id `foldAfter` (the hero) scrolls under the top bar, the card
  // following the page keeps only the price and buttons; the cover comes back on the way up.
  useEffect(() => {
    const target = foldAfter ? document.getElementById(foldAfter) : null;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setFolded(!entry.isIntersecting), { rootMargin: '-64px 0px 0px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [foldAfter]);

  // The cover fills the card's width at the same shape as the course cards' pictures.
  const image = <Image src={src} alt={alt} width={718} height={405} unoptimized priority className="aspect-[248/140] w-full object-cover" />;
  return (
    <div className={cn('grid grid-rows-[1fr] transition-[grid-template-rows] duration-300', folded && 'lg:grid-rows-[0fr]')}>
      <div className="min-h-0 overflow-hidden">{lessons.length === 0 ? image : <CoverButton image={image} open={open} />}</div>
    </div>
  );
}

function CoverButton({ image, open }: { image: React.ReactNode; open: () => void }) {
  return (
    <button type="button" onClick={open} className="group relative block w-full cursor-pointer" aria-label="Preview this course">
      {image}
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-colors group-hover:via-black/20" aria-hidden="true" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-4 ring-white/30 transition-transform group-hover:scale-105" aria-hidden="true">
        <Play className="ml-0.5 h-6 w-6 fill-[#1c0e04] text-[#1c0e04]" />
      </span>
      <span className="absolute inset-x-0 bottom-3 text-center font-body text-[14px] font-semibold tracking-[0.01em] text-white drop-shadow" aria-hidden="true">
        Preview this course
      </span>
    </button>
  );
}

/** A button that opens the preview; hidden when the course has no preview lessons. */
export function PreviewButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { lessons, open } = useContext(PreviewContext);
  if (lessons.length === 0) return null;
  return (
    <button type="button" onClick={open} className={cn('cursor-pointer', className)}>
      {children}
    </button>
  );
}
