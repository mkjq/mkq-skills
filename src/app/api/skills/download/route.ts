import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, error: 'File key is required' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);

    if (!response.Body) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const content = await response.Body.transformToString('utf-8');
    const filename = key.split('/').pop() || 'file.md';

    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
