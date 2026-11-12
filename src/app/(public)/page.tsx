import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { StripeDivider } from '@/components/landing/stripe-divider';
import { FeaturesSection } from '@/components/landing/features-section';
import { StatsBar } from '@/components/landing/stats-bar';
import { ShowcaseGrid } from '@/components/landing/showcase-grid';
import { PopularCourses } from '@/components/landing/popular-courses';
import { getPopular } from '@/lib/courses-api';
import { CtaBanner } from '@/components/landing/cta-banner';
import { Footer } from '@/components/landing/footer';

export default async function HomePage() {
  const popular = await getPopular();
  return (
    // Cream behind the sections too, so no hairline of white shows where two cream sections meet.
    <main className="flex-1 bg-[#fdf6ec] font-body">
      <Navbar />
      <Hero />
      <StripeDivider />
      <FeaturesSection />
      <StatsBar />
      <ShowcaseGrid />
      <PopularCourses courses={popular} />
      <CtaBanner />
      <Footer />
    </main>
  );
}
