import { useCallback, useEffect, useState } from 'react';
import { fetchPortfolio, savePortfolio } from '@assets/api.js';
import { formatDate } from '../lib/format';
import { toast } from '../lib/toast';
import { handleApiError } from '../lib/apiError';
import { defaultPortfolio, normalizePortfolio } from '../lib/portfolioHelpers';
import {
  SkillCategoryPanel,
  ProjectPanel,
  ExperiencePanel,
  CertPanel,
  AwardPanel,
  RepoPanel,
} from './portfolio/PortfolioSidePanels';

const SECTIONS = [
  { id: 'skills', label: 'Skills', icon: 'fa-code' },
  { id: 'projects', label: 'Projects', icon: 'fa-folder-open' },
  { id: 'experience', label: 'Experience', icon: 'fa-briefcase' },
  { id: 'certifications', label: 'Certifications', icon: 'fa-certificate' },
  { id: 'awards', label: 'Awards', icon: 'fa-trophy' },
  { id: 'githubRepos', label: 'GitHub', icon: 'fa-github' },
];

function upsert(list, index, item) {
  if (index != null) {
    const next = [...list];
    next[index] = item;
    return next;
  }
  return [...list, item];
}

export default function PortfolioTab({ onAuthFail }) {
  const [data, setData] = useState(defaultPortfolio());
  const [section, setSection] = useState('skills');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState({ type: null, index: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await fetchPortfolio();
      const meta = raw._meta;
      setData(normalizePortfolio(raw));
      if (meta?.updated_at) setUpdatedAt(formatDate(meta.updated_at));
    } catch (err) {
      if (handleApiError(err, onAuthFail)) return;
      try {
        const res = await fetch('/assets/data/data.json');
        setData(normalizePortfolio(await res.json()));
        setUpdatedAt('Belum disimpan — data default');
      } catch {
        toast('Gagal memuat portfolio', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [onAuthFail]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveAll() {
    setSaving(true);
    try {
      const result = await savePortfolio(data);
      toast('Portfolio disimpan!');
      if (result.updated_at) setUpdatedAt(formatDate(result.updated_at));
    } catch (err) {
      if (handleApiError(err, onAuthFail)) return;
      toast(err.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  }

  function openPanel(type, index = null) {
    setPanel({ type, index });
  }

  function closePanel() {
    setPanel({ type: null, index: null });
  }

  function saveSection(key, item, index) {
    setData((d) => ({ ...d, [key]: upsert(d[key] || [], index, item) }));
    toast(index != null ? 'Diperbarui!' : 'Ditambahkan!');
  }

  function removeItem(key, index, label) {
    Swal.fire({
      title: `Hapus ${label}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      background: '#13132a',
      color: '#f0f0ff',
    }).then((r) => {
      if (!r.isConfirmed) return;
      setData((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }));
      toast('Dihapus!');
    });
  }

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin" /></div>
      </div>
    );
  }

  const current = SECTIONS.find((s) => s.id === section);

  return (
    <div className="admin-content">
      <div className="section-header">
        <div>
          <h2><i className="fas fa-briefcase" /> Portfolio CMS</h2>
          {updatedAt && <p className="portfolio-meta">Terakhir diupdate: {updatedAt}</p>}
        </div>
        <button type="button" className="btn-primary" onClick={handleSaveAll} disabled={saving}>
          <i className="fas fa-save" /> {saving ? 'Menyimpan...' : 'Simpan Semua'}
        </button>
      </div>

      <div className="portfolio-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`portfolio-tab${section === s.id ? ' active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            <i className={`fas ${s.icon}`} /> {s.label}
            <span className="portfolio-tab-count">{(data[s.id] || []).length}</span>
          </button>
        ))}
      </div>

      <div className="table-card portfolio-section-card">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h3><i className={`fas ${current.icon}`} /> {current.label}</h3>
          <button type="button" className="btn-primary" onClick={() => openPanel(section, null)}>
            <i className="fas fa-plus" /> Tambah
          </button>
        </div>

        {section === 'skills' && (
          <table className="posts-table">
            <thead><tr><th>Kategori</th><th>Items</th><th>Aksi</th></tr></thead>
            <tbody>
              {(data.skills || []).length === 0 ? (
                <tr><td colSpan={3} className="empty-row">Belum ada kategori skill.</td></tr>
              ) : data.skills.map((cat, i) => (
                <tr key={i}>
                  <td><strong>{cat.category}</strong></td>
                  <td>{cat.items?.length || 0} skills</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-sm btn-edit" onClick={() => openPanel('skills', i)}>Edit</button>
                      <button type="button" className="btn-sm btn-delete" onClick={() => removeItem('skills', i, cat.category)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {section === 'projects' && (
          <table className="posts-table">
            <thead><tr><th>Judul</th><th>Status</th><th>Tahun</th><th>Aksi</th></tr></thead>
            <tbody>
              {(data.projects || []).length === 0 ? (
                <tr><td colSpan={4} className="empty-row">Belum ada project.</td></tr>
              ) : data.projects.map((p, i) => (
                <tr key={i}>
                  <td className="post-title-cell">{p.title}</td>
                  <td><span className="badge badge-editor">{p.status}</span></td>
                  <td>{p.year || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-sm btn-edit" onClick={() => openPanel('projects', i)}>Edit</button>
                      <button type="button" className="btn-sm btn-delete" onClick={() => removeItem('projects', i, p.title)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {section === 'experience' && (
          <table className="posts-table">
            <thead><tr><th>Perusahaan</th><th>Role</th><th>Periode</th><th>Aksi</th></tr></thead>
            <tbody>
              {(data.experience || []).length === 0 ? (
                <tr><td colSpan={4} className="empty-row">Belum ada experience.</td></tr>
              ) : data.experience.map((exp, i) => (
                <tr key={i}>
                  <td className="post-title-cell">{exp.company}</td>
                  <td>{exp.isGrouped ? `${exp.roles?.length || 0} roles` : (exp.role || '-')}</td>
                  <td>{exp.period || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-sm btn-edit" onClick={() => openPanel('experience', i)}>Edit</button>
                      <button type="button" className="btn-sm btn-delete" onClick={() => removeItem('experience', i, exp.company)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {section === 'certifications' && (
          <table className="posts-table">
            <thead><tr><th>Nama</th><th>Penerbit</th><th>Tahun</th><th>Aksi</th></tr></thead>
            <tbody>
              {(data.certifications || []).length === 0 ? (
                <tr><td colSpan={4} className="empty-row">Belum ada sertifikasi.</td></tr>
              ) : data.certifications.map((c, i) => (
                <tr key={i}>
                  <td>{c.name}</td><td>{c.issuer}</td><td>{c.date}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-sm btn-edit" onClick={() => openPanel('certifications', i)}>Edit</button>
                      <button type="button" className="btn-sm btn-delete" onClick={() => removeItem('certifications', i, c.name)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {section === 'awards' && (
          <table className="posts-table">
            <thead><tr><th>Judul</th><th>Penerbit</th><th>Tanggal</th><th>Aksi</th></tr></thead>
            <tbody>
              {(data.awards || []).length === 0 ? (
                <tr><td colSpan={4} className="empty-row">Belum ada award.</td></tr>
              ) : data.awards.map((a, i) => (
                <tr key={i}>
                  <td>{a.title}</td><td>{a.issuer}</td><td>{a.date}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-sm btn-edit" onClick={() => openPanel('awards', i)}>Edit</button>
                      <button type="button" className="btn-sm btn-delete" onClick={() => removeItem('awards', i, a.title)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {section === 'githubRepos' && (
          <table className="posts-table">
            <thead><tr><th>Repo</th><th>Bahasa</th><th>Stars</th><th>Aksi</th></tr></thead>
            <tbody>
              {(data.githubRepos || []).length === 0 ? (
                <tr><td colSpan={4} className="empty-row">Belum ada repo.</td></tr>
              ) : data.githubRepos.map((r, i) => (
                <tr key={i}>
                  <td className="post-title-cell">{r.name}</td><td>{r.language}</td><td>{r.stars}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-sm btn-edit" onClick={() => openPanel('githubRepos', i)}>Edit</button>
                      <button type="button" className="btn-sm btn-delete" onClick={() => removeItem('githubRepos', i, r.name)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SkillCategoryPanel
        open={panel.type === 'skills'}
        index={panel.index}
        data={panel.index != null ? data.skills[panel.index] : null}
        onClose={closePanel}
        onSave={(item, idx) => saveSection('skills', item, idx)}
      />
      <ProjectPanel
        open={panel.type === 'projects'}
        index={panel.index}
        data={panel.index != null ? data.projects[panel.index] : null}
        onClose={closePanel}
        onSave={(item, idx) => saveSection('projects', item, idx)}
      />
      <ExperiencePanel
        open={panel.type === 'experience'}
        index={panel.index}
        data={panel.index != null ? data.experience[panel.index] : null}
        onClose={closePanel}
        onSave={(item, idx) => saveSection('experience', item, idx)}
      />
      <CertPanel
        open={panel.type === 'certifications'}
        index={panel.index}
        data={panel.index != null ? data.certifications[panel.index] : null}
        onClose={closePanel}
        onSave={(item, idx) => saveSection('certifications', item, idx)}
      />
      <AwardPanel
        open={panel.type === 'awards'}
        index={panel.index}
        data={panel.index != null ? data.awards[panel.index] : null}
        onClose={closePanel}
        onSave={(item, idx) => saveSection('awards', item, idx)}
      />
      <RepoPanel
        open={panel.type === 'githubRepos'}
        index={panel.index}
        data={panel.index != null ? data.githubRepos[panel.index] : null}
        onClose={closePanel}
        onSave={(item, idx) => saveSection('githubRepos', item, idx)}
      />
    </div>
  );
}
