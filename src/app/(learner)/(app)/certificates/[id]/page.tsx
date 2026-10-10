import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SAMPLE_CERTIFICATE } from '@/lib/learner-data';
import { CertificateView } from './certificate-view';

export const metadata: Metadata = { title: 'Certificate Earned — Createch Elevate' };

/**
 * /certificates/[id] — a certificate of completion.
 * TODO: Load it from the certificates module (GET /certificates/{id}) once it exists.
 */
export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id.toUpperCase() !== SAMPLE_CERTIFICATE.id) notFound();
  return <CertificateView certificate={SAMPLE_CERTIFICATE} />;
}
