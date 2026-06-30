import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const sql = `SELECT username, role FROM users WHERE session_id = ?`;
    const users = await queryD1(sql, [sessionId]);

    if (users.length === 0) {
      // Invalid session
      cookieStore.delete('auth_session');
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const user = users[0];
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
