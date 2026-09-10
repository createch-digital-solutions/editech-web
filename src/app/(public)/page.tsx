import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { StripeDivider } from '@/components/landing/stripe-divider';
import { FeaturesSection } from '@/components/landing/features-section';
import { StatsBar } from '@/components/landing/stats-bar';
import { ShowcaseGrid } from '@/components/landing/showcase-grid';
import { PopularCourses } from '@/components/landing/popular-courses';
import { CtaBanner } from '@/components/landing/cta-banner';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <StripeDivider />
      <FeaturesSection />
      <StatsBar />
      <ShowcaseGrid />
      <PopularCourses />
      <CtaBanner />
      <Footer />
    </main>
  );
}
