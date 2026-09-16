/**
 * 2B Bloom: Particle Constellation Canvas
 * Supports Desktop Mouse & Mobile Touch Repulsion
 */
class HeroBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = window.innerWidth < 768 ? 30 : 60;
    this.pointer = { x: null, y: null, radius: 100 };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1.2,
        speedX: (Math.random() - 0.5) * 0.7,
        speedY: (Math.random() - 0.5) * 0.7
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    const updatePointer = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = clientX - rect.left;
      this.pointer.y = clientY - rect.top;
    };

    window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
    window.addEventListener('touchstart', (e) => {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', () => { this.pointer.x = null; this.pointer.y = null; });
    window.addEventListener('mouseout', () => { this.pointer.x = null; this.pointer.y = null; });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;

      // Pointer Repulsion
      if (this.pointer.x !== null && this.pointer.y !== null) {
        const dx = this.pointer.x - p.x;
        const dy = this.pointer.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.pointer.radius) {
          const force = (this.pointer.radius - dist) / this.pointer.radius;
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
        }
      }

      this.ctx.fillStyle = 'rgba(0, 242, 254, 0.7)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw constellation connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 90) {
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - dist / 90)})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

window.HeroBackground = HeroBackground;
