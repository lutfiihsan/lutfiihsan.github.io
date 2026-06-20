// ============================================================
// TRACKER.JS — Privacy-Friendly Page View Tracker (ES MODULE)
// Hemat quota: 1x per halaman per session, tanpa API geo eksternal
// ============================================================
import { trackPageView } from './api.js';

(function () {
    let sessionId = sessionStorage.getItem('_sid');
    if (!sessionId) {
        sessionId = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('_sid', sessionId);
    }

    function getDevice() {
        const ua = navigator.userAgent;
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
            return /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
        }
        return 'desktop';
    }

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

    /** Country dari browser locale — gratis, tanpa request eksternal */
    function getCountry() {
        try {
            const locale = navigator.language || 'id-ID';
            const region = locale.split('-')[1];
            return region ? region.toUpperCase() : 'XX';
        } catch {
            return 'XX';
        }
    }

    async function track() {
        const page = getPageId();
        if (!page) return;

        // Client-side dedup: jangan track halaman yang sama 2x per session
        const trackKey = '_tracked_' + page;
        if (sessionStorage.getItem(trackKey)) return;

        const referrer = document.referrer
            ? (() => { try { return new URL(document.referrer).hostname; } catch { return 'direct'; } })()
            : 'direct';

        try {
            await trackPageView({
                page,
                title:      document.title,
                referrer,
                device:     getDevice(),
                country:    getCountry(),
                session_id: sessionId
            });
            sessionStorage.setItem(trackKey, '1');
        } catch {
            // Silently fail
        }
    }

    setTimeout(track, 1500);
})();
