// ============================================================
// SUPABASE CLIENT CONFIGURATION (ES MODULE)
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || '';

// Inisialisasi klien Supabase
// window.supabase di-inject oleh script CDN di HTML
export const sb = (typeof window.supabase !== 'undefined') 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

if (!sb) {
    console.error('Supabase SDK not loaded or Credentials missing');
}
