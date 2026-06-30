import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'public';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['text/markdown', 'text/plain', 'text/x-markdown', ''];
    const isAllowed =
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.markdown') ||
      allowedTypes.includes(file.type);

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

    // Prefix with folder (public/ or private/)
    const key = `${folder}/${mdFilename}`;

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
          folder,
        },
      })
    );

    return NextResponse.json({ success: true, key, filename: mdFilename });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
