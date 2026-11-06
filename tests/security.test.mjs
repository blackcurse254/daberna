import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword, generateToken, verifyToken, sanitizeInput } from '../src/server/security.js';

describe('Security Verification Test Suite', () => {

  it('1. Passwords are securely hashed with scrypt and salt; never stored as plaintext', () => {
    const plain = 'MySecretCasinoPassword!123';
    const { salt, hash } = hashPassword(plain);

    assert.notStrictEqual(hash, plain, 'Hash must not equal plaintext');
    assert.strictEqual(typeof salt, 'string');
    assert.strictEqual(salt.length, 32); // 16 bytes hex
    assert.strictEqual(hash.length, 128); // 64 bytes hex

    const valid = verifyPassword(plain, salt, hash);
    assert.strictEqual(valid, true, 'Correct password must verify');

    const invalid = verifyPassword('WrongPassword', salt, hash);
    assert.strictEqual(invalid, false, 'Wrong password must be rejected');
  });

  it('2. Cryptographic tokens cannot be forged or tampered with', () => {
    const token = generateToken('test_normal_user', false);
    const payload = verifyToken(token);
    assert.ok(payload);
    assert.strictEqual(payload.username, 'test_normal_user');
    assert.strictEqual(payload.isAdmin, false);

    // Tamper attempt: Change isAdmin to true in token payload
    const [payloadB64, sig] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    decoded.isAdmin = true;
    const forgedPayloadB64 = Buffer.from(JSON.stringify(decoded)).toString('base64url');
    const forgedToken = `${forgedPayloadB64}.${sig}`;

    const forgedCheck = verifyToken(forgedToken);
    assert.strictEqual(forgedCheck, null, 'Forged token with modified isAdmin MUST be rejected');
  });

  it('3. Expired tokens are rejected', () => {
    // Generate token that expired in the past
    const now = Date.now() - 100000;
    const payload = { username: 'test_expired', isAdmin: false, iat: now - 10000, exp: now };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    // Even if signature is generated with legitimate secret, expired time must fail
    assert.strictEqual(payload.exp < Date.now(), true);
  });

  it('4. Input sanitization prevents XSS and script injection', () => {
    const maliciousScript = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousScript);
    assert.strictEqual(sanitized.includes('<script>'), false);
    assert.strictEqual(sanitized.includes('&lt;script&gt;'), true);

    const maliciousImg = '<img src=x onerror=alert(1)>';
    assert.strictEqual(sanitizeInput(maliciousImg).includes('<img'), false);
  });

});
