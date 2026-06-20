import { sign, verify } from 'hono/jwt';
import type { AuthPayload, Env } from './types';

const JWT_ALG = 'HS256';

export function jwtSecret(env: Env): string {
  return (env.JWT_SECRET || '').trim();
}

export async function createToken(
  env: Env,
  payload: { sub: string; email: string; role: 'admin' | 'editor'; exp: number }
): Promise<string> {
  const secret = jwtSecret(env);
  return sign(payload, secret, JWT_ALG);
}

export async function parseToken(env: Env, rawToken: string): Promise<AuthPayload> {
  const secret = jwtSecret(env);
  if (!secret) throw new Error('JWT_SECRET missing');
  const token = rawToken.trim();
  return (await verify(token, secret, JWT_ALG)) as AuthPayload;
}
