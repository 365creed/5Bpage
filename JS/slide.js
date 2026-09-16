/**
 * 5B Interactive Slider Module
 * - Supports 5B Storytelling across 5 distinct slides
 * - Touch Swipe (passive listeners) & Smooth Drag
 * - Real-time frequency dispatching for Web Audio synthesis
 */
class InteractiveSlider {
  constructor(sliderWrapperId) {
    this.wrapper = document.getElementById(sliderWrapperId);
    if (!this.wrapper) return;

    this.track = document.getElementById('slider-track');
    this.slides = Array.from(this.track.querySelectorAll('.slide-item'));
    this.prevBtn = document.getElementById('btn-slide-prev');
    this.nextBtn = document.getElementById('btn-slide-next');
    this.indicatorsContainer = document.getElementById('slider-indicators');
    this.progressBar = document.getElementById('slide-progress');

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = 5500;
    this.timer = null;
    this.progressTimer = null;

    this.startX = 0;
    this.isDragging = false;
    this.dragThreshold = 45;

    this.init();
  }

  init() {
    this.buildIndicators();
    this.bindEvents();
    this.updateSlide(0);
    this.startAutoPlay();
  }

  buildIndicators() {
    if (!this.indicatorsContainer) return;
    this.indicatorsContainer.innerHTML = '';
    this.slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('indicator-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        this.updateSlide(idx);
        this.restartAutoPlay();
      });
      this.indicatorsContainer.appendChild(dot);
    });
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => {
      this.prev();
      this.restartAutoPlay();
    });
    this.nextBtn?.addEventListener('click', () => {
      this.next();
      this.restartAutoPlay();
    });

    // Touch Swipe Event Binding
    this.track.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.isDragging = true;
      this.stopAutoPlay();
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      if (!this.isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - this.startX;

      if (deltaX < -this.dragThreshold) {
        this.next();
      } else if (deltaX > this.dragThreshold) {
        this.prev();
      }
      this.isDragging = false;
      this.startAutoPlay();
    }, { passive: true });
  }

  updateSlide(index) {
    this.currentIndex = (index + this.totalSlides) % this.totalSlides;
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    // Indicators Update
    const dots = this.indicatorsContainer?.querySelectorAll('.indicator-dot');
    dots?.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });

    // Audio Sync Dispatch
    const activeSlide = this.slides[this.currentIndex];
    const pitch = parseFloat(activeSlide.getAttribute('data-sound-pitch') || 440);

    window.dispatchEvent(new CustomEvent('app:slide-change', {
      detail: { index: this.currentIndex, pitch }
    }));

    this.resetProgress();
  }

  next() { this.updateSlide(this.currentIndex + 1); }
  prev() { this.updateSlide(this.currentIndex - 1); }

  startAutoPlay() {
    this.stopAutoPlay();
    this.resetProgress();
    this.timer = setInterval(() => this.next(), this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.timer) clearInterval(this.timer);
    if (this.progressTimer) clearInterval(this.progressTimer);
  }

  restartAutoPlay() {
    this.startAutoPlay();
  }

  resetProgress() {
    if (!this.progressBar) return;
    this.progressBar.style.width = '0%';
    let elapsed = 0;
    const step = 50;

    if (this.progressTimer) clearInterval(this.progressTimer);
    this.progressTimer = setInterval(() => {
      elapsed += step;
      const percent = Math.min((elapsed / this.autoPlayInterval) * 100, 100);
      this.progressBar.style.width = `${percent}%`;
      if (elapsed >= this.autoPlayInterval) {
        clearInterval(this.progressTimer);
      }
    }, step);
  }
}

window.InteractiveSlider = InteractiveSlider;
