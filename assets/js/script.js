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
        $('#nav-overlay').toggleClass('active');
    });

    // Close menu when clicking overlay
    $('#nav-overlay').click(function() {
        $('#menu').attr('aria-expanded', 'false');
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');
        $(this).removeClass('active');
    });

    // Close menu when clicking nav link
    $('.navbar ul li a').click(function() {
        $('#menu').attr('aria-expanded', 'false');
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');
        $('#nav-overlay').removeClass('active');
    });

    $(window).on('scroll load', function () {
        if (window.scrollY > 60) {
            $('#scroll-top').addClass('active');
        } else {
            $('#scroll-top').removeClass('active');
        }

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

    // Smart Smooth Scrolling
    $('a[href*="#"]').on('click', function (e) {
        const href = $(this).attr('href');
        const hash = href.substring(href.indexOf('#'));
        const path = href.split('#')[0]; // Get path before #

        // Check if we are already on the target page (or it's just a hash)
        // matches '', 'index', or full path
        const isSamePage = path === '' || 
                           window.location.pathname.endsWith('/' + path) || 
                           (path === 'index' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index')));

        if (isSamePage) {
            const target = $(hash);
            if (target.length) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top,
                }, 500, 'linear');
                
                // Close mobile menu if open
                $('#menu').removeClass('fa-times');
                $('.navbar').removeClass('nav-toggle');
                $('#nav-overlay').removeClass('active');
            }
        }
        // else: let default browser navigation handle it
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
        // Router: matches both '/project'
        const isProjectPage = window.location.pathname.endsWith('/project');
        
        if (isProjectPage) {
            renderProjectDetail(data.projects);
            initContactCopy();
        } else {
            renderSkills(data.skills);
            renderProjects(data.projects);
            renderExperience(data.experience);
            renderCertifications(data.certifications);
            renderGithubRepos(data.githubRepos || []);
            if (data.awards && data.awards.length) renderAwards(data.awards);

            // Init animasi VanillaTilt & fitur View More setelah DOM diisi
            VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });
            initViewMoreLogic();
            initScrollReveal();
            initContactCopy();
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
        'TOOLS':    { gradient: 'linear-gradient(135deg, #6dd5ed, #2193b0)', light: 'rgba(109,213,237,0.07)', border: 'rgba(109,213,237,0.2)' },
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

    const container = document.getElementById('skills-grid');
    if (!container) return;
    container.innerHTML = html;
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
window.toggleSkillCard = toggleSkillCard;


function renderProjects(projects) {
    let html = "";
    projects.forEach((proj, pIdx) => {
        let btnsHtml = "";
        if (proj.id) {
            btnsHtml += `<a href="project" onclick="sessionStorage.setItem('activeProjectId', '${proj.id}')" class="btn btn-detail"><i class="fas fa-info-circle" aria-hidden="true"></i> Details</a>`;
        }

        if (proj.viewLink) {
            btnsHtml += `<a href="${proj.viewLink}" class="btn" target="_blank" rel="noopener noreferrer"><i class="fas fa-eye" aria-hidden="true"></i> Visit</a>`;
        } else {
            let label = proj.status === 'Offline' ? '<i class="fas fa-laptop-house" aria-hidden="true"></i> Local Only' : '<i class="fas fa-eye-slash" aria-hidden="true"></i> No Demo';
            btnsHtml += `<span class="btn btn-disabled">${label}</span>`;
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

        // Carousel support
        let carouselHtml = "";
        let hasImages = proj.images && proj.images.length > 1;
        if (hasImages) {
            carouselHtml = `
            <button class="carousel-btn prev" onclick="changeProjectImage(${pIdx}, -1, event)" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
            <button class="carousel-btn next" onclick="changeProjectImage(${pIdx}, 1, event)" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
            <div class="carousel-dots">
                ${proj.images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="changeProjectImage(${pIdx}, ${i}, event, true)"></span>`).join("")}
            </div>`;
        }

        html += `
        <div class="box tilt" role="listitem" id="project-${pIdx}" data-images='${JSON.stringify(proj.images || [proj.image])}' data-current="0">
            <div class="image-wrapper">
                <img draggable="false" src="${proj.image}" alt="${proj.title} — project screenshot" loading="lazy" class="project-img" />
                ${carouselHtml}
                <button class="zoom-btn" onclick="openModalFromProject(${pIdx}, event)" aria-label="Preview ${proj.title} image"><i class="fas fa-search-plus" aria-hidden="true"></i></button>
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
    const container = document.getElementById("projects-container");
    if (!container) return;
    container.innerHTML = html;
}

function changeProjectImage(projIdx, directionOrIndex, event, isSpecific = false) {
    if (event) event.stopPropagation();
    const box = document.getElementById(`project-${projIdx}`);
    if (!box) return;
    const images = JSON.parse(box.dataset.images);
    let current = parseInt(box.dataset.current);

    if (isSpecific) {
        current = directionOrIndex;
    } else {
        current = (current + directionOrIndex + images.length) % images.length;
    }

    box.dataset.current = current;
    
    // Update Image
    const img = box.querySelector('.project-img');
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = images[current];
        img.style.opacity = '1';
    }, 200);

    // Update Dots
    const dots = box.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
    });
}
// Expose to window for onclick in module
window.changeProjectImage = changeProjectImage;

function openModalFromProject(projIdx, event) {
    if (event) event.stopPropagation();
    const box = document.getElementById(`project-${projIdx}`);
    const images = JSON.parse(box.dataset.images);
    const current = parseInt(box.dataset.current);
    const title = box.querySelector('h3').innerText;
    openModal(images[current], title);
}
// Expose to window for onclick in module
window.openModalFromProject = openModalFromProject;

function changeDetailImage(directionOrIndex, event, isSpecific = false) {
    if (event) event.stopPropagation();
    const box = document.getElementById('detail-carousel');
    if (!box) return;
    const images = JSON.parse(box.dataset.images);
    let current = parseInt(box.dataset.current);

    if (isSpecific) {
        current = directionOrIndex;
    } else {
        current = (current + directionOrIndex + images.length) % images.length;
    }

    box.dataset.current = current;
    
    // Update Image
    const img = box.querySelector('.project-img');
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = images[current];
        img.style.opacity = '1';
    }, 200);

    // Update Dots
    const dots = box.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
    });
}
window.changeDetailImage = changeDetailImage;





function renderExperience(experiences) {
    let html = "";
    experiences.forEach((exp, index) => {
        // Tech badges
        let techHtml = "";
        if (exp.tech && exp.tech.length) {
            techHtml = `<div class="exp-tech" style="margin-top: 1.5rem;">${exp.tech.map(t => `<span class="tech-badge">${t}</span>`).join("")}</div>`;
        }

        // Meta: location + employment type
        let metaHtml = "";
        if (exp.location || exp.employmentType) {
            let locPart = exp.location ? `<span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${exp.location}</span>` : "";
            let typePart = exp.employmentType ? `<span><i class="fas fa-briefcase" aria-hidden="true"></i> ${exp.employmentType}</span>` : "";
            metaHtml = `<div class="exp-meta" style="margin-bottom: 15px;">${locPart}${typePart}</div>`;
        }

        let companyHtml = `<div class="tag"><h2>${exp.company}</h2></div>`;

        if (exp.isGrouped && exp.roles) {
            let rolesHtml = exp.roles.map((role, rIndex) => {
                let tasksHtml = role.tasks.map(task => `<li><i class="fas fa-check-circle" aria-hidden="true"></i> ${task}</li>`).join("");
                let isOpen = rIndex === 0 ? "open" : "";
                return `
                <details class="tiered-role" ${isOpen}>
                    <summary class="role-summary">
                        <div class="summary-info">
                            <span class="role-title">${role.title}</span>
                            <span class="role-badge">${role.period}</span>
                        </div>
                        <i class="fas fa-chevron-down toggle-icon" aria-hidden="true"></i>
                    </summary>
                    <div class="role-body">
                        <ul>${tasksHtml}</ul>
                    </div>
                </details>`;
            }).join("");

            html += `
            <div class="container ${exp.align}" role="listitem">
                <div class="content">
                    ${companyHtml}
                    <div class="desc tiered-desc">
                        <p class="total-period"><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${exp.period}</p>
                        ${metaHtml}
                        <div class="tiered-timeline-container">
                            ${rolesHtml}
                        </div>
                        ${techHtml}
                    </div>
                </div>
            </div>`;
        } else {
            // Standard single role experience
            let tasksHtml = exp.tasks.map(task => `<li><i class="fas fa-check-circle" aria-hidden="true"></i> ${task}</li>`).join("");
            html += `
            <div class="container ${exp.align}" role="listitem">
                <div class="content">
                    ${companyHtml}
                    <div class="desc">
                        <h3>${exp.role}</h3>
                        <p class="exp-period" style="margin-bottom: 12px; opacity: 0.8;"><i class="fas fa-calendar" aria-hidden="true"></i> ${exp.period}</p>
                        ${metaHtml}
                        <ul style="margin-top: 10px;">${tasksHtml}</ul>
                        ${techHtml}
                    </div>
                </div>
            </div>`;
        }
    });
    const container = document.getElementById("experience-container");
    if (!container) return;
    container.innerHTML = html;
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
    const container = document.getElementById("certifications-container");
    if (!container) return;
    container.innerHTML = html;
}

// --- AWARDS / HONORS ---
function renderAwards(awards) {
    const container = document.getElementById('awards-container');
    if (!container) return;

    let html = awards.map(award => {
        return `
        <article class="award-card" role="listitem" style="--award-color: ${award.color || '#f68c09'}">
            <div class="award-icon-wrap">
                <i class="${award.icon} award-icon" aria-hidden="true"></i>
            </div>
            <div class="award-content">
                <div class="award-meta">
                    <span class="award-issuer"><i class="fas fa-building" aria-hidden="true"></i> ${award.issuer}</span>
                    <span class="award-date"><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${award.date}</span>
                </div>
                <h3 class="award-title">${award.title}</h3>
                <p class="award-desc">${award.description}</p>
            </div>
        </article>`;
    }).join('');

    container.innerHTML = html;
}

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
            // Add .revealed class to force opacity 1 and bypass ScrollReveal
            hiddenProjects.addClass('revealed').removeClass('hidden-item').hide().fadeIn(600);
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
        } else {
            projectItems.slice(itemsToShow).removeClass('revealed').addClass('hidden-item');
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
            hiddenCerts.addClass('revealed').removeClass('hidden-item').hide().fadeIn(600);
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
        } else {
            certItems.slice(itemsToShow).removeClass('revealed').addClass('hidden-item');
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
window.openModal = openModal;
window.closeModal = closeModal;
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

// --- PDF OVERLAY HELPERS ---
function showPdfOverlay() {
    const overlay = document.getElementById('pdf-overlay');
    if (!overlay) return;
    // Reset progress bar animation
    const fill = overlay.querySelector('.pdf-progress-fill');
    if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function hidePdfOverlay() {
    const overlay = document.getElementById('pdf-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// --- PDF GENERATOR (DYNAMIC) ---
function generateResume() {
    if (!globalPortfolioData) {
        alert("Data is still loading, please wait a moment and try again.");
        return;
    }

    // Check if jsPDF is available — retry up to 5x if loaded slowly
    if (typeof window.jspdf === 'undefined') {
        let attempts = 0;
        const retryInterval = setInterval(() => {
            attempts++;
            if (typeof window.jspdf !== 'undefined') {
                clearInterval(retryInterval);
                _doGeneratePdf();
            } else if (attempts >= 5) {
                clearInterval(retryInterval);
                alert('PDF library could not be loaded. Please refresh the page and try again.');
            }
        }, 600);
        // Show overlay while waiting
        showPdfOverlay();
        return;
    }

    _doGeneratePdf();
}
window.generateResume = generateResume;

function _doGeneratePdf() {
    const btn = document.querySelector('.resumebtn .btn');
    const btnSpan = btn ? btn.querySelector('span') : null;
    const btnIcon = btn ? btn.querySelector('i') : null;
    const originalSpanText = btnSpan ? btnSpan.innerText : 'Download Resume';

    // Show overlay + disable button
    showPdfOverlay();
    if (btn) btn.disabled = true;
    if (btnSpan) btnSpan.innerText = 'Generating…';
    if (btnIcon) { btnIcon.classList.remove('fa-download'); btnIcon.classList.add('fa-spinner', 'fa-spin'); }

    // Use setTimeout to let overlay render before blocking JS work
    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            const pageW = 210, pageH = 297, marginL = 15, contentW = pageW - marginL - 15;
            let y = 0;

            const COLOR_PRIMARY   = [0, 102, 255]; // Vibrant Blue
            const COLOR_DARK      = [2, 9, 75];    // Navy
            const COLOR_GRAY      = [100, 100, 120];
            const COLOR_LIGHTGRAY = [230, 230, 240];
            const COLOR_WHITE     = [255, 255, 255];
            const COLOR_BLUE_ACCENT = [0, 102, 255]; 

            function checkPage(needed = 10) {
                if (y + needed > pageH - 15) { doc.addPage(); y = 15; }
            }

            function drawSectionHeader(title) {
                checkPage(14); y += 4;
                doc.setFillColor(...COLOR_DARK); doc.rect(marginL, y, contentW, 8, 'F');
                doc.setFillColor(...COLOR_BLUE_ACCENT); doc.rect(marginL, y, 3, 8, 'F'); // accent bar
                doc.setTextColor(...COLOR_WHITE); doc.setFontSize(10.5); doc.setFont('helvetica', 'bold');
                doc.text(title.toUpperCase(), marginL + 6, y + 5.5);
                doc.setTextColor(...COLOR_DARK); y += 12;
            }

            // ── HEADER BLOCK ──
            doc.setFillColor(...COLOR_DARK); doc.rect(0, 0, pageW, 44, 'F');
            // Accent strip
            doc.setFillColor(...COLOR_BLUE_ACCENT); doc.rect(0, 40, pageW, 4, 'F');
            doc.setTextColor(...COLOR_WHITE); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
            doc.text('LUTFI IHSAN', pageW / 2, 15, { align: 'center' });
            doc.setFontSize(11); doc.setFont('helvetica', 'normal');
            doc.setTextColor(41, 182, 246); // cyan accent
            doc.text('Full Stack Developer & SysAdmin', pageW / 2, 23, { align: 'center' });
            doc.setTextColor(190, 195, 220); doc.setFontSize(8.5);
            doc.text('lutfiihsan.github.io  ·  +62 812-2626-0649  ·  lutficreativesys@gmail.com  ·  Bogor, Indonesia', pageW / 2, 32, { align: 'center' });
            y = 52;

            // ── SKILLS (Dynamic) ──
            drawSectionHeader('Skills & Abilities');
            globalPortfolioData.skills.forEach(cat => {
                checkPage(10);
                doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_DARK);
                doc.text(cat.category + ':', marginL, y);
                doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLOR_GRAY);
                const itemNames = cat.items.map(i => i.name).join('  ·  ');
                const tagLines = doc.splitTextToSize(itemNames, contentW - 32);
                doc.text(tagLines, marginL + 32, y);
                y += Math.max(tagLines.length * 4.5, 5.5) + 1.5;
            });
            y += 2;

            // ── WORK EXPERIENCE (Support Tiered Roles) ──
            drawSectionHeader('Work Experience');
            globalPortfolioData.experience.forEach((exp, idx) => {
                checkPage(25);
                if (idx > 0) { doc.setDrawColor(...COLOR_LIGHTGRAY); doc.line(marginL, y - 2, marginL + contentW, y - 2); y += 4; }
                
                // Company Name
                doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_DARK);
                doc.text(exp.company, marginL, y);
                
                // Total Duration (Optional check)
                if (exp.period && !exp.isGrouped) {
                    doc.setFontSize(8.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...COLOR_BLUE_ACCENT);
                    doc.text(exp.period, marginL + contentW, y, { align: 'right' });
                } else if (exp.period) {
                    doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(...COLOR_GRAY);
                    doc.text(exp.period, marginL + contentW, y, { align: 'right' });
                }
                y += 5.5;

                if (exp.isGrouped && exp.roles) {
                    // Render multiple roles under one company
                    exp.roles.forEach((subRole, roleIdx) => {
                        checkPage(15);
                        // Role Title
                        doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(24, 60, 108); // Deep Blueish
                        doc.text(subRole.title, marginL + 3, y);
                        
                        // SubRole Period
                        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_BLUE_ACCENT);
                        doc.text(subRole.period, marginL + contentW, y, { align: 'right' });
                        y += 4.5;
                        
                        // SubRole Tasks
                        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...COLOR_GRAY);
                        subRole.tasks.forEach(task => {
                            checkPage(8);
                            const lines = doc.splitTextToSize('• ' + task, contentW - 8);
                            doc.text(lines, marginL + 6, y);
                            y += lines.length * 4.2 + 1;
                        });
                        y += 2; // small gap between roles
                    });
                } else {
                    // Traditional flat structure
                    doc.setFontSize(9.5); doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(...COLOR_GRAY);
                    doc.text(exp.role || '', marginL + 3, y); y += 5;
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...COLOR_GRAY);
                    (exp.tasks || []).forEach(task => {
                        checkPage(8);
                        const lines = doc.splitTextToSize('• ' + task, contentW - 8);
                        doc.text(lines, marginL + 6, y);
                        y += lines.length * 4.2 + 1;
                    });
                }
                y += 3;
            });

            // ── PERSONAL PROJECTS (New Section) ──
            drawSectionHeader('Key Projects');
            // Show top 5 projects
            globalPortfolioData.projects.slice(0, 5).forEach((proj, idx) => {
                checkPage(18);
                doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_DARK);
                doc.text(proj.title, marginL, y);
                
                doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(...COLOR_BLUE_ACCENT);
                doc.text(proj.year || '', marginL + contentW, y, { align: 'right' });
                y += 4.5;
                
                doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLOR_GRAY);
                const descLines = doc.splitTextToSize(proj.desc, contentW);
                doc.text(descLines, marginL, y);
                y += descLines.length * 4.2 + 1.5;
                
                // Stack
                doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(70, 70, 70);
                doc.text('Stack: ' + proj.tech.join(', '), marginL, y);
                y += 6;
            });

            // ── CERTIFICATIONS (Dynamic) ──
            drawSectionHeader('Licenses & Certifications');
            globalPortfolioData.certifications.forEach((cert, i) => {
                checkPage(8);
                if (i % 2 === 0) { doc.setFillColor(246, 248, 252); doc.rect(marginL, y - 3.5, contentW, 7.5, 'F'); }
                doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLOR_DARK);
                const nameLines = doc.splitTextToSize(cert.name, contentW - 42);
                doc.text(nameLines, marginL + 2, y);
                doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLOR_GRAY); doc.setFontSize(8);
                doc.text(cert.issuer, marginL + contentW - 40, y);
                doc.setTextColor(...COLOR_BLUE_ACCENT);
                doc.text(cert.date, marginL + contentW, y, { align: 'right' });
                y += nameLines.length > 1 ? nameLines.length * 4.5 : 7.5;
            });

            // ── FOOTER PAGINATION ──
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFillColor(...COLOR_DARK); doc.rect(0, pageH - 12, pageW, 12, 'F');
                doc.setFontSize(7.5); doc.setTextColor(160, 165, 200); doc.setFont('helvetica', 'italic');
                doc.text(`Resume - Lutfi Ihsan  |  Page ${i} of ${totalPages}`, pageW / 2, pageH - 4.5, { align: 'center' });
            }
            // Force Download with Correct Extension using Blob
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Resume_Lutfi_Ihsan.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Gagal membuat PDF: ' + err.message);
        } finally {
            // Always restore UI
            hidePdfOverlay();
            const btn2 = document.querySelector('.resumebtn .btn');
            if (btn2) btn2.disabled = false;
            if (btnSpan) btnSpan.innerText = originalSpanText;
            if (btnIcon) { btnIcon.classList.remove('fa-spinner', 'fa-spin'); btnIcon.classList.add('fa-download'); }
        }
    }, 80); // small delay to let overlay render
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
    const srtop = ScrollReveal({ origin: 'top', distance: '80px', duration: 1000, reset: false });
    srtop.reveal('.home .content h3, .home .content p, .home .content .btn', { delay: 200 });
    srtop.reveal('.home .image', { delay: 400 });
    srtop.reveal('.about .content h3, .about .content .tag, .about .content p, .about .content .box-container, .about .content .resumebtn', { delay: 200 });
    srtop.reveal('.skills .container', { interval: 200 });
    srtop.reveal('.education .box', { interval: 200 });
    srtop.reveal('.work .box', { interval: 200 });
    srtop.reveal('.experience .timeline', { delay: 400 });
    srtop.reveal('.experience .timeline .container', { interval: 400 });
    srtop.reveal('.award-card', { interval: 150, origin: 'bottom', distance: '40px' });
    srtop.reveal('.contact .container', { delay: 400 });
}

// --- CONTACT COPY TO CLIPBOARD ---
function initContactCopy() {
    document.querySelectorAll('.copyable-contact').forEach(item => {
        item.addEventListener('click', function(e) {
            const fullValue = this.getAttribute('data-full-value');
            if (!fullValue) return;

            navigator.clipboard.writeText(fullValue).then(() => {
                const successMsg = this.querySelector('.copy-success');
                if (successMsg) {
                    successMsg.classList.add('visible');
                    setTimeout(() => {
                        successMsg.classList.remove('visible');
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });
}

// --- RENDER PROJECT DETAIL (project.html) ---
function renderProjectDetail(projects) {
    // Try URL param first (GitHub Pages), then sessionStorage (local dev server)
    const urlParams = new URLSearchParams(window.location.search);
    const projId = urlParams.get('id') || sessionStorage.getItem('activeProjectId');
    if (projId) sessionStorage.removeItem('activeProjectId'); // Clean up after use
    const project = projects.find(p => p.id === projId);

    const container = document.getElementById('project-detail-container');
    if (!container) return;

    if (!project) {
        container.innerHTML = `
            <div style="text-align:center; padding: 10rem 2rem;">
                <h2 class="heading">Project <span style="color:red;">Not Found</span></h2>
                <p style="font-size: 1.5rem; margin-bottom: 2rem;">Sorry, we couldn't find the requested project.</p>
                <a href="index#work" class="btn">Go Back to Projects</a>
            </div>`;
        return;
    }

    let btnsHtml = "";
    if (project.viewLink && project.viewLink !== "#") {
        btnsHtml += `<a href="${project.viewLink}" class="btn" target="_blank" rel="noopener noreferrer"><i class="fas fa-eye" aria-hidden="true"></i> Live Preview</a>`;
    }

    let techHtml = "";
    if (project.tech && project.tech.length) {
        techHtml = `<div class="tech-stack detail-tech-stack">${project.tech.map(t => `<span class="tech-tag" style="font-size: 1.3rem; padding: 0.6rem 1.8rem; margin: 0.5rem;">${t}</span>`).join("")}</div>`;
    }

    // Carousel support for detail
    let carouselHtml = "";
    let hasImages = project.images && project.images.length > 1;
    if (hasImages) {
        carouselHtml = `
        <button class="carousel-btn prev" onclick="changeDetailImage(-1, event)" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
        <button class="carousel-btn next" onclick="changeDetailImage(1, event)" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
        <div class="carousel-dots">
            ${project.images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="changeDetailImage(${i}, event, true)"></span>`).join("")}
        </div>`;
    }

    const html = `
        <div class="project-detail-wrapper">
            <div class="split left-split tilt" id="detail-carousel" data-images='${JSON.stringify(project.images || [project.image])}' data-current="0" style="position:relative;">
                <img src="${project.image}" alt="${project.title} Cover" class="detail-img project-img">
                ${carouselHtml}
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
                    <p class="detail-desc">${project.fullDesc || project.desc}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Technologies Used</h3>
                    ${techHtml}
                </div>
                
                <div class="detail-actions">
                    ${btnsHtml}
                    <div style="margin-top: 3rem;">
                        <a href="index#work" class="back-link"><i class="fas fa-arrow-left"></i> Back to Portfolio</a>
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