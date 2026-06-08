/* =========================================================
   윤슬 풀빌라 — BASIC(30만원) 원페이지 app.js
   BASIC 규격: 진입 fade-up + 히어로 1회 와이프 리빌 + 카운트업(once)만.
   금지: 스크럽 패럴랙스 / 핀 / 가로스크롤 / 로더 / 폼.
   접근성: reduced-motion / CDN 실패 시 콘텐츠 100% 노출.
   transform/opacity만 애니메이트 (60fps).
   ========================================================= */
(function(){
  'use strict';

  /* GSAP CDN 실패 가드: 라이브러리 없으면 no-js로 되돌려 모든 콘텐츠 노출 */
  if(!window.gsap){
    var r0 = document.documentElement;
    r0.classList.remove('js'); r0.classList.add('no-js');
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 헤더 스크롤 상태 ---------- */
  const header = document.getElementById('header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ===================== MOTION ===================== */
  if(reduce){
    /* reduced-motion: no-js로 전환해 pre-hide 해제 → 콘텐츠 100% 노출
       (와이프는 CSS @media reduce가 즉시 걷어 사진 노출, 카운트는 HTML 최종값 유지) */
    document.documentElement.classList.remove('js');
    document.documentElement.classList.add('no-js');
    document.querySelectorAll('.reveal').forEach(el=>{ el.style.opacity=1; el.style.transform='none'; });
    return;
  }

  /* Lenis 부드러운 스크롤 ↔ GSAP ScrollTrigger 동기화 (스크럽·핀 없이 진입 모션만) */
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp:0.1, smoothWheel:true, wheelMultiplier:0.95 });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t)=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);

  /* 앵커 링크(로고·푸터 바로가기)를 lenis로 부드럽게 이동 */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(id.length>1){
        const el = document.querySelector(id);
        if(el){ e.preventDefault(); lenis.scrollTo(el, {offset:-70}); }
      }
    });
  });

  /* 시그니처 코어 애니메이션: 헤드라인 줄별 마스크 리빌 — 각 줄이 아래에서 떠오름.
     gsap.set으로 시작값을 gsap 단위로 확정(CSS %-transform 오독 회피) 후 gsap.to로 끌어올림.
     CSS는 opacity:0만 둬 FOUC 방지 → set이 opacity:1로 켜며 마스크 아래에 정렬. */
  const lineIns = gsap.utils.toArray('.hero-title .line-in');
  if(lineIns.length){
    gsap.set(lineIns, { yPercent:115, opacity:1 });
    gsap.to(lineIns, { yPercent:0, duration:1.05, ease:'power4.out', stagger:0.13, delay:0.15 });
  }
  /* 강조어 골드 스윕(윤슬 물비늘) — 리빌이 끝난 직후 1회 */
  const em = document.querySelector('.hero-title em');
  if(em){ gsap.delayedCall(0.95, ()=> em.classList.add('shine')); }

  /* 히어로 사진 켄번스 정착(1회): 살짝 확대된 상태에서 제자리로 — 스크럽 아님 */
  const photo = document.querySelector('.hero-photo');
  if(photo){
    gsap.fromTo(photo, { scale:1.14 }, { scale:1.06, duration:2.6, ease:'power2.out', delay:0.1 });
  }

  /* 나머지 히어로 요소 진입 fade-up (헤드라인 리빌 뒤 순차) */
  gsap.from('.hero-eyebrow, .hero-sub, .hero-cta, .hero-meta', {
    y:24, opacity:0, duration:0.9, ease:'power2.out', stagger:0.1, delay:0.5
  });

  /* 카운트업: 진입 1회 0→목표값. data-decimals 지원(평점 4.9 등) */
  gsap.utils.toArray('.count').forEach(el=>{
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const dec = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    const fmt = (n)=> dec>0 ? n.toFixed(dec) : Math.round(n).toLocaleString('ko-KR');
    const obj = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(obj, {
      v: target, duration: 1.5, ease: 'power2.out', delay: 0.9,
      onUpdate(){ el.textContent = fmt(obj.v); },
      onComplete(){ el.textContent = fmt(target); }
    });
  });

  /* 공통 진입 fade-up (스크럽 아님 — once 진입 트리거만) */
  gsap.utils.toArray('.reveal').forEach(el=>{
    gsap.to(el, {
      opacity:1, y:0, duration:0.85, ease:'power2.out',
      scrollTrigger:{ trigger:el, start:'top 88%', once:true }
    });
  });

  /* 이미지 로드 후 트리거 위치 재계산 */
  window.addEventListener('load', ()=> ScrollTrigger.refresh());
})();

/* === 좌상단 로고: 클릭 시 현재 페이지 새로고침(맨 위) === */
(function () {
  function init() {
    var header = document.querySelector('header');
    if (!header) return;
    var logo = header.querySelector('.brand, .logo');
    if (!logo) return;
    logo.style.cursor = 'pointer';
    if (logo.tagName !== 'A') {
      logo.setAttribute('role', 'button');
      logo.setAttribute('tabindex', '0');
    }
    function reloadTop(e) {
      if (e) e.preventDefault();
      try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) {}
      window.scrollTo(0, 0);
      window.location.reload();
    }
    logo.addEventListener('click', reloadTop);
    logo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') reloadTop(e);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();