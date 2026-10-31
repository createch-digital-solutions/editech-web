import { auth } from '@clerk/nextjs/server';

/** The signed-in viewer's Clerk token for API calls from server components (only); null when signed out. */
export async function viewerToken(): Promise<string | null> {
  try {
    const { getToken } = await auth();
    return await getToken();
  } catch {
    return null;
  }
}
