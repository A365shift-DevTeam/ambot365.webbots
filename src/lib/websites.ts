// AMBOT 365 - Demo Websites CRUD Operations (Supabase + Disk File Persistence)
import { createClient } from '@supabase/supabase-js';
import { DemoWebsite, WebsiteFormData } from './types';
import fs from 'fs';
import path from 'path';

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

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'websites.json');

function getLocalStore(): DemoWebsite[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      return JSON.parse(content) as DemoWebsite[];
    }
  } catch (err) {
    console.error('Error reading local websites JSON file:', err);
  }
  return [];
}

function saveLocalStore(data: DemoWebsite[]): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save websites to disk:', err);
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getAllWebsites(): Promise<DemoWebsite[]> {
  const store = getLocalStore();

  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data) {
        return data as DemoWebsite[];
      }
      if (error) {
        console.warn('Supabase fetch websites notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Supabase fetch websites exception:', err);
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
  saveLocalStore(store);

  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
    try {
      const { data: inserted, error } = await supabase
        .from('websites')
        .insert(newWebsite)
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert website notice:', error.message || error);
      }

      if (!error && inserted) {
        const idx = store.findIndex((w) => w.id === newWebsite.id);
        if (idx !== -1) store[idx] = inserted as DemoWebsite;
        saveLocalStore(store);
        return inserted as DemoWebsite;
      }
    } catch (err) {
      console.warn('Supabase insert website exception:', err);
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
  saveLocalStore(store);

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
        saveLocalStore(store);
        return saved as DemoWebsite;
      }
    } catch (err) {
      console.warn('Supabase update failed, saved to local disk:', err);
    }
  }

  return updated;
}

export async function deleteWebsite(id: string): Promise<boolean> {
  const store = getLocalStore();
  const idx = store.findIndex((w) => w.id === id);
  if (idx !== -1) {
    store.splice(idx, 1);
    saveLocalStore(store);
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
