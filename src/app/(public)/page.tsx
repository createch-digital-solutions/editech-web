import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full">
      <header className="w-full flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-800 mb-12">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Createch
          </h1>
          <p className="text-sm text-gray-500">AI-Powered Learning Marketplace</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button variant="outline">Learner Portal</Button>
          </Link>
          <Link href="/portal">
            <Button variant="outline">Instructor Portal</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Admin</Button>
          </Link>
        </div>
      </header>

      <section className="text-center space-y-6 max-w-2xl my-auto">
        <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
          Foundation Scaffold
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Welcome to Createch Learning Platform
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          AI-powered course authoring, personalized tutoring, and verified skill certification for the modern economy.
        </p>

        {/* TODO: Connect public marketplace catalog to backend GET /courses endpoint */}
        <Card className="mt-8 text-left border-dashed">
          <CardHeader>
            <CardTitle>Marketplace Catalog</CardTitle>
            <CardDescription>
              Public course discovery & browsing (Placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Coming soon in Phase 6. Course search, preview, and instant checkout.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
