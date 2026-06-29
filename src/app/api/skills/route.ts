import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const s3 = getR2Client();
    const bucket = getR2Bucket();
    
    const command = new ListObjectsV2Command({ Bucket: bucket });
    const response = await s3.send(command);
    
    const files = (response.Contents || []).map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified
    }));
    
    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { filename, content } = await request.json();
    if (!filename || !content) {
      return NextResponse.json({ success: false, error: 'Filename and content are required' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: content,
      ContentType: 'text/markdown',
    });

    await s3.send(command);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
