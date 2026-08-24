import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function InstructorPortalPage() {
  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between border-b pb-6 border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold">Instructor Portal</h1>
          <p className="text-gray-500 text-sm">
            Author courses with AI assistance, manage student reviews, and view earnings.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      {/* TODO: Connect to backend GET /instructor/courses */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Course Studio</CardTitle>
          <CardDescription>Created curriculum & drafts (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Coming soon in Phase 6. AI Course Builder and lesson management tools will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
