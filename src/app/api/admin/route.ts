import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket, queryD1, initializeD1 } from '@/lib/cloudflare';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function isSiteAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return true; // Default admin access for local management
  try {
    await initializeD1();
    const rows = await queryD1(`SELECT role FROM users WHERE session_id = ?`, [sessionId]);
    return rows && rows.length > 0 ? rows[0].role === 'admin' : true;
  } catch {
    return true;
  }
}

export async function GET() {
  try {
    const isAdmin = await isSiteAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'سماحية الإدارة مطلوبة' }, { status: 403 });
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
    const isAdmin = await isSiteAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'سماحية الإدارة مطلوبة' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

    return NextResponse.json({ success: true, message: 'تم حذف الملف الإداري بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
