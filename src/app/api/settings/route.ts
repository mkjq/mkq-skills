import { NextResponse } from 'next/server';
import { getGlobalSettings, updateGlobalSettings, initializeD1, queryD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return false;
  const sql = `SELECT role FROM users WHERE session_id = ?`;
  const users = await queryD1(sql, [sessionId]);
  return users[0]?.role === 'admin';
}

export async function GET() {
  try {
    await initializeD1(); // Ensure table exists
    const settings = await getGlobalSettings();
    const isAdmin = await verifyAdmin();

    if (!settings) {
      return NextResponse.json({ success: true, settings: null });
    }

    if (!isAdmin) {
      // Redact sensitive credentials for non-admin callers
      return NextResponse.json({
        success: true,
        settings: {
          ...settings,
          adminPassword: '',
          standardApiKey: '',
          openRouterApiKey: '',
        }
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin only' }, { status: 403 });
    }
    
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const { adminPassword, standardApiKey, openRouterApiKey, aiSystemPrompt } = body;

    if (adminPassword !== undefined && typeof adminPassword !== 'string') {
      return NextResponse.json({ success: false, error: 'adminPassword must be a string' }, { status: 400 });
    }
    if (standardApiKey !== undefined && typeof standardApiKey !== 'string') {
      return NextResponse.json({ success: false, error: 'standardApiKey must be a string' }, { status: 400 });
    }
    if (openRouterApiKey !== undefined && typeof openRouterApiKey !== 'string') {
      return NextResponse.json({ success: false, error: 'openRouterApiKey must be a string' }, { status: 400 });
    }
    if (aiSystemPrompt !== undefined && typeof aiSystemPrompt !== 'string') {
      return NextResponse.json({ success: false, error: 'aiSystemPrompt must be a string' }, { status: 400 });
    }

    // Length caps
    if (adminPassword && adminPassword.length > 128) {
      return NextResponse.json({ success: false, error: 'adminPassword too long' }, { status: 400 });
    }
    if (standardApiKey && standardApiKey.length > 256) {
      return NextResponse.json({ success: false, error: 'standardApiKey too long' }, { status: 400 });
    }
    if (openRouterApiKey && openRouterApiKey.length > 256) {
      return NextResponse.json({ success: false, error: 'openRouterApiKey too long' }, { status: 400 });
    }
    if (aiSystemPrompt && aiSystemPrompt.length > 20000) {
      return NextResponse.json({ success: false, error: 'aiSystemPrompt too long (max 20,000 characters)' }, { status: 400 });
    }

    const validatedSettings = {
      adminPassword: typeof adminPassword === 'string' ? adminPassword : '',
      standardApiKey: typeof standardApiKey === 'string' ? standardApiKey : '',
      openRouterApiKey: typeof openRouterApiKey === 'string' ? openRouterApiKey : '',
      aiSystemPrompt: typeof aiSystemPrompt === 'string' ? aiSystemPrompt : '',
    };

    await updateGlobalSettings(validatedSettings);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
