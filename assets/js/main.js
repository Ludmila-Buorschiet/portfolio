// DEBUG: tecla G liga/desliga contornos + grade de colunas
document.addEventListener('keydown', (e) => {
  if ((e.key === 'g' || e.key === 'G') && !e.target.matches('input, textarea')) {
    document.body.classList.toggle('debug-grid');
  }
});

// NAV scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile nav
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

hamburger?.addEventListener('click', () => mobileNav?.classList.add('open'));
mobileClose?.addEventListener('click', () => mobileNav?.classList.remove('open'));

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileNav.classList.remove('open'));
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

// Hero elements visible immediately
document.querySelectorAll('#hero .reveal, .hero-label, .hero-title, .hero-sub, .hero-scroll').forEach(el => {
  el.classList.add('visible');
});

// Rotating words
const words = ['branding', 'site', 'campanha', 'editorial', 'identidade'];
let wi = 0;
const rword = document.getElementById('rword');
if (rword) {
  setInterval(() => {
    wi = (wi + 1) % words.length;
    rword.style.animation = 'none';
    rword.offsetHeight;
    rword.textContent = words[wi];
    rword.style.animation = 'wordSlide 9s cubic-bezier(.76,0,.24,1) infinite';
  }, 3000);
}

// Magnetic button
const magBtn = document.getElementById('magBtn');
const magWrap = magBtn?.closest('.mag-wrap');
if (magWrap) {
  magWrap.addEventListener('mousemove', (e) => {
    const r = magBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    magBtn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  magWrap.addEventListener('mouseleave', () => {
    magBtn.style.transform = 'translate(0,0)';
  });
}
