// ============================================================
// ADMIN BLOG PANEL — JavaScript Logic (ES MODULE)
// Requires: Quill loaded first
// ============================================================
import { sb } from './supabase.js';


let quillEditor = null;
let currentUserRole = "editor"; // Default role

// ── DATATABLES STATE ──
let dtPosts = null;
let dtUsers = null;
const dtConfig = {
  searchable: true,
  fixedHeight: false,
  perPage: 10,
  labels: {
    placeholder: "Ketik untuk mencari...",
    perPage: " data / halaman",
    noRows: "Tidak ada data ditemukan",
    info: "Menampilkan {start} - {end} dari {rows} entri"
  }
};

function switchTab(tab, linkEl) {
  if (event) event.preventDefault();
  // Update sidebar active state
  document
    .querySelectorAll(".sidebar-nav a")
    .forEach((a) => a.classList.remove("active"));
  if (linkEl) linkEl.classList.add("active");

  // Toggle sections
  const postContent = document.getElementById("section-posts");
  const statsSection = document.getElementById("section-stats");
  const usersSection = document.getElementById("section-users");
  const topbarTitle = document.querySelector(".topbar-title");

  if (postContent) postContent.style.display = "none";
  if (statsSection) statsSection.style.display = "none";
  if (usersSection) usersSection.style.display = "none";

  if (tab === "stats") {
    if (statsSection) statsSection.style.display = "block";
    if (topbarTitle) topbarTitle.textContent = "Statistics";
    if (typeof loadStats === "function") loadStats();
  } else if (tab === "users") {
    if (usersSection) usersSection.style.display = "block";
    if (topbarTitle) topbarTitle.textContent = "User Management";
    refreshUsersTable();
  } else {
    if (postContent) postContent.style.display = "block";
    if (topbarTitle) topbarTitle.textContent = "Blog Posts";
  }
}

// ── INIT QUILL EDITOR ──
function initQuillEditor() {
  if (typeof Quill === "undefined") return;
  if (quillEditor) return; // already initialized

  quillEditor = new Quill("#quill-editor", {
    theme: "snow",
    placeholder: "Tulis artikel kamu di sini...",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["link", "image"],
        [{ align: [] }],
        ["clean"],
      ],
    },
  });
}

// ── SESSION CHECK ──
async function checkAdminSession() {
  if (!sb) return null;
  const {
    data: { session },
  } = await sb.auth.getSession();
  return session;
}

// ── GET USER PROFILE ──
async function fetchUserProfile(userId) {
  try {
    const { data } = await sb.from("profiles").select("role").eq("id", userId).single();
    if (data) currentUserRole = data.role;
  } catch (e) {
    currentUserRole = "editor";
  }
}

// ── LOGIN ──
async function adminLogin(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ── LOGOUT ──
async function adminLogout() {
  const result = await Swal.fire({
    title: "Yakin ingin keluar?",
    text: "Anda akan keluar dari sesi administrator.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#667eea",
    confirmButtonText: "Ya, Keluar",
    cancelButtonText: "Batal",
    background: "#13132a",
    color: "#f0f0ff",
  });

  if (result.isConfirmed) {
    await sb.auth.signOut();
    showToast("Berhasil logout dari sistem");
    setTimeout(() => location.reload(), 1200);
  }
}

// ── LOAD ALL POSTS (admin sees drafts too) ──
async function loadAllPosts() {
  const { data, error } = await sb
    .from("posts")
    .select("id, title, slug, published, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── SAVE POST (insert or update) ──
async function savePost(postData) {
  const isEdit = !!postData.id;

  // Auto-generate slug from title if not set
  if (!postData.slug) {
    postData.slug = slugify(postData.title);
  }
  postData.updated_at = new Date().toISOString();

  if (isEdit) {
    const id = postData.id;
    delete postData.id;
    const { data, error } = await sb
      .from("posts")
      .update(postData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await sb
      .from("posts")
      .insert(postData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ── LOAD SINGLE POST by ID ──
async function getPostById(id) {
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// ── DELETE POST ──
async function deletePost(id) {
  if (currentUserRole !== 'admin') throw new Error('Hanya Admin yang dapat menghapus artikel.');
  const { error } = await sb.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// ── TOGGLE PUBLISH ──
async function togglePublish(id, currentStatus) {
  const { error } = await sb
    .from("posts")
    .update({ published: !currentStatus, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ── HELPER: Slugify title ──
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ── HELPER: Format date ──
function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── TOAST NOTIFICATION (SweetAlert2) ──
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#13132a",
  color: "#e2e8f0",
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

function showToast(message, type = "success") {
  Toast.fire({
    icon: type === "error" ? "error" : "success",
    title: message,
  });
}

// ── RENDER POSTS TABLE ──
function renderPostsTable(posts) {
  const tbody = document.getElementById("posts-tbody");
  const statsTotal = document.getElementById("stat-total");
  const statsPublished = document.getElementById("stat-published");
  const statsDraft = document.getElementById("stat-draft");

  const published = posts.filter((p) => p.published).length;
  const draft = posts.length - published;

  if (statsTotal) statsTotal.textContent = posts.length;
  if (statsPublished) statsPublished.textContent = published;
  if (statsDraft) statsDraft.textContent = draft;

  if (!tbody) return;

  if (dtPosts) {
      dtPosts.destroy();
  }

  if (posts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
            <i class="fas fa-pencil-alt"></i>
            <p>Belum ada artikel. Mulai tulis artikel pertamamu!</p>
        </div></td></tr>`;
    return;
  }

  tbody.innerHTML = posts
    .map(
      (post) => `
        <tr data-id="${post.id}">
            <td class="post-title-cell">${escapeHtml(post.title)}</td>
            <td class="post-slug-cell">${escapeHtml(post.slug)}</td>
            <td>
                <span class="badge ${post.published ? "badge-published" : "badge-draft"}">
                    <i class="fas ${post.published ? "fa-globe" : "fa-edit"}"></i>
                    ${post.published ? "Published" : "Draft"}
                </span>
            </td>
            <td>${formatDate(post.updated_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-sm btn-edit" onclick="openEditor('${post.id}')">
                        <i class="fas fa-pen"></i> Edit
                    </button>
                    <button class="btn-sm ${post.published ? "btn-unpublish" : "btn-publish"}"
                            onclick="handleTogglePublish('${post.id}', ${post.published})">
                        <i class="fas ${post.published ? "fa-eye-slash" : "fa-globe"}"></i>
                        ${post.published ? "Unpublish" : "Publish"}
                    </button>
                    ${currentUserRole === 'admin' ? `
                    <button class="btn-sm btn-delete" onclick="handleDeletePost('${post.id}', this)">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </td>
        </tr>
    `,
    )
    .join("");

  dtPosts = new simpleDatatables.DataTable("#table-posts", dtConfig);

}

// ── ESCAPE HTML ──
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

// ── OPEN EDITOR MODAL ──
async function openEditor(postId = null) {
  const modal = document.getElementById("post-modal");
  const form = document.getElementById("post-form");
  const title = document.getElementById("modal-title");
  const spinner = document.getElementById("modal-loading");

  form.reset();
  document.getElementById("post-id").value = "";
  title.textContent = postId ? "Edit Artikel" : "Artikel Baru";

  // Reset Quill editor
  if (quillEditor) quillEditor.setContents([]);

  if (postId) {
    spinner.style.display = "block";
    form.style.display = "none";
    modal.classList.add("open");

    try {
      const post = await getPostById(postId);
      document.getElementById("post-id").value = post.id;
      document.getElementById("post-title").value = post.title;
      document.getElementById("post-slug").value = post.slug;
      document.getElementById("post-excerpt").value = post.excerpt || "";
      document.getElementById("post-cover").value = post.cover_image || "";
      document.getElementById("post-tags").value = (post.tags || []).join(", ");
      document.getElementById("post-published").value = post.published
        ? "1"
        : "0";

      // Load content into Quill (HTML)
      if (quillEditor && post.content) {
        quillEditor.root.innerHTML = post.content;
      }
    } catch (e) {
      showToast("Gagal memuat artikel", "error");
      closeEditor();
      return;
    } finally {
      spinner.style.display = "none";
      form.style.display = "block";
    }
  } else {
    modal.classList.add("open");
  }
}

function closeEditor() {
  document.getElementById("post-modal").classList.remove("open");
}

// ── HANDLE FORM SUBMIT ──
async function handlePostSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-save");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  const id = document.getElementById("post-id").value;
  const title = document.getElementById("post-title").value.trim();
  const slug =
    document.getElementById("post-slug").value.trim() || slugify(title);
  const excerpt = document.getElementById("post-excerpt").value.trim();
  const cover = document.getElementById("post-cover").value.trim();
  const tagsRaw = document.getElementById("post-tags").value.trim();
  const published = document.getElementById("post-published").value === "1";

  // Get content from Quill editor (HTML output)
  const content = quillEditor
    ? quillEditor.root.innerHTML
    : document.getElementById("post-content").value.trim();

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const postData = {
    title,
    slug,
    excerpt,
    content,
    cover_image: cover || null,
    tags,
    published,
  };
  if (id) postData.id = id;

  try {
    await savePost(postData);
    showToast(
      id ? "Artikel berhasil diperbarui!" : "Artikel berhasil disimpan!",
    );
    closeEditor();
    await refreshPosts();
  } catch (err) {
    showToast(err.message || "Gagal menyimpan artikel", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }
}

// ── TOGGLE PUBLISH HANDLER ──
async function handleTogglePublish(id, currentStatus) {
  try {
    await togglePublish(id, currentStatus);
    showToast(
      currentStatus
        ? "Artikel dipindah ke Draft"
        : "Artikel berhasil dipublish!",
    );
    await refreshPosts();
  } catch (err) {
    showToast(err.message || "Gagal mengubah status", "error");
  }
}

// ── DELETE HANDLER ──
async function handleDeletePost(id, btn) {
  const result = await Swal.fire({
    title: "Hapus Artikel?",
    text: "Tindakan ini permanen dan tidak bisa dibatalkan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#667eea",
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    background: "#13132a",
    color: "#f0f0ff",
  });

  if (!result.isConfirmed) return;

  btn.disabled = true;
  try {
    await deletePost(id);
    showToast("Artikel berhasil dihapus!");
    await refreshPosts();
  } catch (err) {
    showToast(err.message || "Gagal menghapus", "error");
    btn.disabled = false;
  }
}

// ── REFRESH TABLE ──
async function refreshPosts() {
  const tbody = document.getElementById("posts-tbody");
  if (tbody)
    tbody.innerHTML = `<tr><td colspan="5"><div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Memuat...</div></td></tr>`;
  try {
    const posts = await loadAllPosts();
    renderPostsTable(posts);
  } catch (err) {
    showToast("Gagal memuat posts: " + err.message, "error");
  }
}

// ── AUTO SLUG ──
function setupAutoSlug() {
  const titleInput = document.getElementById("post-title");
  const slugInput = document.getElementById("post-slug");
  if (!titleInput || !slugInput) return;

  titleInput.addEventListener("input", () => {
    if (!document.getElementById("post-id").value) {
      slugInput.value = slugify(titleInput.value);
    }
  });
}

// ── USER MANAGEMENT FUNCTIONS (RBAC) ──
async function fetchAllUsers() {
  const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function updateUserRole(id, newRole) {
  const { error } = await sb.from("profiles").update({ role: newRole }).eq("id", id);
  if (error) throw error;
}

async function refreshUsersTable() {
  const tbody = document.getElementById("users-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = `<tr><td colspan="4"><div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Memuat...</div></td></tr>`;
  try {
    const users = await fetchAllUsers();
    
    // Prevent admin from downgrading themselves easily
    const { data: { session } } = await sb.auth.getSession();
    const currentUid = session?.user?.id;

    if (dtUsers) {
        dtUsers.destroy();
    }

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">Data pengguna kosong</div></td></tr>`;
        return;
    }

    tbody.innerHTML = users.map((u) => `
      <tr>
        <td>${escapeHtml(u.email)}</td>
        <td>
          <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-editor'}">
            <i class="fas ${u.role === 'admin' ? 'fa-shield-alt' : 'fa-pen'}"></i> 
            ${u.role === 'admin' ? 'Admin' : 'Editor'}
          </span>
        </td>
        <td>${formatDate(u.created_at)}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="promptChangeRole('${u.id}', '${escapeHtml(u.email)}', '${u.role}')" ${u.id === currentUid ? 'disabled style="opacity:0.5;cursor:not-allowed;" title="Tidak bisa diubah"' : ''}>
            Ubah Role
          </button>
        </td>
      </tr>
    `).join("");

    dtUsers = new simpleDatatables.DataTable("#table-users", dtConfig);

  } catch (e) {
    showToast("Gagal memuat peran pengguna. Mungkin RLS Anda menolak akses.", "error");
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">Akses Ditolak / Anda bukan Admin</div></td></tr>`;
  }
}

async function promptChangeRole(userId, email, currentRole) {
  const { value: newRole } = await Swal.fire({
    title: 'Akses Admin',
    text: `Ubah peran untuk: ${email}`,
    input: 'select',
    inputOptions: { 'admin': 'Admin', 'editor': 'Editor' },
    inputValue: currentRole,
    showCancelButton: true,
    confirmButtonText: 'Simpan'
  });
  
  if (newRole && newRole !== currentRole) {
    try {
      await updateUserRole(userId, newRole);
      showToast('Hak akses berhasil diperbarui!');
      refreshUsersTable();
    } catch (e) {
      showToast('Gagal update akses role.', 'error');
    }
  }
}

// ── INIT ADMIN PAGE ──
document.addEventListener("DOMContentLoaded", async () => {
  const loginSection = document.getElementById("admin-login");
  const dashboardSection = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");

  if (!sb) {
    if (loginError) {
      loginError.textContent = "Koneksi Supabase gagal. Periksa Environment Variables.";
      loginError.style.display = "block";
    }
    return;
  }


  // ── REGISTER EVENT LISTENERS EARLY ──
  const postForm = document.getElementById("post-form");
  const logoutBtn = document.getElementById("btn-logout");
  const modal = document.getElementById("post-modal");
  const btnLoginTitle = document.getElementById("btn-login");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      adminLogout();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeEditor();
    });
  }

  if (postForm) {
    postForm.addEventListener("submit", handlePostSubmit);
  }

  setupAutoSlug();
  initQuillEditor();

  // Check existing session
  try {
    const session = await checkAdminSession();
    if (session) {
      showDashboard(session.user);
    } else {
      if (loginSection) loginSection.style.display = "flex";
      if (dashboardSection) dashboardSection.style.display = "none";
    }
  } catch (e) {
    console.error("Session check error", e);
  }

  // Listen for auth changes
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      showDashboard(session.user);
    } else if (event === "SIGNED_OUT") {
      if (loginSection) loginSection.style.display = "flex";
      if (dashboardSection) dashboardSection.style.display = "none";
    }
  });

  // Login form submit
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("btn-login");
      const email = document.getElementById("admin-email").value.trim();
      const password = document.getElementById("admin-pass").value;

      btn.disabled = true;
      btn.textContent = "Memproses...";
      if (loginError) loginError.style.display = "none";

      try {
        await adminLogin(email, password);
        showToast("Login berhasil!");
      } catch (err) {
        if (loginError) {
          loginError.textContent = err.message || "Email atau password salah.";
          loginError.style.display = "block";
        }
      } finally {
        btn.disabled = false;
        btn.textContent = "Login";
      }
    });
  }
});

async function showDashboard(user) {
  const loginSection = document.getElementById("admin-login");
  const dashboardSection = document.getElementById("admin-dashboard");
  const userEmail = document.getElementById("user-email");
  const userAvatar = document.getElementById("user-avatar");
  const navStats = document.getElementById("nav-stats");
  const navUsers = document.getElementById("nav-users");

  if (loginSection) loginSection.style.display = "none";
  if (dashboardSection) dashboardSection.style.display = "flex";

  if (userEmail) userEmail.textContent = user.email;
  if (userAvatar) userAvatar.textContent = (user.email || "A")[0].toUpperCase();

  // Load their RBAC profile
  await fetchUserProfile(user.id);

  // Apply RBAC UI Rules
  if (currentUserRole === 'admin') {
      if (navStats) navStats.style.display = 'block';
      if (navUsers) navUsers.style.display = 'block';
      switchTab("stats", navStats);
  } else {
      // Hide admin-only tabs
      if (navStats) navStats.style.display = 'none';
      if (navUsers) navUsers.style.display = 'none';
      switchTab("posts", document.getElementById("nav-posts"));
  }

  // Quietly refresh posts table
  refreshPosts();
}

// ── EXPOSE TO WINDOW (for HTML onclicks) ──
window.switchTab = switchTab;
window.openEditor = openEditor;
window.closeEditor = closeEditor;
window.handleTogglePublish = handleTogglePublish;
window.handleDeletePost = handleDeletePost;
window.promptChangeRole = promptChangeRole;
window.adminLogout = adminLogout;
