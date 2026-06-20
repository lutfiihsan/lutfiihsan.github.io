import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import type { AppVariables, AuthPayload, Env } from './types';

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const payload = (await verify(header.slice(7), c.env.JWT_SECRET)) as AuthPayload;
      if (!payload?.sub || payload.exp * 1000 < Date.now()) {
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
