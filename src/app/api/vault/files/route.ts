import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function isVaultAuthenticated() {
  const cookieStore = await cookies();
  const vaultAuth = cookieStore.get('vault_auth')?.value;
  return vaultAuth === 'authenticated';
}

export async function GET() {
  try {
    const isAuth = await isVaultAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول للمكتبة الخاصة' }, { status: 401 });
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
    const isAuth = await isVaultAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول للمكتبة الخاصة' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Universal upload: accepts ANY file type
    const key = `vault/private/${file.name}`;
    const s3 = getR2Client();
    const bucket = getR2Bucket();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          vault: 'private'
        },
      })
    );

    return NextResponse.json({ success: true, key, filename: file.name, size: file.size });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول للمكتبة الخاصة' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();

    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return NextResponse.json({ success: true, message: 'تم حذف الملف بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
