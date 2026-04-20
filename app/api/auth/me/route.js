import { getSession } from '@/lib/auth';
import { getUserById, initDB } from '@/lib/db';
import { jsonResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const session = await getSession(request);
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
}