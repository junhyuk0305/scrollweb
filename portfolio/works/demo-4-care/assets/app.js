/* ===========================================================
   맑은숲한의원 멀티페이지 — 공유 스크립트
   - Lenis ↔ ScrollTrigger 동기화 (가벼운 fade-up만, 절제)
   - prefers-reduced-motion: 트리거 미생성 + 최종상태 즉시노출
   - 모바일 햄버거 메뉴 토글
   - 현재 경로 기반 nav 활성화 (aria-current)
   - 상담 폼 검증 + 완료 메시지
   - 시설 갤러리 라이트박스
   =========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupMobileMenu();
    setActiveNav();
    setupForm();
    setupLightbox();
    setupMotion();
  }

  /* ----- 모바일 햄버거 메뉴 ----- */
  function setupMobileMenu() {
    var hamb = document.getElementById('hamb');
    var menu = document.getElementById('menu');
    if (!hamb || !menu) return;
    hamb.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamb.textContent = open ? '✕' : '☰';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        hamb.setAttribute('aria-expanded', 'false');
        hamb.textContent = '☰';
      }
    });
  }

  /* ----- 현재 페이지 nav 활성화 (HTML의 aria-current 보강) ----- */
  function setActiveNav() {
    var path = location.pathname.split('/').pop();
    if (!path) path = 'index.html';
    var links = document.querySelectorAll('.menu a[data-nav]');
    links.forEach(function (a) {
      var target = a.getAttribute('data-nav');
      if (target === path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ----- 상담 폼 검증 + 완료 메시지 ----- */
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

      if (!agree.checked) {
        var ab = agree.closest('.consent').querySelector('.err');
        if (ab) ab.classList.add('show');
        ok = false; first = first || agree;
      } else {
        var ab2 = agree.closest('.consent').querySelector('.err');
        if (ab2) ab2.classList.remove('show');
      }

      if (!ok) { if (first) first.focus(); return; }

      // 데모: 실제 전송 없음
      document.getElementById('formFields').style.display = 'none';
      var okBox = document.getElementById('formOk');
      okBox.classList.add('show');
      okBox.focus && okBox.focus();
    });

    // 입력 중 에러 해제
    [name, tel].forEach(function (f) {
      if (!f) return;
      f.addEventListener('input', function () { setErr(f, false); });
    });
    if (agree) agree.addEventListener('change', function () {
      var ab = agree.closest('.consent').querySelector('.err');
      if (ab && agree.checked) ab.classList.remove('show');
    });
  }

  /* ----- 시설 갤러리 라이트박스 ----- */
  function setupLightbox() {
    var items = document.querySelectorAll('[data-lightbox]');
    if (!items.length) return;
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
    items.forEach(function (el) {
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

  /* ----- 모션: Lenis + GSAP ScrollTrigger -----
     의료 톤 = "절제된 밀도": 모든 요소가 부드럽게 진입하되 과한 연출은 배제.
     데이터 훅: .fade-up / [data-stagger] / [data-speed] / [data-count] / [data-zoom] / .pin-track
     reduced-motion·CDN 실패 시 전부 즉시 최종상태로 노출(폴백). */
  function setupMotion() {
    var faders = document.querySelectorAll('.fade-up');
    var staggers = document.querySelectorAll('[data-stagger]');
    var parallax = document.querySelectorAll('[data-speed]');
    var counters = document.querySelectorAll('[data-count]');
    var zooms = document.querySelectorAll('[data-zoom]');

    function showFallback() {
      faders.forEach(function (el) { el.classList.add('is-in'); el.style.opacity = 1; el.style.transform = 'none'; });
      staggers.forEach(function (c) {
        Array.prototype.forEach.call(c.children, function (k) { k.style.opacity = 1; k.style.transform = 'none'; });
      });
      parallax.forEach(function (el) { el.style.transform = 'none'; });
      zooms.forEach(function (el) { el.style.transform = 'none'; });
      counters.forEach(function (el) {
        var t = el.getAttribute('data-count');
        el.textContent = (el.getAttribute('data-prefix') || '') + t + (el.getAttribute('data-suffix') || '');
      });
    }

    if (reduce || typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      // CSS pre-hide(.js 스코프) 해제 → 콘텐츠 100% 노출 보장
      document.documentElement.classList.remove('js');
      document.documentElement.classList.add('no-js');
      showFallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 느린 관성 — 고령 환자도 편안
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 페이지 내 앵커(있을 경우) → Lenis 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var h = document.querySelector('header');
          var c = document.querySelector('.ctabar');
          var off = (h ? h.offsetHeight : 0) + (c ? c.offsetHeight : 0) + 8;
          lenis.scrollTo(target, { offset: -off });
        }
      });
    });

    // (1) 진입 페이드업 — 절제된 transform/opacity, 1회
    faders.forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true } });
    });

    // (2) stagger — 컨테이너의 자식 카드가 순차 진입
    staggers.forEach(function (c) {
      gsap.fromTo(c.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: c, start: 'top 85%', once: true } });
    });

    // (3) parallax — 이미지/요소 시차 (의료 톤: 약하게)
    parallax.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-speed')) || 0.15;
      gsap.to(el, {
        yPercent: -speed * 100, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // (4) 히어로 줌/시차 — 진입 시 사진 살짝 확대 후 안착
    zooms.forEach(function (el) {
      gsap.fromTo(el, { scale: 1.12, y: 14 },
        { scale: 1, y: 0, duration: 1.4, ease: 'power2.out' });
    });

    // (5) 숫자 카운트업
    counters.forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count')) || 0;
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      var obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.4, ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () { el.textContent = pre + Math.round(obj.v) + suf; }
      });
    });

    // (6) 시그니처(절제) — 진료 단계 핀 트랙: 스크롤에 맞춰 단계 강조 (pin 1개, ≤3 예산 준수)
    var track = document.querySelector('.pin-track');
    if (track) {
      var steps = track.querySelectorAll('.pt-step');
      var fill = track.querySelector('.pt-progress span');
      var stNum = track.querySelector('.pt-num');
      var stTitle = track.querySelector('.pt-stage h3');
      var stDesc = track.querySelector('.pt-stage-grid p');
      var lastIdx = -1;
      if (steps.length) {
        ScrollTrigger.create({
          trigger: track, start: 'top top+=120', end: '+=' + (steps.length * 60) + '%',
          pin: '.pt-stage', scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (s) {
            var idx = Math.min(steps.length - 1, Math.floor(s.progress * steps.length));
            steps.forEach(function (st, i) { st.classList.toggle('on', i === idx); });
            if (fill) fill.style.height = (s.progress * 100) + '%';
            if (idx !== lastIdx) {
              lastIdx = idx;
              var cur = steps[idx];
              var h4 = cur.querySelector('h4'), p = cur.querySelector('p');
              if (stNum) stNum.textContent = 'STEP 0' + (idx + 1) + ' / 0' + steps.length;
              if (stTitle && h4) stTitle.textContent = h4.textContent;
              if (stDesc && p) stDesc.textContent = p.textContent;
              gsap.fromTo('.pt-stage-inner', { opacity: 0.4, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
            }
          }
        });
      }
    }

    // 목요일 야간진료 행 살짝 강조 (있는 페이지에서만)
    var thu = document.getElementById('thuRow');
    if (thu) {
      gsap.fromTo(thu, { backgroundColor: 'rgba(228,242,236,0)' },
        { backgroundColor: 'rgba(228,242,236,1)', duration: 0.9, ease: 'power1.out',
          scrollTrigger: { trigger: thu, start: 'top 82%', once: true } });
    }

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
