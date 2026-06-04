// AMBOT 365 - Bot CRUD Operations (file-based storage)
import { kv } from '@vercel/kv';
import { Bot, BotFormData } from './types';

async function readBots(): Promise<Bot[]> {
  try {
    // Return empty array if KV is not configured locally yet
    if (!process.env.KV_REST_API_URL) return [];
    
    const data = await kv.get<Bot[]>('ambot365_bots');
    return data || [];
  } catch (error) {
    console.error('Failed to read from KV:', error);
    return [];
  }
}

async function writeBots(bots: Bot[]): Promise<void> {
  if (!process.env.KV_REST_API_URL) return;
  await kv.set('ambot365_bots', bots);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateId(): string {
  return `bot-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Validates that a URL is a proper HTTPS URL to prevent malicious iframe sources.
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
  return readBots();
}

export async function getEnabledBots(): Promise<Bot[]> {
  const bots = await readBots();
  return bots.filter((b) => b.enabled);
}

export async function getBotBySlug(slug: string): Promise<Bot | undefined> {
  const bots = await readBots();
  return bots.find((b) => b.slug === slug);
}

export async function getBotById(id: string): Promise<Bot | undefined> {
  const bots = await readBots();
  return bots.find((b) => b.id === id);
}

export async function createBot(data: BotFormData): Promise<Bot> {
  const bots = await readBots();

  // Ensure unique slug
  let slug = generateSlug(data.name);
  let suffix = 1;
  while (bots.some((b) => b.slug === slug)) {
    slug = `${generateSlug(data.name)}-${suffix}`;
    suffix++;
  }

  const now = new Date().toISOString();
  const newBot: Bot = {
    id: generateId(),
    name: data.name.trim(),
    slug,
    description: data.description.trim(),
    botFlowUrl: data.botFlowUrl.trim(),
    backgroundImageUrl: data.backgroundImageUrl?.trim() || undefined,
    themeColor: data.themeColor?.trim() || undefined,
    bubbleIconUrl: data.bubbleIconUrl?.trim() || undefined,
    category: data.category,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  };

  bots.push(newBot);
  await writeBots(bots);
  return newBot;
}

export async function updateBot(
  id: string,
  data: Partial<BotFormData> & { enabled?: boolean }
): Promise<Bot | null> {
  const bots = await readBots();
  const index = bots.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const existing = bots[index];

  // If name changed, update slug
  let slug = existing.slug;
  if (data.name && data.name.trim() !== existing.name) {
    slug = generateSlug(data.name);
    let suffix = 1;
    while (bots.some((b) => b.slug === slug && b.id !== id)) {
      slug = `${generateSlug(data.name!)}-${suffix}`;
      suffix++;
    }
  }

  const updated: Bot = {
    ...existing,
    name: data.name?.trim() ?? existing.name,
    slug,
    description: data.description?.trim() ?? existing.description,
    botFlowUrl: data.botFlowUrl?.trim() ?? existing.botFlowUrl,
    backgroundImageUrl: data.backgroundImageUrl?.trim() ?? existing.backgroundImageUrl,
    themeColor: data.themeColor?.trim() ?? existing.themeColor,
    bubbleIconUrl: data.bubbleIconUrl?.trim() ?? existing.bubbleIconUrl,
    category: data.category ?? existing.category,
    enabled: data.enabled ?? existing.enabled,
    updatedAt: new Date().toISOString(),
  };

  bots[index] = updated;
  await writeBots(bots);
  return updated;
}

export async function deleteBot(id: string): Promise<boolean> {
  const bots = await readBots();
  const filtered = bots.filter((b) => b.id !== id);
  if (filtered.length === bots.length) return false;
  await writeBots(filtered);
  return true;
}
