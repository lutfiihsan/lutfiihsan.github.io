import { useCallback, useEffect } from 'react';
import { fetchStats } from '../../assets/js/api.js';
import { handleApiError } from '../lib/apiError';

export default function StatsTab({ onAuthFail }) {
  const load = useCallback(async () => {
    const loading = document.getElementById('stats-loading');
    const errEl = document.getElementById('stats-error');
    if (loading) loading.style.display = 'block';
    if (errEl) errEl.style.display = 'none';

    try {
      const data = await fetchStats();
      const mod = await import('../../assets/js/stats.js');
      mod.renderStatsData(data);
    } catch (err) {
      console.error('Stats load error:', err);
      if (errEl) errEl.style.display = 'block';
      handleApiError(err, onAuthFail);
    } finally {
      if (loading) loading.style.display = 'none';
    }
  }, [onAuthFail]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="admin-content">
      <div id="stats-loading" className="loading-spinner" style={{ display: 'none' }}>
        <i className="fas fa-spinner fa-spin" /> Memuat statistik...
      </div>
      <div id="stats-error" className="login-error" style={{ display: 'none', textAlign: 'center' }}>
        <i className="fas fa-exclamation-circle" /> Gagal memuat statistik.
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-eye" /></div>
          <div className="stat-info"><h3 id="stats-total-views">-</h3><p>Total Kunjungan</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-calendar-day" /></div>
          <div className="stat-info"><h3 id="stats-today-views">-</h3><p>Hari Ini</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-users" /></div>
          <div className="stat-info"><h3 id="stats-unique-visitors">-</h3><p>Unique Visitors</p></div>
        </div>
      </div>

      <div className="stat-chart-card" style={{ marginBottom: '2.5rem' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h2><i className="fas fa-chart-area" /> Kunjungan 30 Hari Terakhir</h2>
          <button type="button" className="btn-sm btn-edit" onClick={load}>
            <i className="fas fa-sync-alt" /> Refresh
          </button>
        </div>
        <div id="chart-daily" style={{ height: 300 }} />
      </div>

      <div className="stats-two-col" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-chart-card">
          <h3 className="stat-panel-title"><i className="fas fa-chart-bar" /> Halaman Terpopuler</h3>
          <div id="chart-top-pages" style={{ height: 280 }} />
        </div>
        <div className="stat-chart-card">
          <h3 className="stat-panel-title"><i className="fas fa-chart-pie" /> Device Breakdown</h3>
          <div id="chart-device" style={{ height: 280 }} />
        </div>
      </div>

      <div className="stat-chart-card" style={{ marginBottom: '2.5rem' }}>
        <h3 className="stat-panel-title"><i className="fas fa-pencil-alt" /> Artikel Terpopuler</h3>
        <div id="chart-top-posts" style={{ height: 260 }} />
      </div>

      <div className="stat-chart-card" style={{ marginBottom: '2.5rem' }}>
        <h3 className="stat-panel-title"><i className="fas fa-share-alt" /> Traffic Sources</h3>
        <div id="chart-referrers" style={{ height: 240 }} />
      </div>

      <div className="stat-chart-card">
        <h3 className="stat-panel-title"><i className="fas fa-globe-asia" /> Pengunjung per Negara</h3>
        <div id="chart-map" style={{ height: 400 }} />
      </div>
    </div>
  );
}
