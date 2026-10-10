import type { Metadata } from 'next';
import { getCatalogue } from '@/lib/courses-api';
import { CatalogueView } from './catalogue-view';

export const metadata: Metadata = {
  title: 'Course Catalogue — Createch Elevate',
  description: 'Browse courses in web development, AI, data science, design, DevOps and business, taught by African instructors.',
};

/** /courses — the public course catalogue (GET /courses, or the sample courses until some are published). */
export default async function CataloguePage() {
  const catalogue = await getCatalogue();
  return <CatalogueView catalogue={catalogue} />;
}
