# Handoff Report: Cloudflare R2 Connection Verification Script Design (verify_r2.js)

## 1. Observation
We observed the following files and configurations in the `c:\Apps\Skills\skills-manager` directory:

- **`.env.local`** (lines 7-10):
  ```env
  R2_ACCESS_KEY_ID="bab56c56d10bc28d70c5120dc0b21adc"
  R2_SECRET_ACCESS_KEY="4a1b6551c6d0d89451dfeaea6f3ae9f29f4cb2b504195086b646ac0fbea8a7b5"
  R2_ENDPOINT="https://15272b79dac2d17ec9c3ea54519a674f.r2.cloudflarestorage.com"
  R2_BUCKET="mkq-skills"
  ```
- **`package.json`** (line 16):
  ```json
  "dependencies": {
    "@aws-sdk/client-s3": "^3.715.0",
    ...
  }
  ```
  Note: There is no `dotenv` or other environment loading package present under dependencies or devDependencies.
- **`src/lib/cloudflare.ts`** (lines 12-26):
  ```typescript
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
  ```

---

## 2. Logic Chain
1. **AWS SDK Availability**: Since `@aws-sdk/client-s3` (version `^3.715.0`) is already present in `package.json`, the verification script can directly import/require classes such as `S3Client`, `ListObjectsV2Command`, `PutObjectCommand`, `GetObjectCommand`, and `DeleteObjectCommand`.
2. **Environment Variable Loading**: Since `dotenv` is not installed, we have two options:
   - Requiring a manual parsing block inside `verify_r2.js` that opens `.env.local` and adds them to `process.env`.
   - Running the script with `node --env-file=.env.local verify_r2.js` (Node v20.6.0+).
   - Implementing a custom parse routine inside the script is the most portable choice. It avoids Node version restrictions, prevents introducing dependencies, and guarantees that variables loaded match exactly what is in `.env.local`.
3. **Connection Verification Scope**: A simple connection verification can be achieved by running `ListObjectsV2Command`. However, listing objects only confirms **Read** permission and network connectivity. Since the application performs uploads (e.g., in `src/app/api/skills/upload/route.ts`), it is crucial to verify **Write** and **Delete** permissions. Therefore, the logic structure of the verification script should execute the following operations in sequence:
   - **Step 1**: Load environment variables and validate presence of required keys.
   - **Step 2**: Initialize `S3Client` matching the parameters in `src/lib/cloudflare.ts` (using `region: 'auto'`).
   - **Step 3**: Execute `ListObjectsV2Command` to verify read permissions and basic connectivity.
   - **Step 4**: Upload a temporary text file with `PutObjectCommand` to verify write permissions.
   - **Step 5**: Download the test file with `GetObjectCommand` and check that the body contents match what was uploaded.
   - **Step 6**: Delete the temporary file with `DeleteObjectCommand` to clean the bucket.
4. **Stream Parsing (Node.js SDK v3)**: In AWS SDK v3, reading from the stream returned by `GetObjectCommand` is simplified via the `.transformToString()` method on the response `Body` stream. This is fully supported in `@aws-sdk/client-s3` version `^3.715.0`.

---

## 3. Caveats
- **IAM Token Permissions**: If the Cloudflare R2 token is configured as "Read-Only", the `ListObjectsV2Command` step will succeed, but the `PutObjectCommand` step will fail. The script must handle these error steps individually so the user is informed precisely which permission failed.
- **Node Version Compatibility**: The custom environment parser handles `.env.local` files containing empty lines, comments, and double/single quotes. It does not parse nested variable expansions (e.g., `VAR=$OTHER_VAR`), which is not used in the project's current `.env.local`.
- **CORS & Network Restrictions**: The script is intended to run in a backend Node.js environment where CORS is not applicable. 

---

## 4. Conclusion

### Script Design & Layout (`verify_r2.js`)
We propose placing `verify_r2.js` at the project root (`c:\Apps\Skills\skills-manager\verify_r2.js`). The complete proposed implementation is structured below:

```javascript
const fs = require('fs');
const path = require('path');
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');

// Helper to print styled log messages
function logSuccess(msg) {
  console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
}

function logError(msg, err) {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
  if (err) {
    console.error(`  Error Code: ${err.name || err.code}`);
    console.error(`  Error Message: ${err.message}`);
  }
}

function logInfo(msg) {
  console.log(`\x1b[36mℹ ${msg}\x1b[0m`);
}

// Custom dotenv parser to avoid external dependencies
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    logInfo('.env.local file not found in project root. Relying on system environment variables.');
    return;
  }

  try {
    const fileContent = fs.readFileSync(envPath, 'utf8');
    const lines = fileContent.split(/\r?\n/);
    let count = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Strip surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }

        process.env[key] = value;
        count++;
      }
    }
    logSuccess(`Loaded env variables from .env.local (${count} variables parsed).`);
  } catch (error) {
    logError('Failed to parse .env.local file', error);
  }
}

async function verifyR2() {
  logInfo('Starting Cloudflare R2 Connection Verification...');

  // 1. Load environment variables
  loadEnv();

  // 2. Validate environment variables
  const requiredVars = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ENDPOINT', 'R2_BUCKET'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  logInfo(`Endpoint: ${endpoint}`);
  logInfo(`Bucket:   ${bucket}`);
  logInfo(`Key ID:   ${accessKeyId.substring(0, 6)}... (length: ${accessKeyId.length})`);

  // 3. Instantiate S3Client
  let client;
  try {
    client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    logSuccess('S3Client instantiated successfully.');
  } catch (err) {
    logError('Failed to instantiate S3Client', err);
    process.exit(1);
  }

  // 4. Test Read Permissions (List Objects)
  logInfo('Testing Read Permissions (ListObjectsV2)...');
  try {
    const listResult = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 5,
      })
    );
    logSuccess(`Successfully connected to R2 and listed objects.`);
    const objectsFound = listResult.Contents ? listResult.Contents.length : 0;
    logInfo(`Found ${objectsFound} object(s) in bucket (limited to 5).`);
  } catch (err) {
    logError('Failed to list objects in bucket', err);
    process.exit(1);
  }

  // 5. Test Write & Delete Permissions (Put -> Get -> Delete)
  const testKey = `connection-test-${Date.now()}.txt`;
  const testContent = `R2 connection verification test file. Generated at ${new Date().toISOString()}`;

  logInfo(`Testing Write Permissions (PutObject) with key: ${testKey}...`);
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain; charset=utf-8',
      })
    );
    logSuccess('Successfully uploaded test object to bucket.');
  } catch (err) {
    logError('Failed to upload test object (Write Permission Check failed)', err);
    process.exit(1);
  }

  logInfo('Testing GetObject & Content Validation...');
  try {
    const getResult = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: testKey,
      })
    );
    
    // Convert body stream to string
    const downloadedContent = await getResult.Body.transformToString();
    if (downloadedContent === testContent) {
      logSuccess('Successfully downloaded test object and verified content matches.');
    } else {
      throw new Error(`Content mismatch! Sent: "${testContent}", Received: "${downloadedContent}"`);
    }
  } catch (err) {
    logError('Failed to download or verify test object', err);
    process.exit(1);
  }

  logInfo('Testing Delete Permissions (DeleteObject)...');
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: testKey,
      })
    );
    logSuccess('Successfully deleted test object. Cleanup completed.');
  } catch (err) {
    logError('Failed to delete test object (Delete Permission Check failed)', err);
    process.exit(1);
  }

  console.log('\n\x1b[32;1m🎉 Verification completed successfully! All R2 operations are fully operational. 🎉\x1b[0m\n');
}

verifyR2().catch(err => {
  logError('Unexpected fatal error during verification', err);
  process.exit(1);
});
```

### Running the Script
Run the script using Node.js from the project root:
```bash
node verify_r2.js
```

---

## 5. Verification Method

To verify this design before and after implementation:
1. **Validate NPM Packages**: Run `npm install` (or verify that `node_modules` exists) to ensure `@aws-sdk/client-s3` is installed.
2. **Execute Locally**: Once implemented, run `node verify_r2.js` to observe outputs.
3. **Simulate Failures**:
   - **Invalid Credentials**: Modify `.env.local` to use an invalid secret key or endpoint. Running `node verify_r2.js` should output an error at the listing step.
   - **Invalid Bucket**: Modify `.env.local` with an incorrect bucket name. Running the script should output a `NoSuchBucket` or similar S3 exception.
   - **Missing Environment File**: Temporarily rename `.env.local` to `.env.local.bak`. Running `node verify_r2.js` should report that the file was not found, search system environments, find nothing, and exit stating missing environment variables.
