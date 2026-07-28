// AMBOT 365 - Server-side client for the .NET catalog API
//
// This module must never reach the browser: it holds the API key. Only server
// components and route handlers import it, which is why the key is read from
// AMBOT_API_KEY and not NEXT_PUBLIC_*.

const API_BASE = (process.env.AMBOT_API_URL || 'http://localhost:5201').replace(/\/$/, '');
const API_KEY = process.env.AMBOT_API_KEY || '';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', body, query } = options;

  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { 'X-API-Key': API_KEY };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  return fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    // The admin dashboard must never render a stale catalog.
    cache: 'no-store',
  });
}

/** Returns the parsed body, or throws ApiError on any non-2xx response. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(path, options);

  if (!response.ok) {
    throw new ApiError(await describeFailure(response), response.status);
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

/** Like apiRequest, but a 404 is an expected outcome rather than an error. */
export async function apiRequestOrNull<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T | null> {
  const response = await request(path, options);

  if (response.status === 404) return null;
  if (!response.ok) throw new ApiError(await describeFailure(response), response.status);

  return response.status === 204 ? (null as T | null) : ((await response.json()) as T);
}

/**
 * Read-only lookups degrade to an empty result instead of breaking a public
 * page: if the API is down, visitors see an empty catalog, not a crash.
 *
 * A rejected credential is deliberately NOT degraded. "Key is wrong" and
 * "catalog is empty" would otherwise render identically — a blank dashboard
 * with nothing in the logs — and a bad key is a misconfiguration to fix, not
 * an outage to ride out.
 */
export async function apiRequestSafe<T>(path: string, fallback: T, options: RequestOptions = {}): Promise<T> {
  try {
    const response = await request(path, options);

    if (response.status === 401 || response.status === 403) {
      throw new ApiError(
        `Catalog API rejected the API key (${response.status}). ` +
          'AMBOT_API_KEY must match Api:Key in the .NET app settings.',
        response.status
      );
    }

    if (!response.ok) {
      console.warn(`Catalog API ${path} responded ${response.status}`);
      return fallback;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.warn(`Catalog API ${path} unreachable:`, err);
    return fallback;
  }
}

async function describeFailure(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (payload && typeof payload === 'object' && 'error' in payload) {
      return String((payload as { error: unknown }).error);
    }
  } catch {
    // Fall through to the status-only message.
  }
  return `Catalog API responded ${response.status}`;
}
