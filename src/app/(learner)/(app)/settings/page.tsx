'use client';

import { ChangeEvent, FormEvent, Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Bell, BookOpen, CreditCard, Lock, Pencil, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormError } from '@/components/auth/form-controls';
import { LearnerAvatar } from '@/components/learner/app-header';

// `short` labels the five tabs that share a phone's width.
const SECTIONS = [
  { id: 'account', label: 'Account', short: 'Account', icon: User, about: '' },
  { id: 'notifications', label: 'Notifications', short: 'Alerts', icon: Bell, about: 'Choose which emails and reminders you get about your courses and your streak.' },
  { id: 'privacy', label: 'Privacy', short: 'Privacy', icon: Lock, about: 'Control what other learners can see about you and manage your data.' },
  { id: 'billing', label: 'Billing', short: 'Billing', icon: CreditCard, about: 'See your payments and receipts for the courses you have bought.' },
  { id: 'learning', label: 'Learning Prefs', short: 'Learning', icon: BookOpen, about: 'Set your daily goal, your reminder time and the topics you want to learn.' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const inputClass =
  // Read-only fields look locked (shaded, no orange focus border), so they don't seem broken when tapped.
  'mt-2 h-12 w-full rounded-xl border-2 border-[#efe2d0] bg-[#fffdf9] px-4 font-body text-[16px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-brand focus:outline-none read-only:cursor-default read-only:bg-[#f6efe5] read-only:text-[#7a6655] read-only:focus:border-[#efe2d0] lg:mt-[13px] lg:h-16 lg:px-[22px] lg:text-[20px]';

/** A labelled text field; `note` is shown under it (and read out with it). */
function Field({ id, label, note, ...props }: { id: string; label: string; note?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block font-body text-[14px] font-semibold leading-5 text-[#3d2b1f] lg:text-[18px] lg:leading-6">
        {label}
      </label>
      <input id={id} className={inputClass} aria-describedby={note ? `${id}-note` : undefined} {...props} />
      {note && (
        <p id={`${id}-note`} className="mt-1.5 font-body text-[13px] text-[#a08a78] lg:text-[16px]">
          {note}
        </p>
      )}
    </div>
  );
}

/** Account: the learner's name and photo (saved to Clerk); email and username shown read-only. */
function AccountSection() {
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  // Edits in progress; null = show what is saved on the account.
  const [firstNameDraft, setFirstName] = useState<string | null>(null);
  const [lastNameDraft, setLastName] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const original = { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' };
  const firstName = firstNameDraft ?? original.firstName;
  const lastName = lastNameDraft ?? original.lastName;
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const username = user?.username ?? '';

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
    <form onSubmit={handleSave} className="mt-5 rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-4 pb-6 pt-6 sm:px-[37px] lg:mt-[33px] lg:rounded-3xl lg:pb-[36px] lg:pt-[44px]">
      <h2 className="type-card-title text-[#1c0e04]">Profile Information</h2>

      <div className="mt-5 flex items-center gap-4 lg:mt-[33px] lg:gap-6">
        <div className="relative h-16 w-16 shrink-0 lg:h-[98px] lg:w-[98px]">
          <LearnerAvatar className="h-full w-full" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change photo"
            className="absolute -bottom-[2px] -right-[2px] flex h-7 w-7 cursor-pointer lg:h-[34px] lg:w-[34px] items-center justify-center rounded-full border-2 border-[#fffdf9] bg-brand-gradient text-white"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="min-w-0">
          <p className="type-card-title truncate text-[#1c0e04]">
            {[original.firstName, original.lastName].filter(Boolean).join(' ') || 'Your name'}
          </p>
          <p className="truncate text-[14px] leading-5 text-[#7a6655] lg:text-[19px] lg:leading-7">{email}</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="cursor-pointer text-[14px] leading-6 text-brand hover:text-brand-light lg:text-[19px] lg:leading-7">
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:mt-[33px] lg:gap-x-[22px] lg:gap-y-[22px]">
        <Field id="first-name" label="First Name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Field id="last-name" label="Last Name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Field id="email" label="Email" type="email" value={email} readOnly note="Used to sign in. It can't be changed here yet." />
        {/* Usernames are switched off in Clerk, so there is nothing to set yet. */}
        <Field id="username" label="Username" value={username ? `@${username}` : ''} placeholder="Not available yet" readOnly note={username ? undefined : 'Usernames are coming soon.'} />
      </div>

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

      <div className="mt-6 flex gap-3 lg:mt-[30px] lg:gap-[15px]">
        <button
          type="submit"
          disabled={saving || !user}
          className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-brand-gradient px-5 font-body text-[15px] font-bold lg:h-[58px] lg:px-[31px] lg:text-[20px] text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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
          className="flex h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-[#efe2d0] bg-[#fdf6ec] px-4 font-body text-[15px] font-semibold lg:h-[58px] lg:px-[25px] lg:text-[20px] text-[#3d2b1f] transition-colors hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/** A section whose settings aren't built yet: what it will hold, and the way back to Account. */
function ComingSoon({ section }: { section: (typeof SECTIONS)[number] }) {
  const Icon = section.icon;
  return (
    <div className="mt-5 flex flex-col items-center rounded-2xl border-2 border-[#efe2d0] bg-[#fffdf9] px-5 py-9 text-center sm:px-[37px] lg:mt-[33px] lg:rounded-3xl lg:py-14">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fbebe2] text-brand lg:h-16 lg:w-16" aria-hidden="true">
        <Icon className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={1.8} />
      </span>
      <span className="mt-4 rounded-full border border-[#d4920a]/25 bg-[#fdf5e1] px-3 py-1 text-[12px] font-bold text-[#a86f00] lg:text-[14px]">Coming soon</span>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-6 text-[#5a4636] lg:text-[18px] lg:leading-7">{section.about}</p>
      <Link href="/settings" className="mt-5 text-[15px] font-semibold text-brand hover:text-brand-light lg:text-[18px]">
        Edit your profile under Account →
      </Link>
    </div>
  );
}

function SettingsContent() {
  const params = useSearchParams();
  const requested = params.get('section');
  const active: SectionId = SECTIONS.some((s) => s.id === requested) ? (requested as SectionId) : 'account';
  const current = SECTIONS.find((s) => s.id === active)!;

  const hrefOf = (id: SectionId) => (id === 'account' ? '/settings' : `/settings?section=${id}`);

  return (
    // Sections are tabs under the heading, so the menu rail stays the only sidebar.
    <div className="learner-compact flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-12 pt-5 sm:px-6 lg:px-[48px] lg:pt-[44px]">
        <h1 className="type-page-title text-[#1c0e04]">Settings</h1>
        {/* Phones: all five tabs in one fixed row (icon over a short label). Wider screens: the tabs in a line. */}
        <nav className="mt-5 grid grid-cols-5 border-b border-[#e8dccb] sm:flex sm:gap-1 lg:mt-7 lg:gap-2" aria-label="Settings">
          {SECTIONS.map((s) => {
            const isActive = s.id === active;
            return (
              <Link
                key={s.id}
                href={hrefOf(s.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  '-mb-px flex h-[60px] min-w-0 flex-col items-center justify-center gap-1 border-b-[3px] px-1 font-body text-[12px] transition-colors sm:h-11 sm:shrink-0 sm:flex-row sm:gap-2 sm:whitespace-nowrap sm:px-3 sm:text-[14px] lg:h-[58px] lg:gap-3 lg:px-5 lg:text-[19px]',
                  isActive ? 'border-brand font-semibold text-brand' : 'border-transparent text-[#5a4636] hover:text-brand'
                )}
              >
                <s.icon className="h-5 w-5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" strokeWidth={1.8} aria-hidden="true" />
                <span className="max-w-full truncate sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 max-w-[860px] lg:mt-10">
          <h2 className="type-section-title text-[#1c0e04]">{current.label === 'Account' ? 'Account Settings' : current.label}</h2>
          {active === 'account' ? <AccountSection /> : <ComingSoon section={current} />}
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
