/**
 * 5Bpage Main Orchestrator & 5B Byte (PWA Engine)
 */
let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('[5Bpage] Bootstrapping 5-Dimension Architecture...');

  try { new HeroBackground('hero-canvas'); } catch (e) { console.error('2B Breeze:', e); }
  try { new InteractiveSlider('main-slider'); } catch (e) { console.error('3B Beam:', e); }
  try { new SlidingPuzzle('puzzle-board'); } catch (e) { console.error('4B Brain:', e); }
  try { new NavigationMenu(); } catch (e) { console.error('Nav:', e); }

  initPwaDashboard();
});

function initPwaDashboard() {
  const installBtn = document.getElementById('btn-pwa-install');
  const clearCacheBtn = document.getElementById('btn-clear-cache');
  const netDot = document.getElementById('network-dot');
  const netText = document.getElementById('network-text');
  const swStatus = document.getElementById('sw-status');
  const displayMode = document.getElementById('display-mode');
  const installGuide = document.getElementById('install-guide');

  // Network Monitoring
  const updateNetworkStatus = () => {
    if (navigator.onLine) {
      netDot.classList.remove('offline');
      netText.textContent = '온라인 연결 상태 (Online)';
    } else {
      netDot.classList.add('offline');
      netText.textContent = '오프라인 캐시 가동 중 (Offline Shell Active)';
    }
  };
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  // Display Mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) {
    if (displayMode) displayMode.textContent = '독립형 웹앱 (PWA Standalone)';
    if (installBtn) {
      installBtn.disabled = true;
      installBtn.textContent = '✓ 이미 앱으로 설치됨';
    }
  } else {
    if (displayMode) displayMode.textContent = '브라우저 탭 모드';
  }

  // PWA Install Prompt Capture (Chrome/Edge on Desktop & Mobile)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn && !isStandalone) {
      installBtn.classList.add('pulse-btn');
      installBtn.textContent = '💻 지금 앱 설치하기 (Install App)';
    }
    console.log('[5B Byte] PWA install prompt captured successfully');
  });

  installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[5B Byte] Install choice: ${outcome}`);
      deferredPrompt = null;
      installBtn.textContent = '✓ 설치 요청 완료';
    } else {
      // Guide for Desktop/iOS/Already Installed
      if (installGuide) {
        installGuide.classList.add('show');
        installGuide.innerHTML = `
          <strong>앱 설치 안내:</strong><br/>
          • <strong>PC(Chrome/Edge):</strong> 주소창 오른쪽 끝의 <strong>설치 아이콘(⊕ 또는 모니터 모양)</strong>을 클릭하거나, 메뉴(⋮) > <strong>'5Bpage 설치'</strong>를 선택하세요.<br/>
          • <strong>모바일(iOS Safari):</strong> 하단 공유 버튼(↑) > <strong>'홈 화면에 추가'</strong>를 누르세요.<br/>
          • <strong>모바일(Android):</strong> 브라우저 메뉴(⋮) > <strong>'앱 설치'</strong>를 누르세요.
        `;
      }
    }
  });

  clearCacheBtn?.addEventListener('click', async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      alert('캐시 스토리지를 비웠습니다. 최신 상태로 새로고침합니다.');
      window.location.reload();
    }
  });

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(reg => {
        if (swStatus) swStatus.textContent = '활성 (Active)';
        console.log('✓ [5B Byte] Service Worker Active. Scope:', reg.scope);
      })
      .catch(err => {
        if (swStatus) swStatus.textContent = '등록 실패';
        console.warn('[5B Byte] SW Registration Notice:', err);
      });
  } else {
    if (swStatus) swStatus.textContent = '미지원 브라우저';
  }
}
