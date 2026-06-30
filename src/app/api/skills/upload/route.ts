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
    if (!user) {
      return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول لرفع الملفات' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    // folder sent from frontend: 'private' or 'public'
    const folder = (formData.get('folder') as string) || 'private';

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف' }, { status: 400 });
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

    // Convert to .md filename regardless of input extension
    const baseName = file.name.replace(/\.(txt|markdown)$/i, '');
    const mdFilename = baseName.endsWith('.md') ? baseName : `${baseName}.md`;

    // Store under folder/username/filename.md — always scoped to user
    const key = `${folder}/${user.username}/${mdFilename}`;

    const s3 = getR2Client();
    const bucket = getR2Bucket();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: text,
        ContentType: 'text/markdown; charset=utf-8',
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          owner: user.username,
          folder,
        },
      })
    );

    return NextResponse.json({ success: true, key, filename: mdFilename });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
