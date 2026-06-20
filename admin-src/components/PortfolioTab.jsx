import { useCallback, useEffect, useState } from 'react';
import { fetchPortfolio, savePortfolio } from '../../assets/js/api.js';
import { formatDate } from '../lib/format';
import { toast } from '../lib/toast';
import { handleApiError } from '../lib/apiError';

export default function PortfolioTab({ onAuthFail }) {
  const [json, setJson] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPortfolio();
      const meta = data._meta;
      delete data._meta;
      setJson(JSON.stringify(data, null, 2));
      if (meta?.updated_at) setUpdatedAt(formatDate(meta.updated_at));
    } catch (err) {
      if (handleApiError(err, onAuthFail)) return;
      try {
        const res = await fetch('./assets/data/data.json');
        const data = await res.json();
        setJson(JSON.stringify(data, null, 2));
        setUpdatedAt('Belum disimpan — menampilkan data.json default');
      } catch {
        setError('Gagal memuat data portfolio');
      }
    } finally {
      setLoading(false);
    }
  }, [onAuthFail]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleImport() {
    try {
      const res = await fetch('./assets/data/data.json');
      const data = await res.json();
      setJson(JSON.stringify(data, null, 2));
      toast('data.json dimuat. Klik Simpan untuk publish.');
    } catch {
      toast('Gagal import', 'error');
    }
  }

  async function handleSave() {
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      setError('JSON tidak valid');
      return;
    }
    try {
      const result = await savePortfolio(data);
      setError('');
      toast('Portfolio disimpan!');
      if (result.updated_at) setUpdatedAt(formatDate(result.updated_at));
    } catch (err) {
      if (handleApiError(err, onAuthFail)) return;
      setError(err.message || 'Gagal menyimpan');
    }
  }

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin" /></div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="section-header">
        <h2><i className="fas fa-briefcase" /> Portfolio CMS</h2>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button type="button" className="btn-sm btn-edit" onClick={handleImport}>
            <i className="fas fa-file-import" /> Import data.json
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            <i className="fas fa-save" /> Simpan
          </button>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.4rem', marginBottom: '1rem' }}>
        Edit skills, projects, experience via JSON. Landing page otomatis load dari API setelah disimpan.
      </p>
      {updatedAt && (
        <p style={{ color: '#667eea', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Terakhir diupdate: {updatedAt}
        </p>
      )}
      {error && (
        <div className="login-error" style={{ display: 'block', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <textarea
        spellCheck={false}
        value={json}
        onChange={(e) => setJson(e.target.value)}
        style={{
          width: '100%',
          minHeight: 520,
          fontFamily: 'Consolas, monospace',
          fontSize: '1.3rem',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          background: 'var(--card-bg, #13132a)',
          color: 'var(--text-primary, #f0f0ff)',
          border: '1px solid rgba(255,255,255,0.1)',
          resize: 'vertical',
        }}
      />
    </div>
  );
}
