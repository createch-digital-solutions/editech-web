import { getCatalogue, getFeatured } from '@/lib/courses-api';
import { DashboardView } from './dashboard-view';

/**
 * /dashboard — the learner's home. Recommendations come from the whole catalogue, ranked by what the
 * learner picked in onboarding; the featured courses (GET /courses/featured) are the fallback.
 */
export default async function LearnerDashboardPage() {
  const [featured, catalogue] = await Promise.all([getFeatured(), getCatalogue()]);
  return <DashboardView recommended={featured} catalogue={catalogue.courses} />;
}
