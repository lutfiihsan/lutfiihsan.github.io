// ============================================================
// TRACKER.JS — Lightweight Privacy-Friendly Page View Tracker (ES MODULE)
// Sends anonymous visit data to Supabase (no cookies, no PII)
// ============================================================
import { sb } from './supabase.js';

(function () {
    if (!sb) return;

    // ── Generate or retrieve session ID (anonymous, per-tab) ──
    let sessionId = sessionStorage.getItem('_sid');
    if (!sessionId) {
        sessionId = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('_sid', sessionId);
    }

    // ── Detect device type ──
    function getDevice() {
        const ua = navigator.userAgent;
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
            return /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
        }
        return 'desktop';
    }

    // ── Determine page identifier ──
    function getPageId() {
        const path   = window.location.pathname;
        const search = window.location.search;
        if (path.includes('admin'))      return null;
        if (path.includes('blog-post')) {
            const params = new URLSearchParams(search);
            const slug   = params.get('slug') || sessionStorage.getItem('blogPostSlug') || 'unknown';
            return 'blog:' + slug;
        }
        if (path.includes('blog'))     return 'blog';
        if (path.includes('project')) {
            const params = new URLSearchParams(search);
            const id     = params.get('id') || sessionStorage.getItem('activeProjectId') || 'unknown';
            return 'project:' + id;
        }
        return 'home';
    }

    // ── Fetch country from IP (cached in sessionStorage) ──
    async function getCountry() {
        const cached = sessionStorage.getItem('_country');
        if (cached) return cached;

        try {
            const res  = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
            const data = await res.json();
            const code = data.country_code || 'XX';
            sessionStorage.setItem('_country', code);
            return code;
        } catch {
            return 'XX'; // Unknown on failure / timeout
        }
    }

    // ── Send tracking data ──
    async function trackPageView() {
        const page = getPageId();
        if (!page) return;

        const referrer = document.referrer
            ? (() => { try { return new URL(document.referrer).hostname; } catch { return 'direct'; } })()
            : 'direct';

        const [country] = await Promise.all([getCountry()]);

        try {
            await sb.from('page_views').insert({
                page,
                title:      document.title,
                referrer,
                device:     getDevice(),
                country,
                session_id: sessionId
            });
        } catch (e) {
            // Silently fail — tracking should never break the site
        }
    }

    setTimeout(trackPageView, 1500);
})();
