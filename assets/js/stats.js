// ============================================================
// STATS.JS — Admin Statistics Dashboard (Highcharts Edition)
// Requires: supabase.js + Highcharts loaded
// ============================================================

// ── HIGHCHARTS GLOBAL DARK THEME ──
Highcharts.setOptions({
    chart: {
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' },
        animation: { duration: 700, easing: 'easeOutQuart' }
    },
    title:    { style: { display: 'none' } },
    subtitle: { style: { display: 'none' } },
    colors: ['#f68c09', '#667eea', '#43e97b', '#f5576c', '#a78bfa', '#38bdf8'],
    xAxis: {
        gridLineColor: 'rgba(255,255,255,0.06)',
        lineColor:     'rgba(255,255,255,0.1)',
        tickColor:     'transparent',
        labels: { style: { color: '#8888aa', fontSize: '11px' } }
    },
    yAxis: {
        gridLineColor: 'rgba(255,255,255,0.06)',
        labels: { style: { color: '#8888aa', fontSize: '11px' } },
        title: { text: null }
    },
    legend: {
        itemStyle:      { color: '#f0f0ff', fontWeight: '500', fontSize: '12px' },
        itemHoverStyle: { color: '#f68c09' }
    },
    tooltip: {
        backgroundColor: '#13132a',
        borderColor:     'rgba(255,255,255,0.12)',
        borderRadius:    10,
        style:           { color: '#f0f0ff', fontSize: '13px' },
        shadow: false
    },
    plotOptions: {
        series: { animation: { duration: 700 } }
    },
    credits: { enabled: false },
    exporting: { enabled: false }
});

// ── FETCH ALL STATS ──
async function loadStats() {
    showStatsLoading(true);
    try {
        const [summary, daily, topPages, topPosts, devices, referrers, countries] = await Promise.all([
            fetchSummary(),
            fetchDailyViews(30),
            fetchTopPages(),
            fetchTopBlogPosts(),
            fetchDeviceBreakdown(),
            fetchReferrers(),
            fetchCountries()
        ]);

        renderSummaryCards(summary);
        renderAreaChart(daily);
        renderBarChart('chart-top-pages', topPages.map(p => p.page), topPages.map(p => p.count), 'Kunjungan', '#f68c09');
        renderPieChart(devices);
        renderBarChart('chart-top-posts', topPosts.map(p => p.page), topPosts.map(p => p.count), 'Pembaca', '#667eea');
        renderReferrersChart(referrers);
        renderMapChart(countries);
    } catch (err) {
        console.error('Stats load error:', err);
        const errEl = document.getElementById('stats-error');
        if (errEl) errEl.style.display = 'block';
    } finally {
        showStatsLoading(false);
    }
}

// ── SUMMARY ──
async function fetchSummary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, today, unique] = await Promise.all([
        sb.from('page_views').select('*', { count: 'exact', head: true }),
        sb.from('page_views').select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString()),
        sb.from('page_views').select('session_id')
    ]);

    const uniqueSessions = new Set((unique.data || []).map(r => r.session_id)).size;
    return { total: total.count || 0, today: today.count || 0, unique: uniqueSessions };
}

// ── DAILY VIEWS (last 30 days) ──
async function fetchDailyViews(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await sb.from('page_views')
        .select('created_at')
        .gte('created_at', since.toISOString())
        .order('created_at');

    const counts = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        counts[key] = 0;
    }
    (data || []).forEach(row => {
        const key = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (counts[key] !== undefined) counts[key]++;
    });
    return { labels: Object.keys(counts), values: Object.values(counts) };
}

// ── TOP PAGES ──
async function fetchTopPages() {
    const { data } = await sb.from('page_views').select('page');
    const counts = {};
    (data || []).forEach(row => {
        if (!row.page || row.page.startsWith('blog:') || row.page.startsWith('project:')) return;
        counts[row.page] = (counts[row.page] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1]).slice(0, 7)
        .map(([page, count]) => ({ page: page === 'home' ? '🏠 Home' : page, count }));
}

// ── TOP BLOG POSTS ──
async function fetchTopBlogPosts() {
    const { data } = await sb.from('page_views').select('page');
    const counts = {};
    (data || []).forEach(row => {
        if (!row.page || !row.page.startsWith('blog:')) return;
        const slug = row.page.replace('blog:', '');
        counts[slug] = (counts[slug] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1]).slice(0, 7)
        .map(([page, count]) => ({ page, count }));
}

// ── DEVICE BREAKDOWN ──
async function fetchDeviceBreakdown() {
    const { data } = await sb.from('page_views').select('device');
    const counts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    (data || []).forEach(row => {
        if (row.device === 'desktop') counts.Desktop++;
        else if (row.device === 'mobile') counts.Mobile++;
        else if (row.device === 'tablet') counts.Tablet++;
    });
    return counts;
}

// ── REFERRERS ──
async function fetchReferrers() {
    const { data } = await sb.from('page_views').select('referrer');
    const counts = {};
    (data || []).forEach(row => {
        const ref = row.referrer || 'direct';
        counts[ref] = (counts[ref] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([source, count]) => ({ source, count }));
}

// ── COUNTRY BREAKDOWN (MAPS) ──
async function fetchCountries() {
    const { data } = await sb.from('page_views').select('country');
    const counts = {};
    (data || []).forEach(row => {
        const code = (row.country && row.country !== 'XX') ? row.country.toLowerCase() : null;
        if (code) counts[code] = (counts[code] || 0) + 1;
    });
    // Highcharts maps expects array of arrays: [['id', count], ['us', count]]
    return Object.entries(counts).map(([code, count]) => [code, count]);
}

// ── RENDER SUMMARY CARDS ──
function renderSummaryCards({ total, today, unique }) {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stats-total-views',    total.toLocaleString('id-ID'));
    el('stats-today-views',    today.toLocaleString('id-ID'));
    el('stats-unique-visitors', unique.toLocaleString('id-ID'));
}

// ── AREA CHART: Daily Views ──
function renderAreaChart({ labels, values }) {
    const el = document.getElementById('chart-daily');
    if (!el || typeof Highcharts === 'undefined') return;

    Highcharts.chart('chart-daily', {
        chart: { type: 'area' },
        xAxis: { categories: labels, tickInterval: Math.ceil(labels.length / 8) },
        yAxis: { allowDecimals: false },
        series: [{
            name: 'Kunjungan',
            data: values,
            color: '#f68c09',
            fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, 'rgba(246,140,9,0.35)'],
                    [1, 'rgba(246,140,9,0.02)']
                ]
            },
            lineWidth: 2.5,
            marker: { radius: 3, fillColor: '#f68c09' },
            threshold: null
        }],
        tooltip: {
            backgroundColor: '#13132a',
            borderColor: 'rgba(255,255,255,0.12)',
            borderRadius: 10,
            style: { color: '#f0f0ff' },
            headerFormat: '<span style="font-size:11px;color:#8888aa">{point.key}</span><br>',
            pointFormat: '<b style="color:#f68c09">{point.y}</b> kunjungan'
        }
    });
}

// ── BAR CHART: Top Pages / Top Posts ──
function renderBarChart(containerId, categories, data, seriesName, color) {
    const el = document.getElementById(containerId);
    if (!el || typeof Highcharts === 'undefined') return;

    if (!categories.length) {
        el.innerHTML = '<div style="text-align:center;padding:4rem;color:#8888aa;font-size:1.3rem;">Belum ada data</div>';
        return;
    }

    Highcharts.chart(containerId, {
        chart: { type: 'bar' },
        xAxis: {
            categories,
            labels: {
                style: { color: '#f0f0ff', fontSize: '12px' },
                formatter: function() {
                    return this.value.length > 20 ? this.value.substring(0, 20) + '…' : this.value;
                }
            }
        },
        yAxis: { allowDecimals: false, gridLineColor: 'rgba(255,255,255,0.06)' },
        plotOptions: {
            bar: {
                borderRadius: 6,
                dataLabels: { enabled: true, style: { color: '#f0f0ff', fontSize: '11px' }, format: '{y}' }
            }
        },
        series: [{
            name: seriesName,
            data,
            color: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
                stops: [[0, color], [1, color + '99']]
            },
            showInLegend: false
        }],
        tooltip: {
            backgroundColor: '#13132a',
            borderColor: 'rgba(255,255,255,0.12)',
            borderRadius: 10,
            style: { color: '#f0f0ff' },
            pointFormat: `<b style="color:${color}">{point.y}</b> ${seriesName.toLowerCase()}`
        }
    });
}

// ── PIE CHART: Device Breakdown ──
function renderPieChart({ Desktop, Mobile, Tablet }) {
    const el = document.getElementById('chart-device');
    if (!el || typeof Highcharts === 'undefined') return;

    Highcharts.chart('chart-device', {
        chart: { type: 'pie' },
        plotOptions: {
            pie: {
                innerSize: '55%',       // donut style
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '<b style="color:{point.color}">{point.name}</b>: {point.percentage:.1f}%',
                    style: { color: '#f0f0ff', fontSize: '12px', textOutline: 'none' }
                }
            }
        },
        series: [{
            name: 'Perangkat',
            colorByPoint: true,
            data: [
                { name: 'Desktop', y: Desktop, color: '#667eea' },
                { name: 'Mobile',  y: Mobile,  color: '#f68c09' },
                { name: 'Tablet',  y: Tablet,  color: '#43e97b' }
            ]
        }],
        tooltip: {
            backgroundColor: '#13132a',
            borderColor: 'rgba(255,255,255,0.12)',
            borderRadius: 10,
            style: { color: '#f0f0ff' },
            pointFormat: '<b style="color:{point.color}">{point.y}</b> kunjungan ({point.percentage:.1f}%)'
        }
    });
}

// ── BAR CHART: Traffic Sources ──
function renderReferrersChart(referrers) {
    const el = document.getElementById('chart-referrers');
    if (!el || typeof Highcharts === 'undefined') return;

    if (!referrers.length) {
        el.innerHTML = '<div style="text-align:center;padding:4rem;color:#8888aa;font-size:1.3rem;">Belum ada data</div>';
        return;
    }

    const labelMap = {
        'direct': '🔗 Direct',
        'google.com': '🔍 Google',
        'github.com': '🐙 GitHub',
        'linkedin.com': '💼 LinkedIn',
        't.co': '🐦 Twitter/X'
    };

    Highcharts.chart('chart-referrers', {
        chart: { type: 'column' },
        xAxis: {
            categories: referrers.map(r => labelMap[r.source] || r.source),
            labels: { style: { color: '#f0f0ff', fontSize: '11px' } }
        },
        yAxis: { allowDecimals: false },
        plotOptions: {
            column: {
                borderRadius: 6,
                colorByPoint: true,
                dataLabels: { enabled: true, style: { color: '#f0f0ff', fontSize: '11px' }, format: '{y}' }
            }
        },
        series: [{
            name: 'Kunjungan',
            data: referrers.map(r => r.count),
            showInLegend: false
        }],
        tooltip: {
            backgroundColor: '#13132a',
            borderColor: 'rgba(255,255,255,0.12)',
            borderRadius: 10,
            style: { color: '#f0f0ff' },
            headerFormat: '<span style="color:#8888aa;font-size:11px">{point.key}</span><br>',
            pointFormat: '<b style="color:#f68c09">{point.y}</b> kunjungan'
        }
    });
}

// ── WORLD MAP (LEAFLET DYNAMIC) ──
let leafletMap = null;

// Rough coordinate mapping for top countries (ISO Alpha-2 to [Lat, Lng])
const countryCoords = {
    'id': [-0.7893, 113.9213], 'us': [37.0902, -95.7129], 'sg': [1.3521, 103.8198],
    'my': [4.2105, 101.9758],  'au': [-25.2744, 133.7751], 'gb': [55.3781, -3.4360],
    'jp': [36.2048, 138.2529], 'cn': [35.8617, 104.1954], 'in': [20.5937, 78.9629],
    'de': [51.1657, 10.4515],  'fr': [46.2276, 2.2137],   'nl': [52.1326, 5.2913],
    'kr': [35.9078, 127.7669], 'ru': [61.5240, 105.3188], 'br': [-14.2350, -51.9253],
    'ca': [56.1304, -106.3468], 'ph': [12.8797, 121.7740], 'th': [15.8700, 100.9925]
};

function renderMapChart(countries) {
    const el = document.getElementById('chart-map');
    if (!el || typeof L === 'undefined') return;

    if (!countries.length) {
        // Jika belum ada data, tetap render peta dengan default Indonesia (0 kunjungan)
        countries = [['id', 0]];
    }

    if (leafletMap) {
        leafletMap.remove();
    }

    // Initialize map centered on Asia/Global
    leafletMap = L.map('chart-map', {
        center: [15, 65],
        zoom: 2,
        minZoom: 1,
        maxBounds: [[-90, -180], [90, 180]]
    });

    // Google Maps Standard tiles for Leaflet mapping
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20
    }).addTo(leafletMap);

    // Calculate max count for scaling markers
    const maxCount = Math.max(...countries.map(c => c[1]), 1);

    countries.forEach(([code, count]) => {
        const coords = countryCoords[code];
        if (coords) {
            // Dynamic radius based on visits, min 7px, max 30px
            const radius = Math.max(7, (count / maxCount) * 30);
            
            // Marker styling adapted for bright Google Map tiles
            const marker = L.circleMarker(coords, {
                radius: radius,
                fillColor: '#e74c3c', // Red fill
                color: '#c0392b',     // Dark red border
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.6
            }).addTo(leafletMap);

            // Tooltip
            marker.bindTooltip(`
                <div style="text-align:center;">
                    <strong style="color: #667eea; text-transform: uppercase;">${code}</strong><br>
                    <b style="color: #f68c09;">${count}</b> kunjungan
                </div>
            `, {
                className: 'leaflet-custom-tooltip',
                direction: 'top'
            });
        }
    });
}

function showStatsLoading(show) {
    const el = document.getElementById('stats-loading');
    if (el) el.style.display = show ? 'block' : 'none';
}
