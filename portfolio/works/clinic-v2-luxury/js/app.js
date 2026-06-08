/* ===== 라엘 피부과의원 · BASIC 원페이지 스크립트 =====
   진입 fade-up(IntersectionObserver)만. 시그니처/스크럽/패럴랙스/폼 로직 없음.
   reduced-motion·IO 미지원 시 즉시 전체 노출(폴백). */

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');

  // 폴백: 모션 차단 또는 IntersectionObserver 미지원 → 콘텐츠 100% 즉시 노출
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
