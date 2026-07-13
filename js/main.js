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
