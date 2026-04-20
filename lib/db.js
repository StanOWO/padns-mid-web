import { sql } from '@vercel/postgres';

// Initialize database tables
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// User operations
export async function createUser(username, hashedPassword) {
  const result = await sql`
    INSERT INTO users (username, password) VALUES (${username}, ${hashedPassword})
    RETURNING id, username, avatar, created_at
  `;
  return result.rows[0];
}

export async function getUserByUsername(username) {
  const result = await sql`SELECT * FROM users WHERE username = ${username}`;
  return result.rows[0] || null;
}

export async function getUserById(id) {
  const result = await sql`SELECT id, username, avatar, created_at FROM users WHERE id = ${id}`;
  return result.rows[0] || null;
}

export async function updateAvatar(userId, avatarData) {
  await sql`UPDATE users SET avatar = ${avatarData} WHERE id = ${userId}`;
}

// Message operations
export async function createMessage(userId, content) {
  const result = await sql`
    INSERT INTO messages (user_id, content) VALUES (${userId}, ${content})
    RETURNING id, user_id, content, created_at
  `;
  return result.rows[0];
}

export async function getMessages() {
  const result = await sql`
    SELECT m.id, m.content, m.created_at, m.user_id,
           u.username, u.avatar
    FROM messages m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
    LIMIT 100
  `;
  return result.rows;
}

export async function deleteMessage(messageId, userId) {
  const result = await sql`
    DELETE FROM messages WHERE id = ${messageId} AND user_id = ${userId}
    RETURNING id
  `;
  return result.rows[0] || null;
}
