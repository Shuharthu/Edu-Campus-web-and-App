import { hashPassword, verifyPassword, encryptSecret, decryptSecret } from '../common/crypto.util';

describe('Crypto utilities', () => {
  it('hashes and verifies passwords with Argon2id', async () => {
    const hash = await hashPassword('SmartEdu#2026');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(await verifyPassword(hash, 'SmartEdu#2026')).toBe(true);
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });

  it('encrypts and decrypts MFA secrets with AES-256-GCM', () => {
    const key = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const cipher = encryptSecret('JBSWY3DPEHPK3PXP', key);
    expect(cipher).not.toContain('JBSWY3DPEHPK3PXP');
    expect(decryptSecret(cipher, key)).toBe('JBSWY3DPEHPK3PXP');
  });
});
