import { NextResponse } from 'next/server';
import { queryD1, getR2Client, getR2Bucket } from '@/lib/cloudflare';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = `SELECT * FROM library_books ORDER BY created_at DESC`;
    const books = await queryD1(sql);
    return NextResponse.json({ success: true, books });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, title, author, category, description, fileKey, coverImage } = await req.json();
    
    if (!id || !title || !fileKey) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const sql = `
      INSERT INTO library_books (id, title, author, category, description, fileKey, coverImage)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await queryD1(sql, [id, title, author, category, description, fileKey, coverImage]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, author, category, description, coverImage } = await req.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing book ID' }, { status: 400 });
    }

    const sql = `
      UPDATE library_books 
      SET title = ?, author = ?, category = ?, description = ?, coverImage = ?
      WHERE id = ?
    `;
    await queryD1(sql, [title, author, category, description, coverImage, id]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing book ID' }, { status: 400 });
    }

    // First get the fileKey so we can delete from R2
    const getSql = `SELECT fileKey FROM library_books WHERE id = ?`;
    const book = await queryD1(getSql, [id]);
    
    if (book && book.length > 0 && book[0].fileKey) {
      const s3Client = getR2Client();
      await s3Client.send(new DeleteObjectCommand({
        Bucket: getR2Bucket(),
        Key: book[0].fileKey
      }));
    }

    // Delete from DB
    const sql = `DELETE FROM library_books WHERE id = ?`;
    await queryD1(sql, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
