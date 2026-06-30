import { NextResponse } from 'next/server';
import { queryD1, initializeD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initializeD1(); // Ensure tables exist
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: true, user: null });
    }

    const sql = `SELECT username, role FROM users WHERE session_id = ?`;
    const users = await queryD1(sql, [sessionId]);

    if (users.length === 0) {
      // Invalid/expired session — clear cookie
      cookieStore.delete('auth_session');
      return NextResponse.json({ success: true, user: null });
    }

    const user = users[0];
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    // Don't crash the app if D1 is unreachable, just return no user
    console.error('Auth /me error:', error);
    return NextResponse.json({ success: true, user: null });
  }
}
