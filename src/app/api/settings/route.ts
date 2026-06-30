import { NextResponse } from 'next/server';
import { getGlobalSettings, updateGlobalSettings, initializeD1, queryD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return false;
  const sql = `SELECT role FROM users WHERE session_id = ?`;
  const users = await queryD1(sql, [sessionId]);
  return users[0]?.role === 'admin';
}

export async function GET() {
  try {
    await initializeD1(); // Ensure table exists
    const settings = await getGlobalSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin only' }, { status: 403 });
    }
    
    const body = await request.json();
    await updateGlobalSettings(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
