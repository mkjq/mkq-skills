import { NextResponse } from 'next/server';
import { queryD1, initializeD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return null;
  const users = await queryD1(`SELECT username, role FROM users WHERE session_id = ?`, [sessionId]);
  return users[0] || null;
}

// GET: fetch user's favorites OR popular files
export async function GET(request: Request) {
  try {
    await initializeD1();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'mine' | 'popular'

    if (type === 'popular') {
      // Top 6 most favorited files globally
      const rows = await queryD1(`
        SELECT file_key, filename, COUNT(*) as count
        FROM favorites
        GROUP BY file_key, filename
        ORDER BY count DESC
        LIMIT 6
      `);
      return NextResponse.json({ success: true, files: rows });
    }

    // type === 'mine' — user's own favorites
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: true, files: [] });
    }

    const rows = await queryD1(
      `SELECT file_key, filename, created_at FROM favorites WHERE username = ? ORDER BY created_at DESC`,
      [user.username]
    );
    return NextResponse.json({ success: true, files: rows, username: user.username });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: toggle favorite (add if not exists, remove if exists)
export async function POST(request: Request) {
  try {
    await initializeD1();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const { file_key, filename } = await request.json();
    if (!file_key || !filename) {
      return NextResponse.json({ success: false, error: 'file_key and filename are required' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await queryD1(
      `SELECT id FROM favorites WHERE username = ? AND file_key = ?`,
      [user.username, file_key]
    );

    if (existing.length > 0) {
      // Remove favorite
      await queryD1(`DELETE FROM favorites WHERE username = ? AND file_key = ?`, [user.username, file_key]);
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add favorite
      const id = crypto.randomUUID();
      await queryD1(
        `INSERT INTO favorites (id, username, file_key, filename) VALUES (?, ?, ?, ?)`,
        [id, user.username, file_key, filename]
      );
      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
