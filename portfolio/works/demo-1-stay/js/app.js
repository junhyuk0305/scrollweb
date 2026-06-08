/* ===========================================================
   고요재 古耀齋 — STANDARD(50만) 멀티페이지 공유 스크립트
   - Lenis ↔ ScrollTrigger 동기화 부트스트랩
   - 시그니처 1종: 홈 히어로 풀스크린 패럴랙스/축소 (홈에만 존재)
   - 진입 모션(fade-up) + 카운트업 + 철학 단어 리빌(진입)
   - 후기 슬라이드 · 예약/문의 폼 검증 · 갤러리 라이트박스
   - 모바일 햄버거 / nav 활성화(aria-current) / 플로팅·스티키 CTA
   - 폴백: reduced-motion / 모바일 / CDN 실패 → 콘텐츠 100% 노출, 핀 미생성
   ※ 로더·마스크 전환·이미지 시퀀스 없음(STANDARD 규격)
   =========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width:760px)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupMobileMenu();
    setActiveNav();
    setupReviewSlider();
    setupForm();
    setupLightbox();
    setupMotion();
  }

  /* ----- 모바일 햄버거 메뉴 ----- */
  function setupMobileMenu() {
    var hamb = document.getElementById('hamb');
    var nav = document.getElementById('nav');
    if (!hamb || !nav) return;
    hamb.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamb.textContent = open ? '✕' : '☰';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        hamb.setAttribute('aria-expanded', 'false');
        hamb.textContent = '☰';
      }
    });
  }

  /* ----- 현재 페이지 nav 활성화(aria-current) ----- */
  function setActiveNav() {
    var path = location.pathname.split('/').pop();
    if (!path) path = 'index.html';
    document.querySelectorAll('.nav a[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ----- 후기 슬라이드(좌우 + 도트 + 키보드) ----- */
  function setupReviewSlider() {
    var slider = document.getElementById('revSlider');
    if (!slider) return;
    var rail = slider.querySelector('.rev-rail');
    var slides = slider.querySelectorAll('.review');
    var prev = slider.querySelector('.rev-prev');
    var next = slider.querySelector('.rev-next');
    var dotsWrap = slider.querySelector('.rev-dots');
    var n = slides.length, idx = 0;

    var dots = [];
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i');
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', (i + 1) + '번 후기');
      d.setAttribute('tabindex', '0');
      (function (j) { d.addEventListener('click', function () { go(j); }); })(i);
      dotsWrap.appendChild(d);
      dots.push(d);
    }
    function go(i) {
      idx = (i + n) % n;
      rail.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('on', k === idx); });
    }
    if (prev) prev.addEventListener('click', function () { go(idx - 1); });
    if (next) next.addEventListener('click', function () { go(idx + 1); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(idx - 1);
      if (e.key === 'ArrowRight') go(idx + 1);
    });
    go(0);
  }

  /* ----- 예약/문의 폼 검증 + 완료 메시지 ----- */
  function setupForm() {
    var form = document.getElementById('bookForm');
    if (!form) return;
    var name = document.getElementById('bf-name');
    var tel = document.getElementById('bf-tel');
    var agree = document.getElementById('bf-agree');

    function setErr(field, show, msg) {
      var box = field.parentElement.querySelector('.err');
      if (show) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        if (box) { box.textContent = msg || box.textContent; box.classList.add('show'); }
      } else {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        if (box) box.classList.remove('show');
      }
    }
    var telPattern = /^[0-9\-\s]{9,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      if (!name.value.trim()) { setErr(name, true, '성함을 입력해 주세요.'); ok = false; first = first || name; }
      else setErr(name, false);
      if (!tel.value.trim() || !telPattern.test(tel.value.trim())) {
        setErr(tel, true, '연락처를 정확히 입력해 주세요.'); ok = false; first = first || tel;
      } else setErr(tel, false);
      if (agree && !agree.checked) {
        var ab = agree.closest('.consent').querySelector('.err');
        if (ab) ab.classList.add('show');
        ok = false; first = first || agree;
      } else if (agree) {
        var ab2 = agree.closest('.consent').querySelector('.err');
        if (ab2) ab2.classList.remove('show');
      }
      if (!ok) { if (first) first.focus(); return; }
      // 판매 시: 여기서 폼 데이터를 메일/예약 시스템으로 전송하도록 action 연결
      var fields = document.getElementById('formFields');
      if (fields) fields.style.display = 'none';
      var okBox = document.getElementById('formOk');
      if (okBox) { okBox.classList.add('show'); if (okBox.focus) okBox.focus(); }
    });

    [name, tel].forEach(function (f) {
      if (!f) return;
      f.addEventListener('input', function () { setErr(f, false); });
    });
    if (agree) agree.addEventListener('change', function () {
      var ab = agree.closest('.consent').querySelector('.err');
      if (ab && agree.checked) ab.classList.remove('show');
    });
  }

  /* ----- 갤러리 라이트박스 ----- */
  function setupLightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var closeBtn = lb.querySelector('.lb-close');
    var lastFocused = null;

    function open(src, alt, cap) {
      lastFocused = document.activeElement;
      lbImg.src = src; lbImg.alt = alt || '';
      lbCap.textContent = cap || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      lbImg.src = '';
      if (lastFocused) lastFocused.focus();
    }
    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function () {
        var img = el.querySelector('img');
        var cap = el.getAttribute('data-cap') || (img ? img.alt : '');
        open(img.getAttribute('data-full') || img.src, img.alt, cap);
      });
    });
    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
  }

  /* ----- 헤더/플로팅 CTA 토글 ----- */
  function header() { return document.getElementById('header'); }
  function onScrollUI(y) {
    var h = header();
    if (h && !h.classList.contains('solid')) h.classList.toggle('scrolled', y > 60);
    var f = document.getElementById('floatCta');
    var s = document.getElementById('stickyCta');
    var show = y > window.innerHeight * 0.55;
    if (f) f.style.display = (show && !isMobile) ? 'inline-flex' : 'none';
    if (s) s.classList.toggle('show', show);
  }

  /* ----- 모션: Lenis + GSAP ScrollTrigger ----- */
  function setupMotion() {
    var faders = document.querySelectorAll('.fade-up');

    function showAllStatic() {
      faders.forEach(function (el) { el.classList.add('is-in'); el.style.opacity = 1; el.style.transform = 'none'; });
      document.querySelectorAll('.count').forEach(function (el) {
        var dec = +el.dataset.dec || 0;
        el.textContent = (+el.dataset.to).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      });
    }

    // 폴백: reduced-motion / GSAP·Lenis 미로드 → 콘텐츠 즉시 노출, 시그니처 미생성
    if (reduce || typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      document.documentElement.classList.remove('js');
      document.documentElement.classList.add('no-js');
      showAllStatic();
      onScrollUI(window.scrollY);
      window.addEventListener('scroll', function () { onScrollUI(window.scrollY); }, { passive: true });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', function (e) { ScrollTrigger.update(); onScrollUI(e.animatedScroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 페이지 내 앵커 → Lenis 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var h = document.querySelector('.site-header');
          var off = (h ? h.offsetHeight : 0) + 10;
          lenis.scrollTo(target, { offset: -off, duration: 1.1 });
        }
      });
    });

    /* === 시그니처(딱 1종): 홈 히어로 풀스크린 패럴랙스 + 축소 ===
       히어로 배경이 스크롤에 따라 패럴랙스로 밀려나며 살짝 확대→
       콘텐츠는 위로 페이드. 풍경이 강점인 펜션의 "주인공" 효과.
       모바일/reduced-motion은 정적 노출(여기 진입 안 함). */
    var heroMedia = document.getElementById('heroMedia');
    var hero = document.querySelector('.hero');
    if (heroMedia && hero && !isMobile) {
      gsap.to(heroMedia, {
        yPercent: 18, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-content', {
        y: -60, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true }
      });
    }

    // 철학 단어 리빌(진입 모션 — 시그니처 아님)
    var phil = document.getElementById('phil');
    if (phil) {
      splitWords(phil);
      gsap.from(phil.querySelectorAll('.w'), {
        yPercent: 110, opacity: 0, stagger: 0.03, ease: 'power3.out',
        scrollTrigger: { trigger: phil, start: 'top 82%', end: 'bottom 62%', scrub: 1 }
      });
    }

    // 일반 진입 모션 fade-up (모든 섹션 "밋밋한 섹션 0")
    faders.forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true } });
    });

    // 카운트업(신뢰 지표)
    gsap.utils.toArray('.count').forEach(function (el) {
      var to = +el.dataset.to, dec = +el.dataset.dec || 0;
      var obj = { v: 0 };
      gsap.to(obj, { v: to, ease: 'none', snap: dec ? {} : { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 55%', scrub: 1 },
        onUpdate: function () { el.textContent = obj.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); } });
    });

    onScrollUI(window.scrollY);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 600);
  }

  /* 텍스트를 단어 span으로 분리 (em 보존) */
  function splitWords(node) {
    node.querySelectorAll('em').forEach(function (em) {
      var frag = document.createDocumentFragment();
      em.textContent.split(' ').forEach(function (w, i) {
        if (i) frag.appendChild(document.createTextNode(' '));
        var s = document.createElement('span'); s.className = 'w'; s.style.color = 'var(--wood-deep)'; s.textContent = w; frag.appendChild(s);
      });
      em.replaceWith(frag);
    });
    var walker = [].slice.call(node.childNodes);
    node.innerHTML = '';
    walker.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(' ').forEach(function (w) {
          if (w === '') { node.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span'); s.className = 'w'; s.textContent = w;
          node.appendChild(s); node.appendChild(document.createTextNode(' '));
        });
      } else { node.appendChild(n); }
    });
  }
})();
