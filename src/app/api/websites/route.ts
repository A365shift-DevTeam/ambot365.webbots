// AMBOT 365 - Websites Collection API Route
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getAllWebsites,
  getEnabledWebsites,
  createWebsite,
} from '@/lib/websites';
import { isValidUrl } from '@/lib/bots';
import { verifySession } from '@/lib/auth';
import type { WebsiteFormData, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';


// GET /api/websites — List demo websites
export async function GET() {
  try {
    const isAdmin = await verifySession();
    const websites = isAdmin ? await getAllWebsites() : await getEnabledWebsites();
    return Response.json({ success: true, data: websites });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to fetch websites' },
      { status: 500 }
    );
  }
}

// POST /api/websites — Create a new demo website (admin only)
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifySession();
    if (!isAdmin) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, url, thumbnailUrl, category, tags, enabled, featured } =
      body as WebsiteFormData;

    // Validate required fields
    if (!title?.trim() || !description?.trim() || !url?.trim() || !category) {
      return Response.json(
        { success: false, error: 'Title, description, URL, and category are required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url, true)) {
      return Response.json(
        { success: false, error: 'Please enter a valid website URL' },
        { status: 400 }
      );
    }

    if (thumbnailUrl && !isValidUrl(thumbnailUrl, true)) {
      return Response.json(
        { success: false, error: 'Invalid thumbnail image URL' },
        { status: 400 }
      );
    }

    const validCategories = CATEGORIES.map((c) => c.value);
    if (!validCategories.includes(category as Category)) {
      return Response.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    const newWebsite = await createWebsite({

      title,
      description,
      url,
      thumbnailUrl,
      category,
      tags: Array.isArray(tags) ? tags : [],
      enabled: enabled ?? true,
      featured: featured ?? false,
    });

    revalidatePath('/');
    revalidatePath('/websites');
    revalidatePath('/admin');

    return Response.json({ success: true, data: newWebsite }, { status: 201 });

  } catch (error) {
    console.error('Failed to create demo website:', error);
    return Response.json(
      { success: false, error: 'Failed to create website' },
      { status: 500 }
    );
  }
}
