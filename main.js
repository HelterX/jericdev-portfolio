// =============================================
//  NAV — shrink on scroll
// =============================================
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// =============================================
//  SCROLL REVEAL
// =============================================
const revealEls = document.querySelectorAll(
  '.skill-card, .project-card, .about__grid, .contact__inner, .section__title, .section__eyebrow'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger cards in grids
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
//  CONTACT FORM — simple feedback
// =============================================
const formInputs = document.querySelectorAll('.form__input');
const sendBtn = document.querySelector('.contact .btn--primary');

if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    const filled = [...formInputs].every(input => input.value.trim() !== '');
    if (!filled) {
      sendBtn.textContent = 'Please fill all fields ✗';
      sendBtn.style.background = '#c0392b';
      setTimeout(() => {
        sendBtn.textContent = 'Send Message ✦';
        sendBtn.style.background = '';
      }, 2500);
      return;
    }
    sendBtn.textContent = 'Message Sent! ✦';
    sendBtn.style.background = 'var(--gold)';
    formInputs.forEach(input => input.value = '');
    setTimeout(() => {
      sendBtn.textContent = 'Send Message ✦';
      sendBtn.style.background = '';
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