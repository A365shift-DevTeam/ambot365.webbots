// AMBOT 365 - Demo Websites CRUD Operations (Supabase + Global Persistent Fallback Storage)
import { createClient } from '@supabase/supabase-js';
import { DemoWebsite, WebsiteFormData } from './types';

// Initialize Supabase Client safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Global persistent storage in Node process memory
declare global {
  var __localWebsitesStore: DemoWebsite[] | undefined;
}

function getLocalStore(): DemoWebsite[] {
  if (!globalThis.__localWebsitesStore) {
    globalThis.__localWebsitesStore = [];
  }
  return globalThis.__localWebsitesStore;
}

export async function getAllWebsites(): Promise<DemoWebsite[]> {
  const store = getLocalStore();

  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DemoWebsite[];
      }
    } catch {
      // Fallback to local process memory store
    }
  }

  return store;
}

export async function getEnabledWebsites(): Promise<DemoWebsite[]> {
  const all = await getAllWebsites();
  return all.filter((w) => w.enabled);
}

export async function getWebsiteBySlug(
  slug: string
): Promise<DemoWebsite | undefined> {
  const all = await getAllWebsites();
  return all.find((w) => w.slug === slug);
}

export async function getWebsiteById(
  id: string
): Promise<DemoWebsite | undefined> {
  const all = await getAllWebsites();
  return all.find((w) => w.id === id);
}

export async function createWebsite(
  data: WebsiteFormData
): Promise<DemoWebsite> {
  let slug = generateSlug(data.title);
  const all = await getAllWebsites();
  let suffix = 1;

  while (all.some((w) => w.slug === slug)) {
    slug = `${generateSlug(data.title)}-${suffix}`;
    suffix++;
  }

  const now = new Date().toISOString();
  const newWebsite: DemoWebsite = {
    id: `web-${crypto.randomUUID()}`,
    title: data.title.trim(),
    slug,
    description: data.description.trim(),
    url: data.url.trim(),
    thumbnailUrl: data.thumbnailUrl?.trim() || undefined,
    category: data.category,
    tags: data.tags || [],
    enabled: data.enabled ?? true,
    featured: data.featured ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const store = getLocalStore();
  store.unshift(newWebsite);

  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
    try {
      const { data: inserted, error } = await supabase
        .from('websites')
        .insert(newWebsite)
        .select()
        .single();

      if (!error && inserted) {
        const idx = store.findIndex((w) => w.id === newWebsite.id);
        if (idx !== -1) store[idx] = inserted as DemoWebsite;
        return inserted as DemoWebsite;
      }
    } catch (err) {
      console.warn('Supabase insert failed, stored in memory:', err);
    }
  }

  return newWebsite;
}

export async function updateWebsite(
  id: string,
  data: Partial<WebsiteFormData> & { enabled?: boolean; featured?: boolean }
): Promise<DemoWebsite | null> {
  const store = getLocalStore();
  const existing = await getWebsiteById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: DemoWebsite = {
    ...existing,
    title: data.title?.trim() ?? existing.title,
    description: data.description?.trim() ?? existing.description,
    url: data.url?.trim() ?? existing.url,
    thumbnailUrl: data.thumbnailUrl?.trim() ?? existing.thumbnailUrl,
    category: data.category ?? existing.category,
    tags: data.tags ?? existing.tags,
    enabled: data.enabled ?? existing.enabled,
    featured: data.featured ?? existing.featured,
    updatedAt: now,
  };

  if (data.title && data.title.trim() !== existing.title) {
    updated.slug = generateSlug(data.title);
  }

  const idx = store.findIndex((w) => w.id === id);
  if (idx !== -1) store[idx] = updated;

  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
    try {
      const { data: saved, error } = await supabase
        .from('websites')
        .update(updated)
        .eq('id', id)
        .select()
        .single();
      if (!error && saved) {
        if (idx !== -1) store[idx] = saved as DemoWebsite;
        return saved as DemoWebsite;
      }
    } catch (err) {
      console.warn('Supabase update failed, updated in memory:', err);
    }
  }

  return updated;
}

export async function deleteWebsite(id: string): Promise<boolean> {
  const store = getLocalStore();
  const idx = store.findIndex((w) => w.id === id);
  if (idx !== -1) {
    store.splice(idx, 1);
  }

  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
    try {
      await supabase.from('websites').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  return true;
}
