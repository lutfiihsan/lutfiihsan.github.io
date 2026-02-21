// Deklarasi variabel global untuk menyimpan data portfolio
let globalPortfolioData = null;

$(document).ready(function () {
    // --- UI Interactions ---
    $('#menu').click(function () {
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

        renderSkills(data.skills);
        renderProjects(data.projects);
        renderExperience(data.experience);
        renderCertifications(data.certifications);

        // Init animasi VanillaTilt & fitur View More setelah DOM diisi
        VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });
        initViewMoreLogic();
        initScrollReveal();
    } catch (error) {
        console.error("Error loading portfolio data:", error);
    }
}

function renderSkills(skills) {
    let html = "";
    skills.forEach(cat => {
        let itemsHtml = "";
        cat.items.forEach(item => {
            if (item.img) {
                itemsHtml += `<span class="tag"><img src="${item.img}" alt="${item.name}"> ${item.name}</span>`;
            } else {
                let style = item.style ? ` style="${item.style}"` : "";
                itemsHtml += `<span class="tag"><i class="${item.icon}"${style}></i> ${item.name}</span>`;
            }
        });

        html += `
        <div class="skill-category">
            <div class="category-header">
                <i class="${cat.icon}"></i>
                <h3>${cat.category}</h3>
            </div>
            <div class="skill-tags">${itemsHtml}</div>
        </div>`;
    });
    document.getElementById("skills-grid").innerHTML = html;
}

function renderProjects(projects) {
    let html = "";
    projects.forEach(proj => {
        let btnsHtml = "";
        
        if (proj.viewLink) {
            btnsHtml += `<a href="${proj.viewLink}" class="btn" target="_blank"><i class="fas fa-eye"></i> Visit</a>`;
        } else {
            let label = proj.status === 'Offline' ? '<i class="fas fa-laptop-house"></i> Local Only' : '<i class="fas fa-eye-slash"></i> No Demo';
            btnsHtml += `<a href="javascript:void(0)" class="btn btn-disabled">${label}</a>`;
        }

        if (proj.codeLink) {
            btnsHtml += `<a href="${proj.codeLink}" class="btn" target="_blank">Code <i class="fas fa-code"></i></a>`;
        } else {
            btnsHtml += `<a href="javascript:void(0)" class="btn btn-disabled">Code <i class="fas fa-lock"></i></a>`;
        }

        html += `
        <div class="box tilt">
            <div class="image-wrapper">
                <img draggable="false" src="${proj.image}" alt="${proj.title}" />
                <button class="zoom-btn" onclick="openModal('${proj.image}')"><i class="fas fa-search-plus"></i></button>
            </div>
            <div class="content">
                <div class="title-wrap">
                    <h3>${proj.title}</h3>
                    <span class="status-badge ${proj.statusClass}">${proj.status}</span>
                </div>
                <div class="desc">
                    <p>${proj.desc}</p>
                </div>
                <div class="btns">${btnsHtml}</div>
            </div>
        </div>`;
    });
    document.getElementById("projects-container").innerHTML = html;
}

function renderExperience(experiences) {
    let html = "";
    experiences.forEach(exp => {
        let tasksHtml = exp.tasks.map(task => `<li><i class="fas fa-check-circle"></i> ${task}</li>`).join("");
        html += `
        <div class="container ${exp.align}">
            <div class="content">
                <div class="tag"><h2>${exp.company}</h2></div>
                <div class="desc">
                    <h3>${exp.role}</h3>
                    <ul>${tasksHtml}</ul>
                    <p>${exp.period}</p>
                </div>
            </div>
        </div>`;
    });
    document.getElementById("experience-container").innerHTML = html;
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
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
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
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
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
        document.title = "Portfolio | Lutfi Ihsan";
        $("#favicon").attr("href", "assets/images/favicon.png");
    } else {
        document.title = "Come Back To Portfolio";
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