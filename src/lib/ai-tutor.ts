import { API_BASE_URL, ApiClientError } from '@/lib/api-client';
import type { TutorChatRequest } from '@/types/ai';

/**
 * Asks Aria (POST /ai/tutor/chat) and hands each piece of her reply to `onText` as it streams in. The shared
 * API client waits for a whole JSON response, so this reads the plain-text stream itself.
 */
export async function streamTutorReply(
  request: TutorChatRequest,
  { token, signal, onText }: { token: string | null | undefined; signal?: AbortSignal; onText: (text: string) => void }
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/ai/tutor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) throw new ApiClientError(res.status, res.statusText, await res.json().catch(() => null));

  if (!res.body) {
    onText(await res.text());
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onText(decoder.decode(value, { stream: true }));
  }
}
