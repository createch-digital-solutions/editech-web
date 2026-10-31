import { API_BASE_URL } from '@/lib/api-client';
import { clock, formatDuration, type CourseBadge, type CourseDetail, type CourseLevel, type CourseSummary, type Lesson } from '@/lib/learner-data';

/** On the server, call the API directly rather than through the local /backend forwarding. */
const SERVER_API_BASE_URL = process.env.API_PROXY_TARGET
  ? `${process.env.API_PROXY_TARGET.replace(/\/$/, '')}/api/v1`
  : API_BASE_URL;

const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

/** Shown for a course whose thumbnail the site cannot load. */
export const COURSE_PLACEHOLDER_IMAGE = '/learner/course-placeholder.svg';

/**
 * Published courses for the catalogue, course, player and checkout pages, read on the server (no
 * browser CORS restriction). Nothing here invents content: when the API has no data, or cannot be
 * reached, callers get empty lists or null and show an empty state.
 */

type ApiRecord = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : undefined);

/**
 * Full links, or paths to images this site ships in public/learner/. Other seed paths such as
 * "/courses/x-thumb.jpg" or "/avatars/kofi.jpg" exist on neither this site nor the API.
 */
const imageUrl = (v: unknown) => {
  const s = str(v);
  return s && /^(https?:\/\/|\/learner\/)/.test(s) ? s : undefined;
};

/** "2.3k" from 2300. */
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n));

const slugify = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function instructorName(c: ApiRecord) {
  const i = c.instructor as ApiRecord | undefined;
  const user = (i?.user as ApiRecord | undefined) ?? i;
  const full = [str(user?.firstName), str(user?.lastName)].filter(Boolean).join(' ');
  return full || str(user?.name) || 'Instructor';
}

function toSummary(c: ApiRecord): CourseSummary | null {
  const slug = str(c.slug);
  const title = str(c.title);
  if (!slug || !title) return null;
  const price = num(c.price) ?? 0;
  const level = str(c.level)?.toUpperCase() as CourseLevel | undefined;
  return {
    id: str(c.id) ?? slug,
    slug,
    title,
    instructor: instructorName(c),
    rating: num(c.averageRating) ?? 0,
    students: compact(num(c.enrolmentCount) ?? 0),
    price,
    image: imageUrl(c.thumbnailUrl) ?? COURSE_PLACEHOLDER_IMAGE,
    imageAlt: `Cover image for ${title}`,
    badge: (str(c.badge) as CourseBadge | undefined) ?? (price === 0 || c.isFree === true ? 'Free' : undefined),
    category: slugify(str(c.category) ?? ''),
    level: level && LEVELS.includes(level) ? level : undefined,
    description: str(c.shortDescription) ?? str(c.description),
    createdAt: str(c.publishedAt) ?? str(c.createdAt),
    lessons: num(c.totalLessons),
    durationMinutes: num(c.totalDuration),
  };
}

const toSummaries = (list: unknown) => (Array.isArray(list) ? list : []).map((c) => toSummary(c as ApiRecord)).filter((c): c is CourseSummary => !!c);

/** GET a public endpoint and unwrap `data`. With a token the result is the viewer's own, so it is not cached. */
async function getJson(path: string, token?: string | null): Promise<unknown> {
  const res = await fetch(`${SERVER_API_BASE_URL}${path}`, {
    ...(token ? { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as const } : { next: { revalidate: 60 } }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw Object.assign(new Error(`GET ${path} → ${res.status}`), { status: res.status });
  const body = (await res.json()) as { data?: unknown };
  return body?.data ?? body;
}

export interface Catalogue {
  courses: CourseSummary[];
  categories: { slug: string; label: string; count: number }[];
  total: number;
  /** True when the API could not be reached (as opposed to having no courses). */
  unavailable: boolean;
}

export async function getCatalogue(): Promise<Catalogue> {
  try {
    const [list, cats] = await Promise.all([getJson('/courses?limit=60'), getJson('/courses/categories').catch(() => [])]);
    const courses = toSummaries(list);
    const categories = (Array.isArray(cats) ? cats : [])
      .map((c) => {
        const r = c as ApiRecord;
        const label = str(r.name) ?? str(r.label);
        return label ? { slug: slugify(label), label, count: num(r.courseCount) ?? num(r.count) ?? 0 } : null;
      })
      .filter((c): c is { slug: string; label: string; count: number } => !!c);
    return { courses, categories, total: courses.length, unavailable: false };
  } catch {
    return { courses: [], categories: [], total: 0, unavailable: true };
  }
}

/** The most-enrolled courses (GET /courses sorted by enrolments), for the landing page; empty on error. */
export async function getPopular(limit = 4): Promise<CourseSummary[]> {
  try {
    return toSummaries(await getJson(`/courses?sort=enrolment_count&order=desc&limit=${limit}`));
  } catch {
    return [];
  }
}

/** GET /courses/featured — the dashboard's recommendations; empty on error. */
export async function getFeatured(): Promise<CourseSummary[]> {
  try {
    return toSummaries(await getJson('/courses/featured'));
  } catch {
    return [];
  }
}

function toDetail(c: ApiRecord): CourseDetail | null {
  const summary = toSummary(c);
  if (!summary) return null;
  const sections = (Array.isArray(c.curriculum) ? c.curriculum : []) as ApiRecord[];
  const curriculum = sections.map((s, si) => {
    const lessons: Lesson[] = ((Array.isArray(s.lessons) ? s.lessons : []) as ApiRecord[]).map((l, li) => {
      const seconds = num(l.duration) ?? 0;
      return {
        id: str(l.id) ?? `${si}-${li}`,
        title: str(l.title) ?? `Lesson ${li + 1}`,
        duration: clock(seconds),
        seconds,
        preview: l.isPreview === true,
        locked: l.isLocked === true,
      };
    });
    const minutes = Math.round(lessons.reduce((t, l) => t + l.seconds, 0) / 60);
    return {
      title: str(s.title) ?? `Section ${si + 1}`,
      summary: `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'} · ${formatDuration(minutes)}`,
      lessons,
    };
  });
  const instructor = (c.instructor ?? {}) as ApiRecord;
  const instructorStudents = num(instructor.totalStudents);
  const enrolment = c.learnerEnrolment as ApiRecord | null | undefined;
  return {
    ...summary,
    fullTitle: summary.title,
    description: str(c.description) ?? '',
    level: summary.level ?? 'BEGINNER',
    ratingsCount: (num(c.reviewCount) ?? 0).toLocaleString('en-NG'),
    studentsCount: (num(c.enrolmentCount) ?? 0).toLocaleString('en-NG'),
    duration: summary.durationMinutes ? formatDuration(summary.durationMinutes) : '',
    updated: '',
    instructorTitle: instructorStudents !== undefined ? `${instructorStudents.toLocaleString('en-NG')} students` : 'Instructor',
    instructorBio: str(instructor.bio) ?? '',
    instructorRating: num(instructor.averageRating) ?? summary.rating,
    instructorImage: imageUrl(instructor.avatarUrl),
    outcomes: [],
    curriculum,
    enrolment: enrolment ? { status: str(enrolment.status) ?? 'ACTIVE', progress: num(enrolment.progress) ?? 0, enrolledAt: str(enrolment.enrolledAt) } : undefined,
  };
}

/** Written reviews of a course (GET /courses/{id}/reviews); empty when there are none or on error. */
export async function getReviews(courseId: string): Promise<{ id: string; name: string; rating: number; text: string }[]> {
  try {
    const list = await getJson(`/courses/${encodeURIComponent(courseId)}/reviews?limit=10`);
    return ((Array.isArray(list) ? list : []) as ApiRecord[]).map((r, i) => {
      const learner = r.learner as ApiRecord | undefined;
      return {
        id: str(r.id) ?? String(i),
        name: str(learner?.name) ?? 'Learner',
        rating: num(r.rating) ?? 0,
        text: str(r.reviewText) ?? '',
      };
    });
  } catch {
    return [];
  }
}

/**
 * A published course by slug (GET /courses/{slug}); null when it does not exist or the API cannot be
 * reached. Pass the viewer's Clerk token to get their enrolment and unlocked lessons.
 */
export async function getCourse(slug: string, token?: string | null): Promise<CourseDetail | null> {
  try {
    const [detail, list] = await Promise.all([getJson(`/courses/${encodeURIComponent(slug)}`, token) as Promise<ApiRecord>, getJson('/courses?limit=60').catch(() => [])]);
    // The detail response has no thumbnail; the (cached) course list does.
    const listed = (Array.isArray(list) ? list : []).find((c) => (c as ApiRecord).slug === slug) as ApiRecord | undefined;
    return toDetail({ thumbnailUrl: listed?.thumbnailUrl, ...detail });
  } catch {
    return null;
  }
}

/** Video links of a course's free preview lessons (GET /courses/{slug}/preview), by lesson id. */
export async function getPreviewVideos(slug: string): Promise<Record<string, string>> {
  try {
    const data = (await getJson(`/courses/${encodeURIComponent(slug)}/preview`)) as ApiRecord;
    const videos: Record<string, string> = {};
    for (const s of (Array.isArray(data.previewSections) ? data.previewSections : []) as ApiRecord[]) {
      for (const l of (Array.isArray(s.lessons) ? s.lessons : []) as ApiRecord[]) {
        const id = str(l.id);
        const url = str(l.videoUrl);
        if (id && url && /^https?:\/\//.test(url)) videos[id] = url;
      }
    }
    return videos;
  } catch {
    return {};
  }
}
