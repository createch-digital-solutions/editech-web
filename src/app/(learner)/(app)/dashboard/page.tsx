import { getFeatured } from '@/lib/courses-api';
import { DashboardView } from './dashboard-view';

/** /dashboard — the learner's home, with the featured courses (GET /courses/featured) as recommendations. */
export default async function LearnerDashboardPage() {
  return <DashboardView recommended={await getFeatured()} />;
}
