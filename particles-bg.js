// particles-bg.js - Precision Circuit Particle Mesh with Multi-Theme Support
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let signalPulses = [];
  let mouse = { x: null, y: null, radius: 180 };
  let lastSpawn = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }

  function getThemeColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'white';
    if (theme === 'dark') {
      return {
        grid: 'rgba(255, 255, 255, 0.025)',
        particle: 'rgba(56, 189, 248, ALPHA)',
        pulse: 'rgba(56, 189, 248, ALPHA)',
        lineAlpha: 0.16
      };
    } else if (theme === 'beige') {
      return {
        grid: 'rgba(130, 100, 70, 0.045)',
        particle: 'rgba(143, 61, 0, ALPHA)',
        pulse: 'rgba(143, 61, 0, ALPHA)',
        lineAlpha: 0.22
      };
    } else if (theme === 'stone') {
      return {
        grid: 'rgba(100, 90, 80, 0.04)',
        particle: 'rgba(3, 105, 161, ALPHA)',
        pulse: 'rgba(143, 61, 0, ALPHA)',
        lineAlpha: 0.20
      };
    } else {
      // Pure White / Light
      return {
        grid: 'rgba(15, 23, 42, 0.035)',
        particle: 'rgba(0, 102, 204, ALPHA)',
        pulse: 'rgba(0, 102, 204, ALPHA)',
        lineAlpha: 0.20
      };
    }
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.baseRadius = Math.random() * 1.6 + 1.2;
      this.radius = this.baseRadius;
      this.alpha = Math.random() * 0.35 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.neighbors = [];
    }

    update(time) {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2.5;
          this.y -= (dy / dist) * force * 2.5;
        }
      }

      this.currentAlpha = this.alpha + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.12;
    }

    draw(ctx, colors) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.particle.replace('ALPHA', `${Math.max(0.12, this.currentAlpha)}`);
      ctx.fill();
    }
  }

  // Signal Pulse traveling between connected particles
  class SignalPulse {
    constructor(p1, p2, color) {
      this.p1 = p1;
      this.p2 = p2;
      this.t = 0;
      this.speed = Math.random() * 0.025 + 0.018;
      this.color = color;
      this.radius = Math.random() * 1.5 + 1.8;
      this.alive = true;
    }

    update() {
      this.t += this.speed;
      if (this.t >= 1) {
        this.alive = false;
        if (Math.random() < 0.4 && this.p2.neighbors && this.p2.neighbors.length > 0) {
          const nextTarget = this.p2.neighbors[Math.floor(Math.random() * this.p2.neighbors.length)];
          if (nextTarget !== this.p1) {
            signalPulses.push(new SignalPulse(this.p2, nextTarget, this.color));
          }
        }
      }
    }

    draw(ctx) {
      if (!this.alive) return;
      const x = this.p1.x + (this.p2.x - this.p1.x) * this.t;
      const y = this.p1.y + (this.p2.y - this.p1.y) * this.t;

      // Glow halo
      ctx.beginPath();
      ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace('ALPHA', '0.22');
      ctx.fill();

      // Sharp core
      ctx.beginPath();
      ctx.arc(x, y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace('ALPHA', '0.9');
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    signalPulses = [];
    const count = Math.min(Math.floor((width * height) / 12000), 90);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function updateNeighborsAndConnect(ctx, colors, now) {
    const maxDist = 130;

    for (let i = 0; i < particles.length; i++) {
      particles[i].neighbors = [];
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          particles[i].neighbors.push(particles[j]);
          particles[j].neighbors.push(particles[i]);

          const alpha = (1 - dist / maxDist) * colors.lineAlpha;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = colors.particle.replace('ALPHA', `${alpha.toFixed(3)}`);
          ctx.lineWidth = 0.85;
          ctx.stroke();

          // Spontaneously launch electric pulses
          if (now - lastSpawn > 180 && signalPulses.length < 24 && Math.random() < 0.04) {
            signalPulses.push(new SignalPulse(particles[i], particles[j], colors.pulse));
            lastSpawn = now;
          }
        }
      }
    }
  }

  function animate(time = 0) {
    ctx.clearRect(0, 0, width, height);

    const colors = getThemeColors();

    // Engineering grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    const gridSize = 70;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Connect particles and spawn pulses
    updateNeighborsAndConnect(ctx, colors, time);

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(time * 0.05);
      particles[i].draw(ctx, colors);
    }

    // Update & draw signal pulses
    for (let i = signalPulses.length - 1; i >= 0; i--) {
      signalPulses[i].update();
      signalPulses[i].draw(ctx);
      if (!signalPulses[i].alive) {
        signalPulses.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  // Mouse interaction: spawn burst of pulses on mousemove
  let lastMove = 0;
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const now = performance.now();
    if (now - lastMove > 100 && signalPulses.length < 30) {
      lastMove = now;
      const colors = getThemeColors();

      // Find particle closest to mouse
      for (let i = 0; i < particles.length; i++) {
        const d = Math.hypot(particles[i].x - e.clientX, particles[i].y - e.clientY);
        if (d < 100 && particles[i].neighbors.length > 0) {
          const target = particles[i].neighbors[Math.floor(Math.random() * particles[i].neighbors.length)];
          signalPulses.push(new SignalPulse(particles[i], target, colors.pulse));
          break;
        }
      }
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);

  resize();
  animate();
})();
