export {};

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (options?: { template?: string }) => Promise<string | null>;
      };
      loaded?: boolean;
      user?: Record<string, unknown>;
    };
  }
  
  interface CustomJwtSessionClaims {
    // This matches the exact key you defined in the JSON dashboard editor
    role?: "learner" | "instructor" | "admin";
    
  }
}

