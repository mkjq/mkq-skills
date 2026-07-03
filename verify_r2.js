#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * verify_r2.js
 *
 * Standalone Node script to verify Cloudflare R2 credentials and bucket connection.
 * Can be run via:
 *   node verify_r2.js
 * Or:
 *   node --env-file=.env.local verify_r2.js
 */

const fs = require('fs');
const path = require('path');
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');

// 1. Fallback parser for environment variables if run without the --env-file flag
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

// Mask sensitive credentials for safe logging
function maskString(str) {
  if (!str) return 'undefined';
  if (str.length <= 8) return '********';
  return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
}

async function run() {
  console.log('==================================================');
  console.log('       Cloudflare R2 Connectivity Verification     ');
  console.log('==================================================\n');

  // Load env variables from .env.local if not already populated
  loadEnv();

  const requiredVars = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ENDPOINT', 'R2_BUCKET'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Error: Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease check your .env.local file in the project root.\n');
    process.exit(1);
  }

  console.log('✅ Configuration Loaded:');
  console.log(`   - R2_ACCESS_KEY_ID:     ${maskString(process.env.R2_ACCESS_KEY_ID)}`);
  console.log(`   - R2_SECRET_ACCESS_KEY: ${maskString(process.env.R2_SECRET_ACCESS_KEY)}`);
  console.log(`   - R2_ENDPOINT:          ${process.env.R2_ENDPOINT}`);
  console.log(`   - R2_BUCKET:            ${process.env.R2_BUCKET}\n`);

  console.log('🔄 Instantiating S3 Client...');
  let client;
  try {
    client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    console.log('✅ S3 Client instantiated successfully.\n');
  } catch (err) {
    console.error('❌ Failed to instantiate S3 Client:', err.message);
    process.exit(1);
  }

  const bucket = process.env.R2_BUCKET;
  let testPassed = true;

  // Test 1: List objects (Verifies Read/List permissions)
  console.log('--- Test 1: List Objects ---');
  try {
    const listCmd = new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 });
    const response = await client.send(listCmd);
    const count = response.Contents ? response.Contents.length : 0;
    console.log(`✅ Success! Listed objects. Found: ${count} objects (capped at 5 in list query).`);
  } catch (err) {
    console.error('❌ Failed to list objects:', err.message);
    testPassed = false;
  }
  console.log('');

  // Test 2: Write Test Object (Verifies Write permissions)
  console.log('--- Test 2: Write Test Object ---');
  const testKey = `.verify-r2-temp-${Date.now()}.txt`;
  const testContent = `R2 verification test content run at ${new Date().toISOString()}`;
  try {
    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    await client.send(putCmd);
    console.log(`✅ Success! Created temporary object with key: "${testKey}"`);
  } catch (err) {
    console.error('❌ Failed to write object:', err.message);
    testPassed = false;
  }
  console.log('');

  // Test 3: Read Test Object (Verifies Read/Download permissions)
  if (testPassed) {
    console.log('--- Test 3: Read Test Object ---');
    try {
      const getCmd = new GetObjectCommand({
        Bucket: bucket,
        Key: testKey,
      });
      const response = await client.send(getCmd);
      
      let bodyString = '';
      if (response.Body) {
        if (typeof response.Body.transformToString === 'function') {
          bodyString = await response.Body.transformToString();
        } else {
          // Fallback stream reader
          const chunks = [];
          for await (const chunk of response.Body) {
            chunks.push(chunk);
          }
          bodyString = Buffer.concat(chunks).toString('utf8');
        }
      }

      if (bodyString === testContent) {
        console.log('✅ Success! Read temporary object and verified exact matching content.');
      } else {
        console.warn(`⚠️ Warning: Content mismatch. Expected: "${testContent}", got: "${bodyString}"`);
        testPassed = false;
      }
    } catch (err) {
      console.error('❌ Failed to read object:', err.message);
      testPassed = false;
    }
    console.log('');
  }

  // Test 4: Clean up (Verifies Delete permissions)
  if (testKey) {
    console.log('--- Test 4: Clean up (Delete Test Object) ---');
    try {
      const deleteCmd = new DeleteObjectCommand({
        Bucket: bucket,
        Key: testKey,
      });
      await client.send(deleteCmd);
      console.log(`✅ Success! Cleaned up (deleted) temporary object: "${testKey}"`);
    } catch (err) {
      console.error(`❌ Failed to delete temporary object "${testKey}":`, err.message);
      console.error('⚠️ Note: You may want to manually delete this file from your bucket.');
      testPassed = false;
    }
    console.log('');
  }

  console.log('==================================================');
  if (testPassed) {
    console.log('🎉 Verification Status: SUCCESS');
    console.log('   All R2 operations completed successfully.');
    console.log('==================================================');
    process.exit(0);
  } else {
    console.log('❌ Verification Status: FAILURE');
    console.log('   One or more R2 operations failed. Check logs above.');
    console.log('==================================================');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Unexpected error during verification run:', err);
  process.exit(1);
});
