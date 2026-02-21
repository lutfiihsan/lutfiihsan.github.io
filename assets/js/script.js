$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // scroll spy
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

    // smooth scrolling
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

    // <!-- emailjs to mail contact form data -->
    $("#contact-form").submit(function (event) {
        emailjs.init("user_TTDmetQLYgWCLzHTDgqxm");

        emailjs.sendForm('contact_service', 'template_contact', '#contact-form')
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                document.getElementById("contact-form").reset();
                alert("Form Submitted Successfully");
            }, function (error) {
                console.log('FAILED...', error);
                alert("Form Submission Failed! Try Again");
            });
        event.preventDefault();
    });
    // <!-- emailjs to mail contact form data -->

    // Jumlah item yang ingin ditampilkan pertama kali
    const itemsToShow = 6; 
    
    // --- 1. Logika untuk Projects ---
    const projectItems = $('.work .box-container .box');
    const viewMoreProjectsBtn = $('#viewMoreProjects');
    
    if (projectItems.length > itemsToShow) {
        projectItems.slice(itemsToShow).addClass('hidden-item');
    } else {
        viewMoreProjectsBtn.parent().hide(); // Sembunyikan tombol jika item sedikit
    }

    viewMoreProjectsBtn.click(function(){
        const hiddenProjects = $('.work .box-container .box.hidden-item');
        if(hiddenProjects.length > 0) {
            // Tampilkan semua
            hiddenProjects.removeClass('hidden-item');
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
        } else {
            // Sembunyikan kembali
            projectItems.slice(itemsToShow).addClass('hidden-item');
            $(this).html('<span>View More</span> <i class="fas fa-chevron-down"></i>');
            // Scroll otomatis ke atas bagian projects
            $('html, body').animate({
                scrollTop: $("#work").offset().top - 80
            }, 500);
        }
    });

    // --- 2. Logika untuk Certifications ---
    const certItems = $('.certifications .box-container .box');
    const viewMoreCertsBtn = $('#viewMoreCerts');
    
    if (certItems.length > itemsToShow) {
        certItems.slice(itemsToShow).addClass('hidden-item');
    } else {
        viewMoreCertsBtn.parent().hide();
    }

    viewMoreCertsBtn.click(function(){
        const hiddenCerts = $('.certifications .box-container .box.hidden-item');
        if(hiddenCerts.length > 0) {
            // Tampilkan semua
            hiddenCerts.removeClass('hidden-item');
            $(this).html('<span>View Less</span> <i class="fas fa-chevron-up"></i>');
        } else {
            // Sembunyikan kembali
            certItems.slice(itemsToShow).addClass('hidden-item');
            $(this).html('<span>View More</span> <i class="fas fa-chevron-down"></i>');
            // Scroll otomatis ke atas bagian certifications
            $('html, body').animate({
                scrollTop: $("#certifications").offset().top - 80
            }, 500);
        }
    });

});

document.addEventListener('visibilitychange',
    function () {
        if (document.visibilityState === "visible") {
            document.title = "Portfolio | Lutfi Ihsan";
            $("#favicon").attr("href", "assets/images/favicon.png");
        }
        else {
            document.title = "Come Back To Portfolio";
            $("#favicon").attr("href", "assets/images/favhand.png");
        }
    });


// <!-- typed js effect starts -->
var typed = new Typed(".typing-text", {
    strings: ["frontend development", "backend development", "web development", "fullstack developer", "data science"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
});
// <!-- typed js effect ends -->

async function fetchData(type = "skills") {
    let response
    type === "skills" ?
        response = await fetch("skills.json")
        :
        response = await fetch("./projects/projects.json")
    const data = await response.json();
    return data;
}

function showSkills(skills) {
    let skillsContainer = document.getElementById("skillsContainer");
    let skillHTML = "";
    skills.forEach(skill => {
        skillHTML += `
        <div class="bar">
              <div class="info">
                <img src=${skill.icon} alt="skill" />
                <span>${skill.name}</span>
              </div>
            </div>`
    });
    skillsContainer.innerHTML = skillHTML;
}

function showProjects(projects) {
    let projectsContainer = document.querySelector("#work .box-container");
    let projectHTML = "";
    projects.slice(0, 6).forEach(project => {
        projectHTML += `
        <div class="box tilt">
      <img draggable="false" src="/assets/images/projects/${project.image}.png" alt="project" />
      <div class="content">
        <div class="tag">
        <h3>${project.name}</h3>
        </div>
        <div class="desc">
          <p>${project.desc}</p>
          <div class="btns">
            <a href="${project.links.view}" class="btn" target="_blank"><i class="fas fa-eye"></i> View</a>
            <a href="${project.links.code}" class="btn" target="_blank">Code <i class="fas fa-code"></i></a>
          </div>
        </div>
      </div>
    </div>`
    });
    projectsContainer.innerHTML = projectHTML;

    // <!-- tilt js effect starts -->
    VanillaTilt.init(document.querySelectorAll(".tilt"), {
        max: 15,
    });
    // <!-- tilt js effect ends -->

    /* ===== SCROLL REVEAL ANIMATION ===== */
    const srtop = ScrollReveal({
        origin: 'top',
        distance: '80px',
        duration: 1000,
        reset: true
    });

    /* SCROLL PROJECTS */
    srtop.reveal('.work .box', { interval: 200 });

}

// ==========================================
// FUNGSI ZOOM IMAGE (MODAL) UNTUK PORTFOLIO
// ==========================================
function openModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    
    modal.style.display = "block";
    modalImg.src = imgSrc;
}

function closeModal() {
    document.getElementById('imageModal').style.display = "none";
}

// Tutup modal jika user klik di luar area gambar
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        closeModal();
    }
}

// ==========================================
// FUNGSI GENERATE RESUME PDF DARI HTML
// ==========================================
function generateResume() {
    // 1. Ubah teks tombol menjadi "Generating..." agar user tahu proses sedang berjalan
    const btnSpan = document.querySelector('.resumebtn .btn span');
    const originalText = btnSpan.innerText;
    btnSpan.innerText = "Generating PDF...";

    // 2. Buat elemen div sementara untuk menampung konten yang mau di-PDF-kan
    const printContainer = document.createElement('div');
    printContainer.style.padding = "20px";
    printContainer.style.background = "#fff"; // Pastikan background putih
    printContainer.style.color = "#000"; // Pastikan teks hitam
    
    // 3. Ambil (clone) bagian-bagian yang ingin dimasukkan ke CV
    // Kita ambil About, Skills, Experience, dan Certifications
    const aboutSection = document.querySelector('#about').cloneNode(true);
    const skillsSection = document.querySelector('#skills').cloneNode(true);
    const experienceSection = document.querySelector('#experience').cloneNode(true);
    const certsSection = document.querySelector('#certifications').cloneNode(true);

    // (Opsional) Hapus elemen yang tidak perlu ada di PDF, seperti tombol download itu sendiri
    const btnInClone = aboutSection.querySelector('.resumebtn');
    if (btnInClone) btnInClone.remove();

    // Masukkan hasil clone ke container sementara
    printContainer.appendChild(aboutSection);
    printContainer.appendChild(skillsSection);
    printContainer.appendChild(experienceSection);
    printContainer.appendChild(certsSection);

    // 4. Konfigurasi html2pdf
    const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5], // Margin atas, kiri, bawah, kanan (dalam inchi)
        filename:     'Resume_Lutfi_Ihsan.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true }, // scale 2 agar resolusi tidak pecah
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // 5. Jalankan proses render ke PDF
    html2pdf().set(opt).from(printContainer).save().then(() => {
        // Kembalikan teks tombol seperti semula setelah selesai
        btnSpan.innerText = originalText;
    });
}

// fetchData().then(data => {
//     showSkills(data);
// });

// fetchData("projects").then(data => {
//     showProjects(data);
// });

// <!-- tilt js effect starts -->
VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 15,
});
// <!-- tilt js effect ends -->


// pre loader start
// function loader() {
//     document.querySelector('.loader-container').classList.add('fade-out');
// }
// function fadeOut() {
//     setInterval(loader, 500);
// }
// window.onload = fadeOut;
// pre loader end

// disable developer mode
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
}

// Start of Tawk.to Live Chat
// var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
// (function () {
//     var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
//     s1.async = true;
//     s1.src = 'https://embed.tawk.to/60df10bf7f4b000ac03ab6a8/1f9jlirg6';
//     s1.charset = 'UTF-8';
//     s1.setAttribute('crossorigin', '*');
//     s0.parentNode.insertBefore(s1, s0);
// })();
// End of Tawk.to Live Chat


/* ===== SCROLL REVEAL ANIMATION ===== */
const srtop = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 1000,
    reset: true
});

/* SCROLL HOME */
srtop.reveal('.home .content h3', { delay: 200 });
srtop.reveal('.home .content p', { delay: 200 });
srtop.reveal('.home .content .btn', { delay: 200 });

srtop.reveal('.home .image', { delay: 400 });
srtop.reveal('.home .linkedin', { interval: 600 });
srtop.reveal('.home .github', { interval: 800 });
srtop.reveal('.home .twitter', { interval: 1000 });
srtop.reveal('.home .telegram', { interval: 600 });
srtop.reveal('.home .instagram', { interval: 600 });
srtop.reveal('.home .dev', { interval: 600 });

/* SCROLL ABOUT */
srtop.reveal('.about .content h3', { delay: 200 });
srtop.reveal('.about .content .tag', { delay: 200 });
srtop.reveal('.about .content p', { delay: 200 });
srtop.reveal('.about .content .box-container', { delay: 200 });
srtop.reveal('.about .content .resumebtn', { delay: 200 });


/* SCROLL SKILLS */
srtop.reveal('.skills .container', { interval: 200 });
srtop.reveal('.skills .container .bar', { delay: 400 });

/* SCROLL EDUCATION */
srtop.reveal('.education .box', { interval: 200 });

/* SCROLL PROJECTS */
srtop.reveal('.work .box', { interval: 200 });

/* SCROLL EXPERIENCE */
srtop.reveal('.experience .timeline', { delay: 400 });
srtop.reveal('.experience .timeline .container', { interval: 400 });

/* SCROLL CONTACT */
srtop.reveal('.contact .container', { delay: 400 });
srtop.reveal('.contact .container .form-group', { delay: 400 });