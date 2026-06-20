/**
 * Merge new projects from data.json into remote portfolio (D1 via API).
 * Usage: node scripts/sync-portfolio.mjs [email] [password]
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const API = 'https://myporto-api.lawlieth404.workers.dev';
const __dir = dirname(fileURLToPath(import.meta.url));
const local = JSON.parse(readFileSync(join(__dir, '../public/assets/data/data.json'), 'utf8'));

const NEW_IDS = [
  'dtannora-sukses',
  'grafisa-id',
  'siguru-sdn-kacangan',
  'konterpro-app',
  'pay-ex-yapek',
];

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.log('Usage: node scripts/sync-portfolio.mjs email password');
    process.exit(1);
  }

  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Login failed:', login.error);
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${login.token}`,
    'Content-Type': 'application/json',
  };

  let remote = null;
  const getRes = await fetch(`${API}/api/portfolio`);
  if (getRes.ok) {
    remote = await getRes.json();
    delete remote._meta;
  }

  const base = remote || { ...local, projects: (local.projects || []).filter((p) => !NEW_IDS.includes(p.id)) };
  const existingIds = new Set((base.projects || []).map((p) => p.id));
  const toAdd = (local.projects || []).filter((p) => NEW_IDS.includes(p.id) && !existingIds.has(p.id));

  if (!toAdd.length) {
    console.log('Projects already in remote portfolio — nothing to add.');
    return;
  }

  // Insert after SIGAP if present, else at start
  const projects = [...(base.projects || [])];
  const sigapIdx = projects.findIndex((p) => p.id === 'sigap-sis-smart');
  const insertAt = sigapIdx >= 0 ? sigapIdx + 1 : 0;
  projects.splice(insertAt, 0, ...toAdd);

  const payload = { ...base, projects };

  const putRes = await fetch(`${API}/api/portfolio`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const result = await putRes.json();
  if (!putRes.ok) {
    console.error('Save failed:', result.error);
    process.exit(1);
  }

  console.log(`Added ${toAdd.length} projects:`, toAdd.map((p) => p.title).join(', '));
  console.log('Updated at:', result.updated_at);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
