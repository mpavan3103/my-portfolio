/* ===================================================================
   PORTFOLIO — JavaScript
   Scroll reveals, navbar, mobile menu, active tracking, footer year.
   =================================================================== */

(function () {
  'use strict';

  /* ---- DOM refs ---- */
  const navbar     = document.getElementById('navbar');
  const navToggle  = document.getElementById('navToggle');
  const navLinks   = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  const yearSpan   = document.getElementById('currentYear');
  const allLinks   = navLinks ? navLinks.querySelectorAll('a') : [];
  const sections   = document.querySelectorAll('section[id]');

  /* ---- Footer year ---- */
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* ---- Navbar scroll state ---- */
  function onScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  function openMenu() {
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';       // prevent background scroll
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close on link click
    allLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Close on overlay click
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* ---- Active nav tracking ---- */
  function setActiveLink(id) {
    allLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { root: null, rootMargin: '-35% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach(s => { if (s.id) sectionObserver.observe(s); });

  /* ---- Scroll-reveal ---- */
  const reveals = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    reveals.forEach(el => el.classList.add('visible'));
  } else {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.12 }
    );
    reveals.forEach(el => revealObs.observe(el));
  }

  /* ---- Smooth scroll (anchor links) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', href);
      }
    });
  });

})();
