import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket, queryD1, initializeD1 } from '@/lib/cloudflare';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export async function POST(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول للمكتبة الخاصة' }, { status: 401 });
    }

    const { filename, contentType } = await request.json();
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ success: false, error: 'اسم الملف مطلوب' }, { status: 400 });
    }

    const cleanName = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
    const safeFilename = cleanName.length > 128 ? cleanName.substring(0, 128) : cleanName;
    if (!safeFilename) {
      return NextResponse.json({ success: false, error: 'اسم الملف غير صالح' }, { status: 400 });
    }

    const safeContentType = typeof contentType === 'string' && contentType.length <= 64 ? contentType : 'application/octet-stream';

    const key = `vault/private/${safeFilename}`;
    const s3 = getR2Client();
    const bucket = getR2Bucket();
    const safeOriginalName = encodeURIComponent(safeFilename);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: safeContentType,
      Metadata: {
        originalName: safeOriginalName,
        uploadedAt: new Date().toISOString(),
        vault: 'private'
      }
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return NextResponse.json({ success: true, uploadUrl, key });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
