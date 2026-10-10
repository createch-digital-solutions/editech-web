'use client';

import { ChangeEvent, FormEvent, Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Bell, BookOpen, CreditCard, Lock, Pencil, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormError } from '@/components/auth/form-controls';
import { LearnerAvatar } from '@/components/learner/app-header';
import { SAMPLE_LEARNER } from '@/lib/learner-data';

const SECTIONS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'learning', label: 'Learning Prefs', icon: BookOpen },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const inputClass =
  'mt-[13px] h-16 w-full rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-[22px] font-body text-[20px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none read-only:text-[#3d2b1f]';

function Field({ id, label, ...props }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block font-body text-[18px] font-semibold leading-6 text-[#3d2b1f]">
        {label}
      </label>
      <input id={id} className={inputClass} {...props} />
    </div>
  );
}

/** Account: the learner's name and photo (saved to Clerk); email and username shown read-only. */
function AccountSection() {
  const { user, isLoaded } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  // Edits in progress; null = show what is saved on the account.
  const [firstNameDraft, setFirstName] = useState<string | null>(null);
  const [lastNameDraft, setLastName] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const original = {
    firstName: user?.firstName ?? (isLoaded && !user ? SAMPLE_LEARNER.firstName : ''),
    lastName: user?.lastName ?? (isLoaded && !user ? SAMPLE_LEARNER.lastName : ''),
  };
  const firstName = firstNameDraft ?? original.firstName;
  const lastName = lastNameDraft ?? original.lastName;
  const email = user?.primaryEmailAddress?.emailAddress ?? SAMPLE_LEARNER.email;
  const username = user?.username ?? SAMPLE_LEARNER.username;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!changed) {
      setStatus({ kind: 'ok', text: 'Nothing to save — your details are up to date.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setFirstName(null);
      setLastName(null);
      setStatus({ kind: 'ok', text: 'Your changes have been saved.' });
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'We could not save your changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ kind: 'error', text: 'Please choose a photo under 10 MB.' });
      return;
    }
    setStatus(null);
    try {
      await user.setProfileImage({ file });
      setStatus({ kind: 'ok', text: 'Your photo has been updated.' });
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'We could not upload that photo.' });
    }
  }

  const changed = firstName.trim() !== original.firstName || lastName.trim() !== original.lastName;

  return (
    <form onSubmit={handleSave} className="mt-[33px] rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 pb-[36px] pt-[44px] sm:px-[37px]">
      <h2 className="font-display text-[21px] font-bold leading-7 text-[#1c0e04]">Profile Information</h2>

      <div className="mt-[33px] flex items-center gap-6">
        <div className="relative h-[98px] w-[98px] shrink-0">
          <LearnerAvatar className="h-full w-full" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change photo"
            className="absolute -bottom-[2px] -right-[2px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-2 border-[#fffdf9] bg-brand-gradient text-white"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="min-w-0">
          <p className="truncate font-body text-[24px] font-bold leading-8 text-[#1c0e04]">
            {[original.firstName, original.lastName].filter(Boolean).join(' ') || 'Your name'}
          </p>
          <p className="truncate text-[19px] leading-7 text-[#7a6655]">{email}</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="cursor-pointer text-[19px] leading-7 text-brand hover:text-brand-light">
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      <div className="mt-[33px] grid gap-x-[22px] gap-y-[22px] sm:grid-cols-2">
        <Field id="first-name" label="First Name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Field id="last-name" label="Last Name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Field id="email" label="Email" type="email" value={email} readOnly aria-describedby="email-note" />
        <Field id="username" label="Username" value={`@${username}`} readOnly />
      </div>
      <p id="email-note" className="sr-only">
        Your email is used to sign in and cannot be changed here yet.
      </p>

      {status && (
        <div className="mt-6">
          {status.kind === 'error' ? (
            <FormError message={status.text} />
          ) : (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
              {status.text}
            </p>
          )}
        </div>
      )}

      <div className="mt-[30px] flex gap-[15px]">
        <button
          type="submit"
          disabled={saving || !user}
          className="flex h-[58px] cursor-pointer items-center justify-center rounded-xl bg-brand-gradient px-[31px] font-body text-[20px] font-bold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => {
            setFirstName(null);
            setLastName(null);
            setStatus(null);
          }}
          className="flex h-[58px] cursor-pointer items-center justify-center rounded-xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-[25px] font-body text-[20px] font-semibold text-[#3d2b1f] transition-colors hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="mt-[33px] rounded-3xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 py-12 text-center sm:px-[37px]">
      <h2 className="font-display text-[21px] font-bold text-[#1c0e04]">{label}</h2>
      <p className="mx-auto mt-2 max-w-md text-base text-[#7a6655]">These settings are on their way. For now you can update your profile under Account.</p>
    </div>
  );
}

function SettingsContent() {
  const params = useSearchParams();
  const requested = params.get('section');
  const active: SectionId = SECTIONS.some((s) => s.id === requested) ? (requested as SectionId) : 'account';
  const current = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-[#e8d5bb] bg-[#fffdf9] px-4 py-6 sm:px-6 lg:w-[336px] lg:border-b-0 lg:border-r lg:px-[18px] lg:pt-[37px]">
        <h1 className="font-display text-[23px] font-bold leading-8 text-[#1c0e04] lg:pl-[13px]">Settings</h1>
        <nav className="mt-6 flex gap-1 overflow-x-auto lg:mt-[33px] lg:block lg:space-y-1" aria-label="Settings">
          {SECTIONS.map((s) => {
            const isActive = s.id === active;
            return (
              <Link
                key={s.id}
                href={s.id === 'account' ? '/settings' : `/settings?section=${s.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-[57px] shrink-0 items-center gap-[15px] whitespace-nowrap rounded-xl px-[22px] font-body text-[21px] transition-colors',
                  isActive ? 'border-l-[3px] border-brand bg-[#fdeee4] pl-[19px] font-semibold text-brand' : 'text-[#5a4636] hover:bg-[#fdf6ec]'
                )}
              >
                <s.icon className={cn('h-5 w-5', isActive ? 'text-brand' : 'text-[#7a6655]')} strokeWidth={1.8} aria-hidden="true" />
                {s.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-12 pt-8 sm:px-6 lg:pl-[57px] lg:pr-[56px] lg:pt-[48px]">
        <div className="max-w-[784px]">
          <h2 className="font-display text-[29px] font-extrabold leading-9 text-[#1c0e04]">{current.label === 'Account' ? 'Account Settings' : current.label}</h2>
          {active === 'account' ? <AccountSection /> : <ComingSoon label={current.label} />}
        </div>
      </main>
    </div>
  );
}

/** /settings — account details (designed) and, as they arrive, notification, privacy, billing and learning settings. */
export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <SettingsContent />
    </Suspense>
  );
}
