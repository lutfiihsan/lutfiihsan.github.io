import { useState } from 'react';
import { changePassword } from '../../assets/js/api.js';
import { toast } from '../lib/toast';

export default function PasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPass !== form.confirm) {
      toast('Konfirmasi password tidak cocok', 'error');
      return;
    }
    setBusy(true);
    try {
      await changePassword(form.current, form.newPass);
      toast('Password berhasil diubah!');
      setForm({ current: '', newPass: '', confirm: '' });
      onClose();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ganti Password</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Password Lama</label>
            <input
              type="password"
              required
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password Baru (min. 8)</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.newPass}
              onChange={(e) => setForm({ ...form, newPass: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Konfirmasi</label>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
