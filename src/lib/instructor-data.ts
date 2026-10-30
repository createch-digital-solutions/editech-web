/**
 * Sample instructor data for the studio pages (dashboard, revenue, payouts). The API has no
 * earnings or payout endpoints yet, so every figure here is derived from these few records and
 * the pages stay consistent with each other: available balance = total earned − paid out −
 * under review − processing.
 */

/** Instructor's share of every sale; the platform keeps the rest. */
export const INSTRUCTOR_SHARE = 0.7;
export const MIN_WITHDRAWAL = 10_000;

export type StudioCourseStatus = 'Live' | 'Draft';

export interface StudioCourse {
  slug: string;
  title: string;
  status: StudioCourseStatus;
  /** In NGN. */
  price: number;
  rating?: number;
  /** New paying students per month for the last 12 months, oldest first; the last is this month. */
  monthlyStudents: number[];
}

export const SAMPLE_INSTRUCTOR = { firstName: 'Kofi', lastName: 'Mensah', completionRate: 68, completionTrend: 5 };

export const STUDIO_COURSES: StudioCourse[] = [
  { slug: 'react-for-beginners', title: 'React for Beginners', status: 'Live', price: 15_000, rating: 4.8, monthlyStudents: [3, 4, 4, 5, 5, 6, 7, 6, 8, 6, 7, 9] },
  { slug: 'nodejs-bootcamp', title: 'Node.js Bootcamp', status: 'Live', price: 18_000, rating: 4.7, monthlyStudents: [2, 2, 3, 3, 3, 4, 4, 4, 5, 4, 5, 6] },
  { slug: 'typescript-pro', title: 'TypeScript Pro', status: 'Live', price: 12_000, rating: 4.9, monthlyStudents: [0, 0, 0, 1, 1, 2, 2, 2, 3, 2, 3, 4] },
  { slug: 'advanced-hooks', title: 'Advanced Hooks', status: 'Draft', price: 20_000, monthlyStudents: Array(12).fill(0) },
];

export type PayoutStatus = 'Successful' | 'Processing' | 'Failed' | 'Pending';

export interface Payout {
  reference: string;
  /** ISO date. */
  date: string;
  amount: number;
  bank: string;
  last4: string;
  status: PayoutStatus;
}

/** Newest first. "Pending" is waiting for admin review; a failed amount goes back to the balance. */
export const PAYOUTS: Payout[] = [
  { reference: 'PAY-2026-0015', date: '2026-07-28', amount: 142_500, bank: 'GTBank', last4: '4821', status: 'Pending' },
  { reference: 'PAY-2026-0014', date: '2026-07-20', amount: 142_500, bank: 'GTBank', last4: '4821', status: 'Successful' },
  { reference: 'PAY-2026-0013', date: '2026-06-28', amount: 98_000, bank: 'GTBank', last4: '4821', status: 'Successful' },
  { reference: 'PAY-2026-0012', date: '2026-06-15', amount: 75_250, bank: 'GTBank', last4: '4821', status: 'Processing' },
  { reference: 'PAY-2026-0011', date: '2026-05-30', amount: 88_000, bank: 'GTBank', last4: '4821', status: 'Successful' },
  { reference: 'PAY-2026-0010', date: '2026-05-12', amount: 54_000, bank: 'Zenith', last4: '9910', status: 'Failed' },
  { reference: 'PAY-2026-0009', date: '2026-04-28', amount: 67_500, bank: 'GTBank', last4: '4821', status: 'Successful' },
];

export const PAYOUT_ACCOUNT = { bank: 'GTBank', type: 'Savings Account', holder: 'Kofi Mensah', last4: '4821' };

/** "₦1,470,000". */
export const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Gross sales per month (all courses), oldest first. */
export const monthlyGross = STUDIO_COURSES[0].monthlyStudents.map((_, i) => sum(STUDIO_COURSES.map((c) => c.monthlyStudents[i] * c.price)));

/** The last 12 month initials, ending with this month ("N D J … O"). */
export function monthLabels(now = new Date()) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { short: d.toLocaleString('en-GB', { month: 'narrow' }), long: d.toLocaleString('en-GB', { month: 'long', year: 'numeric' }) };
  });
}

/** Students, gross and share of one course over the last `months` months (12 = all time). */
export function courseTotals(course: StudioCourse, months: number) {
  const students = sum(course.monthlyStudents.slice(-months));
  const gross = students * course.price;
  return { students, gross, share: gross * INSTRUCTOR_SHARE };
}

const payoutTotal = (status: PayoutStatus) => sum(PAYOUTS.filter((p) => p.status === status).map((p) => p.amount));

export const totalEarned = sum(monthlyGross) * INSTRUCTOR_SHARE;
export const paidOut = payoutTotal('Successful');
export const underReview = payoutTotal('Pending');
export const processing = payoutTotal('Processing');
export const availableBalance = totalEarned - paidOut - underReview - processing;

/** How much of the available balance came from each live course, split by what each has earned. */
export function availableByCourse() {
  const live = STUDIO_COURSES.filter((c) => c.status === 'Live').map((c) => ({ course: c, earned: courseTotals(c, 12).share }));
  const earned = sum(live.map((l) => l.earned));
  let left = availableBalance;
  return live.map(({ course, earned: e }, i) => {
    const share = i === live.length - 1 ? left : Math.round((availableBalance * e) / earned);
    left -= share;
    return { course, share, gross: share / INSTRUCTOR_SHARE };
  });
}

/** Percentage change, rounded; null when there is nothing to compare with. */
export function percentChange(now: number, before: number) {
  return before > 0 ? Math.round(((now - before) / before) * 100) : null;
}

/** "Jul 20, 2026". */
export const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
