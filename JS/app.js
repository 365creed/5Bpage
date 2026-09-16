/**
 * Application Bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[5Bpage] Bootstrapping 5 Bridges Architecture...');

  try { new HeroBackground('hero-canvas'); } catch (e) { console.warn(e); }
  try { new InteractiveSlider('main-slider'); } catch (e) { console.warn(e); }
  try { new SlidingPuzzle('puzzle-board'); } catch (e) { console.warn(e); }
  try { new NavigationMenu(); } catch (e) { console.warn(e); }

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' })
        .then(reg => console.log('✓ 5Bpage Service Worker active:', reg.scope))
        .catch(err => console.warn('! PWA registration note:', err));
    });
  }
});
