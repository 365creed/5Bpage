/**
 * 3B Beam: Cross-Platform Interactive Slider with State Broadcasting
 */
class InteractiveSlider {
  constructor(wrapperId) {
    this.wrapper = document.getElementById(wrapperId);
    if (!this.wrapper) return;

    this.track = document.getElementById('slider-track');
    this.slides = Array.from(this.track.querySelectorAll('.slide-item'));
    this.prevBtn = document.getElementById('btn-slide-prev');
    this.nextBtn = document.getElementById('btn-slide-next');
    this.indicators = document.getElementById('slider-indicators');
    this.progressBar = document.getElementById('slide-progress');

    this.currentIndex = 0;
    this.total = this.slides.length;
    this.interval = 6000;
    this.autoTimer = null;
    this.progressTimer = null;

    this.startX = 0;
    this.diffX = 0;
    this.isDragging = false;
    this.threshold = 45;

    this.init();
  }

  init() {
    this.createIndicators();
    this.bindEvents();
    this.update(0);
    this.startAuto();
  }

  createIndicators() {
    if (!this.indicators) return;
    this.indicators.innerHTML = '';
    this.slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('indicator-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.update(i);
        this.startAuto();
      });
      this.indicators.appendChild(dot);
    });
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prev();
      this.startAuto();
    });
    this.nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.next();
      this.startAuto();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { this.prev(); this.startAuto(); }
      if (e.key === 'ArrowRight') { this.next(); this.startAuto(); }
    });

    // Touch Support
    this.track.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.diffX = 0;
      this.isDragging = true;
      this.stopAuto();
    }, { passive: true });

    this.track.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      this.diffX = e.touches[0].clientX - this.startX;
    }, { passive: true });

    this.track.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (this.diffX < -this.threshold) this.next();
      else if (this.diffX > this.threshold) this.prev();
      this.startAuto();
    });

    // Mouse Drag Support
    this.wrapper.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('.indicator-dot')) return;
      this.startX = e.clientX;
      this.diffX = 0;
      this.isDragging = true;
      this.wrapper.classList.add('grabbing');
      this.stopAuto();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.diffX = e.clientX - this.startX;
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.wrapper.classList.remove('grabbing');
      if (this.diffX < -this.threshold) this.next();
      else if (this.diffX > this.threshold) this.prev();
      this.startAuto();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopAuto();
      else this.startAuto();
    });
  }

  update(index) {
    this.currentIndex = (index + this.total) % this.total;
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    const dots = this.indicators?.querySelectorAll('.indicator-dot');
    dots?.forEach((d, i) => d.classList.toggle('active', i === this.currentIndex));

    const activeSlide = this.slides[this.currentIndex];
    const pitch = parseFloat(activeSlide.getAttribute('data-pitch') || 440);
    const note = activeSlide.getAttribute('data-note') || 'C4';
    const color = activeSlide.getAttribute('data-color') || '#00f2fe';

    // Broadcast state shift to system
    window.dispatchEvent(new CustomEvent('5b:harmonic-shift', {
      detail: { note, freq: pitch, color, source: '3B Beam', slideIndex: this.currentIndex }
    }));

    window.dispatchEvent(new CustomEvent('app:slide-change', {
      detail: { index: this.currentIndex, pitch }
    }));

    this.animateProgressBar();
  }

  next() { this.update(this.currentIndex + 1); }
  prev() { this.update(this.currentIndex - 1); }

  startAuto() {
    this.stopAuto();
    this.animateProgressBar();
    this.autoTimer = setInterval(() => this.next(), this.interval);
  }

  stopAuto() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    if (this.progressTimer) clearInterval(this.progressTimer);
  }

  animateProgressBar() {
    if (!this.progressBar) return;
    this.progressBar.style.width = '0%';
    let elapsed = 0;
    const step = 40;

    if (this.progressTimer) clearInterval(this.progressTimer);
    this.progressTimer = setInterval(() => {
      elapsed += step;
      const pct = Math.min((elapsed / this.interval) * 100, 100);
      this.progressBar.style.width = `${pct}%`;
      if (elapsed >= this.interval) clearInterval(this.progressTimer);
    }, step);
  }
}

window.InteractiveSlider = InteractiveSlider;
