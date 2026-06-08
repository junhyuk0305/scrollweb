/* ============================================================
   SCROLLWORKS · 공유 fx 엔진 (가벼운 라이브러리)
   역할: ① GSAP/Lenis 부트 + ScrollTrigger 동기화
        ② data-fx="…" 디스패처 (이름 → 효과 함수)
        ③ reduced-motion / CDN 실패 폴백 (모션 0 = 콘텐츠 완성본)
   스킨(색·폰트·구성)은 모른다. 모션만 건다. (anti-template)
   사용: HTML 요소에 data-fx="reveal", data-fx="parallax" 등만 붙이면 됨.
   확장: SW.register('이름', fn) 으로 효과 추가.
   ============================================================ */
(function (global) {
  'use strict';

  var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var registry = {};
  var didRun = false;
  var lenis = null;

  /* ---- 효과 등록 ---- */
  function register(name, fn) { registry[name] = fn; }

  /* ---- Lenis ↔ ScrollTrigger 동기화 부트 ---- */
  function bootScroll() {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof Lenis !== 'undefined' && !reduce) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---- 실행: data-fx 요소를 훑어 효과 적용 ---- */
  function run() {
    if (didRun) return; didRun = true;
    var root = document.documentElement;

    // 무장 조건: JS O + GSAP O + 모션최소화 X. 하나라도 어긋나면 폴백(콘텐츠 즉시 노출).
    if (!hasGSAP || reduce) {
      root.classList.remove('fx-arm');      // <head>가 미리 켠 초기 숨김 상태 해제
      root.classList.add('fx-fallback');    // = 모든 콘텐츠 보임, 모션 0
      return;
    }
    root.classList.add('fx-on');
    bootScroll();

    var tier = (document.body.getAttribute('data-tier') || 'std').toLowerCase();
    var ctx = {
      tier: tier, reduce: reduce, lenis: lenis,
      // 강도 계수: 30=.3 / 50=.6 / 80=1 (내부_tier퀄리티기준 §2)
      pFactor: tier === 'pro' || tier === '80' ? 1 : tier === 'basic' || tier === '30' ? 0.3 : 0.6
    };

    document.querySelectorAll('[data-fx]').forEach(function (el) {
      el.getAttribute('data-fx').split(/\s+/).filter(Boolean).forEach(function (name) {
        var fn = registry[name];
        if (!fn) { if (global.console) console.warn('[fx] 미등록 효과:', name); return; }
        try { fn(el, ctx); } catch (e) { if (global.console) console.warn('[fx] 실행 오류:', name, e); }
      });
    });

    // 이미지 로드 후 트리거 위치 재계산 (높이 미확정 보정)
    requestAnimationFrame(function () { ScrollTrigger.refresh(); });
    global.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ============================================================
     기본 효과 레지스트리 (카탈로그 00_scroll.md 매핑)
     ============================================================ */

  /* reveal — 진입 페이드업. data-stagger 면 자식 순차. data-delay 지원 */
  register('reveal', function (el, ctx) {
    var stag = el.hasAttribute('data-stagger');
    var targets = stag ? el.children : el;
    gsap.to(targets, {
      opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
      stagger: stag ? 0.09 : 0,
      delay: parseFloat(el.getAttribute('data-delay')) || 0,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  /* parallax — data-speed(0~1) 만큼 위·아래 시차. pFactor로 tier 강약 */
  register('parallax', function (el, ctx) {
    var speed = parseFloat(el.getAttribute('data-speed')) || 0.2;
    var range = speed * 60 * ctx.pFactor;
    gsap.fromTo(el, { yPercent: -range }, {
      yPercent: range, ease: 'none',
      scrollTrigger: {
        trigger: el.closest('[data-parallax-scope]') || el.parentElement || el,
        start: 'top bottom', end: 'bottom top', scrub: true
      }
    });
  });

  /* count — 숫자 카운트업. data-count="1200", data-suffix="+" */
  register('count', function (el, ctx) {
    var raw = el.getAttribute('data-count') || el.textContent;
    var to = parseFloat(String(raw).replace(/[^\d.]/g, '')) || 0;
    var dec = String(raw).indexOf('.') >= 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var obj = { v: 0 };
    el.textContent = '0' + suffix;
    gsap.to(obj, {
      v: to, ease: 'power1.out', duration: 1.5,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: function () {
        el.textContent = (dec ? obj.v.toFixed(1) : Math.round(obj.v)).toLocaleString('ko-KR') + suffix;
      }
    });
  });

  /* hero — 히어로 인트로(커튼 리빌 + 단어 라이즈 + 스크롤 패럴랙스/스케일)
     마크업: [data-hero-media] 이미지, [data-hero-word] 헤드라인 단어들 */
  register('hero', function (el, ctx) {
    var media = el.querySelector('[data-hero-media]');
    var words = el.querySelectorAll('[data-hero-word]');
    if (media) gsap.fromTo(media, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power3.out' });
    // px y로 진입(마스크 아래→0). yPercent는 CSS translate 정규화와 충돌해 멈추는 사례가 있어 피한다.
    if (words.length) gsap.fromTo(words,
      { y: 90, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out', stagger: 0.12, delay: 0.3 });
    if (media) gsap.to(media, {
      yPercent: 12 * ctx.pFactor, scale: 1.06, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  /* reveal-mask — 시그니처: 덮개 패널이 옆으로 걷히며 콘텐츠 공개
     마크업: 섹션에 [data-mask-cover] 오버레이 1장 */
  register('reveal-mask', function (el, ctx) {
    var cover = el.querySelector('[data-mask-cover]');
    if (!cover) return;
    gsap.to(cover, {
      scaleX: 0, transformOrigin: 'right center', ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 72%', end: 'top 28%', scrub: true }
    });
  });

  /* marquee — 키네틱 마퀴(끊김 없는 가로 흐름). 트랙 안에 동일 내용 2벌 필요 */
  register('marquee', function (el, ctx) {
    var track = el.querySelector('[data-marquee-track]') || el.firstElementChild;
    if (!track) return;
    var dir = el.hasAttribute('data-reverse') ? 1 : -1;
    gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, {
      xPercent: dir < 0 ? -50 : 0, ease: 'none', duration: 22, repeat: -1
    });
  });

  /* sticky-stack — (보조 시그니처) 카드가 쌓이며 뒤 카드는 축소·후퇴
     마크업: 컨테이너에 [data-stack-card] 카드들 (CSS에서 position:sticky) */
  register('sticky-stack', function (el, ctx) {
    var cards = el.querySelectorAll('[data-stack-card]');
    var last = cards[cards.length - 1];
    cards.forEach(function (card, i) {
      if (card === last) return;
      gsap.to(card, {
        scale: 0.94, yPercent: -3, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top 18%', endTrigger: last, end: 'top 18%', scrub: true }
      });
    });
  });

  /* ---- 공개 API ---- */
  global.SW = {
    register: register,
    run: run,
    get reduce() { return reduce; },
    get hasGSAP() { return hasGSAP; },
    get lenis() { return lenis; }
  };

  /* ---- 자동 실행 (defer 스크립트들이 순서대로 끝난 뒤 DOMContentLoaded에서) ---- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

})(window);
