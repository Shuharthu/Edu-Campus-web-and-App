const crypto = require('crypto');

// Standard Node crypto HMAC-SHA256 JWT Generator
const header = { alg: 'HS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const payload = {
  sub: '411d36dc-3f13-4b9f-819f-d63f6be59dc1', // Admin user Tariq Mahmud
  userId: '411d36dc-3f13-4b9f-819f-d63f6be59dc1',
  email: 'tariq.mahmud@university.edu',
  roleTier: 'SUPER_ADMIN',
  institutionId: '11111111-1111-1111-1111-111111111111',
  campusId: '22222222-2222-2222-2222-222222222222',
  roles: ['super_admin', 'admin'],
  permissions: [
    { module: 'finance', action: 'view' },
    { module: 'finance', action: 'create' },
    { module: 'finance', action: 'edit' },
    { module: 'finance', action: 'approve' },
    { module: 'services', action: 'view' },
    { module: 'services', action: 'create' },
    { module: 'services', action: 'edit' },
    { module: 'services', action: 'approve' },
    { module: 'academics_setup', action: 'view' },
    { module: 'attendance', action: 'view' },
    { module: 'grades', action: 'view' }
  ],
  iat: now,
  exp: now + (7 * 24 * 3600), // 7 days valid
};

function base64Url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const secret = process.env.JWT_ACCESS_SECRET || 'smartedu_local_dev_jwt_access_secret_32chars_min_01';
const headB64 = base64Url(header);
const payB64 = base64Url(payload);
const sig = crypto.createHmac('sha256', secret)
  .update(`${headB64}.${payB64}`)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const token = `${headB64}.${payB64}.${sig}`;
console.log('JWT_TOKEN=' + token);
