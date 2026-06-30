import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;

    if (sessionId) {
      // Clear session from D1
      await queryD1(`UPDATE users SET session_id = NULL WHERE session_id = ?`, [sessionId]);
    }

    // Clear cookie
    cookieStore.delete('auth_session');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
