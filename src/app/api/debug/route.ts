import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { queryD1 } from '@/lib/cloudflare';

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
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const endpoint = process.env.R2_ENDPOINT || 'MISSING';
  const accessKey = process.env.R2_ACCESS_KEY_ID ? process.env.R2_ACCESS_KEY_ID.substring(0, 8) + '...' : 'MISSING';
  const secretKey = process.env.R2_SECRET_ACCESS_KEY ? 'SET (length: ' + process.env.R2_SECRET_ACCESS_KEY.length + ')' : 'MISSING';
  const bucket = process.env.R2_BUCKET || 'MISSING';
  const cfAccount = process.env.CF_ACCOUNT_ID ? process.env.CF_ACCOUNT_ID.substring(0, 8) + '...' : 'MISSING';
  const cfDatabase = process.env.CF_DATABASE_ID ? 'SET' : 'MISSING';
  const cfToken = process.env.CF_API_TOKEN ? 'SET (length: ' + process.env.CF_API_TOKEN.length + ')' : 'MISSING';

  // Try a direct fetch to R2 to see actual error
  let r2TestResult = 'not tested';
  try {
    const url = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}?list-type=2&max-keys=1`;
    const date = new Date().toUTCString();
    const r2Res = await fetch(url, {
      method: 'GET',
      headers: {
        'Date': date,
      }
    });
    r2TestResult = `status=${r2Res.status}, body=${(await r2Res.text()).substring(0, 200)}`;
  } catch (e: any) {
    r2TestResult = `error: ${e.message}`;
  }

  return NextResponse.json({
    env: { endpoint, accessKey, secretKey, bucket, cfAccount, cfDatabase, cfToken },
    r2DirectTest: r2TestResult,
    nodeEnv: process.env.NODE_ENV,
  });
}
