// ============================================================
// STATS.JS — Admin Statistics Dashboard (Highcharts Edition)
// ============================================================
import { fetchStats } from './api.js';

Highcharts.setOptions({
    chart: {
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' },
        animation: { duration: 700, easing: 'easeOutQuart' }
    },
    title:    { style: { display: 'none' } },
    subtitle: { style: { display: 'none' } },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    xAxis: {
        gridLineColor: 'rgba(0,0,0,0.04)',
        lineColor:     'rgba(0,0,0,0.08)',
        tickColor:     'transparent',
        labels: { style: { color: '#64748b', fontSize: '11px' } }
    },
    yAxis: {
        gridLineColor: 'rgba(0,0,0,0.04)',
        labels: { style: { color: '#64748b', fontSize: '11px' } },
        title: { text: null }
    },
    legend: {
        itemStyle:      { color: '#1e293b', fontWeight: '500', fontSize: '12px' },
        itemHoverStyle: { color: '#3b82f6' }
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor:     'rgba(0,0,0,0.1)',
        borderRadius:    12,
        style:           { color: '#1e293b', fontSize: '13px' },
        shadow: false,
        outside: true
    },
    plotOptions: {
        series: { animation: { duration: 700 } }
    },
    credits: { enabled: false },
    exporting: { enabled: false }
});

async function loadStats() {
    showStatsLoading(true);
    try {
        const data = await fetchStats();
        renderSummaryCards(data.summary);
        renderAreaChart(data.daily);
        renderBarChart('chart-top-pages', data.topPages.map(p => p.page), data.topPages.map(p => p.count), 'Kunjungan', '#f68c09');
        renderPieChart(data.devices);
        renderBarChart('chart-top-posts', data.topPosts.map(p => p.page), data.topPosts.map(p => p.count), 'Pembaca', '#667eea');
        renderReferrersChart(data.referrers);
        renderMapChart(data.countries);
    } catch (err) {
        console.error('Stats load error:', err);
        const errEl = document.getElementById('stats-error');
        if (errEl) errEl.style.display = 'block';
    } finally {
        showStatsLoading(false);
    }
}

function renderSummaryCards({ total, today, unique }) {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stats-total-views',    total.toLocaleString('id-ID'));
    el('stats-today-views',    today.toLocaleString('id-ID'));
    el('stats-unique-visitors', unique.toLocaleString('id-ID'));
}

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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 12,
            style: { color: '#1e293b' },
            headerFormat: '<span style="font-size:11px;color:#64748b">{point.key}</span><br>',
            pointFormat: '<b style="color:#3b82f6">{point.y}</b> kunjungan'
        }
    });
}

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
                style: { color: '#1e293b', fontSize: '12px' },
                formatter: function() {
                    return this.value.length > 20 ? this.value.substring(0, 20) + '…' : this.value;
                }
            }
        },
        yAxis: { allowDecimals: false, gridLineColor: 'rgba(255,255,255,0.06)' },
        plotOptions: {
            bar: {
                borderRadius: 6,
                dataLabels: { enabled: true, style: { color: '#1e293b', fontSize: '11px', textOutline: 'none' }, format: '{y}' }
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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 12,
            style: { color: '#1e293b' },
            pointFormat: `<b style="color:${color}">{point.y}</b> ${seriesName.toLowerCase()}`
        }
    });
}

function renderPieChart({ Desktop, Mobile, Tablet }) {
    const el = document.getElementById('chart-device');
    if (!el || typeof Highcharts === 'undefined') return;

    Highcharts.chart('chart-device', {
        chart: { type: 'pie' },
        plotOptions: {
            pie: {
                innerSize: '55%',
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '<b style="color:{point.color}">{point.name}</b>: {point.percentage:.1f}%',
                    style: { color: '#1e293b', fontSize: '12px', textOutline: 'none' }
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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 12,
            style: { color: '#1e293b' },
            pointFormat: '<b style="color:{point.color}">{point.y}</b> kunjungan ({point.percentage:.1f}%)'
        }
    });
}

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
            labels: { style: { color: '#1e293b', fontSize: '11px' } }
        },
        yAxis: { allowDecimals: false },
        plotOptions: {
            column: {
                borderRadius: 6,
                colorByPoint: true,
                dataLabels: { enabled: true, style: { color: '#1e293b', fontSize: '11px', textOutline: 'none' }, format: '{y}' }
            }
        },
        series: [{
            name: 'Kunjungan',
            data: referrers.map(r => r.count),
            showInLegend: false
        }],
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 12,
            style: { color: '#1e293b' },
            headerFormat: '<span style="color:#64748b;font-size:11px">{point.key}</span><br>',
            pointFormat: '<b style="color:#3b82f6">{point.y}</b> kunjungan'
        }
    });
}

let leafletMap = null;

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
        countries = [['id', 0]];
    }

    if (leafletMap) {
        leafletMap.remove();
    }

    leafletMap = L.map('chart-map', {
        center: [15, 65],
        zoom: 2,
        minZoom: 1,
        maxBounds: [[-90, -180], [90, 180]]
    });

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20
    }).addTo(leafletMap);

    const maxCount = Math.max(...countries.map(c => c[1]), 1);

    countries.forEach(([code, count]) => {
        const coords = countryCoords[code];
        if (coords) {
            const radius = Math.max(7, (count / maxCount) * 30);
            const marker = L.circleMarker(coords, {
                radius: radius,
                fillColor: '#e74c3c',
                color: '#c0392b',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.6
            }).addTo(leafletMap);

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

window.loadStats = loadStats;
