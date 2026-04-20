import { getSession } from '@/lib/auth';
import { updateAvatar, initDB } from '@/lib/db';
import {

export const dynamic = 'force-dynamic';
  csrfCheck, rateLimit, validateAvatarDataURL, jsonResponse,
} from '@/lib/security';

export async function POST(request) {
  if (!csrfCheck(request)) {
    return jsonResponse({ error: '請求來源不合法' }, 403);
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 5, 60_000)) {
    return jsonResponse({ error: '上傳過於頻繁' }, 429);
  }

  const session = await getSession();
  if (!session) {
    return jsonResponse({ error: '請先登入' }, 401);
  }

  try {
    const body = await request.json();
    const avatar = body.avatar;

    // Strict validation: only allow JPEG/PNG data URLs
    if (!validateAvatarDataURL(avatar)) {
      return jsonResponse(
        { error: '僅支援 JPG 和 PNG 格式，且大小不超過 2MB' }, 400
      );
    }

    // Additional check: verify the base64 content is valid image data
    // by checking magic bytes after decoding the first few bytes
    const base64Data = avatar.split(',')[1];
    if (!base64Data) {
      return jsonResponse({ error: '圖片資料格式錯誤' }, 400);
    }

    // Decode first 4 bytes to verify magic bytes
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
    await updateAvatar(session.id, avatar);

    return jsonResponse({ avatar });
  } catch (err) {
    console.error('Upload error:', err);
    return jsonResponse({ error: '上傳失敗' }, 500);
  }
}
