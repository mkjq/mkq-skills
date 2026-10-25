/**
 * Password hashing with PBKDF2-SHA256 through WebCrypto (available in Cloudflare Workers and Node).
 *
 * Stored format: "pbkdf2$<iterations>$<saltHex>$<hashHex>".
 * The default iteration count is modest because the Workers free plan allows about 10 ms of CPU per
 * request (100k iterations take ~40 ms). Raise PASSWORD_ITERATIONS on a paid plan: older hashes — and
 * any legacy plaintext password still in the database — are upgraded on the user's next successful login.
 */
const ITERATIONS = Number(process.env.PASSWORD_ITERATIONS) || 10_000;
const PREFIX = 'pbkdf2';

const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string): Uint8Array<ArrayBuffer> => new Uint8Array((hex.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)));

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return toHex(new Uint8Array(bits));
}

/** Compares two strings in time independent of where they first differ. */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${PREFIX}$${ITERATIONS}$${toHex(salt)}$${await derive(password, salt, ITERATIONS)}`;
}

/**
 * Checks a password against what is stored. `needsRehash` is true when the stored value is legacy
 * plaintext or uses fewer iterations than configured — the caller should then save `hashPassword()`.
 */
export async function verifyPassword(password: string, stored: string | null | undefined): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (!stored || !password) return { ok: false, needsRehash: false };
  const parts = stored.split('$');
  if (parts.length === 4 && parts[0] === PREFIX) {
    const iterations = Number(parts[1]);
    const ok = safeEqual(await derive(password, fromHex(parts[2]), iterations), parts[3]);
    return { ok, needsRehash: ok && iterations < ITERATIONS };
  }
  // Legacy row stored before hashing was introduced.
  const ok = safeEqual(password, stored);
  return { ok, needsRehash: ok };
}
