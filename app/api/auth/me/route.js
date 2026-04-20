import { getSession } from '@/lib/auth';
import { getUserById, initDB } from '@/lib/db';
import { jsonResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await initDB();
    const session = await getSession(request);

    if (!session) {
      return jsonResponse({ user: null }, 200, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
    }

    const user = await getUserById(session.id);
    if (!user) {
      return jsonResponse({ user: null }, 200, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
    }

    return jsonResponse({
      user: { id: user.id, username: user.username, avatar: user.avatar || null },
    }, 200, {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    });
  } catch (err) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    return jsonResponse({ user: null });
  }
}
