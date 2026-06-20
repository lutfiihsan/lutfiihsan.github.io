import { Hono } from 'hono';
import type { AppVariables, Env, UserRow } from '../types';
import { requireAuth, requireAdmin } from '../middleware';

const users = new Hono<{ Bindings: Env; Variables: AppVariables }>();

users.get('/', requireAuth, requireAdmin, async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
  ).all<Pick<UserRow, 'id' | 'email' | 'role' | 'created_at'>>();

  return c.json(result.results || []);
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

export default users;
