#!/usr/bin/env node
/** Register workers.dev subdomain via Cloudflare API (uses wrangler OAuth token) */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ACCOUNT_ID = 'daf4040657c2538f139d61713888c6ee';
const SUBDOMAIN = process.argv[2] || 'lawlieth404';

const configPath = join(
  homedir(),
  'AppData/Roaming/xdg.config/.wrangler/config/default.toml'
);

function getOAuthToken() {
  const raw = readFileSync(configPath, 'utf8');
  const match = raw.match(/oauth_token\s*=\s*"([^"]+)"/);
  if (!match) throw new Error('Wrangler OAuth token not found. Run: npx wrangler login');
  return match[1];
}

async function main() {
  const token = getOAuthToken();
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/subdomain`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subdomain: SUBDOMAIN }),
    }
  );
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.map((e) => e.message).join('; ') || res.statusText);
  }
  console.log(`workers.dev subdomain registered: ${SUBDOMAIN}`);
  console.log(`API URL will be: https://myporto-api.${SUBDOMAIN}.workers.dev`);
}

main().catch((e) => {
  console.error('Failed:', e.message);
  console.error('\nManual fallback:');
  console.error(`https://dash.cloudflare.com/${ACCOUNT_ID}/workers/onboarding`);
  process.exit(1);
});
