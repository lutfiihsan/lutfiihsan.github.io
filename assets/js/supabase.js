// ============================================================
// SUPABASE CLIENT CONFIGURATION
// Credentials dari: Supabase Dashboard → Settings → API
// AMAN untuk di-commit ke GitHub (publishable key memang public)
// ============================================================

const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
const SUPABASE_ANON = window.ENV?.SUPABASE_ANON || '';

// Supabase client — diinisialisasi setelah SDK CDN dimuat
// Gunakan window.supabase yang di-inject oleh script CDN
function initSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK not loaded');
        return null;
    }
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
}

const sb = initSupabaseClient();

