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
      { root: null, rootMargin: '0px 0px 80px 0px', threshold: 0.02 }
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

  /* ===================================================================
     INTERACTIVE 3D PARTICLE GALAXY HERO
     Procedural spiral galaxy · 3D perspective projection · Cursor physics
     Inspired by OpenAI Astra celestial aesthetic
     =================================================================== */
  function initGalaxy() {
    const canvas = document.getElementById('galaxyCanvas');
    const heroSection = document.getElementById('hero');
    if (!canvas || !heroSection) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let animId = null;

    // Mouse / Cursor state
    const mouse = {
      x: -9999,
      y: -9999,
      targetTiltX: 0,
      targetTiltY: 0,
      tiltX: 0,
      tiltY: 0,
      isHovering: false
    };

    // Galaxy parameters
    const ARMS = 4;
    const GALAXY_INCLINATION = 0.88; // ~50 degrees 3D disk inclination
    const ROTATION_SPEED = 0.0015;  // smooth cinematic rotation
    let galaxyRotation = 0;

    function resize() {
      const rect = heroSection.getBoundingClientRect();
      width = Math.max(rect.width || heroSection.clientWidth || window.innerWidth, 320);
      height = Math.max(rect.height || heroSection.clientHeight || window.innerHeight, 400);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
      renderFrame();
    }

    // Color palettes: RGB tuples for high-performance direct rendering
    const COLOR_PALETTES = {
      white: [255, 255, 255],
      cyan:  [125, 211, 252], // Icy celestial blue / cyan
      blue:  [56, 189, 248],  // Diamond blue
      red:   [230, 57, 70],   // Darkfolio signature crimson
      glowRed: [255, 77, 90]
    };

    function initParticles() {
      const isMobile = width < 768;
      const count = isMobile ? 1200 : 2800;
      particles = [];

      // Maximum galaxy radius scaled to span across the entire hero viewport
      const maxRadius = Math.max(width, height) * (isMobile ? 0.78 : 0.72);

      for (let i = 0; i < count; i++) {
        const randType = Math.random();
        let r, theta, color, size, z, alpha, isBright;

        if (randType < 0.20) {
          // Core: concentrated high-density galactic nucleus
          const coreFrac = Math.pow(Math.random(), 2.0);
          r = coreFrac * maxRadius * 0.22;
          theta = Math.random() * Math.PI * 2;
          z = (Math.random() - 0.5) * (maxRadius * 0.14) * (1 - r / (maxRadius * 0.22));
          size = 0.9 + Math.random() * 2.2;
          alpha = 0.65 + Math.random() * 0.35;
          color = Math.random() < 0.55 ? 'white' : (Math.random() < 0.85 ? 'cyan' : 'red');
          isBright = Math.random() < 0.35;
        } else if (randType < 0.92) {
          // 4 Spiral Arms
          const armIndex = i % ARMS;
          const armBaseAngle = (armIndex * (Math.PI * 2)) / ARMS;

          // Radial distribution along arm (clustering towards mid-arm)
          const armDist = 0.10 + 0.90 * Math.pow(Math.random(), 1.25);
          r = armDist * maxRadius;

          // Logarithmic spiral curve
          const curl = 3.2 * Math.pow(r / maxRadius, 0.82);
          // Perpendicular dispersion increases with distance
          const spread = (Math.random() - 0.5) * 0.44 * (r / maxRadius);
          theta = armBaseAngle + curl + spread;

          // Disk thickness
          const thickness = maxRadius * 0.09 * (1 - (r / maxRadius) * 0.5);
          z = (Math.random() - 0.5) * thickness;

          size = 0.8 + Math.random() * 1.9;
          alpha = 0.40 + Math.random() * 0.55;

          const colRand = Math.random();
          if (colRand < 0.22) {
            color = Math.random() < 0.5 ? 'red' : 'glowRed';
            size *= 1.2;
          } else if (colRand < 0.58) {
            color = Math.random() < 0.5 ? 'cyan' : 'blue';
          } else {
            color = 'white';
          }
          isBright = Math.random() < 0.20;
        } else {
          // Outer halo & ambient cosmic field
          r = maxRadius * (0.45 + Math.random() * 0.65);
          theta = Math.random() * Math.PI * 2;
          z = (Math.random() - 0.5) * maxRadius * 0.30;
          size = 0.6 + Math.random() * 1.4;
          alpha = 0.20 + Math.random() * 0.40;
          color = Math.random() < 0.35 ? 'red' : 'cyan';
          isBright = false;
        }

        particles.push({
          r,
          theta,
          baseZ: z,
          size,
          baseAlpha: alpha,
          color,
          isBright,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.05,
          // Real-time cursor repulsion offset & velocity
          dx: 0,
          dy: 0,
          vx: 0,
          vy: 0
        });
      }
    }

    // Cursor tracking with coordinates relative to the hero section
    function updatePointer(clientX, clientY) {
      const rect = heroSection.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      mouse.x = localX;
      mouse.y = localY;
      mouse.isHovering = (localX >= -50 && localX <= width + 50 && localY >= -50 && localY <= height + 50);

      // Parallax 3D tilt target based on normalized cursor position
      const nx = (localX / width) - 0.5;
      const ny = (localY / height) - 0.5;
      mouse.targetTiltX = -ny * 0.28;
      mouse.targetTiltY = nx * 0.32;
    }

    window.addEventListener('mousemove', (e) => {
      updatePointer(e.clientX, e.clientY);
    }, { passive: true });

    heroSection.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    heroSection.addEventListener('touchend', () => {
      mouse.isHovering = false;
      mouse.targetTiltX = 0;
      mouse.targetTiltY = 0;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.isHovering = false;
      mouse.targetTiltX = 0;
      mouse.targetTiltY = 0;
    });

    function renderFrame() {
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for 3D parallax tilt
      mouse.tiltX += (mouse.targetTiltX - mouse.tiltX) * 0.05;
      mouse.tiltY += (mouse.targetTiltY - mouse.tiltY) * 0.05;

      galaxyRotation += ROTATION_SPEED;

      // Center galaxy so arms gracefully sweep across hero content & portrait
      const isMobile = width < 768;
      const cx = width * (isMobile ? 0.50 : 0.54);
      const cy = height * (isMobile ? 0.44 : 0.48);
      const focalLength = 700;
      const repulsionRadius = isMobile ? 130 : 180;

      // 3D rotation angles
      const rotX = GALAXY_INCLINATION + mouse.tiltX;
      const rotY = mouse.tiltY;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      // 1. Draw glowing celestial core gradient
      const coreR = Math.min(width, height) * (isMobile ? 0.38 : 0.32);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      coreGrad.addColorStop(0.20, 'rgba(103, 232, 249, 0.16)');
      coreGrad.addColorStop(0.48, 'rgba(230, 57, 70, 0.08)');
      coreGrad.addColorStop(0.80, 'rgba(20, 10, 15, 0.03)');
      coreGrad.addColorStop(1, 'rgba(10, 10, 10, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render each particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Orbital rotation
        const currentAngle = p.theta + galaxyRotation;
        const gx = Math.cos(currentAngle) * p.r;
        const gy = Math.sin(currentAngle) * p.r;
        const gz = p.baseZ;

        // 3D Pitch and Yaw transformation
        const x1 = gx * cosY - gz * sinY;
        const z1 = gx * sinY + gz * cosY;
        const y2 = gy * cosX - z1 * sinX;
        const z2 = gy * sinX + z1 * cosX;

        // Perspective projection
        const scale = focalLength / (focalLength + z2);
        const baseProjX = cx + x1 * scale;
        const baseProjY = cy + y2 * scale;

        // Cursor interaction calculated in screen space
        if (mouse.isHovering) {
          const curX = baseProjX + p.dx;
          const curY = baseProjY + p.dy;
          const distMouse = Math.hypot(curX - mouse.x, curY - mouse.y);

          if (distMouse < repulsionRadius) {
            const factor = Math.pow(1 - distMouse / repulsionRadius, 1.6);
            const angleM = Math.atan2(curY - mouse.y, curX - mouse.x);
            const push = factor * 7.5;
            const swirl = factor * 3.2;

            p.vx += Math.cos(angleM) * push - Math.sin(angleM) * swirl;
            p.vy += Math.sin(angleM) * push + Math.cos(angleM) * swirl;
          }
        }

        // Damped harmonic restoration back to orbital position
        p.vx *= 0.89;
        p.vy *= 0.89;
        p.dx = (p.dx + p.vx) * 0.93;
        p.dy = (p.dy + p.vy) * 0.93;

        const screenX = baseProjX + p.dx;
        const screenY = baseProjY + p.dy;

        // Viewport cull with margin
        if (screenX < -30 || screenX > width + 30 || screenY < -30 || screenY > height + 30) {
          continue;
        }

        // Depth shading & shimmering twinkle
        p.twinklePhase += p.twinkleSpeed;
        const depthAlpha = Math.max(0.2, Math.min(1.2, scale * 1.15));
        const twinkle = 0.78 + 0.22 * Math.sin(p.twinklePhase);
        const finalAlpha = Math.min(1, Math.max(0.08, p.baseAlpha * depthAlpha * twinkle));
        const finalSize = Math.max(0.6, p.size * scale);

        const rgb = COLOR_PALETTES[p.color] || COLOR_PALETTES.white;

        // Render soft glow halo for bright stars
        if (p.isBright && finalSize > 1.4) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, finalSize * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(finalAlpha * 0.25).toFixed(2)})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${finalAlpha.toFixed(2)})`;
        ctx.fill();
      }
    }

    function animate() {
      // Pause drawing only when deeply scrolled away from hero to preserve performance
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      if (window.scrollY < heroBottom + 100) {
        renderFrame();
      }
      animId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      clearTimeout(window._galaxyResizeTimer);
      window._galaxyResizeTimer = setTimeout(resize, 120);
    });

    // Immediate initial layout & render
    resize();
    animId = requestAnimationFrame(animate);
  }

  // Initialize interactive particle galaxy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGalaxy();
      initCertModal();
      initCurriculumScroll();
      initVideoPlaceholders();
    });
  } else {
    initGalaxy();
    initCertModal();
    initCurriculumScroll();
    initVideoPlaceholders();
  }

  /* ===================================================================
     CERTIFICATE LIGHTBOX MODAL
     Interactive enlarged preview for graVITas participation certificates
     =================================================================== */
  function initCertModal() {
    const modal = document.getElementById('certModal');
    if (!modal) return;

    const modalImg = document.getElementById('certModalImg');
    const modalTitle = document.getElementById('certModalTitle');
    const modalClose = document.getElementById('certModalClose');
    const modalBackdrop = modal.querySelector('.cert-modal-backdrop');
    const certCards = document.querySelectorAll('.cert-card[data-cert-src]');

    function openModal(card) {
      const src = card.getAttribute('data-cert-src');
      const title = card.getAttribute('data-cert-title') || 'Certificate of Participation';
      const alt = card.getAttribute('data-cert-alt') || title;

      if (modalImg) {
        modalImg.src = src;
        modalImg.alt = alt;
      }
      if (modalTitle) {
        modalTitle.textContent = title;
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (modalClose) modalClose.focus();
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    certCards.forEach(card => {
      card.addEventListener('click', () => openModal(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /* ===================================================================
     CURRICULUM PILLS ACTIVE TRACKING & SMOOTH HORIZONTAL SCROLL
     =================================================================== */
  function initCurriculumScroll() {
    const pills = document.querySelectorAll('.curriculum-pill');
    if (!pills.length) return;

    const targets = Array.from(pills).map(p => {
      const href = p.getAttribute('href');
      return href ? document.querySelector(href) : null;
    }).filter(Boolean);

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 140;
      let currentTargetId = '';

      for (let i = targets.length - 1; i >= 0; i--) {
        if (targets[i].offsetTop <= scrollPos) {
          currentTargetId = targets[i].id;
          break;
        }
      }

      pills.forEach(pill => {
        const matches = pill.getAttribute('href') === '#' + currentTargetId;
        pill.classList.toggle('active', matches);
      });
    }, { passive: true });
  }

  /* ===================================================================
     VIDEO PLAYER INTERACTION & AUDIO COORDINATION
     =================================================================== */
  function initVideoPlaceholders() {
    const introVideo = document.getElementById('introVideo');
    if (introVideo) {
      // Pause speech synthesis when video starts playing
      introVideo.addEventListener('play', function () {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          const heroVoiceBtn = document.getElementById('heroVoiceBtn');
          if (heroVoiceBtn) {
            heroVoiceBtn.classList.remove('playing', 'paused');
            const label = heroVoiceBtn.querySelector('.audio-btn-text');
            if (label) label.textContent = 'Listen to Intro';
          }
        }
      });
    }

    const playBtns = document.querySelectorAll('.video-play-btn');
    playBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const details = this.closest('.about-video-card, .video-card-container')?.querySelector('.video-talking-points');
        if (details) {
          details.open = true;
          details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

})();
