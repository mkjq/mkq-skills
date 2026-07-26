import { NextResponse } from 'next/server';
import { queryD1, initializeD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function isVaultAuthenticated() {
  const cookieStore = await cookies();
  const vaultAuth = cookieStore.get('vault_auth')?.value;
  return vaultAuth === 'authenticated';
}

export async function POST(request: Request) {
  try {
    const isAuth = await isVaultAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بتغيير الإعدادات' }, { status: 401 });
    }

    const { newPasscode } = await request.json();
    if (!newPasscode || newPasscode.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'كلمة السر الجديدة يجب أن تكون مكونة من 4 أرقام أو رموز على الأقل' }, { status: 400 });
    }

    await initializeD1();
    
    // Ensure settings table exists
    await queryD1(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
    await queryD1(`INSERT OR REPLACE INTO settings (key, value) VALUES ('vault_passcode', ?)`, [newPasscode.trim()]);

    return NextResponse.json({ success: true, message: 'تم تغيير كلمة السر بنجاح!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
