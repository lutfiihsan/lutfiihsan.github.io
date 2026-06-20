// ============================================================
// TRACKER.JS — Privacy-Friendly Page View Tracker (ES MODULE)
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
            return 'XX';
        }
    }

    async function track() {
        const page = getPageId();
        if (!page) return;

        const referrer = document.referrer
            ? (() => { try { return new URL(document.referrer).hostname; } catch { return 'direct'; } })()
            : 'direct';

        const country = await getCountry();

        try {
            await trackPageView({
                page,
                title:      document.title,
                referrer,
                device:     getDevice(),
                country,
                session_id: sessionId
            });
        } catch {
            // Silently fail
        }
    }

    setTimeout(track, 1500);
})();
