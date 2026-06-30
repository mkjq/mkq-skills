import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user exists
    const checkSql = `SELECT id FROM users WHERE username = ?`;
    const existing = await queryD1(checkSql, [username]);

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Username already exists' }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    // Create user
    const insertSql = `INSERT INTO users (id, username, password, role, session_id) VALUES (?, ?, ?, ?, ?)`;
    await queryD1(insertSql, [userId, username, password, 'user', sessionId]);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_session',
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true, user: { username, role: 'user' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
