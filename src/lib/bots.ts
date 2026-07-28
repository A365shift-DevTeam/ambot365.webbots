// AMBOT 365 - Bot CRUD Operations (.NET catalog API)
import { apiRequest, apiRequestOrNull, apiRequestSafe } from './api';
import { Bot, BotFormData } from './types';

/**
 * Validates that a URL is a proper HTTP(S) URL to prevent malicious iframe sources.
 */
export function isValidUrl(url: string, allowRelative = false): boolean {
  if (allowRelative && url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

// --- Public API ---

export async function getAllBots(): Promise<Bot[]> {
  return apiRequestSafe<Bot[]>('/api/bots', []);
}

export async function getEnabledBots(): Promise<Bot[]> {
  return apiRequestSafe<Bot[]>('/api/bots', [], { query: { enabled: true } });
}

export async function getBotBySlug(slug: string): Promise<Bot | undefined> {
  const bot = await apiRequestOrNull<Bot>(`/api/bots/by-slug/${encodeURIComponent(slug)}`);
  return bot ?? undefined;
}

export async function getBotById(id: string): Promise<Bot | undefined> {
  const bot = await apiRequestOrNull<Bot>(`/api/bots/${encodeURIComponent(id)}`);
  return bot ?? undefined;
}

export async function createBot(data: BotFormData): Promise<Bot> {
  // Slug generation and uniqueness are the API's job — the unique index on
  // `slug` is the only thing that actually rules out duplicates.
  return apiRequest<Bot>('/api/bots', { method: 'POST', body: data });
}

export async function updateBot(
  id: string,
  data: Partial<BotFormData> & { enabled?: boolean }
): Promise<Bot | null> {
  return apiRequestOrNull<Bot>(`/api/bots/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteBot(id: string): Promise<boolean> {
  try {
    await apiRequest<void>(`/api/bots/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
}
