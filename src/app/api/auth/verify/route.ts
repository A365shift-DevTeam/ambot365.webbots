// AMBOT 365 - Auth Verify API Route
import { verifySession } from '@/lib/auth';

export async function GET() {
  const isValid = await verifySession();

  if (!isValid) {
    return Response.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return Response.json({ success: true });
}
