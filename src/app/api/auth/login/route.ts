// AMBOT 365 - Auth Login API Route
import { NextRequest } from 'next/server';
import { createSession, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return Response.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return Response.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    await createSession();

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
