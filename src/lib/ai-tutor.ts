import { API_BASE_URL, ApiClientError, apiClient } from '@/lib/api-client';
import type { AiConversation, TutorChatRequest, TutorMessage } from '@/types/ai';

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

/** The learner's earlier chat with Aria about this lesson (GET /ai/conversations), oldest message first. */
export async function lessonConversation(lessonId: string, token: string | null | undefined): Promise<TutorMessage[]> {
  const conversations = await apiClient.get<AiConversation[]>('/ai/conversations', { params: { lessonId }, token: token ?? undefined });
  const latest = conversations.find((c) => c.lessonId === lessonId);
  return (latest?.messages ?? []).filter((m): m is TutorMessage => (m.role === 'user' || m.role === 'assistant') && !!m.content);
}
