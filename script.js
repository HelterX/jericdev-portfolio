// =============================================
//  NAV — shrink on scroll
// =============================================
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// =============================================
//  SCROLL REVEAL (skip hidden project cards)
// =============================================
const revealEls = document.querySelectorAll(
  '.skill-card, .project-card:not(.project-card--hidden), .about__grid, .contact__inner, .section__title, .section__eyebrow'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.closest('.skills__grid, .projects__grid')
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