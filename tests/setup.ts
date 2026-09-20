import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: null,
    isLoaded: true,
    isSignedIn: false,
  }),
  useAuth: () => ({
    userId: null,
    sessionId: null,
    getToken: vi.fn().mockResolvedValue(null),
    isLoaded: true,
    isSignedIn: false,
    signOut: vi.fn(),
  }),
  useSignIn: () => ({
    signIn: {
      password: vi.fn(),
      finalize: vi.fn(),
      sso: vi.fn(),
    },
    fetchStatus: 'idle',
  }),
  useSignUp: () => ({
    signUp: {
      password: vi.fn(),
      finalize: vi.fn(),
      sso: vi.fn(),
      verifications: {
        sendEmailCode: vi.fn(),
        verifyEmailCode: vi.fn(),
      },
    },
    fetchStatus: 'idle',
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/hooks/auth', () => ({
  useSignOut: () => ({
    signOut: vi.fn(),
    isSigningOut: false,
  }),
  useCurrentUser: () => ({
    user: null,
    isLoading: false,
    isSignedIn: false,
  }),
  useRole: () => ({
    role: null,
    isAdmin: false,
    isInstructor: false,
    isLearner: false,
    hasRole: () => false,
    can: () => false,
  }),
}));
