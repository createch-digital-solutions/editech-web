import type { Metadata } from 'next';
import { Award } from 'lucide-react';
import { EmptyPage } from '@/components/learner/empty-page';

export const metadata: Metadata = { title: 'Certificate — Createch Elevate' };

/**
 * /certificates/[id] — a certificate of completion.
 * TODO: Load it from the certificates module (GET /certificates/{id}) once it exists and render it with CertificateView.
 */
export default function CertificatePage() {
  return (
    <EmptyPage
      icon={<Award className="h-9 w-9" strokeWidth={1.8} />}
      title="Certificate not found"
      message="Certificates are issued when you finish a course. Yours will be listed under Achievements."
      action={{ href: '/dashboard/achievements', label: 'Go to Achievements' }}
    />
  );
}
