import bcrypt from 'bcryptjs';
import { createUser, getUserByUsername, initDB } from '@/lib/db';
import { signToken, setTokenCookie } from '@/lib/auth';
import {

export const dynamic = 'force-dynamic';
  csrfCheck, rateLimit, validateUsername, validatePassword,
  sanitize, jsonResponse,
} from '@/lib/security';

export async function POST(request) {
  // --- CSRF check ---
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  // --- Rate limit (5 registrations per minute per IP) ---
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 5, 60_000)) {
    return jsonResponse({ error: '請求過於頻繁，請稍後再試' }, 429);
  }

  try {
    const body = await request.json();
    const username = (body.username || '').trim();
    const password = body.password || '';

    // --- Input validation ---
    if (!validateUsername(username)) {
      return jsonResponse(
        { error: '帳號需 2-30 字元，僅限英文、數字、底線、連字號' }, 400
      );
    }
    if (!validatePassword(password)) {
      return jsonResponse({ error: '密碼需 4-128 字元' }, 400);
    }

    await initDB();

    // Check duplicate
    const existing = await getUserByUsername(username);
    if (existing) {
      return jsonResponse({ error: '此帳號已被使用' }, 409);
    }

    // Hash password with bcrypt (cost factor 12)
    const hashed = await bcrypt.hash(password, 12);
    // username is already validated by validateUsername() to only contain [a-zA-Z0-9_-]
    // No need to sanitize before storage; parameterized query prevents SQL injection
    const user = await createUser(username, hashed);

    // Issue JWT
    const token = await signToken({ id: user.id, username: user.username });
    await setTokenCookie(token);

    return jsonResponse({ user: { id: user.id, username: user.username } }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return jsonResponse({ error: '伺服器錯誤' }, 500);
  }
}
