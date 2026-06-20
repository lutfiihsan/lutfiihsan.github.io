import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import auth from './routes/auth';
import posts from './routes/posts';
import track from './routes/track';
import stats from './routes/stats';
import users from './routes/users';
import upload from './routes/upload';
import portfolio from './routes/portfolio';

const DEFAULT_ORIGINS = [
  'https://lutfiihsan.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function getAllowedOrigins(env: Env): string[] {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return DEFAULT_ORIGINS;
}

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', async (c, next) => {
  const allowed = getAllowedOrigins(c.env);
  const middleware = cors({
    origin: (origin) => {
      if (!origin) return allowed[0];
      return allowed.includes(origin) ? origin : allowed[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  return middleware(c, next);
});

app.route('/api/auth', auth);
app.route('/api/posts', posts);
app.route('/api/track', track);
app.route('/api/stats', stats);
app.route('/api/users', users);
app.route('/api/upload', upload);
app.route('/api/portfolio', portfolio);

app.get('/api/media/*', async (c) => {
  if (!c.env.MEDIA) return c.json({ error: 'R2 not configured' }, 503);
  const path = c.req.path.slice('/api/media/'.length);
  const object = await c.env.MEDIA.get(path);
  if (!object) return c.json({ error: 'Not found' }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(object.body, { headers });
});

app.get('/api/health', (c) => c.json({ ok: true }));

export default app;
