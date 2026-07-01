/* ============================================================
   Sama & Faiyaz — Wedding Invitation
   Envelope open choreography + background music (Step 2)
   ============================================================ */

(function () {
    "use strict";

    const body = document.body;
    const gate = document.getElementById("envelope-gate");
    const seal = document.getElementById("open-envelope") || document.getElementById("seal-button");
    const siteMain = document.getElementById("site-main");
    const music = document.getElementById("bg-music");
    const audioToggle = document.getElementById("audio-toggle");
    const audioIcon = audioToggle
        ? audioToggle.querySelector(".audio-toggle__icon")
        : null;

    if (!gate || !seal || !siteMain) {
        return;
    }

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const REVEAL_DELAY_MS = prefersReducedMotion ? 0 : 1600;
    const OPEN_TOTAL_MS = prefersReducedMotion ? 50 : 2400;
    const GATE_HIDE_MS = prefersReducedMotion ? 80 : 3800;

    let opened = false;

    function startMusic() {
        if (!music) {
            return;
        }
        try {
            const p = music.play();
            if (p && typeof p.catch === "function") {
                p.catch(function () {
                    // Autoplay policy blocked us; user can toggle manually.
                    setAudioIcon(false);
                });
            }
        } catch (_) {
            setAudioIcon(false);
        }
    }

    function setAudioIcon(isPlaying) {
        if (!audioToggle || !audioIcon) {
            return;
        }
        if (isPlaying) {
            audioIcon.textContent = "\u258C\u258C"; // ▌▌ pause
            audioIcon.dataset.state = "playing";
            audioToggle.setAttribute("aria-pressed", "true");
            audioToggle.setAttribute("aria-label", "Pause music");
        } else {
            audioIcon.textContent = "\u25B6";       // ▶ play
            audioIcon.dataset.state = "paused";
            audioToggle.setAttribute("aria-pressed", "false");
            audioToggle.setAttribute("aria-label", "Play music");
        }
    }

    function openEnvelope() {
        if (opened) {
            return;
        }
        opened = true;
        seal.disabled = true;

        // 1. Kick off the flap animation immediately.
        body.classList.add("is-opening");

        // 2. Start music (user gesture makes autoplay legal here).
        startMusic();

        // 3. Reveal the main site after the initial flap movement starts.
        window.setTimeout(function () {
            siteMain.hidden = false;
            siteMain.setAttribute("aria-hidden", "false");
        }, REVEAL_DELAY_MS);

        // 4. Mark the envelope as open.
        window.setTimeout(function () {
            body.classList.add("is-open");
            if (audioToggle) {
                audioToggle.hidden = false;
            }
        }, OPEN_TOTAL_MS);

        // 5. Once gate fade finishes, detach from accessibility tree.
        window.setTimeout(function () {
            gate.setAttribute("aria-hidden", "true");
            gate.hidden = true;
        }, GATE_HIDE_MS);
    }

    seal.addEventListener("click", openEnvelope);

    // Desktop / PC: skip the envelope gate entirely and show the site.
    if (window.matchMedia("(min-width: 1025px)").matches) {
        opened = true;
        siteMain.hidden = false;
        siteMain.setAttribute("aria-hidden", "false");
        body.classList.add("is-open");
        gate.setAttribute("aria-hidden", "true");
        gate.hidden = true;
        if (audioToggle) {
            audioToggle.hidden = false;
        }
    }

    function setupScrollReveal() {
        const items = document.querySelectorAll(".reveal-on-scroll");
        if (!items.length) {
            return;
        }

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (el) {
                el.classList.add("is-visible");
            });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.18,
            rootMargin: "0px 0px -8% 0px"
        });

        items.forEach(function (el) {
            observer.observe(el);
        });
    }

    function setupCountdown() {
        const daysEl = document.querySelector("[data-countdown-days]");
        const hoursEl = document.querySelector("[data-countdown-hours]");
        const minutesEl = document.querySelector("[data-countdown-minutes]");
        const secondsEl = document.querySelector("[data-countdown-seconds]");
        const completeEl = document.querySelector("[data-countdown-complete]");

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
            return;
        }

        const targetDate = new Date("2026-11-10T19:00:00+06:00");

        function pad2(num) {
            return String(num).padStart(2, "0");
        }

        function setCompleteState() {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
            secondsEl.textContent = "00";
            if (completeEl) {
                completeEl.hidden = false;
            }
        }

        function updateCountdown() {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) {
                setCompleteState();
                return true;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            daysEl.textContent = String(days);
            hoursEl.textContent = pad2(hours);
            minutesEl.textContent = pad2(minutes);
            secondsEl.textContent = pad2(seconds);
            return false;
        }

        const done = updateCountdown();
        if (done) {
            return;
        }

        const timerId = window.setInterval(function () {
            const finished = updateCountdown();
            if (finished) {
                window.clearInterval(timerId);
            }
        }, 1000);
    }

    function setupRsvpStatic() {
        const rsvpForm = document.getElementById("rsvp-form");
        const rsvpSuccess = document.getElementById("rsvp-success");

        if (!rsvpForm || !rsvpSuccess) {
            return;
        }

        const submitButton = rsvpForm.querySelector("button[type='submit']");
        const defaultLabel = submitButton ? submitButton.textContent : "";

        rsvpForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!rsvpForm.checkValidity()) {
                rsvpForm.reportValidity();
                return;
            }

            rsvpSuccess.hidden = false;

            if (submitButton && defaultLabel) {
                submitButton.textContent = "Submitted";
                window.setTimeout(function () {
                    submitButton.textContent = defaultLabel;
                }, 2200);
            }
        });
    }

    function setupStarfield() {
        const starfield = document.getElementById("starfield");
        if (!starfield || starfield.dataset.ready === "true") {
            return;
        }

        const starCount = 120;
        const fragment = document.createDocumentFragment();

        function edgeBiasedPosition() {
            const favorEdge = Math.random() < 0.72;
            if (!favorEdge) {
                return (Math.random() * 100).toFixed(2) + "%";
            }

            const leftEdge = Math.random() < 0.5;
            const value = leftEdge
                ? Math.random() * 24
                : 76 + Math.random() * 24;
            return value.toFixed(2) + "%";
        }

        for (let i = 0; i < starCount; i += 1) {
            const star = document.createElement("span");
            star.className = "star";

            const size = Math.random() * 2.4 + 1.35;
            const opacity = Math.random() * 0.42 + 0.48;
            const duration = Math.random() * 3.2 + 3;
            const delay = Math.random() * -7;

            star.style.setProperty("--x", edgeBiasedPosition());
            star.style.setProperty("--y", (Math.random() * 100).toFixed(2) + "%");
            star.style.setProperty("--s", size.toFixed(2) + "px");
            star.style.setProperty("--o", opacity.toFixed(2));
            star.style.setProperty("--d", duration.toFixed(2) + "s");
            star.style.setProperty("--delay", delay.toFixed(2) + "s");

            fragment.appendChild(star);
        }

        starfield.appendChild(fragment);
        starfield.dataset.ready = "true";
    }

    setupScrollReveal();
    setupCountdown();
    setupRsvpStatic();
    setupStarfield();

    // Audio toggle wiring (button stays hidden until the site opens).
    if (audioToggle && music) {
        function stopMusic() {
            music.pause();
            setAudioIcon(false);
        }

        function playMusic() {
            const p = music.play();
            if (p && typeof p.catch === "function") {
                p.catch(function () { setAudioIcon(false); });
            }
            setAudioIcon(true);
        }

        audioToggle.addEventListener("click", function () {
            const pressedState = audioToggle.getAttribute("aria-pressed") === "true";

            // If UI says "playing" or media is actually playing, force a pause.
            if (pressedState || !music.paused) {
                stopMusic();
            } else {
                playMusic();
            }
        });
        music.addEventListener("play",  function () { setAudioIcon(true); });
        music.addEventListener("pause", function () { setAudioIcon(false); });
    }
})();
