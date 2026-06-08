// AMBOT 365 - Single Bot API Route
import { NextRequest } from 'next/server';
import { getBotById, updateBot, deleteBot, isValidUrl } from '@/lib/bots';
import { verifySession } from '@/lib/auth';

// GET /api/bots/[id] — Get a single bot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bot = await getBotById(id);

    if (!bot) {
      return Response.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: bot });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to fetch bot' },
      { status: 500 }
    );
  }
}

// PUT /api/bots/[id] — Update a bot (admin only)
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
    const body = await request.json();

    // Validate URLs if provided
    if (body.backgroundImageUrl && !isValidUrl(body.backgroundImageUrl, true)) {
      return Response.json(
        { success: false, error: 'Invalid background image URL' },
        { status: 400 }
      );
    }

    const updated = await updateBot(id, body);

    if (!updated) {
      return Response.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: updated });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to update bot' },
      { status: 500 }
    );
  }
}

// DELETE /api/bots/[id] — Delete a bot (admin only)
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
    const deleted = await deleteBot(id);

    if (!deleted) {
      return Response.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to delete bot' },
      { status: 500 }
    );
  }
}
