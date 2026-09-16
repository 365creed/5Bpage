document.addEventListener('DOMContentLoaded', () => {
  console.log('[5Bpage] Starting application bootstrap...');

  // 1. Hero Canvas
  try {
    if (typeof HeroBackground !== 'undefined') {
      new HeroBackground('hero-canvas');
      console.log('✓ HeroBackground initialized');
    }
  } catch (err) {
    console.error('Failed to init HeroBackground:', err);
  }

  // 2. Slider Module
  try {
    if (typeof InteractiveSlider !== 'undefined') {
      new InteractiveSlider('main-slider');
      console.log('✓ InteractiveSlider initialized');
    }
  } catch (err) {
    console.error('Failed to init InteractiveSlider:', err);
  }

  // 3. Sliding Puzzle Module
  try {
    if (typeof SlidingPuzzle !== 'undefined') {
      new SlidingPuzzle('puzzle-board', 3);
      console.log('✓ SlidingPuzzle initialized');
    }
  } catch (err) {
    console.error('Failed to init SlidingPuzzle:', err);
  }

  // 4. Navigation Menu
  try {
    if (typeof NavigationMenu !== 'undefined') {
      new NavigationMenu();
      console.log('✓ NavigationMenu initialized');
    }
  } catch (err) {
    console.error('Failed to init NavigationMenu:', err);
  }

  // 5. Register Service Worker (GitHub Pages 경로 자동 대응)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js', { scope: './' })
        .then((reg) => {
          console.log('✓ [PWA] Service Worker registered. Scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('! [PWA] Service Worker registration failed:', err);
        });
    });
  }
});
