'use client';

import { Fragment, Suspense, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CircleCheck, CircleX, Eye, Pencil, RotateCcw, Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card, primaryButton, td, th } from '@/components/instructor/studio-parts';
import { chip, Pill, SampleDataNote } from '@/components/admin/admin-parts';
import { ADMIN_USERS, type AdminUser } from '@/lib/admin-data';

const FILTERS = [
  { id: 'all', label: 'All Users', match: () => true },
  { id: 'learners', label: 'Learners', match: (u: AdminUser) => u.role === 'Learner' },
  { id: 'instructors', label: 'Instructors', match: (u: AdminUser) => u.role === 'Instructor' },
  { id: 'admins', label: 'Admins', match: (u: AdminUser) => u.role === 'Admin' },
  { id: 'suspended', label: 'Suspended', match: (u: AdminUser) => u.status === 'Suspended' },
  { id: 'pending', label: 'Awaiting Approval', match: (u: AdminUser) => u.status === 'Pending' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

const iconButton = 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#7a6655] transition-colors hover:bg-[#fdf6ec] hover:text-[#1c0e04]';

const joinedLabel = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

function UserAvatar({ user }: { user: AdminUser }) {
  if (user.avatar) return <Image src={user.avatar} alt="" width={80} height={80} className="h-10 w-10 shrink-0 rounded-full object-cover" />;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecedf3] font-display text-[15px] font-bold text-[#1e2a78]" aria-hidden="true">
      {user.name.charAt(0)}
    </span>
  );
}

function UsersTable() {
  const initial = useSearchParams().get('filter');
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [filter, setFilter] = useState<FilterId>(FILTERS.some((f) => f.id === initial) ? (initial as FilterId) : 'all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const match = FILTERS.find((f) => f.id === filter)!.match;
  const q = query.trim().toLowerCase();
  const rows = users.filter((u) => match(u) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  const pending = users.filter((u) => u.status === 'Pending').length;

  const setStatus = (id: string, status: AdminUser['status']) => setUsers((all) => all.map((u) => (u.id === id ? { ...u, status } : u)));
  const reject = (id: string) => setUsers((all) => all.filter((u) => u.id !== id));

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="type-page-title text-[#1c0e04]">User Management</h1>
          <SampleDataNote />
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <label className="relative min-w-0 flex-1 sm:w-[300px] sm:flex-none">
            <span className="sr-only">Search users</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#a89282]" strokeWidth={1.9} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="h-11 w-full rounded-xl border border-[#e8d5bb] bg-[#fffdf9] pl-10 pr-3 font-body text-[15px] text-[#1c0e04] placeholder:text-[#a89282] focus:border-[#1e2a78]/50 focus:outline-none"
            />
          </label>
          <button type="button" disabled title="Adding users is coming soon" className={cn(primaryButton, 'h-11 cursor-not-allowed opacity-60')}>
            <UserPlus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Add User
          </button>
        </div>
      </div>

      <div role="group" aria-label="Filter users" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={chip(filter === f.id)}>
            {f.label}
            {f.id === 'pending' && pending > 0 && <span className={cn('ml-1.5 rounded-full px-1.5 text-[12px] font-bold', filter === f.id ? 'bg-white/20' : 'bg-[#fdf5e1] text-[#a86f00]')}>{pending}</span>}
          </button>
        ))}
      </div>

      <section className={cn(card, 'mt-5 overflow-hidden')} aria-label="Users">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-[#efe2d0] bg-[#fdf6ec]">
              <tr>
                <th scope="col" className={th}>User</th>
                <th scope="col" className={th}>Email</th>
                <th scope="col" className={th}>Role</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Joined</th>
                <th scope="col" className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe2d0]">
              {rows.map((u) => (
                <Fragment key={u.id}>
                  <tr>
                    <th scope="row" className={cn(td, 'text-left')}>
                      <span className="flex items-center gap-3 font-display text-[15px] font-bold text-[#1c0e04]">
                        <UserAvatar user={u} />
                        {u.name}
                      </span>
                    </th>
                    <td className={cn(td, 'text-[#7a6655]')}>{u.email}</td>
                    <td className={td}>
                      <Pill value={u.role} />
                    </td>
                    <td className={td}>
                      <Pill value={u.status} />
                    </td>
                    <td className={cn(td, 'text-[#7a6655]')}>{joinedLabel(u.joined)}</td>
                    <td className={td}>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setOpenId(openId === u.id ? null : u.id)} aria-expanded={openId === u.id} aria-label={`Details for ${u.name}`} className={iconButton}>
                          <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                        </button>
                        {u.status === 'Pending' ? (
                          <>
                            <button type="button" onClick={() => setStatus(u.id, 'Active')} aria-label={`Approve ${u.name}`} title="Approve" className={cn(iconButton, 'text-[#0d5c3a] hover:bg-[#e6f0ea] hover:text-[#0d5c3a]')}>
                              <CircleCheck className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => reject(u.id)} aria-label={`Reject ${u.name}`} title="Reject" className={cn(iconButton, 'text-[#b42318] hover:bg-[#fdecea] hover:text-[#b42318]')}>
                              <CircleX className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" disabled title="Editing users is coming soon" aria-label={`Edit ${u.name} (coming soon)`} className={cn(iconButton, 'cursor-not-allowed opacity-50 hover:bg-transparent')}>
                              <Pencil className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                            </button>
                            {u.status === 'Suspended' ? (
                              <button type="button" onClick={() => setStatus(u.id, 'Active')} aria-label={`Reactivate ${u.name}`} title="Reactivate" className={iconButton}>
                                <RotateCcw className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                              </button>
                            ) : (
                              <button type="button" onClick={() => setStatus(u.id, 'Suspended')} aria-label={`Suspend ${u.name}`} title="Suspend" className={cn(iconButton, 'hover:bg-[#fdecea] hover:text-[#b42318]')}>
                                <CircleX className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {openId === u.id && (
                    <tr className="bg-[#fdf9f3]">
                      <td colSpan={6} className="px-5 pb-5 pt-1 font-body text-[14px] leading-6 text-[#3d2b1f]">
                        {u.role === 'Instructor' ? (
                          <>
                            <p>
                              <strong>Teaches:</strong> {u.expertise ?? '—'}
                            </p>
                            <p className="mt-1 max-w-[720px] text-[#7a6655]">{u.bio ?? 'No bio yet.'}</p>
                          </>
                        ) : u.role === 'Learner' ? (
                          <p>
                            <strong>Enrolled in:</strong> {u.enrolments ?? 0} {u.enrolments === 1 ? 'course' : 'courses'}
                          </p>
                        ) : (
                          <p>Platform administrator.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className={cn(td, 'py-10 text-center text-[#7a6655]')}>
                    No users match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/** /admin/users — every account with search, role and status filters; approve instructor applications, suspend or reactivate. */
export default function UserManagementPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-12 pt-7 sm:px-6 lg:px-10 lg:pt-9">
      <Suspense>
        <UsersTable />
      </Suspense>
    </main>
  );
}
