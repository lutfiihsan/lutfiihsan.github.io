import { Hono } from 'hono';
import { hashPassword } from '../crypto';
import type { AppVariables, Env, UserRow } from '../types';
import { requireAuth, requireAdmin } from '../middleware';

const users = new Hono<{ Bindings: Env; Variables: AppVariables }>();

users.get('/', requireAuth, requireAdmin, async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
  ).all<Pick<UserRow, 'id' | 'email' | 'role' | 'created_at'>>();

  return c.json(result.results || []);
});

users.post('/', requireAuth, requireAdmin, async (c) => {
  const body = await c.req.json<{
    email?: string;
    password?: string;
    role?: string;
  }>();

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const role = body.role === 'admin' ? 'admin' : 'editor';

  if (!email || !password) {
    return c.json({ error: 'Email dan password wajib diisi' }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: 'Password minimal 8 karakter' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (existing) {
    return c.json({ error: 'Email sudah terdaftar' }, 409);
  }

  const id = crypto.randomUUID();
  const password_hash = await hashPassword(password);

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)'
  )
    .bind(id, email, password_hash, role)
    .run();

  return c.json({ id, email, role, created_at: new Date().toISOString() }, 201);
});

users.patch('/:id/role', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');

  if (id === currentUser.sub) {
    return c.json({ error: 'Tidak bisa mengubah role sendiri' }, 400);
  }

  const body = await c.req.json<{ role?: string }>();
  if (body.role !== 'admin' && body.role !== 'editor') {
    return c.json({ error: 'Role tidak valid' }, 400);
  }

  const result = await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?')
    .bind(body.role, id)
    .run();

  if (!result.meta.changes) return c.json({ error: 'User tidak ditemukan' }, 404);
  return c.json({ ok: true });
});

users.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');

  if (id === currentUser.sub) {
    return c.json({ error: 'Tidak bisa menghapus akun sendiri' }, 400);
  }

  const admins = await c.env.DB.prepare(
    "SELECT COUNT(*) as n FROM users WHERE role = 'admin'"
  ).first<{ n: number }>();

  const target = await c.env.DB.prepare('SELECT role FROM users WHERE id = ?')
    .bind(id)
    .first<{ role: string }>();

  if (!target) return c.json({ error: 'User tidak ditemukan' }, 404);

  if (target.role === 'admin' && (admins?.n ?? 0) <= 1) {
    return c.json({ error: 'Tidak bisa menghapus admin terakhir' }, 400);
  }

  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});

export default users;
