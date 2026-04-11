// ============================================================
// SUPABASE CLIENT CONFIGURATION (ES MODULE)
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || '';

// Inisialisasi klien Supabase
// window.supabase di-inject oleh script CDN di HTML
const isSdkLoaded = typeof window.supabase !== 'undefined';
const hasCredentials = SUPABASE_URL && SUPABASE_ANON;

export const sb = (isSdkLoaded && hasCredentials) 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

if (!isSdkLoaded) {
    console.error('Supabase SDK not loaded (CDN script missing or failed)');
} else if (!hasCredentials) {
    console.warn('Supabase credentials missing. Check your environment variables.');
}
