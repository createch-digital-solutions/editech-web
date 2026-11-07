/**
 * AI module contracts (createch-api `src/modules/ai`), mirrored locally.
 */

/** Aria's coaching style. */
export type TutorPersona = 'friendly' | 'formal' | 'socratic';

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * POST /ai/tutor/chat — the conversation so far (oldest first, ending with the learner's new message).
 * With `courseId` the learner must be actively enrolled (403 otherwise); `lessonId` lets Aria read the lesson.
 * The reply streams back as plain text.
 */
export interface TutorChatRequest {
  messages: TutorMessage[];
  courseId?: string;
  lessonId?: string;
  persona?: TutorPersona;
}

/** GET /ai/conversations?lessonId= — saved chats with Aria, newest first (up to 20). */
export interface AiConversation {
  id: string;
  learnerId: string;
  courseId: string | null;
  lessonId: string | null;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  tokenCount: number;
  createdAt: string;
  updatedAt: string;
}
