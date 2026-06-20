import { Hono } from 'hono';
import type { AppVariables, Env } from '../types';
import { requireAuth } from '../middleware';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = new Hono<{ Bindings: Env; Variables: AppVariables }>();

upload.post('/', requireAuth, async (c) => {
  if (!c.env.MEDIA) {
    return c.json({ error: 'R2 belum dikonfigurasi. Aktifkan R2 di Cloudflare Dashboard.' }, 503);
  }
  const form = await c.req.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return c.json({ error: 'File wajib diupload' }, 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return c.json({ error: 'Tipe file tidak didukung' }, 400);
  }

  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: 'Ukuran file maksimal 5MB' }, 400);
  }

  const ext = file.type.split('/')[1] || 'bin';
  const key = `covers/${crypto.randomUUID()}.${ext}`;

  await c.env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const base = c.env.API_BASE_URL || new URL(c.req.url).origin;
  return c.json({ url: `${base}/api/media/${key}`, key });
});

export default upload;
