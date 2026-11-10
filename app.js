// app.js - Master Portfolio Interactivity, Typing Effect, Live Clock & Theme Management
document.addEventListener('DOMContentLoaded', () => {
  // 1. Multi-Theme Switching (White, Beige, Stone, Dark)
  const themePills = document.querySelectorAll('.theme-pill-btn');
  const htmlRoot = document.documentElement;

  let savedTheme = localStorage.getItem('arsh_portfolio_theme');
  if (!savedTheme || savedTheme === 'white' || savedTheme === 'light') {
    savedTheme = 'stone';
  }
  setTheme(savedTheme);

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('arsh_portfolio_theme', theme);
    themePills.forEach(btn => {
      if (btn.getAttribute('data-theme-val') === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  themePills.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.getAttribute('data-theme-val');
      setTheme(targetTheme);
      playTone(targetTheme === 'dark' ? 540 : 740, 'sine', 0.08);
    });
  });

  // 2. Dynamic Typing Effect for Hero Roles
  const typingTextEl = document.getElementById('typing-text');
  const roles = [
    'Electrical Engineering Student',
    'Electronics & VLSI Specialist',
    'Embedded Systems Developer',
    'Hardware Security Enthusiast'
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typeSpeed = 90;

  function typeRoles() {
    if (!typingTextEl) return;
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typingTextEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 45;
    } else {
      typingTextEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      isDeleting = true;
      typeSpeed = 1600; // Pause at end of word
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typeSpeed = 400; // Pause before new word
    }

    setTimeout(typeRoles, typeSpeed);
  }
  typeRoles();

  // 3. Real-Time Indian Standard Time (Agra, India Clock)
  const timeTextEl = document.getElementById('live-time-text');
  function updateAgraTime() {
    if (!timeTextEl) return;
    const now = new Date();
    // Format in IST
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeStr = new Intl.DateTimeFormat('en-IN', options).format(now);
    timeTextEl.textContent = `${timeStr} IST`;
  }
  updateAgraTime();
  setInterval(updateAgraTime, 1000);

  // 4. Project Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
      playTone(620, 'sine', 0.05);
    });
  });

  // 5. Universal Lightbox Zoom for Silicon Layout & Hardware Test Benches
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = lightboxModal ? lightboxModal.querySelector('img') : null;
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  const zoomTriggers = document.querySelectorAll('.zoomable-trigger, #layout-zoom-trigger');
  zoomTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-zoom-src') || (trigger.querySelector('img') ? trigger.querySelector('img').src : 'assets/cordic_layout.jpg');
      const alt = trigger.getAttribute('data-zoom-alt') || (trigger.querySelector('img') ? trigger.querySelector('img').alt : 'Hardware Showcase Zoom');
      const caption = trigger.getAttribute('data-zoom-caption') || alt;

      if (lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = caption;
      }
      if (lightboxModal) {
        lightboxModal.classList.add('open');
      }
      playTone(660, 'sine', 0.08);
    });
  });

  if (lightboxModal) {
    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('open');
      });
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('open');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('open')) {
        lightboxModal.classList.remove('open');
      }
    });
  }

  // 6. Entry Loading Screen Sequence (Graceful check)
  const loader = document.getElementById('loading-screen');
  if (loader) {
    const enterBtn = document.getElementById('enter-btn');
    const loaderProgress = document.getElementById('loader-progress');
    const loaderStatus = document.getElementById('loader-status');

    const diagnostics = [
      'CALIBRATING OSCILLATORS...',
      'SYNTHESIZING VERILOG PIPELINE...',
      'CONFIGURING 32-BIT CORDIC LUT...',
      'MAPPING RESONANCE FREQUENCIES...',
      'HARDWARE SUBSYSTEMS READY'
    ];

    let progress = 0;
    let diagIndex = 0;
    const loadInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 14) + 6;
      if (progress > 100) progress = 100;

      if (loaderProgress) loaderProgress.textContent = `${progress}%`;
      if (loaderStatus && diagIndex < diagnostics.length) {
        loaderStatus.textContent = diagnostics[diagIndex];
        if (progress > (diagIndex + 1) * 20) diagIndex++;
      }

      if (progress >= 100) {
        clearInterval(loadInterval);
        if (enterBtn) {
          enterBtn.classList.remove('hidden');
          enterBtn.classList.add('visible');
        }
      }
    }, 80);

    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        playTone(660, 'sine', 0.15);
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
          document.body.classList.remove('loading-locked');
        }, 600);
      });
    }
  }

  // 7. Web Audio Micro-feedback Synthesizer (Disabled by default)
  let audioEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const audioToggle = document.getElementById('sound-toggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      audioToggle.classList.toggle('muted', !audioEnabled);
      const icon = audioToggle.querySelector('.sound-icon');
      if (icon) {
        icon.textContent = audioEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED';
      }
      if (audioEnabled) playTone(880, 'sine', 0.08);
    });
  }

  // Bind audio to interactive buttons
  document.querySelectorAll('button, a.btn, input[type="range"], .tab-btn, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => playTone(540, 'triangle', 0.03));
    el.addEventListener('click', () => playTone(780, 'sine', 0.06));
  });

  // 8. 3D Perspective Card Tilt & Mouse Spotlight Effect
  const spotlightElements = document.querySelectorAll('.spotlight-card');
  spotlightElements.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Calculate subtle 3D tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * -3.5;
      const tiltY = ((x - centerX) / centerX) * 3.5;
      card.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // 8b. Smooth Interactive Cursor Follower (Desktop only)
  const cursorFollower = document.getElementById('cursor-follower');
  if (cursorFollower && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -100, mouseY = -100;
    let followerX = -100, followerY = -100;
    let isCursorActive = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isCursorActive) {
        isCursorActive = true;
        cursorFollower.classList.add('active');
      }
    });

    window.addEventListener('mouseleave', () => {
      cursorFollower.classList.remove('active');
      isCursorActive = false;
    });

    // Smooth lerp animation loop for the cursor follower
    function renderCursor() {
      if (isCursorActive) {
        followerX += (mouseX - followerX) * 0.18;
        followerY += (mouseY - followerY) * 0.18;
        cursorFollower.style.left = `${followerX.toFixed(1)}px`;
        cursorFollower.style.top = `${followerY.toFixed(1)}px`;
      }
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover state expanding cursor over interactive targets
    const hoverTargets = document.querySelectorAll('a, button, input, .zoomable-trigger, .pole-btn, .filter-btn, .lab-tab-btn, .layout-img-wrap');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovering'));
    });
  }

  // 8c. Staggered Scroll-Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll(
    '.spotlight-card, .project-card-full, .journey-item, .skills-card, .future-card, .honor-card, .stat-item'
  );
  revealElements.forEach(el => el.classList.add('scroll-reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger entrance slightly based on order
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, (idx % 4) * 70);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // 8d. Rolling Number Counter Animation for Stats
  const statNumbers = document.querySelectorAll('.stat-num');
  let countersAnimated = false;

  const statsSection = document.querySelector('.stats-counter-grid');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateStats();
        statsObserver.disconnect();
      }
    }, { threshold: 0.2 });

    statsObserver.observe(statsSection);
  }

  function animateStats() {
    statNumbers.forEach(stat => {
      const targetStr = stat.getAttribute('data-target');
      const targetNum = parseInt(targetStr, 10);
      if (isNaN(targetNum)) return;

      const originalText = stat.textContent.trim();
      const prefix = originalText.startsWith('Top ') ? 'Top ' : '';
      const suffix = originalText.endsWith('+') ? '+' : originalText.endsWith('Prize') ? 'st Prize' : originalText.includes('North') ? 'North Zone' : '';

      let current = 0;
      const duration = 1200;
      const steps = 24;
      const stepTime = duration / steps;
      const increment = targetNum / steps;

      const counterInterval = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
          stat.textContent = originalText;
          clearInterval(counterInterval);
        } else {
          stat.textContent = `${prefix}${Math.floor(current)}${suffix}`;
        }
      }, stepTime);
    });
  }

  // 9. Copy Email with Toast
  const copyBtns = document.querySelectorAll('.copy-email-btn');
  const toast = document.getElementById('toast');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'arshsatsangi0@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email address copied to clipboard');
        playTone(920, 'sine', 0.1);
      });
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 10. Interactive Laboratory Playground Tabs
  const tabBtns = document.querySelectorAll('.lab-tab-btn');
  const labPanels = document.querySelectorAll('.lab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      labPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`lab-${target}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // 11. Navigation Smooth Scroll & Active Spy
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // 12. Mobile Navigation Toggle & Outside Tap Dismissal
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinksContainer.classList.toggle('mobile-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinksContainer.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinksContainer.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
