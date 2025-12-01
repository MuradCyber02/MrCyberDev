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

    /* =========================
       TYPING EFFECT – "Hi, I'm Murad Kerimov" (sonsuz döngü)
    ========================== */
    const typedEl = document.getElementById("typed-intro");
    if (typedEl) {
        const text = "Hi, I'm Murad Kerimov";
        let index = 0;
        const speed = 90;      // hər hərf üçün müddət (ms)
        const holdTime = 1500; // tam yazıldıqdan sonra gözləmə (ms)
        const clearTime = 400; // sildikdən sonra yenidən başlamazdan əvvəl gözləmə

        const typeLoop = () => {
            if (index <= text.length) {
                // Yazma mərhələsi
                typedEl.textContent = text.slice(0, index);
                index += 1;
                setTimeout(typeLoop, speed);
            } else {
                // Tam yazılıb – bir az gözləyək, sonra silək
                setTimeout(() => {
                    typedEl.textContent = "";
                    index = 0;
                    setTimeout(typeLoop, clearTime);
                }, holdTime);
            }
        };

        typeLoop();
    }

    /* =========================
       GITHUB REPOS – son repolar
    ========================== */
    initGithubRepos();

    /* =========================
       GITHUB LANGUAGES – stack cədvəli üçün
    ========================== */
    initGithubLanguages();

    /* =========================
       FOOTER – dinamik il
    ========================== */
    initFooterYear();
});

/* =======================================
   GitHub API – latest repositories
======================================= */

function initGithubRepos() {
    const listEl = document.getElementById("github-repo-list");
    if (!listEl) return;

    const USERNAME = "MuradCyber02"; // lazım olsa burada username-i dəyişə bilərsən

    fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=6`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("GitHub API error");
            }
            return res.json();
        })
        .then((repos) => {
            listEl.innerHTML = "";

            if (!repos || !repos.length) {
                listEl.innerHTML =
                    '<p class="github-repo-error">No public repositories found yet.</p>';
                return;
            }

            repos.forEach((repo) => {
                const card = document.createElement("a");
                card.href = repo.html_url;
                card.target = "_blank";
                card.rel = "noopener noreferrer";
                card.className = "github-repo-card";

                const desc =
                    repo.description && repo.description.trim().length
                        ? repo.description
                        : "No description provided.";

                card.innerHTML = `
                    <h4 class="github-repo-name">${repo.name}</h4>
                    <p class="github-repo-desc">${desc}</p>
                    <div class="github-repo-meta">
                        <span>${repo.language || "Unknown"}</span>
                        <span>★ ${repo.stargazers_count}</span>
                    </div>
                `;

                listEl.appendChild(card);
            });
        })
        .catch((err) => {
            console.error("GitHub repos load error:", err);
            listEl.innerHTML =
                '<p class="github-repo-error">Couldn’t load GitHub activity right now.</p>';
        });
}

/* =======================================
   GitHub API – language usage snapshot
   Stack cədvəlini dinamik doldurur
======================================= */

function initGithubLanguages() {
    const bars = document.querySelectorAll(".stack-bar[data-lang]");
    if (!bars.length) return; // stack bölümün yoxdursa, çıx

    const USERNAME = "MuradCyber02";

    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=50&sort=updated`)
        .then((res) => {
            if (!res.ok) throw new Error("GitHub API error (repos)");
            return res.json();
        })
        .then((repos) => {
            if (!Array.isArray(repos) || !repos.length) {
                throw new Error("No repos for language stats");
            }

            const langTotals = {};
            const languageFetches = [];

            repos.forEach((repo) => {
                // Fork-ları saymaya da bilərik
                if (!repo || repo.fork || !repo.languages_url) return;

                const p = fetch(repo.languages_url)
                    .then((r) => {
                        if (!r.ok) throw new Error("GitHub API error (languages)");
                        return r.json();
                    })
                    .then((langs) => {
                        Object.entries(langs).forEach(([lang, bytes]) => {
                            langTotals[lang] = (langTotals[lang] || 0) + bytes;
                        });
                    })
                    .catch(() => {
                        // tək repo səhvi ümumi prosesi pozmasın
                    });

                languageFetches.push(p);
            });

            if (!languageFetches.length) {
                throw new Error("No language URLs to fetch");
            }

            return Promise.all(languageFetches).then(() => langTotals);
        })
        .then((langTotals) => {
            const totals = Object.values(langTotals);
            const totalBytes = totals.reduce((acc, v) => acc + v, 0);

            if (!totalBytes) {
                throw new Error("Empty language totals");
            }

            const sumLang = (names) =>
                names.reduce((acc, name) => acc + (langTotals[name] || 0), 0);

            // GitHub dillərini sənin cədvəldəki kateqoriyalara map edirik
            const mapping = {
                html: sumLang(["HTML"]),
                css: sumLang(["CSS"]),
                js: sumLang(["JavaScript", "TypeScript"]),
                java: sumLang(["Java"]),
                c: sumLang(["C", "C++", "C#", "Objective-C"]),
                cloud: sumLang(["Shell", "HCL", "Dockerfile"]),
                data: sumLang(["Python", "Jupyter Notebook", "R", "SQL"])
            };

            Object.entries(mapping).forEach(([key, value]) => {
                const percent = value ? Math.round((value / totalBytes) * 100) : 0;

                const bar = document.querySelector(`.stack-bar[data-lang="${key}"]`);
                const note = document.querySelector(
                    `.stack-activity-note[data-lang-note="${key}"]`
                );

                if (bar) {
                    bar.style.setProperty("--level", percent);
                }

                if (note) {
                    if (percent > 0) {
                        note.textContent = `${percent}% of public code by bytes in this area.`;
                    } else {
                        note.textContent =
                            "Not prominent in public repos yet – mostly used in private or future work.";
                    }
                }
            });
        })
        .catch((err) => {
            console.error("GitHub languages load error:", err);
            const notes = document.querySelectorAll(".stack-activity-note");
            notes.forEach((note) => {
                if (note.textContent.includes("Syncing")) {
                    note.textContent = "Couldn’t sync language stats from GitHub right now.";
                }
            });
        });
}

/* =======================================
   FOOTER – dinamik il
======================================= */

function initFooterYear() {
    const yearSpan = document.getElementById("footer-year");
    if (!yearSpan) return;
    yearSpan.textContent = new Date().getFullYear();
}
