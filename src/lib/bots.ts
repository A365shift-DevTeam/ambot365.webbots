// AMBOT 365 - Bot CRUD Operations (Supabase storage)
import { createClient } from '@supabase/supabase-js';
import { Bot, BotFormData } from './types';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Use the service role key to bypass RLS for admin operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
  if (!supabaseUrl) return [];
  const { data, error } = await supabase.from('bots').select('*').order('createdAt', { ascending: false });
  if (error) {
    console.error('Failed to get bots from Supabase:', error);
    return [];
  }
  return data as Bot[];
}

export async function getEnabledBots(): Promise<Bot[]> {
  if (!supabaseUrl) return [];
  const { data, error } = await supabase.from('bots').select('*').eq('enabled', true).order('createdAt', { ascending: false });
  if (error) return [];
  return data as Bot[];
}

export async function getBotBySlug(slug: string): Promise<Bot | undefined> {
  if (!supabaseUrl) return undefined;
  const { data, error } = await supabase.from('bots').select('*').eq('slug', slug).single();
  if (error) return undefined;
  return data as Bot;
}

export async function getBotById(id: string): Promise<Bot | undefined> {
  if (!supabaseUrl) return undefined;
  const { data, error } = await supabase.from('bots').select('*').eq('id', id).single();
  if (error) return undefined;
  return data as Bot;
}

export async function createBot(data: BotFormData): Promise<Bot> {
  let slug = generateSlug(data.name);
  let suffix = 1;
  let isUnique = false;

  // Ensure unique slug
  while (!isUnique) {
    const { data: existing } = await supabase.from('bots').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      slug = `${generateSlug(data.name)}-${suffix}`;
      suffix++;
    } else {
      isUnique = true;
    }
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const newBot = {
    id,
    name: data.name.trim(),
    slug,
    description: data.description.trim(),
    scriptCode: data.scriptCode.trim(),
    backgroundImageUrl: data.backgroundImageUrl?.trim() || null,
    mobileBackgroundImageUrl: data.mobileBackgroundImageUrl?.trim() || null,
    category: data.category,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  };

  const { data: insertedData, error } = await supabase.from('bots').insert(newBot).select().single();
  
  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error("Failed to create bot in Supabase");
  }

  return insertedData as Bot;
}

export async function updateBot(
  id: string,
  data: Partial<BotFormData> & { enabled?: boolean }
): Promise<Bot | null> {
  const existing = await getBotById(id);
  if (!existing) return null;

  let slug = existing.slug;
  if (data.name && data.name.trim() !== existing.name) {
    slug = generateSlug(data.name);
    let suffix = 1;
    let isUnique = false;
    while (!isUnique) {
      const { data: duplicate } = await supabase.from('bots').select('id').eq('slug', slug).neq('id', id).maybeSingle();
      if (duplicate) {
        slug = `${generateSlug(data.name!)}-${suffix}`;
        suffix++;
      } else {
        isUnique = true;
      }
    }
  }

  const updated = {
    name: data.name?.trim() ?? existing.name,
    slug,
    description: data.description?.trim() ?? existing.description,
    scriptCode: data.scriptCode?.trim() ?? existing.scriptCode,
    backgroundImageUrl: data.backgroundImageUrl?.trim() ?? existing.backgroundImageUrl,
    mobileBackgroundImageUrl: data.mobileBackgroundImageUrl?.trim() ?? existing.mobileBackgroundImageUrl,
    category: data.category ?? existing.category,
    enabled: data.enabled ?? existing.enabled,
    updatedAt: new Date().toISOString(),
  };

  const { data: savedData, error } = await supabase.from('bots').update(updated).eq('id', id).select().single();
  
  if (error) {
    console.error("Supabase update error:", error);
    throw new Error("Failed to update bot in Supabase");
  }

  return savedData as Bot;
}

export async function deleteBot(id: string): Promise<boolean> {
  const { error } = await supabase.from('bots').delete().eq('id', id);
  if (error) return false;
  return true;
}
