/**
 * 5B OS Master Engine
 * - Dynamic Harmonic State Sync across 1B ~ 5B
 * - 5B Session Live Aggregator & Viral Share API
 * - PWA Install Prompter & Offline Monitor
 */
let deferredPrompt = null;

// Global 5B Session Object
window.FiveBSession = {
  activeNote: 'C4',
  activeFreq: 261.63,
  themeColor: '#00f2fe',
  beatPlaying: false,
  slideDimension: '01 Beat',
  brainMoves: null,
  brainSeconds: null,
  brainSolved: false
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('[5B OS] Initializing Operating System Architecture...');

  try { new HeroBackground('hero-canvas'); } catch (e) { console.error('2B Breeze:', e); }
  try { new InteractiveSlider('main-slider'); } catch (e) { console.error('3B Beam:', e); }
  try { new SlidingPuzzle('puzzle-board'); } catch (e) { console.error('4B Brain:', e); }
  try { new NavigationMenu(); } catch (e) { console.error('Nav:', e); }

  init5BStateEngine();
  init5BSessionAndShare();
  initPwaEngine();
});

function init5BStateEngine() {
  window.addEventListener('5b:harmonic-shift', (e) => {
    const { note, freq, color, slideIndex } = e.detail;
    if (note) window.FiveBSession.activeNote = note;
    if (freq) window.FiveBSession.activeFreq = freq;
    if (color) {
      window.FiveBSession.themeColor = color;
      document.documentElement.style.setProperty('--theme-color', color);
    }
    if (slideIndex !== undefined) {
      const dimensions = ['01 Beat', '02 Breeze', '03 Beam', '04 Brain', '05 Byte'];
      window.FiveBSession.slideDimension = dimensions[slideIndex] || '01 Beat';
    }
    updateSessionUI();
  });

  window.addEventListener('5b:session-update', (e) => {
    if (e.detail.beatPlaying !== undefined) window.FiveBSession.beatPlaying = e.detail.beatPlaying;
    if (e.detail.brainSolved) {
      window.FiveBSession.brainSolved = true;
      window.FiveBSession.brainMoves = e.detail.moves;
      window.FiveBSession.brainSeconds = e.detail.seconds;
    }
    updateSessionUI();
  });
}

function init5BSessionAndShare() {
  const shareBtn = document.getElementById('btn-share-session');
  const feedback = document.getElementById('share-feedback');

  updateSessionUI();

  shareBtn?.addEventListener('click', async () => {
    const sess = window.FiveBSession;
    const timeStr = sess.brainSeconds ? `${Math.floor(sess.brainSeconds / 60)}분 ${sess.brainSeconds % 60}초` : '--';
    const brainStr = sess.brainSolved ? `${sess.brainMoves}회 (${timeStr})` : '도전 전';

    const shareText = `🧠 5B OS 세션 결과\n• 사운드: ${sess.activeNote} (${sess.activeFreq}Hz)\n• 모션: Breeze Fluid Mesh\n• 퍼즐 기록: ${brainStr}\n\n직접 경험해보기: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '5B OS Interactive Session',
          text: shareText,
          url: window.location.href
        });
        if (feedback) feedback.textContent = '✓ 성공적으로 공유되었습니다!';
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  });

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      if (feedback) feedback.textContent = '✓ 결과 요약이 클립보드에 복사되었습니다!';
      setTimeout(() => { if (feedback) feedback.textContent = ''; }, 4000);
    });
  }
}

function updateSessionUI() {
  const sess = window.FiveBSession;
  const beatEl = document.getElementById('sess-beat');
  const beamEl = document.getElementById('sess-beam');
  const brainEl = document.getElementById('sess-brain');

  if (beatEl) {
    beatEl.textContent = `${sess.activeNote} (${sess.activeFreq}Hz) • ${sess.beatPlaying ? 'Looping' : 'Idle'}`;
  }
  if (beamEl) {
    beamEl.textContent = `${sess.slideDimension} Active`;
  }
  if (brainEl) {
    if (sess.brainSolved) {
      const mins = Math.floor(sess.brainSeconds / 60);
      const secs = sess.brainSeconds % 60;
      brainEl.textContent = `완료! ${sess.brainMoves}회 (${mins}분 ${secs}초)`;
    } else {
      brainEl.textContent = '미완료 (퍼즐 도전 전)';
    }
  }
}

function initPwaEngine() {
  const installBtn = document.getElementById('btn-pwa-install');
  const clearCacheBtn = document.getElementById('btn-clear-cache');
  const netDot = document.getElementById('network-dot');
  const netText = document.getElementById('network-text');
  const swStatus = document.getElementById('sw-status');
  const displayMode = document.getElementById('display-mode');
  const installGuide = document.getElementById('install-guide');

  const updateNet = () => {
    if (navigator.onLine) {
      netDot.classList.remove('offline');
      netText.textContent = '온라인 연결 상태 (Online)';
    } else {
      netDot.classList.add('offline');
      netText.textContent = '오프라인 캐시 가동 중 (Offline Shell Active)';
    }
  };
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();

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

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn && !isStandalone) {
      installBtn.classList.add('pulse-btn');
      installBtn.textContent = '📲 지금 바로 5B 앱 설치하기';
    }
  });

  installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.textContent = '✓ 설치 요청 완료';
    } else {
      if (installGuide) {
        installGuide.classList.add('show');
        installGuide.innerHTML = `
          <strong>기기별 설치 안내:</strong><br/>
          • <strong>PC(Chrome/Edge):</strong> 주소창 오른쪽 끝의 <strong>[설치 아이콘 ⊕]</strong> 또는 메뉴(⋮) > <strong>'5B OS 설치'</strong>를 클릭하세요.<br/>
          • <strong>아이폰(iOS Safari):</strong> 하단 공유 버튼(↑) > <strong>'홈 화면에 추가'</strong>를 누르세요.<br/>
          • <strong>안드로이드:</strong> 브라우저 메뉴(⋮) > <strong>'앱 설치'</strong>를 누르세요.
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

  // [중요] 루트의 service_worker.js 호출[cite: 1]
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service_worker.js', { scope: './' })
      .then(reg => {
        if (swStatus) swStatus.textContent = '활성 (Active)';
        console.log('✓ [5B Byte] SW Scope:', reg.scope);
      })
      .catch(err => {
        if (swStatus) swStatus.textContent = '등록 실패';
        console.warn('[5B Byte] SW Notice:', err);
      });
  } else {
    if (swStatus) swStatus.textContent = '미지원 브라우저';
  }
}
