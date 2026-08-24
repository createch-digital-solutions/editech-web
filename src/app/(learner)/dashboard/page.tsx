import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LearnerDashboardPage() {
  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between border-b pb-6 border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold">Learner Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Track your ongoing courses, AI tutor interactions, and certificates.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      {/* TODO: Connect to backend GET /learner/enrollments */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>My Enrolled Courses</CardTitle>
          <CardDescription>Active learning progress (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Coming soon in Phase 6. Your enrolled courses and lesson player will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
