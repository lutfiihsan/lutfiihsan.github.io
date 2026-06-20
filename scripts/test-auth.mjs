const API = 'https://myporto-api.lawlieth404.workers.dev';

async function main() {
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.argv[2] || '',
      password: process.argv[3] || '',
    }),
  });
  const loginBody = await loginRes.json();
  console.log('login status:', loginRes.status, loginBody.error || loginBody.user?.role || 'ok');

  if (!loginRes.ok || !loginBody.token) process.exit(1);

  const token = loginBody.token;
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  console.log('token parts:', token.split('.').length, 'sub:', payload.sub, 'exp:', payload.exp);

  const headers = { Authorization: `Bearer ${token}` };

  for (const path of ['/auth/session', '/stats', '/users', '/posts']) {
    const res = await fetch(`${API}/api${path}`, { headers });
    const text = await res.text();
    let msg = text.slice(0, 80);
    try {
      msg = JSON.parse(text).error || 'ok';
    } catch {
      /* keep slice */
    }
    console.log(`${path}:`, res.status, msg);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
