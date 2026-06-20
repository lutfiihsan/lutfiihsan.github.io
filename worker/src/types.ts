export interface Env {
  DB: D1Database;
  MEDIA?: R2Bucket;
  JWT_SECRET: string;
  API_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'editor';
  created_at: string;
}

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  tags: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface AuthPayload {
  sub: string;
  email: string;
  role: 'admin' | 'editor';
  exp: number;
}

export type AppVariables = {
  user: AuthPayload;
};
