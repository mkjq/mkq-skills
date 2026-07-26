import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket, queryD1, initializeD1 } from '@/lib/cloudflare';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getVaultPasscode(): Promise<string | null> {
  try {
    await initializeD1();
    const rows = await queryD1(`SELECT value FROM settings WHERE key = 'vault_passcode'`);
    if (rows && rows.length > 0 && rows[0].value) {
      return rows[0].value;
    }
  } catch {}
  return null;
}

async function isVaultAuthenticated(request: Request) {
  const headerToken = request.headers.get('x-vault-token');
  const targetPasscode = await getVaultPasscode();
  if (targetPasscode && headerToken && headerToken === targetPasscode) {
    return true;
  }
  const cookieStore = await cookies();
  const vaultAuth = cookieStore.get('vault_auth')?.value;
  return vaultAuth === 'authenticated';
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return null;
  const sql = `SELECT username, role FROM users WHERE session_id = ?`;
  const users = await queryD1(sql, [sessionId]);
  return users[0] || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key || typeof key !== 'string' || key.length > 256 || key.includes('..')) {
      return NextResponse.json({ success: false, error: 'مفتاح الملف غير صالح' }, { status: 400 });
    }

    // Access control based on file location
    if (key.startsWith('vault/')) {
      const isVaultAuth = await isVaultAuthenticated(request);
      if (!isVaultAuth) {
        return NextResponse.json({ success: false, error: 'غير مصرح: يتطلب الوصول للمكتبة الخاصة كلمة السر' }, { status: 401 });
      }
    } else if (key.startsWith('private/')) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ success: false, error: 'غير مصرح: يجب تسجيل الدخول لتحميل الملفات الخاصة' }, { status: 401 });
      }
      const parts = key.split('/');
      const owner = parts.length >= 3 ? parts[1] : '';
      if (user.role !== 'admin' && owner && owner !== user.username) {
        return NextResponse.json({ success: false, error: 'غير مصرح لك بتحميل هذا الملف الخاص' }, { status: 403 });
      }
    } else if (!key.startsWith('public/')) {
      return NextResponse.json({ success: false, error: 'مسار الملف غير مسموح' }, { status: 403 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);

    if (!response.Body) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const content = await response.Body.transformToString('utf-8');
    const rawFilename = key.split('/').pop() || 'file.md';
    const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9_.-]/g, '') || 'file.md';

    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(cleanFilename)}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
