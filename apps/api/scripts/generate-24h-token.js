const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const header = { alg: 'HS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const payload = {
  sub: '6837c4c3-602e-42a6-9a79-1a9c7f6200d6',
  institutionId: '0c852567-0b1c-40b3-b5e7-bc7fbfd27dce',
  assignmentId: '558febba-af70-4274-8ed6-aec0308c3780',
  deviceId: '8d2eb9aa-8d1b-4e4f-9574-dfdc5c2bd6a1',
  iat: now,
  exp: now + 86400 * 7, // 7 days from now
};

const secret = 'smartedu_local_dev_jwt_access_secret_32chars_min_01';

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const data = `${encodedHeader}.${encodedPayload}`;

const signature = crypto
  .createHmac('sha256', secret)
  .update(data)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const token = `${data}.${signature}`;
console.log('TOKEN_7D:' + token);
