import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const safeEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

// --- R2 (S3) Configuration ---
// Always create a fresh client so we always use the current env vars
export const getR2Client = () => {
  const endpoint = safeEnv('R2_ENDPOINT');
  const accessKeyId = safeEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = safeEnv('R2_SECRET_ACCESS_KEY');

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not configured. Please set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.');
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
};

export const getR2Bucket = () => {
  const bucket = safeEnv('R2_BUCKET');
  if (!bucket) throw new Error('R2_BUCKET is not configured.');
  return bucket;
};

// --- D1 (Database) Configuration ---
const getD1Config = () => ({
  accountId: safeEnv('CF_ACCOUNT_ID'),
  databaseId: safeEnv('CF_DATABASE_ID'),
  apiToken: safeEnv('CF_API_TOKEN'),
});

/**
 * Runs a SQL query against the Cloudflare D1 database via the HTTP API.
 */
async function queryD1(sql: string, params: any[] = []): Promise<any[]> {
  const { accountId, databaseId, apiToken } = getD1Config();
  if (!accountId || !databaseId || !apiToken) {
    throw new Error('Cloudflare D1 credentials are not configured in environment variables.');
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params,
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('D1 Query Error:', errText);
    throw new Error(`D1 request failed with status ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    console.error('D1 API returned error:', data.errors);
    throw new Error('D1 Query failed: ' + JSON.stringify(data.errors));
  }

  // The result format is data.result[0].results
  return data.result[0].results || [];
}

/**
 * Initializes the settings table if it doesn't exist.
 */
export async function initializeD1() {
  const sql = `
    CREATE TABLE IF NOT EXISTS global_settings (
      id TEXT PRIMARY KEY,
      adminPassword TEXT,
      standardApiKey TEXT,
      openRouterApiKey TEXT,
      aiSystemPrompt TEXT
    );
  `;
  await queryD1(sql);

  // Insert default row if it doesn't exist
  const checkSql = `SELECT id FROM global_settings WHERE id = 'global'`;
  const result = await queryD1(checkSql);
  if (result.length === 0) {
    const insertSql = `
      INSERT INTO global_settings (id, adminPassword, standardApiKey, openRouterApiKey, aiSystemPrompt)
      VALUES ('global', '1010', '', '', 'أنا المساعد الذكي الخاص بك.')
    `;
    await queryD1(insertSql);
  }
}

/**
 * Fetches the global settings from D1.
 */
export async function getGlobalSettings() {
  const sql = `SELECT * FROM global_settings WHERE id = 'global'`;
  const results = await queryD1(sql);
  return results[0] || null;
}

/**
 * Updates the global settings in D1.
 */
export async function updateGlobalSettings(settings: any) {
  const sql = `
    UPDATE global_settings 
    SET 
      adminPassword = ?,
      standardApiKey = ?,
      openRouterApiKey = ?,
      aiSystemPrompt = ?
    WHERE id = 'global'
  `;
  const params = [
    settings.adminPassword || '',
    settings.standardApiKey || '',
    settings.openRouterApiKey || '',
    settings.aiSystemPrompt || ''
  ];
  await queryD1(sql, params);
}
