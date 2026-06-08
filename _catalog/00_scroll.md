# 스크롤 트리거 애니메이션 구현 가이드 (고도화판)

> 원래 30종 컨셉 기획을 **프론트엔드 구현 레퍼런스**로 고도화한 문서입니다.
> 기본 30종(1~6) + 해외 수상작 스타일 시그니처 16종(7) + 확장 11종(8) = **총 57종**. 각 효과마다 카테고리 · 난이도 · 성능 비용 · 권장 스택 · 핵심 코드 · 접근성 노트를 포함합니다.
> 실제 동작 데모: [`00_scroll.html`](00_scroll.html) (38종 라이브 구현).

---

## 0. 공통 기술 스택 (Tech Foundation)

전체 30종을 일관되게 구현하기 위한 기반입니다. 템플릿마다 매번 새로 짜지 말고 아래 셋업을 공통 레이어로 둡니다.

| 레이어 | 라이브러리 | 역할 | 비고 |
|---|---|---|---|
| 부드러운 스크롤 | **Lenis** (`@studio-freight/lenis`) | 관성 스크롤, scrub 효과의 부드러움을 결정 | 가장 큰 체감 차이. 필수 |
| 스크롤 트리거 | **GSAP + ScrollTrigger** | pin / scrub / 진입 트리거 전부 담당 | 산업 표준 |
| 텍스트 분리 | **SplitType** (무료) or GSAP SplitText | 글자·단어·줄 단위 분리 | 타이포 효과용 |
| 네이티브 대안 | CSS `animation-timeline: view()` / `scroll()` | JS 없이 진입 페이드 등 | 2024+ 브라우저, 폴백 필요 |

### 0-1. 기본 부트스트랩

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

```js
gsap.registerPlugin(ScrollTrigger);

// Lenis ↔ GSAP ScrollTrigger 동기화 (이게 핵심)
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// 접근성: 모션 최소화 사용자는 모든 스크럽/패럴랙스 차단
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### 0-2. 전 효과 공통 원칙 (고도화 체크리스트)

1. **`transform` / `opacity`만 애니메이트한다.** `top/left/width/height/margin` 변경은 레이아웃 리플로우를 유발 → 60fps 붕괴.
2. **`will-change`는 핀/스크럽 구간에만** 부여하고 끝나면 제거한다. 남발하면 메모리·합성 레이어 폭증.
3. **`prefers-reduced-motion` 분기**를 모든 효과에 둔다. 스크럽/패럴랙스/회전은 끄고, 최종 상태만 즉시 노출.
4. **모바일은 scrub 대신 진입 트리거**로 대체하는 것을 기본값으로. 터치 스크롤에서 무거운 pin은 끊김 유발.
5. **`ScrollTrigger.refresh()`**를 이미지 로드 후 호출. 이미지 높이 미확정 시 트리거 위치가 어긋난다.

---

## 카테고리별 효과 (6개 그룹 · 30종)

> 난이도: ★(쉬움) ~ ★★★★★(고난도) · 성능비용: 🟢낮음 🟡중간 🔴높음

---

## 1. 히어로 & 인트로 (Hero & Intro) — 첫인상 압도

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| 1 | 풀스크린 축소 (Shrink & Lock) | ★★★ | 🟡 | pin + scale scrub |
| 2 | 텍스트 줌인 (Text Mask Zoom) | ★★★★ | 🟡 | `mix-blend-mode` 또는 SVG mask + scale |
| 3 | 커튼 효과 (Curtain Reveal) | ★★ | 🟢 | clip-path scrub |
| 4 | 오브젝트 흩어짐 (Element Disperse) | ★★★ | 🟡 | stagger + 개별 transform |
| 5 | 3D 회전 연동 (3D Rotate on Scroll) | ★★★★★ | 🔴 | Three.js + scroll progress |

### 1-1. 풀스크린 축소 (Shrink & Lock)

```js
gsap.to('.hero-media', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: '+=100%',
    pin: true,
    scrub: 1,            // 1 = 1초 관성. scrub:true보다 부드러움
  },
  scale: 0.62,
  borderRadius: '24px',
  ease: 'none',
});
```
> **고도화 포인트:** `borderRadius`를 함께 트위닝하면 "영상 → 카드로 안착"하는 느낌이 살아난다. `transform-origin: center 30%`로 위쪽이 고정된 듯한 인상.

### 1-2. 텍스트 줌인 트랜지션 (Text Mask Zoom)

```css
.zoom-mask { position: fixed; inset: 0; background: #000; }
.zoom-mask h1 { mix-blend-mode: multiply; background:#fff; -webkit-background-clip:text; color:transparent; }
```
```js
gsap.to('.zoom-mask h1', {
  scrollTrigger: { trigger: '.intro', start:'top top', end:'+=150%', pin:true, scrub:1 },
  scale: 24, ease: 'power2.in',
});
```
> **고도화 포인트:** 단순 scale은 가장자리가 깨진다. `will-change:transform` + GPU 합성으로 선명도 유지, 줌 종료 직전 다음 섹션을 `opacity`로 크로스페이드.

### 1-3. 커튼 효과 (Curtain Reveal)

```js
gsap.fromTo('.curtain',
  { clipPath: 'inset(0 0 0 0)' },
  { clipPath: 'inset(0 50% 0 50%)',  // 양옆으로 걷힘
    scrollTrigger: { trigger:'.hero', start:'top top', end:'+=80%', pin:true, scrub:1 }});
```

### 1-4. 오브젝트 흩어짐 (Element Disperse)

```js
gsap.to('.shard', {
  x: (i) => (i % 2 ? 1 : -1) * gsap.utils.random(200, 600),
  y: () => gsap.utils.random(-300, 300),
  rotation: () => gsap.utils.random(-90, 90),
  scrollTrigger: { trigger:'.hero', start:'top top', end:'+=100%', pin:true, scrub:1 },
});
```
> 함수형 값으로 각 조각마다 다른 벡터를 부여하는 게 핵심. 중앙 → 사방 확산이 자연스러워진다.

### 1-5. 3D 회전 연동 (Three.js)

```js
ScrollTrigger.create({
  trigger:'.model', start:'top top', end:'+=200%', pin:true, scrub:1,
  onUpdate: (self) => { model.rotation.y = self.progress * Math.PI * 2; }
});
```
> **성능 주의(🔴):** 모델은 Draco 압축 glTF로. 모바일은 `dpr` 1.5 캡, 미적용 시 GPU 과열. 저사양 폴백으로 이미지 시퀀스(3-2) 권장.

---

## 2. 타이포그래피 (Typography) — 메시지 각인

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| 6 | 텍스트 채우기 (Text Fill) | ★★ | 🟢 | `background-clip:text` + scrub |
| 7 | 스크롤 반응형 마키 (Kinetic Marquee) | ★★ | 🟢 | velocity 기반 방향 전환 |
| 8 | 단어 페이드 업 (Word Reveal) | ★★ | 🟢 | SplitType + stagger |
| 9 | 포커스 & 블러 (Focus Shift) | ★★ | 🟡 | `filter:blur` 트리거 |
| 10 | 세로→가로 회전 (Vertical to Horizontal) | ★★★ | 🟡 | rotate + writing-mode |

### 2-6. 텍스트 채우기 (Text Fill on Scroll)

```css
.fill-text {
  background: linear-gradient(90deg,#fff 50%, #555 50%) right / 200% 100%;
  -webkit-background-clip: text; color: transparent;
}
```
```js
gsap.to('.fill-text', {
  backgroundPosition: 'left',
  scrollTrigger: { trigger:'.fill-text', start:'top 80%', end:'bottom 40%', scrub:1 }});
```
> **고도화:** `filter` 대신 `background-position` 스크럽이라 매우 가볍다(🟢). 단어 단위로 쪼개면 "왼→오 채워짐"이 더 정밀.

### 2-7. 스크롤 반응형 마키 (Kinetic Marquee)

```js
let dir = 1;
gsap.to('.marquee-track', { xPercent: -50, repeat:-1, duration:20, ease:'none' });
ScrollTrigger.create({
  trigger: document.body, start:0, end:'max',
  onUpdate: (self) => { dir = self.direction; gsap.to('.marquee-track', { timeScale: dir, overwrite:true }); }
});
```
> 스크롤 방향(`self.direction`)으로 마키 진행 방향을 뒤집는다. 속도(velocity)에 비례해 `timeScale`을 키우면 더 역동적.

### 2-8. 단어 단위 페이드 업 (Word-by-Word Reveal)

```js
const split = new SplitType('.reveal', { types: 'words' });
gsap.from(split.words, {
  yPercent: 120, opacity: 0, stagger: 0.04,
  scrollTrigger: { trigger:'.reveal', start:'top 75%', end:'bottom 60%', scrub:1 }});
```
> `overflow:hidden`인 줄 컨테이너 안에서 `yPercent:120 → 0`을 주면 "마스크 아래에서 솟는" 고급 느낌.

### 2-9. 포커스 & 블러 (Focus & Blur Shift)

```js
gsap.utils.toArray('.blur-line').forEach((el) => {
  gsap.fromTo(el, { filter:'blur(12px)', opacity:.3 },
    { filter:'blur(0px)', opacity:1,
      scrollTrigger:{ trigger:el, start:'top 70%', end:'top 40%', scrub:true }});
});
```
> **성능 주의(🟡):** `filter:blur`는 비싸다. 동시에 블러되는 요소를 5개 이하로 제한, 모바일은 opacity만.

### 2-10. 세로→가로 회전 (Vertical to Horizontal)

```js
gsap.fromTo('.v-text', { rotate: 90, transformOrigin:'left center' },
  { rotate: 0, scrollTrigger:{ trigger:'.v-text', start:'top 80%', end:'top 30%', scrub:1 }});
```

---

## 3. 이미지 & 미디어 (Image & Media) — 시각적 몰입

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| 11 | 패럴랙스 마스킹 (Parallax Masking) | ★★★ | 🟡 | clip-path + 내부 이미지 역방향 이동 |
| 12 | 이미지 시퀀스 (Image Sequence) | ★★★★ | 🔴 | canvas + 프레임 프리로드 |
| 13 | 썸네일 확장 (Thumbnail to Fullscreen) | ★★★ | 🟡 | FLIP / scale scrub |
| 14 | 겹치는 레이어 (Overlapping Layers) | ★★ | 🟢 | 레이어별 다른 y 속도 |
| 15 | 스크롤 왜곡 (Scroll Distortion) | ★★★ | 🟡 | velocity → skew |

### 3-11. 패럴랙스 마스킹 (Parallax Masking)

```js
const tl = gsap.timeline({ scrollTrigger:{ trigger:'.mask-wrap', start:'top 80%', end:'bottom top', scrub:1 }});
tl.fromTo('.mask-wrap', { clipPath:'inset(45% 0 45% 0)' }, { clipPath:'inset(0% 0 0% 0)' }, 0)
  .fromTo('.mask-wrap img', { yPercent:-15 }, { yPercent:15, ease:'none' }, 0);
```
> 마스크가 열리는 동시에 내부 이미지를 반대로 패럴랙스시키면 "고정된 사진이 드러나는" 깊이감이 산다.

### 3-12. 이미지 시퀀스 (Apple 스타일)

```js
const frameCount = 120, images = [];
const canvas = document.querySelector('#seq'); const ctx = canvas.getContext('2d');
for (let i=0; i<frameCount; i++){ const img=new Image(); img.src=`/seq/${String(i).padStart(4,'0')}.webp`; images.push(img); }
const obj = { f: 0 };
gsap.to(obj, {
  f: frameCount - 1, snap: 'f', ease:'none',
  scrollTrigger:{ trigger:'.seq-sec', start:'top top', end:'+=300%', pin:true, scrub:0.5 },
  onUpdate: () => ctx.drawImage(images[obj.f], 0, 0),
});
```
> **성능 핵심(🔴):** WebP/AVIF로 인코딩, 프레임당 가로 1440px 이하. 120장 초과 시 lazy 청크 로드. 모바일은 60프레임으로 다운샘플.

### 3-13. 썸네일 확장 (Thumbnail to Fullscreen)

```js
gsap.to('.thumb.active', {
  scrollTrigger:{ trigger:'.thumb.active', start:'center 70%', end:'center 30%', scrub:1 },
  scale: () => window.innerWidth / document.querySelector('.thumb.active').offsetWidth,
  borderRadius: 0,
});
```
> 정밀하게 하려면 GSAP **Flip 플러그인**으로 썸네일→풀스크린 레이아웃 전환을 캡처하는 게 깔끔하다.

### 3-14. 겹치는 레이어 (Overlapping Layers)

```js
gsap.to('.layer-bg',   { yPercent:-10, scrollTrigger:{ scrub:1, trigger:'.scene', start:'top bottom', end:'bottom top' }});
gsap.to('.layer-mid',  { yPercent:-25, scrollTrigger:{ scrub:1, trigger:'.scene', start:'top bottom', end:'bottom top' }});
gsap.to('.layer-front',{ yPercent:-45, scrollTrigger:{ scrub:1, trigger:'.scene', start:'top bottom', end:'bottom top' }});
```

### 3-15. 스크롤 왜곡 (Scroll Distortion / Skew)

```js
let proxy = { skew: 0 };
const setSkew = gsap.quickSetter('.distort', 'skewY', 'deg');
const clamp = gsap.utils.clamp(-12, 12);
ScrollTrigger.create({
  onUpdate: (self) => {
    const skew = clamp(self.getVelocity() / -300);
    if (Math.abs(skew) > Math.abs(proxy.skew)) { proxy.skew = skew;
      gsap.to(proxy, { skew:0, duration:0.6, ease:'power3', overwrite:true, onUpdate:()=>setSkew(proxy.skew) }); }
  }
});
```
> 스크롤 속도(velocity)를 skew로 매핑하고 멈추면 0으로 복귀. 잔상 느낌의 클래식 기법.

---

## 4. 레이아웃 & 구조 (Layout & Structure) — 변주

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| 16 | 가로 스크롤 전환 (Horizontal Scroll) | ★★★ | 🟡 | pin + xPercent scrub |
| 17 | 반반 고정 (Pinned Split-screen) | ★★ | 🟢 | 한쪽 pin |
| 18 | 카드 스태킹 (Card Stacking) | ★★★ | 🟡 | sticky + scale/translate |
| 19 | 그리드→리스트 (Grid to List Morph) | ★★★★ | 🟡 | Flip 플러그인 |
| 20 | 자동 아코디언 (Auto Accordion) | ★★ | 🟢 | 진입 트리거 + max-height |

### 4-16. 가로 스크롤 전환 (Horizontal Scroll Section)

```js
const track = document.querySelector('.h-track');
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: { trigger:'.h-sec', start:'top top', end:() => '+=' + (track.scrollWidth - window.innerWidth), pin:true, scrub:1, invalidateOnRefresh:true },
});
```
> **고도화:** `invalidateOnRefresh:true`로 리사이즈 대응. 모바일은 가로 pin 대신 native `overflow-x:auto + scroll-snap`으로 폴백하는 게 UX상 안전.

### 4-17. 반반 고정 레이아웃 (Pinned Split-screen)

```js
ScrollTrigger.create({ trigger:'.split', start:'top top', end:'bottom bottom', pin:'.split-left' });
```
> 좌측만 pin. CSS `position: sticky; top:0`만으로도 구현 가능 — JS 없이 가는 게 더 가볍다(🟢).

### 4-18. 카드 스태킹 (Card Stacking)

```css
.stack-card { position: sticky; top: 12vh; }
```
```js
gsap.utils.toArray('.stack-card').forEach((card, i, arr) => {
  gsap.to(card, {
    scale: 1 - (arr.length - i) * 0.03, // 뒤 카드일수록 살짝 작게
    scrollTrigger:{ trigger:card, start:'top 12vh', end:'bottom top', scrub:true }});
});
```
> sticky로 쌓고, 뒤 카드는 살짝 축소·어둡게 해 깊이를 준다. transform·opacity만 써서 가볍다.

### 4-19. 그리드 → 리스트 (Grid to List Morph)

```js
gsap.registerPlugin(Flip);
const state = Flip.getState('.gallery-item');
document.querySelector('.gallery').classList.add('is-list'); // CSS로 리스트 레이아웃
Flip.from(state, { duration:0.9, ease:'power2.inOut', stagger:0.03,
  scrollTrigger:{ trigger:'.gallery', start:'top 30%', toggleActions:'play none none reverse' }});
```
> 레이아웃 전환은 손으로 좌표 계산하지 말고 **Flip**에 맡긴다. 리플로우 없는 transform 보간을 자동 처리.

### 4-20. 자동 아코디언 (Auto-expanding Accordion)

```js
gsap.utils.toArray('.acc-item').forEach((item) => {
  const panel = item.querySelector('.acc-panel');
  ScrollTrigger.create({
    trigger: item, start:'top 55%', end:'bottom 45%',
    onEnter:    () => gsap.to(panel, { height:'auto', duration:0.5, ease:'power2' }),
    onLeave:    () => gsap.to(panel, { height:0, duration:0.4 }),
    onEnterBack:() => gsap.to(panel, { height:'auto', duration:0.5 }),
    onLeaveBack:() => gsap.to(panel, { height:0, duration:0.4 }),
  });
});
```

---

## 5. 배경 & 환경 (Background & Environment) — 무드

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| 21 | 배경색 전환 (Background Color Morph) | ★ | 🟢 | scrub backgroundColor |
| 22 | 선 그리기 (SVG Path Drawing) | ★★ | 🟢 | stroke-dashoffset |
| 23 | 파티클 결합 (Particle Assembly) | ★★★★★ | 🔴 | canvas/WebGL + 목표 좌표 보간 |
| 24 | 초점 이동 (Depth of Field) | ★★ | 🟡 | 전경 blur / 배경 sharpen |
| 25 | 그라데이션 메쉬 일렁임 (Mesh Warp) | ★★★★ | 🔴 | shader / animated gradient |

### 5-21. 배경색 전환 (Background Color Morph)

```js
gsap.utils.toArray('[data-bg]').forEach((sec) => {
  ScrollTrigger.create({
    trigger: sec, start:'top 50%', end:'bottom 50%',
    onToggle: (self) => self.isActive &&
      gsap.to('body', { backgroundColor: sec.dataset.bg, color: sec.dataset.fg, duration:0.6 }),
  });
});
```
> 가장 가성비 높은 효과(★🟢). 섹션 `data-bg`/`data-fg`만 채우면 전체 톤이 스르륵 바뀐다. scrub으로 하면 그라데이션처럼 연속 전환.

### 5-22. 선 그리기 (SVG Path Drawing)

```js
gsap.utils.toArray('path.draw').forEach((path) => {
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(path, { strokeDashoffset: 0,
    scrollTrigger:{ trigger: path, start:'top 80%', end:'bottom 50%', scrub:1 }});
});
```
> GSAP **DrawSVG** 플러그인을 쓰면 한 줄(`drawSVG:'0% 100%'`)로 끝나고 부분 구간 제어도 쉽다.

### 5-23. 파티클 결합 (Particle Assembly)

```js
// 로고 이미지를 캔버스에 그려 픽셀 샘플링 → 각 파티클의 목표 좌표 추출
particles.forEach(p => { p.tx = target.x; p.ty = target.y; });
ScrollTrigger.create({ trigger:'.particles', start:'top top', end:'+=150%', pin:true, scrub:1,
  onUpdate: (self) => particles.forEach(p => {
    p.x = gsap.utils.interpolate(p.ox, p.tx, self.progress);
    p.y = gsap.utils.interpolate(p.oy, p.ty, self.progress);
  })});
```
> **성능(🔴):** 파티클 2000개 이하 권장. `requestAnimationFrame` 단일 루프에서 그리고, 모바일은 입자 수 절반. 저사양은 정적 로고로 폴백.

### 5-24. 초점 이동 (Depth of Field)

```css
/* 두 대상을 '좌우'로 나란히 둬야 흐림 ↔ 선명 대비가 한눈에 보인다 */
.dof{display:flex;align-items:center;justify-content:center;gap:clamp(2rem,8vw,7rem)}
```
```js
gsap.set('.dof-front',{filter:'blur(0px)'});   // 좌: 선명 → 흐림
gsap.set('.dof-back', {filter:'blur(16px)'});  // 우: 흐림 → 선명
const tl = gsap.timeline({ scrollTrigger:{ trigger:'.dof', start:'top 70%', end:'bottom 40%', scrub:1 }});
tl.to('.dof-front', { filter:'blur(16px)' }, 0)
  .to('.dof-back',  { filter:'blur(0px)' }, 0);
```
> **고도화(실전 교훈):** 두 레이어를 위/아래로 겹치거나 정중앙에 포개면 "무엇이 흐려지고 선명해지는지" 변화가 안 보인다. **좌우로 나란히** 배치하면 한쪽이 또렷해지는 동안 다른 쪽이 흐려지는 대비가 명확하게 읽힌다. 블러는 10px보다 **16px 이상**이 체감이 확실(단, 동시 블러 요소는 최소화).

### 5-25. 그라데이션 메쉬 일렁임 (Mesh Gradient Warp)

```js
// CSS 변수로 그라데이션 위치를 스크롤 속도에 반응시키는 경량 버전
ScrollTrigger.create({ onUpdate: (self) => {
  const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 2000);
  gsap.to('.mesh', { '--p': 50 + v * 30, duration:0.8, ease:'power2' });
}});
```
> 진짜 유체 일렁임은 WebGL 셰이더가 정석이지만(🔴), CSS 변수 + 다중 radial-gradient 조합으로 80% 인상을 가볍게 낼 수 있다.

---

## 6. 데이터 & 프로세스 (Data & Visualization) — 이해도

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| 26 | 타임라인 선 연결 (Connecting Timeline) | ★★ | 🟢 | scaleY scrub |
| 27 | 동적 숫자 카운팅 (Number Scrubbing) | ★★ | 🟢 | scrub + textContent |
| 28 | 차트 차오름 (Chart/Bar Growth) | ★★ | 🟢 | scaleY / height scrub |
| 29 | 스텝 하이라이트 (Step Highlight) | ★★ | 🟢 | active class 토글 |
| 30 | 분해능 효과 (Exploded View) | ★★★★ | 🟡 | 부품별 3D translate |

### 6-26. 타임라인 선 연결 (Connecting Timeline)

```js
gsap.fromTo('.timeline-line', { scaleY: 0, transformOrigin:'top' },
  { scaleY: 1, ease:'none',
    scrollTrigger:{ trigger:'.timeline', start:'top 50%', end:'bottom 50%', scrub:1 }});
```
> 선은 `scaleY`로 그린다(height 변경 금지 — 리플로우). 각 연도 노드는 진입 시 `scale:1` + dot 채움으로 동기화.

### 6-27. 동적 숫자 카운팅 (Number Scrubbing)

```js
const el = document.querySelector('.stat'); const obj = { v: 0 };
gsap.to(obj, { v: 10000, ease:'none', snap:{ v:1 },
  scrollTrigger:{ trigger:el, start:'top 80%', end:'top 40%', scrub:1 },
  onUpdate: () => el.textContent = Math.round(obj.v).toLocaleString() + '+' });
```
> `toLocaleString()`로 천 단위 콤마. scrub이라 위로 다시 올리면 숫자도 되감긴다 — 기획 의도와 일치.

### 6-28. 차트 차오름 (Chart/Bar Growth)

```js
gsap.utils.toArray('.bar').forEach((bar) => {
  gsap.fromTo(bar, { scaleY: 0, transformOrigin:'bottom' },
    { scaleY: bar.dataset.value / 100,
      scrollTrigger:{ trigger:bar, start:'top 85%', end:'top 50%', scrub:1 }});
});
```

### 6-29. 스텝 하이라이트 (Step-by-step Highlight)

```js
gsap.utils.toArray('.step').forEach((step) => {
  ScrollTrigger.create({ trigger: step, start:'top 55%', end:'bottom 45%',
    onToggle: (self) => step.classList.toggle('is-active', self.isActive) });
});
```
```css
.step { opacity:.35; transition: opacity .4s ease; }
.step.is-active { opacity:1; }
```

### 6-30. 분해능 효과 (Exploded View)

```js
const tl = gsap.timeline({ scrollTrigger:{ trigger:'.exploded', start:'top top', end:'+=150%', pin:true, scrub:1 }});
tl.to('.part-top',    { y:-160, z:80 }, 0)
  .to('.part-mid',    { x: 120 }, 0)
  .to('.part-bottom', { y: 160 }, 0)
  .from('.part-label',{ opacity:0, stagger:0.1 }, 0.3);
```
> 부품 컨테이너에 `transform-style: preserve-3d; perspective:1200px`을 줘 입체 분해. 라벨은 분해 후반부에 페이드인.

---

## 7. 시그니처 FX (해외 Awwwards / FWA 수상작 스타일 16종)

기본 30종 위에, 해외 수상작에서 자주 보이는 '한 끗 다른' 효과들입니다. (데모: `00_scroll.html`)

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| S1 | Circle Clip Reveal | ★★ | 🟢 | `clip-path:circle()` scrub |
| S2 | 3D Flip Cards | ★★ | 🟡 | `rotationY` + perspective |
| S3 | Perspective Tunnel | ★★★★ | 🔴 | `translateZ` + pin |
| S4 | Text Scramble | ★★★ | 🟢 | 문자 무작위 → 해독 |
| S5 | Line Mask Reveal | ★★ | 🟢 | overflow + yPercent stagger |
| S6 | Sticky Word Swap | ★★★ | 🟢 | pin + 마스크 캐러셀 |
| S7 | Column Parallax Gallery | ★★ | 🟢 | 열별 반대 yPercent |
| S8 | Ken Burns Zoom | ★★ | 🟡 | scale + pan scrub |
| S9 | Radial Progress Ring | ★★ | 🟢 | `stroke-dashoffset` scrub |
| S10 | 3D Letter Flip | ★★ | 🟡 | `rotationX` per char |
| S11 | Velocity Skew Grid | ★★★ | 🟡 | velocity → skewX |
| S12 | Pinned Image Crossfade | ★★ | 🟡 | pin + opacity 순차 |
| S13 | Multi-row Marquee | ★★ | 🟢 | 행별 반대 방향 + velocity |
| S14 | Blinds Reveal | ★★ | 🟢 | 슬랫 scaleY stagger |
| S15 | Tilt on Scroll | ★★ | 🟢 | 위치 기반 rotationX |
| S16 | Odometer Counter | ★★★ | 🟢 | 자릿수 strip translateY |

### S6. Sticky Word Swap (단어 교체) — 고도화

단순 클래스 토글은 전환이 뚝뚝 끊긴다. **방향성 있는 마스크 캐러셀 + 블러**로 부드럽게 바꾼다.

```css
.swap-stack{display:inline-grid;overflow:hidden}        /* 마스크 */
.swap-word{grid-area:1/1;                                /* 한 칸에 전부 포갬 */
  background:linear-gradient(90deg,var(--accent),var(--accent2));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}  /* 그라데이션 텍스트 */
```
```js
const words = gsap.utils.toArray('#swap .swap-word');
let cur = 0;
gsap.set(words, { yPercent:120, opacity:0, filter:'blur(10px)' });
gsap.set(words[0], { yPercent:0, opacity:1, filter:'blur(0px)' });
ScrollTrigger.create({ trigger:'.swap-sec', start:'top top', end:'+='+(words.length*60)+'%', pin:true,
  onUpdate:(s)=>{
    const idx = Math.min(words.length-1, Math.floor(s.progress*words.length*0.999));
    if (idx===cur) return;
    const dir = idx>cur ? 1 : -1;                          // 스크롤 방향대로 위/아래
    gsap.to(words[cur], { yPercent:-120*dir, opacity:0, filter:'blur(10px)', duration:0.6, ease:'power3.inOut', overwrite:true });
    gsap.fromTo(words[idx], { yPercent:120*dir, opacity:0, filter:'blur(10px)' },
      { yPercent:0, opacity:1, filter:'blur(0px)', duration:0.6, ease:'power3.out', overwrite:true });
    cur = idx;
  }});
```
> **고도화 포인트:** ① 나가는 단어는 위로, 들어오는 단어는 아래에서 — 스크롤 **방향(dir)** 에 맞춰 반대로 처리해야 자연스럽다. ② `overflow:hidden`으로 글자를 잘라 "굴러 올라오는" 마스크 느낌. ③ 블러를 얹으면 모션 블러처럼 고급스럽다. ④ 그라데이션 텍스트로 단어 자체도 예쁘게.

### S8. Ken Burns Zoom — 고도화

```css
/* 핵심: 줌이 '보이려면' 디테일/텍스처가 있어야 한다. 균일한 그라데이션은 확대해도 변화가 안 보임 */
.kb-img{position:absolute;inset:-18%;transform-origin:center;background:
  radial-gradient(28% 28% at 22% 26%,#6d8bffaa,transparent 60%),
  radial-gradient(24% 24% at 78% 70%,#c9a45caa,transparent 60%),
  repeating-linear-gradient(45deg,#ffffff08 0 2px,transparent 2px 22px),  /* 미세 패턴 = 줌 기준점 */
  linear-gradient(160deg,#1a2238,#0a0a0c)}
```
```js
gsap.fromTo('#kbImg',
  { scale:1.05, xPercent:5,  yPercent:4,  rotation:-1 },   // 시작부터 살짝 줌 → 항상 살아있음
  { scale:1.45, xPercent:-7, yPercent:-6, rotation:1.5, ease:'none',
    scrollTrigger:{ trigger:'.kb', start:'top bottom', end:'bottom top', scrub:1 }});
```
> **고도화(실전 교훈):** 처음에 안 움직이는 것처럼 보였던 원인은 ① 배경이 **균일한 그라데이션**이라 확대해도 디테일 변화가 없었고, ② 텍스트에 `mix-blend-mode:overlay`를 줘 글자가 사라져 섹션이 비어 보였던 것. → **미세 패턴/포컬 포인트**를 넣어 줌의 기준점을 만들고, 시작 scale을 1.05로 둬 처음부터 천천히 살아있게, 텍스트는 `text-shadow`로 또렷하게. 패럴랙스(xPercent/yPercent)와 미세 rotation을 더하면 카메라가 살아 움직이는 느낌.

### S1·S5·S9·S16 핵심 코드 (요약)

```js
// S1 Circle Clip Reveal — 원형 마스크가 중앙에서 확장
gsap.fromTo('#circleReveal', { clipPath:'circle(0% at 50% 50%)' },
  { clipPath:'circle(75% at 50% 50%)', ease:'none',
    scrollTrigger:{ trigger:'.circle-sec', start:'top top', end:'+=100%', pin:true, scrub:1 }});

// S5 Line Mask Reveal — 줄을 잘라 아래에서 회전하며 솟음
gsap.from('#lines .ln>div', { yPercent:118, rotation:5, stagger:0.12, ease:'none',
  scrollTrigger:{ trigger:'#lines', start:'top 80%', end:'bottom 55%', scrub:1 }});

// S9 Radial Progress Ring — 원형 게이지
const r=52, C=2*Math.PI*r;  gsap.set('#ring',{ strokeDasharray:C, strokeDashoffset:C });
gsap.to({v:0}, { v:100, ease:'none', snap:{v:1},
  scrollTrigger:{ trigger:'.ring-wrap', start:'top 78%', end:'bottom 55%', scrub:1 },
  onUpdate(){ ring.style.strokeDashoffset = C*(1 - this.targets()[0].v/100); }});

// S16 Odometer — 0~9 strip을 translateY로 굴림
strips.forEach((strip,i)=>{ const cur = progress*(+digits[i]);
  strip.style.transform = `translateY(-${cur*10}%)`; });   // strip 높이 10em, 1자리 1em
```

### S3 Perspective Tunnel (주의)

```js
const tl = gsap.timeline({ scrollTrigger:{ trigger:'.tunnel', start:'top top', end:'+=260%', pin:true, scrub:1 }});
tPanels.forEach((p,i)=>{
  gsap.set(p, { z:-2400, opacity:0 });
  tl.fromTo(p, { z:-2400, opacity:0 }, { z:330, opacity:1, duration:1, ease:'none' }, i*0.6)
    .to(p, { opacity:0, duration:0.3 }, i*0.6+0.85);       // 카메라를 지나가며 페이드아웃
});
```
> 컨테이너에 `perspective:520px; transform-style:preserve-3d`. 패널이 많거나 큰 이미지면 🔴 — 모바일은 패널 수를 줄이고 z 범위를 좁힌다.

---

## 8. 확장 효과 11종 (N1~N11)

추가 스크롤 효과 10종. (라이브 데모: `00_scroll.html`의 `08 · Extended FX` 섹션)

| # | 효과 | 난이도 | 성능 | 핵심 기법 |
|---|---|---|---|---|
| N1 | Satisfying Char Stagger + Reactive Marquee | ★★ | 🟢 | 글자 분리 stagger + velocity 마퀴 |
| N2 | Connected Section Handoff | ★★★ | 🟡 | pin + 다음 패널 translateY 오버랩 |
| N3 | Image Split Flip | ★★★ | 🟡 | background-position 분할 + rotationY |
| N4 | Bars Reveal Intro | ★★★ | 🟡 | 풀스크린 bar 마스크 retract |
| N5 | SVG Wipe Content Swap | ★★★ | 🟡 | clip-path 도형이 덮은 사이 swap |
| N6 | Column Sweep Transition | ★★★ | 🟡 | 컬럼 scaleY 커버→언커버 |
| N7 | One-Timeline Orchestration | ★★ | 🟢 | 단일 timeline position 파라미터 |
| N8 | Film Strip Gallery | ★★ | 🟡 | 가로 pin + 스프로킷 밴드 |
| N9 | Window Aperture Hero | ★★★ | 🟡 | clip-path inset 확장 + 내부 패럴랙스 |
| N10 | Synced Index Roster (인덱스·로스터 동기 스크롤) | ★★★★ | 🟡 | pin + 단일 progress가 숫자·이미지컬럼·로스터를 동기 구동 |
| N11 | Hover Expand Strip (Interactive Accordion) | ★★ | 🟢 | 포인터 호버 flex-grow + 마지막 활성 유지 |

> **공통:** 모두 `transform / opacity / clip-path`만 사용. pin 사용 효과(N2·N4·N5·N6·N7·N9)는 한 페이지에 몰아서 쓰지 말고 분산(성능 예산: pin 3개 이하). 모바일은 scrub 대신 지점 트리거로 폴백 권장.

### N1. Satisfying Char Stagger + Reactive Marquee

```js
// 제목을 글자 단위로 쪼개 회전+상승 stagger, 아래 마퀴는 스크롤 속도/방향에 반응
const csh = document.getElementById('csHead');
csh.innerHTML = csh.dataset.text.split('').map(c =>
  c===' ' ? '<span class="ch">&nbsp;</span>' : '<span class="ch">'+c+'</span>').join('');
gsap.from('#csHead .ch', { yPercent:130, rotateX:-90, opacity:0, stagger:0.045, ease:'back.out(1.6)',
  scrollTrigger:{ trigger:'#csHead', start:'top 80%', end:'bottom 55%', scrub:1 }});

const csm = gsap.to('#csMarq', { xPercent:-50, repeat:-1, duration:14, ease:'none' });
ScrollTrigger.create({ start:0, end:'max', onUpdate:s=>{
  const v = gsap.utils.clamp(-4,4, s.getVelocity()/350);
  gsap.to(csm, { timeScale: v===0?1:v, duration:0.4, overwrite:true });
}});
```
> **고도화:** 부모에 `perspective`가 있어야 `rotateX`가 입체로 보인다. `back.out` 오버슈트가 "satisfying" 포인트 — scrub과 함께 쓰면 스크롤하며 살짝 튕겼다 안착. 마퀴는 글자 색 대신 `-webkit-text-stroke`로 비워 두면 본문과 위계가 분리된다.

### N2. Connected Section Handoff

```js
// 다음 패널이 끌어올려지며 겹치면 섹션이 끊기지 않고 이어지는 연결감이 산다.
const ho = gsap.timeline({ scrollTrigger:{ trigger:'.handoff', start:'top top', end:'+=120%', pin:true, scrub:1 }});
ho.fromTo('.ho-panel:nth-child(2)', { yPercent:100 }, { yPercent:0, ease:'none' }, 0)
  .fromTo('.ho-panel:nth-child(1)', { scale:1, filter:'brightness(1)' },
                                    { scale:0.92, filter:'brightness(0.5)', ease:'none' }, 0);
```
> **고도화:** 핵심은 두 동작을 **같은 타임라인 position(0)** 에 두는 것 — 한쪽이 끝나고 다음이 시작하는 게 아니라 동시에 겹쳐야 "이어진다"는 인상. 덮는 패널 위쪽에 `border-radius`를 주면 카드가 밀려 올라오는 느낌이 강해진다.

### N3. Image Split Flip

```css
/* 한 장의 이미지를 background-size:300%로 깔고 3등분 위치만 다르게 */
.sf-card{ flex:1; background-image:url(img.webp); background-size:300% 100%; backface-visibility:hidden }
.sf-card:nth-child(1){ background-position:0 0 }
.sf-card:nth-child(2){ background-position:50% 0 }
.sf-card:nth-child(3){ background-position:100% 0 }
```
```js
gsap.from('.sf-card', { rotationY:90, opacity:0, transformOrigin:'left center', stagger:0.15, ease:'none',
  scrollTrigger:{ trigger:'.splitflip', start:'top 80%', end:'bottom 55%', scrub:1 }});
```
> **고도화:** 3장이 각자 90°→0°로 펼쳐지며 한 장의 이미지로 합쳐지는 게 트릭. 부모 `perspective`(1400~1600px)와 카드별 `transform-origin`이 입체감을 좌우한다. `backface-visibility:hidden`으로 뒷면 깜빡임 제거.

### N4. Bars Reveal Intro

```js
const brBars = document.getElementById('brBars');
for(let i=0;i<7;i++){ const b=document.createElement('div'); b.className='br-bar'; brBars.appendChild(b); }
const brTl = gsap.timeline({ scrollTrigger:{ trigger:'.barsreveal', start:'top top', end:'+=120%', pin:true, scrub:1 }});
brTl.from('.br-title', { yPercent:120, opacity:0, ease:'power3' }, 0)
    .to('.br-bar',   { scaleY:0, transformOrigin:'top', stagger:0.08, ease:'power2.in' }, 0);
```
> **고도화:** 풀스크린을 세로 bar로 덮어 두고 `scaleY:1→0`(origin top)으로 위로 걷어 올린다. stagger로 좌→우 시차를 주면 "막이 갈라지는" 인트로. 제목 리빌과 같은 position(0)에 두어 막이 걷히는 순간 글자가 함께 솟게.

### N5. SVG Wipe Content Swap

```js
// 도형(원형 clip)이 화면을 덮은 '사이'에 콘텐츠를 바꾸고 다시 걷는다 → 교체가 보이지 않는다
const ssTl = gsap.timeline({ scrollTrigger:{ trigger:'.svgswap', start:'top top', end:'+=160%', pin:true, scrub:1 }});
ssTl.to('.ss-cover', { clipPath:'circle(75% at 50% 50%)', ease:'power2.inOut', duration:1 }, 0)
    .set('.ss-a', { opacity:0 }, 0.5)   // 완전히 덮인 시점에 swap
    .set('.ss-b', { opacity:1 }, 0.5)
    .to('.ss-cover', { clipPath:'circle(0% at 50% 50%)', ease:'power2.inOut', duration:1 }, 1);
```
> **고도화:** 콘텐츠 교체(`.set`)를 **커버가 100% 덮인 정확한 순간(0.5)** 에 배치하는 게 핵심 — 조금만 어긋나도 교체가 들킨다. 실제 SVG `<clipPath>`/blob 패스를 쓰면 원형 대신 유기적 도형으로 확장된다.

### N6. Column Sweep Transition

```js
const cwCols = document.getElementById('cwCols');
for(let i=0;i<6;i++){ const c=document.createElement('div'); c.className='cw-col'; cwCols.appendChild(c); }
const cwTl = gsap.timeline({ scrollTrigger:{ trigger:'.colsweep', start:'top top', end:'+=160%', pin:true, scrub:1 }});
cwTl.to('.cw-col', { scaleY:1, transformOrigin:'bottom', stagger:0.06, ease:'power2.inOut', duration:1 }, 0)
    .set('.cw-a', { opacity:0 }, 1).set('.cw-b', { opacity:1 }, 1)   // 덮인 사이 페이지 교체
    .to('.cw-col', { scaleY:0, transformOrigin:'top', stagger:0.06, ease:'power2.inOut', duration:1 }, 1.05);
```
> **고도화:** N5가 단일 도형이라면 N6은 **컬럼 다발**로 덮었다 같은 방향(아래→위)으로 빠져나간다. 컬럼 상단 `border-radius`가 라운드 전환 시그니처. 커버 완료(1) 시점에 PAGE A→B 교체.

### N7. One-Timeline Orchestration

```js
// 머리말·제목·본문·이미지·태그를 하나의 timeline이 position 파라미터로 지휘
const orTl = gsap.timeline({ scrollTrigger:{ trigger:'.orchestra', start:'top top', end:'+=140%', pin:true, scrub:1 }});
orTl.from('.orchestra .ey', { yPercent:100, opacity:0, ease:'power3' })
    .from('.orchestra .ti', { yPercent:120, opacity:0, stagger:0.15, ease:'power3' }, '-=0.3')
    .from('.orchestra .su', { y:30, opacity:0, ease:'power2' }, '-=0.4')
    .from('.orchestra .pic',{ scale:0.85, opacity:0, ease:'power2' }, '-=0.5')
    .from('.orchestra .tags span', { y:20, opacity:0, stagger:0.08, ease:'power2' }, '-=0.4');
```
> **고도화:** 개별 ScrollTrigger를 5개 만들지 말고 **하나의 timeline + 상대 position(`'-=0.3'`)** 으로 겹침을 설계한다. 겹치는 음수 오프셋이 "한 호흡으로 펼쳐지는" 리듬을 만든다. 로드 인트로면 scrub을 빼고 그냥 재생.

### N8. Film Strip Gallery

```css
.fs-strip{ position:relative; padding:18px 0; background:#08080a }   /* 위아래 스프로킷 밴드 */
.fs-strip::before,.fs-strip::after{ content:''; position:absolute; left:0; width:100%; height:12px;
  background:repeating-linear-gradient(90deg,#0a0a0c 0 10px,#2a2a30 10px 24px) }   /* 천공 */
.fs-strip::before{ top:2px } .fs-strip::after{ bottom:2px }
```
```js
const fsTrack = document.getElementById('fsTrack');
gsap.to(fsTrack, { x:()=>-(fsTrack.scrollWidth-window.innerWidth), ease:'none',
  scrollTrigger:{ trigger:'.filmstrip', start:'top top',
    end:()=>'+='+(fsTrack.scrollWidth-window.innerWidth), pin:true, scrub:1, invalidateOnRefresh:true }});
```
> **고도화:** 가로 스크롤(16)과 골격은 같되 위아래 **스프로킷 천공 밴드**가 필름 정체성을 만든다. 중앙 프레임을 강조하려면 `containerAnimation`으로 각 프레임에 center scale을 묶는다(hover 기반으로도 응용 가능). `invalidateOnRefresh`로 리사이즈 대응.

### N9. Window Aperture Hero

```js
// 작은 '창'이 스크롤에 따라 풀스크린으로 열리며, 내부는 반대로 패럴랙스되어 깊이가 생긴다
const whTl = gsap.timeline({ scrollTrigger:{ trigger:'.window-hero', start:'top top', end:'+=140%', pin:true, scrub:1 }});
whTl.fromTo('#whScene', { clipPath:'inset(34% 30% round 18px)' }, { clipPath:'inset(0% 0% round 0px)', ease:'none' }, 0)
    .fromTo('#whFrame', { opacity:1 }, { opacity:0, ease:'none' }, 0)
    .fromTo('#whInner', { yPercent:-12 }, { yPercent:12, ease:'none' }, 0);
```
> **고도화:** `clip-path: inset()` 의 여백을 줄이며 창을 연다 — `round`까지 0으로 보간하면 모서리도 함께 펴진다. 내부 패턴/이미지를 반대로 `yPercent` 패럴랙스하면 "정지된 풍경을 창 너머로 들여다보는" 깊이가 생긴다. 테두리 프레임은 열리며 페이드아웃.

### N10. Synced Index Roster (인덱스·로스터 동기 스크롤)

해외 에이전시 포트폴리오(Awwwards형 "Selected Works")의 시그니처 — **하나의 스크롤 progress가
①왼쪽 큰 인덱스 숫자(`05 /10`) ②가운데 이미지 컬럼 ③오른쪽 브랜드명 로스터를 동시에 구동**한다.
가운데 이미지는 위로 흐르며 초점선(화면 중앙)을 통과할 때만 또렷하고 위아래는 흐려져 **크로스블렌드**되고,
초점에 온 항목의 번호·카테고리(이탤릭)·브랜드명이 동기화되어 강조된다. 배경 원호가 진행에 따라 미세 회전.

```css
.idxroster{ height:100vh; overflow:hidden; position:relative }
.idx-cards{ position:relative; will-change:transform;          /* 가운데 이미지 컬럼 */
  padding-block:calc(50vh - var(--idxH)/2) }                   /* 첫·끝 항목도 중앙 정렬 */
.idx-card{ height:var(--idxH); margin-bottom:var(--idxGap); will-change:transform,opacity }
.idx-roster li{ height:var(--idxNameH); color:rgba(20,17,13,.32);   /* 행 높이 고정이 핵심 */
  transition:color .35s, font-size .35s }                      /* (font-size 바뀌어도 step 불변) */
.idx-roster li.on{ color:#14110d; font-size:2rem; font-weight:600 }
```
```js
const N = DATA.length, cards=[...cardsEl.children], names=[...rosterEl.children];
let cardStep=0, nameStep=0, lastA=-1;
const measure=()=>{                       // 실제 DOM 간격을 측정 → 리사이즈/폰트 로드에 견고
  cardStep = cards[1].offsetTop - cards[0].offsetTop;
  nameStep = names[1].offsetTop - names[0].offsetTop;
};
const render=(pos)=>{                      // pos = 0~(N-1) 연속값
  gsap.set(cardsEl,  { y:-pos*cardStep });
  gsap.set(rosterEl, { y:-pos*nameStep });
  cards.forEach((c,i)=>{ const d=Math.abs(i-pos);     // 초점선에서 멀수록 흐려짐 → 크로스블렌드
    c.style.opacity = Math.max(0.08, 1 - d*0.62);
    c.firstChild.style.transform = 'scale('+(1 - Math.min(d,2)*0.04)+')'; });
  const a=Math.round(pos);                 // 초점에 가장 가까운 항목만 강조 (숫자/이름/메타)
  if(a!==lastA){ lastA=a;
    numEl.textContent = String(a+1).padStart(2,'0');
    names.forEach((li,i)=>li.classList.toggle('on', i===a));
    metaL.textContent = DATA[a].l; metaR.textContent = DATA[a].r;
    gsap.fromTo([metaL,metaR],{opacity:0,y:6},{opacity:1,y:0,duration:.4,ease:'power2'});
  }
};
measure(); render(0);
ScrollTrigger.create({ trigger:'.idxroster', start:'top top', end:'+='+(N*42)+'%',
  pin:true, scrub:1, invalidateOnRefresh:true, onRefresh:measure,
  onUpdate:s=>{ const pos = s.progress*(N-1); render(pos);
    gsap.set(arc,{ rotation: s.progress*55 }); }});
```
> **고도화:** 세 트랙(숫자·이미지·로스터)을 각각 ScrollTrigger로 만들지 말고 **단일 progress → `render(pos)`** 로 묶는 게 동기화의 핵심 — 따로 만들면 scrub 관성차로 어긋난다. step을 vh로 하드코딩하지 말고 `offsetTop` 차이를 `onRefresh`마다 재측정해야 리사이즈·웹폰트 로드 후에도 초점이 정확하다. 로스터 `li`는 **행 높이를 고정**하고 활성 항목만 `font-size`로 키워야(높이 불변) step 계산이 깨지지 않는다. `Math.round(pos)` 변화 시에만 DOM 텍스트를 갱신해 매 프레임 리플로우를 피한다. 모바일은 pin 부담이 크니 `data-nav` 진입 트리거로 강등하거나 carousel로 폴백.

### N11. Hover Expand Strip (Interactive Accordion)

```css
/* 가로로 늘어선 패널 — 활성(호버) 하나만 flex-grow로 확장, 나머지는 좁아진다 */
.hx-strip{ display:flex; gap:0; height:min(60vh,520px) }
.hx-panel{ position:relative; flex:.55 1 0; min-width:0; overflow:hidden; cursor:pointer;
  transition:flex-grow .65s cubic-bezier(.22,1,.36,1) }
.hx-panel.is-active{ flex-grow:6 }                 /* 확장은 .is-active 단일 상태로만 */
.hx-panel .ov{ opacity:0; transform:translateY(12px);
  transition:opacity .45s .1s, transform .5s .1s } /* 펼쳐질 때 개요 리빌 */
.hx-panel.is-active .ov{ opacity:1; transform:none }
.hx-panel .spine{ transition:opacity .35s }        /* 좁을 때 세로 라벨 */
.hx-panel.is-active .spine{ opacity:0 }
```
```js
const panels = gsap.utils.toArray('.hx-panel');
const setActive = el => panels.forEach(p => p.classList.toggle('is-active', p === el));
setActive(panels[0]);                              // 기본 활성 1개
panels.forEach(p => {
  p.addEventListener('pointerenter', () => setActive(p));  // 올리면 확장
  p.addEventListener('focusin',      () => setActive(p));  // 키보드 접근성
  // mouseleave reset 없음 → 마우스를 떼도 마지막 호버 패널이 유지된다
});
```
> **용도:** 포트폴리오/갤러리 메인에서 "여러 썸네일 중 가리키는 것이 펼쳐지며 개요(업종·가격·기능·기간)를 보여주는" 인터랙션. 책갈피 탭 + 세로 라벨을 항상 노출해 좁은 패널도 식별된다.
> **고도화(★ 함정):** CSS `:hover`만으로 하면 `.strip:hover .panel{flex-grow:.6}` 후손 선택자가 `.panel:hover`보다 특정도가 높아 **마우스를 올리면 오히려 줄고, 떼야 커지는** 버그가 난다. 그래서 **JS `is-active` 단일 상태**로 통일하고, `mouseleave`에서 리셋하지 않아 "떼도 마지막 선택 유지"를 만든다. 모바일은 가로 아코디언 대신 **세로 카드 스택**으로 폴백(`flex-direction:column` + 개요 상시 노출). `prefers-reduced-motion`이면 `transition` 제거(즉시 전환). `flex-grow`만 트랜지션하므로 성능 🟢.

---

## 9. 적용 전략 (템플릿 라인업 연계)

`../docs/21.md`의 템플릿 성격별로 효과를 매칭한 권장안:

| 템플릿 유형 | 1순위 효과 | 2순위 | 피해야 할 것 |
|---|---|---|---|
| 법률/세무 (Law & Trust) | 6 텍스트채우기, 8 단어리벌, 26 타임라인 | 21 배경색전환 | 화려한 3D·왜곡 (신뢰감 저하) |
| 컨설턴트 (Expertise Arc) | 27 숫자카운팅, 28 차트, 29 스텝 | 18 카드스태킹 | 과한 패럴랙스 |
| 건축/갤러리 (Architectural) | 11 패럴랙스마스킹, 13 썸네일확장, 16 가로스크롤 | 12 이미지시퀀스 | 정보 가독성 해치는 마키 |
| 제품/테크 | 1 축소락, 12 시퀀스, 30 분해능 | 5 3D회전 | 저사양 폴백 누락 |

### 성능 예산 (Performance Budget)
- 한 페이지에 `pin` 섹션 **3개 이하**, 동시 `filter:blur` 요소 **5개 이하**.
- LCP 요소(히어로)에는 무거운 스크럽을 걸지 않는다 — 첫 페인트 지연.
- 모든 scrub 효과는 모바일에서 진입 트리거(`toggleActions`)로 자동 강등하는 분기를 둔다.
- `prefers-reduced-motion: reduce`면 최종 상태만 즉시 적용 (아래 패턴).

```js
if (reduce) {
  // 모든 ScrollTrigger를 만들지 않고 요소를 최종 상태로 set
  gsap.set('[data-final]', { clearProps:'all', opacity:1, x:0, y:0, scale:1 });
} else {
  initScrollAnimations();
}
```

---

## 부록: 네이티브 CSS 대안 (라이브러리 없이)

진입 페이드·간단한 패럴랙스는 2024+ 브라우저에서 JS 0줄로 가능 (Chrome 115+, 폴백 필수).

```css
@keyframes fade-up { from { opacity:0; transform: translateY(40px); } to { opacity:1; transform:none; } }
.reveal-native {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 35%;
}
@supports not (animation-timeline: view()) {
  .reveal-native { opacity:1; transform:none; } /* 폴백: 즉시 노출 */
}
```
> 단순 효과는 네이티브로 빼면 번들·메인스레드 부담이 준다. 단, scrub·pin·velocity 기반(마키·왜곡·시퀀스)은 여전히 GSAP가 정답.
