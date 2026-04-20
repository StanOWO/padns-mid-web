import { sql } from '@vercel/postgres';
import { getSession } from '@/lib/auth';
import { updateAvatar, initDB } from '@/lib/db';
import {
  csrfCheck, rateLimit, validateAvatarDataURL, jsonResponse,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 5, 60_000)) {
    return jsonResponse({ error: '上傳過於頻繁' }, 429);
  }

  const session = await getSession(request);
  if (!session) {
    return jsonResponse({ error: '請先登入' }, 401);
  }

  try {
    const body = await request.json();
    const avatar = body.avatar;

    if (!validateAvatarDataURL(avatar)) {
      return jsonResponse(
        { error: '僅支援 JPG 和 PNG 格式，且大小不超過 2MB' }, 400
      );
    }

    const base64Data = avatar.split(',')[1];
    if (!base64Data) {
      return jsonResponse({ error: '圖片資料格式錯誤' }, 400);
    }

    const bytes = Buffer.from(base64Data.substring(0, 8), 'base64');
    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 &&
                  bytes[2] === 0x4E && bytes[3] === 0x47;

    if (!isJPEG && !isPNG) {
      return jsonResponse(
        { error: '檔案內容不是有效的 JPG/PNG 圖片' }, 400
      );
    }

    await initDB();

    // Save with RETURNING to verify
    const result = await sql`
      UPDATE users SET avatar = ${avatar} WHERE id = ${session.id}
      RETURNING id, LENGTH(avatar) as saved_length
    `;
    const saved = result.rows[0];
    console.log('[upload] saved:', saved, 'input length:', avatar.length);

    // Read back to verify persistence
    const verify = await sql`SELECT LENGTH(avatar) as len FROM users WHERE id = ${session.id}`;
    console.log('[upload] verify read-back:', verify.rows[0]);

    return jsonResponse({ avatar, _debug: { saved, verified: verify.rows[0] } });
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error('Upload error:', err);
    return jsonResponse({ error: '上傳失敗: ' + err.message }, 500);
  }
}
