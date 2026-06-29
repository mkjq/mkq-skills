import { NextResponse } from 'next/server';
import { getGlobalSettings, updateGlobalSettings, initializeD1 } from '@/lib/cloudflare';

export const runtime = 'edge';

export async function GET() {
  try {
    await initializeD1(); // Ensure table exists
    const settings = await getGlobalSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await updateGlobalSettings(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
