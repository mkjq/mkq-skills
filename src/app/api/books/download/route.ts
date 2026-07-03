import { NextResponse } from 'next/server';
import { queryD1, getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing book ID' }, { status: 400 });
    }

    const sql = `SELECT title, fileKey FROM library_books WHERE id = ?`;
    const books = await queryD1(sql, [id]);
    const book = books[0];

    if (!book || !book.fileKey) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const s3Client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: book.fileKey,
    });

    const response = await s3Client.send(command);
    const stream = response.Body as any;

    const encodedFileName = encodeURIComponent(`${book.title}.pdf`);

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error downloading PDF:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
