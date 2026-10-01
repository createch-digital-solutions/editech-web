import type { UserRole } from './user';

export {};

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (options?: {
          template?: string;
          forceRefresh?: boolean;
        }) => Promise<string | null>;
      };
      loaded?: boolean;
      user?: Record<string, unknown>;
    };
  }

  /**
   * Augment Clerk's global CustomJwtSessionClaims to match the Editech session template.
   */
  interface CustomJwtSessionClaims {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: UserRole | string;
    status?: string | null;
  }
}

