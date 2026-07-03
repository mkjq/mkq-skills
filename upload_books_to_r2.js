/**
 * Upload all book PDFs from c:\Apps\Books\assets\raw_books to Cloudflare R2
 * under the "books/" prefix in the mkq-skills bucket.
 */

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET || 'mkq-skills';
const SOURCE_DIR = 'c:\\Apps\\Books\\assets\\raw_books';

async function fileExistsInR2(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadBooks() {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.pdf'));
  console.log(`Found ${files.length} PDF files to upload.\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const key = `books/${file}`;
    const filePath = path.join(SOURCE_DIR, file);
    const fileSize = fs.statSync(filePath).size;
    
    // Skip tiny/corrupt files (< 1KB)
    if (fileSize < 1024) {
      console.log(`⏭️  Skipping ${file} (too small: ${fileSize} bytes)`);
      skipped++;
      continue;
    }

    // Check if already uploaded
    const exists = await fileExistsInR2(key);
    if (exists) {
      console.log(`✅ Already exists: ${key}`);
      skipped++;
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
      console.log(`⬆️  Uploading ${file} (${sizeMB} MB)...`);
      
      await client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/pdf',
      }));

      console.log(`   ✅ Done: ${key}`);
      uploaded++;
    } catch (err) {
      console.error(`   ❌ Failed: ${file} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n========== SUMMARY ==========`);
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`Total:      ${files.length}`);
}

uploadBooks().catch(console.error);
