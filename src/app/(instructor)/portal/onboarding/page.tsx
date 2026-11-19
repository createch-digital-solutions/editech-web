'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { useApiClient } from '@/hooks/use-api-client';
import { queryKeys } from '@/lib/query-keys';
import { FormError, SubmitButton, TextField } from '@/components/auth/form-controls';
import { ApplicationHeader } from '@/components/instructor/application-header';

/**
 * /portal/onboarding — the instructor application (profileStatus PENDING_ONBOARDING): bio, areas of
 * expertise and, optionally, bank details for payouts. Sent to POST /onboarding/instructor, after which
 * the instructor waits for review on /portal/pending-approval. Always light, like the rest of the site.
 */
export default function InstructorOnboardingPage() {
  const router = useRouter();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payoutFields = [bankCode, accountNumber, accountName].map((v) => v.trim());
    const payoutStarted = payoutFields.some(Boolean);
    if (payoutStarted && !payoutFields.every(Boolean)) {
      setError('Fill in all three bank details, or leave them all empty and add them later.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/onboarding/instructor', {
        bio: bio.trim(),
        expertise: expertise
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        ...(payoutStarted && {
          payout: { bankCode: payoutFields[0], accountNumber: payoutFields[1], accountName: payoutFields[2] },
        }),
      });
      // GET /auth/me now reports PENDING_APPROVAL; the instructor layout keeps them on the waiting screen.
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      router.replace('/portal/pending-approval');
    } catch (err) {
      console.error('Failed to submit instructor application', err);
      setError('We could not send your application. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      <ApplicationHeader />
      <div className="flex flex-1 justify-center px-4 pb-12 pt-4 sm:px-6 sm:pt-8">
        <div className="w-full max-w-[600px]">
          <span className="inline-flex h-[26px] items-center rounded-full border border-[#c9c8ce] bg-[#ebe9ea] px-[13px] text-[11px] font-bold tracking-[0.02em] text-[#1b2b6b]">
            INSTRUCTOR APPLICATION
          </span>
          <h1 className="type-page-title mt-4 text-[#1c0e04]">Apply to teach on Createch Elevate</h1>
          <p className="type-body mt-2 text-[#7a6655]">Tell us about yourself. Our team reviews every instructor before their courses can go live.</p>

          <section className="mt-7 rounded-2xl border border-[#efe2d0] bg-[#fffdf9] p-5 shadow-sm sm:p-8" aria-labelledby="profile-title">
            <h2 id="profile-title" className="type-section-title text-[#1c0e04]">
              Your instructor profile
            </h2>
            <p className="type-small mt-1 text-[#7a6655]">
              Welcome{user?.firstName ? `, ${user.firstName}` : ''}! This is what learners and our review team will see.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="bio" className="block font-body text-sm font-semibold text-[#3d2b1f]">
                  Bio
                </label>
                <textarea
                  id="bio"
                  required
                  rows={5}
                  maxLength={2000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Your experience, credentials and what you would like to teach"
                  className="mt-2 w-full rounded-xl border border-[#e8d5bb] bg-[#fffdf9] px-4 py-3 font-body text-base text-[#1c0e04] placeholder:text-[#a89282] focus:border-2 focus:border-brand focus:px-[15px] focus:py-[11px] focus:outline-none"
                />
              </div>

              <TextField
                label="Areas of expertise (separate with commas)"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="Cloud Architecture, DevOps"
                size="md"
              />

              <fieldset className="space-y-3">
                <legend className="font-body text-sm font-semibold text-[#3d2b1f]">
                  Bank details for payouts <span className="font-normal text-[#7a6655]">(optional — you can add them later)</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField label="Bank code" value={bankCode} onChange={(e) => setBankCode(e.target.value)} placeholder="058" inputMode="numeric" size="md" />
                  <TextField label="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="0123456789" inputMode="numeric" size="md" />
                  <TextField label="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Jane Doe" size="md" />
                </div>
              </fieldset>

              {error && <FormError message={error} />}

              <SubmitButton loading={isSubmitting} loadingText="Sending application..." disabled={!bio.trim()} arrow className="h-12 text-[16px]">
                Submit application
              </SubmitButton>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
