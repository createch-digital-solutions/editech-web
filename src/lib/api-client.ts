/**
 * Base API Client for Createch Web.
 * Communicates strictly over HTTP REST against NEXT_PUBLIC_API_BASE_URL.
 *
 * Key behaviours:
 * - Auto-resolves Clerk JWT tokens (4-tier priority chain)
 * - Auto-unwraps the Phase 15 { success, data, meta } envelope
 * - Retries once with a force-refreshed token on 401
 * - Exposes typed ApiClientError with backend error codes
 * - Supports AbortSignal for React Query cancellation
 */

import type {
  RawApiResponse,
  PaginatedApiResponse,
  PaginatedResult,
  ApiErrorResponse,
  ApiErrorCode,
} from '@/types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/v1`
    : 'http://localhost:5000/api/v1');

// --- Types -------------------------------------------------------------------

export type TokenProvider = () => Promise<string | null | undefined> | string | null | undefined;

/**
 * Token provider that also supports force-refreshing.
 * Used internally for 401 retry logic.
 */
export type RefreshableTokenProvider = (forceRefresh?: boolean) => Promise<string | null | undefined>;

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Explicit token string override (e.g., from Server Components / Actions) */
  token?: string;
  /** Dynamic per-request token provider */
  tokenProvider?: TokenProvider;
  /** Custom Clerk JWT template name (if configured in Clerk Dashboard) */
  jwtTemplate?: string;
  /** Explicitly bypass authorization header injection (for public endpoints) */
  skipAuth?: boolean;
  /** Query string parameters */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Request body */
  body?: unknown;
}

export interface ApiClientConfig {
  baseUrl?: string;
  defaultJwtTemplate?: string;
  tokenProvider?: TokenProvider;
  /** Refreshable token provider for 401 retry (set by useApiClient hook) */
  refreshableTokenProvider?: RefreshableTokenProvider;
}

// --- Error Class -------------------------------------------------------------

export class ApiClientError extends Error {
  public status: number;
  public statusText: string;
  /** The raw backend error payload */
  public errorBody: unknown;
  /** Typed error code from the Phase 15 error envelope (if available) */
  public code: ApiErrorCode | string | undefined;
  /** Detailed validation errors or additional context from the backend */
  public details: unknown;

  constructor(status: number, statusText: string, errorBody: unknown) {
    const envelope = errorBody as ApiErrorResponse | null;
    const message =
      envelope?.error?.message ||
      (typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody
        ? String((errorBody as { message: unknown }).message)
        : `Request failed with status ${status}: ${statusText}`);

    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
    this.errorBody = errorBody;
    this.code = envelope?.error?.code;
    this.details = envelope?.error?.details;
  }
}

// --- Client ------------------------------------------------------------------

export class ApiClient {
  private baseUrl: string;
  private defaultJwtTemplate?: string;
  private tokenProvider?: TokenProvider;
  private refreshableTokenProvider?: RefreshableTokenProvider;

  constructor(baseUrl: string = API_BASE_URL, config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl || baseUrl).replace(/\/$/, '');
    this.defaultJwtTemplate = config.defaultJwtTemplate;
    this.tokenProvider = config.tokenProvider;
    this.refreshableTokenProvider = config.refreshableTokenProvider;
  }

  /** Configure a global token provider for this client instance. */
  public setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  /** Configure a refreshable token provider (enables 401 retry). */
  public setRefreshableTokenProvider(provider: RefreshableTokenProvider): void {
    this.refreshableTokenProvider = provider;
  }

  /** Configure a default Clerk JWT template name for all requests. */
  public setDefaultJwtTemplate(template: string): void {
    this.defaultJwtTemplate = template;
  }

  /** Create an isolated child client inheriting or overriding settings. */
  public createChildClient(config: ApiClientConfig): ApiClient {
    return new ApiClient(config.baseUrl || this.baseUrl, {
      defaultJwtTemplate: config.defaultJwtTemplate ?? this.defaultJwtTemplate,
      tokenProvider: config.tokenProvider ?? this.tokenProvider,
      refreshableTokenProvider: config.refreshableTokenProvider ?? this.refreshableTokenProvider,
    });
  }

  /**
   * Resolves the bearer token based on priority:
   * 1. Explicit `options.token`
   * 2. Request-level `options.tokenProvider`
   * 3. Client instance refreshable provider (with optional forceRefresh)
   * 4. Client instance standard provider
   * 5. Browser fallback: `window.Clerk.session.getToken()`
   */
  private async resolveToken(
    options: RequestOptions,
    forceRefresh = false
  ): Promise<string | null | undefined> {
    if (options.skipAuth) return null;
    if (options.token) return options.token;
    if (options.tokenProvider) return await options.tokenProvider();

    if (this.refreshableTokenProvider) {
      return await this.refreshableTokenProvider(forceRefresh);
    }

    if (this.tokenProvider) {
      return await this.tokenProvider();
    }

    // Client-side fallback to window.Clerk singleton
    if (typeof window !== 'undefined' && window.Clerk?.session) {
      try {
        const template = options.jwtTemplate || this.defaultJwtTemplate;
        return await window.Clerk.session.getToken(
          forceRefresh
            ? { template: template ?? undefined }
            : template
            ? { template }
            : undefined
        );
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Build the full URL with query params.
   */
  private buildUrl(endpoint: string, params?: RequestOptions['params']): string {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    return qs ? `${url}?${qs}` : url;
  }

  /**
   * Execute a single fetch attempt with the given token.
   */
  private async executeRequest(
    url: string,
    options: RequestOptions,
    token: string | null | undefined
  ): Promise<Response> {
    // Extract fields that are handled at the request() level or passed explicitly;
    // spread the rest to fetch as native RequestInit options.
    const {
      headers,
      body,
      params: _params,       // eslint-disable-line @typescript-eslint/no-unused-vars
      token: _t,             // eslint-disable-line @typescript-eslint/no-unused-vars
      tokenProvider: _tp,    // eslint-disable-line @typescript-eslint/no-unused-vars
      jwtTemplate: _jt,      // eslint-disable-line @typescript-eslint/no-unused-vars
      skipAuth: _sa,         // eslint-disable-line @typescript-eslint/no-unused-vars
      ...restOptions
    } = options;

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...((headers as Record<string, string>) || {}),
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    let requestBody: BodyInit | null | undefined = undefined;
    if (body !== undefined && body !== null) {
      if (
        (typeof FormData !== 'undefined' && body instanceof FormData) ||
        (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) ||
        (typeof Blob !== 'undefined' && body instanceof Blob)
      ) {
        requestBody = body as BodyInit;
      } else {
        requestHeaders['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
      }
    }

    return fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      body: requestBody,
    });
  }

  /**
   * Unwrap the Phase 15 success envelope.
   * - Standard response: returns `data`
   * - Paginated response: returns `{ data, pagination }`
   * - 204 No Content: returns empty object
   */
  private async unwrapResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    const raw = (await response.json()) as RawApiResponse<unknown>;

    // Paginated response detection
    if ('pagination' in raw) {
      const paginated = raw as PaginatedApiResponse<unknown>;
      return { data: paginated.data, pagination: paginated.pagination } as T;
    }

    return raw.data as T;
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);

    // First attempt
    const token = await this.resolveToken(options);
    const response = await this.executeRequest(url, options, token);

    // 401 retry with force-refreshed token (once)
    if (response.status === 401 && !options.skipAuth && !options.token) {
      const freshToken = await this.resolveToken(options, true);
      if (freshToken && freshToken !== token) {
        const retryResponse = await this.executeRequest(url, options, freshToken);
        if (!retryResponse.ok) {
          let errorBody: unknown;
          try { errorBody = await retryResponse.json(); } catch { errorBody = { message: retryResponse.statusText }; }
          throw new ApiClientError(retryResponse.status, retryResponse.statusText, errorBody);
        }
        return this.unwrapResponse<T>(retryResponse);
      }
    }

    if (!response.ok) {
      let errorBody: unknown;
      try { errorBody = await response.json(); } catch { errorBody = { message: response.statusText }; }
      throw new ApiClientError(response.status, response.statusText, errorBody);
    }

    return this.unwrapResponse<T>(response);
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/** Global default singleton instance (browser-only, no token provider configured). */
export const apiClient = new ApiClient(API_BASE_URL);

// Re-export PaginatedResult for convenience in query hooks
export type { PaginatedResult };
