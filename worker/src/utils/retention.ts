const RETENTION_DAYS = 90;

/** Hapus page_views lebih dari 90 hari — dipanggil saat admin buka stats */
export async function pruneOldPageViews(db: D1Database): Promise<number> {
  const result = await db
    .prepare(`DELETE FROM page_views WHERE created_at < datetime('now', '-${RETENTION_DAYS} days')`)
    .run();
  return result.meta.changes ?? 0;
}
