/* ============================================================
   BLOOM · 데모 전용 스크립트 (모션은 engine.js가 담당)
   BASIC: nav 메뉴 없음 → 헤더 스크롤 강조 + 앵커 스무스만.
   ============================================================ */
(function () {
  'use strict';
  var header = document.querySelector('header');

  /* 헤더: 스크롤 시 테두리/배경 강조 */
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 앵커 스무스 스크롤 (Lenis 있으면 사용) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = (header ? header.offsetHeight : 0) + 8;
      if (window.SW && SW.lenis) SW.lenis.scrollTo(target, { offset: -offset });
      else {
        var y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: (window.SW && SW.reduce) ? 'auto' : 'smooth' });
      }
    });
  });
})();

/* ── 판매 시: 케이크 예약을 폼으로도 받으려면 _engine/form 모듈 연결(STANDARD↑). BASIC은 전화·카톡으로 충분. ── */
