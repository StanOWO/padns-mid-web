import { SignJWT, jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: JWT_SECRET environment variable is not set!');
}
const SECRET = new TextEncoder().encode(
  jwtSecret || 'dev-only-secret-DO-NOT-USE-IN-PRODUCTION'
);

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

// Read session from request cookies — no next/headers needed
export async function getSession(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Build Set-Cookie header value for setting token
export function buildTokenCookie(token) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

// Build Set-Cookie header value for clearing token
export function buildClearCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}
