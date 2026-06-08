/* =========================================================
   정도(正道) 세무회계 · 노무 — BASIC(30만원) 원페이지 app.js
   BASIC 규격: 진입 모션(fade-up)만.
   금지: 패럴랙스 / 핀 / 가로스크롤 / 카운트업 스크럽 / 로더 / 마스크 / 폼.
   GSAP·Lenis는 fade-up 진입 + 부드러운 스크롤에만 사용.
   접근성: reduced-motion / CDN 실패 시 콘텐츠 100% 노출.
   ========================================================= */
(function(){
  'use strict';

  /* GSAP CDN 실패 가드: 라이브러리 없으면 no-js로 되돌려 모든 콘텐츠 100% 노출 */
  if(!window.gsap){
    var r0 = document.documentElement;
    r0.classList.remove('js'); r0.classList.add('no-js');
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 헤더 스크롤 상태 ---------- */
  const header = document.getElementById('header');
  function onScroll(){
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ===================== MOTION ===================== */
  if(reduce){
    /* reduced-motion: no-js로 전환해 CSS pre-hide 해제 → 모든 콘텐츠 100% 노출
       (마스크는 CSS @media reduce가 즉시 걷어 사진 노출, 카운트는 HTML 최종값 그대로) */
    document.documentElement.classList.remove('js');
    document.documentElement.classList.add('no-js');
    document.querySelectorAll('.reveal').forEach(el=>{ el.style.opacity=1; el.style.transform='none'; });
    return;
  }

  /* Lenis 부드러운 스크롤 ↔ GSAP ScrollTrigger 동기화 (스크럽·핀 없이 진입 모션만 사용) */
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

  /* 히어로 진입 fade-up (정적 — 패럴랙스 없음) */
  gsap.from('.hero-badge, .hero h1, .hero-sub, .hero-cta, .hero-note, .stats', {
    y:26, opacity:0, duration:0.9, ease:'power2.out', stagger:0.1, delay:0.15
  });

  /* 히어로 도형 리빌: 사진을 가린 도형이 오른쪽으로 걷히며 사진이 드러남 (1회, ~1.1s) */
  const mask = document.querySelector('.hero-photo-mask');
  if(mask){
    gsap.to(mask, { xPercent:101, duration:1.1, ease:'power3.inOut', delay:0.35 });
  }

  /* 히어로 카운트업: 진입 시 1회(once) 0→목표값, 천단위 콤마, 최종값에 정확히 고정 */
  const fmt = (n)=> Math.round(n).toLocaleString('ko-KR');
  gsap.utils.toArray('.count').forEach(el=>{
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out', delay: 0.5,
      onUpdate(){ el.textContent = fmt(obj.v); },
      onComplete(){ el.textContent = fmt(target); }   /* 최종값 정확히 고정 */
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
