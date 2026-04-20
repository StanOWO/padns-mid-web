import bcrypt from 'bcryptjs';
import { getUserByUsername, initDB } from '@/lib/db';
import { signToken, setTokenCookie } from '@/lib/auth';
import { csrfCheck, rateLimit, jsonResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  // Rate limit: 10 login attempts per minute per IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60_000)) {
    return jsonResponse({ error: '登入嘗試過於頻繁，請稍後再試' }, 429);
  }

  try {
    const body = await request.json();
    const username = (body.username || '').trim();
    const password = body.password || '';

    if (!username || !password) {
      return jsonResponse({ error: '請輸入帳號與密碼' }, 400);
    }

    await initDB();

    const user = await getUserByUsername(username);

    // Use constant-time comparison via bcrypt even if user not found
    if (!user) {
      // Hash a dummy to prevent timing attacks
      await bcrypt.hash('dummy', 12);
      return jsonResponse({ error: '帳號或密碼錯誤' }, 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return jsonResponse({ error: '帳號或密碼錯誤' }, 401);
    }

    const token = await signToken({ id: user.id, username: user.username });
    await setTokenCookie(token);

    return jsonResponse({
      user: { id: user.id, username: user.username, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Login error:', err);
    return jsonResponse({ error: '伺服器錯誤' }, 500);
  }
}
