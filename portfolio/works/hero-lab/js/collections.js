/* =========================================================
   HERO LAB — 컬렉션 엔진
   ① 막 걷힘/리빌 15종  ② 페이지 로딩·전환 10종  ③ 마우스 인터랙션
   data-page = reveals | loaders | cursor 로 분기
   ========================================================= */
(function(){
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 820px)").matches;
  const IMG = id => "https://picsum.photos/id/" + id + "/600/450";
  const noFx = () => !window.gsap || reduce;

  function boot(){
    if (noFx()) return false;
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis){
      const l = new Lenis({ duration:1.1, smoothWheel:true });
      l.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t=>l.raf(t*1000)); gsap.ticker.lagSmoothing(0);
    }
    return true;
  }
  const mk = (cls,parent,tag)=>{ const d=document.createElement(tag||"div"); if(cls)d.className=cls; if(parent)parent.appendChild(d); return d; };

  /* ===================== ① 리빌(막 걷힘) 15종 ===================== */
  const RIMG = [1018,1043,1029,1027,1019,431,1076,1015,1062,1024,1067,1060,1011,1033,1041];
  const SV_LINE = '<svg viewBox="0 0 100 100"><path class="draw" d="M8 78 L30 40 L48 60 L70 22 L92 50"/></svg>';
  const SV_RING = '<svg viewBox="0 0 100 100"><circle class="draw" cx="50" cy="50" r="34"/></svg>';

  function slatsMake(rv,ph,o){
    const cov = mk("rv-cover",rv); cov.style.flexDirection = o.dir==="col" ? "column" : "row";
    const slats=[];
    for(let i=0;i<o.n;i++){ const s=mk("rv-slat",cov);
      s.style.background = o.colors ? o.colors[i%o.colors.length] : (o.color || "var(--acc)");
      if(o.skew) s.style.transform = "skewX(-14deg)";
      slats.push(s); }
    if(o.skew){ cov.style.transform="scale(1.5)"; }
    return ()=>{
      gsap.killTweensOf(slats);
      gsap.set(cov,{display:"flex"});
      gsap.set(slats,{scaleY:1,opacity:1,transformOrigin:o.origin||"top"});
      gsap.to(slats,{scaleY:0,transformOrigin:o.origin||"top",duration:.55,ease:"power2.inOut",
        stagger:{each:.05, from:o.from||"start"}});
    };
  }
  function panelsMake(rv,ph,o){
    const cov = mk("rv-cover",rv); cov.style.display="block";
    const l=mk("rv-panel",cov), r=mk("rv-panel",cov);
    l.style.left="0";  l.style.background = o.color  || "var(--acc)";
    r.style.right="0"; r.style.background = o.color2 || o.color || "var(--acc)";
    return ()=>{
      gsap.set(cov,{display:"block"}); gsap.set([l,r],{xPercent:0});
      gsap.to(l,{xPercent:-100,duration:.6,ease:"power3.inOut"});
      gsap.to(r,{xPercent:100,duration:.6,ease:"power3.inOut"});
    };
  }
  function tilesMake(rv,ph,o){
    const cov = mk("rv-cover rv-grid",rv);
    cov.style.gridTemplateColumns = "repeat("+o.cols+",1fr)";
    cov.style.gridTemplateRows    = "repeat("+o.rows+",1fr)";
    const tiles=[]; for(let i=0;i<o.cols*o.rows;i++){ const t=mk("rv-tile",cov); t.style.background=o.color||"var(--acc)"; tiles.push(t); }
    return ()=>{
      gsap.set(cov,{display:"grid"}); gsap.set(tiles,{opacity:1,scale:1,rotation:0});
      gsap.to(tiles,{opacity:0,scale:o.shuffle?.3:1,rotation:o.shuffle?60:0,duration:.5,ease:"power2.in",
        stagger:{each:.02, from:o.from||"random", grid:[o.rows,o.cols]}});
    };
  }
  function clipMake(rv,ph,o){
    return ()=> gsap.fromTo(ph,{clipPath:o.from},{clipPath:o.to,duration:.75,ease:o.ease||"power2.inOut"});
  }
  function svgMake(rv,ph,o){
    const wrap=mk("rv-svg",rv); wrap.innerHTML=o.svg; const path=wrap.querySelector(".draw");
    return ()=>{
      const len=path.getTotalLength();
      gsap.set(wrap,{display:"grid",opacity:1}); gsap.set(ph,{opacity:0});
      gsap.set(path,{strokeDasharray:len,strokeDashoffset:len});
      gsap.timeline()
        .to(path,{strokeDashoffset:0,duration:.85,ease:"power1.inOut"})
        .to(ph,{opacity:1,duration:.45},"-=.1")
        .to(wrap,{opacity:0,duration:.45},"<");
    };
  }
  const RBUILD = { slats:slatsMake, panels:panelsMake, tiles:tilesMake, clip:clipMake, svg:svgMake };

  const REVEALS = [
    { name:"막 올라가기",     en:"Bars Up",        acc:"#e7b85c", type:"slats", opt:{dir:"row",n:8,origin:"top"} },
    { name:"막 내려가기",     en:"Bars Down",      acc:"#5b8cff", type:"slats", opt:{dir:"row",n:8,origin:"bottom"} },
    { name:"무지개 컬럼",     en:"Color Columns",  acc:"#ff6b6b", type:"slats", opt:{dir:"row",n:9,origin:"top",colors:["#ff6b6b","#ffa94d","#ffd43b","#69db7c","#3bc9db","#748ffc","#da77f2"]} },
    { name:"커튼 분할",       en:"Curtain Split",  acc:"#e7b85c", type:"panels", opt:{color:"#16181f"} },
    { name:"블라인드",        en:"Blinds",         acc:"#20c997", type:"slats", opt:{dir:"col",n:8,origin:"center",color:"#0f3d35"} },
    { name:"대각선 슬랫",     en:"Diagonal Slats", acc:"#e64980", type:"slats", opt:{dir:"row",n:10,origin:"top",skew:true,color:"#e64980",from:"end"} },
    { name:"원형 아이리스",   en:"Circle Iris",    acc:"#e7b85c", type:"clip", opt:{from:"circle(0% at 50% 50%)",to:"circle(140% at 50% 50%)"} },
    { name:"다이아 확장",     en:"Diamond",        acc:"#69db7c", type:"clip", opt:{from:"polygon(50% 50%,50% 50%,50% 50%,50% 50%)",to:"polygon(50% -25%,125% 50%,50% 125%,-25% 50%)"} },
    { name:"삼각 와이프",     en:"Triangle",       acc:"#ffa94d", type:"clip", opt:{from:"polygon(50% 100%,50% 100%,50% 100%)",to:"polygon(50% -40%,160% 140%,-60% 140%)"} },
    { name:"체커보드",        en:"Checker",        acc:"#f4f5f7", type:"tiles", opt:{cols:6,rows:5,color:"#15171d",from:"random"} },
    { name:"블록 셔플",       en:"Block Shuffle",  acc:"#845ef7", type:"tiles", opt:{cols:5,rows:4,color:"#23252e",shuffle:true,from:"random"} },
    { name:"사각 확장",       en:"Square Expand",  acc:"#3bc9db", type:"clip", opt:{from:"inset(46% 46%)",to:"inset(0% 0%)"} },
    { name:"SVG 라인 드로잉",  en:"Stroke Draw",    acc:"#e7b85c", type:"svg", opt:{svg:SV_LINE} },
    { name:"SVG 링 드로잉",    en:"Ring Draw",      acc:"#5b8cff", type:"svg", opt:{svg:SV_RING} },
    { name:"잉크 블롭",       en:"Ink Blob",       acc:"#da77f2", type:"clip", opt:{from:"ellipse(0% 0% at 50% 50%)",to:"ellipse(130% 130% at 50% 50%)",ease:"power3.out"} },
  ];

  const io = window.IntersectionObserver ? new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting && e.target._play){ e.target._play(); io.unobserve(e.target); } });
  },{threshold:.4}) : null;

  function renderReveals(){
    const grid=document.getElementById("revealGrid"); if(!grid) return;
    REVEALS.forEach((r,i)=>{
      const card=mk("col-card",grid,"article");
      const rv=mk("rv",card); rv.style.setProperty("--acc", r.acc);
      const ph=mk("rv-photo",rv); ph.style.backgroundImage="url('"+IMG(RIMG[i%RIMG.length])+"')";
      const meta=mk("col-meta",card);
      meta.innerHTML="<b>"+String(i+1).padStart(2,"0")+"</b> "+r.name+" <i>"+r.en+"</i>";
      const play = RBUILD[r.type](rv, ph, Object.assign({acc:r.acc}, r.opt));
      if(noFx()){ rv.querySelectorAll(".rv-cover,.rv-svg").forEach(c=>c.remove()); return; }
      mk("rv-replay",rv).textContent="클릭 ↺";
      rv._play=play; rv.addEventListener("click",play);
      if(io) io.observe(rv); else play();
    });
  }

  /* ===================== ② 페이지 로딩·전환 10종 ===================== */
  function ldPage(ld){
    const p=mk("ld-page",ld);
    mk("lp-bar",p); mk("lp-l",p); const s=mk("lp-l",p); s.classList.add("s"); mk("lp-img",p); return p;
  }
  function ldCurtain(ld){ ldPage(ld); const ov=mk("ld-ov tr",ld);
    return gsap.timeline({repeat:-1,repeatDelay:.5})
      .set(ov,{yPercent:-100}).to(ov,{yPercent:0,duration:.45,ease:"power3.inOut"})
      .to(ov,{yPercent:100,duration:.5,ease:"power3.inOut"},"+=.35"); }
  function ldCounter(ld){ ldPage(ld); const ov=mk("ld-ov",ld); const c=mk("ld-count",ov); const o={v:0};
    return gsap.timeline({repeat:-1,repeatDelay:.5})
      .set(ov,{yPercent:0}).set(o,{v:0})
      .to(o,{v:100,duration:1,ease:"power1.inOut",snap:{v:1},onUpdate:()=>c.textContent=Math.round(o.v)+"%"})
      .to(ov,{yPercent:-100,duration:.5,ease:"power3.inOut"},"+=.2"); }
  function ldCircle(ld){ ldPage(ld); const ov=mk("ld-ov tr",ld); ov.style.borderRadius="50%";
    return gsap.timeline({repeat:-1,repeatDelay:.5})
      .set(ov,{scale:0}).to(ov,{scale:1.7,duration:.5,ease:"power2.out"})
      .to(ov,{scale:0,duration:.5,ease:"power2.in"},"+=.3"); }
  function ldCols(ld){ ldPage(ld); const wrap=mk("ld-cols",ld); const cols=[];
    for(let i=0;i<6;i++) cols.push(mk("",wrap,"i"));
    return gsap.timeline({repeat:-1,repeatDelay:.4})
      .set(cols,{scaleY:0,transformOrigin:"bottom"})
      .to(cols,{scaleY:1,transformOrigin:"bottom",stagger:.05,duration:.4,ease:"power2.inOut"})
      .to(cols,{scaleY:0,transformOrigin:"top",stagger:.05,duration:.4,ease:"power2.inOut"},"+=.3"); }
  function ldSpin(ld){ ldPage(ld); const ov=mk("ld-ov",ld); const sp=mk("ld-spin",ov);
    gsap.to(sp,{rotation:360,repeat:-1,duration:.8,ease:"none"});
    return gsap.timeline({repeat:-1,repeatDelay:.3})
      .set(ov,{opacity:1,yPercent:0}).to({},{duration:1.1})
      .to(ov,{yPercent:-100,duration:.5,ease:"power3.inOut"}); }
  function ldWord(ld){ ldPage(ld); const ov=mk("ld-ov",ld); const w=mk("ld-word",ov);
    "LOADING".split("").forEach(ch=>{ mk("",w,"span").textContent=ch; });
    const letters=[...w.children];
    return gsap.timeline({repeat:-1,repeatDelay:.3})
      .set(ov,{opacity:1,yPercent:0})
      .fromTo(letters,{yPercent:120,opacity:0},{yPercent:0,opacity:1,stagger:.06,duration:.4,ease:"back.out(1.6)"})
      .to(letters,{yPercent:-120,opacity:0,stagger:.04,duration:.3,ease:"power2.in"},"+=.4")
      .to(ov,{yPercent:-100,duration:.45,ease:"power3.inOut"},"-=.1"); }
  function ldBar(ld){ ldPage(ld); const ov=mk("ld-ov",ld); const bar=mk("ld-prog",ov); const fill=mk("",bar,"i");
    return gsap.timeline({repeat:-1,repeatDelay:.4})
      .set(ov,{opacity:1,yPercent:0}).set(fill,{scaleX:0})
      .to(fill,{scaleX:1,duration:1,ease:"power1.inOut"})
      .to(ov,{yPercent:-100,duration:.5,ease:"power3.inOut"},"+=.15"); }
  function ldSplit(ld){ ldPage(ld);
    const top=mk("ld-half",ld); top.style.top="0";
    const bot=mk("ld-half",ld); bot.style.bottom="0";
    return gsap.timeline({repeat:-1,repeatDelay:.4})
      .set(top,{scaleY:1,transformOrigin:"top"}).set(bot,{scaleY:1,transformOrigin:"bottom"})
      .to([top,bot],{scaleY:0,duration:.55,ease:"power3.inOut"})
      .to([top,bot],{scaleY:1,duration:.5,ease:"power3.inOut"},"+=.4"); }
  function ldSvg(ld){ ldPage(ld); const ov=mk("ld-svg",ld);
    ov.innerHTML='<svg viewBox="0 0 100 100"><path class="draw" d="M20 76 L20 28 L50 54 L80 28 L80 76"/></svg>';
    const path=ov.querySelector(".draw");
    return gsap.timeline({repeat:-1,repeatDelay:.4})
      .call(()=>{ const L=path.getTotalLength(); gsap.set(path,{strokeDasharray:L,strokeDashoffset:L}); })
      .set(ov,{opacity:1})
      .to(path,{strokeDashoffset:0,duration:.9,ease:"power1.inOut"})
      .to(ov,{opacity:0,duration:.5},"+=.3"); }
  function ldMask(ld){ ldPage(ld); const ov=mk("ld-ov tr",ld);
    return gsap.timeline({repeat:-1,repeatDelay:.5})
      .set(ov,{clipPath:"inset(0 0 100% 0)"})
      .to(ov,{clipPath:"inset(0 0 0% 0)",duration:.5,ease:"power3.inOut"})
      .to(ov,{clipPath:"inset(100% 0 0 0)",duration:.5,ease:"power3.inOut"},"+=.3"); }

  const LOADERS = [
    ["커튼 와이프","Curtain Wipe","#e7b85c",ldCurtain],
    ["카운터 프리로더","Counter","#5b8cff",ldCounter],
    ["원형 잉크","Circle Ink","#e64980",ldCircle],
    ["컬럼 스윕","Column Sweep","#20c997",ldCols],
    ["스피너","Spinner","#e7b85c",ldSpin],
    ["워드 로더","Word Loader","#ffa94d",ldWord],
    ["프로그레스 바","Progress Bar","#69db7c",ldBar],
    ["스플릿 패널","Split Panels","#845ef7",ldSplit],
    ["SVG 로고 드로잉","Logo Draw","#3bc9db",ldSvg],
    ["마스크 와이프","Mask Wipe","#f4f5f7",ldMask],
  ];
  function renderLoaders(){
    const grid=document.getElementById("loaderGrid"); if(!grid) return;
    LOADERS.forEach((L,i)=>{
      const card=mk("col-card",grid,"article");
      const ld=mk("ld",card); ld.style.setProperty("--acc", L[2]);
      const meta=mk("col-meta",card);
      meta.innerHTML="<b>"+String(i+1).padStart(2,"0")+"</b> "+L[0]+" <i>"+L[1]+"</i>";
      if(noFx()){ ldPage(ld); return; }
      const tl=L[3](ld); ld.style.cursor="pointer"; ld.title="클릭하면 다시 재생";
      ld.addEventListener("click",()=>tl.restart());
    });
  }

  /* ===================== ③ 마우스 인터랙션 ===================== */
  function label(card,kr,en){ mk("cc-label",card).innerHTML="<b>"+kr+"</b> · "+en; }

  function customCursor(){
    document.body.classList.add("has-cursor");
    const dot=mk("cursor-dot",document.body), ring=mk("cursor-ring",document.body);
    gsap.set([dot,ring],{xPercent:-50,yPercent:-50});
    const dx=gsap.quickTo(dot,"x",{duration:.08}), dy=gsap.quickTo(dot,"y",{duration:.08});
    const rx=gsap.quickTo(ring,"x",{duration:.35,ease:"power3"}), ry=gsap.quickTo(ring,"y",{duration:.35,ease:"power3"});
    window.addEventListener("mousemove",e=>{ dx(e.clientX);dy(e.clientY);rx(e.clientX);ry(e.clientY); });
    document.querySelectorAll(".cc-magnet,.cur-card").forEach(el=>{
      el.addEventListener("mouseenter",()=>gsap.to(ring,{width:60,height:60,opacity:.6,duration:.25}));
      el.addEventListener("mouseleave",()=>gsap.to(ring,{width:38,height:38,opacity:1,duration:.25}));
    });
  }
  function curMagnet(grid){
    const card=mk("cur-card",grid); label(card,"마그네틱 버튼","Magnetic");
    const btn=mk("cc-magnet",card); btn.textContent="HOVER ME";
    if(noFx()||mobile) return;
    card.addEventListener("mousemove",e=>{ const r=btn.getBoundingClientRect();
      gsap.to(btn,{x:(e.clientX-(r.left+r.width/2))*.5, y:(e.clientY-(r.top+r.height/2))*.6, duration:.4}); });
    card.addEventListener("mouseleave",()=>gsap.to(btn,{x:0,y:0,duration:.6,ease:"elastic.out(1,.4)"}));
  }
  function curSpotlight(grid){
    const card=mk("cur-card",grid); label(card,"스포트라이트","Spotlight");
    const spot=mk("cc-spot",card);
    mk("cc-spot-txt",spot).textContent="REVEAL";
    mk("cc-mask",spot).textContent="REVEAL";
    card.addEventListener("mousemove",e=>{ const r=card.getBoundingClientRect();
      spot.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");
      spot.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%"); });
  }
  function curTilt(grid){
    const card=mk("cur-card",grid); label(card,"3D 틸트","Tilt Card");
    const t=mk("cc-tilt",card); t.style.backgroundImage="url('"+IMG(1027)+"')";
    if(noFx()||mobile) return;
    card.addEventListener("mousemove",e=>{ const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      gsap.to(t,{rotationY:x*24,rotationX:-y*24,duration:.4,transformPerspective:600}); });
    card.addEventListener("mouseleave",()=>gsap.to(t,{rotationY:0,rotationX:0,duration:.6}));
  }
  function curRepel(grid){
    const card=mk("cur-card",grid); label(card,"리펄스 그리드","Repel Dots");
    const wrap=mk("cc-repel",card); const dots=[]; const C=9,R=7;
    for(let r=0;r<R;r++) for(let c=0;c<C;c++){ const d=mk("cc-dot",wrap);
      d.style.left=((c+.5)/C*100)+"%"; d.style.top=((r+.5)/R*100)+"%"; d._hx=(c+.5)/C; d._hy=(r+.5)/R; dots.push(d); }
    if(noFx()||mobile) return;
    card.addEventListener("mousemove",e=>{ const rect=card.getBoundingClientRect();
      const mx=(e.clientX-rect.left)/rect.width, my=(e.clientY-rect.top)/rect.height;
      dots.forEach(d=>{ const dx=d._hx-mx, dy=d._hy-my, dist=Math.hypot(dx,dy), f=Math.max(0,1-dist/.35);
        gsap.to(d,{x:dx*f*70,y:dy*f*70,duration:.4}); }); });
    card.addEventListener("mouseleave",()=>dots.forEach(d=>gsap.to(d,{x:0,y:0,duration:.6})));
  }
  function curParallax(grid){
    const card=mk("cur-card",grid); label(card,"마우스 패럴랙스","Parallax");
    const wrap=mk("cc-pll",card);
    const back=mk("cc-layer",wrap); back.style.backgroundImage="url('"+IMG(1018)+"')"; back.style.filter="brightness(.55)";
    const fore=mk("cc-layer",wrap); fore.style.cssText="inset:20%;border-radius:10px;background-image:url('"+IMG(1043)+"')";
    const cap=mk("",wrap); cap.style.cssText="position:absolute;z-index:3;left:0;right:0;bottom:9%;text-align:center;font-weight:900;font-size:1.3rem;text-shadow:0 2px 14px #000"; cap.textContent="DEPTH";
    if(noFx()||mobile) return;
    card.addEventListener("mousemove",e=>{ const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      gsap.to(back,{x:x*-22,y:y*-15,duration:.5}); gsap.to(fore,{x:x*30,y:y*22,duration:.5}); gsap.to(cap,{x:x*42,duration:.5}); });
  }
  function curTrail(grid){
    const card=mk("cur-card",grid); label(card,"이미지 트레일","Image Trail");
    const note=mk("",card); note.style.cssText="color:var(--ink-dim);font-size:.92rem;max-width:80%"; note.textContent="이 칸 위에서 마우스를 움직이세요 →";
    if(noFx()||mobile) return;
    const ids=[1027,1043,1018,1029,431,1062];
    const pool=ids.map(id=>{ const im=mk("cc-trail-img",document.body); im.style.backgroundImage="url('"+IMG(id)+"')"; return im; });
    let idx=0,lx=0,ly=0;
    card.addEventListener("mousemove",e=>{
      if(Math.hypot(e.clientX-lx,e.clientY-ly)<45) return; lx=e.clientX; ly=e.clientY;
      const im=pool[idx++ % pool.length];
      gsap.killTweensOf(im);
      gsap.set(im,{x:e.clientX,y:e.clientY,xPercent:-50,yPercent:-50,opacity:1,scale:.8,rotation:gsap.utils.random(-12,12)});
      gsap.to(im,{scale:1,duration:.3});
      gsap.to(im,{opacity:0,duration:.6,delay:.25});
    });
    card.addEventListener("mouseleave",()=>pool.forEach(im=>gsap.to(im,{opacity:0,duration:.3})));
  }
  function renderCursor(){
    const grid=document.getElementById("curGrid"); if(!grid) return;
    curMagnet(grid); curSpotlight(grid); curTilt(grid); curRepel(grid); curParallax(grid); curTrail(grid);
    if(!noFx() && !mobile) customCursor();
  }

  /* ---- 진입 ---- */
  document.addEventListener("DOMContentLoaded", ()=>{
    boot();
    const page = document.body.dataset.page;
    if(page==="reveals") renderReveals();
    else if(page==="loaders") renderLoaders();
    else if(page==="cursor") renderCursor();
  });
})();
