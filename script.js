const CORRECT_PASSWORD = "2782025";
const STORAGE_KEY = "forNada_unlocked";
const LANG_KEY = "forNada_lang";

const loginScreen = document.getElementById("loginScreen");
const mainContent = document.getElementById("mainContent");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("passwordInput");
const errorMsg = document.getElementById("errorMsg");
const logoutBtn = document.getElementById("logoutBtn");

// Password Eye Toggle
const togglePassword = document.getElementById("togglePassword");
if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        const eyeOpen = togglePassword.querySelector(".eye-open");
        const eyeClosed = togglePassword.querySelector(".eye-closed");
        
        if (type === "text") {
            eyeOpen.style.display = "none";
            eyeClosed.style.display = "block";
        } else {
            eyeOpen.style.display = "block";
            eyeClosed.style.display = "none";
        }
    });
}

const langToggle = document.getElementById("langToggle");
const langToggle2 = document.getElementById("langToggle2");
const langLabel = document.getElementById("langLabel");
const langLabel2 = document.getElementById("langLabel2");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = `${new Date().getFullYear()}`;

/* i18n dictionary */
const i18n = {
    ar: {
        dir: "rtl", lang: "ar",
        siteTitle: "For Nada 💖",
        loginSubtitle: "خطوة صغيرة بكلمة سر… وتدخلي عالم كله حب ✨",
        passwordLabel: "كلمة السر",
        unlockBtn: "فتح",
        loginHint: "تلميح: حاجة سويت ✨",
        brand: "Nada",
        navWelcome: "الرئيسية",
        navMessages: "رسائل",
        navGallery: "صور",
        navAbout: "قاسم",
        navCountdown: "عمرنا مع بعض",
        navLock: "قفل",
        welcomeTitle: "يا ندى، وجودك هنا مش صدفة… ده اختيار قلبي 💖",
        welcomeText: "مكان صغير معمول بحب… فيه كلام دافي وذكريات بتضحك القلب.",
        ctaMessages: "اقري الرسائل",
        ctaGallery: "شوّفي الصور",
        ctaCountdown: "ذكريات حبنا",
        todayVibe: "مزاج النهارده",
        miniQuote: "\"كل مرة بفتكرِك… الدنيا بتبقى أهدى وأجمل.\"",
        messagesTitle: "رسائل رومانسية 💌",
        messagesSubtitle: "نوتس صغيرة مكتوبة ليكي… وبس.",
        msg1Title: "💖 أول إحساس",
        msg1Text: "أول مرة حسيت إن الدنيا وسعت لما دخلتي قلبي.",
        msg2Title: "✨ الأمان",
        msg2Text: "معاكي الخوف بيهدى والروح بترتاح.",
        msg3Title: "🌙 الحنية",
        msg3Text: "صوتك بيطمنني أكتر من أي حاجة.",
        msg4Title: "رسالة رقم 4",
        msg4Text: "(هنا هتكتب رابع رسالة… استبدل الكلام ده برسالتك)",
        galleryTitle: "جاليري الذكريات 📸",
        gallerySubtitle: "صور ولحظات… بتفكرنا قد إيه الحياة حلوة سوا.",
        cap1: "حلاوة البدايات ✨",
        cap2: "ضحكتك اللي بتنور أيامي 💖",
        cap3: "كل مرة بشوفك بحبك من جديد 🌙",
        endTitle: "مش نهاية… دي مجرد وقفة 🌙",
        endText: "عملت المكان ده علشان يفضل يفكرك إنك غالية… وموجودة جوا قلبي طول الوقت.",
        aboutTitle: "👨‍💻 قاسم",
        aboutSubtitle: "شوية معلومات عن اللي صمم وبرمج المكان ده.",
        aboutName: "قاسم",
        aboutBio: "مطور ويب محب للتصميم والبرمجة، مهتم ببناء تجارب رقمية مميزة وأنيقة.",
        backTop: "فوق تاني",
        goCountdown: "روحي للعد التنازلي",
        madeWith: "made with Qasam",
        wrongPassword: "للأسف… كلمة السر دي مش صح 💔 جرّبي تاني."
    },
    en: {
        dir: "ltr", lang: "en",
        siteTitle: "For Nada 💖",
        loginSubtitle: "One small password… into a world made with love ✨",
        passwordLabel: "Password",
        unlockBtn: "Unlock",
        loginHint: "Hint: it's something sweet ✨",
        brand: "Nada",
        navWelcome: "Home",
        navMessages: "Messages",
        navGallery: "Gallery",
        navAbout: "Qasam",
        navCountdown: "Countdown",
        navLock: "Lock",
        welcomeTitle: "Welcome to your special space, Nada 💖",
        welcomeText: "A soft little place made with love, warm words, and sweet memories.",
        ctaMessages: "Read messages",
        ctaGallery: "See photos",
        ctaCountdown: "Countdown",
        todayVibe: "Today's vibe",
        miniQuote: "\u201cEvery time I think of you, the world feels softer.\u201d",
        messagesTitle: "Romantic Messages 💌",
        messagesSubtitle: "Little notes written only for you.",
        msg1Title: "💖 First Feeling",
        msg1Text: "The world widened the moment you entered my heart.",
        msg2Title: "✨ Safest Place",
        msg2Text: "With you, fears fade and my soul finds rest.",
        msg3Title: "🌙 Pure Tenderness",
        msg3Text: "Your voice comforts me more than anything else.",
        msg4Title: "Message #4",
        msg4Text: "(Replace this with your fourth message)",
        galleryTitle: "Our Gallery 📸",
        gallerySubtitle: "Moments, memories, and smiles in one place.",
        cap1: "The sweetness of beginnings ✨",
        cap2: "Your smile lights up my days 💖",
        cap3: "Falling for you over and over 🌙",
        endTitle: "Not the end… just a pause 🌙",
        endText: "I made this space to remind you you're cherished — always.",
        aboutTitle: "👨‍💻 Qasam",
        aboutSubtitle: "About the one who designed and built this place.",
        aboutName: "Qasam",
        aboutBio: "Web Developer passionate about design and coding, focused on building unique and elegant digital experiences.",
        backTop: "Back to top",
        goCountdown: "Go to countdown",
        madeWith: "made with Qasam",
        wrongPassword: "Oops… that's not the right password 💔 Try again."
    }
};

function getLang() { return localStorage.getItem(LANG_KEY) || "ar"; }

function applyLanguage(lang) {
    const dict = i18n[lang] || i18n.ar;

    document.documentElement.lang = dict.lang;
    document.documentElement.dir = dict.dir;

    const nextLabel = (lang === "ar") ? "EN" : "AR";
    if (langLabel) langLabel.textContent = nextLabel;
    if (langLabel2) langLabel2.textContent = nextLabel;

    if (passwordInput) {
        passwordInput.placeholder = (lang === "ar") ? "اكتبي كلمة السر..." : "Type the password...";
    }

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        // Don't overwrite form elements that have inner HTML structures (like buttons with icons)
        if (dict[key] != null) {
            if (el.tagName === "BUTTON" && el.querySelector("span, svg")) {
                const textSpan = el.querySelector("span:not(.nav-ico)");
                if (textSpan) textSpan.textContent = dict[key];
            } else if (el.tagName === "A" && el.querySelector(".nav-ico")) {
                const textSpan = el.querySelector(".nav-txt");
                if (textSpan) textSpan.textContent = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });
}

function toggleLang() {
    const current = getLang();
    const next = current === "ar" ? "en" : "ar";
    localStorage.setItem(LANG_KEY, next);
    applyLanguage(next);
}

/* Transitions */
function showMain() {
    if (!loginScreen || !mainContent) return;
    loginScreen.classList.add("fade-out");
    setTimeout(() => {
        loginScreen.classList.remove("active", "fade-out");
        loginScreen.style.display = "none";
        mainContent.classList.add("active", "fade-in");
        mainContent.style.display = "flex";
        observeReveals();
        observeMessageCards();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 420);
}

function showLogin() {
    if (!loginScreen || !mainContent) return;
    mainContent.classList.add("fade-out");
    setTimeout(() => {
        mainContent.classList.remove("active", "fade-out", "fade-in");
        mainContent.style.display = "none";
        loginScreen.classList.add("active", "fade-in");
        loginScreen.style.display = "flex";
        if (passwordInput) passwordInput.value = "";
        if (errorMsg) errorMsg.textContent = "";
        if (passwordInput) passwordInput.focus();
        sessionStorage.removeItem(STORAGE_KEY);
    }, 420);
}

/* Login */
function checkSavedSession() {
    // ⚠️ Security Note: sessionStorage means it clears on tab close.
    // Replace with localStorage in the future if persistence is needed.
    const unlocked = sessionStorage.getItem(STORAGE_KEY);
    if (unlocked === "true") showMain();
    else if (passwordInput) passwordInput.focus();
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const entered = passwordInput.value.trim();
        const dict = i18n[getLang()] || i18n.ar;

        if (entered !== CORRECT_PASSWORD) {
            errorMsg.textContent = dict.wrongPassword;
            const card = loginScreen.querySelector(".login-card");
            card?.animate?.(
                [
                    { transform: "translateX(0)" },
                    { transform: "translateX(-8px)" },
                    { transform: "translateX(8px)" },
                    { transform: "translateX(-6px)" },
                    { transform: "translateX(6px)" },
                    { transform: "translateX(0)" },
                ],
                { duration: 420, easing: "ease-in-out" }
            );
            return;
        }

        errorMsg.textContent = "";
        sessionStorage.setItem(STORAGE_KEY, "true");
        showMain();
    });
}

if (logoutBtn) logoutBtn.addEventListener("click", showLogin);
if (langToggle) langToggle.addEventListener("click", toggleLang);
if (langToggle2) langToggle2.addEventListener("click", toggleLang);

/* Navigation specific logic */
const navLinks = document.querySelectorAll(".nav-link[href^='#']");

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetSec = document.getElementById(targetId);
        if (targetSec) {
            const yOffset = -80; // offset for sticky header
            const y = targetSec.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });
});

// Update active nav link on scroll
window.addEventListener("scroll", () => {
    let current = "";
    const sections = document.querySelectorAll(".section[id]");
    
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 120) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(current) && current !== "") {
            link.classList.add("active");
        }
    });
});

/* Reveal sections */
let revealObserver;
function observeReveals() {
    if (revealObserver) return;
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    elements.forEach(el => revealObserver.observe(el));
}

/* Messages one-by-one */
function observeMessageCards() {
    const cards = document.querySelectorAll(".msg-reveal");
    if (!cards.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = Number(el.getAttribute("data-delay") || 0);
            setTimeout(() => el.classList.add("in"), delay);
            obs.unobserve(el);
        });
    }, { threshold: 0.18 });

    cards.forEach(c => obs.observe(c));
}

/* Floating SVG hearts */
const heartsLayer = document.getElementById("heartsLayer");

function createHeartSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "heart-float");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 21s-7.2-4.6-9.5-8.4C.2 9.2 2 6 5.4 6c1.7 0 3.2.9 4.1 2.1C10.4 6.9 11.9 6 13.6 6 17 6 18.8 9.2 21.5 12.6 19.2 16.4 12 21 12 21z");
    const fills = ["#ff7ab6", "#b89cff", "#ffd1e6", "#ffcf7a"];
    path.setAttribute("fill", fills[Math.floor(Math.random() * fills.length)]);
    svg.appendChild(path);
    return svg;
}

function spawnHeart() {
    if (!heartsLayer) return;
    const heart = createHeartSVG();

    const left = Math.random() * 100;
    const drift = (Math.random() * 120 - 60).toFixed(0) + "px";
    const size = 12 + Math.random() * 14;

    heart.style.left = left + "vw";
    heart.style.width = size + "px";
    heart.style.height = size + "px";
    heart.style.setProperty("--drift", drift);

    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 2500); // Wait for rise animation
}

let lastHeart = 0;
window.addEventListener("scroll", () => {
    const now = Date.now();
    if (now - lastHeart > 100) {
        spawnHeart();
        lastHeart = now;
    }
});

// Auto floating mostly visible on login screen
setInterval(() => {
    spawnHeart();
}, 400);

/* Init */
applyLanguage(getLang());
checkSavedSession();

/* ===============================
   LIGHTBOX + SWIPE + KEYBOARD
================================ */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeBtn = lightbox ? lightbox.querySelector(".lightbox-close") : null;
const prevBtn = lightbox ? lightbox.querySelector(".lightbox-prev") : null;
const nextBtn = lightbox ? lightbox.querySelector(".lightbox-next") : null;
const lightboxCurrent = document.getElementById("lightboxCurrent");
const lightboxTotal = document.getElementById("lightboxTotal");
const galleryImages = document.querySelectorAll(".gallery-grid img");

let currentIndex = 0;
let startX = 0;

if (galleryImages.length && lightbox && lightboxImg) {
    if (lightboxTotal) lightboxTotal.textContent = galleryImages.length;

    galleryImages.forEach((img, index) => {
        img.addEventListener("click", () => {
            currentIndex = index;
            openLightbox(img.src);
        });
    });
}

function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.style.opacity = "0"; // for smooth transition
    setTimeout(() => {
        lightboxImg.src = src;
        lightboxImg.style.opacity = "1";
    }, 50);
    
    if (lightboxCurrent) lightboxCurrent.textContent = currentIndex + 1;
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent scrolling
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
}

function nextImage(e) {
    if (e) e.stopPropagation();
    if (!galleryImages.length) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    openLightbox(galleryImages[currentIndex].src);
}

function prevImage(e) {
    if (e) e.stopPropagation();
    if (!galleryImages.length) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    openLightbox(galleryImages[currentIndex].src);
}

// Click events
if (closeBtn) closeBtn.onclick = closeLightbox;
if (nextBtn) nextBtn.onclick = nextImage;
if (prevBtn) prevBtn.onclick = prevImage;
if (lightbox) lightbox.onclick = (e) => {
    if (e.target === lightbox) closeLightbox();
};

// Keyboard navigation
document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("show")) return;
    
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") getLang() === 'ar' ? prevImage() : nextImage();
    if (e.key === "ArrowLeft") getLang() === 'ar' ? nextImage() : prevImage();
});

// Swipe Mobile
if (lightboxImg) {
    lightboxImg.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    lightboxImg.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX;
        const rtlDir = getLang() === 'ar';
        
        if (startX - endX > 50) rtlDir ? prevImage() : nextImage();
        if (endX - startX > 50) rtlDir ? nextImage() : prevImage();
    });
}

/* ===============================
   PWA & WEB PUSH NOTIFICATIONS
================================ */
// Helper function for VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Service Worker Registration
if ('serviceWorker' in navigator && 'PushManager' in window) {
    window.addEventListener('load', async () => {
        try {
            const swReg = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker is registered', swReg);

            // Optional: Automatically ask for permission upon login unlock.
            // For now, we listen if the user accepted notifications previously.
            if (Notification.permission === 'granted') {
                subscribeUserToPush(swReg);
            } else if (Notification.permission !== 'denied') {
                // Request permission
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    subscribeUserToPush(swReg);
                }
            }
        } catch (error) {
            console.error('Service Worker Error', error);
        }
    });
}

async function subscribeUserToPush(swRegistration) {
    try {
        // Fetch VAPID public key from backend
        const response = await fetch('/api/vapidPublicKey');
        const vapidData = await response.json();
        const convertedVapidKey = urlBase64ToUint8Array(vapidData.publicKey);

        const pushSubscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });

        // Send subscription to backend
        await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pushSubscription)
        });
        console.log('Push Subscribed successfully.');
    } catch (err) {
        console.error('Failed to subscribe the user: ', err);
    }
}