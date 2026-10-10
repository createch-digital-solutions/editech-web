# Frontend Developer Guide: Onboarding & Auth Lifecycle Integration

> **Target Workspace**: `editech-web`  
> **Backend APIs Ready in**: `editech-api` (Port 5000, `/api/v1`)  
> **Architecture Principle**: Implicit derived status in PostgreSQL, Zero DB migrations, JIT self-healing on both Sign-Up and Sign-In.

---

## Table of Contents
1. [Core Lifecycle & Status Contract](#1-core-lifecycle--status-contract)
2. [JIT Fallback & Self-Healing on Login](#2-jit-fallback--self-healing-on-login)
3. [Learner Layout Gate & Onboarding Submission](#3-learner-layout-gate--onboarding-submission)
4. [Instructor Layout Gate & Application Flow](#4-instructor-layout-gate--application-flow)
5. [Frontend TypeScript Type Updates](#5-frontend-typescript-type-updates)
6. [API Route Specifications & Payloads](#6-api-route-specifications--payloads)

---

## 1. Core Lifecycle & Status Contract

In the backend, user account status and profile status are cleanly separated:
- **`status` (`UserStatus`)**: Global account gate (`ACTIVE` | `SUSPENDED`).
  - Synced to Clerk `publicMetadata.status`.
  - Required by `src/proxy.ts` (Next.js middleware). Users without `status: "ACTIVE"` are redirected to `/unauthorized`.
- **`profileStatus` (`ProfileStatus`)**: Role-specific onboarding and review state.
  - Returned by `GET /api/v1/auth/me` and `GET /api/v1/onboarding/status`.
  - **Does NOT require database schema changes**; it is derived in real-time from existing profile records:

| Role | Conditions | Derived `profileStatus` |
| :--- | :--- | :--- |
| **ADMIN** | Any active admin | `'ACTIVE'` |
| **LEARNER** | `!learnerProfile?.careerGoal` | `'PENDING_ONBOARDING'` &rarr; route to `/onboarding` |
| **LEARNER** | `careerGoal` is populated | `'ACTIVE'` &rarr; route to `/dashboard` |
| **INSTRUCTOR** | `!instructorProfile?.bio` | `'PENDING_ONBOARDING'` &rarr; route to `/portal/onboarding` |
| **INSTRUCTOR** | `bio` present, but `status === 'PENDING'` | `'PENDING_APPROVAL'` &rarr; route to waiting screen |
| **INSTRUCTOR** | `status === 'APPROVED'` | `'ACTIVE'` &rarr; full portal access `/portal` |
| **ANY** | `user.status === 'SUSPENDED'` or instructor suspended | `'SUSPENDED'` &rarr; `/unauthorized` |

---

## 2. JIT Fallback & Self-Healing on Login

### The Problem
If a user created an account when the database was temporarily unreachable, or through an OAuth flow where webhook synchronization experienced latency, their Clerk user profile may be missing `publicMetadata.status = "ACTIVE"`.
When they log in, Clerk issues a session token missing `status: "ACTIVE"`. The Next.js middleware (`src/proxy.ts`) immediately intercepts the navigation and bounces the user to `/unauthorized`.

### The Solution: JIT on Login
Before calling `await signIn.finalize()`, check if the user's metadata is missing or invoke `POST /api/v1/auth/provision` as a self-healing measure.

### Implementation in `src/app/sign-in/[[...sign-in]]/page.tsx`

Update `handleSubmit` and `handleVerifyCode` to perform JIT provisioning if needed before finalizing:

```typescript
// Add apiClient import if not already present:
import { apiClient } from '@/lib/api-client';

// Inside handleSubmit:
if (signIn.status === 'complete') {
  const clerkUserId = signIn.createdUserId;
  
  // 1. JIT Self-Healing: Ensure user is in PostgreSQL and Clerk metadata has status: 'ACTIVE'
  if (clerkUserId) {
    try {
      await apiClient.post('/auth/provision', { clerkId: clerkUserId }, { skipAuth: true });
    } catch (provisionErr) {
      console.warn('JIT login provision fallback warning:', provisionErr);
    }
  }

  // 2. Finalize session (Clerk will issue token with updated claims)
  await signIn.finalize();

  // 3. Navigate to destination
  const role = user?.publicMetadata?.role as string | undefined;
  const destination = getAuthDestination(redirectUrl, role);
  window.location.href = destination;
  return;
}
```

Do the same inside `handleVerifyCode`:

```typescript
if (signIn.status === 'complete') {
  const clerkUserId = signIn.createdUserId;
  if (clerkUserId) {
    try {
      await apiClient.post('/auth/provision', { clerkId: clerkUserId }, { skipAuth: true });
    } catch (provisionErr) {
      console.warn('JIT verify login provision fallback warning:', provisionErr);
    }
  }

  await signIn.finalize();
  const role = user?.publicMetadata?.role as string | undefined;
  const destination = getAuthDestination(redirectUrl, role);
  window.location.href = destination;
  return { success: true };
}
```

### Social / OAuth SSO Handling (`src/app/sso-callback/page.tsx`)
In `SSOCallbackPage`, you can wrap or augment with a post-login check or keep the standard `<AuthenticateWithRedirectCallback />` since `ClerkAuthGuard` in NestJS will automatically self-provision any authenticated JWT when the first API call hits. However, for immediate edge validation, ensure `redirectCallbackUrl` leads to a page or route that initializes `useCurrentUser()`.

---

## 3. Learner Layout Gate & Onboarding Submission

### A. Create `src/app/(learner)/layout.tsx`
This layout protects the learner dashboard and automatically routes users who have not selected their onboarding goals to `/onboarding`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/onboarding');

  useEffect(() => {
    if (isLoading || !isSignedIn || !user) return;

    // Check derived profile status
    const profileStatus = user.profileStatus;

    if (profileStatus === 'PENDING_ONBOARDING' && !isOnboardingRoute) {
      router.replace('/onboarding');
    } else if (profileStatus === 'ACTIVE' && isOnboardingRoute) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, isSignedIn, isOnboardingRoute, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdf6ec]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
```

### B. Wire `src/app/(learner)/onboarding/page.tsx`
Currently, the onboarding page is purely clientside state. Update it to persist selections via `POST /api/v1/onboarding/learner`:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Inside OnboardingPage component:
const queryClient = useQueryClient();
const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false);

async function handleCompleteOnboarding() {
  setIsSubmittingOnboarding(true);
  try {
    const careerGoal = labelsFor(goals, selectedGoals);
    const skillLevel = level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    const interests = selectedTopics;

    await apiClient.post('/onboarding/learner', {
      careerGoal,
      skillLevel,
      interests,
    });

    // Invalidate auth query so GET /auth/me reflects profileStatus: 'ACTIVE'
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] });

    router.replace('/dashboard');
  } catch (err) {
    console.error('Failed to save onboarding preferences', err);
    // Optionally display toast / error banner
  } finally {
    setIsSubmittingOnboarding(false);
  }
}

// In Step 4 "Go to my dashboard" button:
<button
  type="button"
  onClick={handleCompleteOnboarding}
  disabled={isSubmittingOnboarding}
  className="mx-auto mt-6 flex h-[46px] w-full max-w-[352px] items-center justify-center gap-1 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-opacity hover:opacity-90 disabled:opacity-50"
>
  {isSubmittingOnboarding ? 'Personalising your dashboard...' : 'Go to my dashboard'}
  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
</button>
```

---

## 4. Instructor Layout Gate & Application Flow

### Update `src/app/(instructor)/layout.tsx`
Replace the previous status check with `user.profileStatus`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSignedIn } = useCurrentUser();

  const isOnboardingRoute = pathname.startsWith('/portal/onboarding');
  const isPendingApprovalRoute = pathname.startsWith('/portal/pending-approval');

  useEffect(() => {
    if (isLoading || !isSignedIn || !user) return;

    const profileStatus = user.profileStatus;

    if (profileStatus === 'PENDING_ONBOARDING' && !isOnboardingRoute) {
      router.replace('/portal/onboarding');
    } else if (profileStatus === 'PENDING_APPROVAL' && !isPendingApprovalRoute) {
      router.replace('/portal/pending-approval');
    } else if (profileStatus === 'ACTIVE' && (isOnboardingRoute || isPendingApprovalRoute)) {
      router.replace('/portal');
    }
  }, [user, isLoading, isSignedIn, isOnboardingRoute, isPendingApprovalRoute, router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 5. Frontend TypeScript Type Updates

Update `src/types/user.ts` to include `ProfileStatus` and update the `User` interface:

```typescript
export type ProfileStatus =
  | 'PENDING_ONBOARDING'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'SUSPENDED';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  profileStatus: ProfileStatus;
  createdAt: string;
  updatedAt: string;
  learnerProfile?: LearnerProfile | null;
  instructorProfile?: InstructorProfile | null;
}
```

---

## 6. API Route Specifications & Payloads

### 1. `POST /api/v1/onboarding/learner`
- **Auth**: Bearer token required (`Role.LEARNER`)
- **Request Body**:
  ```json
  {
    "careerGoal": "Become a full-stack engineer",
    "skillLevel": "BEGINNER",
    "interests": ["Web Development", "AI & Machine Learning"]
  }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "success": true,
    "data": {
      "onboardingComplete": true,
      "redirectTo": "/dashboard"
    },
    "meta": {
      "timestamp": "2026-10-10T13:45:00.000Z",
      "requestId": "req_123"
    }
  }
  ```

### 2. `POST /api/v1/onboarding/instructor`
- **Auth**: Bearer token required (`Role.INSTRUCTOR`)
- **Request Body**:
  ```json
  {
    "bio": "Senior Cloud Engineer with 10+ years designing enterprise architectures.",
    "expertise": ["Cloud Architecture", "DevOps"],
    "payout": {
      "bankCode": "058",
      "accountNumber": "0123456789",
      "accountName": "Jane Doe"
    }
  }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "success": true,
    "data": {
      "instructorStatus": "PENDING",
      "message": "Instructor application submitted successfully and is pending administrative review.",
      "redirectTo": "/portal/pending-approval"
    },
    "meta": {
      "timestamp": "2026-10-10T13:45:00.000Z",
      "requestId": "req_123"
    }
  }
  ```

### 3. `GET /api/v1/onboarding/status`
- **Auth**: Bearer token required (Any authenticated user)
- **Response** (HTTP 200):
  ```json
  {
    "success": true,
    "data": {
      "role": "LEARNER",
      "profileStatus": "PENDING_ONBOARDING",
      "onboardingComplete": false,
      "redirectTo": "/onboarding"
    },
    "meta": {
      "timestamp": "2026-10-10T13:45:00.000Z",
      "requestId": "req_123"
    }
  }
  ```

### 4. `POST /api/v1/auth/provision` (Public / JIT)
- **Auth**: None (Public, called before final session issuance)
- **Request Body**:
  ```json
  {
    "clerkId": "user_2x..."
  }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "success": true,
    "data": {
      "message": "User provisioned and synced with Clerk",
      "user": {
        "id": "0194c7...",
        "email": "user@example.com",
        "role": "LEARNER",
        "status": "ACTIVE"
      }
    }
  }
  ```
