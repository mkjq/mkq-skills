import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket, queryD1, initializeD1 } from '@/lib/cloudflare';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

export async function GET(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 401 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();

    const command = new ListObjectsV2Command({ Bucket: bucket });
    const response = await s3.send(command);

    const allObjects = response.Contents || [];
    let totalSizeBytes = 0;
    let publicSkillsCount = 0;
    let privateSkillsCount = 0;
    let vaultFilesCount = 0;

    const files = allObjects
      .filter(item => item.Key && !item.Key.endsWith('/'))
      .map(item => {
        const size = item.Size || 0;
        totalSizeBytes += size;
        const key = item.Key!;

        if (key.startsWith('public/')) publicSkillsCount++;
        else if (key.startsWith('private/')) privateSkillsCount++;
        else if (key.startsWith('vault/')) vaultFilesCount++;

        return {
          key,
          size,
          lastModified: item.LastModified?.toISOString() || '',
          folder: key.split('/')[0]
        };
      });

    return NextResponse.json({
      success: true,
      stats: {
        totalFiles: files.length,
        totalSizeBytes,
        publicSkillsCount,
        privateSkillsCount,
        vaultFilesCount
      },
      files
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated(request);
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key || typeof key !== 'string' || key.length > 256 || key.includes('..')) {
      return NextResponse.json({ success: false, error: 'مطلوب مفتاح ملف صالح' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

    return NextResponse.json({ success: true, message: 'تم حذف الملف الإداري بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
