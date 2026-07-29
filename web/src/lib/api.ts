// AMBOT 365 - Client for the .NET catalog API
//
// There is no API key here by design. The browser authenticates with an
// httpOnly session cookie that JavaScript cannot read, so nothing secret is
// ever shipped in this bundle. Public GETs need no credential at all.
//
// In development Vite proxies /api and /uploads to the API, so the browser sees
// one origin. In production the SPA and the API are separate hosts, and
// VITE_API_BASE_URL (baked in at build time) points at the API. The two hosts
// share the registrable domain ambot365.com, which keeps requests same-site and
// lets the session cookie stay SameSite=Lax.

import type { Bot, BotFormData, DemoWebsite, WebsiteFormData } from './types';

/**
 * Absolute origin of the API, or '' meaning "same origin as this page".
 * Normalised without a trailing slash so concatenation stays predictable.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

/**
 * Resolves a server-relative path against the API.
 *
 * Uploaded images are stored in the database as server-relative paths such as
 * `/uploads/abc.png`. Rendering one directly would resolve it against the SPA's
 * own host, which has no uploads directory — so every image must go through
 * here. Absolute and data URLs (the "paste an image URL" field) pass untouched.
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export class ApiError extends Error {
  // Declared and assigned explicitly rather than as a constructor parameter
  // property: `erasableSyntaxOnly` disallows syntax that emits runtime code.
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

async function send(path: string, { method = 'GET', body, query }: Options = {}) {
  const url = new URL(path, API_BASE || window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  });
}

async function failureMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (payload && typeof payload === 'object' && 'error' in payload) {
      return String((payload as { error: unknown }).error);
    }
  } catch {
    // Fall through to a status-only message.
  }
  return `Request failed (${response.status})`;
}

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const response = await send(path, options);
  if (!response.ok) throw new ApiError(await failureMessage(response), response.status);
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

/** Returns null on 404 so "not found" doesn't have to be caught as an error. */
async function requestOrNull<T>(path: string, options: Options = {}): Promise<T | null> {
  const response = await send(path, options);
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiError(await failureMessage(response), response.status);
  return response.status === 204 ? null : ((await response.json()) as T);
}

// --- Bots -------------------------------------------------------------------

export const getBots = (enabledOnly = false) =>
  request<Bot[]>('/api/bots', enabledOnly ? { query: { enabled: true } } : {});

export const getBotBySlug = (slug: string) =>
  requestOrNull<Bot>(`/api/bots/by-slug/${encodeURIComponent(slug)}`);

export const getBotById = (id: string) =>
  requestOrNull<Bot>(`/api/bots/${encodeURIComponent(id)}`);

export const createBot = (data: BotFormData) =>
  request<Bot>('/api/bots', { method: 'POST', body: data });

export const updateBot = (id: string, data: Partial<BotFormData>) =>
  request<Bot>(`/api/bots/${encodeURIComponent(id)}`, { method: 'PUT', body: data });

export const deleteBot = (id: string) =>
  request<void>(`/api/bots/${encodeURIComponent(id)}`, { method: 'DELETE' });

// --- Demo websites ----------------------------------------------------------

export const getWebsites = (enabledOnly = false) =>
  request<DemoWebsite[]>('/api/websites', enabledOnly ? { query: { enabled: true } } : {});

export const getWebsiteBySlug = (slug: string) =>
  requestOrNull<DemoWebsite>(`/api/websites/by-slug/${encodeURIComponent(slug)}`);

export const getWebsiteById = (id: string) =>
  requestOrNull<DemoWebsite>(`/api/websites/${encodeURIComponent(id)}`);

export const createWebsite = (data: WebsiteFormData) =>
  request<DemoWebsite>('/api/websites', { method: 'POST', body: data });

export const updateWebsite = (id: string, data: Partial<WebsiteFormData>) =>
  request<DemoWebsite>(`/api/websites/${encodeURIComponent(id)}`, { method: 'PUT', body: data });

export const deleteWebsite = (id: string) =>
  request<void>(`/api/websites/${encodeURIComponent(id)}`, { method: 'DELETE' });

// --- Auth -------------------------------------------------------------------

export const login = (password: string) =>
  request<{ success: boolean }>('/api/auth/login', { method: 'POST', body: { password } });

export const logout = () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });

export const me = () => request<{ authenticated: boolean }>('/api/auth/me');

// --- Uploads ----------------------------------------------------------------

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  // No Content-Type header: the browser must set the multipart boundary itself.
  const response = await fetch(new URL('/api/uploads', API_BASE || window.location.origin), {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  if (!response.ok) throw new ApiError(await failureMessage(response), response.status);

  const payload = (await response.json()) as { url: string };
  return payload.url;
}

/** Validates a URL for use as an iframe or image source. */
export function isValidUrl(url: string, allowRelative = false): boolean {
  if (allowRelative && url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
