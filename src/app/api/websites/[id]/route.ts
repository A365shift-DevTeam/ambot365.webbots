// AMBOT 365 - Single Website API Route (Admin Only)
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getWebsiteById, updateWebsite, deleteWebsite } from '@/lib/websites';

import { isValidUrl } from '@/lib/bots';
import { verifySession } from '@/lib/auth';
import type { WebsiteFormData, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

// GET /api/websites/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const website = await getWebsiteById(id);
    if (!website) {
      return Response.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }
    return Response.json({ success: true, data: website });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to fetch website' },
      { status: 500 }
    );
  }
}

// PUT /api/websites/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifySession();
    if (!isAdmin) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await getWebsiteById(id);
    if (!existing) {
      return Response.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, url, thumbnailUrl, category, tags, enabled, featured } =
      body as Partial<WebsiteFormData> & { enabled?: boolean; featured?: boolean };

    if (url && !isValidUrl(url, true)) {
      return Response.json(
        { success: false, error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    if (thumbnailUrl && !isValidUrl(thumbnailUrl, true)) {
      return Response.json(
        { success: false, error: 'Invalid thumbnail URL' },
        { status: 400 }
      );
    }

    if (category) {
      const validCategories = CATEGORIES.map((c) => c.value);
      if (!validCategories.includes(category as Category)) {
        return Response.json(
          { success: false, error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    const updated = await updateWebsite(id, {
      title,
      description,
      url,
      thumbnailUrl,
      category,
      tags,
      enabled,
      featured,
    });

    revalidatePath('/');
    revalidatePath('/websites');
    revalidatePath('/admin');

    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update website:', error);
    return Response.json(
      { success: false, error: 'Failed to update website' },
      { status: 500 }
    );
  }
}

// DELETE /api/websites/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifySession();
    if (!isAdmin) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await deleteWebsite(id);
    if (!deleted) {
      return Response.json(
        { success: false, error: 'Website not found or could not be deleted' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    revalidatePath('/websites');
    revalidatePath('/admin');

    return Response.json({ success: true, data: { id } });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to delete website' },
      { status: 500 }
    );
  }
}
