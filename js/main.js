// Page transition — spinning ship's wheel
const pageTransition = document.createElement("div");
pageTransition.className = "page-transition";
pageTransition.innerHTML = `
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <g fill="none" stroke="#e8a33d" stroke-width="5" stroke-linecap="round">
      <circle cx="50" cy="50" r="27" />
      <line x1="50" y1="50" x2="94" y2="50" />
      <line x1="50" y1="50" x2="81.1" y2="81.1" />
      <line x1="50" y1="50" x2="50" y2="94" />
      <line x1="50" y1="50" x2="18.9" y2="81.1" />
      <line x1="50" y1="50" x2="6" y2="50" />
      <line x1="50" y1="50" x2="18.9" y2="18.9" />
      <line x1="50" y1="50" x2="50" y2="6" />
      <line x1="50" y1="50" x2="81.1" y2="18.9" />
    </g>
    <circle cx="50" cy="50" r="9" fill="#e8a33d" />
  </svg>
  <span>Setting sail&hellip;</span>`;
document.body.appendChild(pageTransition);

function hidePageTransition() {
  setTimeout(() => pageTransition.classList.add("hidden"), 500);
}

hidePageTransition();

// Also hide when returning via the browser back button (bfcache)
window.addEventListener("pageshow", (e) => {
  if (e.persisted) hidePageTransition();
});

// Show the spinning wheel before navigating to another page of the site
document.querySelectorAll("a[href]").forEach((link) => {
  const href = link.getAttribute("href");
  const external =
    !href ||
    href.startsWith("#") ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");
  if (external) return;

  link.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || link.target === "_blank") return;

    // Let mobile dropdown toggles open the submenu instead of navigating
    const isDropdownToggle =
      link.parentElement?.classList.contains("has-dropdown") &&
      window.innerWidth <= 720;
    if (isDropdownToggle) return;

    e.preventDefault();
    pageTransition.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = href;
    }, 700);
  });
});

// Mobile navigation toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const expanded = navLinks.classList.contains("open");
    navToggle.setAttribute("aria-expanded", expanded);
  });
}

// Dropdown menus (click on mobile, hover on desktop)
document.querySelectorAll(".has-dropdown").forEach((item) => {
  const trigger = item.querySelector(":scope > a");
  if (!trigger) return;

  trigger.addEventListener("click", (e) => {
    if (window.innerWidth > 720) return;
    e.preventDefault();
    item.classList.toggle("open");
  });
});

// Scroll reveal animation
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((el) => observer.observe(el));

// Hero carousel
const heroSlides = document.querySelectorAll(".hero-slide");

if (heroSlides.length) {
  const dotsWrap = document.querySelector(".hero-dots");
  const captionEl = document.querySelector(".hero-caption");
  const prevBtn = document.querySelector(".hero-arrow.prev");
  const nextBtn = document.querySelector(".hero-arrow.next");
  let current = 0;
  let autoTimer;

  heroSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", "Go to slide " + (i + 1));
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      goTo(i);
      restartAuto();
    });
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll("button");

  function goTo(index) {
    heroSlides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (index + heroSlides.length) % heroSlides.length;
    heroSlides[current].classList.add("active");
    dots[current].classList.add("active");
    if (captionEl) captionEl.textContent = heroSlides[current].dataset.caption || "";
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener("click", () => {
    goTo(current - 1);
    restartAuto();
  });

  nextBtn.addEventListener("click", () => {
    goTo(current + 1);
    restartAuto();
  });

  restartAuto();
}

// Menu flipbook
const flipbook = document.querySelector(".flipbook");

if (flipbook) {
  const sheets = Array.from(flipbook.querySelectorAll(".sheet"));
  const total = sheets.length;
  const prevPage = document.querySelector(".flip-prev");
  const nextPage = document.querySelector(".flip-next");
  const indicator = document.querySelector(".flip-indicator");
  const spreadLabels = [
    "Cover",
    "Starters & Mains",
    "Desserts & Bar",
    "Bon Voyage"
  ];
  let flipped = 0;

  function restingZ(index) {
    // Flipped sheets stack left (later flips on top); unflipped stack right
    return index < flipped ? index + 1 : total - index + 1;
  }

  function updateBook(turningIndex) {
    sheets.forEach((sheet, i) => {
      sheet.classList.toggle("flipped", i < flipped);
      sheet.style.zIndex = restingZ(i);
    });

    // Keep the turning sheet above everything while it animates
    if (turningIndex !== undefined) {
      const sheet = sheets[turningIndex];
      sheet.style.zIndex = total + 2;
      sheet.addEventListener(
        "transitionend",
        () => {
          sheet.style.zIndex = restingZ(turningIndex);
        },
        { once: true }
      );
    }

    prevPage.disabled = flipped === 0;
    nextPage.disabled = flipped === total;
    indicator.textContent = spreadLabels[flipped] || "Page " + flipped;
  }

  function turnForward() {
    if (flipped >= total) return;
    const turning = flipped;
    flipped++;
    updateBook(turning);
  }

  function turnBack() {
    if (flipped <= 0) return;
    flipped--;
    updateBook(flipped);
  }

  nextPage.addEventListener("click", turnForward);
  prevPage.addEventListener("click", turnBack);

  // Clicking a right-hand page turns forward; a left-hand page turns back
  sheets.forEach((sheet, i) => {
    sheet.addEventListener("click", () => {
      if (window.innerWidth <= 760) return;
      if (i < flipped) {
        turnBack();
      } else {
        turnForward();
      }
    });
  });

  updateBook();
}

// Demo form handling (template only — no backend)
document.querySelectorAll("form[data-demo]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Ahoy! This is a template demo — connect your own backend to receive bookings.");
    form.reset();
  });
});
