/**
 * 2B Breeze: High-DPI Kinetic Particle Canvas
 */
class HeroBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = window.innerWidth < 768 ? 36 : 68;
    this.pointer = { x: null, y: null, radius: 120 };

    this.init();
  }

  init() {
    this.resize();
    this.create();
    this.bind();
    this.loop();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  create() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        size: Math.random() * 2 + 1
      });
    }
  }

  bind() {
    window.addEventListener('resize', () => {
      this.resize();
      this.create();
    });

    const updatePointer = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = clientX - rect.left;
      this.pointer.y = clientY - rect.top;
    };

    window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseout', () => { this.pointer.x = null; });
    window.addEventListener('touchend', () => { this.pointer.x = null; });
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      if (this.pointer.x !== null) {
        const dx = this.pointer.x - p.x;
        const dy = this.pointer.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.pointer.radius) {
          const force = (this.pointer.radius - dist) / this.pointer.radius;
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
        }
      }

      this.ctx.fillStyle = 'rgba(0, 242, 254, 0.65)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 95) {
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 95)})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.loop());
  }
}

window.HeroBackground = HeroBackground;
