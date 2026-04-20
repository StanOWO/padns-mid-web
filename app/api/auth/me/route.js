import { getSession } from '@/lib/auth';
import { getUserById, initDB } from '@/lib/db';
import { jsonResponse } from '@/lib/security';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return jsonResponse({ user: null });
    }

    await initDB();
    const user = await getUserById(session.id);
    if (!user) {
      return jsonResponse({ user: null });
    }

    return jsonResponse({
      user: { id: user.id, username: user.username, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Me error:', err);
    return jsonResponse({ user: null });
  }
}
