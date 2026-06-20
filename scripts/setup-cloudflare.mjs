#!/usr/bin/env node
/**
 * Setup Cloudflare resources for myporto (D1, R2, Worker, secrets)
 *
 * Usage:
 *   set CLOUDFLARE_API_TOKEN=your_token
 *   set CLOUDFLARE_ACCOUNT_ID=your_account_id
 *   npm run setup:cloudflare
 *
 * Or: npx wrangler login  (then run without token env — uses OAuth)
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WRANGLER_TOML = join(ROOT, 'wrangler.toml');
const SCHEMA = join(ROOT, 'worker', 'schema.sql');

const DB_NAME = 'myporto-db';
const BUCKET_NAME = 'myporto-media';
const WORKER_NAME = 'myporto-api';

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

function log(step, msg) {
  console.log(`\n[${step}] ${msg}`);
}

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...(opts.env || {}) },
    ...opts,
  });
}

async function cf(path, options = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success) {
    const err = data.errors?.map((e) => e.message).join('; ') || res.statusText;
    throw new Error(`Cloudflare API error: ${err}`);
  }
  return data;
}

function updateWranglerToml(patch) {
  let content = readFileSync(WRANGLER_TOML, 'utf8');
  if (patch.databaseId) {
    content = content.replace(
      /database_id = ".*"/,
      `database_id = "${patch.databaseId}"`
    );
  }
  if (patch.apiBaseUrl) {
    const line = `API_BASE_URL = "${patch.apiBaseUrl}"`;
    if (content.includes('API_BASE_URL')) {
      content = content.replace(/#?\s*API_BASE_URL = ".*"/, line);
    } else {
      content = content.replace(
        /ALLOWED_ORIGINS = ".*"/,
        (m) => `${m}\n${line}`
      );
    }
  }
  writeFileSync(WRANGLER_TOML, content);
  log('OK', 'wrangler.toml updated');
}

async function getOrCreateD1() {
  log('D1', `Checking database "${DB_NAME}"...`);
  const list = await cf(`/accounts/${accountId}/d1/database`);
  const existing = list.result?.find((db) => db.name === DB_NAME);
  if (existing) {
    log('D1', `Found existing: ${existing.uuid}`);
    return existing.uuid;
  }

  log('D1', 'Creating database...');
  const created = await cf(`/accounts/${accountId}/d1/database`, {
    method: 'POST',
    body: JSON.stringify({ name: DB_NAME }),
  });
  const id = created.result?.uuid;
  log('D1', `Created: ${id}`);
  return id;
}

async function ensureR2Bucket() {
  log('R2', `Checking bucket "${BUCKET_NAME}"...`);
  try {
    await cf(`/accounts/${accountId}/r2/buckets/${BUCKET_NAME}`);
    log('R2', 'Bucket already exists');
  } catch {
    log('R2', 'Creating bucket...');
    await cf(`/accounts/${accountId}/r2/buckets`, {
      method: 'POST',
      body: JSON.stringify({ name: BUCKET_NAME }),
    });
    log('R2', 'Bucket created');
  }
}

async function getWorkersSubdomain() {
  const data = await cf(`/accounts/${accountId}/workers/subdomain`);
  return data.result?.subdomain;
}

function generateJwtSecret() {
  return randomBytes(48).toString('base64url');
}

function setLocalDevVars(jwtSecret) {
  const devVarsPath = join(ROOT, '.dev.vars');
  const content = `JWT_SECRET=${jwtSecret}\n`;
  writeFileSync(devVarsPath, content);
  log('OK', '.dev.vars written (local dev)');
}

async function main() {
  console.log('=== MyPorto Cloudflare Setup ===\n');

  if (!token || !accountId) {
    console.error(`
ERROR: CLOUDFLARE_API_TOKEN dan CLOUDFLARE_ACCOUNT_ID wajib di-set.

Cara mendapatkan:
  1. Buka https://dash.cloudflare.com/profile/api-tokens
  2. Create Token → "Edit Cloudflare Workers" template
     Tambahkan permission: D1 Edit, R2 Edit
  3. Account ID: https://dash.cloudflare.com → sidebar kanan

Jalankan di PowerShell:
  $env:CLOUDFLARE_API_TOKEN="your_token"
  $env:CLOUDFLARE_ACCOUNT_ID="your_account_id"
  npm run setup:cloudflare

Alternatif (OAuth browser):
  npx wrangler login
  npm run setup:cloudflare
`);
    process.exit(1);
  }

  // Verify token
  log('AUTH', 'Verifying API token...');
  const verify = await cf('/user/tokens/verify', { method: 'GET' });
  log('AUTH', `OK — ${verify.result?.status || 'active'}`);

  const databaseId = await getOrCreateD1();
  updateWranglerToml({ databaseId });

  await ensureR2Bucket();

  const jwtSecret = generateJwtSecret();
  setLocalDevVars(jwtSecret);

  log('D1', 'Running remote schema migration...');
  run(`npx wrangler d1 execute ${DB_NAME} --remote --file=./worker/schema.sql`, {
    env: { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: accountId },
  });

  log('SECRET', 'Setting JWT_SECRET on Worker...');
  run(`npx wrangler secret put JWT_SECRET`, {
    input: jwtSecret,
    env: { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: accountId },
  });

  log('DEPLOY', 'Deploying Worker (first pass)...');
  run('npx wrangler deploy', {
    env: { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: accountId },
  });

  const subdomain = await getWorkersSubdomain();
  const apiUrl = `https://${WORKER_NAME}.${subdomain}.workers.dev`;
  updateWranglerToml({ apiBaseUrl: apiUrl });

  log('DEPLOY', 'Deploying Worker (with API_BASE_URL)...');
  run('npx wrangler deploy', {
    env: { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: accountId },
  });

  log('ADMIN', 'Creating first admin user...');
  try {
    const setupRes = await fetch(`${apiUrl}/api/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@lutfiihsan.dev',
        password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      }),
    });
    const setupData = await setupRes.json();
    if (setupRes.ok) {
      log('ADMIN', `Created: ${setupData.user?.email}`);
    } else {
      log('ADMIN', `Skipped — ${setupData.error || 'user may already exist'}`);
    }
  } catch (e) {
    log('ADMIN', `Setup call failed: ${e.message}`);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    SETUP SELESAI                             ║
╠══════════════════════════════════════════════════════════════╣
║  API URL     : ${apiUrl.padEnd(43)}║
║  D1 Database : ${DB_NAME.padEnd(43)}║
║  R2 Bucket   : ${BUCKET_NAME.padEnd(43)}║
╠══════════════════════════════════════════════════════════════╣
║  GitHub Secrets (Settings → Secrets → Actions):              ║
║    VITE_API_URL            = ${apiUrl.slice(0, 30)}...
║    CLOUDFLARE_API_TOKEN    = (token Anda)
║    CLOUDFLARE_ACCOUNT_ID   = ${accountId}
╠══════════════════════════════════════════════════════════════╣
║  Admin login:                                                ║
║    Email    : ${(process.env.ADMIN_EMAIL || 'admin@lutfiihsan.dev').padEnd(43)}║
║    Password : ${(process.env.ADMIN_PASSWORD || 'ChangeMe123!').padEnd(43)}║
║    ⚠️  Ganti password setelah login pertama!                  ║
╚══════════════════════════════════════════════════════════════╝
`);
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
