// Deklarasi variabel global untuk menyimpan data portfolio
let globalPortfolioData = null;

$(document).ready(function () {
    // --- UI Interactions ---
    // Toggle navigation menu
    $('#menu').click(function () {
        const expanded = $(this).attr('aria-expanded') === 'true';
        $(this).attr('aria-expanded', !expanded);
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');
        if (window.scrollY > 60) {
            $('#scroll-top').addClass('active');
        } else {
            $('#scroll-top').removeClass('active');
        }

        // Close nav on scroll
        $('#menu').attr('aria-expanded', 'false');
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        // Scroll spy
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');
            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // Smooth scrolling
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

    // EmailJS
    $("#contact-form").submit(function (event) {
        event.preventDefault();
        emailjs.init("user_TTDmetQLYgWCLzHTDgqxm");
        emailjs.sendForm('contact_service', 'template_contact', '#contact-form')
            .then(function (response) {
                document.getElementById("contact-form").reset();
                alert("Form Submitted Successfully");
            }, function (error) {
                alert("Form Submission Failed! Try Again");
            });
    });

    // Fetch dan render data dari JSON
    fetchDataAndRender();
});

// --- FETCH & RENDER LOGIC ---
async function fetchDataAndRender() {
    try {
        const response = await fetch("./assets/data/data.json");
        const data = await response.json();
        globalPortfolioData = data; // Simpan untuk PDF Generator

        // Simple Router based on Pathname
        if (window.location.pathname.includes('project.html')) {
            renderProjectDetail(data.projects);
        } else {
            renderSkills(data.skills);
            renderProjects(data.projects);
            renderExperience(data.experience);
            renderCertifications(data.certifications);
            renderGithubRepos(data.githubRepos || []);

            // Init animasi VanillaTilt & fitur View More setelah DOM diisi
            VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });
            initViewMoreLogic();
            initScrollReveal();
        }
    } catch (error) {
        console.error("Error loading portfolio data:", error);
    }
}

function renderSkills(skills) {
    // Warna accent per kategori
    const categoryColors = {
        'BACKEND':  { gradient: 'linear-gradient(135deg, #667eea, #764ba2)', light: 'rgba(102,126,234,0.08)', border: 'rgba(102,126,234,0.25)' },
        'FRONTEND': { gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', light: 'rgba(245,87,108,0.07)', border: 'rgba(245,87,108,0.2)' },
        'DATABASE': { gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', light: 'rgba(79,172,254,0.07)', border: 'rgba(79,172,254,0.2)' },
        'DEVOPS':   { gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', light: 'rgba(67,233,123,0.07)', border: 'rgba(67,233,123,0.2)' },
        'SECURITY': { gradient: 'linear-gradient(135deg, #fa709a, #fee140)', light: 'rgba(250,112,154,0.07)', border: 'rgba(250,112,154,0.2)' },
        'MOBILE':   { gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', light: 'rgba(161,140,209,0.07)', border: 'rgba(161,140,209,0.2)' },
        'TOOLS':    { gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', light: 'rgba(252,182,159,0.07)', border: 'rgba(252,182,159,0.2)' },
        'APPROACH': { gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', light: 'rgba(161,196,253,0.07)', border: 'rgba(161,196,253,0.2)' },
    };
    const VISIBLE_LIMIT = 5;

    let html = '';
    skills.forEach((cat, catIdx) => {
        const colors = categoryColors[cat.category] || { gradient: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)', light: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.1)' };
        const hasMore = cat.items.length > VISIBLE_LIMIT;
        const hiddenCount = cat.items.length - VISIBLE_LIMIT;

        let itemsHtml = '';
        cat.items.forEach((item, idx) => {
            let visual = '';
            if (item.img) {
                visual = `<img src="${item.img}" alt="${item.name}" class="skill-chip-img" loading="lazy">`;
            } else {
                let style = item.style ? ` style="${item.style}"` : '';
                visual = `<i class="${item.icon}" aria-hidden="true"${style}></i>`;
            }
            const isHidden = idx >= VISIBLE_LIMIT ? ' chip-hidden' : '';
            itemsHtml += `
            <span class="skill-chip${item.learning ? ' skill-chip-learning' : ''}${isHidden}" title="${item.name}">
                <span class="skill-chip-icon">${visual}</span>
                <span class="skill-chip-name">${item.name}</span>${item.learning ? '<span class="learning-badge">Learning</span>' : ''}
            </span>`;
        });

        const expandBtn = hasMore ? `
            <button class="chip-expand-btn" aria-expanded="false"
                onclick="toggleSkillCard(this)"
                data-hidden-count="${hiddenCount}">
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
                <span>+${hiddenCount} more</span>
            </button>` : '';

        html += `
        <div class="skill-card">
            <div class="skill-card-accent" style="background:${colors.gradient}"></div>
            <div class="skill-card-header">
                <div class="skill-card-icon" style="background:${colors.gradient}">
                    <i class="${cat.icon}" aria-hidden="true"></i>
                </div>
                <h3 class="skill-card-title">${cat.category}</h3>
                <span class="skill-card-count">${cat.items.length} skills</span>
            </div>
            <div class="skill-chips" style="--chip-border:${colors.border}; --chip-bg:${colors.light}">
                ${itemsHtml}
            </div>
            ${expandBtn}
        </div>`;
    });

    document.getElementById('skills-grid').innerHTML = html;
}

function toggleSkillCard(btn) {
    const card = btn.closest('.skill-card');
    const hiddenChips = card.querySelectorAll('.chip-hidden, .chip-visible-extra');
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    const hiddenCount = btn.dataset.hiddenCount;

    if (isExpanded) {
        hiddenChips.forEach(chip => {
            chip.classList.remove('chip-visible-extra');
            chip.classList.add('chip-hidden');
        });
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `<i class="fas fa-chevron-down" aria-hidden="true"></i><span>+${hiddenCount} more</span>`;
    } else {
        hiddenChips.forEach(chip => {
            chip.classList.remove('chip-hidden');
            chip.classList.add('chip-visible-extra');
        });
        btn.setAttribute('aria-expanded', 'true');
        btn.innerHTML = `<i class="fas fa-chevron-up" aria-hidden="true"></i><span>Show less</span>`;
    }
}


function renderProjects(projects) {
    let html = "";
    projects.forEach(proj => {
        let btnsHtml = "";
        if (proj.id) {
            btnsHtml += `<a href="project.html?id=${proj.id}" class="btn btn-detail"><i class="fas fa-info-circle" aria-hidden="true"></i> Details</a>`;
        }

        if (proj.viewLink) {
            btnsHtml += `<a href="${proj.viewLink}" class="btn" target="_blank" rel="noopener noreferrer"><i class="fas fa-eye" aria-hidden="true"></i> Visit</a>`;
        } else {
            let label = proj.status === 'Offline' ? '<i class="fas fa-laptop-house" aria-hidden="true"></i> Local Only' : '<i class="fas fa-eye-slash" aria-hidden="true"></i> No Demo';
            btnsHtml += `<span class="btn btn-disabled">${label}</span>`;
        }

        if (proj.codeLink) {
            btnsHtml += `<a href="${proj.codeLink}" class="btn" target="_blank" rel="noopener noreferrer">Code <i class="fas fa-code" aria-hidden="true"></i></a>`;
        } else {
            btnsHtml += `<span class="btn btn-disabled">Code <i class="fas fa-lock" aria-hidden="true"></i></span>`;
        }

        // Tech stack tags
        let techHtml = "";
        if (proj.tech && proj.tech.length) {
            techHtml = `<div class="tech-stack">${proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join("")}</div>`;
        }

        // Meta: year + type
        let metaHtml = "";
        if (proj.year || proj.type) {
            let yearPart = proj.year ? `<span><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${proj.year}</span>` : "";
            let typePart = proj.type ? `<span><i class="fas fa-tag" aria-hidden="true"></i> ${proj.type}</span>` : "";
            metaHtml = `<div class="project-meta">${yearPart}${typePart}</div>`;
        }

        html += `
        <div class="box tilt" role="listitem">
            <div class="image-wrapper">
                <img draggable="false" src="${proj.image}" alt="${proj.title} — project screenshot" loading="lazy" />
                <button class="zoom-btn" onclick="openModal('${proj.image}', '${proj.title}')" aria-label="Preview ${proj.title} image"><i class="fas fa-search-plus" aria-hidden="true"></i></button>
            </div>
            <div class="content">
                <div class="title-wrap">
                    <h3>${proj.title}</h3>
                    <span class="status-badge ${proj.statusClass}">${proj.status}</span>
                </div>
                <div class="desc">
                    <p>${proj.desc}</p>
                </div>
                ${techHtml}
                ${metaHtml}
                <div class="btns">${btnsHtml}</div>
            </div>
        </div>`;
    });
    document.getElementById("projects-container").innerHTML = html;
}

function renderExperience(experiences) {
    let html = "";
    experiences.forEach(exp => {
        let tasksHtml = exp.tasks.map(task => `<li><i class="fas fa-check-circle" aria-hidden="true"></i> ${task}</li>`).join("");

        // Tech badges
        let techHtml = "";
        if (exp.tech && exp.tech.length) {
            techHtml = `<div class="exp-tech">${exp.tech.map(t => `<span class="tech-badge">${t}</span>`).join("")}</div>`;
        }

        // Meta: location + employment type
        let metaHtml = "";
        if (exp.location || exp.employmentType) {
            let locPart = exp.location ? `<span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${exp.location}</span>` : "";
            let typePart = exp.employmentType ? `<span><i class="fas fa-briefcase" aria-hidden="true"></i> ${exp.employmentType}</span>` : "";
            metaHtml = `<div class="exp-meta">${locPart}${typePart}</div>`;
        }

        html += `
        <div class="container ${exp.align}" role="listitem">
            <div class="content">
                <div class="tag"><h2>${exp.company}</h2></div>
                <div class="desc">
                    <h3>${exp.role}</h3>
                    <ul>${tasksHtml}</ul>
                    ${techHtml}
                    ${metaHtml}
                    <p class="exp-period"><i class="fas fa-calendar" aria-hidden="true"></i> ${exp.period}</p>
                </div>
            </div>
        </div>`;
    });
    document.getElementById("experience-container").innerHTML = html;
}

function renderGithubRepos(repos) {
    const container = document.getElementById("repos-container");
    if (!container) return;
    if (!repos || repos.length === 0) {
        container.closest('section').style.display = 'none';
        return;
    }

    const langColors = {
        'JavaScript': '#f1e05a',
        'PHP': '#4F5D95',
        'Blade': '#f7523f',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Go': '#00ADD8'
    };

    let html = repos.map(repo => {
        const color = repo.languageColor || langColors[repo.language] || '#8b949e';
        const langDot = repo.language ? `<span class="lang-dot" style="background:${color}" aria-hidden="true"></span><span>${repo.language}</span>` : '';
        const stars = `<span><i class="fas fa-star" aria-hidden="true"></i> ${repo.stars}</span>`;
        const forks = `<span><i class="fas fa-code-branch" aria-hidden="true"></i> ${repo.forks}</span>`;
        return `
        <article class="repo-card" role="listitem">
            <div class="repo-header">
                <i class="fas fa-book-open" aria-hidden="true"></i>
                <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="repo-name">${repo.name}</a>
                <span class="repo-visibility">Public</span>
            </div>
            <p class="repo-desc">${repo.description}</p>
            <div class="repo-footer">
                <div class="repo-lang">${langDot}</div>
                <div class="repo-stats">${stars}${forks}</div>
            </div>
        </article>`;
    }).join("");
    container.innerHTML = html;
}

function renderCertifications(certs) {
    let html = "";
    certs.forEach(cert => {
        let credHtml = cert.id ? `<p class="credential-id">ID: ${cert.id}</p>` : "";
        html += `
        <div class="box">
            <i class="fas fa-certificate icon"></i>
            <div class="content">
                <h3>${cert.name}</h3>
                <p class="issuer">${cert.issuer}</p>
                <p class="date">${cert.date}</p>
                ${credHtml}
            </div>
        </div>`;
    });
    document.getElementById("certifications-container").innerHTML = html;
}

// --- VIEW MORE LOGIC ---
function initViewMoreLogic() {
    const itemsToShow = 6; 
    
    // Projects
    const projectItems = $('.work .box-container .box');
    const viewMoreProjectsBtn = $('#viewMoreProjects');
    if (projectItems.length > itemsToShow) {
        projectItems.slice(itemsToShow).addClass('hidden-item');
    } else {
        viewMoreProjectsBtn.parent().hide();
    }

    viewMoreProjectsBtn.off('click').on('click', function(){
        const hiddenProjects = $('.work .box-container .box.hidden-item');
        if(hiddenProjects.length > 0) {
            hiddenProjects.removeClass('hidden-item');
            hiddenProjects.attr('style', ''); // Clear ScrollReveal inline hidden styles
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
            if (typeof ScrollReveal !== 'undefined') {
                ScrollReveal().reveal('.work .box', { interval: 100 });
            }
        } else {
            projectItems.slice(itemsToShow).addClass('hidden-item');
            $(this).html('<span>View More</span> <i class="fas fa-chevron-down"></i>');
            $('html, body').animate({ scrollTop: $("#work").offset().top - 80 }, 500);
        }
    });

    // Certifications
    const certItems = $('.certifications .box-container .box');
    const viewMoreCertsBtn = $('#viewMoreCerts');
    if (certItems.length > itemsToShow) {
        certItems.slice(itemsToShow).addClass('hidden-item');
    } else {
        viewMoreCertsBtn.parent().hide();
    }

    viewMoreCertsBtn.off('click').on('click', function(){
        const hiddenCerts = $('.certifications .box-container .box.hidden-item');
        if(hiddenCerts.length > 0) {
            hiddenCerts.removeClass('hidden-item');
            hiddenCerts.attr('style', ''); // Clear ScrollReveal inline hidden styles
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
            if (typeof ScrollReveal !== 'undefined') {
                ScrollReveal().reveal('.certifications .box', { interval: 100 });
            }
        } else {
            certItems.slice(itemsToShow).addClass('hidden-item');
            $(this).html('<span>View More</span> <i class="fas fa-chevron-down"></i>');
            $('html, body').animate({ scrollTop: $("#certifications").offset().top - 80 }, 500);
        }
    });
}

// --- MODAL, TYPED JS, & MISC ---
function openModal(imgSrc) {
    document.getElementById('imageModal').style.display = "block";
    document.getElementById('modalImg').src = imgSrc;
}
function closeModal() {
    document.getElementById('imageModal').style.display = "none";
}
window.onclick = function(event) {
    if (event.target == document.getElementById('imageModal')) closeModal();
}

document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === "visible") {
        document.title = "Portfolio | Lutfi Ihsan — Full Stack Developer & SysAdmin";
        $("#favicon").attr("href", "assets/images/favicon.png");
    } else {
        document.title = "Come Back To Portfolio 🚀";
        $("#favicon").attr("href", "assets/images/favhand.png");
    }
});

var typed = new Typed(".typing-text", {
    strings: ["frontend development", "backend development", "web development", "fullstack developer", "data science"],
    loop: true, typeSpeed: 50, backSpeed: 25, backDelay: 500,
});

// --- PDF GENERATOR (DYNAMIC) ---
function generateResume() {
    if(!globalPortfolioData) {
        alert("Data is still loading, please wait a moment.");
        return;
    }

    const btnSpan = document.querySelector('.resumebtn .btn span');
    const originalText = btnSpan.innerText;
    btnSpan.innerText = "Generating PDF...";

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pageW = 210, pageH = 297, marginL = 15, contentW = pageW - marginL - 15;
        let y = 0;

        const COLOR_PRIMARY = [41, 182, 246], COLOR_DARK = [30, 30, 47], COLOR_GRAY = [100, 100, 120], COLOR_LIGHTGRAY = [230, 230, 240], COLOR_WHITE = [255, 255, 255];

        function checkPage(needed = 10) {
            if (y + needed > pageH - 15) { doc.addPage(); y = 15; }
        }

        function drawSectionHeader(title) {
            checkPage(14); y += 4;
            doc.setFillColor(...COLOR_PRIMARY); doc.rect(marginL, y, contentW, 8, 'F');
            doc.setTextColor(...COLOR_WHITE); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
            doc.text(title.toUpperCase(), marginL + 3, y + 5.5);
            doc.setTextColor(...COLOR_DARK); y += 11;
        }

        // Header
        doc.setFillColor(...COLOR_DARK); doc.rect(0, 0, pageW, 42, 'F');
        doc.setTextColor(...COLOR_WHITE); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
        doc.text('LUTFI IHSAN', pageW / 2, 16, { align: 'center' });
        doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLOR_PRIMARY);
        doc.text('Full Stack Developer & SysAdmin', pageW / 2, 24, { align: 'center' });
        doc.setTextColor(200, 200, 220); doc.setFontSize(8.5);
        doc.text('lutfiihsan.web.id  |  +62 812-2626-0649  |  lutficreativesys@gmail.com  |  Bogor, Indonesia', pageW / 2, 32, { align: 'center' });
        y = 50;

        // Skills (Dynamic)
        drawSectionHeader('Skills & Abilities');
        globalPortfolioData.skills.forEach(cat => {
            checkPage(10);
            doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_DARK);
            doc.text(cat.category + ':', marginL, y);
            doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLOR_GRAY);
            
            let itemNames = cat.items.map(i => i.name).join('  ·  ');
            const tagLines = doc.splitTextToSize(itemNames, contentW - 30);
            doc.text(tagLines, marginL + 30, y);
            y += Math.max(tagLines.length * 4.5, 5) + 2;
        });
        y += 2;

        // Experience (Dynamic)
        drawSectionHeader('Work Experience');
        globalPortfolioData.experience.forEach(exp => {
            checkPage(20);
            doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_DARK); doc.text(exp.company, marginL, y);
            doc.setFontSize(8.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...COLOR_PRIMARY); doc.text(exp.period, marginL + contentW, y, { align: 'right' });
            y += 5;
            doc.setFontSize(9); doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(...COLOR_GRAY); doc.text(exp.role, marginL, y);
            y += 5;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
            exp.tasks.forEach(task => {
                checkPage(8);
                const lines = doc.splitTextToSize('• ' + task, contentW - 5);
                doc.text(lines, marginL + 3, y);
                y += lines.length * 4.2 + 1;
            });
            y += 3; doc.setDrawColor(...COLOR_LIGHTGRAY); doc.line(marginL, y, marginL + contentW, y); y += 3;
        });

        // Certifications (Dynamic)
        drawSectionHeader('Licenses & Certifications');
        globalPortfolioData.certifications.forEach((cert, i) => {
            checkPage(8);
            if (i % 2 === 0) { doc.setFillColor(245, 247, 252); doc.rect(marginL, y - 3.5, contentW, 7, 'F'); }
            doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_DARK);
            const nameLines = doc.splitTextToSize(cert.name, contentW - 40);
            doc.text(nameLines, marginL + 2, y);
            doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLOR_GRAY); doc.setFontSize(8);
            doc.text(cert.issuer, marginL + contentW - 38, y);
            doc.setTextColor(...COLOR_PRIMARY); doc.text(cert.date, marginL + contentW, y, { align: 'right' });
            y += nameLines.length > 1 ? nameLines.length * 4.5 : 7;
        });

        // Footer Pagination
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(180, 180, 200); doc.setFont('helvetica', 'italic');
            doc.text(`Resume - Lutfi Ihsan  |  Page ${i} of ${totalPages}`, pageW / 2, pageH - 7, { align: 'center' });
        }

        doc.save('Resume_Lutfi_Ihsan.pdf');
        btnSpan.innerText = originalText;
    } catch (err) {
        console.error('Error generating PDF:', err);
        alert('Gagal membuat PDF: ' + err.message);
        btnSpan.innerText = 'Download Resume';
    }
}

// ==========================================
// EFEK MATRIX DIGITAL RAIN (HACKER VIBE)
// ==========================================
function initMatrixAnimation() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Menyesuaikan ukuran canvas dengan tinggi layar/section
    canvas.width = window.innerWidth;
    canvas.height = document.getElementById('home').offsetHeight;

    // Karakter yang akan berjatuhan (Gabungan Katakana, Latin, dan Angka)
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops = [];
    // Set posisi awal (Y) untuk tiap kolom
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function draw() {
        // Jejak transparan dengan warna dasar Navy agar blending-nya mulus
        ctx.fillStyle = 'rgba(2, 9, 75, 0.1)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            
            // Warna font: Cyan (Biru Neon) khas tema cyber/backend
            ctx.fillStyle = '#00b8ff'; 
            
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // Jalankan animasi (kecepatan jatuhnya kode)
    setInterval(draw, 33);

    // Pastikan ukuran tetap pas saat layar di-resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = document.getElementById('home').offsetHeight;
    });
}

// Panggil fungsinya (Misal diletakkan di dalam fetchDataAndRender atau saat window load)
window.addEventListener('load', initMatrixAnimation);

function initScrollReveal() {
    const srtop = ScrollReveal({ origin: 'top', distance: '80px', duration: 1000, reset: true });
    srtop.reveal('.home .content h3, .home .content p, .home .content .btn', { delay: 200 });
    srtop.reveal('.home .image', { delay: 400 });
    srtop.reveal('.about .content h3, .about .content .tag, .about .content p, .about .content .box-container, .about .content .resumebtn', { delay: 200 });
    srtop.reveal('.skills .container', { interval: 200 });
    srtop.reveal('.education .box', { interval: 200 });
    srtop.reveal('.work .box', { interval: 200 });
    srtop.reveal('.experience .timeline', { delay: 400 });
    srtop.reveal('.experience .timeline .container', { interval: 400 });
    srtop.reveal('.contact .container', { delay: 400 });
}

// --- RENDER PROJECT DETAIL (project.html) ---
function renderProjectDetail(projects) {
    const urlParams = new URLSearchParams(window.location.search);
    const projId = urlParams.get('id');
    const project = projects.find(p => p.id === projId);

    const container = document.getElementById('project-detail-container');
    if (!container) return;

    if (!project) {
        container.innerHTML = `
            <div style="text-align:center; padding: 10rem 2rem;">
                <h2 class="heading">Project <span style="color:red;">Not Found</span></h2>
                <p style="font-size: 1.5rem; margin-bottom: 2rem;">Sorry, we couldn't find the requested project.</p>
                <a href="index.html#work" class="btn">Go Back to Projects</a>
            </div>`;
        return;
    }

    let btnsHtml = "";
    if (project.viewLink && project.viewLink !== "#") {
        btnsHtml += `<a href="${project.viewLink}" class="btn" target="_blank" rel="noopener noreferrer"><i class="fas fa-eye" aria-hidden="true"></i> Live Preview</a>`;
    }
    if (project.codeLink && project.codeLink !== "#") {
        btnsHtml += `<a href="${project.codeLink}" class="btn btn-outline" target="_blank" rel="noopener noreferrer" style="margin-left: 1.5rem;"><i class="fas fa-code" aria-hidden="true"></i> Source Code</a>`;
    }

    let techHtml = "";
    if (project.tech && project.tech.length) {
        techHtml = `<div class="tech-stack detail-tech-stack">${project.tech.map(t => `<span class="tech-tag" style="font-size: 1.3rem; padding: 0.6rem 1.8rem; margin: 0.5rem;">${t}</span>`).join("")}</div>`;
    }

    const html = `
        <div class="project-detail-wrapper">
            <div class="split left-split tilt" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-perspective="1000">
                <img src="${project.image}" alt="${project.title} Cover" class="detail-img">
            </div>
            <div class="split right-split">
                <h1 class="detail-title">${project.title}</h1>
                
                <div class="detail-badges">
                    <span class="status-badge ${project.statusClass}">${project.status}</span>
                    <span class="meta-badge"><i class="fas fa-calendar-alt"></i> ${project.year || 'Unknown Year'}</span>
                    <span class="meta-badge"><i class="fas fa-tag"></i> ${project.type || 'Project'}</span>
                </div>
                
                <div class="detail-section">
                    <h3>About This Project</h3>
                    <p class="detail-desc">${project.desc}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Technologies Used</h3>
                    ${techHtml}
                </div>
                
                <div class="detail-actions">
                    ${btnsHtml}
                    <div style="margin-top: 3rem;">
                        <a href="index.html#work" class="back-link"><i class="fas fa-arrow-left"></i> Back to Portfolio</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    
    document.title = `${project.title} | Project Detail`;

    // Re-init vanilla tilt explicitly
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 5, speed: 400 });
    }
}

// --- DARK MODE TOGGLE ---
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    const bodyEl = document.body;
    const icon = themeBtn.querySelector('i');

    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        bodyEl.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeBtn.addEventListener('click', () => {
        bodyEl.classList.toggle('dark-mode');
        if (bodyEl.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
});