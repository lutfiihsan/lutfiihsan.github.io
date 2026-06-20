#!/usr/bin/env node
/** Create Cloudflare API token for GitHub Actions and set gh secret */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ACCOUNT_ID = 'daf4040657c2538f139d61713888c6ee';
const TOKEN_NAME = 'myporto-github-actions';

function getOAuthToken() {
  const configPath = join(homedir(), 'AppData/Roaming/xdg.config/.wrangler/config/default.toml');
  const raw = readFileSync(configPath, 'utf8');
  const match = raw.match(/oauth_token\s*=\s*"([^"]+)"/);
  if (!match) throw new Error('Run: npx wrangler login');
  return match[1];
}

async function cf(path, options = {}) {
  const token = getOAuthToken();
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
    throw new Error(data.errors?.map((e) => e.message).join('; ') || res.statusText);
  }
  return data;
}

async function main() {
  const groups = await cf('/user/tokens/permission_groups');
  const find = (name) => groups.result?.find((g) => g.name === name)?.id;

  const policy = {
    effect: 'allow',
    resources: {
      [`com.cloudflare.api.account.${ACCOUNT_ID}`]: '*',
    },
    permission_groups: [
      { id: find('Workers Scripts Write') },
      { id: find('Workers R2 Storage Write') },
      { id: find('D1 Write') },
      { id: find('Account Settings Read') },
    ].filter((p) => p.id),
  };

  const created = await cf('/user/tokens', {
    method: 'POST',
    body: JSON.stringify({
      name: TOKEN_NAME,
      policies: [policy],
    }),
  });

  const apiToken = created.result?.value;
  if (!apiToken) throw new Error('Token creation failed');

  execSync(`gh secret set CLOUDFLARE_API_TOKEN --body "${apiToken}"`, {
    stdio: 'inherit',
    cwd: join(homedir(), 'Documents/Brilliant-Data/myporto'),
  });

  console.log('CLOUDFLARE_API_TOKEN created and saved to GitHub Secrets');
}

main().catch((e) => {
  console.error('Could not auto-create API token:', e.message);
  console.error('\nBuat manual: https://dash.cloudflare.com/profile/api-tokens');
  console.error('Template: Edit Cloudflare Workers + D1 Edit');
  console.error('Lalu: gh secret set CLOUDFLARE_API_TOKEN --body "YOUR_TOKEN"');
  process.exit(1);
});
