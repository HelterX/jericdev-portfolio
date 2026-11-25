// =============================================
//  NAV — shrink on scroll
// =============================================
const nav = document.querySelector('.nav');
const progress = document.createElement('div');
progress.className = 'scroll-progress';
document.body.appendChild(progress);

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
}, { passive: true });

// =============================================
//  SCROLL REVEAL (skip hidden project cards)
// =============================================
const revealEls = document.querySelectorAll(
  '.skill-card, .value-card, .service-block, .contact-info-item, .project-card:not(.project-card--hidden), .about__grid, .contact__inner, .section__title, .section__eyebrow'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.closest('.skills__grid, .projects__grid, .value-grid')
        ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
        : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// =============================================
//  ACTIVE NAV LINK on scroll
// =============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--ink)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// =============================================
//  CONTACT FORM — send via Formspree
// =============================================
const sendBtn = document.getElementById('sendBtn');

if (sendBtn) {
  sendBtn.addEventListener('click', async () => {
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
      sendBtn.textContent = 'Please fill all fields ✗';
      sendBtn.style.background = '#c0392b';
      setTimeout(() => {
        sendBtn.textContent = 'Send Message ✦';
        sendBtn.style.background = '';
      }, 2500);
      return;
    }

    sendBtn.textContent = 'Sending...';
    sendBtn.disabled = true;

    try {
      const response = await fetch('https://formspree.io/f/mbdqvkgr', { // 👈 replace with your Formspree URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (response.ok) {
        sendBtn.textContent = 'Message Sent! ✦';
        sendBtn.style.background = 'var(--gold)';
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';
      } else {
        throw new Error('Failed');
      }
    } catch {
      sendBtn.textContent = 'Something went wrong ✗';
      sendBtn.style.background = '#c0392b';
    }

    setTimeout(() => {
      sendBtn.textContent = 'Send Message ✦';
      sendBtn.style.background = '';
      sendBtn.disabled = false;
    }, 3000);
  });
}

// =============================================
//  SMOOTH scroll for all anchor links
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// =============================================
//  MOBILE HAMBURGER MENU
// =============================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// =============================================
//  PROJECT FILTERS
// =============================================
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
        card.classList.add('fade-in');
        card.addEventListener('animationend', () => card.classList.remove('fade-in'), { once: true });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// =============================================
//  PROJECTS TOGGLE
// =============================================
const toggleBtn = document.getElementById('toggleProjects');
const projectsFooter = document.getElementById('projectsFooter');

if (toggleBtn) {
  const hiddenCards = document.querySelectorAll('.project-card--hidden');

  if (hiddenCards.length === 0) {
    projectsFooter.style.display = 'none';
  }

  let expanded = false;

  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;

    hiddenCards.forEach(card => {
      card.style.display = expanded ? 'block' : 'none';
      // Remove reveal/animation classes so they show immediately
      card.classList.remove('reveal');
      card.classList.add('visible');
    });

    toggleBtn.textContent = expanded ? 'Show Less ↑' : 'View All Projects ↓';

    if (!expanded) {
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    }
  });
}
// =============================================
//  PREMIUM INTERACTIONS
// =============================================
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Hero spotlight follows the cursor
const heroEl = document.querySelector('.hero');
if (heroEl && finePointer && !prefersReduced) {
  const spot = document.createElement('div');
  spot.className = 'hero__spot';
  heroEl.prepend(spot);
  heroEl.addEventListener('mousemove', (e) => {
    const r = heroEl.getBoundingClientRect();
    heroEl.style.setProperty('--mx', `${e.clientX - r.left}px`);
    heroEl.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// Cursor-aware light on cards
if (finePointer) {
  document.querySelectorAll('.skill-card, .project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--px', `${e.clientX - r.left}px`);
      card.style.setProperty('--py', `${e.clientY - r.top}px`);
    });
  });
}

// Magnetic buttons
if (finePointer && !prefersReduced) {
  document.querySelectorAll('.btn--primary, .nav__cta').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px, ${y - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// Count-up numbers
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      countObserver.unobserve(el);
      if (prefersReduced) { el.textContent = end; return; }
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => countObserver.observe(c));
}

// Featured (wide) first project card when showing "All"
function updateFeatured() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  const active = document.querySelector('.filter-btn.active');
  const showingAll = !active || active.dataset.filter === 'all';
  grid.querySelectorAll('.project-card').forEach((c) => c.classList.remove('is-featured'));
  if (showingAll) {
    const first = grid.querySelector('.project-card:not(.hidden):not(.project-card--hidden)');
    if (first) first.classList.add('is-featured');
  }
}
updateFeatured();
document.querySelectorAll('.filter-btn').forEach((b) => b.addEventListener('click', updateFeatured));
