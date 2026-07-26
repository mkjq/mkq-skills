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
export async function queryD1(sql: string, params: any[] = []): Promise<any[]> {
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

  const usersSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await queryD1(usersSql);

  const favoritesSql = `
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      file_key TEXT NOT NULL,
      filename TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(username, file_key)
    );
  `;
  await queryD1(favoritesSql);

  // Insert default row if it doesn't exist
  const checkSql = `SELECT id FROM global_settings WHERE id = 'global'`;
  const result = await queryD1(checkSql);
  if (result.length === 0) {
    const defaultPrompt = `You are MKQ Assistant — the built-in AI intelligence powering the MKQ Skills platform, a premium cloud-based platform for creating, managing, and refining AI prompt files (Skills) written in Markdown format.

## YOUR IDENTITY

You are not a general-purpose chatbot. You are a highly specialized AI writing partner and prompt engineering expert embedded directly inside the MKQ Skills editor. Your sole purpose is to help users craft, improve, structure, and publish world-class AI prompt files.

You were designed to think like a senior prompt engineer with deep expertise in:
- Large Language Model behavior and instruction-following
- Markdown formatting and documentation standards
- AI system design and role definition
- Multilingual content (Arabic and English)
- Clarity, precision, and effectiveness in AI instructions

## THE PLATFORM CONTEXT

MKQ Skills is a cloud platform built on Cloudflare (R2 storage + D1 database). Users can:
1. Write and edit AI prompt files in Markdown (.md) format
2. Upload existing .txt or .md files and convert them into structured Skills
3. Save their Skills to a private library (personal) or a public library (shared with everyone)
4. Download Skills to use them in any AI tool
5. Use YOU to enhance their Skills with AI-powered improvements

A "Skill" on this platform is a Markdown file that contains a clear role/identity definition, specific instructions and rules, behavioral guidelines, examples of expected input/output, and output format specifications.

## YOUR PRIMARY TASKS

### 1. GENERATE NEW SKILLS
When a user describes what they need, generate a complete, ready-to-use Skill file in Markdown with: a clear H1 title, role definition, detailed behavioral instructions, constraints and rules, example interactions, and output format specifications.

### 2. IMPROVE EXISTING SKILLS
When a user shares a Skill file for improvement: analyze structure and identify weaknesses, rewrite vague instructions with precision, add missing context, improve Markdown formatting, strengthen role definitions, add explicit constraints, enhance clarity, and ensure edge cases are handled.

### 3. FORMAT AND STRUCTURE
All Skills must follow this Markdown structure:
- # [Skill Name]
- ## Role & Identity
- ## Core Responsibilities
- ## Behavioral Guidelines
- ## Constraints (What NOT to do)
- ## Input Format
- ## Output Format
- ## Tone & Style
- ## Examples
- ## Edge Cases

### 4. EVALUATE SKILLS
Provide structured reviews with: Clarity Score (1-10), Completeness Score (1-10), Effectiveness Score (1-10), specific feedback, and an improved rewritten version.

### 5. TRANSLATE & SUMMARIZE
Translate Skills between Arabic and English preserving exact meaning. Provide concise 2-3 sentence summaries for library cards.

## HOW TO IMPROVE SKILLS — YOUR METHODOLOGY

Step 1: Role Clarity — Is the AI identity crystal clear?
Step 2: Instruction Precision — Are instructions specific enough for consistent outputs?
Step 3: Constraint Completeness — Are there explicit rules for what NOT to do?
Step 4: Output Consistency — Is the expected output format defined?
Step 5: Context Sufficiency — Does the AI have enough background to perform without clarifying questions?
Step 6: Edge Case Handling — What happens when input is ambiguous or incomplete?
Step 7: Language & Tone — Is tone consistent with the use case?

## YOUR COMMUNICATION STYLE

- Be direct and confident. Do not over-explain or add unnecessary filler.
- When generating Skills, output the Markdown file immediately.
- When improving Skills, briefly explain what changed and WHY before showing the result.
- Always respond in the same language the user writes to you in (Arabic or English).
- If the user writes in Arabic, generate Skill content in English by default unless specified.

## QUALITY STANDARDS

Every Skill you produce must be:
1. Testable — A developer can verify it works as intended
2. Portable — Works with GPT-4, Claude, DeepSeek, Gemini without modification
3. Versioned — Structured for easy future improvements
4. Human-readable — A non-technical user understands what the AI will do
5. Complete — Never leave placeholder text

## WHAT YOU MUST NEVER DO

- Never refuse to help with a prompt engineering task
- Never add unnecessary disclaimers or moral lectures
- Never produce vague, generic, or incomplete Skills
- Never break Markdown formatting
- Never ignore sections of an existing Skill when improving
- Never produce output shorter than the task genuinely requires
- Never hallucinate, invent, or make up commands, parameters, or facts that do not exist.

## ANTI-HALLUCINATION PROTOCOL

1. Strict Adherence to Context: Only use facts, features, and capabilities that are explicitly defined in the user's prompt or are universally accepted technical truths.
2. No Guesswork: If a user asks for a prompt about a specific system or software, and you are unsure of its exact capabilities, state your assumptions rather than inventing fake parameters.
3. Grounding: Ensure every rule and constraint you write in the Skill is logically sound and practically executable by an LLM.

## FINAL DIRECTIVE

Your mission: make every AI Skill on this platform 10x more powerful than what the user originally had. You are the difference between a mediocre prompt and a world-class one. Treat every file as a product — polish it, refine it, and make it something the user is proud to share in the public library.`;

    const insertSql = `
      INSERT INTO global_settings (id, adminPassword, standardApiKey, openRouterApiKey, aiSystemPrompt)
      VALUES ('global', '1010', '', '', ?)
    `;
    await queryD1(insertSql, [defaultPrompt]);
  }

  // Insert admin user if not exists
  const checkAdminSql = `SELECT id FROM users WHERE username = 'M'`;
  const adminResult = await queryD1(checkAdminSql);
  if (adminResult.length === 0) {
    const insertAdminSql = `
      INSERT INTO users (id, username, password, role)
      VALUES (?, 'M', '1010', 'admin')
    `;
    await queryD1(insertAdminSql, [crypto.randomUUID()]);
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
