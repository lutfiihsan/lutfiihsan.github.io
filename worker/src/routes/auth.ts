import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { hashPassword, verifyPassword } from '../crypto';
import type { AppVariables, Env, UserRow } from '../types';
import { requireAuth } from '../middleware';

const auth = new Hono<{ Bindings: Env; Variables: AppVariables }>();

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return c.json({ error: 'Email dan password wajib diisi' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, password_hash, role, created_at FROM users WHERE email = ?'
  )
    .bind(email)
    .first<UserRow>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'Email atau password salah' }, 401);
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const token = await sign(
    { sub: user.id, email: user.email, role: user.role, exp },
    c.env.JWT_SECRET
  );

  return c.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

auth.post('/setup', async (c) => {
  const count = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<{ n: number }>();
  if ((count?.n ?? 0) > 0) {
    return c.json({ error: 'Setup sudah dilakukan' }, 403);
  }

  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password || password.length < 8) {
    return c.json({ error: 'Email dan password (min. 8 karakter) wajib diisi' }, 400);
  }

  const id = crypto.randomUUID();
  const password_hash = await hashPassword(password);

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)'
  )
    .bind(id, email, password_hash, 'admin')
    .run();

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const token = await sign({ sub: id, email, role: 'admin', exp }, c.env.JWT_SECRET);

  return c.json({
    token,
    user: { id, email, role: 'admin' },
  });
});

auth.get('/session', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({ user: { id: user.sub, email: user.email, role: user.role } });
});

auth.post('/change-password', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ current_password?: string; new_password?: string }>();

  if (!body.current_password || !body.new_password) {
    return c.json({ error: 'Password lama dan baru wajib diisi' }, 400);
  }
  if (body.new_password.length < 8) {
    return c.json({ error: 'Password baru minimal 8 karakter' }, 400);
  }

  const row = await c.env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ?'
  )
    .bind(user.sub)
    .first<{ password_hash: string }>();

  if (!row || !(await verifyPassword(body.current_password, row.password_hash))) {
    return c.json({ error: 'Password lama salah' }, 401);
  }

  const password_hash = await hashPassword(body.new_password);
  await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(password_hash, user.sub)
    .run();

  return c.json({ ok: true });
});

export default auth;
