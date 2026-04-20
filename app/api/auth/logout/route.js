import { clearTokenCookie } from '@/lib/auth';
import { csrfCheck, rateLimit, jsonResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 10, 60_000)) {
    return jsonResponse({ error: '請求過於頻繁' }, 429);
  }

  await clearTokenCookie();
  return jsonResponse({ ok: true });
}
