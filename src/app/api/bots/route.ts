// AMBOT 365 - Bots Collection API Route
import { NextRequest } from 'next/server';
import { getAllBots, getEnabledBots, createBot, isValidUrl } from '@/lib/bots';
import { verifySession } from '@/lib/auth';
import type { BotFormData, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

// GET /api/bots — List all bots
// Public: returns only enabled bots
// Admin (authenticated): returns all bots
export async function GET() {
  try {
    const isAdmin = await verifySession();
    const bots = isAdmin ? await getAllBots() : await getEnabledBots();
    return Response.json({ success: true, data: bots });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to fetch bots' },
      { status: 500 }
    );
  }
}

// POST /api/bots — Create a new bot (admin only)
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
    const { name, description, botFlowUrl, backgroundImageUrl, themeColor, bubbleIconUrl, category } = body as BotFormData;

    // Validate required fields
    if (!name?.trim() || !description?.trim() || !botFlowUrl?.trim() || !category) {
      return Response.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate URLs
    if (!isValidUrl(botFlowUrl)) {
      return Response.json(
        { success: false, error: 'Invalid bot flow URL. Must be a valid HTTP/HTTPS URL.' },
        { status: 400 }
      );
    }
    if (backgroundImageUrl && !isValidUrl(backgroundImageUrl, true)) {
      return Response.json(
        { success: false, error: 'Invalid background image URL' },
        { status: 400 }
      );
    }
    if (bubbleIconUrl && !isValidUrl(bubbleIconUrl, true)) {
      return Response.json(
        { success: false, error: 'Invalid bubble icon URL' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = CATEGORIES.map((c) => c.value);
    if (!validCategories.includes(category as Category)) {
      return Response.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    const newBot = await createBot({ name, description, botFlowUrl, backgroundImageUrl, themeColor, bubbleIconUrl, category });
    return Response.json({ success: true, data: newBot }, { status: 201 });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to create bot' },
      { status: 500 }
    );
  }
}
