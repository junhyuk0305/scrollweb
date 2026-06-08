/* ===========================================================
   별헤는밤 STARGAZE 멀티페이지 — 공유 스크립트
   - Lenis ↔ ScrollTrigger 동기화
   - prefers-reduced-motion: 트리거 미생성 + 최종상태 즉시노출
   - 모바일 햄버거 / nav 활성화(aria-current)
   - 예약 폼 검증 + 완료 메시지
   - 갤러리 라이트박스 + 필터
   - 예약 캘린더 UI(체크인/아웃 선택, 데모용 마감일 생성)
   - 히어로 패럴랙스/축소 · 사이트 패럴랙스 · 카운트업 · 철학 단어 리빌
   =========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width:760px)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupMobileMenu();
    setActiveNav();
    setupForm();
    setupLightbox();
    setupGalleryFilter();
    buildCalendar();
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

  /* ----- 현재 페이지 nav 활성화 ----- */
  function setActiveNav() {
    var path = location.pathname.split('/').pop();
    if (!path) path = 'index.html';
    document.querySelectorAll('.menu a[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
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
      var fields = document.getElementById('formFields');
      if (fields) fields.style.display = 'none';
      var okBox = document.getElementById('formOk');
      if (okBox) { okBox.classList.add('show'); okBox.focus && okBox.focus(); }
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

  /* ----- 갤러리 필터 ----- */
  function setupGalleryFilter() {
    var bar = document.getElementById('galFilter');
    if (!bar) return;
    var items = document.querySelectorAll('.gallery .gitem');
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var cat = btn.getAttribute('data-filter');
      bar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn); });
      items.forEach(function (it) {
        var show = cat === 'all' || it.getAttribute('data-cat') === cat;
        it.style.display = show ? '' : 'none';
      });
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  }

  /* ----- 예약 캘린더 (데모 목업) ----- */
  function buildCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;
    var monthLbl = document.getElementById('calMonth');
    var info = document.getElementById('calInfo');
    var ciOut = document.getElementById('calCi');
    var coOut = document.getElementById('calCo');
    var dows = ['일', '월', '화', '수', '목', '금', '토'];
    var view = new Date(2026, 5, 1); // 2026-06
    var checkIn = null, checkOut = null;

    function soldSet(y, m) {
      var set = {};
      var seed = (y * 12 + m);
      for (var d = 1; d <= 31; d++) {
        if (((d * 7 + seed * 3) % 11) === 0 || ((d + seed) % 13) === 0) set[d] = true;
      }
      return set;
    }
    function fmt(o) { return (o.m + 1) + '월 ' + o.d + '일'; }

    function render() {
      var y = view.getFullYear(), m = view.getMonth();
      if (monthLbl) monthLbl.textContent = y + '년 ' + (m + 1) + '월';
      var first = new Date(y, m, 1).getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var sold = soldSet(y, m);
      var html = dows.map(function (d, i) { return '<div class="dow' + (i === 0 ? ' sun' : '') + '">' + d + '</div>'; }).join('');
      for (var i = 0; i < first; i++) html += '<div class="day empty"></div>';
      for (var d = 1; d <= days; d++) {
        var dow = new Date(y, m, d).getDay();
        var cls = 'day avail';
        if (dow === 0) cls += ' sun';
        if (sold[d]) cls = 'day soldout';
        html += '<div class="' + cls + '" data-d="' + d + '">' + d + '</div>';
      }
      grid.innerHTML = html;
      paintRange();
    }
    function paintRange() {
      if (!checkIn) return;
      var y = view.getFullYear(), m = view.getMonth();
      grid.querySelectorAll('.day[data-d]').forEach(function (el) {
        var d = +el.dataset.d;
        var ci = checkIn.y === y && checkIn.m === m && checkIn.d === d;
        var co = checkOut && checkOut.y === y && checkOut.m === m && checkOut.d === d;
        el.classList.toggle('sel', ci || co);
        if (checkOut && checkIn.y === y && checkIn.m === m && checkOut.y === y && checkOut.m === m) {
          el.classList.toggle('range', d > checkIn.d && d < checkOut.d);
        }
      });
    }
    grid.addEventListener('click', function (e) {
      var el = e.target.closest('.day.avail');
      if (!el) return;
      var o = { y: view.getFullYear(), m: view.getMonth(), d: +el.dataset.d };
      if (!checkIn || checkOut) {
        checkIn = o; checkOut = null;
        if (info) info.textContent = '체크아웃 날짜를 선택해 주세요.';
      } else {
        var a = checkIn.y * 372 + checkIn.m * 31 + checkIn.d;
        var b = o.y * 372 + o.m * 31 + o.d;
        if (b <= a) { checkIn = o; if (info) info.textContent = '체크아웃 날짜를 선택해 주세요.'; }
        else {
          checkOut = o; var nights = b - a;
          if (info) info.innerHTML = '<b>' + fmt(checkIn) + ' → ' + fmt(checkOut) + '</b> · ' + nights + '박 선택됨 — 아래 직접 예약 또는 전화로 확정해 주세요.';
        }
      }
      if (ciOut) ciOut.textContent = checkIn ? fmt(checkIn) : '—';
      if (coOut) coOut.textContent = checkOut ? fmt(checkOut) : '—';
      render();
    });
    var prev = document.getElementById('calPrev');
    var next = document.getElementById('calNext');
    if (prev) prev.onclick = function () { view.setMonth(view.getMonth() - 1); render(); };
    if (next) next.onclick = function () { view.setMonth(view.getMonth() + 1); render(); };
    render();
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

    if (reduce || typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      showAllStatic();
      setupFloatCta(window.scrollY);
      window.addEventListener('scroll', function () { setupFloatCta(window.scrollY); }, { passive: true });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', function (e) { ScrollTrigger.update(); setupFloatCta(e.animatedScroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 페이지 내 앵커 → Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var h = document.querySelector('header');
          var off = (h ? h.offsetHeight : 0) + 10;
          lenis.scrollTo(target, { offset: -off, duration: 1.1 });
        }
      });
    });

    // 히어로 패럴랙스 + 축소 (홈)
    var heroMedia = document.getElementById('heroMedia');
    var hero = document.querySelector('.hero');
    if (heroMedia && hero) {
      gsap.to(heroMedia, {
        yPercent: 18, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-inner', {
        y: -50, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true }
      });
    }

    // 철학 단어 리빌
    var phil = document.getElementById('phil');
    if (phil) {
      splitWords(phil);
      gsap.from(phil.querySelectorAll('.w'), {
        yPercent: 110, opacity: 0, stagger: 0.03, ease: 'power3.out',
        scrollTrigger: { trigger: phil, start: 'top 82%', end: 'bottom 62%', scrub: 1 }
      });
    }

    // 일반 fade-up
    faders.forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true } });
    });

    // 사이트 미디어 패럴랙스 (데스크톱)
    if (!isMobile) {
      gsap.utils.toArray('.site-media .pimg').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: img.closest('.site-media'), start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }

    // 카운트업
    gsap.utils.toArray('.count').forEach(function (el) {
      var to = +el.dataset.to, dec = +el.dataset.dec || 0;
      var obj = { v: 0 };
      gsap.to(obj, { v: to, ease: 'none', snap: dec ? {} : { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 55%', scrub: 1 },
        onUpdate: function () { el.textContent = obj.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); } });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 600);
  }

  /* 데스크톱 플로팅 CTA 노출 토글 */
  function setupFloatCta(y) {
    var f = document.getElementById('floatCta');
    if (!f) return;
    f.style.display = (y > window.innerHeight * 0.55 && !isMobile) ? 'inline-flex' : 'none';
  }

  /* 텍스트를 단어 span으로 분리 (em 보존) */
  function splitWords(node) {
    node.querySelectorAll('em').forEach(function (em) {
      var frag = document.createDocumentFragment();
      em.textContent.split(' ').forEach(function (w, i) {
        if (i) frag.appendChild(document.createTextNode(' '));
        var s = document.createElement('span'); s.className = 'w'; s.style.color = 'var(--amber)'; s.textContent = w; frag.appendChild(s);
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
