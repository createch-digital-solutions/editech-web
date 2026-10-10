'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { useSignOut } from '@/hooks/auth';
import { useApiClient } from '@/hooks/use-api-client';
import { queryKeys } from '@/lib/query-keys';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FormError, SubmitButton, TextField } from '@/components/auth/form-controls';

/**
 * /portal/onboarding — the instructor application (profileStatus PENDING_ONBOARDING): bio, areas of
 * expertise and, optionally, bank details for payouts. Sent to POST /onboarding/instructor, after which
 * the instructor waits for review on /portal/pending-approval.
 */
export default function InstructorOnboardingPage() {
  const router = useRouter();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const { signOut } = useSignOut();

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
    <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between border-b pb-6 border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold">Instructor Onboarding & Setup</h1>
          <p className="text-gray-500 text-sm">
            Tell us about yourself to apply — an administrator reviews every instructor before courses can be published.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your instructor profile</CardTitle>
          <CardDescription>
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}! This is what learners and our review team will see.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <SubmitButton loading={isSubmitting} loadingText="Sending application..." disabled={!bio.trim()} arrow>
              Submit application
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
