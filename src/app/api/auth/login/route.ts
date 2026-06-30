import { NextResponse } from 'next/server';
import { queryD1, initializeD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await initializeD1(); // Ensure tables + admin user exist
    
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    const users = await queryD1(sql, [username, password]);

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const user = users[0];
    
    // Generate session ID
    const sessionId = crypto.randomUUID();
    
    // Update session in D1
    const updateSql = `UPDATE users SET session_id = ? WHERE id = ?`;
    await queryD1(updateSql, [sessionId, user.id]);

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

    return NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
