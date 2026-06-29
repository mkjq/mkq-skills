import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// --- R2 (S3) Configuration ---
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const r2Client = s3Client;
export const R2_BUCKET = process.env.R2_BUCKET || 'mkq-skills';

// --- D1 (Database) Configuration ---
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_DATABASE_ID = process.env.CF_DATABASE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

/**
 * Runs a SQL query against the Cloudflare D1 database via the HTTP API.
 */
async function queryD1(sql: string, params: any[] = []): Promise<any[]> {
  if (!CF_ACCOUNT_ID || !CF_DATABASE_ID || !CF_API_TOKEN) {
    throw new Error('Cloudflare D1 credentials are not configured in environment variables.');
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
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
