import { NextResponse } from 'next/server';
import { queryD1, initializeD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';
import { hashPassword, verifyPassword } from '@/lib/password';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await initializeD1(); // Ensure tables + admin user exist
    
    const { username, password } = await req.json();

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string' || username.length > 64 || password.length > 128) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان بالشكل الصحيح' }, { status: 400 });
    }

    const users = await queryD1(`SELECT * FROM users WHERE username = ?`, [username]);
    const user = users[0];
    const check = await verifyPassword(password, user?.password);

    if (!user || !check.ok) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Update session in D1 (and replace a legacy plaintext / weaker hash with the current one)
    if (check.needsRehash) {
      await queryD1(`UPDATE users SET session_id = ?, password = ? WHERE id = ?`, [sessionId, await hashPassword(password), user.id]);
    } else {
      await queryD1(`UPDATE users SET session_id = ? WHERE id = ?`, [sessionId, user.id]);
    }

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
