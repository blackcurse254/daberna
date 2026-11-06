import crypto from 'crypto';

// Secret key for HMAC token signing (falls back to secure random if env is not provided)
const TOKEN_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface TokenPayload {
  username: string;
  isAdmin: boolean;
  exp: number;
  iat: number;
}

/**
 * Strong password hashing using Node.js scrypt (resistant to GPU/ASIC brute force)
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * Constant-time password verification to prevent timing attacks
 */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64);
    const storedHashBuf = Buffer.from(storedHash, 'hex');
    if (computedHash.length !== storedHashBuf.length) return false;
    return crypto.timingSafeEqual(computedHash, storedHashBuf);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically signed HMAC-SHA256 session token
 */
export function generateToken(username: string, isAdmin: boolean): string {
  const now = Date.now();
  const payload: TokenPayload = {
    username,
    isAdmin,
    iat: now,
    exp: now + TOKEN_EXPIRY_MS
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 session token
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, providedSignature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  // Constant-time signature comparison
  if (
    providedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Basic XSS sanitizer to neutralize injected HTML/script tags
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}
