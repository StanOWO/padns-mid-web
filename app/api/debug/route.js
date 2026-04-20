import { sql } from '@vercel/postgres';
import { initDB } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await initDB();

    // Check table columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    // Check session
    const session = await getSession(request);

    // Check user data if logged in
    let userData = null;
    if (session) {
      const result = await sql`SELECT id, username, avatar IS NOT NULL as has_avatar, LENGTH(avatar) as avatar_length FROM users WHERE id = ${session.id}`;
      userData = result.rows[0] || null;
    }

    // Check all users summary
    const allUsers = await sql`SELECT id, username, avatar IS NOT NULL as has_avatar, LENGTH(avatar) as avatar_length FROM users`;

    return new Response(JSON.stringify({
      table_columns: columns.rows,
      session: session,
      current_user: userData,
      all_users: allUsers.rows,
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
