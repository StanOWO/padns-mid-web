import { getSession } from '@/lib/auth';
import { getUserById, initDB } from '@/lib/db';
import { jsonResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session) {
      console.log('[me] No session found');
      return jsonResponse({ user: null }, 200, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
    }

    console.log('[me] Session:', session.id, session.username);

    await initDB();
    const user = await getUserById(session.id);

    console.log('[me] DB user found:', !!user, 'has avatar:', !!(user?.avatar), 'avatar length:', user?.avatar?.length || 0);

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
    console.error('[me] Error:', err.message);
    return jsonResponse({ user: null });
  }
}
