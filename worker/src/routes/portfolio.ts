import { Hono } from 'hono';
import type { AppVariables, Env } from '../types';
import { requireAuth, requireAdmin } from '../middleware';

const PORTFOLIO_ID = 'main';

const portfolio = new Hono<{ Bindings: Env; Variables: AppVariables }>();

portfolio.get('/', async (c) => {
  const row = await c.env.DB.prepare(
    'SELECT data, updated_at FROM portfolio WHERE id = ?'
  )
    .bind(PORTFOLIO_ID)
    .first<{ data: string; updated_at: string }>();

  if (!row) return c.json({ error: 'Portfolio belum dikonfigurasi' }, 404);

  try {
    const data = JSON.parse(row.data);
    return c.json({ ...data, _meta: { updated_at: row.updated_at, source: 'd1' } });
  } catch {
    return c.json({ error: 'Data portfolio corrupt' }, 500);
  }
});

portfolio.put('/', requireAuth, requireAdmin, async (c) => {
  const body = await c.req.json<Record<string, unknown>>();

  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Data tidak valid' }, 400);
  }

  // Strip internal meta if client sends it back
  delete body._meta;

  const required = ['skills', 'projects', 'experience'];
  for (const key of required) {
    if (!(key in body)) {
      return c.json({ error: `Field "${key}" wajib ada` }, 400);
    }
  }

  const data = JSON.stringify(body);
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO portfolio (id, data, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  )
    .bind(PORTFOLIO_ID, data, now)
    .run();

  return c.json({ ok: true, updated_at: now });
});

export default portfolio;
