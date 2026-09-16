/**
 * 5Bpage Main Orchestrator & 5B Byte (PWA Engine)
 */
let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('[5Bpage] Bootstrapping 5-Dimension Architecture...');

  // 1. Initialize Components
  try { new HeroBackground('hero-canvas'); } catch (e) { console.error('2B Breeze:', e); }
  try { new InteractiveSlider('main-slider'); } catch (e) { console.error('3B Beam:', e); }
  try { new SlidingPuzzle('puzzle-board'); } catch (e) { console.error('4B Brain:', e); }
  try { new NavigationMenu(); } catch (e) { console.error('Nav:', e); }

  // 2. 5B Byte: PWA Install & Offline Console Setup
  initPwaDashboard();
});

function initPwaDashboard() {
  const installBtn = document.getElementById('btn-pwa-install');
  const clearCacheBtn = document.getElementById('btn-clear-cache');
  const netDot = document.getElementById('network-dot');
  const netText = document.getElementById('network-text');
  const swStatus = document.getElementById('sw-status');
  const displayMode = document.getElementById('display-mode');

  // Network Online/Offline Monitoring
  const updateNetworkStatus = () => {
    if (navigator.onLine) {
      netDot.classList.remove('offline');
      netText.textContent = '온라인 연결 상태 (Online)';
    } else {
      netDot.classList.add('offline');
      netText.textContent = '오프라인 캐시 가동 중 (Offline)';
    }
  };
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  // Display Mode Check
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    if (displayMode) displayMode.textContent = '독립형 웹앱 (PWA Standalone)';
  } else {
    if (displayMode) displayMode.textContent = '브라우저 탭 모드';
  }

  // PWA Install Prompt Capture
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.disabled = false;
      installBtn.textContent = '홈 화면에 앱 설치하기';
    }
    console.log('[5B Byte] PWA install banner ready');
  });

  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('이미 설치되어 있거나 현재 브라우저 환경에서 자동 설치를 지원하지 않습니다.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[5B Byte] User response: ${outcome}`);
    deferredPrompt = null;
    installBtn.disabled = true;
  });

  // Cache Re-sync Button
  clearCacheBtn?.addEventListener('click', async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      alert('캐시 스토리지를 새로고침했습니다. 페이지를 다시 로드합니다.');
      window.location.reload();
    }
  });

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(reg => {
        if (swStatus) swStatus.textContent = '활성 (Active)';
        console.log('✓ [5B Byte] Service Worker Scope:', reg.scope);
      })
      .catch(err => {
        if (swStatus) swStatus.textContent = '등록 오류';
        console.warn('[5B Byte] SW Registration Notice:', err);
      });
  } else {
    if (swStatus) swStatus.textContent = '미지원 브라우저';
  }
}
