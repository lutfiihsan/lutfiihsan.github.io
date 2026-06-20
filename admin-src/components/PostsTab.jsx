import { useCallback, useEffect, useState } from 'react';
import { loadAllPosts, togglePublish, deletePost } from '../../assets/js/api.js';
import { formatDate } from '../lib/format';
import { toast } from '../lib/toast';
import PostEditorModal from './PostEditorModal';

export default function PostsTab({ isAdmin }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorId, setEditorId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await loadAllPosts());
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleToggle(id) {
    try {
      await togglePublish(id);
      toast('Status diperbarui!');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    const result = await Swal.fire({
      title: 'Hapus Artikel?',
      text: 'Tindakan ini permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      background: '#13132a',
      color: '#f0f0ff',
    });
    if (!result.isConfirmed) return;
    try {
      await deletePost(id);
      toast('Artikel dihapus!');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const published = posts.filter((p) => p.published).length;

  return (
    <div className="admin-content">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-newspaper" /></div>
          <div className="stat-info"><h3>{posts.length}</h3><p>Total Artikel</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-globe" /></div>
          <div className="stat-info"><h3>{published}</h3><p>Published</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-edit" /></div>
          <div className="stat-info"><h3>{posts.length - published}</h3><p>Draft</p></div>
        </div>
      </div>

      <div className="section-header">
        <h2><i className="fas fa-list" /> Daftar Artikel</h2>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditorId(null);
            setEditorOpen(true);
          }}
        >
          <i className="fas fa-plus" /> Artikel Baru
        </button>
      </div>

      <div className="posts-table-wrapper">
        {loading ? (
          <div className="loading-spinner"><i className="fas fa-spinner fa-spin" /> Memuat...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state"><p>Belum ada artikel.</p></div>
        ) : (
          <table className="posts-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Diperbarui</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="post-title-cell">{post.title}</td>
                  <td className="post-slug-cell">{post.slug}</td>
                  <td>
                    <span className={`badge ${post.published ? 'badge-published' : 'badge-draft'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{formatDate(post.updated_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-sm btn-edit"
                        onClick={() => {
                          setEditorId(post.id);
                          setEditorOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`btn-sm ${post.published ? 'btn-unpublish' : 'btn-publish'}`}
                        onClick={() => handleToggle(post.id)}
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn-sm btn-delete"
                          onClick={() => handleDelete(post.id)}
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

      {editorOpen && (
        <PostEditorModal
          key={editorId ?? 'new'}
          postId={editorId}
          onClose={() => setEditorOpen(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
