import { NextResponse } from 'next/server';
import { queryD1, initializeD1 } from '@/lib/cloudflare';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// In-memory fallback attempt tracker for IP/Sessions
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

async function getVaultPasscode(): Promise<string | null> {
  try {
    await initializeD1();
    const rows = await queryD1(`SELECT value FROM settings WHERE key = 'vault_passcode'`);
    if (rows && rows.length > 0 && rows[0].value) {
      return rows[0].value;
    }
  } catch {}
  return null;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value || 'guest_client';
    const clientIp = request.headers.get('x-forwarded-for') || 'default_ip';
    const trackerKey = `${clientIp}_${sessionId}`;

    const now = Date.now();
    const record = failedAttemptsMap.get(trackerKey) || { count: 0, lockedUntil: 0 };

    // Check if locked
    if (record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return NextResponse.json({
        success: false,
        locked: true,
        message: 'على مهلك حبيبي جرب بعدين ✋🐢',
        remainingSeconds
      }, { status: 429 });
    }

    const { passcode } = await request.json();
    if (!passcode || typeof passcode !== 'string' || passcode.length > 64) {
      return NextResponse.json({ success: false, error: 'كلمة السر غير صحيحة' }, { status: 400 });
    }

    const targetPasscode = await getVaultPasscode();

    if (targetPasscode && passcode === targetPasscode) {
      // Reset attempts on success
      failedAttemptsMap.delete(trackerKey);
      
      // Set session cookie for vault access
      const res = NextResponse.json({ success: true, message: 'مرحباً بك في مكتبتك الخاصة!' });
      res.cookies.set('vault_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });
      return res;
    } else {
      // Increment failed attempts
      record.count += 1;
      if (record.count >= 5) {
        record.lockedUntil = now + (3 * 60 * 1000); // 3 minutes lockout
        failedAttemptsMap.set(trackerKey, record);
        return NextResponse.json({
          success: false,
          locked: true,
          message: 'على مهلك حبيبي جرب بعدين ✋🐢',
          remainingSeconds: 180
        }, { status: 429 });
      }

      failedAttemptsMap.set(trackerKey, record);
      const attemptsLeft = 5 - record.count;
      return NextResponse.json({
        success: false,
        error: `كلمة السر غير صحيحة. متبقي لديك ${attemptsLeft} محاولات قبل الحظر.`,
        attemptsLeft
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const vaultAuth = cookieStore.get('vault_auth')?.value;
    const isAuth = vaultAuth === 'authenticated';
    return NextResponse.json({ success: true, authenticated: isAuth });
  } catch (error: any) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 500 });
  }
}
