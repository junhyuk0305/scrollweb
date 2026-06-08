/* =========================================================
   믿음 청소이사 — BASIC(30만원) 원페이지 app.js
   기준 데모: demo-5-trust 모션 엔진(안정 검증).
   BASIC 규격: 진입 fade-up + 히어로 1회 와이프 리빌 + 카운트업(once)만.
   금지: 스크럽 패럴랙스 / 핀 / 가로스크롤 / 로더 / 폼.
   ※ 이전 버전의 '매 scroll 이벤트마다 도는 패럴랙스 scrub + rescue 스팸'을
     제거 → 스크롤 속도/체감 안정화.
   접근성: reduced-motion / CDN 실패 시 콘텐츠 100% 노출.
   ========================================================= */
(function(){
  'use strict';

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
    document.documentElement.classList.remove('js');
    document.documentElement.classList.add('no-js');
    document.querySelectorAll('.reveal').forEach(el=>{ el.style.opacity=1; el.style.transform='none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp:0.1, smoothWheel:true, wheelMultiplier:0.95 });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t)=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(id.length>1){
        const el = document.querySelector(id);
        if(el){ e.preventDefault(); lenis.scrollTo(el, {offset:-70}); }
      }
    });
  });

  /* 히어로 좌측 텍스트 진입 fade-up (순차) */
  gsap.from('.hero-col-text > *', {
    y:26, opacity:0, duration:0.9, ease:'power2.out', stagger:0.09, delay:0.15
  });

  /* 시그니처 코어 애니메이션: 견적 카드가 우측에서 기울며 슬라이드-인 후 정착 */
  const card = document.querySelector('#quoteCard');
  if(card){
    gsap.fromTo(card,
      { x:56, rotateZ:5, scale:0.94, opacity:0 },
      { x:0, rotateZ:-2.2, scale:1, opacity:1, duration:1.05, ease:'power3.out', delay:0.35 });
    /* 카드 내부 행이 순차로 채워짐(견적이 조립되는 느낌) */
    gsap.from('#quoteCard .qc-head, #quoteCard .qc-row, #quoteCard .qc-foot', {
      y:14, opacity:0, duration:0.6, ease:'power2.out', stagger:0.1, delay:0.75 });
  }

  /* 카운트업: 진입 1회 0→목표값(천단위 콤마, % · 건 등 suffix는 HTML) */
  gsap.utils.toArray('.count').forEach(el=>{
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const fmt = (n)=> Math.round(n).toLocaleString('ko-KR');
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out', delay: 0.85,
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
