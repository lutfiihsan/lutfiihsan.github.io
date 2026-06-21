import { useEffect, useRef, useState } from 'react';
import {
  getPostById,
  savePost,
  uploadCover,
  uploadMedia,
  resolveMediaUrl,
} from '@assets/api.js';
import { slugify } from '../lib/format';
import { toast } from '../lib/toast';
import SidePanel from './SidePanel';

const QUILL_OPTS = {
  theme: 'snow',
  placeholder: 'Tulis artikel kamu di sini...',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      [{ align: [] }],
      ['clean'],
    ],
  },
};

export default function PostEditorPanel({ open, postId, onClose, onSaved }) {
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    cover: '',
    tags: '',
    published: '0',
  });
  const quillRef = useRef(null);
  const editorEl = useRef(null);

  useEffect(() => {
    if (!open || typeof Quill === 'undefined' || !editorEl.current) return undefined;

    quillRef.current = new Quill(editorEl.current, QUILL_OPTS);
    quillRef.current.getModule('toolbar').addHandler('image', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp,image/gif';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          toast('Mengupload gambar...');
          const result = await uploadMedia(file, 'content');
          const url = resolveMediaUrl(result.url);
          const range = quillRef.current.getSelection(true);
          quillRef.current.insertEmbed(range.index, 'image', url);
        } catch (err) {
          toast(err.message || 'Gagal upload', 'error');
        }
      };
      input.click();
    });

    return () => {
      quillRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!postId) {
      setForm({ id: '', title: '', slug: '', excerpt: '', cover: '', tags: '', published: '0' });
      setLoading(false);
      if (quillRef.current) quillRef.current.root.innerHTML = '';
      return;
    }
    setLoading(true);
    getPostById(postId)
      .then((post) => {
        setForm({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          cover: post.cover_image || '',
          tags: (post.tags || []).join(', '),
          published: post.published ? '1' : '0',
        });
        if (quillRef.current && post.content) {
          quillRef.current.root.innerHTML = post.content;
        }
      })
      .catch((err) => {
        toast(err.message, 'error');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [open, postId, onClose]);

  function setField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !f.id && !f.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleCoverFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadCover(file);
      setField('cover', result.url);
      toast('Cover berhasil diupload!');
    } catch (err) {
      toast(err.message || 'Gagal upload cover', 'error');
    }
    e.target.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim(),
        cover_image: form.cover.trim() || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: form.published === '1',
        content: quillRef.current?.root.innerHTML || '',
      };
      if (form.id) payload.id = form.id;
      await savePost(payload);
      toast(form.id ? 'Artikel diperbarui!' : 'Artikel disimpan!');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SidePanel
      open={open}
      wide
      title={postId ? 'Edit Artikel' : 'Artikel Baru'}
      subtitle="Kelola konten blog"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
          <button type="submit" form="post-editor-form" className="btn-primary" disabled={saving || loading}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin" /> Memuat...</div>
      ) : (
        <form id="post-editor-form" onSubmit={handleSubmit} className="sidepanel-form">
          <div className="form-group">
            <label htmlFor="post-title">Judul Artikel *</label>
            <input id="post-title" value={form.title} onChange={(e) => setField('title', e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="post-slug">Slug</label>
              <input id="post-slug" value={form.slug} onChange={(e) => setField('slug', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="post-published">Status</label>
              <select id="post-published" value={form.published} onChange={(e) => setField('published', e.target.value)}>
                <option value="0">Draft</option>
                <option value="1">Published</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="post-excerpt">Excerpt</label>
            <textarea id="post-excerpt" rows={2} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Konten *</label>
            <div className="quill-wrapper">
              <div ref={editorEl} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="post-cover">Cover URL</label>
              <input id="post-cover" type="url" value={form.cover} onChange={(e) => setField('cover', e.target.value)} />
              <input type="file" accept="image/*" onChange={handleCoverFile} className="sidepanel-file-input" />
            </div>
            <div className="form-group">
              <label htmlFor="post-tags">Tags</label>
              <input id="post-tags" value={form.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="Laravel, PHP" />
            </div>
          </div>
        </form>
      )}
    </SidePanel>
  );
}
