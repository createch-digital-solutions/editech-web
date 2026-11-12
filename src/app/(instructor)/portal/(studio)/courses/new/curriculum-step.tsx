'use client';

import { FormEvent, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Plus,
  Upload,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormError } from '@/components/auth/form-controls';
import { card, primaryButton } from '@/components/instructor/studio-parts';
import {
  builderErrorText,
  courseBuilderApi,
  uploadLessonVideo,
  videoFileDuration,
} from '@/lib/course-builder-api';
import type { LessonType } from '@/types/instructor';
import {
  formatLength,
  hintClass,
  inputClass,
  labelClass,
  lessonCount,
  secondaryButton,
  type DraftLesson,
  type DraftSection,
} from './draft';

type SectionsUpdate = (
  update: (sections: DraftSection[]) => DraftSection[]
) => void;
/** Upload progress per lesson: 0–1 while uploading, 'error' when it failed. */
type Uploads = Record<string, number | 'error'>;

/**
 * Step 2: sections and their lessons (POST /instructor/courses/:id/sections, POST
 * /instructor/sections/:id/lessons). A video lesson takes a link or a file, which goes straight to
 * storage with a progress bar. The API can't edit or remove sections and lessons yet, so they are
 * added only.
 */
export function CurriculumStep({
  courseId,
  sections,
  onChange,
  onBack,
  onNext,
}: {
  courseId: string;
  sections: DraftSection[];
  onChange: SectionsUpdate;
  onBack: () => void;
  onNext: () => void;
}) {
  const [uploads, setUploads] = useState<Uploads>({});

  const setLesson = (lessonId: string, change: Partial<DraftLesson>) =>
    onChange((all) =>
      all.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) =>
          l.id === lessonId ? { ...l, ...change } : l
        ),
      }))
    );

  async function upload(lessonId: string, file: File) {
    setUploads((u) => ({ ...u, [lessonId]: 0 }));
    try {
      await uploadLessonVideo(lessonId, file, (fraction) =>
        setUploads((u) => ({ ...u, [lessonId]: fraction }))
      );
      setLesson(lessonId, { video: 'uploaded' });
      setUploads((u) => {
        const next = { ...u };
        delete next[lessonId];
        return next;
      });
    } catch {
      setUploads((u) => ({ ...u, [lessonId]: 'error' }));
    }
  }

  const count = lessonCount(sections);

  return (
    <div className="space-y-5">
      <div className={cn(card, 'p-5 sm:p-7')}>
        <h2 className="type-section-title text-[#1c0e04]">
          Curriculum
        </h2>
        <p className="mt-1 font-body text-[14px] text-[#7a6655]">
          Group your lessons into sections, like chapters. Add at least one
          lesson to submit the course.
        </p>
      </div>

      {sections.map((section, i) => (
        <SectionCard
          key={section.id}
          index={i}
          section={section}
          uploads={uploads}
          onChange={onChange}
          onUpload={upload}
        />
      ))}

      <AddSectionForm
        courseId={courseId}
        first={sections.length === 0}
        onAdded={(s) => onChange((all) => [...all, s])}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button type="button" onClick={onBack} className={secondaryButton}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          Details
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={count === 0}
          className={cn(
            primaryButton,
            'h-11 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
          )}
          title={count === 0 ? 'Add a lesson first' : undefined}
        >
          Review and submit
          <ArrowRight
            className="h-4 w-4"
            strokeWidth={2.4}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

function AddSectionForm({
  courseId,
  first,
  onAdded,
}: {
  courseId: string;
  first: boolean;
  onAdded: (section: DraftSection) => void;
}) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setProblem(null);
    try {
      const section = await courseBuilderApi.addSection(courseId, title.trim());
      onAdded({ id: section.id, title: section.title, lessons: [] });
      setTitle('');
    } catch (err) {
      setProblem(builderErrorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(card, 'border-dashed p-5 sm:p-6')}
    >
      <label htmlFor="new-section" className={labelClass}>
        {first ? 'Add your first section' : 'Add another section'}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="new-section"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="e.g. Module 1: Getting started"
          className={cn(inputClass, 'mt-0 flex-1')}
        />
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className={cn(secondaryButton, 'h-11')}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          {saving ? 'Adding…' : 'Add section'}
        </button>
      </div>
      {problem && (
        <div className="mt-3">
          <FormError message={problem} />
        </div>
      )}
    </form>
  );
}

function SectionCard({
  index,
  section,
  uploads,
  onChange,
  onUpload,
}: {
  index: number;
  section: DraftSection;
  uploads: Uploads;
  onChange: SectionsUpdate;
  onUpload: (lessonId: string, file: File) => void;
}) {
  const [adding, setAdding] = useState(section.lessons.length === 0);

  return (
    <section
      className={cn(card, 'overflow-hidden')}
      aria-labelledby={`section-${section.id}`}
    >
      <div className="border-b border-[#efe2d0] bg-[#fdf6ec] px-5 py-3.5 sm:px-6">
        <p className="font-body text-[12px] font-semibold uppercase tracking-[0.08em] text-[#a08a78]">
          Section {index + 1}
        </p>
        <h3
          id={`section-${section.id}`}
          className="font-display text-[17px] font-bold text-[#1c0e04]"
        >
          {section.title}
        </h3>
      </div>

      {section.lessons.length > 0 && (
        <ol className="divide-y divide-[#efe2d0]">
          {section.lessons.map((lesson, i) => (
            <LessonRow
              key={lesson.id}
              number={i + 1}
              lesson={lesson}
              progress={uploads[lesson.id]}
              onUpload={(file) => onUpload(lesson.id, file)}
            />
          ))}
        </ol>
      )}

      <div className="px-5 py-4 sm:px-6">
        {adding ? (
          <LessonForm
            sectionId={section.id}
            onCancel={
              section.lessons.length ? () => setAdding(false) : undefined
            }
            onAdded={(lesson, file) => {
              onChange((all) =>
                all.map((s) =>
                  s.id === section.id
                    ? { ...s, lessons: [...s.lessons, lesson] }
                    : s
                )
              );
              setAdding(false);
              if (file) onUpload(lesson.id, file);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={secondaryButton}
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
            Add lesson
          </button>
        )}
      </div>
    </section>
  );
}

function LessonRow({
  number,
  lesson,
  progress,
  onUpload,
}: {
  number: number;
  lesson: DraftLesson;
  progress?: number | 'error';
  onUpload: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const Icon = lesson.type === 'VIDEO' ? Video : FileText;
  const uploading = typeof progress === 'number';

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 sm:px-6">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbebe2] text-brand"
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-[15px] font-semibold text-[#1c0e04]">
          {number}. {lesson.title}
        </p>
        <p className="font-body text-[13px] text-[#7a6655]">
          {lesson.type === 'VIDEO' ? 'Video' : 'Text'}
          {lesson.seconds > 0 && ` · ${formatLength(lesson.seconds)}`}
          {lesson.isPreview && (
            <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-[#e6f0ea] px-2 py-0.5 text-[12px] font-semibold text-[#0d5c3a]">
              Free preview
            </span>
          )}
        </p>
      </div>

      {/* On phones the video status gets its own line under the title so the title keeps its width. */}
      {lesson.type === 'VIDEO' && (
        <div className="basis-full pl-[52px] sm:basis-auto sm:pl-0">
          {uploading ? (
            <div
              className="sm:w-44"
              role="status"
              aria-label={`Uploading video, ${Math.round(progress * 100)}%`}
            >
              <div className="h-2 overflow-hidden rounded-full bg-[#f3e6d6]">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-[width]"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-right font-body text-[12px] text-[#7a6655]">
                Uploading… {Math.round(progress * 100)}%
              </p>
            </div>
          ) : lesson.video === 'none' ? (
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'font-body text-[13px]',
                  progress === 'error' ? 'text-red-600' : 'text-[#a86f00]'
                )}
              >
                {progress === 'error' ? 'Upload failed' : 'No video yet'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(secondaryButton, 'h-9 px-3')}
              >
                <Upload
                  className="h-4 w-4"
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                {progress === 'error' ? 'Try again' : 'Upload video'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) onUpload(file);
                }}
              />
            </div>
          ) : (
            <span className="flex items-center gap-1 font-body text-[13px] font-semibold text-[#0d5c3a]">
              <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
              Video added
            </span>
          )}
        </div>
      )}
    </li>
  );
}

function LessonForm({
  sectionId,
  onAdded,
  onCancel,
}: {
  sectionId: string;
  onAdded: (lesson: DraftLesson, file?: File) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] =
    useState<Extract<LessonType, 'VIDEO' | 'TEXT'>>('VIDEO');
  const [source, setSource] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [minutes, setMinutes] = useState('');
  const [fileSeconds, setFileSeconds] = useState(0);
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function chooseFile(next: File | undefined) {
    setFile(next ?? null);
    setFileSeconds(next ? await videoFileDuration(next) : 0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setProblem('Give the lesson a title.');
    if (
      type === 'VIDEO' &&
      source === 'link' &&
      link.trim() &&
      !/^https?:\/\//.test(link.trim())
    )
      return setProblem('The video link should start with https://');
    if (type === 'TEXT' && !content.trim())
      return setProblem('Write the lesson text.');
    setSaving(true);
    setProblem(null);
    const videoLink = type === 'VIDEO' && source === 'link' ? link.trim() : '';
    const seconds =
      type !== 'VIDEO'
        ? 0
        : source === 'file'
          ? fileSeconds
          : Math.round(Number(minutes || 0) * 60);
    try {
      const lesson = await courseBuilderApi.addLesson(sectionId, {
        title: title.trim(),
        type,
        videoUrl: videoLink || undefined,
        videoDuration: seconds || undefined,
        content: type === 'TEXT' ? content.trim() : undefined,
        isPreview,
      });
      onAdded(
        {
          id: lesson.id,
          title: lesson.title,
          type,
          seconds,
          isPreview,
          video: videoLink ? 'link' : 'none',
        },
        type === 'VIDEO' && source === 'file' ? (file ?? undefined) : undefined
      );
    } catch (err) {
      setProblem(builderErrorText(err));
      setSaving(false);
    }
  }

  const id = (name: string) => `${sectionId}-${name}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#efe2d0] bg-[#fdf9f3] p-4 sm:p-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label htmlFor={id('title')} className={labelClass}>
            Lesson title
          </label>
          <input
            id={id('title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="e.g. What is a product manager?"
            className={inputClass}
          />
        </div>
        <div>
          <span className={labelClass} id={id('type-label')}>
            Type
          </span>
          <div
            className="mt-2 flex h-11 rounded-xl border border-[#e8d5bb] bg-[#fdf6ec] p-1"
            role="radiogroup"
            aria-labelledby={id('type-label')}
          >
            {(
              [
                ['VIDEO', 'Video', Video],
                ['TEXT', 'Text', FileText],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={type === value}
                onClick={() => setType(value)}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 font-body text-[14px] font-semibold transition-colors',
                  type === value
                    ? 'bg-white text-[#1c0e04] shadow-sm'
                    : 'text-[#7a6655] hover:text-[#1c0e04]'
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {type === 'VIDEO' ? (
        <fieldset className="mt-4">
          <legend className={labelClass}>Video</legend>
          <div className="mt-2 flex gap-4 font-body text-[14px] text-[#3d2b1f]">
            {(
              [
                ['file', 'Upload a file'],
                ['link', 'Paste a link'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name={id('source')}
                  checked={source === value}
                  onChange={() => setSource(value)}
                  className="h-4 w-4 accent-[#c1440e]"
                />
                {label}
              </label>
            ))}
          </div>
          {source === 'file' ? (
            <div className="mt-3">
              <label htmlFor={id('file')} className="sr-only">
                Video file
              </label>
              <input
                id={id('file')}
                type="file"
                accept="video/*"
                onChange={(e) => chooseFile(e.target.files?.[0])}
                className="block w-full cursor-pointer font-body text-[14px] text-[#3d2b1f] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#fbebe2] file:px-4 file:py-2 file:font-semibold file:text-brand"
              />
              <p className={hintClass}>
                {file
                  ? `${file.name}${fileSeconds ? ` · ${formatLength(fileSeconds)}` : ''}`
                  : 'MP4 works everywhere. It uploads once the lesson is added; you can also add the video later.'}
              </p>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
              <div>
                <label htmlFor={id('link')} className="sr-only">
                  Video link
                </label>
                <input
                  id={id('link')}
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://… (YouTube, Vimeo, Google Drive or an .mp4)"
                  className={cn(inputClass, 'mt-0')}
                />
              </div>
              <div>
                <label htmlFor={id('minutes')} className="sr-only">
                  Length in minutes
                </label>
                <input
                  id={id('minutes')}
                  inputMode="decimal"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(e.target.value.replace(/[^\d.]/g, ''))
                  }
                  placeholder="Minutes"
                  className={cn(inputClass, 'mt-0')}
                />
              </div>
            </div>
          )}
        </fieldset>
      ) : (
        <div className="mt-4">
          <label htmlFor={id('content')} className={labelClass}>
            Lesson text
          </label>
          <textarea
            id={id('content')}
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the lesson. Learners read this in the course player."
            className={cn(inputClass, 'h-auto py-3')}
          />
        </div>
      )}

      <label className="mt-4 flex cursor-pointer items-center gap-2.5 font-body text-[14px] text-[#3d2b1f]">
        <input
          type="checkbox"
          checked={isPreview}
          onChange={(e) => setIsPreview(e.target.checked)}
          className="h-4 w-4 accent-[#c1440e]"
        />
        Free preview: anyone can watch this lesson before enrolling
      </label>

      {problem && (
        <div className="mt-4">
          <FormError message={problem} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className={cn(
            primaryButton,
            'cursor-pointer disabled:cursor-not-allowed disabled:opacity-70'
          )}
        >
          {saving ? 'Adding…' : 'Add lesson'}
        </button>
      </div>
    </form>
  );
}
