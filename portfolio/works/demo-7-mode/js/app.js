/* ===========================================================
   NOON 누운 — STANDARD(50만) 멀티페이지 공유 스크립트
   - Lenis ↔ ScrollTrigger 동기화
   - prefers-reduced-motion / CDN 실패: 트리거 미생성 + 최종상태 즉시 노출
   - 모바일 드로어 메뉴 / nav active(aria-current는 마크업에서)
   - 문의 폼 검증 + 완료 메시지
   - 후기 보이스 슬라이더(반응형 페이지 단위 이동)
   - 시그니처 1종: 룩북 가로 스크롤(.lb-track / .lb-viewport) — 컬렉션 페이지
   - 보조 모션: fade-up, 이미지 패럴랙스, 마퀴, 카운트업, 매니페스토 단어 리빌
   * 로더·마스크 전환 없음(PRO 전용) — STANDARD 규격 준수
   =========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width:760px)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupMobileMenu();
    setupForm();
    setupVoices();
    setupMotion();
  }

  /* ----- 모바일 드로어 메뉴 ----- */
  function setupMobileMenu() {
    var hamb = document.getElementById('hamb');
    var drawer = document.getElementById('mDrawer');
    if (!hamb || !drawer) return;
    var closeBtn = drawer.querySelector('.m-close');
    function open() {
      drawer.classList.add('open');
      hamb.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('open');
      hamb.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    hamb.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target === drawer) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) close();
    });
  }

  /* ----- 문의 폼 검증 + 완료 메시지 (데모: 실제 전송 없음) ----- */
  function setupForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var name = document.getElementById('cf-name');
    var tel = document.getElementById('cf-tel');
    var msg = document.getElementById('cf-msg');
    var telPattern = /^[0-9\-\s]{9,}$/;

    function setErr(field, show, text) {
      var box = field.parentElement.querySelector('.err');
      if (show) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        if (box) { if (text) box.textContent = text; box.classList.add('show'); }
      } else {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        if (box) box.classList.remove('show');
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // 제출 → 구글시트(Apps Script)/이메일(web3forms) 연동 자리. 데모 미작동.
      var ok = true, first = null;
      if (!name.value.trim()) { setErr(name, true, '성함을 입력해 주세요.'); ok = false; first = first || name; }
      else setErr(name, false);
      if (!tel.value.trim() || !telPattern.test(tel.value.trim())) {
        setErr(tel, true, '연락처를 정확히 입력해 주세요.'); ok = false; first = first || tel;
      } else setErr(tel, false);
      if (!msg.value.trim()) { setErr(msg, true, '문의 내용을 입력해 주세요.'); ok = false; first = first || msg; }
      else setErr(msg, false);
      if (!ok) { if (first) first.focus(); return; }

      var fields = document.getElementById('formFields');
      if (fields) fields.style.display = 'none';
      var okBox = document.getElementById('formOk');
      if (okBox) { okBox.classList.add('show'); okBox.setAttribute('tabindex', '-1'); okBox.focus(); }
    });

    [name, tel, msg].forEach(function (f) {
      if (!f) return;
      f.addEventListener('input', function () { setErr(f, false); });
    });
  }

  /* ----- 후기 보이스 슬라이더 -----
     데스크톱 3개 / 태블릿 2개 / 모바일 1개씩 페이지 단위 이동.
     transform translateX만 사용(opacity 포함, 60fps). reduced-motion은 CSS가 transition 차단. */
  function setupVoices() {
    var track = document.getElementById('vcTrack');
    if (!track) return;
    var viewport = track.parentElement;
    var prev = document.getElementById('vcPrev');
    var next = document.getElementById('vcNext');
    var dotsBox = document.getElementById('vcDots');
    var slides = [].slice.call(track.children);
    var page = 0;

    function perPage() {
      if (window.matchMedia('(max-width:760px)').matches) return 1;
      if (window.matchMedia('(max-width:980px)').matches) return 2;
      return 3;
    }
    function pageCount() { return Math.max(1, Math.ceil(slides.length / perPage())); }

    function buildDots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = '';
      for (var i = 0; i < pageCount(); i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', (i + 1) + '번째 후기 묶음 보기');
        (function (idx) { b.addEventListener('click', function () { go(idx); }); })(i);
        dotsBox.appendChild(b);
      }
    }
    function go(p) {
      var max = pageCount() - 1;
      page = Math.max(0, Math.min(p, max));
      var pp = perPage();
      // 한 슬라이드 폭 = (viewport 폭 - gap*(pp-1)) / pp + gap
      var gap = 26;
      var slideW = (viewport.clientWidth - gap * (pp - 1)) / pp;
      var shift = page * pp * (slideW + gap);
      track.style.transform = 'translateX(' + (-shift) + 'px)';
      if (prev) prev.disabled = page === 0;
      if (next) next.disabled = page === max;
      if (dotsBox) {
        [].slice.call(dotsBox.children).forEach(function (d, i) {
          d.classList.toggle('active', i === page);
        });
      }
    }
    if (prev) prev.addEventListener('click', function () { go(page - 1); });
    if (next) next.addEventListener('click', function () { go(page + 1); });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { buildDots(); go(Math.min(page, pageCount() - 1)); }, 150);
    });
    buildDots();
    go(0);
  }

  /* ----- 모션: Lenis + GSAP ScrollTrigger ----- */
  function setupMotion() {
    var header = document.getElementById('header');
    var floatCta = document.getElementById('floatCta');
    var stickyCta = document.getElementById('stickyCta');

    function onScrollUI(y) {
      if (header) header.classList.toggle('scrolled', y > 60);
      var show = y > window.innerHeight * 0.55;
      if (floatCta) floatCta.classList.toggle('show', show && !isMobile);
      if (stickyCta) stickyCta.classList.toggle('show', show);
    }

    function showAllStatic() {
      document.querySelectorAll('.fade-up').forEach(function (el) {
        el.classList.add('is-in'); el.style.opacity = 1; el.style.transform = 'none';
      });
      document.querySelectorAll('.count').forEach(function (el) {
        var dec = +el.dataset.dec || 0;
        el.textContent = (+el.dataset.to).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      });
    }

    // CDN 실패 / reduced-motion: pre-hide 해제 + 최종 상태 즉시 노출
    if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
      document.documentElement.classList.remove('js');
      document.documentElement.classList.add('no-js');
      showAllStatic();
      onScrollUI(window.scrollY);
      window.addEventListener('scroll', function () { onScrollUI(window.scrollY); }, { passive: true });
      // 룩북 가로 핀 폴백: 세로 그리드
      var lb = document.querySelector('.lookbook');
      if (lb) lb.classList.add('lb-fallback');
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
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70, duration: 1.1 }); }
      });
    });

    // 히어로 패럴랙스 (STANDARD: 핀·축소 없음, 배경만 살짝 이동)
    var heroMedia = document.getElementById('heroMedia');
    var hero = document.querySelector('.hero');
    if (heroMedia && hero) {
      gsap.to(heroMedia, {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-content', {
        y: -50, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '62% top', scrub: true }
      });
    }

    // 매니페스토 단어 리빌
    var phil = document.getElementById('phil');
    if (phil) {
      splitWords(phil);
      gsap.from(phil.querySelectorAll('.w'), {
        yPercent: 110, opacity: 0, stagger: 0.03, ease: 'power3.out',
        scrollTrigger: { trigger: phil, start: 'top 82%', end: 'bottom 62%', scrub: 1 }
      });
    }

    // 키네틱 마퀴 (스크롤 속도 방향 반영)
    var mq = document.getElementById('marquee');
    if (mq) {
      var mqX = 0, mqHalf = mq.scrollWidth / 2, mqDir = 1;
      window.addEventListener('resize', function () { mqHalf = mq.scrollWidth / 2; });
      gsap.ticker.add(function () {
        mqX -= 0.7 * mqDir;
        if (mqX <= -mqHalf) mqX += mqHalf;
        if (mqX > 0) mqX -= mqHalf;
        mq.style.transform = 'translateX(' + mqX + 'px)';
      });
      ScrollTrigger.create({
        onUpdate: function (self) { if (self.getVelocity() !== 0) mqDir = self.getVelocity() > 0 ? 1 : -1; }
      });
    }

    // 일반 fade-up 진입 — gsap.fromTo로 인라인 스타일을 직접 써서 노출
    // (CSS `html.js .fade-up`가 `.is-in`보다 specificity가 높아 클래스 토글만으로는 opacity가 0에 머무는 버그를
    //  방지: 검증된 demo-6 패턴을 이식. 인라인 스타일이 pre-hide 룰을 확실히 덮는다.)
    gsap.utils.toArray('.fade-up').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true },
        onStart: function () { el.classList.add('is-in'); }
      });
    });

    // 이미지 패럴랙스 (데스크톱)
    if (!isMobile) {
      gsap.utils.toArray('.prod-img .pimg, .story-media .pimg, .pv-media .pimg').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -8 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

    // 카운트업
    gsap.utils.toArray('.count').forEach(function (el) {
      var to = +el.dataset.to, dec = +el.dataset.dec || 0;
      var obj = { v: 0 };
      gsap.to(obj, {
        v: to, ease: 'none', snap: dec ? {} : { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 55%', scrub: 1 },
        onUpdate: function () { el.textContent = obj.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
      });
    });

    // 시그니처 1종: 룩북 가로 스크롤 핀
    setupLookbook();

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 600);

    onScrollUI(window.scrollY);
  }

  /* ----- 시그니처: 룩북 가로 스크롤 (컬렉션 페이지) -----
     데스크톱: .lb-viewport를 핀 고정하고 세로 스크롤을 .lb-track 가로 이동으로 변환.
     모바일/reduced-motion: .lb-fallback(세로 그리드)로 폴백, 핀 미생성. */
  function setupLookbook() {
    var track = document.getElementById('lbTrack');
    var viewport = document.getElementById('lbViewport');
    var lookbook = document.querySelector('.lookbook');
    if (!track || !viewport) return;

    if (isMobile) { if (lookbook) lookbook.classList.add('lb-fallback'); return; }

    function distance() { return Math.max(0, track.scrollWidth - window.innerWidth + 60); }
    if (distance() <= 0) return; // 화면이 충분히 넓으면 가로 이동 불필요

    gsap.to(track, {
      x: function () { return -distance(); }, ease: 'none',
      scrollTrigger: {
        trigger: viewport, start: 'top top',
        end: function () { return '+=' + distance(); },
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
  }

  /* 텍스트를 단어 span으로 분리 (em 보존) */
  function splitWords(node) {
    node.querySelectorAll('em').forEach(function (em) {
      var frag = document.createDocumentFragment();
      em.textContent.split(' ').forEach(function (w, i) {
        if (i) frag.appendChild(document.createTextNode(' '));
        var s = document.createElement('span'); s.className = 'w'; s.style.color = 'var(--cobalt)'; s.style.fontStyle = 'italic'; s.textContent = w;
        frag.appendChild(s);
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
