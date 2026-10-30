import { API_BASE_URL } from '@/lib/api-client';
import {
  CATEGORIES,
  SAMPLE_COURSES,
  sampleCourseDetail,
  type CourseBadge,
  type CourseDetail,
  type CourseLevel,
  type CourseSummary,
} from '@/lib/learner-data';

/** On the server, call the API directly rather than through the local /backend forwarding. */
const SERVER_API_BASE_URL = process.env.API_PROXY_TARGET
  ? `${process.env.API_PROXY_TARGET.replace(/\/$/, '')}/api/v1`
  : API_BASE_URL;

const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

/**
 * Published courses for the catalogue and course pages, read on the server (public endpoints, so no
 * token, and no browser CORS restriction). While the API has no published courses — or cannot be
 * reached — the sample courses from the designs are shown instead, flagged with `isSample`.
 */

type ApiRecord = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : undefined);

/**
 * Full links, or paths to images this site ships in public/learner/. Other seed paths such as
 * "/courses/x-thumb.jpg" exist on neither this site nor the API, so those fall back.
 */
const imageUrl = (v: unknown) => {
  const s = str(v);
  return s && /^(https?:\/\/|\/learner\/)/.test(s) ? s : undefined;
};

/** "2.3k" from 2300. */
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n));

function instructorName(c: ApiRecord) {
  const i = (c.instructor ?? (c.instructorProfile as ApiRecord | undefined)?.user) as ApiRecord | undefined;
  const user = (i?.user as ApiRecord | undefined) ?? i;
  const full = [str(user?.firstName), str(user?.lastName)].filter(Boolean).join(' ');
  return full || str(user?.name) || str(c.instructorName) || 'Createch instructor';
}

function toSummary(c: ApiRecord): CourseSummary | null {
  const slug = str(c.slug);
  const title = str(c.title);
  if (!slug || !title) return null;
  const price = num(c.price) ?? 0;
  const enrolments = num(c.enrolmentCount) ?? num(c.enrollmentCount) ?? num(c.studentsCount) ?? num((c._count as ApiRecord | undefined)?.enrolments) ?? 0;
  const badge = (str(c.badge) as CourseBadge | undefined) ?? (price === 0 ? 'Free' : c.isBestseller ? 'Bestseller' : undefined);
  const level = str(c.level)?.toUpperCase() as CourseLevel | undefined;
  return {
    id: str(c.id) ?? slug,
    slug,
    title,
    instructor: instructorName(c),
    rating: num(c.averageRating) ?? num(c.rating) ?? 0,
    students: compact(enrolments),
    price,
    image: imageUrl(c.thumbnailUrl) ?? '/learner/course-react.jpg',
    imageAlt: `Cover image for ${title}`,
    badge,
    category: (str(c.category) ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    level: level && LEVELS.includes(level) ? level : undefined,
    description: str(c.shortDescription) ?? str(c.subtitle) ?? str(c.description),
    createdAt: str(c.publishedAt) ?? str(c.createdAt),
    lessons: num(c.totalLessons),
    durationMinutes: num(c.totalDuration),
  };
}

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${SERVER_API_BASE_URL}${path}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw Object.assign(new Error(`GET ${path} → ${res.status}`), { status: res.status });
  const body = (await res.json()) as { data?: unknown };
  return body?.data ?? body;
}

export interface Catalogue {
  courses: CourseSummary[];
  categories: { slug: string; label: string; count: number }[];
  total: number;
  isSample: boolean;
}

export async function getCatalogue(): Promise<Catalogue> {
  try {
    const [list, cats] = await Promise.all([getJson('/courses?limit=60'), getJson('/courses/categories').catch(() => [])]);
    const courses = (Array.isArray(list) ? list : []).map((c) => toSummary(c as ApiRecord)).filter((c): c is CourseSummary => !!c);
    if (courses.length > 0) {
      const categories = (Array.isArray(cats) ? cats : [])
        .map((c) => {
          const r = c as ApiRecord;
          const label = str(r.name) ?? str(r.label) ?? str(r.category);
          return label ? { slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label, count: num(r.count) ?? num(r.courseCount) ?? 0 } : null;
        })
        .filter((c): c is { slug: string; label: string; count: number } => !!c);
      return { courses, categories, total: courses.length, isSample: false };
    }
  } catch {
    // Unreachable or not deployed yet: fall through to the sample catalogue.
  }
  const categories = CATEGORIES.map((c) => ({ ...c, count: SAMPLE_COURSES.filter((s) => s.category === c.slug).length }));
  return { courses: SAMPLE_COURSES, categories, total: SAMPLE_COURSES.length, isSample: true };
}

function toDetail(c: ApiRecord): CourseDetail | null {
  const summary = toSummary(c);
  if (!summary) return null;
  const sections = (Array.isArray(c.sections) ? c.sections : []) as ApiRecord[];
  const curriculum = sections.map((s, si) => {
    const lessons = ((Array.isArray(s.lessons) ? s.lessons : []) as ApiRecord[]).map((l, li) => {
      const secs = num(l.videoDuration) ?? 0;
      return { id: str(l.id) ?? `${si}-${li}`, title: str(l.title) ?? `Lesson ${li + 1}`, duration: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` };
    });
    const minutes = Math.round(((s.lessons as ApiRecord[] | undefined) ?? []).reduce((t, l) => t + (num(l.videoDuration) ?? 0), 0) / 60);
    return {
      title: str(s.title) ?? `Section ${si + 1}`,
      summary: `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'} · ${minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`}`,
      lessons,
    };
  });
  const level = (str(c.level) as CourseLevel | undefined) ?? 'BEGINNER';
  const enrolments = num(c.enrolmentCount) ?? num(c.enrollmentCount) ?? 0;
  return {
    ...summary,
    fullTitle: summary.title,
    description: str(c.description) ?? '',
    level,
    originalPrice: num(c.originalPrice),
    ratingsCount: (num(c.reviewCount) ?? num(c.ratingsCount) ?? 0).toLocaleString('en-NG'),
    studentsCount: enrolments.toLocaleString('en-NG'),
    duration: str(c.duration) ?? '',
    updated: c.updatedAt ? new Date(String(c.updatedAt)).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '',
    instructorTitle: str((c.instructor as ApiRecord | undefined)?.headline) ?? 'Instructor',
    instructorBio: str((c.instructor as ApiRecord | undefined)?.bio) ?? '',
    instructorRating: summary.rating,
    instructorImage: str((c.instructor as ApiRecord | undefined)?.avatarUrl) ?? '/learner/instructor-kofi.jpg',
    outcomes: (Array.isArray(c.tags) ? c.tags : []).filter((t): t is string => typeof t === 'string'),
    curriculum,
  };
}

/** Written reviews of a published course (GET /courses/{id}/reviews); empty when there are none or on error. */
export async function getReviews(courseId: string): Promise<{ id: string; name: string; rating: number; text: string }[]> {
  try {
    const data = await getJson(`/courses/${encodeURIComponent(courseId)}/reviews?limit=10`);
    const list = (Array.isArray(data) ? data : ((data as ApiRecord)?.reviews as unknown[] | undefined) ?? []) as ApiRecord[];
    return list.map((r, i) => {
      const user = r.user as ApiRecord | undefined;
      return {
        id: str(r.id) ?? String(i),
        name: [str(user?.firstName), str(user?.lastName)].filter(Boolean).join(' ') || 'Learner',
        rating: num(r.rating) ?? 0,
        text: str(r.reviewText) ?? str(r.text) ?? '',
      };
    });
  } catch {
    return [];
  }
}

/** A course by slug from the API, else the matching sample course; null when neither exists. */
export async function getCourse(slug: string): Promise<{ course: CourseDetail; isSample: boolean } | null> {
  try {
    const data = await getJson(`/courses/${encodeURIComponent(slug)}`);
    const course = toDetail(((data as ApiRecord)?.course as ApiRecord | undefined) ?? (data as ApiRecord));
    if (course) return { course, isSample: false };
  } catch {
    // 404 or unreachable: try the samples.
  }
  const sample = sampleCourseDetail(slug);
  return sample ? { course: sample, isSample: true } : null;
}
