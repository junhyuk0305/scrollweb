/* =========================================================
   공통 모션 엔진 (scroll-guide 46종 기반, 데이터 구동)
   - 룩은 CSS, 여기는 모션만. body[data-tier]로 강도 조절.
   - 원칙: 모든 요소가 움직인다(밀도). 모션은 콘텐츠 위 progressive enhancement.
   - reduced-motion / CDN실패 → 콘텐츠 즉시 노출 폴백.
   효과 훅:
     .reveal | [data-reveal="up|left|right|scale|mask"]  진입 리빌(전 요소 기본)
     [data-split]            제목 단어 리빌 (#8)
     [data-parallax], .pimg  이미지 패럴랙스 (#7/#11)
     [data-hero-shrink]      히어로 축소&락 (#1)   / .hero__bg img  히어로 줌
     .marquee>.marquee__track 키네틱 마퀴 (#6)
     .hscroll                가로 스크롤 (#16)
     [data-count]            숫자 카운트업 (#27)
     [data-bg]               배경색 모핑 (#21)
     .pin-seq                이미지 시퀀스 크로스페이드 (#12 유사)
     [data-stagger]          자식 순차
     .sitenav / .progress / .float-cta  네비/진행/CTA
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');

  var tier = document.body.getAttribute('data-tier') || 'standard';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  function showAll() {
    document.querySelectorAll('[data-anim],[data-reveal],.reveal,[data-split],[data-stagger]').forEach(function (el) {
      el.style.opacity = 1; el.style.transform = 'none'; el.style.clipPath = 'none';
      el.classList.add('is-in');
    });
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var dec = +el.getAttribute('data-dec') || 0;
      el.textContent = (+el.getAttribute('data-count')).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    });
    var pre = document.querySelector('.preloader'); if (pre) pre.style.display = 'none';
  }

  if (reduce) { showAll(); initUIonly(); return; }

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, Lenis = window.Lenis;
  if (!gsap) { showAll(); initUIonly(); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ↔ ScrollTrigger ---------- */
  var lenis = null;
  if (Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var pFactor = tier === 'pro' ? 1 : tier === 'standard' ? .75 : .55;

  /* ---------- 프리로더 ---------- */
  var pre = document.querySelector('.preloader');
  if (pre) {
    var bar = pre.querySelector('.preloader__bar i');
    gsap.timeline()
      .from(pre.querySelector('.preloader__mark'), { yPercent: 110, duration: .8, ease: 'power3.out' })
      .to(bar, { width: '100%', duration: 1.0, ease: 'power1.inOut' }, '-=.3')
      .to(pre, { yPercent: -100, duration: .8, ease: 'power3.inOut', onComplete: function () { pre.style.display = 'none'; } }, '+=.1');
  }

  /* ---------- 진입 리빌 (전 요소 기본 밀도) ---------- */
  var revealMap = {
    up:    { from: { opacity: 0, y: 46 },                to: { opacity: 1, y: 0 } },
    left:  { from: { opacity: 0, x: -56 },               to: { opacity: 1, x: 0 } },
    right: { from: { opacity: 0, x: 56 },                to: { opacity: 1, x: 0 } },
    scale: { from: { opacity: 0, scale: .9 },            to: { opacity: 1, scale: 1 } },
    mask:  { from: { clipPath: 'inset(0 0 100% 0)' },    to: { clipPath: 'inset(0 0 0% 0)' } }
  };
  gsap.utils.toArray('.reveal, [data-reveal], [data-anim="fade-up"], [data-anim="reveal-mask"]').forEach(function (el) {
    var kind = el.getAttribute('data-reveal') || (el.getAttribute('data-anim') === 'reveal-mask' ? 'mask' : 'up');
    var m = revealMap[kind] || revealMap.up;
    var d = parseFloat(el.getAttribute('data-delay')) || 0;
    gsap.fromTo(el, m.from, {
      ...m.to, duration: .95, ease: 'power3.out', delay: d,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- stagger (자식 순차) — CSS가 미리 숨기므로 fromTo로 명시 ---------- */
  gsap.utils.toArray('[data-stagger], [data-anim="stagger"]').forEach(function (el) {
    gsap.fromTo(el.children, { opacity: 0, y: 44 }, {
      opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09,
      scrollTrigger: { trigger: el, start: 'top 84%', once: true }
    });
  });

  /* ---------- 단어 리빌 (#8) ---------- */
  gsap.utils.toArray('[data-split]').forEach(function (el) {
    var html = el.innerHTML;
    // <br> 보존하며 단어 분리
    var parts = html.split(/(<br\s*\/?>)/i);
    el.innerHTML = parts.map(function (p) {
      if (/<br/i.test(p)) return p;
      return p.split(/(\s+)/).map(function (w) {
        return /^\s+$/.test(w) || w === '' ? w : '<span class="word">' + w + '</span>';
      }).join('');
    }).join('');
    gsap.from(el.querySelectorAll('.word'), {
      yPercent: 115, opacity: 0, stagger: .045, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* ---------- 히어로 축소&락 (#1) 또는 줌 ---------- */
  var shrink = document.querySelector('[data-hero-shrink]');
  if (shrink && !isMobile) {
    gsap.to(shrink, {
      scale: .82, borderRadius: '28px', ease: 'none',
      scrollTrigger: { trigger: shrink.closest('.hero') || shrink, start: 'top top', end: '+=90%', pin: true, scrub: 1, anticipatePin: 1 }
    });
    var hc = document.querySelector('.hero__inner');
    if (hc) gsap.to(hc, { y: -50, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=55%', scrub: 1 } });
  } else {
    var heroImg = document.querySelector('.hero__bg img');
    if (heroImg) {
      var hs = tier === 'pro' ? 1.18 : tier === 'standard' ? 1.13 : 1.09;
      gsap.to(heroImg, { yPercent: 12, scale: hs, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  /* ---------- 이미지 패럴랙스 (#7/#11) — 전 이미지 기본 ---------- */
  gsap.utils.toArray('[data-parallax], .pimg').forEach(function (el) {
    var amt = (parseFloat(el.getAttribute('data-parallax')) || 8) * pFactor;
    gsap.fromTo(el, { yPercent: -amt }, {
      yPercent: amt, ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- 키네틱 마퀴 (#6) — 스크롤 방향/속도 반응 ---------- */
  gsap.utils.toArray('.marquee').forEach(function (mq) {
    var track = mq.querySelector('.marquee__track'); if (!track) return;
    var x = 0, half = track.scrollWidth / 2, dir = 1;
    window.addEventListener('resize', function () { half = track.scrollWidth / 2; });
    gsap.ticker.add(function () {
      x -= 0.8 * dir;
      if (x <= -half) x += half; if (x > 0) x -= half;
      track.style.transform = 'translateX(' + x + 'px)';
    });
    ScrollTrigger.create({ onUpdate: function (self) { var v = self.getVelocity(); if (v !== 0) dir = v > 0 ? 1 : -1; } });
  });

  /* ---------- 가로 스크롤 (#16) ---------- */
  var hs2 = document.querySelector('.hscroll');
  if (hs2 && !isMobile) {
    var track2 = hs2.querySelector('.hscroll__track');
    gsap.to(track2, {
      x: function () { return -(track2.scrollWidth - window.innerWidth + 80); }, ease: 'none',
      scrollTrigger: { trigger: hs2, start: 'top top', end: function () { return '+=' + (track2.scrollWidth - window.innerWidth + 80); }, scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
    });
  }

  /* ---------- 핀 이미지 시퀀스 (#12 유사) ---------- */
  var seq = document.querySelector('.pin-seq');
  if (seq) {
    var frames = gsap.utils.toArray('.pin-seq .seq-frame');
    if (frames.length > 1) {
      var seqTl = gsap.timeline({ scrollTrigger: { trigger: seq, start: 'top top', end: '+=' + (frames.length * 60) + '%', scrub: true, pin: '.pin-seq .sticky-media' } });
      frames.forEach(function (f, i) { if (i === 0) return; seqTl.to(frames[i - 1], { opacity: 0, duration: .5 }, i - 1).to(f, { opacity: 1, duration: .5 }, i - 1); });
    }
  }

  /* ---------- 배경색 모핑 (#21) ---------- */
  gsap.utils.toArray('[data-bg]').forEach(function (el) {
    gsap.to('body', { backgroundColor: el.getAttribute('data-bg'), ease: 'none', scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 60%', scrub: true } });
  });

  /* ---------- 숫자 카운트업 (#27) ---------- */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0, obj = { v: 0 };
    gsap.to(obj, {
      v: to, duration: 1.6, ease: 'power1.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: function () { el.textContent = obj.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    });
  });

  /* ---------- velocity skew (#15, 절제) ---------- */
  if (!isMobile && tier !== 'basic') {
    var skewEls = gsap.utils.toArray('[data-skew]');
    if (skewEls.length) {
      var set = skewEls.map(function (e) { return gsap.quickSetter(e, 'skewY', 'deg'); });
      var clamp = gsap.utils.clamp(-8, 8), pr = { s: 0 };
      ScrollTrigger.create({ onUpdate: function (self) { var s = clamp(self.getVelocity() / -400); if (Math.abs(s) > Math.abs(pr.s)) { pr.s = s; gsap.to(pr, { s: 0, duration: .6, ease: 'power3', overwrite: true, onUpdate: function () { set.forEach(function (fn) { fn(pr.s); }); } }); } } });
    }
  }

  initUI();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  setTimeout(function () { ScrollTrigger.refresh(); }, 700);

  /* ---------- UI: nav / progress / float-cta ---------- */
  function initUI() {
    var nav = document.querySelector('.sitenav');
    if (nav) {
      ScrollTrigger.create({ start: 'top -80', onUpdate: function (s) { nav.classList.toggle('is-solid', s.scroll() > 80); }, onRefresh: function (s) { nav.classList.toggle('is-solid', s.scroll() > 80); } });
      var tg = nav.querySelector('.sitenav__toggle'), menu = nav.querySelector('.sitenav__menu');
      if (tg && menu) {
        tg.addEventListener('click', function () { tg.classList.toggle('is-open'); menu.classList.toggle('is-open'); });
        menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { tg.classList.remove('is-open'); menu.classList.remove('is-open'); } });
      }
    }
    // 앵커 스무스 + active
    gsap.utils.toArray('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href'); if (!id || id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.2 });
        else window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 70, behavior: 'smooth' });
      });
      if (a.closest('.sitenav__menu')) ScrollTrigger.create({ trigger: t, start: 'top 45%', end: 'bottom 45%', onToggle: function (s) { a.classList.toggle('is-current', s.isActive); } });
    });
    var progress = document.querySelector('.progress');
    if (progress) gsap.to(progress, { width: '100%', ease: 'none', scrollTrigger: { start: 'top top', end: 'max', scrub: .3 } });
    var floatcta = document.querySelector('.float-cta');
    if (floatcta) ScrollTrigger.create({ start: 'top -' + Math.round(window.innerHeight * .6), onUpdate: function (s) { floatcta.classList.toggle('show', s.scroll() > window.innerHeight * .6); } });
    document.querySelectorAll('form[data-demo]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = f.querySelector('.form-result'); if (msg) msg.hidden = false;
        f.querySelectorAll('input,textarea,select,button').forEach(function (i) { i.disabled = true; });
      });
    });
  }
  function initUIonly() { try { initUI(); } catch (e) {} }
})();
