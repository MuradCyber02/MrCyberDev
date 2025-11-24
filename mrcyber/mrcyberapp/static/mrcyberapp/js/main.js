document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       HERO CAROUSEL
    ========================== */
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");

    if (slides.length && dots.length) {
        let current = 0;
        let autoTimer = null;

        const activateSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
            current = index;
        };

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const target = parseInt(dot.dataset.target, 10);
                activateSlide(target);
                resetAuto();
            });
        });

        const nextSlide = () => {
            const next = (current + 1) % slides.length;
            activateSlide(next);
        };

        const startAuto = () => {
            autoTimer = setInterval(nextSlide, 6000); // 6 saniyədən bir slayt dəyişsin
        };

        const resetAuto = () => {
            if (autoTimer) clearInterval(autoTimer);
            startAuto();
        };

        // İlk başladıqda
        activateSlide(0);
        startAuto();
    }

    /* =========================
       CONTACT DROPDOWN (QARMON)
    ========================== */
    const contactWrapper = document.querySelector(".contact-wrapper");
    const contactButton = contactWrapper?.querySelector(".nav-contact-button");
    const contactPanel = contactWrapper?.querySelector(".contact-panel");

    if (contactWrapper && contactButton && contactPanel) {
        // Contact-a kliklə aç / bağla
        contactButton.addEventListener("click", (e) => {
            e.stopPropagation(); // click Document-ə getməsin
            contactWrapper.classList.toggle("is-open");
        });

        // Panelin içində klik edəndə bağlanmasın
        contactPanel.addEventListener("click", (e) => {
            e.stopPropagation();
            // Burda gələcəkdə IG / TT / TG üçün link açma logic yaza bilərik
        });

        // Səhifənin başqa yerinə klik ediləndə panel bağlansın
        document.addEventListener("click", () => {
            contactWrapper.classList.remove("is-open");
        });
    }
});
