import type { Metadata } from 'next';
import { AdminHeader } from '@/components/admin/admin-header';

export const metadata: Metadata = { title: 'Admin — Createch Elevate' };

/** Admin portal pages (overview, course reviews, users, analytics) under the admin top bar. Admins only (proxy.ts). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdf6ec] font-body">
      <AdminHeader />
      {children}
    </div>
  );
}
