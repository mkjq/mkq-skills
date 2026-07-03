// tests/mock_s3.js
const s3 = require('@aws-sdk/client-s3');

const originalSend = s3.S3Client.prototype.send;

s3.S3Client.prototype.send = async function(command, options) {
  const commandName = command.constructor.name;
  const behavior = process.env.MOCK_S3_BEHAVIOR;

  if (behavior) {
    if (commandName === 'GetObjectCommand') {
      if (behavior === 'GET_FAIL') {
        throw new Error('Mocked S3 GetObject failure');
      }
      if (behavior === 'GET_MISMATCH') {
        return {
          Body: {
            transformToString: async () => 'mismatched content value'
          }
        };
      }
    }
    if (commandName === 'DeleteObjectCommand') {
      if (behavior === 'DELETE_FAIL') {
        throw new Error('Mocked S3 DeleteObject failure');
      }
    }
    if (commandName === 'PutObjectCommand') {
      if (behavior === 'PUT_FAIL') {
        throw new Error('Mocked S3 PutObject failure');
      }
    }
  }

  return originalSend.call(this, command, options);
};
