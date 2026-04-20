import { sql } from '@vercel/postgres';
import { getSession } from '@/lib/auth';
import { getUserById, initDB } from '@/lib/db';
import { jsonResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await initDB();
    const session = await getSession(request);

    // Debug mode: /api/auth/me?debug=1
    const url = new URL(request.url);
    if (url.searchParams.get('debug') === '1') {
      const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `;
      const allUsers = await sql`
        SELECT id, username,
               avatar IS NOT NULL as has_avatar,
               COALESCE(LENGTH(avatar), 0) as avatar_length
        FROM users
      `;
      return new Response(JSON.stringify({
        table_columns: columns.rows,
        session,
        all_users: allUsers.rows,
      }, null, 2), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // Normal mode
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
    console.error('[me] Error:', err.message);
    return jsonResponse({ user: null });
  }
}
