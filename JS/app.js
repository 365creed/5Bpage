/**
 * Application Entry Point
 * Orchestrates modules and registers Service Worker
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[5Bpage] Initializing Interactive App Architecture...');

  // 1. Initialize Hero Canvas
  new HeroBackground('hero-canvas');

  // 2. Initialize Visual Slider
  new InteractiveSlider('main-slider');

  // 3. Initialize Interactive Puzzle
  new SlidingPuzzle('puzzle-board', 3);

  // 4. Initialize Navigation
  new NavigationMenu();

  // 5. Register Service Worker for Caching & PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully, scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
});
