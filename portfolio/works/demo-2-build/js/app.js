/* ===========================================================
   여백건축 YEOBAEK — STANDARD(50만) 멀티페이지 공유 스크립트
   - Lenis ↔ ScrollTrigger 동기화
   - prefers-reduced-motion / 라이브러리 미로드: 트리거 미생성 + 최종상태 즉시노출
   - 헤더 스크롤 상태 / 모바일 드로어 / nav 활성화(aria-current)
   - 비포/애프터 드래그 슬라이더(킬러, 마우스+터치) — 시그니처 카운트와 별개
   - 포트폴리오 필터 + 라이트박스
   - 후기 슬라이드(이전/다음/도트/자동)
   - 견적 문의 폼 검증 + 완료 메시지
   - 시그니처 1종 = 카운트업 스크럽(.cnt). 그 외는 진입 모션(reveal)만.
   =========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width:760px)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupHeader();
    setupMobileMenu();
    setActiveNav();
    setupBeforeAfter();
    setupGalleryFilter();
    setupLightbox();
    setupReviews();
    setupForm();
    setupMotion();
  }

  /* ----- 헤더 스크롤 상태 (홈 히어로 위 투명 → 스크롤 시 솔리드) ----- */
  function setupHeader() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 60); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----- 모바일 드로어 메뉴 ----- */
  function setupMobileMenu() {
    var burger = document.getElementById('burger');
    var drawer = document.getElementById('mDrawer');
    if (!burger || !drawer) return;
    var close = drawer.querySelector('.md-close');
    function open() { drawer.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); }
    function shut() { drawer.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    burger.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) shut(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  }

  /* ----- 현재 페이지 nav 활성화 (aria-current) ----- */
  function setActiveNav() {
    var path = location.pathname.split('/').pop();
    if (!path) path = 'index.html';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ----- 비포/애프터 드래그 슬라이더 (킬러 인터랙션 — 시그니처 카운트 제외) ----- */
  function setupBeforeAfter() {
    var compare = document.getElementById('baCompare');
    if (!compare) return;
    // 판매 시 교체: 비포/애프터 시공 사진
    var sets = [
      { after: '1080', before: '1078', title: '서초 아파트 32평 — 거실·주방 통합 리모델링',
        desc: '벽을 헐어 거실과 주방을 하나로. 우드톤 마루와 간접조명으로 군더더기를 덜어냈습니다.',
        spec: [['4주', '공사 기간'], ['전체 리모델링', '공사 범위'], ['4,800만원대', '시공 예산']] },
      { after: '292', before: '326', title: '연남동 로스터리 카페 18평 — 상업 인테리어',
        desc: '어두운 임대 상태에서, 노출 천장과 빈티지 우드 바로 분위기를 새로 만들었습니다.',
        spec: [['3주', '공사 기간'], ['상업 인테리어', '공사 범위'], ['3,100만원대', '시공 예산']] },
      { after: '201', before: '160', title: '강남 오피스 45평 — 사무실 리모델링',
        desc: '칸막이로 막혀 답답하던 공간을, 유리 파티션과 흡음 마감으로 트이고 조용하게.',
        spec: [['4주', '공사 기간'], ['부분 리모델링', '공사 범위'], ['6,100만원대', '시공 예산']] }
    ];
    var baAfter = document.getElementById('baAfter');
    var baBefore = document.getElementById('baBefore');
    var baTitle = document.getElementById('baTitle');
    var baDesc = document.getElementById('baDesc');
    var baSpec = document.getElementById('baSpec');
    var dragging = false;

    function setPos(clientX) {
      var r = compare.getBoundingClientRect();
      var p = ((clientX - r.left) / r.width) * 100;
      p = Math.max(2, Math.min(98, p));
      compare.style.setProperty('--pos', p + '%');
    }
    function fromEvent(e) { setPos(e.touches ? e.touches[0].clientX : e.clientX); }

    compare.addEventListener('mousedown', function (e) { dragging = true; fromEvent(e); });
    window.addEventListener('mousemove', function (e) { if (dragging) fromEvent(e); });
    window.addEventListener('mouseup', function () { dragging = false; });
    compare.addEventListener('touchstart', function (e) { dragging = true; fromEvent(e); }, { passive: true });
    window.addEventListener('touchmove', function (e) { if (dragging) fromEvent(e); }, { passive: true });
    window.addEventListener('touchend', function () { dragging = false; });
    compare.addEventListener('click', function (e) { if (e.target.closest('.ba-knob')) return; setPos(e.clientX); });

    var tabs = document.getElementById('baTabs');
    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.ba-tab'); if (!btn) return;
        tabs.querySelectorAll('.ba-tab').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var s = sets[+btn.dataset.i];
        if (baAfter) baAfter.src = 'https://picsum.photos/id/' + s.after + '/1600/900';
        if (baBefore) baBefore.src = 'https://picsum.photos/id/' + s.before + '/1600/900';
        if (baTitle) baTitle.textContent = s.title;
        if (baDesc) baDesc.textContent = s.desc;
        if (baSpec) baSpec.innerHTML = s.spec.map(function (x) { return '<div><b>' + x[0] + '</b>' + x[1] + '</div>'; }).join('');
        compare.style.setProperty('--pos', '50%');
      });
    }
  }

  /* ----- 포트폴리오 필터 ----- */
  function setupGalleryFilter() {
    var gallery = document.getElementById('gallery');
    var filters = document.getElementById('filters');
    if (!gallery || !filters) return;
    var items = Array.prototype.slice.call(gallery.children);
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter'); if (!btn) return;
      filters.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.f;
      items.forEach(function (it) {
        it.classList.toggle('hide', !(f === 'all' || it.dataset.cat === f));
      });
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  }

  /* ----- 포트폴리오 라이트박스 ----- */
  function setupLightbox() {
    var lb = document.getElementById('lightbox');
    var gallery = document.getElementById('gallery');
    if (!lb || !gallery) return;
    var lbImg = document.getElementById('lbImg'), lbType = document.getElementById('lbType'),
      lbName = document.getElementById('lbName'), lbDesc = document.getElementById('lbDesc'),
      lbArea = document.getElementById('lbArea'), lbScope = document.getElementById('lbScope'),
      lbPeriod = document.getElementById('lbPeriod'), lbBudget = document.getElementById('lbBudget');
    var lastFocused = null;

    function open(d) {
      lastFocused = document.activeElement;
      // 판매 시 교체: 상세 시공 사진(고해상)
      lbImg.src = 'https://picsum.photos/id/' + d.img + '/1000/1100';
      lbImg.alt = d.name;
      lbType.textContent = d.type; lbName.textContent = d.name; lbDesc.textContent = d.desc;
      lbArea.textContent = d.area; lbScope.textContent = d.scope;
      lbPeriod.textContent = d.period; lbBudget.textContent = d.budget;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
      var c = document.getElementById('lbClose'); if (c) c.focus();
    }
    function close() {
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (window.lenis) window.lenis.start();
      if (lastFocused) lastFocused.focus();
    }
    Array.prototype.slice.call(gallery.children).forEach(function (it) {
      it.addEventListener('click', function () { open(it.dataset); });
    });
    var closeBtn = document.getElementById('lbClose');
    if (closeBtn) closeBtn.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    var cta = document.getElementById('lbCta'); if (cta) cta.addEventListener('click', close);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* ----- 후기 슬라이드 ----- */
  function setupReviews() {
    var stage = document.getElementById('revStage');
    if (!stage) return;
    var track = stage.querySelector('.rev-track');
    var slides = track ? track.children.length : 0;
    if (!track || !slides) return;
    var dotsWrap = document.getElementById('revDots');
    var i = 0, timer = null;

    function build() {
      if (!dotsWrap) return;
      var html = '';
      for (var k = 0; k < slides; k++) html += '<button class="rev-dot" aria-label="후기 ' + (k + 1) + '"></button>';
      dotsWrap.innerHTML = html;
    }
    function go(n) {
      i = (n + slides) % slides;
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      if (dotsWrap) dotsWrap.querySelectorAll('.rev-dot').forEach(function (d, k) { d.classList.toggle('active', k === i); });
    }
    function auto() { if (reduce) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5500); }

    build(); go(0); auto();
    var prev = document.getElementById('revPrev'), next = document.getElementById('revNext');
    if (prev) prev.addEventListener('click', function () { go(i - 1); auto(); });
    if (next) next.addEventListener('click', function () { go(i + 1); auto(); });
    if (dotsWrap) dotsWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.rev-dot'); if (!b) return;
      go(Array.prototype.indexOf.call(dotsWrap.children, b)); auto();
    });
    stage.addEventListener('mouseenter', function () { clearInterval(timer); });
    stage.addEventListener('mouseleave', auto);
  }

  /* ----- 견적 문의 폼 검증 + 완료 메시지 ----- */
  function setupForm() {
    var form = document.getElementById('quoteForm');
    if (!form) return;
    var area = document.getElementById('area');
    var name = document.getElementById('name');
    var phone = document.getElementById('phone');
    var agree = document.getElementById('agree');
    var telPattern = /^[0-9\-\s]{9,}$/;

    function setErr(field, show, msg) {
      if (!field) return;
      var box = field.parentElement.querySelector('.err');
      if (show) {
        field.classList.add('invalid'); field.setAttribute('aria-invalid', 'true');
        if (box) { if (msg) box.textContent = msg; box.classList.add('show'); }
      } else {
        field.classList.remove('invalid'); field.removeAttribute('aria-invalid');
        if (box) box.classList.remove('show');
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // 판매 시 교체: 실제 폼 전송(fetch/메일/API). 데모는 화면 전환만.
      var ok = true, first = null;
      if (area && !area.value.trim()) { setErr(area, true, '평형/면적을 입력해 주세요.'); ok = false; first = first || area; } else setErr(area, false);
      if (name && !name.value.trim()) { setErr(name, true, '성함을 입력해 주세요.'); ok = false; first = first || name; } else setErr(name, false);
      if (phone && (!phone.value.trim() || !telPattern.test(phone.value.trim()))) { setErr(phone, true, '연락처를 정확히 입력해 주세요.'); ok = false; first = first || phone; } else setErr(phone, false);
      if (agree && !agree.checked) {
        var ab = form.querySelector('.agree .err'); if (ab) ab.classList.add('show');
        ok = false; first = first || agree;
      } else if (agree) { var ab2 = form.querySelector('.agree .err'); if (ab2) ab2.classList.remove('show'); }
      if (!ok) { if (first) first.focus(); return; }
      var body = document.getElementById('qformBody'); if (body) body.style.display = 'none';
      var okBox = document.getElementById('formOk'); if (okBox) okBox.classList.add('show');
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });

    [area, name, phone].forEach(function (f) { if (f) f.addEventListener('input', function () { setErr(f, false); }); });
    if (agree) agree.addEventListener('change', function () {
      var ab = form.querySelector('.agree .err'); if (ab && agree.checked) ab.classList.remove('show');
    });
  }

  /* ----- 모션: Lenis + GSAP ScrollTrigger ----- */
  function setupMotion() {
    function setCountsFinal() {
      document.querySelectorAll('.cnt').forEach(function (el) { el.textContent = (+el.dataset.to).toLocaleString(); });
    }
    function showStatic() {
      document.documentElement.classList.remove('js');
      document.documentElement.classList.add('no-js');
      setCountsFinal();
      document.querySelectorAll('.step').forEach(function (s) { s.classList.add('is-active'); });
      var fill = document.getElementById('procFill'); if (fill) fill.style.transform = 'scaleY(1)';
    }

    if (reduce || typeof gsap === 'undefined' || typeof Lenis === 'undefined') { showStatic(); return; }
    gsap.registerPlugin(ScrollTrigger);

    // Lenis 부드러운 스크롤 ↔ ScrollTrigger 동기화
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 페이지 내 앵커 → Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -70 });
      });
    });

    // 히어로 배경: 진입 시 아주 옅은 줌-인 1회(스크럽 없음 — 시그니처 아님)
    if (document.querySelector('.hero-bg img')) {
      gsap.fromTo('.hero-bg img', { scale: 1.08 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
    }

    // 공통 진입 페이드업(텍스트)
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
    // 사진/카드 진입 페이드 + 살짝 줌
    gsap.utils.toArray('.reveal-img').forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    // 포트폴리오 stagger 진입
    if (document.querySelector('#gallery .gitem')) {
      gsap.fromTo('#gallery .gitem', { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '#gallery', start: 'top 80%' } });
    }
    // 스코프 카드 stagger
    if (document.querySelector('.scope-card')) {
      gsap.fromTo('.scope-card', { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.scope-cards', start: 'top 82%' } });
    }

    // ★ 시그니처 1종: 카운트업 스크럽 (스크롤에 매여 숫자가 올라간다)
    var stats = document.getElementById('stats');
    if (stats) {
      gsap.utils.toArray('.cnt').forEach(function (el) {
        var to = +el.dataset.to, obj = { v: 0 };
        gsap.to(obj, { v: to, ease: 'none', snap: { v: 1 },
          scrollTrigger: { trigger: stats, start: 'top 82%', end: 'top 38%', scrub: 1 },
          onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString(); } });
      });
    }

    // 프로세스 진행선(진입 시 1회 채움 — 스크럽 없음, 시그니처 아님)
    var procFill = document.getElementById('procFill');
    if (procFill) {
      ScrollTrigger.create({ trigger: '#procGrid', start: 'top 70%', once: true,
        onEnter: function () { procFill.style.transform = 'scaleY(1)'; } });
    }
    // 프로세스 스텝 하이라이트(클래스 토글 — 모션 아님)
    gsap.utils.toArray('.step').forEach(function (step) {
      ScrollTrigger.create({ trigger: step, start: 'top 60%', end: 'bottom 50%',
        onToggle: function (self) { step.classList.toggle('is-active', self.isActive); } });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 600);
  }
})();
