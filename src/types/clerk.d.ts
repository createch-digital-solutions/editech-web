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
}

