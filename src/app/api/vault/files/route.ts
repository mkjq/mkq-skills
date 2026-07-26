import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket, queryD1, initializeD1 } from '@/lib/cloudflare';
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
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
  // 1. Check header token
  const headerToken = request.headers.get('x-vault-token');
  const targetPasscode = await getVaultPasscode();
  if (targetPasscode && headerToken && headerToken === targetPasscode) {
    return true;
  }

  // 2. Check cookie
  const cookieStore = await cookies();
  const vaultAuth = cookieStore.get('vault_auth')?.value;
  return vaultAuth === 'authenticated';
}

export async function GET(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول. يرجى إدخال كلمة السر الخاصة.' }, { status: 401 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    const prefix = 'vault/private/';

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });
    const response = await s3.send(command);

    const files = (response.Contents || [])
      .filter(item => item.Key && !item.Key.endsWith('/'))
      .map(item => {
        const parts = item.Key!.split('/');
        const filename = parts.pop() || item.Key!;
        const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || '' : '';
        return {
          key: item.Key!,
          filename,
          size: item.Size!,
          lastModified: item.LastModified!.toISOString(),
          extension: ext
        };
      });

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول. يرجى إدخال كلمة السر الخاصة.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'حجم الملف يتجاوز الحد الأقصى (50 ميجابايت)' }, { status: 400 });
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '');
    const safeFilename = cleanName.length > 128 ? cleanName.substring(0, 128) : (cleanName || 'uploaded_file');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const key = `vault/private/${safeFilename}`;
    const s3 = getR2Client();
    const bucket = getR2Bucket();

    // S3 Metadata keys/values MUST be ASCII safe
    const safeOriginalName = encodeURIComponent(file.name);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
        Metadata: {
          originalName: safeOriginalName,
          uploadedAt: new Date().toISOString(),
          vault: 'private'
        },
      })
    );

    return NextResponse.json({ success: true, key, filename: safeFilename, size: file.size });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول. يرجى إدخال كلمة السر الخاصة.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key || typeof key !== 'string' || key.length > 256 || key.includes('..') || !key.startsWith('vault/private/')) {
      return NextResponse.json({ success: false, error: 'مفتاح الملف غير صالح' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();

    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return NextResponse.json({ success: true, message: 'تم حذف الملف بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
