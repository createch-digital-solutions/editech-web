'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { useSignOut } from '@/hooks/auth';
import { getAuthDestination } from '@/lib/auth-redirect';
import { Button } from '@/components/ui/button';

function AuthPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');

  const { isLoaded, isSignedIn, dbUser, isPending, refetchUser } = useAuthContext();
  const { signOut, isSigningOut } = useSignOut();
  const [isChecking, setIsChecking] = useState(false);

  // Auto-redirect as soon as the account is confirmed ACTIVE and no longer pending
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending && dbUser?.status === 'ACTIVE') {
      const destination = getAuthDestination(redirectUrl, dbUser.role);
      router.replace(destination);
    }
  }, [isLoaded, isSignedIn, isPending, dbUser, redirectUrl, router]);

  async function handleCheckStatus() {
    setIsChecking(true);
    refetchUser();
    setTimeout(() => {
      setIsChecking(false);
    }, 1200);
  }

  const isReady = !isPending && dbUser?.status === 'ACTIVE';

  return (
    <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
        {isReady ? (
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        )}
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        {isReady ? 'Account Ready!' : 'Setting up your account...'}
      </h1>

      <p className="mt-3 text-sm text-gray-600">
        {isReady
          ? 'Your profile is ready. Redirecting you to your dashboard...'
          : "We're synchronizing your account and permissions with our servers. This usually takes just a few seconds."}
      </p>

      {dbUser?.email && (
        <p className="mt-2 text-xs font-medium text-gray-400">
          Account: <span className="text-gray-600">{dbUser.email}</span>
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="button"
          onClick={handleCheckStatus}
          disabled={isChecking || isReady}
          className="flex w-full items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking status...' : 'Check Status'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => signOut()}
          disabled={isSigningOut}
          className="flex w-full items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 py-2.5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AuthPendingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
            <p className="mt-4 text-sm font-medium text-gray-600">Loading account status...</p>
          </div>
        }
      >
        <AuthPendingContent />
      </Suspense>
    </main>
  );
}
