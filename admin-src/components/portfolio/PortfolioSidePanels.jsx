import { useEffect, useState } from 'react';
import SidePanel from '../SidePanel';
import {
  EMPTY_SKILL_CATEGORY,
  EMPTY_SKILL_ITEM,
  EMPTY_PROJECT,
  EMPTY_EXPERIENCE,
  EMPTY_ROLE,
  EMPTY_CERT,
  EMPTY_AWARD,
  EMPTY_REPO,
  linesToArray,
  arrayToLines,
  csvToArray,
  arrayToCsv,
  projectIdFromTitle,
} from '../../lib/portfolioHelpers';

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function SkillCategoryPanel({ open, index, data, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_SKILL_CATEGORY);

  useEffect(() => {
    if (open) {
      setForm(index != null && data ? structuredClone(data) : { ...EMPTY_SKILL_CATEGORY, items: [] });
    }
  }, [open, index, data]);

  function updateItem(i, key, val) {
    setForm((f) => {
      const items = [...f.items];
      items[i] = { ...items[i], [key]: val };
      return { ...f, items };
    });
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_SKILL_ITEM }] }));
  }

  function removeItem(i) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }

  function handleSave() {
    if (!form.category.trim()) return;
    onSave(form, index);
    onClose();
  }

  return (
    <SidePanel
      open={open}
      wide
      title={index != null ? 'Edit Kategori Skill' : 'Tambah Kategori Skill'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
          <button type="button" className="btn-primary" onClick={handleSave}>Simpan</button>
        </>
      }
    >
      <div className="sidepanel-form">
        <div className="form-row">
          <Field label="Nama Kategori *">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="BACKEND" />
          </Field>
          <Field label="Icon (Font Awesome)">
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="fas fa-server" />
          </Field>
        </div>

        <div className="sidepanel-section-title">
          <span>Skill Items</span>
          <button type="button" className="btn-sm btn-edit" onClick={addItem}><i className="fas fa-plus" /> Item</button>
        </div>

        {form.items.map((item, i) => (
          <div key={i} className="sidepanel-nested-card">
            <div className="sidepanel-nested-header">
              <strong>#{i + 1} {item.name || 'Skill baru'}</strong>
              <button type="button" className="btn-sm btn-delete" onClick={() => removeItem(i)}><i className="fas fa-trash" /></button>
            </div>
            <div className="form-row">
              <Field label="Nama *">
                <input value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
              </Field>
              <Field label="Icon class">
                <input value={item.icon || ''} onChange={(e) => updateItem(i, 'icon', e.target.value)} placeholder="fab fa-laravel" />
              </Field>
            </div>
            <div className="form-row">
              <Field label="Image URL">
                <input value={item.img || ''} onChange={(e) => updateItem(i, 'img', e.target.value)} />
              </Field>
              <Field label="Inline style">
                <input value={item.style || ''} onChange={(e) => updateItem(i, 'style', e.target.value)} />
              </Field>
            </div>
            <label className="sidepanel-check">
              <input type="checkbox" checked={!!item.learning} onChange={(e) => updateItem(i, 'learning', e.target.checked)} />
              Sedang dipelajari (Learning badge)
            </label>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

export function ProjectPanel({ open, index, data, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [imagesText, setImagesText] = useState('');

  useEffect(() => {
    if (!open) return;
    if (index != null && data) {
      setForm(structuredClone(data));
      setImagesText(arrayToLines(data.images?.length ? data.images : [data.image].filter(Boolean)));
    } else {
      setForm({ ...EMPTY_PROJECT });
      setImagesText('');
    }
  }, [open, index, data]);

  function handleSave() {
    if (!form.title.trim()) return;
    const images = linesToArray(imagesText);
    const payload = {
      ...form,
      id: form.id.trim() || projectIdFromTitle(form.title),
      tech: Array.isArray(form.tech) ? form.tech : csvToArray(form.tech),
      images: images.length ? images : [form.image].filter(Boolean),
      image: images[0] || form.image,
      viewLink: form.viewLink?.trim() || null,
      codeLink: form.codeLink?.trim() || null,
    };
    onSave(payload, index);
    onClose();
  }

  return (
    <SidePanel
      open={open}
      wide
      title={index != null ? 'Edit Project' : 'Tambah Project'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
          <button type="button" className="btn-primary" onClick={handleSave}>Simpan</button>
        </>
      }
    >
      <div className="sidepanel-form">
        <div className="form-row">
          <Field label="Judul *">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Slug / ID">
            <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="auto dari judul" />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Status">
            <select value={form.status} onChange={(e) => {
              const status = e.target.value;
              const statusClass = status === 'Online' ? 'status-online' : status === 'Offline' ? 'status-offline' : 'status-private';
              setForm({ ...form, status, statusClass });
            }}>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Private">Private</option>
            </select>
          </Field>
          <Field label="Tahun">
            <input value={form.year || ''} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </Field>
          <Field label="Tipe">
            <input value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          </Field>
        </div>
        <Field label="Deskripsi singkat">
          <textarea rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </Field>
        <Field label="Deskripsi lengkap (HTML)">
          <textarea rows={4} value={form.fullDesc || ''} onChange={(e) => setForm({ ...form, fullDesc: e.target.value })} />
        </Field>
        <Field label="Tech stack (pisah koma)">
          <input value={arrayToCsv(form.tech)} onChange={(e) => setForm({ ...form, tech: csvToArray(e.target.value) })} />
        </Field>
        <Field label="Gambar utama (URL)">
          <input value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </Field>
        <Field label="Semua gambar (satu URL per baris)">
          <textarea rows={3} value={imagesText} onChange={(e) => setImagesText(e.target.value)} placeholder="./assets/images/projects/..." />
        </Field>
        <div className="form-row">
          <Field label="Link demo">
            <input value={form.viewLink || ''} onChange={(e) => setForm({ ...form, viewLink: e.target.value })} />
          </Field>
          <Field label="Link source code">
            <input value={form.codeLink || ''} onChange={(e) => setForm({ ...form, codeLink: e.target.value })} />
          </Field>
        </div>
      </div>
    </SidePanel>
  );
}

export function ExperiencePanel({ open, index, data, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_EXPERIENCE);
  const [tasksText, setTasksText] = useState('');

  useEffect(() => {
    if (!open) return;
    if (index != null && data) {
      setForm(structuredClone(data));
      setTasksText(arrayToLines(data.tasks || []));
    } else {
      setForm({ ...EMPTY_EXPERIENCE });
      setTasksText('');
    }
  }, [open, index, data]);

  function updateRole(ri, key, val) {
    setForm((f) => {
      const roles = [...(f.roles || [])];
      roles[ri] = { ...roles[ri], [key]: val };
      return { ...f, roles };
    });
  }

  function addRole() {
    setForm((f) => ({ ...f, roles: [...(f.roles || []), { ...EMPTY_ROLE }] }));
  }

  function removeRole(ri) {
    setForm((f) => ({ ...f, roles: f.roles.filter((_, i) => i !== ri) }));
  }

  function handleSave() {
    if (!form.company.trim()) return;
    const payload = { ...form, tech: Array.isArray(form.tech) ? form.tech : csvToArray(form.tech) };
    if (form.isGrouped) {
      payload.roles = (form.roles || []).map((r) => ({
        title: r.title,
        period: r.period,
        tasks: linesToArray(r.tasksText ?? arrayToLines(r.tasks)),
      }));
      delete payload.role;
      delete payload.tasks;
    } else {
      payload.tasks = linesToArray(tasksText);
      delete payload.roles;
      delete payload.isGrouped;
    }
    onSave(payload, index);
    onClose();
  }

  return (
    <SidePanel
      open={open}
      wide
      title={index != null ? 'Edit Experience' : 'Tambah Experience'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
          <button type="button" className="btn-primary" onClick={handleSave}>Simpan</button>
        </>
      }
    >
      <div className="sidepanel-form">
        <div className="form-row">
          <Field label="Perusahaan *">
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          {!form.isGrouped && (
            <Field label="Posisi / Role">
              <input value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
          )}
        </div>
        <div className="form-row">
          <Field label="Periode">
            <input value={form.period || ''} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </Field>
          <Field label="Lokasi">
            <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Tipe pekerjaan">
            <input value={form.employmentType || ''} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} />
          </Field>
          <Field label="Align timeline">
            <select value={form.align || 'left'} onChange={(e) => setForm({ ...form, align: e.target.value })}>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </Field>
        </div>
        <Field label="Tech (pisah koma)">
          <input value={arrayToCsv(form.tech)} onChange={(e) => setForm({ ...form, tech: csvToArray(e.target.value) })} />
        </Field>
        <label className="sidepanel-check">
          <input type="checkbox" checked={!!form.isGrouped} onChange={(e) => setForm({ ...form, isGrouped: e.target.checked, roles: e.target.checked ? (form.roles?.length ? form.roles : [{ ...EMPTY_ROLE }]) : [] })} />
          Multi-role (grup posisi dalam satu perusahaan)
        </label>

        {!form.isGrouped ? (
          <Field label="Tasks (satu per baris)">
            <textarea rows={5} value={tasksText} onChange={(e) => setTasksText(e.target.value)} />
          </Field>
        ) : (
          <>
            <div className="sidepanel-section-title">
              <span>Roles</span>
              <button type="button" className="btn-sm btn-edit" onClick={addRole}><i className="fas fa-plus" /> Role</button>
            </div>
            {(form.roles || []).map((role, ri) => (
              <div key={ri} className="sidepanel-nested-card">
                <div className="sidepanel-nested-header">
                  <strong>{role.title || `Role ${ri + 1}`}</strong>
                  <button type="button" className="btn-sm btn-delete" onClick={() => removeRole(ri)}><i className="fas fa-trash" /></button>
                </div>
                <div className="form-row">
                  <Field label="Judul role">
                    <input value={role.title || ''} onChange={(e) => updateRole(ri, 'title', e.target.value)} />
                  </Field>
                  <Field label="Periode">
                    <input value={role.period || ''} onChange={(e) => updateRole(ri, 'period', e.target.value)} />
                  </Field>
                </div>
                <Field label="Tasks (satu per baris)">
                  <textarea rows={3} value={role.tasksText ?? arrayToLines(role.tasks)} onChange={(e) => updateRole(ri, 'tasksText', e.target.value)} />
                </Field>
              </div>
            ))}
          </>
        )}
      </div>
    </SidePanel>
  );
}

export function CertPanel({ open, index, data, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_CERT);
  useEffect(() => { if (open) setForm(index != null && data ? structuredClone(data) : { ...EMPTY_CERT }); }, [open, index, data]);
  return (
    <SidePanel open={open} title={index != null ? 'Edit Sertifikasi' : 'Tambah Sertifikasi'} onClose={onClose}
      footer={<><button type="button" className="btn-secondary" onClick={onClose}>Batal</button><button type="button" className="btn-primary" onClick={() => { if (form.name.trim()) { onSave(form, index); onClose(); } }}>Simpan</button></>}>
      <div className="sidepanel-form">
        <Field label="Nama *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Penerbit"><input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></Field>
        <div className="form-row">
          <Field label="Tahun"><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="ID Sertifikat"><input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} /></Field>
        </div>
      </div>
    </SidePanel>
  );
}

export function AwardPanel({ open, index, data, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_AWARD);
  useEffect(() => { if (open) setForm(index != null && data ? structuredClone(data) : { ...EMPTY_AWARD }); }, [open, index, data]);
  return (
    <SidePanel open={open} title={index != null ? 'Edit Award' : 'Tambah Award'} onClose={onClose}
      footer={<><button type="button" className="btn-secondary" onClick={onClose}>Batal</button><button type="button" className="btn-primary" onClick={() => { if (form.title.trim()) { onSave(form, index); onClose(); } }}>Simpan</button></>}>
      <div className="sidepanel-form">
        <Field label="Judul *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <div className="form-row">
          <Field label="Penerbit"><input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></Field>
          <Field label="Tanggal"><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        </div>
        <div className="form-row">
          <Field label="Icon"><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Field>
          <Field label="Warna"><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
        </div>
        <Field label="Deskripsi"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
    </SidePanel>
  );
}

export function RepoPanel({ open, index, data, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_REPO);
  useEffect(() => { if (open) setForm(index != null && data ? structuredClone(data) : { ...EMPTY_REPO }); }, [open, index, data]);
  return (
    <SidePanel open={open} title={index != null ? 'Edit GitHub Repo' : 'Tambah GitHub Repo'} onClose={onClose}
      footer={<><button type="button" className="btn-secondary" onClick={onClose}>Batal</button><button type="button" className="btn-primary" onClick={() => { if (form.name.trim()) { onSave(form, index); onClose(); } }}>Simpan</button></>}>
      <div className="sidepanel-form">
        <Field label="Nama repo *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Deskripsi"><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="form-row">
          <Field label="Bahasa"><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></Field>
          <Field label="Warna badge"><input value={form.languageColor} onChange={(e) => setForm({ ...form, languageColor: e.target.value })} /></Field>
        </div>
        <div className="form-row">
          <Field label="Stars"><input type="number" min="0" value={form.stars} onChange={(e) => setForm({ ...form, stars: Number(e.target.value) })} /></Field>
          <Field label="Forks"><input type="number" min="0" value={form.forks} onChange={(e) => setForm({ ...form, forks: Number(e.target.value) })} /></Field>
        </div>
        <Field label="URL GitHub"><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></Field>
      </div>
    </SidePanel>
  );
}
