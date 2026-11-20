'use client';

import { useState } from 'react';
import { FileText, ListChecks, Sparkles, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormError } from '@/components/auth/form-controls';
import { primaryButton } from '@/components/instructor/studio-parts';
import { builderErrorText, courseBuilderApi } from '@/lib/course-builder-api';
import type { CourseOutlineSuggestion } from '@/types/instructor';
import { canAdd, hintClass, inputClass, labelClass, secondaryButton, type DetailsForm, type DraftLesson, type DraftSection, type OutlineSection } from './draft';

/**
 * SCRUM-42 — on the Details step of a new course: the instructor describes the course and the AI
 * (POST /ai/course-scaffold) suggests its details and curriculum. The details fill the form below for
 * them to check; the curriculum waits on the next step for them to review (OutlineReview).
 */
export function AiDraftPanel({ form, onSuggestion }: { form: DetailsForm; onSuggestion: (s: CourseOutlineSuggestion) => void }) {
  const [prompt, setPrompt] = useState('');
  const [working, setWorking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function generate() {
    if (prompt.trim().length < 10) return setProblem('Describe the course in a sentence or two (at least 10 characters).');
    setWorking(true);
    setProblem(null);
    try {
      const suggestion = await courseBuilderApi.generateOutline({
        prompt: prompt.trim(),
        level: form.level || undefined,
        outcomeTag: form.outcomeTag || undefined,
        category: form.category || undefined,
      });
      onSuggestion(suggestion);
      setDone(true);
    } catch (err) {
      setProblem(builderErrorText(err));
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#e8d5bb] bg-[linear-gradient(135deg,#fffaf3,#fdf1e6)] p-5 sm:p-6" aria-labelledby="ai-draft-title">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white" aria-hidden="true">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 id="ai-draft-title" className="font-display text-[18px] font-bold text-[#1c0e04]">
            Draft it with AI
          </h2>
          <p className="mt-0.5 font-body text-[14px] text-[#7a6655]">Describe your course and get a title, description and a full outline of sections and lessons to start from.</p>
        </div>
      </div>

      <label htmlFor="ai-prompt" className={cn(labelClass, 'mt-4')}>
        What is your course about?
      </label>
      <textarea
        id="ai-prompt"
        rows={3}
        maxLength={600}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Build and deploy full-stack apps with React and Node.js, for beginners who know some HTML"
        className={cn(inputClass, 'h-auto py-3')}
      />
      <p className={hintClass}>Who it&apos;s for, what they&apos;ll learn and what they can do at the end. Level, goal and category below are used if you&apos;ve chosen them.</p>

      {problem && (
        <div className="mt-4">
          <FormError message={problem} />
        </div>
      )}
      {done && !working && !problem && (
        <p className="mt-4 rounded-xl bg-[#e6f0ea] px-4 py-3 font-body text-[14px] text-[#0d5c3a]" role="status">
          Done. The details below are filled in. Check and change them, then continue: you&apos;ll review the suggested sections and lessons on the next step.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={generate} disabled={working} className={cn(primaryButton, 'h-11 cursor-pointer disabled:cursor-wait disabled:opacity-70')}>
          <Sparkles className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          {working ? 'Drafting your course…' : done ? 'Try again' : 'Generate outline'}
        </button>
        {working && (
          <span className="font-body text-[13px] text-[#7a6655]" role="status">
            This can take up to 30 seconds.
          </span>
        )}
      </div>
    </section>
  );
}

const typeIcon = { VIDEO: Video, TEXT: FileText, QUIZ: ListChecks };
const typeLabel = { VIDEO: 'Video', TEXT: 'Reading', QUIZ: 'Quiz' };

/**
 * SCRUM-47 — at the top of the Curriculum step: the AI's suggested sections and lessons, for the
 * instructor to keep or drop and rename before anything is saved. "Add to course" creates the kept ones
 * (POST /instructor/courses/:id/sections, then /instructor/sections/:id/lessons) in order: video lessons
 * without a video yet, reading lessons with the AI's summary as their text. If a call fails, what was
 * added stays added and the rest waits here to try again.
 */
export function OutlineReview({
  courseId,
  outline,
  onOutlineChange,
  onSectionsChange,
}: {
  courseId: string;
  outline: OutlineSection[];
  onOutlineChange: (outline: OutlineSection[] | undefined) => void;
  onSectionsChange: (update: (sections: DraftSection[]) => DraftSection[]) => void;
}) {
  const [adding, setAdding] = useState<{ done: number; total: number } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const kept = outline.filter((s) => s.keep && s.title.trim()).flatMap((s) => s.lessons.filter((l) => l.keep && canAdd(l) && l.title.trim()));
  const quizzes = outline.flatMap((s) => s.lessons).filter((l) => !canAdd(l)).length;

  const editSection = (key: string, change: Partial<OutlineSection>) => onOutlineChange(outline.map((s) => (s.key === key ? { ...s, ...change } : s)));
  const editLesson = (sectionKey: string, lessonKey: string, change: Partial<OutlineSection['lessons'][number]>) =>
    onOutlineChange(outline.map((s) => (s.key === sectionKey ? { ...s, lessons: s.lessons.map((l) => (l.key === lessonKey ? { ...l, ...change } : l)) } : s)));

  async function addToCourse() {
    setProblem(null);
    setAdding({ done: 0, total: kept.length });
    let remaining = outline.map((s) => ({ ...s, lessons: [...s.lessons] }));
    let done = 0;
    try {
      for (const section of outline) {
        const lessons = section.lessons.filter((l) => l.keep && canAdd(l) && l.title.trim());
        if (!section.keep || !section.title.trim() || lessons.length === 0) continue;

        let sectionId = section.createdId;
        if (!sectionId) {
          const created = await courseBuilderApi.addSection(courseId, section.title.trim());
          sectionId = created.id;
          const draftSection: DraftSection = { id: created.id, title: created.title, lessons: [] };
          onSectionsChange((all) => [...all, draftSection]);
          remaining = remaining.map((s) => (s.key === section.key ? { ...s, createdId: created.id } : s));
        }

        for (const lesson of lessons) {
          const type = lesson.type === 'TEXT' ? 'TEXT' : 'VIDEO';
          const created = await courseBuilderApi.addLesson(sectionId, {
            title: lesson.title.trim(),
            type,
            content: type === 'TEXT' ? lesson.summary : undefined,
          });
          const draftLesson: DraftLesson = { id: created.id, title: created.title, type, seconds: 0, isPreview: false, video: 'none' };
          onSectionsChange((all) => all.map((s) => (s.id === sectionId ? { ...s, lessons: [...s.lessons, draftLesson] } : s)));
          remaining = remaining.map((s) => (s.key === section.key ? { ...s, lessons: s.lessons.filter((l) => l.key !== lesson.key) } : s));
          done += 1;
          setAdding({ done, total: kept.length });
        }
      }
      onOutlineChange(undefined);
    } catch (err) {
      // Keep only what still has to be added, so trying again doesn't duplicate anything.
      onOutlineChange(remaining.filter((s) => s.lessons.some((l) => l.keep && canAdd(l))));
      setProblem(`${builderErrorText(err)} ${done ? `${done} ${done === 1 ? 'lesson was' : 'lessons were'} added; the rest are still here.` : ''}`.trim());
    } finally {
      setAdding(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[#e8d5bb] bg-[#fffdf9] shadow-sm" aria-labelledby="outline-title">
      <div className="flex flex-wrap items-start gap-3 border-b border-[#efe2d0] p-5 sm:p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white" aria-hidden="true">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="outline-title" className="type-section-title text-[#1c0e04]">
            Review the AI outline
          </h2>
          <p className="mt-1 font-body text-[14px] text-[#7a6655]">
            Untick anything you don&apos;t want and rename what you like. Nothing is added to your course until you choose <strong>Add to course</strong>.
          </p>
        </div>
      </div>

      <ol className="divide-y divide-[#efe2d0]">
        {outline.map((section, i) => (
          <li key={section.key} className={cn('p-5 sm:px-6', !section.keep && 'bg-[#fdf9f3]')}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={section.keep}
                disabled={!!section.createdId || !!adding}
                onChange={(e) => editSection(section.key, { keep: e.target.checked })}
                aria-label={`Keep section ${i + 1}`}
                className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#c1440e]"
              />
              <label className="sr-only" htmlFor={`outline-${section.key}`}>
                Section {i + 1} title
              </label>
              <input
                id={`outline-${section.key}`}
                value={section.title}
                disabled={!section.keep || !!section.createdId || !!adding}
                onChange={(e) => editSection(section.key, { title: e.target.value })}
                className={cn(inputClass, 'mt-0 h-10 font-semibold disabled:text-[#a89282]')}
              />
            </div>

            {section.keep && (
              <ul className="mt-3 space-y-2 pl-[30px]">
                {section.lessons.map((lesson, j) => {
                  const Icon = typeIcon[lesson.type] ?? Video;
                  const addable = canAdd(lesson);
                  return (
                    <li key={lesson.key} className={cn('rounded-xl border border-[#efe2d0] bg-white px-3 py-2.5', (!lesson.keep || !addable) && 'opacity-60')}>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={lesson.keep && addable}
                          disabled={!addable || !!adding}
                          onChange={(e) => editLesson(section.key, lesson.key, { keep: e.target.checked })}
                          aria-label={`Keep lesson ${j + 1} of section ${i + 1}`}
                          className="h-4 w-4 shrink-0 cursor-pointer accent-[#c1440e] disabled:cursor-not-allowed"
                        />
                        <Icon className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} aria-hidden="true" />
                        <label className="sr-only" htmlFor={`outline-${lesson.key}`}>
                          Lesson {j + 1} title
                        </label>
                        <input
                          id={`outline-${lesson.key}`}
                          value={lesson.title}
                          disabled={!lesson.keep || !addable || !!adding}
                          onChange={(e) => editLesson(section.key, lesson.key, { title: e.target.value })}
                          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 font-body text-[14px] font-semibold text-[#1c0e04] focus:bg-[#fdf6ec] focus:outline-none disabled:text-[#7a6655]"
                        />
                        <span className="hidden shrink-0 font-body text-[12px] text-[#a08a78] sm:inline">
                          {typeLabel[lesson.type] ?? lesson.type} · ~{lesson.minutes} min
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 pl-[54px] font-body text-[13px] leading-5 text-[#7a6655]">
                        {addable ? lesson.summary : 'Quizzes can be saved once the quiz feature is ready.'}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <div className="border-t border-[#efe2d0] p-5 sm:p-6">
        {problem && (
          <div className="mb-4">
            <FormError message={problem} />
          </div>
        )}
        {quizzes > 0 && <p className="mb-4 font-body text-[13px] text-[#a08a78]">{quizzes === 1 ? '1 suggested quiz is' : `${quizzes} suggested quizzes are`} shown for reference only.</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => onOutlineChange(undefined)} disabled={!!adding} className={secondaryButton}>
            Discard outline
          </button>
          <button type="button" onClick={addToCourse} disabled={!!adding || kept.length === 0} className={cn(primaryButton, 'h-11 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60')}>
            {adding ? `Adding ${adding.done + 1 > adding.total ? adding.total : adding.done + 1} of ${adding.total}…` : `Add ${kept.length} ${kept.length === 1 ? 'lesson' : 'lessons'} to course`}
          </button>
        </div>
      </div>
    </section>
  );
}
