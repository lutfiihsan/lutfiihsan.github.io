import { Hono } from 'hono';
import type { AppVariables, Env } from '../types';
import { requireAuth, requireAdmin } from '../middleware';
import { pruneOldPageViews } from '../utils/retention';

const stats = new Hono<{ Bindings: Env; Variables: AppVariables }>();

stats.get('/', requireAuth, requireAdmin, async (c) => {
  // Retention: hapus data >90 hari (hemat D1 storage & writes)
  await pruneOldPageViews(c.env.DB);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [totalRow, todayRow, viewsResult] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as n FROM page_views').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as n FROM page_views WHERE created_at >= ?')
      .bind(todayIso)
      .first<{ n: number }>(),
    c.env.DB.prepare(
      'SELECT page, referrer, device, country, session_id, created_at FROM page_views WHERE created_at >= ?'
    )
      .bind(sinceIso)
      .all<{
        page: string;
        referrer: string | null;
        device: string | null;
        country: string | null;
        session_id: string | null;
        created_at: string;
      }>(),
  ]);

  const allViews = viewsResult.results || [];
  const uniqueSessions = new Set(allViews.map((r) => r.session_id).filter(Boolean)).size;

  const days = 30;
  const counts: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    counts[key] = 0;
  }
  allViews.forEach((row) => {
    const key = new Date(row.created_at).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    });
    if (counts[key] !== undefined) counts[key]++;
  });

  const pageCounts: Record<string, number> = {};
  const blogCounts: Record<string, number> = {};
  const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0 };
  const referrerCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};

  allViews.forEach((row) => {
    if (row.page) {
      if (row.page.startsWith('blog:')) {
        const slug = row.page.replace('blog:', '');
        blogCounts[slug] = (blogCounts[slug] || 0) + 1;
      } else if (!row.page.startsWith('project:')) {
        pageCounts[row.page] = (pageCounts[row.page] || 0) + 1;
      }
    }

    if (row.device === 'desktop') deviceCounts.Desktop++;
    else if (row.device === 'mobile') deviceCounts.Mobile++;
    else if (row.device === 'tablet') deviceCounts.Tablet++;

    const ref = row.referrer || 'direct';
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;

    const code = row.country && row.country !== 'XX' ? row.country.toLowerCase() : null;
    if (code) countryCounts[code] = (countryCounts[code] || 0) + 1;
  });

  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([page, count]) => ({ page: page === 'home' ? '🏠 Home' : page, count }));

  const topPosts = Object.entries(blogCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([page, count]) => ({ page, count }));

  const referrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([source, count]) => ({ source, count }));

  const countries = Object.entries(countryCounts).map(([code, count]) => [code, count]);

  const totalAll = await c.env.DB.prepare('SELECT COUNT(*) as n FROM page_views').first<{ n: number }>();

  return c.json({
    summary: {
      total: totalAll?.n ?? 0,
      today: todayRow?.n ?? 0,
      unique: uniqueSessions,
    },
    daily: { labels: Object.keys(counts), values: Object.values(counts) },
    topPages,
    topPosts,
    devices: deviceCounts,
    referrers,
    countries,
  });
});

export default stats;
