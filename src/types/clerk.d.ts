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
   * Augment Clerk's global CustomJwtSessionClaims to match Createch's JWT structure.
   * Supports both direct root claim (`claims.role`) and nested metadata (`claims.publicMetadata.role`).
   */
  interface CustomJwtSessionClaims {
    role?: UserRole;
    publicMetadata?: {
      role?: UserRole;
    };
    metadata?: {
      role?: UserRole;
    };
  }
}

