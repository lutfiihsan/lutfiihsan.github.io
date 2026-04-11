// ============================================================
// BLOG PUBLIC — JavaScript Logic
// Requires: supabase.js loaded first
// ============================================================

// ── FETCH PUBLISHED POSTS ──
async function fetchPublishedPosts() {
    const { data, error } = await sb
        .from('posts')
        .select('id, title, slug, excerpt, cover_image, tags, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

// ── FETCH SINGLE POST BY SLUG ──
async function fetchPostBySlug(slug) {
    const { data, error } = await sb
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
    if (error) throw error;
    return data;
}

// ── FORMAT DATE (Bahasa Indonesia) ──
function formatDateBlog(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

// ── RENDER POSTS GRID ──
function renderBlogPosts(posts, container) {
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding: 6rem 2rem; color: var(--text-muted);">
                <i class="fas fa-pencil-alt" style="font-size:4rem; opacity:0.3; display:block; margin-bottom:1.5rem;"></i>
                <h3 style="font-size:2rem; margin-bottom:1rem;">Belum ada artikel</h3>
                <p style="font-size:1.5rem;">Artikel akan muncul di sini setelah dipublish.</p>
            </div>`;
        return;
    }

    container.innerHTML = posts.map(post => {
        const coverBg = post.cover_image
            ? `background-image: url('${post.cover_image}'); background-size:cover; background-position:center;`
            : `background: linear-gradient(135deg, #667eea, #764ba2);`;

        const tags = (post.tags || []).map(t =>
            `<span class="blog-tag">${t}</span>`).join('');

        return `
        <article class="blog-card" onclick="openPost('${post.slug}')" role="link" tabindex="0" style="cursor:pointer;">
            <div class="blog-card-cover" style="${coverBg}">
                <div class="blog-card-overlay"></div>
                ${tags ? `<div class="blog-card-tags">${tags}</div>` : ''}
            </div>
            <div class="blog-card-body">
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt || ''}</p>
                <div class="blog-card-footer">
                    <span class="blog-date"><i class="fas fa-calendar-alt"></i> ${formatDateBlog(post.created_at)}</span>
                    <span class="blog-read-more">Baca Selengkapnya <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        </article>`;
    }).join('');
}

// ── OPEN POST ──
function openPost(slug) {
    sessionStorage.setItem('blogPostSlug', slug);
    window.location.href = 'blog-post.html';
}

// ── RENDER SINGLE POST ──
function renderSinglePost(post, container) {
    if (!container) return;
    document.title = `${post.title} | Blog — Lutfi Ihsan`;

    const tags = (post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('');

    // Content from Quill is already HTML — render directly, safely wrapped
    const renderedContent = post.content || '<p><em>Konten belum tersedia.</em></p>';

    container.innerHTML = `
        <article class="post-article">
            ${post.cover_image ? `<div class="post-hero" style="background-image:url('${post.cover_image}')"><div class="post-hero-overlay"></div></div>` : ''}
            <div class="post-header">
                <div class="blog-card-tags" style="margin-bottom:1.5rem;">${tags}</div>
                <h1 class="post-title">${post.title}</h1>
                <div class="post-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${formatDateBlog(post.created_at)}</span>
                    <span><i class="fas fa-user"></i> Lutfi Ihsan</span>
                </div>
                ${post.excerpt ? `<p class="post-lead">${post.excerpt}</p>` : ''}
            </div>
            <div class="post-content prose ql-editor" style="pointer-events:auto;">${renderedContent}</div>
            <div class="post-footer">
                <a href="blog.html" class="btn-back"><i class="fas fa-arrow-left"></i> Kembali ke Blog</a>
            </div>
        </article>
    `;
}

// ── INIT BLOG LIST PAGE ──
async function initBlogPage() {
    const container = document.getElementById('blog-posts-grid');
    if (!container) return;

    container.innerHTML = `<div class="blog-loading"><i class="fas fa-spinner fa-spin"></i> Memuat artikel...</div>`;

    try {
        const posts = await fetchPublishedPosts();
        renderBlogPosts(posts, container);
    } catch (err) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:4rem; color:#f5576c;">
            <i class="fas fa-exclamation-circle" style="font-size:3rem; display:block; margin-bottom:1rem;"></i>
            <p>Gagal memuat artikel. Silakan coba lagi.</p>
        </div>`;
    }
}

// ── INIT SINGLE POST PAGE ──
async function initPostPage() {
    const container = document.getElementById('post-container');
    if (!container) return;

    // Try URL param first, then sessionStorage
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') || sessionStorage.getItem('blogPostSlug');
    if (slug) sessionStorage.removeItem('blogPostSlug');

    if (!slug) {
        container.innerHTML = `<div style="text-align:center; padding:6rem;"><h2>Artikel tidak ditemukan</h2> <a href="blog.html">← Kembali ke Blog</a></div>`;
        return;
    }

    container.innerHTML = `<div class="blog-loading"><i class="fas fa-spinner fa-spin"></i> Memuat artikel...</div>`;

    try {
        const post = await fetchPostBySlug(slug);
        renderSinglePost(post, container);
    } catch (err) {
        container.innerHTML = `<div style="text-align:center; padding:6rem;">
            <h2>Artikel Tidak Ditemukan</h2>
            <p style="margin:1.5rem 0;">Mungkin artikel telah dihapus atau belum dipublish.</p>
            <a href="blog.html" class="btn-back"><i class="fas fa-arrow-left"></i> Kembali ke Blog</a>
        </div>`;
    }
}

// ── AUTO INIT ──
document.addEventListener('DOMContentLoaded', () => {
    if (!sb) return;
    if (document.getElementById('blog-posts-grid')) initBlogPage();
    if (document.getElementById('post-container'))  initPostPage();
});
