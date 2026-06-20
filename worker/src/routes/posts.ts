import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import type { AppVariables, AuthPayload, Env, PostRow } from '../types';
import { requireAuth, requireAdmin } from '../middleware';

async function isValidToken(c: { env: Env; req: { header: (n: string) => string | undefined } }): Promise<boolean> {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return false;
  try {
    const payload = (await verify(header.slice(7), c.env.JWT_SECRET)) as AuthPayload;
    return !!(payload?.sub && payload.exp * 1000 >= Date.now());
  } catch {
    return false;
  }
}

function parsePost(row: PostRow) {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags || '[]');
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    cover_image: row.cover_image,
    tags,
    published: !!row.published,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const posts = new Hono<{ Bindings: Env; Variables: AppVariables }>();

posts.get('/', async (c) => {
  const authenticated = await isValidToken(c);
  const publishedOnly = c.req.query('published') === 'true' || !authenticated;

  let rows: PostRow[];

  if (publishedOnly) {
    const result = await c.env.DB.prepare(
      `SELECT id, title, slug, excerpt, cover_image, tags, published, created_at, updated_at
       FROM posts WHERE published = 1 ORDER BY created_at DESC`
    ).all<PostRow>();
    rows = result.results || [];
  } else {
    const result = await c.env.DB.prepare(
      `SELECT id, title, slug, excerpt, cover_image, tags, published, created_at, updated_at, content
       FROM posts ORDER BY created_at DESC`
    ).all<PostRow>();
    rows = result.results || [];
  }

  return c.json(rows.map(parsePost));
});

posts.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  const row = await c.env.DB.prepare(
    'SELECT * FROM posts WHERE slug = ? AND published = 1'
  )
    .bind(slug)
    .first<PostRow>();

  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(parsePost(row));
});

posts.get('/:id', requireAuth, async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(c.req.param('id'))
    .first<PostRow>();

  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(parsePost(row));
});

posts.post('/', requireAuth, async (c) => {
  const body = await c.req.json<{
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    cover_image?: string | null;
    tags?: string[];
    published?: boolean;
  }>();

  const title = body.title?.trim();
  if (!title) return c.json({ error: 'Judul wajib diisi' }, 400);

  const id = crypto.randomUUID();
  const slug = body.slug?.trim() || slugify(title);
  const now = new Date().toISOString();
  const tags = JSON.stringify(body.tags || []);

  try {
    await c.env.DB.prepare(
      `INSERT INTO posts (id, title, slug, excerpt, content, cover_image, tags, published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        title,
        slug,
        body.excerpt || null,
        body.content || null,
        body.cover_image || null,
        tags,
        body.published ? 1 : 0,
        now,
        now
      )
      .run();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('UNIQUE')) {
      return c.json({ error: 'Slug sudah digunakan' }, 409);
    }
    throw e;
  }

  const row = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<PostRow>();
  return c.json(parsePost(row!), 201);
});

posts.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(id)
    .first<PostRow>();

  if (!existing) return c.json({ error: 'Not found' }, 404);

  const body = await c.req.json<{
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    cover_image?: string | null;
    tags?: string[];
    published?: boolean;
  }>();

  const title = body.title?.trim() || existing.title;
  const slug = body.slug?.trim() || existing.slug;
  const now = new Date().toISOString();
  const tags = JSON.stringify(body.tags ?? JSON.parse(existing.tags || '[]'));

  try {
    await c.env.DB.prepare(
      `UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?,
       tags = ?, published = ?, updated_at = ? WHERE id = ?`
    )
      .bind(
        title,
        slug,
        body.excerpt ?? existing.excerpt,
        body.content ?? existing.content,
        body.cover_image !== undefined ? body.cover_image : existing.cover_image,
        tags,
        body.published !== undefined ? (body.published ? 1 : 0) : existing.published,
        now,
        id
      )
      .run();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('UNIQUE')) {
      return c.json({ error: 'Slug sudah digunakan' }, 409);
    }
    throw e;
  }

  const row = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<PostRow>();
  return c.json(parsePost(row!));
});

posts.patch('/:id/publish', requireAuth, async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT published FROM posts WHERE id = ?')
    .bind(id)
    .first<{ published: number }>();

  if (!existing) return c.json({ error: 'Not found' }, 404);

  const published = existing.published ? 0 : 1;
  const now = new Date().toISOString();

  await c.env.DB.prepare('UPDATE posts SET published = ?, updated_at = ? WHERE id = ?')
    .bind(published, now, id)
    .run();

  return c.json({ published: !!published });
});

posts.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM posts WHERE id = ?')
    .bind(c.req.param('id'))
    .run();

  if (!result.meta.changes) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default posts;
