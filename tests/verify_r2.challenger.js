// tests/verify_r2.challenger.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const scriptPath = path.join(projectRoot, 'verify_r2.js');
const envFilePath = path.join(projectRoot, '.env.local');
const envFileBackupPath = path.join(projectRoot, '.env.local.temp_bak');

// Restore helper to ensure we never leave the env file renamed
function restoreEnvFile() {
  if (fs.existsSync(envFileBackupPath)) {
    if (fs.existsSync(envFilePath)) {
      fs.unlinkSync(envFilePath);
    }
    fs.renameSync(envFileBackupPath, envFilePath);
    console.log('[Runner] Restored .env.local');
  }
}

process.on('exit', restoreEnvFile);
process.on('SIGINT', () => {
  restoreEnvFile();
  process.exit(1);
});

function runCase({ env = {}, maskEnvFile = false, mockBehavior = null }) {
  return new Promise((resolve) => {
    if (maskEnvFile) {
      if (fs.existsSync(envFilePath)) {
        fs.renameSync(envFilePath, envFileBackupPath);
        console.log('[Runner] Temporarily masked .env.local');
      }
    }

    const args = [];
    if (mockBehavior) {
      args.push('-r', path.join(__dirname, 'mock_s3.js'));
    }
    args.push(scriptPath);

    const childEnv = { ...process.env, ...env };
    if (mockBehavior) {
      childEnv.MOCK_S3_BEHAVIOR = mockBehavior;
    }

    const child = spawn(process.execPath, args, {
      cwd: projectRoot,
      env: childEnv,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (maskEnvFile) {
        restoreEnvFile();
      }
      resolve({ code, stdout, stderr });
    });
  });
}

async function runAllTests() {
  console.log('==================================================');
  console.log('     verify_r2.js Challenger Verification Runner   ');
  console.log('==================================================\n');

  let failedTests = 0;

  // Helper to assert conditions
  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedTests++;
    }
  }

  // Test Case 1: Happy Path
  console.log('--------------------------------------------------');
  console.log('Test Case 1: Normal execution (Happy Path)');
  console.log('--------------------------------------------------');
  {
    const { code, stdout, stderr } = await runCase({});
    assert(code === 0, 'Should exit with code 0');
    assert(stdout.includes('🎉 Verification Status: SUCCESS'), 'Should output success status');
    assert(stdout.includes('--- Test 1: List Objects ---'), 'Should run Test 1');
    assert(stdout.includes('--- Test 2: Write Test Object ---'), 'Should run Test 2');
    assert(stdout.includes('--- Test 3: Read Test Object ---'), 'Should run Test 3');
    assert(stdout.includes('--- Test 4: Clean up (Delete Test Object) ---'), 'Should run Test 4');
  }

  // Test Case 2: Missing required environment variables
  console.log('\n--------------------------------------------------');
  console.log('Test Case 2: Missing required environment variables');
  console.log('--------------------------------------------------');
  {
    // Strip R2 variables from custom env
    const emptyR2Env = {
      R2_ACCESS_KEY_ID: '',
      R2_SECRET_ACCESS_KEY: '',
      R2_ENDPOINT: '',
      R2_BUCKET: '',
    };
    const { code, stdout, stderr } = await runCase({
      env: emptyR2Env,
      maskEnvFile: true,
    });
    assert(code === 1, 'Should exit with code 1');
    assert(stderr.includes('❌ Error: Missing required environment variables:'), 'Should output missing variables error');
    assert(stderr.includes('- R2_ACCESS_KEY_ID'), 'Should list missing R2_ACCESS_KEY_ID');
    assert(stderr.includes('- R2_SECRET_ACCESS_KEY'), 'Should list missing R2_SECRET_ACCESS_KEY');
    assert(stderr.includes('- R2_ENDPOINT'), 'Should list missing R2_ENDPOINT');
    assert(stderr.includes('- R2_BUCKET'), 'Should list missing R2_BUCKET');
  }

  // Test Case 3: Invalid access key/secret key
  console.log('\n--------------------------------------------------');
  console.log('Test Case 3: Invalid credentials');
  console.log('--------------------------------------------------');
  {
    const invalidCredentialsEnv = {
      R2_ACCESS_KEY_ID: 'invalid_access_key_value',
      R2_SECRET_ACCESS_KEY: 'invalid_secret_access_key_value',
    };
    const { code, stdout, stderr } = await runCase({ env: invalidCredentialsEnv });
    assert(code === 1, 'Should exit with code 1');
    assert(stdout.includes('❌ Verification Status: FAILURE'), 'Should output failure status');
    assert(stderr.includes('Failed to list objects'), 'Should fail to list objects');
  }

  // Test Case 4: Invalid Endpoint
  console.log('\n--------------------------------------------------');
  console.log('Test Case 4: Invalid Endpoint');
  console.log('--------------------------------------------------');
  {
    const invalidEndpointEnv = {
      R2_ENDPOINT: 'https://invalid-endpoint-url-xyz.r2.cloudflarestorage.com',
    };
    const { code, stdout, stderr } = await runCase({ env: invalidEndpointEnv });
    assert(code === 1, 'Should exit with code 1');
    assert(stdout.includes('❌ Verification Status: FAILURE'), 'Should output failure status');
    assert(stderr.includes('Failed to list objects'), 'Should fail to list objects');
  }

  // Test Case 5: Invalid Bucket Name
  console.log('\n--------------------------------------------------');
  console.log('Test Case 5: Invalid Bucket Name');
  console.log('--------------------------------------------------');
  {
    const invalidBucketEnv = {
      R2_BUCKET: 'invalid-bucket-name-xyz',
    };
    const { code, stdout, stderr } = await runCase({ env: invalidBucketEnv });
    assert(code === 1, 'Should exit with code 1');
    assert(stdout.includes('❌ Verification Status: FAILURE'), 'Should output failure status');
  }

  // Test Case 6: Content mismatch on Read (Test 3 fails, Test 4 cleanup succeeds)
  console.log('\n--------------------------------------------------');
  console.log('Test Case 6: Content mismatch cleanup verification');
  console.log('--------------------------------------------------');
  {
    const { code, stdout, stderr } = await runCase({ mockBehavior: 'GET_MISMATCH' });
    assert(code === 1, 'Should exit with code 1');
    assert(stderr.includes('⚠️ Warning: Content mismatch'), 'Should log warning for content mismatch');
    assert(stdout.includes('✅ Success! Cleaned up (deleted) temporary object'), 'Should still clean up/delete');
  }

  // Test Case 7: Read failure (Test 3 throws error, Test 4 cleanup succeeds)
  console.log('\n--------------------------------------------------');
  console.log('Test Case 7: Read failure cleanup verification');
  console.log('--------------------------------------------------');
  {
    const { code, stdout, stderr } = await runCase({ mockBehavior: 'GET_FAIL' });
    assert(code === 1, 'Should exit with code 1');
    assert(stderr.includes('❌ Failed to read object: Mocked S3 GetObject failure'), 'Should log read failure error');
    assert(stdout.includes('✅ Success! Cleaned up (deleted) temporary object'), 'Should still clean up/delete');
  }

  // Test Case 8: Delete failure handling
  console.log('\n--------------------------------------------------');
  console.log('Test Case 8: Delete failure handling');
  console.log('--------------------------------------------------');
  {
    const { code, stdout, stderr } = await runCase({ mockBehavior: 'DELETE_FAIL' });
    assert(code === 1, 'Should exit with code 1');
    assert(stderr.includes('❌ Failed to delete temporary object'), 'Should log delete failure error');
  }

  console.log('\n==================================================');
  if (failedTests === 0) {
    console.log('🎉 ALL CHALLENGER TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
    process.exit(0);
  } else {
    console.error(`❌ ${failedTests} CHALLENGER TEST(S) FAILED.`);
    console.log('==================================================');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Unhandled test execution error:', err);
  restoreEnvFile();
  process.exit(1);
});
