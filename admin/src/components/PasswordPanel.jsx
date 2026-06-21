import { useState } from 'react';
import { changePassword } from '@assets/api.js';
import { toast } from '../lib/toast';
import SidePanel from './SidePanel';

export default function PasswordPanel({ open, onClose }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [busy, setBusy] = useState(false);

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
    <SidePanel
      open={open}
      title="Ganti Password"
      subtitle="Perbarui kredensial akun Anda"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
          <button type="submit" form="password-form" className="btn-primary" disabled={busy}>
            {busy ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <form id="password-form" onSubmit={handleSubmit} className="sidepanel-form">
        <div className="form-group">
          <label>Password Lama</label>
          <input type="password" required value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password Baru (min. 8)</label>
          <input type="password" required minLength={8} value={form.newPass} onChange={(e) => setForm({ ...form, newPass: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Konfirmasi Password Baru</label>
          <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
      </form>
    </SidePanel>
  );
}
