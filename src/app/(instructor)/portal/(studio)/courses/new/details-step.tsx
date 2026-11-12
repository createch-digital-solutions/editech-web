'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormError } from '@/components/auth/form-controls';
import { card, primaryButton } from '@/components/instructor/studio-parts';
import { builderErrorText, courseBuilderApi } from '@/lib/course-builder-api';
import { CATEGORIES, hintClass, inputClass, labelClass, LEVELS, MIN_PRICE, OUTCOMES, toCourseInput, type DetailsForm, type Draft } from './draft';

/**
 * Step 1: what the course is. Saving creates the draft course (POST /instructor/courses) or, once it
 * exists, updates it (PATCH /instructor/courses/:id), then moves on to the curriculum.
 */
export function DetailsStep({ draft, onSaved }: { draft: Draft; onSaved: (next: Pick<Draft, 'courseId' | 'slug' | 'details'>) => void }) {
  const [form, setForm] = useState<DetailsForm>(draft.details);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const set = <K extends keyof DetailsForm>(key: K, value: DetailsForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const price = Number(form.price.replace(/[^\d]/g, ''));
  const priceProblem = !form.free && form.price !== '' && price < MIN_PRICE ? `The price must be at least ₦${MIN_PRICE.toLocaleString('en-NG')}.` : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setProblem('Give your course a title.');
    if (!form.free && !price) return setProblem('Set a price, or make the course free.');
    if (priceProblem) return setProblem(priceProblem);
    setSaving(true);
    setProblem(null);
    try {
      const input = toCourseInput(form);
      const saved = draft.courseId ? await courseBuilderApi.updateCourse(draft.courseId, input) : await courseBuilderApi.createCourse(input);
      onSaved({ courseId: saved.id ?? draft.courseId, slug: saved.slug ?? draft.slug, details: form });
    } catch (err) {
      setProblem(builderErrorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn(card, 'p-5 sm:p-7')} noValidate>
      <h2 className="type-section-title text-[#1c0e04]">Course details</h2>
      <p className="mt-1 font-body text-[14px] text-[#7a6655]">What learners see on the catalogue and the course page. You can change these later.</p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="course-title" className={labelClass}>
            Title
          </label>
          <input id="course-title" required maxLength={120} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Product Management Fundamentals" className={inputClass} />
        </div>

        <div>
          <label htmlFor="course-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="course-description"
            rows={4}
            maxLength={2000}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What will learners be able to do by the end?"
            className={cn(inputClass, 'h-auto py-3')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="course-category" className={labelClass}>
              Category
            </label>
            <select id="course-category" value={form.category} onChange={(e) => set('category', e.target.value)} className={cn(inputClass, 'cursor-pointer')}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course-level" className={labelClass}>
              Level
            </label>
            <select id="course-level" value={form.level} onChange={(e) => set('level', e.target.value as DetailsForm['level'])} className={cn(inputClass, 'cursor-pointer')}>
              <option value="">Choose a level</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course-outcome" className={labelClass}>
              Helps learners
            </label>
            <select id="course-outcome" value={form.outcomeTag} onChange={(e) => set('outcomeTag', e.target.value as DetailsForm['outcomeTag'])} className={cn(inputClass, 'cursor-pointer')}>
              <option value="">Choose a goal</option>
              {OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className={labelClass}>Price</legend>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl border border-[#e8d5bb] bg-[#fdf6ec] p-1" role="radiogroup" aria-label="Free or paid">
              {[
                { free: false, label: 'Paid' },
                { free: true, label: 'Free' },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={form.free === o.free}
                  onClick={() => set('free', o.free)}
                  className={cn(
                    'h-9 cursor-pointer rounded-lg px-4 font-body text-[14px] font-semibold transition-colors',
                    form.free === o.free ? 'bg-white text-[#1c0e04] shadow-sm' : 'text-[#7a6655] hover:text-[#1c0e04]'
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {!form.free && (
              <div className="relative w-44">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-body text-[15px] text-[#7a6655]">₦</span>
                <label htmlFor="course-price" className="sr-only">
                  Price in naira
                </label>
                <input
                  id="course-price"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="15000"
                  aria-invalid={!!priceProblem}
                  className={cn(inputClass, 'mt-0 pl-8', priceProblem && 'border-red-400')}
                />
              </div>
            )}
          </div>
          <p className={cn(hintClass, priceProblem && 'text-red-600')}>{priceProblem ?? `Paid courses cost at least ₦${MIN_PRICE.toLocaleString('en-NG')}.`}</p>
        </fieldset>

        <div>
          <label htmlFor="course-cover" className={labelClass}>
            Cover image link
          </label>
          <input id="course-cover" type="url" value={form.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} placeholder="https://…/cover.jpg" className={inputClass} />
          <p className={hintClass}>A link to a landscape image (16:9 works best). You need one before you can submit for review.</p>
        </div>

        <div>
          <label htmlFor="course-tags" className={labelClass}>
            Tags
          </label>
          <input id="course-tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Agile, Roadmapping" className={inputClass} />
          <p className={hintClass}>Separate with commas. They help learners find your course.</p>
        </div>
      </div>

      {problem && (
        <div className="mt-6">
          <FormError message={problem} />
        </div>
      )}

      <div className="mt-7 flex justify-end">
        <button type="submit" disabled={saving} className={cn(primaryButton, 'h-11 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70')}>
          {saving ? 'Saving…' : draft.courseId ? 'Save and continue' : 'Create draft and continue'}
          {!saving && <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
