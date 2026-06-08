/* =========================================================
   믿음 청소이사 — BASIC(30만) 모션 엔진
   - BASIC 규격: 진입 fade-up + 히어로 배경 미세 패럴랙스(절제 모먼트 1개)만.
     핀·가로스크롤·마퀴·카운트업·split·로더·마스크 없음. 폼/지도 없음. 시그니처 0.
   - reduced-motion / GSAP 미로드 → 콘텐츠 즉시 노출 폴백.
   - 룩은 css, 여기는 모션만. transform/opacity만 사용.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  // 폴백: 숨겨둔 요소를 즉시 표시
  function showAll() {
    document.querySelectorAll('.reveal, [data-stagger] > *').forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, Lenis = window.Lenis;

  // reduced-motion 또는 GSAP 미로드 시: 폴백 후 종료
  if (reduce || !gsap) { showAll(); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis 부드러운 스크롤 (BASIC 허용 — scrub 아님) ---------- */
  if (Lenis) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // 즉시 노출 헬퍼(트리거를 못 받은 요소 보호용) — tween 충돌 방지로 직접 세팅
  function forceShow(el) {
    gsap.killTweensOf(el);
    gsap.set(el, { opacity: 1, y: 0, clearProps: 'willChange' });
  }

  /* ---------- 진입 fade-up (단일 요소) ---------- */
  var solo = gsap.utils.toArray('.reveal');
  solo.forEach(function (el) {
    var d = parseFloat(el.getAttribute('data-delay')) || 0;
    gsap.fromTo(el,
      { opacity: 0, y: 34 },
      { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: d,
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true } }
    );
  });

  /* ---------- 진입 fade-up (자식 순차) ---------- */
  var groups = gsap.utils.toArray('[data-stagger]');
  groups.forEach(function (el) {
    gsap.fromTo(el.children,
      { opacity: 0, y: 34 },
      { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none', once: true } }
    );
  });

  /* ---------- 히어로 모먼트(절제) : 배경 이미지 미세 패럴랙스 1개 ----------
     BASIC 규격상 핀/마스크/가로스크롤은 금지. 배경만 살짝 떠오르며
     히어로가 정적이지 않게 한다. 모바일/reduced-motion은 위에서 폴백 처리. */
  var heroBg = document.getElementById('heroBg');
  var hero = document.querySelector('.hero');
  if (heroBg && hero && !window.matchMedia('(max-width:760px)').matches) {
    gsap.fromTo(heroBg, { yPercent: -6, scale: 1.06 },
      { yPercent: 8, scale: 1.06, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- 안전망: 트리거를 못 받고 화면 안/위에 있는 요소는 강제 노출 ----------
     원인) 즉시 점프 스크롤(앵커·뒤로가기 등)로 Lenis가 트리거 진입 콜백을
     건너뛰면 once 트리거가 영영 안 켜져 일부 섹션이 숨은 채로 남는다.
     refresh/스크롤/로드 시점마다 뷰포트 하단보다 위에 있는데 아직 숨은
     요소를 직접 노출시켜 "스크롤 후 미노출 0"을 보장한다. */
  function rescueVisible() {
    // 임계 0.85*vh: 막 진입 중인 정상 리빌(top 88~90%≈0.9vh에서 시작)은 건드리지 않고,
    // 뷰포트 안에 명확히 들어왔는데도 트리거를 건너뛴 채 숨은 요소만 구제 → 스냅 없음.
    var line = window.innerHeight * 0.85;
    solo.forEach(function (el) {
      if (parseFloat(getComputedStyle(el).opacity) >= 0.5) return;
      if (el.getBoundingClientRect().top < line) forceShow(el);
    });
    groups.forEach(function (g) {
      [].forEach.call(g.children, function (el) {
        if (parseFloat(getComputedStyle(el).opacity) >= 0.5) return;
        if (el.getBoundingClientRect().top < line) forceShow(el);
      });
    });
  }

  ScrollTrigger.addEventListener('refresh', rescueVisible);
  window.addEventListener('scroll', rescueVisible, { passive: true });
  if (typeof lenis !== 'undefined' && lenis) lenis.on('scroll', rescueVisible);

  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
    requestAnimationFrame(rescueVisible);
  });
  // 폰트/이미지 로드 지연 대비 추가 refresh
  setTimeout(function () { ScrollTrigger.refresh(); rescueVisible(); }, 700);
})();
