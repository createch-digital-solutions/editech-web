/**
 * Sample data for the admin portal (overview, course reviews, users, analytics). The API has no admin
 * endpoints yet, so the pages run on these records; counts that appear on more than one page (pending
 * reviews, instructors awaiting approval) are derived from them so the pages agree with each other.
 */

export type AdminRole = 'Learner' | 'Instructor' | 'Admin';
export type AdminUserStatus = 'Active' | 'Suspended' | 'Pending';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  /** Pending = an instructor application waiting for approval. */
  status: AdminUserStatus;
  /** ISO date. */
  joined: string;
  avatar?: string;
  /** Instructors: what they teach and the bio from their application. */
  expertise?: string;
  bio?: string;
  /** Learners: courses they're enrolled in. */
  enrolments?: number;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 'u1', name: 'Adaeze Okafor', email: 'adaeze@gmail.com', role: 'Learner', status: 'Active', joined: '2026-01-12', avatar: '/learner/avatar-adaeze.jpg', enrolments: 4 },
  { id: 'u2', name: 'Kofi Mensah', email: 'kofi@inst.co', role: 'Instructor', status: 'Active', joined: '2026-02-03', avatar: '/learner/instructor-kofi.jpg', expertise: 'Web Development', bio: 'Senior React engineer, 8 years building for fintech teams in Accra and Lagos.' },
  { id: 'u3', name: 'Spam Account', email: 'spam123@x.co', role: 'Learner', status: 'Suspended', joined: '2026-03-21', enrolments: 0 },
  { id: 'u4', name: 'Amara Osei', email: 'amara@edu.ng', role: 'Instructor', status: 'Active', joined: '2026-04-09', expertise: 'TypeScript & Web3', bio: 'Lecturer and open-source maintainer teaching typed JavaScript and smart contracts.' },
  { id: 'u5', name: 'Bola James', email: 'bola@studio.ng', role: 'Instructor', status: 'Pending', joined: '2026-11-15', expertise: 'Mobile Development', bio: 'Flutter developer with 5 shipped apps; wants to teach cross-platform mobile from scratch.' },
  { id: 'u6', name: 'Zainab Musa', email: 'zainab@inst.co', role: 'Instructor', status: 'Pending', joined: '2026-11-17', expertise: 'Data Science', bio: 'Data analyst at a Lagos bank; teaches Python, pandas and dashboards on weekends.' },
  { id: 'u7', name: 'Chidi Eze', email: 'chidi@createch.ng', role: 'Instructor', status: 'Active', joined: '2026-05-02', expertise: 'UI/UX Design', bio: 'Product designer focused on design systems and Figma workflows.' },
  { id: 'u8', name: 'Tunde Bakare', email: 'tunde@createch.ng', role: 'Admin', status: 'Active', joined: '2026-01-05' },
  { id: 'u9', name: 'Ngozi Adeyemi', email: 'ngozi@gmail.com', role: 'Learner', status: 'Active', joined: '2026-06-18', enrolments: 2 },
  { id: 'u10', name: 'Kwame Asante', email: 'kwame@mail.com', role: 'Learner', status: 'Active', joined: '2026-08-30', enrolments: 1 },
];

export interface ChecklistItem {
  label: string;
  ok: boolean;
}

export interface ReviewCourse {
  id: string;
  title: string;
  instructor: string;
  /** New = first submission; Revised = sent back once and submitted again. */
  kind: 'New' | 'Revised';
  hoursAgo: number;
  lessons: number;
  /** Minutes. */
  duration: number;
  price: number;
  image: string;
  summary: string;
  checklist: ChecklistItem[];
}

const checklist = (quizzes = true, objectives = true): ChecklistItem[] => [
  { label: 'Video quality (720p+)', ok: true },
  { label: 'Complete curriculum', ok: true },
  { label: 'Accurate pricing', ok: true },
  { label: 'Original content', ok: true },
  { label: 'Quiz questions', ok: quizzes },
  { label: 'Learning objectives', ok: objectives },
];

export const REVIEW_QUEUE: ReviewCourse[] = [
  { id: 'c1', title: 'Advanced TypeScript Patterns', instructor: 'Amara Osei', kind: 'New', hoursAgo: 2, lessons: 24, duration: 510, price: 25_000, image: '/learner/course-react.jpg', summary: 'Generics, utility types, decorators, module augmentation', checklist: checklist(false) },
  { id: 'c2', title: 'Flutter Mobile Dev', instructor: 'Bola James', kind: 'New', hoursAgo: 4, lessons: 31, duration: 690, price: 30_000, image: '/learner/course-node.jpg', summary: 'Widgets, state management, Firebase and publishing to both app stores', checklist: checklist() },
  { id: 'c3', title: 'Data Viz with D3', instructor: 'Kofi Mensah', kind: 'Revised', hoursAgo: 26, lessons: 18, duration: 375, price: 18_000, image: '/learner/course-data-science.jpg', summary: 'Scales, axes, transitions and interactive dashboards with D3.js', checklist: checklist(true, false) },
  { id: 'c4', title: 'Web3 Fundamentals', instructor: 'Amara Osei', kind: 'New', hoursAgo: 30, lessons: 15, duration: 300, price: 0, image: '/learner/course-ai.png', summary: 'Wallets, smart contracts and dApps explained without the hype', checklist: checklist() },
  { id: 'c5', title: 'Motion for Product Designers', instructor: 'Chidi Eze', kind: 'Revised', hoursAgo: 52, lessons: 12, duration: 220, price: 12_000, image: '/learner/course-uiux.jpg', summary: 'Micro-interactions, easing and prototyping motion in Figma', checklist: checklist() },
];

/** "2h ago", "1d ago". */
export const ago = (hours: number) => (hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`);

/** "8h 30m" from minutes. */
export const length = (minutes: number) => (minutes >= 60 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m` : `${minutes}m`);

export const OVERVIEW = {
  totalUsers: 12_480,
  usersTrend: 14,
  activeCourses: 186,
  coursesTrend: 8,
  monthlyRevenue: 4_250_000,
  revenueTrend: 22,
  payoutRequests: 5,
  userReports: 3,
};

/** New sign-ups per month for the last 12 months, oldest first. */
export const MONTHLY_SIGNUPS = [410, 520, 495, 640, 610, 735, 790, 760, 880, 845, 960, 1_080];

export const TOP_CATEGORIES = [
  { label: 'Web Dev', percent: 34, bar: 'bg-brand-gradient', text: 'text-brand', track: 'bg-[#fbebe2]' },
  { label: 'AI & ML', percent: 22, bar: 'bg-[#1e2a78]', text: 'text-[#1e2a78]', track: 'bg-[#ecedf3]' },
  { label: 'Data Science', percent: 18, bar: 'bg-[#0d5c3a]', text: 'text-[#0d5c3a]', track: 'bg-[#e6f0ea]' },
  { label: 'UI/UX', percent: 14, bar: 'bg-[#d4920a]', text: 'text-[#d4920a]', track: 'bg-[#fbf3e0]' },
];

// --- Analytics -------------------------------------------------------------------------------------

export const RANGES = ['Today', '7 days', '30 days', '3 months'] as const;
export type Range = (typeof RANGES)[number];

/** A steady, repeatable wiggle so the sample charts look real without changing on every render. */
function series(length: number, base: number, swing: number, rise: number) {
  return Array.from({ length }, (_, i) => Math.round(base + rise * i + swing * Math.sin(i * 1.7) + (swing / 2) * Math.cos(i * 0.9)));
}

export interface RangeAnalytics {
  pageViews: number;
  pageViewsTrend: string;
  uniqueUsers: number;
  usersTrend: string;
  avgSession: string;
  sessionTrend: string;
  conversion: string;
  conversionTrend: string;
  chartTitle: string;
  active: number[];
  /** Under each bar: hours, days or weeks. */
  labels: string[];
}

const dayLabels = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  });

export const ANALYTICS: Record<Range, RangeAnalytics> = {
  Today: {
    pageViews: 6_240, pageViewsTrend: '+6%', uniqueUsers: 1_310, usersTrend: '+4%', avgSession: '11m', sessionTrend: '+1m', conversion: '3.1%', conversionTrend: '+0.2%',
    chartTitle: 'Active Users · by hour', active: series(24, 40, 25, 3), labels: Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`),
  },
  '7 days': {
    pageViews: 41_800, pageViewsTrend: '+11%', uniqueUsers: 6_920, usersTrend: '+9%', avgSession: '12m', sessionTrend: '+1m', conversion: '3.3%', conversionTrend: '+0.2%',
    chartTitle: 'Daily Active Users', active: series(7, 900, 140, 20), labels: dayLabels(7),
  },
  '30 days': {
    pageViews: 182_400, pageViewsTrend: '+18%', uniqueUsers: 24_650, usersTrend: '+14%', avgSession: '12m', sessionTrend: '+2m', conversion: '3.4%', conversionTrend: '+0.3%',
    chartTitle: 'Daily Active Users', active: series(30, 760, 130, 9), labels: dayLabels(30),
  },
  '3 months': {
    pageViews: 512_900, pageViewsTrend: '+24%', uniqueUsers: 58_300, usersTrend: '+19%', avgSession: '11m', sessionTrend: '+2m', conversion: '3.2%', conversionTrend: '+0.4%',
    chartTitle: 'Weekly Active Users', active: series(13, 4_100, 520, 120),
    labels: Array.from({ length: 13 }, (_, i) => `Wk ${i + 1}`),
  },
};

export const DEVICES = [
  { label: 'Desktop', percent: 54, bar: 'bg-[#1e2a78]', text: 'text-[#1e2a78]', track: 'bg-[#ecedf3]' },
  { label: 'Mobile', percent: 38, bar: 'bg-brand-gradient', text: 'text-brand', track: 'bg-[#fbebe2]' },
  { label: 'Tablet', percent: 8, bar: 'bg-[#0d5c3a]', text: 'text-[#0d5c3a]', track: 'bg-[#e6f0ea]' },
];

export const TRAFFIC_SOURCES = [
  { label: 'Organic Search', percent: 42 },
  { label: 'Direct', percent: 28 },
  { label: 'Social', percent: 18 },
  { label: 'Referral', percent: 12 },
];
