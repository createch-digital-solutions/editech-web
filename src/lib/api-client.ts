/**
 * Base API Client for Createch Web.
 * Communicates strictly over HTTP REST against NEXT_PUBLIC_API_BASE_URL.
 * Supports automated Clerk JWT token resolution for client and server environments.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export type TokenProvider = () => Promise<string | null | undefined> | string | null | undefined;

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
}

export class ApiClientError extends Error {
  public status: number;
  public statusText: string;
  public error: unknown;

  constructor(status: number, statusText: string, error: unknown) {
    super(
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : `Request failed with status ${status}: ${statusText}`
    );
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
    this.error = error;
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultJwtTemplate?: string;
  private tokenProvider?: TokenProvider;

  constructor(baseUrl: string = API_BASE_URL, config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl || baseUrl).replace(/\/$/, '');
    this.defaultJwtTemplate = config.defaultJwtTemplate;
    this.tokenProvider = config.tokenProvider;
  }

  /**
   * Configure a global token provider for this client instance.
   * Useful for hooking into auth state or custom session providers.
   */
  public setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  /**
   * Configure a default Clerk JWT template name for all requests.
   */
  public setDefaultJwtTemplate(template: string): void {
    this.defaultJwtTemplate = template;
  }

  /**
   * Create an isolated child client inheriting or overriding settings.
   */
  public createChildClient(config: ApiClientConfig): ApiClient {
    return new ApiClient(config.baseUrl || this.baseUrl, {
      defaultJwtTemplate: config.defaultJwtTemplate ?? this.defaultJwtTemplate,
      tokenProvider: config.tokenProvider ?? this.tokenProvider,
    });
  }

  /**
   * Resolves the bearer token based on priority:
   * 1. Explicit `options.token`
   * 2. Request-level `options.tokenProvider`
   * 3. Client instance `this.tokenProvider`
   * 4. Browser fallback: `window.Clerk.session.getToken()`
   */
  private async resolveToken(options: RequestOptions): Promise<string | null | undefined> {
    if (options.skipAuth) {
      return null;
    }

    if (options.token) {
      return options.token;
    }

    if (options.tokenProvider) {
      return await options.tokenProvider();
    }

    if (this.tokenProvider) {
      return await this.tokenProvider();
    }

    // Client-side fallback to window.Clerk singleton
    if (typeof window !== 'undefined' && window.Clerk?.session) {
      try {
        const template = options.jwtTemplate || this.defaultJwtTemplate;
        return await window.Clerk.session.getToken(template ? { template } : undefined);
      } catch {
        return null;
      }
    }

    return null;
  }

  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      token,
      tokenProvider,
      jwtTemplate,
      skipAuth,
      params,
      headers,
      body,
      ...restOptions
    } = options;

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Format query parameters
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...((headers as Record<string, string>) || {}),
    };

    // Auto-resolve and inject bearer token
    const authToken = await this.resolveToken(options);
    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    // Handle body serialization
    let requestBody: BodyInit | null | undefined = undefined;
    if (body !== undefined && body !== null) {
      if (
        typeof FormData !== 'undefined' && body instanceof FormData ||
        typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams ||
        typeof Blob !== 'undefined' && body instanceof Blob
      ) {
        // Let browser set appropriate multipart headers with boundary
        requestBody = body as BodyInit;
      } else {
        requestHeaders['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
      }
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      body: requestBody,
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }
      throw new ApiClientError(response.status, response.statusText, errorBody);
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Global default singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
