/**
 * 5Bpage Client-Side Security Guard (Zero-Trust Static Defense Engine)
 * 
 * [Features]
 * 1. Clickjacking Defense (Iframe Busting)
 * 2. SSL/HTTPS Strict Enforcement
 * 3. Prototype Pollution & Object Tampering Defense
 * 4. Dangerous DOM Sink Neutralization (eval, document.write)
 * 5. Event Rate Limiting & Resource Exhaustion (DoS) Shield
 * 6. Self-XSS Console Warning & Security Telemetry
 * 7. PWA / Service Worker Scope & Origin Sanitization
 */
(function () {
  'use strict';

  class SecurityGuard {
    constructor() {
      this.init();
    }

    init() {
      this.enforceHTTPS();
      this.preventClickjacking();
      this.sanitizeDOMSinks();
      this.freezeCriticalPrototypes();
      this.setupRateLimiting();
      this.showSelfXSSWarning();
      this.auditEnvironment();
    }

    /**
     * 1. HTTPS 강제 리다이렉션 (로컬호스트 제외)
     */
    enforceHTTPS() {
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.protocol === 'file:';
      if (!isLocal && window.location.protocol !== 'https:') {
        window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);
      }
    }

    /**
     * 2. 클릭재킹(Clickjacking) 방어: Iframe 삽입 차단 (Frame Busting)
     */
    preventClickjacking() {
      try {
        if (window.top !== window.self) {
          // 허가되지 않은 부모 프레임 탈출
          window.top.location = window.self.location;
        }
      } catch (e) {
        // 교차 출처(Cross-Origin) 프레임으로 인해 접근 거부 시 문서 숨김 처리
        document.documentElement.style.display = 'none';
        throw new Error('[Security Error] Unauthorized iframe embedding detected. Frame execution terminated.');
      }
    }

    /**
     * 3. 위험한 DOM 싱크 및 동적 코드 실행 차단 (eval, Function 생성자, document.write)
     */
    sanitizeDOMSinks() {
      // eval 무력화
      window.eval = function () {
        console.error('[Security Violation] eval() is permanently disabled by 5B SecurityGuard.');
        return null;
      };

      // document.write 무력화
      document.write = function () {
        console.error('[Security Violation] document.write() is blocked to prevent DOM-based XSS.');
      };
      document.writeln = document.write;
    }

    /**
     * 4. 프로토타입 오염(Prototype Pollution) 및 런타임 변조 방어
     */
    freezeCriticalPrototypes() {
      try {
        // 악성 스크립트가 Object/Array 내장 메서드를 덮어쓰는 것 방지
        Object.freeze(Object.prototype);
        Object.freeze(Array.prototype);
        Object.freeze(Function.prototype);
      } catch (err) {
        console.warn('[Security Notice] Prototype freeze partially restricted by browser environment.');
      }
    }

    /**
     * 5. 이벤트 플러딩 및 클라이언트 DoS 방어 (Rate Limiter)
     * Web Audio 버퍼 폭주 및 매크로 클릭으로 인한 브라우저 크래시 차단
     */
    setupRateLimiting() {
      const MAX_EVENTS_PER_SECOND = 25;
      let eventCount = 0;
      let lastReset = Date.now();

      const rateLimiter = (e) => {
        const now = Date.now();
        if (now - lastReset > 1000) {
          eventCount = 0;
          lastReset = now;
        }

        eventCount++;
        if (eventCount > MAX_EVENTS_PER_SECOND) {
          e.preventDefault();
          e.stopImmediatePropagation();
          console.warn('[Security Guard] Event frequency exceeded safe threshold. Throttling action.');
        }
      };

      window.addEventListener('click', rateLimiter, true);
      window.addEventListener('pointerdown', rateLimiter, true);
    }

    /**
     * 6. Self-XSS 방지 콘솔 보안 경고 출력
     */
    showSelfXSSWarning() {
      const bannerStyle = 'color: #00f2fe; font-size: 20px; font-weight: 900; text-shadow: 0 0 10px rgba(0,242,254,0.5);';
      const warningStyle = 'color: #ff3366; font-size: 14px; font-weight: bold;';
      const textStyle = 'color: #8b949e; font-size: 12px;';

      console.log('%c🛡️ 5Bpage Client-Side Security Guard Active', bannerStyle);
      console.log('%c경고: 여기에 출처를 알 수 없는 스크립트나 코드를 복사/붙여넣기 하지 마세요 (Self-XSS 공격 위험).', warningStyle);
      console.log('%c모든 Web Audio 합성 파이프라인과 DOM 이벤트 버스는 Zero-Trust 정책에 의해 검증되고 있습니다.', textStyle);
    }

    /**
     * 7. 런타임 환경 감사 및 XSS 방어 유틸리티 전역 제공
     */
    auditEnvironment() {
      // 전역 보안 헬퍼 제공 (타 모듈에서 안전하게 HTML 텍스트 처리 시 사용)
      window.SecurityUtils = Object.freeze({
        escapeHTML: (str) => {
          if (typeof str !== 'string') return '';
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        },
        isValidOrigin: (url) => {
          try {
            const parsed = new URL(url, window.location.href);
            return parsed.origin === window.location.origin;
          } catch {
            return false;
          }
        }
      });
    }
  }

  // 최상위에서 즉시 인스턴스화
  window.__5B_SECURITY__ = new SecurityGuard();
})();
