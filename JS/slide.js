/**
 * 3B Beam: Cross-Platform Interactive Slider
 * - Click navigation (Buttons, Dots)
 * - Mouse drag & Mobile touch swipe gesture tracking
 * - Audio frequency broadcasting
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
    this.interval = 5500;
    this.autoTimer = null;
    this.progressTimer = null;

    // Gesture State (Pointer / Mouse / Touch)
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.dragThreshold = 50;

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
      this.isDragging = true;
      this.stopAuto();
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      if (!this.isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const delta = endX - this.startX;
      if (delta < -this.dragThreshold) this.next();
      else if (delta > this.dragThreshold) this.prev();
      this.isDragging = false;
      this.startAuto();
    });

    // Mouse Drag Support
    this.wrapper.addEventListener('mousedown', (e) => {
      // Ignore clicks on buttons/indicators
      if (e.target.closest('button') || e.target.closest('.indicator-dot')) return;
      this.startX = e.clientX;
      this.isDragging = true;
      this.wrapper.classList.add('grabbing');
      this.stopAuto();
    });

    window.addEventListener('mouseup', (e) => {
      if (!this.isDragging) return;
      const delta = e.clientX - this.startX;
      if (delta < -this.dragThreshold) this.next();
      else if (delta > this.dragThreshold) this.prev();
      this.isDragging = false;
      this.wrapper.classList.remove('grabbing');
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

    // Dispatch Audio Frequency for 1B Beat
    const activeSlide = this.slides[this.currentIndex];
    const pitch = parseFloat(activeSlide.getAttribute('data-pitch') || 440);

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
