import { NextResponse } from 'next/server';
import { books } from '@/data/books';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ books });
}
