import type { Metadata } from 'next';
import { getCatalogue } from '@/lib/courses-api';
import { CatalogueView } from './catalogue-view';

export const metadata: Metadata = {
  title: 'Course Catalogue — Createch Elevate',
  description: 'Browse courses in web development, AI, data science, design, DevOps and business, taught by African instructors.',
};

/** /courses — the public course catalogue (GET /courses and GET /courses/categories). */
export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [catalogue, { q = '' }] = await Promise.all([getCatalogue(), searchParams]);
  // The search comes from the top bar.
  return <CatalogueView catalogue={catalogue} initialQuery={q} />;
}
