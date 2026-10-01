'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/auth/use-current-user';
import { useSignOut } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function InstructorOnboardingPage() {
  const { user } = useCurrentUser();
  const { signOut } = useSignOut();

  const status = user?.instructorProfile?.status ?? 'PENDING';

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between border-b pb-6 border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold">Instructor Onboarding & Setup</h1>
          <p className="text-gray-500 text-sm">
            Complete your profile and verification to begin authoring and publishing courses.
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

      <Card className="border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Profile Under Verification ({status})</CardTitle>
            <CardDescription>
              Your instructor profile has been registered and is pending verification.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, <strong>{user?.firstName || user?.email}</strong>! You are registered on the instructor track.
            Before you can create, publish, or monetize courses on Editech, our administrators verify each instructor to maintain platform quality.
          </p>

          <div className="rounded-lg border p-4 bg-background space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              What to expect:
            </h4>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>Profile review takes approximately 24-48 business hours.</li>
              <li>You will receive an email confirmation once your account has been reviewed.</li>
              <li>Once verified, your full course creation suite and studio tools will be unlocked.</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <AlertCircle className="h-4 w-4" />
            <span>Need to update your application details? Contact support@editech.example.com</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
