import { getSession } from '@/lib/auth';
import { getMessages, createMessage, deleteMessage, initDB } from '@/lib/db';
import {

export const dynamic = 'force-dynamic';
  csrfCheck, rateLimit, sanitize, stripTags, jsonResponse,
} from '@/lib/security';

// GET /api/messages — public, list messages
export async function GET() {
  try {
    await initDB();
    const messages = await getMessages();

    // Sanitize all user-generated content before sending to client
    // (defense-in-depth: React also escapes, but we sanitize server-side too)
    const safe = messages.map(m => ({
      id: m.id,
      user_id: m.user_id,
      username: sanitize(m.username),
      avatar: m.avatar, // validated on upload, always data:image/...
      content: sanitize(m.content),
      created_at: m.created_at,
    }));

    return jsonResponse({ messages: safe });
  } catch (err) {
    console.error('Messages GET error:', err);
    return jsonResponse({ error: '無法載入留言' }, 500);
  }
}

// POST /api/messages — authenticated, create message
export async function POST(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 20, 60_000)) {
    return jsonResponse({ error: '留言過於頻繁，請稍後再試' }, 429);
  }

  const session = await getSession();
  if (!session) {
    return jsonResponse({ error: '請先登入' }, 401);
  }

  try {
    const body = await request.json();
    let content = body.content;

    if (typeof content !== 'string') {
      return jsonResponse({ error: '留言內容不正確' }, 400);
    }

    // Strip HTML tags to prevent stored XSS
    content = stripTags(content).trim();

    if (!content || content.length > 500) {
      return jsonResponse({ error: '留言內容需 1-500 字元' }, 400);
    }

    await initDB();
    // Note: sql`` tagged template uses parameterized queries → immune to SQL injection
    const msg = await createMessage(session.id, content);

    return jsonResponse({ message: msg }, 201);
  } catch (err) {
    console.error('Messages POST error:', err);
    return jsonResponse({ error: '無法發送留言' }, 500);
  }
}

// DELETE /api/messages — authenticated, delete own message
export async function DELETE(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  const session = await getSession();
  if (!session) {
    return jsonResponse({ error: '請先登入' }, 401);
  }

  try {
    const body = await request.json();
    const id = parseInt(body.id, 10);

    if (!id || isNaN(id)) {
      return jsonResponse({ error: '無效的留言 ID' }, 400);
    }

    await initDB();
    // Only delete if user owns the message (parameterized query)
    const deleted = await deleteMessage(id, session.id);

    if (!deleted) {
      return jsonResponse({ error: '找不到留言或無權刪除' }, 404);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('Messages DELETE error:', err);
    return jsonResponse({ error: '無法刪除留言' }, 500);
  }
}
