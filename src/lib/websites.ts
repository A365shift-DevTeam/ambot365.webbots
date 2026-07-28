// AMBOT 365 - Demo Websites CRUD Operations (.NET catalog API)
import { apiRequest, apiRequestOrNull, apiRequestSafe } from './api';
import { DemoWebsite, WebsiteFormData } from './types';

export async function getAllWebsites(): Promise<DemoWebsite[]> {
  return apiRequestSafe<DemoWebsite[]>('/api/websites', []);
}

export async function getEnabledWebsites(): Promise<DemoWebsite[]> {
  return apiRequestSafe<DemoWebsite[]>('/api/websites', [], { query: { enabled: true } });
}

export async function getWebsiteBySlug(slug: string): Promise<DemoWebsite | undefined> {
  const website = await apiRequestOrNull<DemoWebsite>(
    `/api/websites/by-slug/${encodeURIComponent(slug)}`
  );
  return website ?? undefined;
}

export async function getWebsiteById(id: string): Promise<DemoWebsite | undefined> {
  const website = await apiRequestOrNull<DemoWebsite>(`/api/websites/${encodeURIComponent(id)}`);
  return website ?? undefined;
}

export async function createWebsite(data: WebsiteFormData): Promise<DemoWebsite> {
  return apiRequest<DemoWebsite>('/api/websites', { method: 'POST', body: data });
}

export async function updateWebsite(
  id: string,
  data: Partial<WebsiteFormData> & { enabled?: boolean; featured?: boolean }
): Promise<DemoWebsite | null> {
  return apiRequestOrNull<DemoWebsite>(`/api/websites/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteWebsite(id: string): Promise<boolean> {
  try {
    await apiRequest<void>(`/api/websites/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
}
