/**
 * Phase 15 API response envelope types.
 * These match the exact JSON contract emitted by TransformInterceptor
 * and HttpExceptionFilter on the NestJS backend.
 */

// --- Meta ------------------------------------------------------------------

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

// --- Success Envelopes -------------------------------------------------------

/**
 * Standard success response.
 * The API client auto-unwraps this — callers receive `data` directly.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

/**
 * Pagination metadata block returned alongside list responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated success response (list endpoints).
 * The API client auto-unwraps this — callers receive `{ data, pagination }`.
 */
export interface PaginatedApiResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  meta: ApiMeta;
}

/**
 * Shape returned to callers after envelope unwrapping for paginated responses.
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// --- Error Envelope ----------------------------------------------------------

/**
 * Typed error codes emitted by HttpExceptionFilter.
 * Keep in sync with the backend's error code strings.
 */
export const ApiErrorCode = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  // Webhook
  WEBHOOK_VERIFICATION_FAILED: 'WEBHOOK_VERIFICATION_FAILED',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface ApiErrorBody {
  code: ApiErrorCode | string;
  message: string;
  details?: unknown;
}

/**
 * Error response envelope from HttpExceptionFilter.
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  meta: ApiMeta;
}

// --- Raw union (used internally by ApiClient before unwrapping) ---------------

export type RawApiResponse<T> = ApiResponse<T> | PaginatedApiResponse<T>;
