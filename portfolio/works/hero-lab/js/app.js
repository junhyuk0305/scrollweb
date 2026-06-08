/* =========================================================
   HERO LAB — 메인 히어로 애니메이션 12종
   - 공유 부트스트랩(Lenis + GSAP)
   - body[data-hero="slug"] → 해당 효과 init 디스패치
   - body[data-page="gallery"] → 갤러리 카드 렌더
   - 상단 크롬(이전/다음/카운터) 자동 주입
   참조: ../../_catalog/00_scroll.md (효과 카탈로그)
   ========================================================= */

/* ---- 히어로 목록 (순서 = prev/next 순서) ---- */
const HEROES = [
  { no:"01", slug:"shrink",   name:"풀스크린 축소",  en:"Shrink & Lock",        ref:"카탈로그 1-1",  tag:"pin · scale scrub", img:1018 },
  { no:"02", slug:"curtain",  name:"커튼 리빌",      en:"Curtain Reveal",       ref:"카탈로그 1-3",  tag:"pin · 패널 분할",   img:1029 },
  { no:"03", slug:"disperse", name:"조각 흩어짐",    en:"Element Disperse",     ref:"카탈로그 1-4",  tag:"pin · 타일 확산",   img:1027 },
  { no:"04", slug:"aperture", name:"창 열림",        en:"Window Aperture",      ref:"카탈로그 N9",   tag:"pin · clip-path",   img:1019 },
  { no:"05", slug:"circle",   name:"원형 마스크",    en:"Circle Clip Reveal",   ref:"카탈로그 S1",   tag:"pin · circle()",    img:431  },
  { no:"06", slug:"lines",    name:"줄 마스크 리빌", en:"Line Mask Reveal",     ref:"카탈로그 S5",   tag:"로드 인트로",       img:1076 },
  { no:"07", slug:"kenburns", name:"켄번스 줌",      en:"Ken Burns Zoom",       ref:"카탈로그 S8",   tag:"pin · pan+scale",   img:1015 },
  { no:"08", slug:"bars",     name:"막 걷힘",        en:"Bars Reveal",          ref:"카탈로그 N4",   tag:"pin · scaleY",      img:1062 },
  { no:"09", slug:"wordswap", name:"단어 교체",      en:"Sticky Word Swap",     ref:"카탈로그 S6",   tag:"pin · 마스크 캐러셀", img:1024 },
  { no:"10", slug:"parallax", name:"패럴랙스 깊이",  en:"Parallax Layers",      ref:"카탈로그 14",   tag:"scrub · 마우스",    img:1067 },
  { no:"11", slug:"split",    name:"글자 + 자석",    en:"Split + Magnetic",     ref:"카탈로그 N1",   tag:"로드 · 마그네틱",   img:1060 },
];

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = window.matchMedia("(max-width: 820px)").matches;

/* ---- 부트스트랩: Lenis ↔ ScrollTrigger ---- */
function boot(){
  if (reduce || !window.gsap) return false;
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis){
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t)=> lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
  }
  // 이미지 로드 후 트리거 위치 보정
  window.addEventListener("load", ()=> ScrollTrigger.refresh());
  return true;
}

/* ---- 마그네틱 버튼 (split·재사용) ---- */
function initMagnetic(){
  if (mobile) return;
  document.querySelectorAll(".magnetic").forEach(el=>{
    el.addEventListener("mousemove", e=>{
      const r = el.getBoundingClientRect();
      gsap.to(el, { x:(e.clientX-r.left-r.width/2)*.4, y:(e.clientY-r.top-r.height/2)*.6, duration:.5, ease:"power3.out" });
    });
    el.addEventListener("mouseleave", ()=> gsap.to(el, { x:0, y:0, duration:.7, ease:"elastic.out(1,.4)" }));
  });
}

/* ===================== 효과별 INIT ===================== */
const INIT = {

  /* 01. 풀스크린 축소 — 영상이 카드로 안착 */
  shrink(){
    gsap.set(".sh-copy", { opacity:0, y:24 });
    gsap.timeline({ scrollTrigger:{ trigger:".hero-shrink", start:"top top", end:"+=120%", pin:true, scrub:1 } })
      .to(".sh-media", { scale:.58, borderRadius:"26px", ease:"none" }, 0)
      .to(".sh-copy",  { opacity:1, y:0, ease:"none" }, .35);
  },

  /* 02. 커튼 리빌 — 양옆으로 걷힘 */
  curtain(){
    const tl = gsap.timeline({ scrollTrigger:{ trigger:".hero-curtain", start:"top top", end:"+=110%", pin:true, scrub:1 } });
    tl.to(".ct-left",  { xPercent:-100, ease:"power2.inOut" }, 0)
      .to(".ct-right", { xPercent: 100, ease:"power2.inOut" }, 0)
      .from(".ct-copy",{ opacity:0, scale:.92, ease:"none" }, .35);
  },

  /* 04. 조각 흩어짐 — 사진이 타일로 깨져 사방 확산 */
  disperse(){
    const grid = document.getElementById("dpGrid");
    const COLS = mobile ? 4 : 6, ROWS = mobile ? 5 : 4;
    grid.style.setProperty("--cols", COLS); grid.style.setProperty("--rows", ROWS);
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++){
      const t = document.createElement("span"); t.className = "dp-tile";
      t.style.left = (c*100/COLS) + "%"; t.style.top = (r*100/ROWS) + "%";
      t.style.width = "calc(100%/" + COLS + " + 1px)"; t.style.height = "calc(100%/" + ROWS + " + 1px)";
      t.style.backgroundSize = (COLS*100) + "% " + (ROWS*100) + "%";
      t.style.backgroundPosition = (COLS>1? c/(COLS-1)*100:50) + "% " + (ROWS>1? r/(ROWS-1)*100:50) + "%";
      grid.appendChild(t);
    }
    const tiles = [...grid.children];
    gsap.set(".dp-copy", { opacity:0, scale:.9 });
    gsap.timeline({ scrollTrigger:{ trigger:".hero-disperse", start:"top top", end:"+=120%", pin:true, scrub:1 } })
      .to(tiles, {
        x:(i)=> ((i%COLS) - (COLS-1)/2) * gsap.utils.random(70,150),
        y:(i)=> (Math.floor(i/COLS) - (ROWS-1)/2) * gsap.utils.random(70,150),
        rotation:()=> gsap.utils.random(-80,80), opacity:0, ease:"power2.in"
      }, 0)
      .to(".dp-copy", { opacity:1, scale:1, ease:"none" }, .35);
  },

  /* 05. 창 열림 — 창문 안 풍경이 커지다가, 창이 풀스크린으로 열림 */
  aperture(){
    gsap.set(".ap-copy", { opacity:0 });
    gsap.timeline({ scrollTrigger:{ trigger:".hero-aperture", start:"top top", end:"+=170%", pin:true, scrub:1 } })
      .fromTo(".ap-inner", { scale:1.05 }, { scale:1.75, ease:"none" }, 0)                       // ① 창 안 풍경이 점점 확대
      .fromTo(".ap-scene", { clipPath:"inset(20% 26% round 18px)" }, { clipPath:"inset(0% 0% round 0px)", ease:"power2.inOut" }, .45)  // ② 창이 풀스크린으로 열림
      .to(".ap-frame", { opacity:0, ease:"none" }, .45)
      .to(".ap-copy", { opacity:1, ease:"none" }, .72);
  },

  /* 06. 원형 마스크 — 중앙에서 원이 확장 */
  circle(){
    gsap.set(".cr-copy", { opacity:0, y:24 });
    gsap.timeline({ scrollTrigger:{ trigger:".hero-circle", start:"top top", end:"+=120%", pin:true, scrub:1 } })
      .fromTo(".cr-img", { clipPath:"circle(7% at 50% 50%)" }, { clipPath:"circle(75% at 50% 50%)", ease:"none" }, 0)
      .to(".cr-copy", { opacity:1, y:0, ease:"none" }, .4);
  },

  /* 07. 줄 마스크 리빌 — 로드 시 줄이 솟음 + 배경 살짝 줌아웃 */
  lines(){
    gsap.from(".ln-bg", { scale:1.16, duration:1.8, ease:"power2.out" });
    gsap.from(".ln-head .ln > span", { yPercent:120, rotation:6, stagger:.13, duration:1.1, ease:"power3.out", delay:.2 });
    gsap.from(".ln-sub", { opacity:0, y:22, duration:.9, delay:1, ease:"power3.out" });
    gsap.to(".ln-bg", { yPercent:12, ease:"none", scrollTrigger:{ trigger:".hero-lines", start:"top top", end:"bottom top", scrub:1 } });
  },

  /* 08. 켄번스 — 두 컷 디졸브 + 라이트 스윕 + 그레인 (시네마틱) */
  kenburns(){
    const tl = gsap.timeline({ scrollTrigger:{ trigger:".hero-kenburns", start:"top top", end:"+=170%", pin:true, scrub:1 } });
    tl.fromTo(".kb-1", { scale:1.12, xPercent:5, yPercent:3, rotation:-1.2 },
                       { scale:1.5, xPercent:-7, yPercent:-6, rotation:1.2, ease:"none" }, 0)
      .fromTo(".kb-2", { scale:1.5, xPercent:-6, yPercent:5, opacity:0 },
                       { scale:1.12, xPercent:6, yPercent:-5, opacity:1, ease:"none" }, 0);  // 두 컷이 천천히 디졸브 교차
    gsap.from(".kb-copy .eyebrow", { opacity:0, y:16, duration:.7, delay:.1, ease:"power3.out" });
    gsap.from(".kb-copy .ln > span", { yPercent:120, stagger:.1, duration:1, ease:"power3.out", delay:.25 });
    gsap.from(".kb-copy .lead", { opacity:0, y:20, duration:.8, delay:.9, ease:"power3.out" });
  },

  /* 09. 막 걷힘 — 세로 bar가 위로 걷히며 등장 */
  bars(){
    const wrap = document.getElementById("brBars");
    const N = mobile ? 6 : 9;
    for (let i=0;i<N;i++){
      const b=document.createElement("span"); b.className="br-bar";
      b.style.width = "calc(100% / " + N + " + 1.5px)"; b.style.marginRight = "-1px";  // seam(미세 여백) 제거: 살짝 겹침
      wrap.appendChild(b);
    }
    gsap.timeline({ scrollTrigger:{ trigger:".hero-bars", start:"top top", end:"+=120%", pin:true, scrub:1 } })
      .to(".br-bar", { scaleY:0, transformOrigin:"top", stagger:.07, ease:"power2.in" }, 0)
      .from(".br-title .ln > span", { yPercent:120, stagger:.1, ease:"power3.out" }, .1)
      .from(".br-img", { scale:1.22, ease:"none" }, 0);
  },

  /* 10. 단어 교체 — 방향성 마스크 캐러셀 + 블러 */
  wordswap(){
    const words = gsap.utils.toArray("#wsStack .swap-word"); let cur=0;
    gsap.set(words, { yPercent:120, opacity:0, filter:"blur(10px)" });
    gsap.set(words[0], { yPercent:0, opacity:1, filter:"blur(0px)" });
    ScrollTrigger.create({
      trigger:".hero-wordswap", start:"top top", end:"+="+(words.length*60)+"%", pin:true, scrub:1,
      onUpdate:(s)=>{
        const idx = Math.min(words.length-1, Math.floor(s.progress*words.length*0.999));
        if (idx===cur) return;
        const dir = idx>cur ? 1 : -1;
        gsap.to(words[cur], { yPercent:-120*dir, opacity:0, filter:"blur(10px)", duration:.6, ease:"power3.inOut", overwrite:true });
        gsap.fromTo(words[idx], { yPercent:120*dir, opacity:0, filter:"blur(10px)" },
          { yPercent:0, opacity:1, filter:"blur(0px)", duration:.6, ease:"power3.out", overwrite:true });
        cur = idx;
      }
    });
  },

  /* 11. 패럴랙스 깊이 — 사진 위 글씨 + 레이어 속도차 + 마우스 추종 */
  parallax(){
    const st = { trigger:".hero-parallax", start:"top top", end:"bottom top", scrub:1 };
    gsap.to(".px-back", { yPercent:18, scale:1.14, ease:"none", scrollTrigger:st });   // 배경 사진: 느리게
    gsap.to(".px-copy", { yPercent:-34, ease:"none", scrollTrigger:st });              // 글씨: 빠르게 위로
    gsap.from(".px-title .ln > span", { yPercent:130, stagger:.12, duration:1, ease:"power3.out", delay:.2 });
    gsap.from(".px-copy .eyebrow, .px-copy .lead", { opacity:0, y:20, duration:.8, delay:.6, ease:"power3.out" });
    if (!mobile){
      window.addEventListener("mousemove", (e)=>{
        const x=(e.clientX/innerWidth-.5), y=(e.clientY/innerHeight-.5);
        gsap.to(".px-back", { x:x*-34, y:y*-22, duration:.7 });   // 배경과 글씨가 반대로 움직여 깊이감
        gsap.to(".px-copy", { x:x*24,  y:y*16,  duration:.7 });
      });
    }
  },

  /* 12. 글자 stagger + 자석 버튼 + 속도 반응 마키 */
  split(){
    const head = document.querySelector(".sp-head");
    head.innerHTML = head.dataset.text.split("").map(c=>
      c===" " ? '<span class="ch">&nbsp;</span>' : '<span class="ch">'+c+'</span>').join("");
    gsap.from(".sp-head .ch", { yPercent:130, rotateX:-90, opacity:0, stagger:.04, duration:.9, ease:"back.out(1.6)", delay:.2 });
    gsap.from(".sp-eyebrow, .sp-lead, .sp-cta", { y:24, opacity:0, stagger:.12, duration:.8, delay:.6, ease:"power3.out" });
    const marq = gsap.to(".sp-marq-track", { xPercent:-50, repeat:-1, duration:18, ease:"none" });
    ScrollTrigger.create({ start:0, end:"max", onUpdate:(s)=>{
      const v = gsap.utils.clamp(-4,4, s.getVelocity()/400);
      gsap.to(marq, { timeScale: v===0?1:v, duration:.4, overwrite:true });
    }});
    initMagnetic();
  },
};

/* ---- 상단 크롬 주입 (이전/다음/카운터/스크롤 힌트) ---- */
function injectChrome(slug){
  const i = HEROES.findIndex(h=>h.slug===slug); if (i<0) return;
  const h = HEROES[i];
  const prev = HEROES[(i-1+HEROES.length)%HEROES.length];
  const next = HEROES[(i+1)%HEROES.length];
  const file = (x)=> x.no + "-" + x.slug + ".html";
  document.title = "HERO LAB · " + h.no + " " + h.name + " (" + h.en + ")";
  const top = document.createElement("div");
  top.className = "lab-top";
  top.innerHTML =
    '<a class="lab-back" href="index.html">← HERO LAB</a>'
    + '<div class="lab-id"><span class="lab-no">'+h.no+'</span><span class="lab-name">'+h.name+' · '+h.en+'</span></div>'
    + '<div class="lab-nav"><a class="lab-prev" href="'+file(prev)+'" aria-label="이전 히어로">‹</a>'
    + '<span class="lab-count">'+h.no+' / '+String(HEROES.length).padStart(2,"0")+'</span>'
    + '<a class="lab-next" href="'+file(next)+'" aria-label="다음 히어로">›</a></div>';
  document.body.prepend(top);

  const hint = document.createElement("p");
  hint.className = "lab-hint"; hint.textContent = "스크롤 ↓";
  document.body.appendChild(hint);
  window.addEventListener("scroll", ()=>{ if (window.scrollY>80) hint.classList.add("gone"); }, { passive:true });

  // 하단 다음-히어로 안내 (스크롤 여유 겸용)
  const foot = document.createElement("footer");
  foot.className = "lab-foot";
  foot.innerHTML =
    '<span class="lf-label">'+h.ref+' · '+h.tag+'</span>'
    + '<div class="lf-next">다음 — <em>'+next.name+'</em></div>'
    + '<div class="lf-links"><a class="primary" href="'+file(next)+'">다음 히어로 →</a><a href="index.html">전체 보기</a></div>';
  // .hero 다음에 삽입
  const hero = document.querySelector(".hero");
  if (hero && hero.parentNode) hero.parentNode.insertBefore(foot, hero.nextSibling);
  else document.body.appendChild(foot);
}

/* ---- 갤러리 렌더 ---- */
function renderGallery(){
  const grid = document.getElementById("galGrid"); if (!grid) return;
  grid.innerHTML = HEROES.map(h=>{
    const file = h.no + "-" + h.slug + ".html";
    const img = "https://picsum.photos/id/" + h.img + "/800/600";
    return '<a class="gal-card" href="'+file+'" aria-label="'+h.no+' '+h.name+' 데모 열기">'
      + '<span class="gc-img" style="background-image:url(\''+img+'\')"></span>'
      + '<span class="gc-go" aria-hidden="true">→</span>'
      + '<span class="gc-body"><span class="gc-no">'+h.no+'</span>'
      + '<span class="gc-name">'+h.name+'</span>'
      + '<span class="gc-en">'+h.en+' · '+h.ref+'</span>'
      + '<span class="gc-tag">'+h.tag+'</span></span></a>';
  }).join("");
  if (boot()){
    gsap.from(".gal-card", { opacity:0, y:40, duration:.8, ease:"power3.out", stagger:.06,
      scrollTrigger:{ trigger:".gal-grid", start:"top 85%" } });
    gsap.from(".gal-head > *", { opacity:0, y:24, duration:.9, ease:"power3.out", stagger:.12 });
  }
}

/* ---- 진입 ---- */
document.addEventListener("DOMContentLoaded", ()=>{
  if (document.body.dataset.page === "gallery"){ renderGallery(); return; }
  const slug = document.body.dataset.hero;
  if (!slug) return;
  injectChrome(slug);
  const live = boot();
  if (live && INIT[slug]) INIT[slug]();
  else document.body.classList.add("no-fx");   // reduced-motion / GSAP 미로드 → 최종상태 노출
});
