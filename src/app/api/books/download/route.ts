import { NextRequest, NextResponse } from 'next/server';
import { getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { books } from '@/data/books';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('id');

  if (!bookId) {
    return NextResponse.json({ error: 'Missing book id' }, { status: 400 });
  }

  const book = books.find((b) => b.id === bookId);
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  try {
    const client = getR2Client();
    const bucket = getR2Bucket();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: book.fileKey,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
    }

    // Convert the readable stream to a Uint8Array
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(book.title)}.pdf"`,
        'Content-Length': totalLength.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Download error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to download book', details: message }, { status: 500 });
  }
}
