import bcrypt from 'bcryptjs';
import { createUser, getUserByUsername, initDB } from '@/lib/db';
import { signToken, buildTokenCookie } from '@/lib/auth';
import {
  csrfCheck, rateLimit, validateUsername, validatePassword,
  jsonResponse,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 5, 60_000)) {
    return jsonResponse({ error: '請求過於頻繁，請稍後再試' }, 429);
  }

  try {
    const body = await request.json();
    const username = (body.username || '').trim();
    const password = body.password || '';

    if (!validateUsername(username)) {
      return jsonResponse(
        { error: '帳號需 2-30 字元，僅限英文、數字、底線、連字號' }, 400
      );
    }
    if (!validatePassword(password)) {
      return jsonResponse({ error: '密碼需 4-128 字元' }, 400);
    }

    await initDB();

    const existing = await getUserByUsername(username);
    if (existing) {
      return jsonResponse({ error: '此帳號已被使用' }, 409);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await createUser(username, hashed);

    const token = await signToken({ id: user.id, username: user.username });

    return jsonResponse(
      { user: { id: user.id, username: user.username } },
      201,
      { 'Set-Cookie': buildTokenCookie(token) }
    );
  } catch (err) {
    console.error('Register error:', err);
    return jsonResponse({ error: '伺服器錯誤' }, 500);
  }
}
