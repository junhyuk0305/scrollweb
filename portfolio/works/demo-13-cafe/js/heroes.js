/* ============================================================
   SCROLLWORKS · 히어로 라이브러리 (11종) — 키트
   역할: body[data-hero="slug"] → 해당 히어로 인트로 1개 실행.
   다양성 보존의 핵심: 사이트마다 "다른 히어로"를 배정한다.
   배정 규칙·현황: _engine/배분현황.md · docs/효과배분_데모별다양성.md
   부팅: fx 엔진(engine.js)이 먼저 Lenis를 띄우면 그걸 재사용(이중 부팅 방지).
        엔진 없이 단독으로 써도 자체 부팅한다.
   마크업/스타일: heroes.css + 각 hero-lab 페이지(portfolio/works/hero-lab/NN-slug.html)에서 발췌.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;

  /* ---- 부팅: 이미 Lenis가 돌면 재사용, 아니면 생성 (이중 부팅 방지) ---- */
  function boot() {
    if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return false;
    gsap.registerPlugin(ScrollTrigger);
    if (!window.__lenis && typeof Lenis !== 'undefined') {
      var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    return true;
  }

  function initMagnetic() {
    if (mobile) return;
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .4, y: (e.clientY - r.top - r.height / 2) * .6, duration: .5, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () { gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }); });
    });
  }

  /* ===================== 히어로별 INIT (11종) ===================== */
  var INIT = {
    /* 01 풀스크린 축소 */
    shrink: function () {
      gsap.set('.sh-copy', { opacity: 0, y: 24 });
      gsap.timeline({ scrollTrigger: { trigger: '.hero-shrink', start: 'top top', end: '+=120%', pin: true, scrub: 1 } })
        .to('.sh-media', { scale: .58, borderRadius: '26px', ease: 'none' }, 0)
        .to('.sh-copy', { opacity: 1, y: 0, ease: 'none' }, .35);
    },
    /* 02 커튼 리빌 */
    curtain: function () {
      gsap.timeline({ scrollTrigger: { trigger: '.hero-curtain', start: 'top top', end: '+=110%', pin: true, scrub: 1 } })
        .to('.ct-left', { xPercent: -100, ease: 'power2.inOut' }, 0)
        .to('.ct-right', { xPercent: 100, ease: 'power2.inOut' }, 0)
        .from('.ct-copy', { opacity: 0, scale: .92, ease: 'none' }, .35);
    },
    /* 03 조각 흩어짐 */
    disperse: function () {
      var grid = document.getElementById('dpGrid'); if (!grid) return;
      var COLS = mobile ? 4 : 6, ROWS = mobile ? 5 : 4;
      grid.style.setProperty('--cols', COLS); grid.style.setProperty('--rows', ROWS);
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
        var t = document.createElement('span'); t.className = 'dp-tile';
        t.style.left = (c * 100 / COLS) + '%'; t.style.top = (r * 100 / ROWS) + '%';
        t.style.width = 'calc(100%/' + COLS + ' + 1px)'; t.style.height = 'calc(100%/' + ROWS + ' + 1px)';
        t.style.backgroundSize = (COLS * 100) + '% ' + (ROWS * 100) + '%';
        t.style.backgroundPosition = (COLS > 1 ? c / (COLS - 1) * 100 : 50) + '% ' + (ROWS > 1 ? r / (ROWS - 1) * 100 : 50) + '%';
        grid.appendChild(t);
      }
      var tiles = [].slice.call(grid.children);
      gsap.set('.dp-copy', { opacity: 0, scale: .9 });
      gsap.timeline({ scrollTrigger: { trigger: '.hero-disperse', start: 'top top', end: '+=120%', pin: true, scrub: 1 } })
        .to(tiles, {
          x: function (i) { return ((i % COLS) - (COLS - 1) / 2) * gsap.utils.random(70, 150); },
          y: function (i) { return (Math.floor(i / COLS) - (ROWS - 1) / 2) * gsap.utils.random(70, 150); },
          rotation: function () { return gsap.utils.random(-80, 80); }, opacity: 0, ease: 'power2.in'
        }, 0)
        .to('.dp-copy', { opacity: 1, scale: 1, ease: 'none' }, .35);
    },
    /* 04 창 열림 */
    aperture: function () {
      gsap.set('.ap-copy', { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: '.hero-aperture', start: 'top top', end: '+=170%', pin: true, scrub: 1 } })
        .fromTo('.ap-inner', { scale: 1.05 }, { scale: 1.75, ease: 'none' }, 0)
        .fromTo('.ap-scene', { clipPath: 'inset(20% 26% round 18px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'power2.inOut' }, .45)
        .to('.ap-frame', { opacity: 0, ease: 'none' }, .45)
        .to('.ap-copy', { opacity: 1, ease: 'none' }, .72);
    },
    /* 05 원형 마스크 */
    circle: function () {
      gsap.set('.cr-copy', { opacity: 0, y: 24 });
      gsap.timeline({ scrollTrigger: { trigger: '.hero-circle', start: 'top top', end: '+=120%', pin: true, scrub: 1 } })
        .fromTo('.cr-img', { clipPath: 'circle(7% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'none' }, 0)
        .to('.cr-copy', { opacity: 1, y: 0, ease: 'none' }, .4);
    },
    /* 06 줄 마스크 리빌 (로드 인트로) */
    lines: function () {
      gsap.from('.ln-bg', { scale: 1.16, duration: 1.8, ease: 'power2.out' });
      gsap.from('.ln-head .ln > span', { yPercent: 120, rotation: 6, stagger: .13, duration: 1.1, ease: 'power3.out', delay: .2 });
      gsap.from('.ln-sub', { opacity: 0, y: 22, duration: .9, delay: 1, ease: 'power3.out' });
      gsap.to('.ln-bg', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero-lines', start: 'top top', end: 'bottom top', scrub: 1 } });
    },
    /* 07 켄번스 줌 */
    kenburns: function () {
      gsap.timeline({ scrollTrigger: { trigger: '.hero-kenburns', start: 'top top', end: '+=170%', pin: true, scrub: 1 } })
        .fromTo('.kb-1', { scale: 1.12, xPercent: 5, yPercent: 3, rotation: -1.2 }, { scale: 1.5, xPercent: -7, yPercent: -6, rotation: 1.2, ease: 'none' }, 0)
        .fromTo('.kb-2', { scale: 1.5, xPercent: -6, yPercent: 5, opacity: 0 }, { scale: 1.12, xPercent: 6, yPercent: -5, opacity: 1, ease: 'none' }, 0);
      gsap.from('.kb-copy .eyebrow', { opacity: 0, y: 16, duration: .7, delay: .1, ease: 'power3.out' });
      gsap.from('.kb-copy .ln > span', { yPercent: 120, stagger: .1, duration: 1, ease: 'power3.out', delay: .25 });
      gsap.from('.kb-copy .lead', { opacity: 0, y: 20, duration: .8, delay: .9, ease: 'power3.out' });
    },
    /* 08 막 걷힘 */
    bars: function () {
      var wrap = document.getElementById('brBars'); if (!wrap) return;
      var N = mobile ? 6 : 9;
      for (var i = 0; i < N; i++) { var b = document.createElement('span'); b.className = 'br-bar'; b.style.width = 'calc(100% / ' + N + ' + 1.5px)'; b.style.marginRight = '-1px'; wrap.appendChild(b); }
      gsap.timeline({ scrollTrigger: { trigger: '.hero-bars', start: 'top top', end: '+=120%', pin: true, scrub: 1 } })
        .to('.br-bar', { scaleY: 0, transformOrigin: 'top', stagger: .07, ease: 'power2.in' }, 0)
        .from('.br-title .ln > span', { yPercent: 120, stagger: .1, ease: 'power3.out' }, .1)
        .from('.br-img', { scale: 1.22, ease: 'none' }, 0);
    },
    /* 09 단어 교체 */
    wordswap: function () {
      var words = gsap.utils.toArray('#wsStack .swap-word'); if (!words.length) return; var cur = 0;
      gsap.set(words, { yPercent: 120, opacity: 0, filter: 'blur(10px)' });
      gsap.set(words[0], { yPercent: 0, opacity: 1, filter: 'blur(0px)' });
      ScrollTrigger.create({
        trigger: '.hero-wordswap', start: 'top top', end: '+=' + (words.length * 60) + '%', pin: true, scrub: 1,
        onUpdate: function (s) {
          var idx = Math.min(words.length - 1, Math.floor(s.progress * words.length * 0.999));
          if (idx === cur) return;
          var dir = idx > cur ? 1 : -1;
          gsap.to(words[cur], { yPercent: -120 * dir, opacity: 0, filter: 'blur(10px)', duration: .6, ease: 'power3.inOut', overwrite: true });
          gsap.fromTo(words[idx], { yPercent: 120 * dir, opacity: 0, filter: 'blur(10px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: .6, ease: 'power3.out', overwrite: true });
          cur = idx;
        }
      });
    },
    /* 10 패럴랙스 깊이 */
    parallax: function () {
      var st = { trigger: '.hero-parallax', start: 'top top', end: 'bottom top', scrub: 1 };
      gsap.to('.px-back', { yPercent: 18, scale: 1.14, ease: 'none', scrollTrigger: st });
      gsap.to('.px-copy', { yPercent: -34, ease: 'none', scrollTrigger: st });
      gsap.from('.px-title .ln > span', { yPercent: 130, stagger: .12, duration: 1, ease: 'power3.out', delay: .2 });
      gsap.from('.px-copy .eyebrow, .px-copy .lead', { opacity: 0, y: 20, duration: .8, delay: .6, ease: 'power3.out' });
      if (!mobile) window.addEventListener('mousemove', function (e) {
        var x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
        gsap.to('.px-back', { x: x * -34, y: y * -22, duration: .7 });
        gsap.to('.px-copy', { x: x * 24, y: y * 16, duration: .7 });
      });
    },
    /* 11 글자 + 자석 */
    split: function () {
      var head = document.querySelector('.sp-head');
      if (head) { head.innerHTML = head.dataset.text.split('').map(function (c) { return c === ' ' ? '<span class="ch">&nbsp;</span>' : '<span class="ch">' + c + '</span>'; }).join(''); }
      gsap.from('.sp-head .ch', { yPercent: 130, rotateX: -90, opacity: 0, stagger: .04, duration: .9, ease: 'back.out(1.6)', delay: .2 });
      gsap.from('.sp-eyebrow, .sp-lead, .sp-cta', { y: 24, opacity: 0, stagger: .12, duration: .8, delay: .6, ease: 'power3.out' });
      var marq = gsap.to('.sp-marq-track', { xPercent: -50, repeat: -1, duration: 18, ease: 'none' });
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { var v = gsap.utils.clamp(-4, 4, s.getVelocity() / 400); gsap.to(marq, { timeScale: v === 0 ? 1 : v, duration: .4, overwrite: true }); } });
      initMagnetic();
    },
    /* 12 텍스트 마스크 줌 (00_scroll 1-2) — 글자 안 사진이 거대화→풀스크린 */
    typezoom: function () {
      gsap.set('.tz-reveal', { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: '.hero-typezoom', start: 'top top', end: '+=170%', pin: true, scrub: 1 } })
        .to('.tz-word', { scale: 22, ease: 'power2.in' }, 0)
        .to('.tz-reveal', { opacity: 1, ease: 'none' }, .6)
        .from('.tz-copy', { opacity: 0, yPercent: 24, ease: 'none' }, .72);
    },
    /* 13 포커스 & 블러 (00_scroll 2-9) — 경량(핀 없음), BASIC 적합 */
    focus: function () {
      gsap.from('.fc-bg', mobile ? { opacity: 0, duration: 1.2 } : { filter: 'blur(22px)', scale: 1.12, duration: 1.6, ease: 'power2.out' });
      gsap.from('.fc-head > span', { yPercent: 120, filter: mobile ? 'none' : 'blur(10px)', opacity: 0, stagger: .14, duration: 1, ease: 'power3.out', delay: .2 });
      gsap.from('.fc-copy .eyebrow, .fc-copy .lead', { opacity: 0, y: 20, stagger: .1, duration: .8, delay: .7, ease: 'power3.out' });
      gsap.to('.fc-bg', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero-focus', start: 'top top', end: 'bottom top', scrub: true } });
    },
    /* 14 스크롤 왜곡 틸트 (00_scroll 3-15) — 속도 기반 skew + 패럴랙스 */
    tilt: function () {
      gsap.from('.tl-copy > *', { yPercent: 120, opacity: 0, stagger: .1, duration: 1, ease: 'power3.out', delay: .2 });
      gsap.to('.tl-img', { yPercent: 16, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero-tilt', start: 'top top', end: 'bottom top', scrub: true } });
      if (!mobile) {
        var set = gsap.quickSetter('.tl-img', 'skewY', 'deg'), clamp = gsap.utils.clamp(-8, 8), p = { s: 0 };
        ScrollTrigger.create({ onUpdate: function (self) { var sk = clamp(self.getVelocity() / -360); if (Math.abs(sk) > Math.abs(p.s)) { p.s = sk; gsap.to(p, { s: 0, duration: .6, ease: 'power3', overwrite: true, onUpdate: function () { set(p.s); } }); } } });
      }
    }
  };

  /* ---- 진입: body[data-hero=slug] 1개 실행 ---- */
  function run() {
    var slug = document.body.getAttribute('data-hero');
    if (!slug) return;
    var live = boot();
    if (live && INIT[slug]) INIT[slug]();
    else document.body.classList.add('no-fx'); /* 폴백: 최종 상태 노출 */
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  /* 외부 참조용 */
  window.SW_HEROES = Object.keys(INIT);
})();
