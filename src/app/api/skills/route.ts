import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: folder ? `${folder}/` : '',
    });
    const response = await s3.send(command);
    
    const files = (response.Contents || [])
      .filter(item => item.Key && !item.Key.endsWith('/'))
      .map(item => ({
        key: item.Key,
        filename: item.Key?.split('/').pop() || item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        folder: item.Key?.split('/')[0] || 'public',
      }));
    
    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { filename, content, folder } = await request.json();
    if (!filename || content === undefined) {
      return NextResponse.json({ success: false, error: 'Filename and content are required' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    const targetFolder = folder || 'private';
    const key = `${targetFolder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: 'text/markdown; charset=utf-8',
    });

    await s3.send(command);
    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
