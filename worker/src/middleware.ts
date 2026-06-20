import { createMiddleware } from 'hono/factory';
import type { AppVariables, Env } from './types';
import { jwtSecret, parseToken } from './jwt';

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!jwtSecret(c.env)) {
      return c.json({ error: 'Server auth misconfigured' }, 500);
    }

    try {
      const payload = await parseToken(c.env, header.slice(7));
      if (!payload?.sub) {
        return c.json({ error: 'Invalid token' }, 401);
      }
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return c.json({ error: 'Token expired' }, 401);
      }
      c.set('user', payload);
      await next();
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  }
);

export const requireAdmin = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    await next();
  }
);
