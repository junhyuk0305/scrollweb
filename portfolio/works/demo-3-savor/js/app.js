/* ===========================================================
   NOTTE 노트 — 시즈널 다이닝 & 와인바 (서울 한남) 멀티페이지 — 공유 스크립트
   - 캠핑(별헤는밤) PRO 엔진을 다이닝 톤에 맞춰 적응
   - Lenis ↔ ScrollTrigger 동기화
   - prefers-reduced-motion: 트리거 미생성 + 최종상태 즉시노출
   - 모바일 햄버거 / nav 활성화(aria-current)
   - 예약/문의 폼 검증 + 완료 메시지(메일 알림 안내)
   - 갤러리 라이트박스 + 필터
   - 메뉴 탭 전환(코스/단품/와인)
   - 시그니처1: 시그니처 메뉴 가로 스크롤 스크롤리텔링
   - 시그니처2+고급전환: 공간 핀 + 마스크(clip-path) 와이프
   - 히어로 패럴랙스/축소 · 카운트업 · 스토리 단어 리빌
   =========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width:760px)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupLoader();
    setupMobileMenu();
    setActiveNav();
    setupMenuTabs();
    setupForm();
    setupLightbox();
    setupGalleryFilter();
    setupMotion();
  }

  /* ----- 브랜드 인트로 로더 (PRO) -----
     - window.load 후 GSAP로 페이드/와이프 아웃 → display:none + 스크롤 해제
     - reduced-motion 또는 gsap 미로드 시 즉시 제거(깜빡임 없음)
     - 안전장치: 최대 3.5s 후 강제 제거(무한로딩 방지) */
  function setupLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    document.body.classList.add('is-loading'); // 로딩 중 스크롤 잠금

    function remove(animate) {
      if (!loader || loader.hasAttribute('hidden')) return;
      function done() {
        loader.setAttribute('hidden', '');
        document.body.classList.remove('is-loading');
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }
      if (animate && typeof gsap !== 'undefined') {
        gsap.to(loader.querySelector('.ld-inner'), { opacity: 0, y: -18, duration: 0.4, ease: 'power2.in' });
        gsap.to(loader, { opacity: 0, duration: 0.6, delay: 0.18, ease: 'power2.inOut', onComplete: done });
      } else {
        done();
      }
    }

    // 즉시 제거 케이스: 모션 차단 / 라이브러리 미로드
    if (reduce || typeof gsap === 'undefined') {
      requestAnimationFrame(function () { remove(false); });
      return;
    }

    var removed = false;
    window.addEventListener('load', function () {
      if (removed) return; removed = true;
      setTimeout(function () { remove(true); }, 350);
    });
    setTimeout(function () { if (!removed) { removed = true; remove(true); } }, 3500);
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

  /* ----- 메뉴 탭 (코스/단품/와인) ----- */
  function setupMenuTabs() {
    var tabs = document.querySelectorAll('#menuTabs button');
    if (!tabs.length) return;
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.menu-panel').forEach(function (p) { p.classList.remove('show'); });
        var panel = document.getElementById('tab-' + btn.dataset.tab);
        if (panel) panel.classList.add('show');
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
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
        if (box) { box.textContent = msg || box.textContent; box.classList.add('show'); box.style.display = 'block'; }
      } else {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        if (box) { box.classList.remove('show'); box.style.display = 'none'; }
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
        if (ab) { ab.classList.add('show'); ab.style.display = 'block'; }
        ok = false; first = first || agree;
      } else if (agree) {
        var ab2 = agree.closest('.consent').querySelector('.err');
        if (ab2) { ab2.classList.remove('show'); ab2.style.display = 'none'; }
      }
      if (!ok) { if (first) first.focus(); return; }
      var fields = document.getElementById('formFields');
      if (fields) fields.style.display = 'none';
      var okBox = document.getElementById('formOk');
      if (okBox) { okBox.style.display = 'block'; okBox.classList.add('show'); okBox.focus && okBox.focus(); }
    });

    [name, tel].forEach(function (f) {
      if (!f) return;
      f.addEventListener('input', function () { setErr(f, false); });
    });
    if (agree) agree.addEventListener('change', function () {
      var ab = agree.closest('.consent').querySelector('.err');
      if (ab && agree.checked) { ab.classList.remove('show'); ab.style.display = 'none'; }
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
      // CSS pre-hide(html.js)를 확실히 끄고 폴백 노출
      document.documentElement.classList.remove('js');
      document.documentElement.classList.add('no-js');
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
        yPercent: 16, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-inner', {
        y: -50, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true }
      });
    }

    // 스토리 단어 리빌 (em → 골드, 단어 단위)
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

    // 일반 이미지 패럴랙스 (데스크톱)
    if (!isMobile) {
      gsap.utils.toArray('.pimg-wrap .pimg').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: img.closest('.pimg-wrap'), start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }

    // 시즌 마키 (스크롤 방향·속도 반응)
    setupMarquee();

    // 카운트업
    gsap.utils.toArray('.count').forEach(function (el) {
      var to = +el.dataset.to, dec = +el.dataset.dec || 0;
      var obj = { v: 0 };
      gsap.to(obj, { v: to, ease: 'none', snap: dec ? {} : { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 55%', scrub: 1 },
        onUpdate: function () { el.textContent = obj.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); } });
    });

    // 시그니처1: 가로 스크롤 핀 구간 (시그니처 메뉴 스크롤리텔링)
    setupHorizontalScroll();
    // 시그니처2 + 고급전환: 핀 + 마스크 와이프 (공간)
    setupMaskReveal();

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 600);
  }

  /* ----- 시즌 마키: 스크롤 방향·속도에 반응하는 무한 흐름 ----- */
  function setupMarquee() {
    var track = document.getElementById('marquee');
    if (!track) return;
    var loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 28, ease: 'none' });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (s) {
        var v = gsap.utils.clamp(0.6, 3, Math.abs(s.getVelocity()) / 600 + 1);
        gsap.to(loop, { timeScale: s.direction * v, duration: 0.3, overwrite: true });
      }
    });
  }

  /* ----- 시그니처1: 가로 스크롤 핀 구간 (시그니처 메뉴) -----
     데스크톱 한정: 섹션을 핀 고정하고 세로 스크롤을 가로 이동으로 변환.
     모바일/reduced-motion은 CSS가 세로 스택으로 폴백 → 핀 미생성. */
  function setupHorizontalScroll() {
    if (isMobile) return; // 모바일은 폴백(세로 스택)
    var track = document.querySelector('.htrack');
    var wrap = track && track.closest('.htrack-wrap');
    if (!track || !wrap) return;

    var getScroll = function () {
      return Math.max(0, track.scrollWidth - window.innerWidth);
    };
    if (getScroll() <= 0) return;

    var bar = document.getElementById('sigBar');
    var cards = gsap.utils.toArray(track.querySelectorAll('.sig-card'));
    var stepNum = document.getElementById('sigStepNum');
    var stepLabel = document.getElementById('sigStepLabel');

    // 도입 안내(캡션·스테퍼)를 실제로 노출 (이전엔 .on 미부여로 영구 숨김)
    var cap = document.querySelector('.htrack-cap');
    if (cap) cap.classList.add('on');
    var stepper = document.getElementById('sigStepper');
    if (stepper) stepper.classList.add('on');

    // 카드 라벨(번호·디시명) 미리 수집 — 스테퍼 동기화에 사용
    var labels = cards.map(function (c) {
      var n = c.querySelector('.sig-num');
      var nameEl = c.querySelector('.sig-name');
      var name = nameEl ? (nameEl.childNodes[0].textContent || '').trim() : '';
      return { num: n ? n.textContent.trim() : '', name: name };
    });
    var curStep = -1;
    function setStep(i) {
      if (i === curStep || i < 0 || i >= labels.length) return;
      curStep = i;
      if (stepNum) stepNum.textContent = labels[i].num;
      if (stepLabel) stepLabel.textContent = labels[i].name;
    }
    setStep(0);

    var tween = gsap.to(track, {
      x: function () { return -getScroll(); },
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top top',
        end: function () { return '+=' + getScroll(); },
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: function (s) {
          if (bar) bar.style.width = (s.progress * 100) + '%';
          // 진행률 → 현재 카드 인덱스 (스테퍼 동기화)
          setStep(Math.min(labels.length - 1, Math.floor(s.progress * labels.length + 0.0001)));
        }
      }
    });

    // 각 카드: 진입 시 안쪽 이미지 확장 + 텍스트 단어/요소 순차 리빌 (수평 진행에 동기)
    cards.forEach(function (card, idx) {
      var img = card.querySelector('.sig-img img');
      if (img) {
        gsap.fromTo(img, { scale: 1.26 }, { scale: 1.04, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'center center', scrub: 1 } });
      }

      // 디시명을 단어 단위로 분리해 리빌(small 보존) → "텍스트 애니메이션" 강화
      var nameEl = card.querySelector('.sig-name');
      var nameWords = nameEl ? splitNameWords(nameEl) : [];
      var others = card.querySelectorAll('.sig-cat,.sig-desc,.sig-pair');
      var numEl = card.querySelector('.sig-num');

      // 첫 카드는 핀 진입 시 이미 화면에 있으므로 즉시 재생(start를 늦추면 안 보임).
      // 이후 카드는 카드 왼쪽 엣지가 뷰포트 우측에서 들어올 때(left 92%) 트리거.
      // pre-hide된 .sig-name 컨테이너는 즉시 보이게(내부 .nw가 마스크 리빌 담당)
      if (nameEl) gsap.set(nameEl, { opacity: 1 });

      // 텍스트 진입을 scrub 타임라인으로 — 카드의 가로 가시 구간(left right → center 58%)에
      // 매핑해 어떤 스크롤 방식(휠/점프/터치)에도 progress에 따라 항상 올바른 상태가 된다.
      // 첫 카드는 핀 진입 시 이미 화면 안이므로 트리거를 wrap 진입에 건다.
      var st = (idx === 0)
        ? { trigger: wrap, start: 'top 80%', end: 'top 30%', scrub: 1 }
        : { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 30%', scrub: 1 };

      // CSS가 cat/desc/pair/num을 pre-hide(opacity:0)하므로 fromTo로 명시 종료값(1) 지정.
      // (from은 현재값=0을 종료값으로 잡아 영원히 0이 되는 버그가 됨)
      var tl = gsap.timeline({ scrollTrigger: st });
      if (numEl) tl.fromTo(numEl, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, ease: 'power2.out' }, 0);
      var catEl = card.querySelector('.sig-cat');
      if (catEl) tl.fromTo(catEl, { opacity: 0, x: -22 }, { opacity: 1, x: 0, ease: 'power2.out' }, 0.05);
      if (nameWords.length) {
        tl.fromTo(nameWords, { yPercent: 120 }, { yPercent: 0, stagger: 0.12, ease: 'power3.out' }, 0.12);
      } else if (nameEl) {
        tl.fromTo(nameEl, { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: 'power3.out' }, 0.12);
      }
      var descEl = card.querySelector('.sig-desc');
      if (descEl) tl.fromTo(descEl, { y: 26, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out' }, 0.45);
      var pairEl = card.querySelector('.sig-pair');
      if (pairEl) tl.fromTo(pairEl, { y: 18, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out' }, 0.62);
    });
  }

  /* sig-name을 단어 span(.nw)으로 분리. small(영문 보조명)은 통째로 한 단위로 유지.
     overflow:hidden 래퍼로 yPercent 마스크 리빌이 깔끔하게 보이도록. */
  function splitNameWords(nameEl) {
    var small = nameEl.querySelector('small');
    var smallClone = small ? small.cloneNode(true) : null;
    // 본 디시명 텍스트(첫 텍스트 노드)만 단어 분리
    var mainText = (nameEl.childNodes[0] && nameEl.childNodes[0].nodeType === 3)
      ? nameEl.childNodes[0].textContent.trim() : nameEl.textContent.trim();
    nameEl.innerHTML = '';
    var words = [];
    mainText.split(' ').forEach(function (w, i) {
      if (i) nameEl.appendChild(document.createTextNode(' '));
      var mask = document.createElement('span');
      mask.style.display = 'inline-block';
      mask.style.overflow = 'hidden';
      mask.style.verticalAlign = 'top';
      var inner = document.createElement('span');
      inner.className = 'nw';
      inner.style.display = 'inline-block';
      inner.textContent = w;
      mask.appendChild(inner);
      nameEl.appendChild(mask);
      words.push(inner);
    });
    if (smallClone) { nameEl.appendChild(document.createTextNode(' ')); nameEl.appendChild(smallClone); }
    return words;
  }

  /* ----- 시그니처2 + 고급전환: 핀 + 마스크(clip-path) 와이프 -----
     핀 고정 상태에서 원형 마스크가 열리며 공간/요리 이미지가 드러난다.
     reduced-motion은 CSS로 완전 개방, 모바일은 정적 노출(핀 미생성). */
  function setupMaskReveal() {
    var stage = document.querySelector('.mask-stage');
    if (!stage) return;
    var reveal = stage.querySelector('.ms-reveal');
    var copy = stage.querySelector('.ms-copy');
    if (!reveal) return;

    if (isMobile) { reveal.style.clipPath = 'none'; return; } // 모바일 정적 노출

    gsap.fromTo(reveal,
      { clipPath: 'circle(14% at 50% 50%)' },
      {
        clipPath: 'circle(75% at 50% 50%)', ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top top', end: '+=90%', pin: true, scrub: 1, anticipatePin: 1 }
      });

    if (copy) {
      gsap.from(copy, {
        opacity: 0, y: 30, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top top', end: '+=45%', scrub: 1 }
      });
    }
  }

  /* 데스크톱 플로팅 CTA 노출 토글 */
  function setupFloatCta(y) {
    var f = document.getElementById('floatCta');
    if (!f) return;
    f.style.display = (y > window.innerHeight * 0.55 && !isMobile) ? 'inline-flex' : 'none';
  }

  /* 텍스트를 단어 span으로 분리 (em 보존, em은 골드) */
  function splitWords(node) {
    node.querySelectorAll('em').forEach(function (em) {
      var frag = document.createDocumentFragment();
      em.textContent.split(' ').forEach(function (w, i) {
        if (i) frag.appendChild(document.createTextNode(' '));
        var s = document.createElement('span'); s.className = 'w'; s.style.color = 'var(--gold)'; s.style.fontStyle = 'italic'; s.style.fontFamily = 'var(--fancy)'; s.textContent = w; frag.appendChild(s);
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