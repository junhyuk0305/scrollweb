/* =========================================================
   SCROLLWORKS 포트폴리오 메인 — app.js
   ① 데이터로 필름 스트립 패널 생성 (책갈피 + 개요)
   ② Lenis + GSAP ScrollTrigger 진입 모션
   ③ 접근성: 키보드/터치 토글, reduced-motion 폴백
   ========================================================= */

/* ---- 포트폴리오 데이터 (판매 시 실제 사례로 교체) ---- */
const WORKS = [
  {
    num: "01", short: "펜션", cat: "펜션 · 풀빌라",
    title: "고요재",
    industry: "독채 프리미엄 풀빌라 (강원 양양)",
    price: "30만원", priceTier: "기본 BASIC", tier: "basic",
    period: "5~7일", sections: 8, pages: 1,
    features: ["예약폼", "객실 갤러리", "지도", "환불규정"],
    img: "https://picsum.photos/id/1018/900/1200",
    href: "works/demo-1-stay.html"
  },
  {
    num: "02", short: "시공", cat: "인테리어 · 시공",
    title: "여백건축",
    industry: "상업·주거 인테리어 / 리모델링",
    price: "50만원", priceTier: "표준 STANDARD", tier: "standard",
    period: "5~7일", sections: 8, pages: 1,
    features: ["견적 문의폼", "비포애프터", "포트폴리오", "카카오 채널"],
    img: "https://picsum.photos/id/1076/900/1200",
    href: "works/demo-2-build.html"
  },
  {
    num: "03", short: "다이닝", cat: "다이닝 · 와인바",
    title: "NOTTE",
    industry: "시즈널 다이닝 & 와인바 (서울 한남)",
    price: "80만원", priceTier: "프리미엄 PRO", tier: "pro",
    period: "5일", sections: 7, pages: 1,
    features: ["예약 연결", "메뉴판", "공간 갤러리", "인스타 피드"],
    img: "https://picsum.photos/id/431/900/1200",
    href: "works/demo-3-savor.html"
  },
  {
    num: "04", short: "한의원", cat: "의원 · 한의원",
    title: "맑은숲한의원",
    industry: "척추·통증·체질 클리닉",
    price: "50만원", priceTier: "표준 STANDARD", tier: "standard",
    period: "5~7일", sections: 7, pages: 6,
    features: ["예약폼", "진료시간표", "비급여 고지", "지도"],
    img: "https://picsum.photos/id/1024/900/1200",
    href: "works/demo-4-care/index.html"
  },
  {
    num: "05", short: "세무", cat: "세무 · 노무",
    title: "정도 세무회계",
    industry: "소규모 전문직 사무소",
    price: "50만원", priceTier: "표준 STANDARD", tier: "standard",
    period: "5일", sections: 8, pages: 1,
    features: ["1:1 상담폼", "해결 사례", "요금 안내", "지도"],
    img: "https://picsum.photos/id/1067/900/1200",
    href: "works/demo-5-trust.html"
  },
  {
    num: "06", short: "캠핑", cat: "캠핑 · 글램핑",
    title: "별헤는밤",
    industry: "글램핑 & 오토캠핑 파크 (강원 홍천)",
    price: "50만원", priceTier: "표준 STANDARD", tier: "standard",
    period: "7일", sections: 9, pages: 6,
    features: ["자체 예약", "갤러리", "요금표", "지도"],
    img: "https://picsum.photos/id/1019/900/1200",
    href: "works/demo-6-camping/index.html"
  },
  {
    num: "07", short: "패션", cat: "패션 · 셀렉트 라벨",
    title: "NOON 누운",
    industry: "컨템포러리 미니멀 우먼즈웨어",
    price: "50만원", priceTier: "표준 STANDARD", tier: "standard",
    period: "5~7일", sections: 9, pages: 1,
    features: ["룩북 갤러리", "가로 스크롤", "키네틱 타이포", "컬렉션"],
    img: "https://picsum.photos/id/1027/900/1200",
    href: "works/demo-7-mode.html"
  },
  {
    num: "08", short: "호텔", cat: "부티크 호텔",
    title: "HÔTEL NUVÉ",
    industry: "도심 부티크 호텔 (서울 한남)",
    price: "30만원", priceTier: "기본 BASIC", tier: "basic",
    period: "7일", sections: 10, pages: 1,
    features: ["객실 타입", "예약 연결", "다이닝", "갤러리"],
    img: "https://picsum.photos/id/1029/900/1200",
    href: "works/demo-8-hotel.html"
  },
  {
    num: "09", short: "피부과", cat: "피부과 · 의료",
    title: "라엘 피부과의원",
    industry: "피부과의원 · 디자인 5변형 제공",
    price: "30만원", priceTier: "기본 BASIC", tier: "basic",
    period: "5일", sections: 8, pages: 1,
    features: ["진료 안내", "비급여 고지", "상담 예약", "시술 카탈로그"],
    img: "https://picsum.photos/id/1062/900/1200",
    href: "works/clinic-v2-luxury.html"
  },
  {
    num: "10", short: "풀빌라", cat: "펜션 · 풀빌라",
    title: "윤슬 풀빌라",
    industry: "가평 독채 프라이빗 풀빌라",
    price: "50만원", priceTier: "표준 STANDARD", tier: "standard",
    period: "5일", sections: 8, pages: 1,
    features: ["예약 안내", "공간 갤러리", "가격 안내", "지도"],
    img: "https://picsum.photos/id/1043/900/1200",
    href: "works/yunseul-stay/index.html"
  },
  {
    num: "11", short: "청소이사", cat: "청소 · 이사",
    title: "믿음 청소이사",
    industry: "입주청소 · 이사 · 사무실 이전",
    price: "30만원", priceTier: "기본 BASIC", tier: "basic",
    period: "3~5일", sections: 7, pages: 1,
    features: ["단가표", "무료 견적폼", "서비스 지역", "신뢰 배지"],
    img: "https://picsum.photos/id/1060/900/1200",
    href: "works/labor-service/index.html"
  }
];

/* ---- 쇼케이스 렌더 (N10 Synced Index Roster / 모바일·폴백은 리스트) ---- */
const RMOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const RMOBILE = window.matchMedia("(max-width: 820px)").matches;

function renderShowcase() {
  const host = document.getElementById("strip");
  if (!host) return;
  // 폴백: 모바일 / 모션최소화 / CDN 실패 → 세로 카드 리스트(접근성·SEO 동일)
  if (RMOBILE || RMOTION || !window.gsap) { renderList(host); return false; }
  renderRoster(host); return true;
}

function renderList(host) {
  host.classList.add("is-list");
  host.innerHTML = `<ul class="work-list" role="list">` + WORKS.map(w => `
    <li class="work-card" role="listitem">
      <a href="${w.href}" aria-label="${w.title} 데모 보기">
        <span class="wc-img" style="background-image:url('${w.img}')"><span class="wc-num">${w.num}</span><span class="wc-price ${w.tier}"><b>${w.price}</b><i>${w.priceTier}</i></span></span>
        <span class="wc-body">
          <span class="wc-cat">${w.cat}</span>
          <span class="wc-title">${w.title}</span>
          <span class="wc-industry">${w.industry}</span>
          <span class="wc-meta">${w.price} · <small>${w.priceTier}</small> · ${w.period}</span>
          <span class="wc-go">데모 보기 →</span>
        </span>
      </a>
    </li>`).join("") + `</ul>`;
}

function renderRoster(host) {
  host.innerHTML = `
    <div class="idx-arc" aria-hidden="true"></div>
    <div class="idx-grid wrap">
      <div class="idx-left">
        <div class="idx-num" id="idxNum">01</div>
        <div class="idx-metas">
          <span class="idx-cat" id="idxCat"></span>
          <span class="idx-tier" id="idxTier"></span>
        </div>
        <a class="idx-cta" id="idxCta" href="#">데모 보기 <span class="arr">→</span></a>
      </div>
      <div class="idx-col">
        <ul class="idx-cards" id="idxCards" role="list">
          ${WORKS.map(w => `<li class="idx-card" role="listitem" aria-label="${w.title} 데모 — ${w.price} ${w.priceTier} 열기">
            <span class="ic" style="background-image:url('${w.img}')"></span>
            <span class="ic-price ${w.tier}"><b>${w.price}</b><i>${w.priceTier}</i></span>
            <span class="ic-cap">
              <span class="ic-cat">${w.cat}</span>
              <span class="ic-title">${w.title}</span>
              <span class="ic-tags">${w.features.map(f => `<i>#${f}</i>`).join("")}</span>
              <span class="ic-go">데모 보기 <b class="arr">→</b></span>
            </span>
          </li>`).join("")}
        </ul>
      </div>
      <ul class="idx-roster" id="idxRoster" role="list" aria-label="제작 사례 목록">
        ${WORKS.map(w => `<li role="listitem"><span class="r-no">${w.num}</span>${w.title}</li>`).join("")}
      </ul>
    </div>
    <p class="idx-hint" aria-hidden="true">스크롤 ↓</p>`;
}

/* ---- N10 동기 스크롤 (단일 progress → render(pos)) ---- */
function initRoster() {
  const cardsEl = document.getElementById("idxCards");
  const rosterEl = document.getElementById("idxRoster");
  if (!cardsEl || !rosterEl) return;
  const numEl = document.getElementById("idxNum");
  const catEl = document.getElementById("idxCat");
  const tierEl = document.getElementById("idxTier");
  const ctaEl = document.getElementById("idxCta");
  const arc = document.querySelector(".idx-arc");
  const cards = [...cardsEl.children], names = [...rosterEl.children];
  const N = WORKS.length;
  let cardStep = 0, nameStep = 0, lastA = -1;

  const measure = () => {
    cardStep = cards[1].offsetTop - cards[0].offsetTop;     // 실측 → 리사이즈/폰트 견고
    nameStep = names[1].offsetTop - names[0].offsetTop;
  };
  const render = (pos) => {
    gsap.set(cardsEl, { y: -pos * cardStep });
    gsap.set(rosterEl, { y: -pos * nameStep });
    cards.forEach((c, i) => {                                // 초점선에서 멀수록 흐려짐(크로스블렌드)
      const d = Math.abs(i - pos);
      const ic = c.firstElementChild;                        // 이미지에만 흐림 적용 → 호버 캡션은 또렷하게
      ic.style.opacity = Math.max(0.08, 1 - d * 0.6);
      ic.style.transform = "scale(" + (1 - Math.min(d, 2) * 0.05) + ")";
      const pr = c.querySelector(".ic-price");               // 가격 배지도 사진과 함께 페이드(초점은 또렷)
      if (pr) pr.style.opacity = Math.max(0.2, 1 - d * 0.55);
      c.classList.toggle("is-focus", Math.round(pos) === i); // 초점 카드 표시(호버 유도)
    });
    const a = Math.max(0, Math.min(N - 1, Math.round(pos)));
    if (a !== lastA) {
      lastA = a;
      numEl.textContent = WORKS[a].num;
      names.forEach((li, i) => li.classList.toggle("on", i === a));
      catEl.textContent = WORKS[a].cat;
      tierEl.textContent = WORKS[a].price + " · " + WORKS[a].priceTier;
      ctaEl.setAttribute("href", WORKS[a].href);
      gsap.fromTo([catEl, tierEl], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .4, ease: "power2" });
    }
  };
  measure(); render(0);
  const st = ScrollTrigger.create({
    trigger: ".idxroster", start: "top top", end: "+=" + (N * 42) + "%",
    pin: true, scrub: 1, invalidateOnRefresh: true, onRefresh: measure,
    onUpdate: (s) => { render(s.progress * (N - 1)); if (arc) gsap.set(arc, { rotation: s.progress * 55 }); }
  });

  // 인덱스 i가 초점에 오도록 페이지 스크롤 위치 계산 후 부드럽게 이동
  const scrollToIndex = (i) => {
    const p = N > 1 ? i / (N - 1) : 0;
    const target = st.start + p * (st.end - st.start);
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  // 오른쪽 목록: 클릭하면 이동하지 않고 해당 작업물 사진으로 스크롤(초점 이동)
  names.forEach((li, i) => {
    li.style.cursor = "pointer";
    li.setAttribute("title", WORKS[i].title + " 작품으로 이동");
    li.addEventListener("click", () => scrollToIndex(i));
  });
  // 사진: 클릭해야만 해당 데모로 이동(호버 시 화살표 애니로 유도)
  cards.forEach((c, i) => { c.style.cursor = "pointer"; c.addEventListener("click", () => { location.href = WORKS[i].href; }); });
}

/* ---- 모션 레이어 ---- */
function initMotion() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("siteHeader");

  // 헤더 축소
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // CDN 실패 또는 reduced-motion → 폴백(콘텐츠 즉시 노출)
  if (reduce || !window.gsap) {
    document.querySelectorAll("[data-fx]").forEach(el => {
      el.style.opacity = 1; el.style.transform = "none";
    });
    return;
  }

  document.documentElement.classList.add("fx-ready");
  gsap.registerPlugin(ScrollTrigger);

  // Lenis ↔ ScrollTrigger 동기화
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;                                  // 로스터 클릭 시 부드러운 스크롤에 재사용
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // 히어로 카피 순차 등장
  gsap.to(".hero [data-fx]", {
    opacity: 1, y: 0, duration: .9, ease: "power3.out", stagger: .12, delay: .15
  });

  // 메인 쇼케이스: N10 로스터(데스크톱) 또는 리스트 폴백 진입
  if (window.__roster) {
    initRoster();
  } else {
    gsap.from(".work-list .work-card", {
      opacity: 0, y: 40, duration: .8, ease: "power3.out", stagger: .08,
      scrollTrigger: { trigger: ".work-list", start: "top 82%" }
    });
  }

  // 일반 섹션 요소들
  gsap.utils.toArray("section.band [data-fx], .cta [data-fx]").forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: .8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  window.__roster = renderShowcase();   // true=N10 로스터, false=리스트 폴백
  initMotion();
});
