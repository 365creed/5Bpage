/**
 * Custom Interactive Slider Module
 * - Touch Swipe & Pointer Drag
 * - Keyboard (Arrow keys)
 * - Auto-loop with Page Visibility Pause
 * - Dispatches 'app:slide-change' for audio-visual sync
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
    this.autoPlayInterval = 5000;
    this.timer = null;
    this.progressTimer = null;

    // Drag / Touch State
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;

    this.init();
  }

  init() {
    this.createIndicators();
    this.bindEvents();
    this.updateSlide(0);
    this.startAutoPlay();
  }

  createIndicators() {
    if (!this.indicatorsContainer) return;
    this.indicatorsContainer.innerHTML = '';
    this.slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('indicator-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        this.goToSlide(idx);
        this.resetAutoPlay();
      });
      this.indicatorsContainer.appendChild(dot);
    });
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => {
      this.prevSlide();
      this.resetAutoPlay();
    });
    this.nextBtn?.addEventListener('click', () => {
      this.nextSlide();
      this.resetAutoPlay();
    });

    // Keyboard Arrow Control
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
        this.resetAutoPlay();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
        this.resetAutoPlay();
      }
    });

    // Touch & Pointer Drag Events
    this.track.addEventListener('touchstart', (e) => this.dragStart(e.touches[0].clientX), { passive: true });
    this.track.addEventListener('touchmove', (e) => this.dragMove(e.touches[0].clientX), { passive: true });
    this.track.addEventListener('touchend', () => this.dragEnd());

    this.track.addEventListener('mousedown', (e) => {
      this.dragStart(e.clientX);
      this.track.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => this.dragMove(e.clientX));
    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.dragEnd();
        this.track.style.cursor = 'grab';
      }
    });

    // Pause on Tab blur
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoPlay();
      } else {
        this.startAutoPlay();
      }
    });
  }

  dragStart(x) {
    this.isDragging = true;
    this.startX = x;
    this.stopAutoPlay();
  }

  dragMove(x) {
    if (!this.isDragging) return;
    const diff = x - this.startX;
    this.currentTranslate = this.prevTranslate + diff;
  }

  dragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -60) {
      this.nextSlide();
    } else if (movedBy > 60) {
      this.prevSlide();
    } else {
      this.updateSlide(this.currentIndex);
    }
    this.startAutoPlay();
  }

  updateSlide(index) {
    this.currentIndex = (index + this.totalSlides) % this.totalSlides;
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;
    this.prevTranslate = (offset / 100) * this.wrapper.clientWidth;

    // Update Indicators
    const dots = this.indicatorsContainer?.querySelectorAll('.indicator-dot');
    dots?.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentIndex);
    });

    // Dispatch Audio Sync Event with target slide pitch
    const activeSlide = this.slides[this.currentIndex];
    const pitch = parseFloat(activeSlide.getAttribute('data-sound-pitch') || 440);

    window.dispatchEvent(new CustomEvent('app:slide-change', {
      detail: { index: this.currentIndex, pitch }
    }));

    this.resetProgressBar();
  }

  goToSlide(idx) { this.updateSlide(idx); }
  nextSlide() { this.updateSlide(this.currentIndex + 1); }
  prevSlide() { this.updateSlide(this.currentIndex - 1); }

  startAutoPlay() {
    this.stopAutoPlay();
    this.resetProgressBar();
    this.timer = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.timer) clearInterval(this.timer);
    if (this.progressTimer) clearInterval(this.progressTimer);
  }

  resetAutoPlay() {
    this.startAutoPlay();
  }

  resetProgressBar() {
    if (!this.progressBar) return;
    this.progressBar.style.width = '0%';
    let elapsed = 0;
    const step = 50;

    if (this.progressTimer) clearInterval(this.progressTimer);
    this.progressTimer = setInterval(() => {
      elapsed += step;
      const pct = Math.min((elapsed / this.autoPlayInterval) * 100, 100);
      this.progressBar.style.width = `${pct}%`;
      if (elapsed >= this.autoPlayInterval) {
        clearInterval(this.progressTimer);
      }
    }, step);
  }
}

window.InteractiveSlider = InteractiveSlider;
