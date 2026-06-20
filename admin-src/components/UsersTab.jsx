import { useCallback, useEffect, useState } from 'react';
import {
  fetchAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
} from '../../assets/js/api.js';
import { formatDate } from '../lib/format';
import { toast } from '../lib/toast';
import { handleApiError } from '../lib/apiError';

export default function UsersTab({ currentUserId, onAuthFail }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'editor' });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await fetchAllUsers());
    } catch (err) {
      handleApiError(err, onAuthFail);
    } finally {
      setLoading(false);
    }
  }, [onAuthFail]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRoleChange(userId, email, currentRole) {
    const { value: newRole } = await Swal.fire({
      title: 'Ubah Role',
      text: email,
      input: 'select',
      inputOptions: { admin: 'Admin', editor: 'Editor' },
      inputValue: currentRole,
      showCancelButton: true,
      background: '#13132a',
      color: '#f0f0ff',
    });
    if (!newRole || newRole === currentRole) return;
    try {
      await updateUserRole(userId, newRole);
      toast('Role diperbarui!');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleDelete(userId, email) {
    const result = await Swal.fire({
      title: 'Hapus Pengguna?',
      text: email,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      background: '#13132a',
      color: '#f0f0ff',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteUser(userId);
      toast('Pengguna dihapus!');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    try {
      await createUser(form.email.trim(), form.password, form.role);
      toast('Pengguna ditambahkan!');
      setModalOpen(false);
      setForm({ email: '', password: '', role: 'editor' });
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div className="admin-content">
      <div className="section-header">
        <h2><i className="fas fa-users-cog" /> Manajemen Pengguna</h2>
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          <i className="fas fa-user-plus" /> Tambah User
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-spinner"><i className="fas fa-spinner fa-spin" /></div>
        ) : (
          <table className="posts-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-editor'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-sm btn-edit"
                        disabled={u.id === currentUserId}
                        onClick={() => handleRoleChange(u.id, u.email, u.role)}
                      >
                        Ubah Role
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          className="btn-sm btn-delete"
                          onClick={() => handleDelete(u.id, u.email)}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay open" onClick={() => setModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tambah Pengguna</h2>
              <button type="button" className="btn-close" onClick={() => setModalOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Password (min. 8)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
