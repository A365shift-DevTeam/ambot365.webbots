// AMBOT 365 - Auth Logout API Route
import { deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST() {
  await deleteSession();
  redirect('/admin/login');
}
