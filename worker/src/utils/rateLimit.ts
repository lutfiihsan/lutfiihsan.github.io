/** Cek apakah session+page sudah di-track dalam window menit terakhir */
export async function isTrackRateLimited(
  db: D1Database,
  sessionId: string,
  page: string,
  windowMinutes = 30
): Promise<boolean> {
  if (!sessionId) return false;

  const row = await db
    .prepare(
      `SELECT COUNT(*) as n FROM page_views
       WHERE session_id = ? AND page = ?
       AND created_at > datetime('now', ?)`
    )
    .bind(sessionId, page, `-${windowMinutes} minutes`)
    .first<{ n: number }>();

  return (row?.n ?? 0) > 0;
}
