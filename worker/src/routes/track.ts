import { Hono } from 'hono';
import type { Env } from '../types';

const track = new Hono<{ Bindings: Env }>();

track.post('/', async (c) => {
  const body = await c.req.json<{
    page?: string;
    title?: string;
    referrer?: string;
    device?: string;
    country?: string;
    session_id?: string;
  }>();

  if (!body.page) return c.json({ error: 'page required' }, 400);

  await c.env.DB.prepare(
    `INSERT INTO page_views (id, page, title, referrer, device, country, session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      crypto.randomUUID(),
      body.page,
      body.title || null,
      body.referrer || null,
      body.device || null,
      body.country || null,
      body.session_id || null
    )
    .run();

  return c.json({ ok: true }, 201);
});

export default track;
