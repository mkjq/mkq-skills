import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket, queryD1, initializeD1 } from '@/lib/cloudflare';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return null;
  const sql = `SELECT username, role FROM users WHERE session_id = ?`;
  const users = await queryD1(sql, [sessionId]);
  return users[0] || null;
}

export async function POST(request: Request) {
  try {
    await initializeD1();
    const user = await getCurrentUser();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    // folder sent from frontend: 'private' or 'public'
    const folder = (formData.get('folder') as string) || 'public';

    if (!user && folder === 'private') {
      return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول لرفع الملفات الخاصة' }, { status: 401 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'حجم الملف يتجاوز الحد الأقصى (10 ميجابايت)' }, { status: 400 });
    }

    const isAllowed =
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.markdown');

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. مسموح فقط بملفات .md و .txt' },
        { status: 400 }
      );
    }

    const text = await file.text();

    // Convert to .md filename regardless of input extension and sanitize filename
    const rawBaseName = file.name.replace(/\.(txt|markdown|md)$/i, '');
    const cleanBaseName = rawBaseName.replace(/[^a-zA-Z0-9_.-]/g, '');
    const safeBaseName = cleanBaseName.length > 120 ? cleanBaseName.substring(0, 120) : (cleanBaseName || 'skill');
    const mdFilename = `${safeBaseName}.md`;

    // Store under folder/username/filename.md — guest for unauthenticated
    const targetFolder = (typeof folder === 'string' && (folder === 'private' || folder === 'public')) ? folder : 'public';
    const username = user ? user.username : 'guest';
    const key = `${targetFolder}/${username}/${mdFilename}`;

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    const safeOriginalName = encodeURIComponent(mdFilename);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: text,
        ContentType: 'text/markdown; charset=utf-8',
        Metadata: {
          originalName: safeOriginalName,
          uploadedAt: new Date().toISOString(),
          owner: username,
          folder,
        },
      })
    );

    return NextResponse.json({ success: true, key, filename: mdFilename });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
