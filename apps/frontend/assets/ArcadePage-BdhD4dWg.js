import{r,j as e,d as L}from"./react-vendor-gyK15t0p.js";import{G as I}from"./GameModal-BohLMt3z.js";import{M as P,P as T}from"./index-B2qSlCu9.js";import{M as F}from"./MascotBubble-BgLJ3kEg.js";import"./ShareMenu-BdQvel9y.js";const _=`
.gg-bubble{position:absolute;z-index:9400;max-width:270px;background:linear-gradient(160deg,#160b2e,#0d0820);border:1px solid rgba(146,16,246,0.5);border-radius:14px;padding:14px 16px;box-shadow:0 16px 48px rgba(0,0,0,0.55),0 0 28px rgba(146,16,246,0.2);font-family:'DM Sans',sans-serif;color:#fff;animation:ggIn .25s cubic-bezier(.22,1,.36,1) both}
@keyframes ggIn{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}
.gg-step{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#c084fc;margin-bottom:6px}
.gg-step i{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#9210f6,#610497);color:#fff;font-style:normal;font-size:10px;display:grid;place-items:center}
.gg-title{font-size:14.5px;font-weight:700;margin-bottom:4px;line-height:1.3}
.gg-txt{font-size:12px;line-height:1.55;color:rgba(255,255,255,0.68);margin-bottom:11px}
.gg-actions{display:flex;align-items:center;justify-content:space-between}
.gg-next{padding:7px 16px;border:none;border-radius:9px;background:linear-gradient(135deg,#9210f6,#610497);color:#fff;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 3px 14px rgba(146,16,246,0.35)}
.gg-skip{background:none;border:none;color:rgba(255,255,255,0.45);font-family:'DM Sans',sans-serif;font-size:11.5px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.gg-skip:hover{color:#fff}
.gg-target-hl{position:relative;z-index:3;outline:2.5px solid #c084fc !important;outline-offset:3px;border-radius:16px;animation:ggPulse 1.6s ease infinite}
@keyframes ggPulse{0%,100%{outline-color:#c084fc}50%{outline-color:rgba(192,132,252,0.35)}}
.gg-center{position:fixed;left:50%;top:44%;transform:translate(-50%,-50%);z-index:9400;width:min(90vw,340px);text-align:center}
.gg-center .gg-actions{justify-content:center;gap:14px}
.gg-nudge{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:9300;display:flex;align-items:center;gap:13px;width:min(92vw,420px);background:linear-gradient(160deg,#160b2e,#0d0820);border:1px solid rgba(146,16,246,0.45);border-radius:16px;padding:12px 14px;box-shadow:0 16px 48px rgba(0,0,0,0.5),0 0 28px rgba(146,16,246,0.18);font-family:'DM Sans',sans-serif;color:#fff;animation:ggUp .35s cubic-bezier(.22,1,.36,1) both}
@keyframes ggUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
.gg-nudge-img{width:52px;height:52px;border-radius:10px;object-fit:cover;background:rgba(146,16,246,0.2);flex-shrink:0}
.gg-nudge-play{margin-left:auto;padding:9px 18px;border:none;border-radius:10px;background:linear-gradient(135deg,#9210f6,#610497);color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;flex-shrink:0;box-shadow:0 4px 16px rgba(146,16,246,0.4)}
.gg-x{position:absolute;top:6px;right:9px;background:none;border:none;color:rgba(255,255,255,0.45);font-size:14px;cursor:pointer;padding:4px}
.gg-x:hover{color:#fff}
@media(max-width:640px){.gg-bubble:not(.gg-center){max-width:220px}.gg-nudge{bottom:14px}}
`,z=[{key:"play",title:"Pick a game, hit Play",txt:"Tap any tile to launch it instantly — no download, plays right here."},{key:"counts",title:"Plays update live",txt:"This counter ticks up in real time as players launch games."},{key:"save",title:"Finish → save your coins",txt:"Complete a game and the login card pops up — sign up free to keep Promo Coins, best scores and rewards.",center:!0}];function E(){return!(localStorage.getItem("playerToken")||sessionStorage.getItem("playerToken"))}function B({ready:a,sampleGame:l,onPlay:v}){const[i,h]=r.useState(null),[u,m]=r.useState(null),[b,j]=r.useState(!1),g=r.useRef(null),p=r.useCallback(()=>{h(null),j(!1);try{localStorage.setItem("pg_guide_seen","1")}catch{}},[]);if(r.useEffect(()=>{if(!a||!E())return;let o=!1;try{o=localStorage.getItem("pg_guide_seen")==="1"}catch{}o||h(0)},[a]),r.useEffect(()=>{if(i===null||i>=z.length){m(null);return}const o=z[i];if(o.center){m(null),g.current=null;return}const c=setTimeout(()=>{var f,y;let n=null;if(o.key==="play"&&(n=document.querySelector(".pg-grid .pg-tile")),o.key==="counts"&&(n=document.querySelector(".arc-grid-count")),!n){m(null),g.current=null;return}const w=()=>{const S=n.getBoundingClientRect();m({top:S.top,left:S.left,width:S.width}),n.classList.add("gg-target-hl"),g.current=n};requestAnimationFrame(()=>{w(),window.addEventListener("resize",w)}),(y=(f=g.current)==null?void 0:f._cleanup)==null||y.call(f),n._cleanup=()=>{n.classList.remove("gg-target-hl"),window.removeEventListener("resize",w)}},60);return()=>{clearTimeout(c),g.current&&(g.current.classList.remove("gg-target-hl"),g.current=null)}},[i]),r.useEffect(()=>()=>{document.querySelectorAll(".gg-target-hl").forEach(o=>o.classList.remove("gg-target-hl"))},[]),r.useEffect(()=>{if(!a||!E()||i!==null)return;let o=!1;try{o=sessionStorage.getItem("pg_nudged")==="1"}catch{}if(o)return;let c=null;const n=()=>{c&&clearTimeout(c),c=setTimeout(()=>{try{sessionStorage.setItem("pg_nudged","1")}catch{}j(!0)},1e4)},w=["mousemove","keydown","touchstart","scroll"];return w.forEach(f=>window.addEventListener(f,n,{passive:!0})),n(),()=>{c&&clearTimeout(c),w.forEach(f=>window.removeEventListener(f,n))}},[a,i]),!a||!E())return null;if(b&&l&&i===null){const o=l.thumbnail_url||l.game_logo_url||l.bg_image_url;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:_}),e.jsxs("div",{className:"gg-nudge",role:"status",children:[e.jsx("img",{className:"gg-nudge-img",src:o,alt:"",width:"52",height:"52"}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("div",{className:"gg-title",children:"Still there?"}),e.jsxs("div",{className:"gg-txt",style:{marginBottom:0},children:["Try ",e.jsx("strong",{children:l.name})," — takes under a minute!"]})]}),e.jsx("button",{className:"gg-nudge-play",onClick:()=>{p(),j(!1),v==null||v(l)},children:"Play"}),e.jsx("button",{className:"gg-x","aria-label":"Dismiss",onClick:()=>{j(!1);try{sessionStorage.setItem("pg_nudged","1")}catch{}},children:"✕"})]})]})}if(i===null||i>=z.length)return null;const k=z[i],C=i===z.length-1;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:_}),k.center?e.jsxs("div",{className:"gg-bubble gg-center",children:[e.jsx("button",{className:"gg-x","aria-label":"Skip guide",onClick:p,children:"✕"}),e.jsx("div",{style:{fontSize:38,marginBottom:8},children:"🪙"}),e.jsxs("div",{className:"gg-step",children:[e.jsxs("i",{children:[i+1,"/3"]})," Your progress"]}),e.jsx("div",{className:"gg-title",children:k.title}),e.jsx("div",{className:"gg-txt",children:k.txt}),e.jsxs("div",{className:"gg-actions",children:[e.jsx("button",{className:"gg-skip",onClick:p,children:"Got it"}),e.jsx("button",{className:"gg-next",onClick:p,children:C?"Let's play! 🎮":"Next"})]})]}):u&&e.jsxs("div",{className:"gg-bubble",style:{position:"fixed",top:Math.min(Math.max(u.top-10,84),window.innerHeight-190),left:Math.min(Math.max(u.left,10),Math.max(window.innerWidth-290,10))},children:[e.jsx("button",{className:"gg-x","aria-label":"Skip guide",onClick:p,children:"✕"}),e.jsxs("div",{className:"gg-step",children:[e.jsxs("i",{children:[i+1,"/3"]})," Quick tour"]}),e.jsx("div",{className:"gg-title",children:k.title}),e.jsx("div",{className:"gg-txt",children:k.txt}),e.jsxs("div",{className:"gg-actions",children:[e.jsx("button",{className:"gg-skip",onClick:p,children:"Skip"}),e.jsx("button",{className:"gg-next",onClick:()=>h(o=>o+1),children:"Next"})]})]})]})}const D=()=>e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",children:e.jsx("polyline",{points:"9 18 15 12 9 6"})}),R=`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07040f;
  --bg2:#0d0820;
  --purple:#9210f6;
  --purple2:#610497;
  --purple3:#7C3AED;
  --accent:#c040ff;
  --gold:#f5c842;
  --glass:rgba(255,255,255,0.05);
  --gb:rgba(255,255,255,0.10);
  --muted:rgba(255,255,255,0.52);
  --fh:'Bebas Neue',sans-serif;
  --fb:'DM Sans',sans-serif;
  --fm:'Space Mono',monospace;
}
html{scroll-behavior:smooth}
body{font-family:var(--fb);background:var(--bg);color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
::-webkit-scrollbar-thumb{background:rgba(146,16,246,0.4);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(146,16,246,0.6)}

.arc-scroll-bar{position:fixed;top:0;left:0;height:3px;z-index:9999;background:linear-gradient(90deg,var(--purple),var(--purple3));width:var(--scroll-pct,0%);transition:width .05s linear;box-shadow:0 0 10px var(--purple)}

.arc-container{max-width:100%;margin:0;padding:0}
.arc-content{padding-top:120px}

.arc-featured{padding:40px 0 24px}
.arc-featured > .arc-container{max-width:1720px;margin:0 auto;padding:0 10px}
.arc-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.arc-section-title{font-family:var(--fh);font-size:24px;font-weight:400;letter-spacing:3px;color:#fff;text-transform:uppercase}
.arc-view-all{display:inline-flex;align-items:center;gap:6px;font-family:var(--fb);font-size:14px;font-weight:600;color:var(--accent);text-decoration:none;transition:gap .2s}
.arc-view-all:hover{gap:10px}
.arc-featured-scroll{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px;margin:0;padding-left:0;padding-right:0}
.arc-featured-card{flex:0 0 auto;width:280px;scroll-snap-align:start;border-radius:16px;overflow:hidden;cursor:pointer;background:#171a23;border:1px solid rgba(255,255,255,0.08);transition:transform .3s,box-shadow .3s,border-color .3s}
.arc-featured-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,0.6),0 0 0 1px rgba(146,16,246,0.4);border-color:rgba(146,16,246,0.5)}
.arc-featured-thumb{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:linear-gradient(150deg,rgba(146,16,246,0.25),rgba(97,4,151,0.12))}
.arc-featured-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.arc-featured-card:hover .arc-featured-thumb img{transform:scale(1.1)}
.arc-featured-info{padding:14px 16px}
.arc-featured-name{font-family:var(--fb);font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.arc-featured-meta{font-size:12px;color:rgba(255,255,255,0.5);display:flex;align-items:center;gap:8px}
.arc-featured-cat{font-family:var(--fm);font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(146,16,246,0.2);border:1px solid rgba(146,16,246,0.4);color:#c084fc}

.arc-grid-section{padding:0 0 5px}
.arc-grid-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px}
.arc-grid-label{font-family:var(--fh);font-size:clamp(20px,2.4vw,30px);font-weight:400;letter-spacing:2px;color:#fff;display:flex;align-items:center;gap:12px}
.arc-grid-count{font-family:var(--fm);font-size:11px;color:var(--muted);letter-spacing:1px}

/* ── Play grid — CrazyGames-style mixed tiles ─────────────────── */
/* Fluid container: scales with the viewport up to a readable cap, so the
   grid adapts to any resolution (small laptops → ultrawide / 4K). */
.arc-grid-section > .arc-container{max-width:1720px;margin:0 auto;padding:0 10px;container-type:inline-size}
.pg-grid{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-flow:row dense;gap:clamp(10px,1.1vw,18px)}
/* row heights in cqw (% of container width) keep every tile proportional at any size */
.pg-grid{grid-auto-rows:176px;grid-auto-rows:16.5cqw}
.pg-tile{position:relative;border-radius:16px;overflow:hidden;cursor:pointer;background:#171a23;border:1px solid rgba(255,255,255,0.07);text-decoration:none;animation:pgIn .45s cubic-bezier(.22,1,.36,1) both;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s,border-color .25s}
.pg-tile:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,0.6),0 0 0 1px rgba(146,16,246,0.4);border-color:rgba(146,16,246,0.5);z-index:3}
@keyframes pgIn{from{opacity:0;transform:translateY(16px) scale(0.96)}to{opacity:1;transform:none}}
.pg-tile-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s cubic-bezier(.22,1,.36,1)}
.pg-tile:hover .pg-tile-bg{transform:scale(1.07)}
.pg-tile-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:42px;background:linear-gradient(150deg,rgba(146,16,246,0.32),rgba(97,4,151,0.16))}
.pg-tile-shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,10,16,0.9) 0%,rgba(8,10,16,0.42) 38%,rgba(8,10,16,0.05) 60%)}
.pg-tile-cat{position:absolute;top:10px;left:10px;z-index:2;font-family:var(--fm);font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(8,8,16,0.62);border:1px solid rgba(255,255,255,0.16);color:rgba(255,255,255,0.85);backdrop-filter:blur(6px)}
.pg-tile-info{position:absolute;left:0;right:0;bottom:0;padding:14px;z-index:2}
.pg-tile-name{font-family:var(--fb);font-size:13.5px;font-weight:700;color:#fff;line-height:1.28;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 2px 10px rgba(0,0,0,0.6)}
.pg-tile-meta{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);margin-top:4px}
.pg-tile-meta svg{width:9px;height:9px;flex-shrink:0;color:rgba(255,255,255,0.4)}
.pg-tile-play{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;background:rgba(8,10,16,0.34);opacity:0;transition:opacity .22s}
.pg-tile:hover .pg-tile-play{opacity:1}
.pg-tile-play-btn{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,0.97);display:grid;place-items:center;box-shadow:0 6px 24px rgba(0,0,0,0.55);transform:scale(0.5) translateY(8px);transition:transform .28s cubic-bezier(.34,1.56,.64,1)}
.pg-tile:hover .pg-tile-play-btn{transform:scale(1) translateY(0)}
.pg-tile:focus-visible,.arc-featured-card:focus-visible{outline:2.5px solid #c084fc;outline-offset:3px}

/* hero placements — 12-column layout:
   1 big square · vertical 2-stack · 1 wide tile · 3 small · 4 medium */
.pg-h0{grid-column:1 / span 4;grid-row:1 / span 2}
.pg-h1{grid-column:5 / span 2;grid-row:1}
.pg-h2{grid-column:5 / span 2;grid-row:2}
.pg-h3{grid-column:7 / span 6;grid-row:1}
.pg-h4{grid-column:7 / span 2;grid-row:2}
.pg-h5{grid-column:9 / span 2;grid-row:2}
.pg-h6{grid-column:11 / span 2;grid-row:2}
.pg-h7{grid-column:1 / span 3;grid-row:3}
.pg-h8{grid-column:4 / span 3;grid-row:3}
.pg-h9{grid-column:7 / span 3;grid-row:3}
.pg-h10{grid-column:10 / span 3;grid-row:3}
.pg-rest{grid-column:span 2}

/* big-tile typography */
.pg-h0 .pg-tile-info{padding:18px}
.pg-h0 .pg-tile-name{font-family:var(--fh);font-weight:400;font-size:clamp(24px,2.4vw,32px);letter-spacing:1.5px;line-height:1.02}
.pg-h0 .pg-tile-meta{font-size:12.5px}
.pg-h3 .pg-tile-name{font-size:17px}
.pg-rest .pg-tile-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;-webkit-line-clamp:unset}

@media(max-width:1024px){
  .pg-grid{grid-template-columns:repeat(6,1fr);gap:clamp(10px,1.5vw,14px)}
  .pg-grid{grid-auto-rows:118px;grid-auto-rows:24cqw}
  .pg-h0{grid-column:1 / span 4;grid-row:1 / span 2}
  .pg-h1{grid-column:5 / span 2;grid-row:1}
  .pg-h2{grid-column:5 / span 2;grid-row:2}
  .pg-h3{grid-column:1 / span 6;grid-row:3}
  .pg-h4{grid-column:1 / span 3;grid-row:4}
  .pg-h5{grid-column:4 / span 3;grid-row:4}
  .pg-h6{grid-column:1 / span 3;grid-row:5}
  .pg-h7{grid-column:4 / span 3;grid-row:5}
  .pg-h8{grid-column:1 / span 3;grid-row:6}
  .pg-h9{grid-column:4 / span 3;grid-row:6}
  .pg-h10{grid-column:1 / span 6;grid-row:7}
  .pg-rest{grid-column:span 2}
}
@media(max-width:640px){
  .pg-grid{grid-template-columns:repeat(4,1fr);gap:clamp(6px,2.2vw,10px)}
  .pg-grid{grid-auto-rows:88px;grid-auto-rows:25cqw}
  .pg-h0{grid-column:1 / span 2;grid-row:1 / span 2}
  .pg-h1{grid-column:3 / span 2;grid-row:1}
  .pg-h2{grid-column:3;grid-row:2}
  .pg-h3{grid-column:4;grid-row:2}
  .pg-h4{grid-column:1 / span 2;grid-row:3}
  .pg-h5{grid-column:3;grid-row:3}
  .pg-h6{grid-column:4;grid-row:3}
  .pg-h7{grid-column:1;grid-row:4}
  .pg-h8{grid-column:2;grid-row:4}
  .pg-h9{grid-column:3 / span 2;grid-row:4}
  .pg-h10{grid-column:1 / span 4;grid-row:5}
  .pg-rest{grid-column:span 1}
  .pg-rest:nth-child(3n+12){grid-column:span 2}
  .pg-tile{border-radius:12px}
  .pg-tile-info{padding:10px}
  .pg-h0 .pg-tile-info{padding:14px}
  .pg-h0 .pg-tile-name{font-size:clamp(18px,5.5vw,24px)}
}

.arc-empty{text-align:center;padding:90px 20px}
.arc-empty-ico{font-size:46px;margin-bottom:14px;opacity:.9}
.arc-empty-txt{font-family:var(--fb);font-size:15px;color:var(--muted);line-height:1.7}
.arc-loading{display:flex;align-items:center;justify-content:center;gap:12px;padding:140px 20px 80px;font-family:var(--fb);font-size:14px;color:var(--muted)}
.arc-spin{width:20px;height:20px;border-radius:50%;border:2.5px solid rgba(146,16,246,0.2);border-top-color:var(--purple);animation:arcSpin .7s linear infinite}
@keyframes arcSpin{to{transform:rotate(360deg)}}

@media(max-width:768px){
  .arc-content{padding-top:84px}
  .arc-featured{padding:24px 0 16px}
  .arc-featured-card{width:220px}
  .arc-featured-scroll{margin:0;padding-left:0;padding-right:0;gap:12px}
  .arc-grid-section{padding:0 0 5px}
  .arc-grid-head{flex-direction:column;align-items:flex-start}
}

@media(max-width:400px){
  .arc-content{padding-top:76px}
  .arc-featured-card{width:180px}
  .arc-section-title{font-size:20px}
}
`,A=["pg-h0","pg-h1","pg-h2","pg-h3","pg-h4","pg-h5","pg-h6","pg-h7","pg-h8","pg-h9","pg-h10"];function M({game:a,sizeClass:l,delay:v,onPlay:i,eager:h}){const u=a.thumbnail_url||a.game_logo_url||a.bg_image_url,m=()=>i(a);return e.jsxs("div",{className:`pg-tile ${l}`,style:{animationDelay:`${v}ms`},role:"button",tabIndex:0,"aria-label":`Play ${a.name}`,onClick:m,onKeyDown:b=>{(b.key==="Enter"||b.key===" ")&&(b.preventDefault(),m())},children:[u?e.jsx("img",{className:"pg-tile-bg",src:u,alt:a.name,decoding:"async",loading:h?"eager":"lazy",...h?{fetchPriority:"high"}:{}}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"pg-tile-fallback",children:"🎮"}),e.jsx("div",{className:"pg-tile-shade"}),e.jsx("span",{className:"pg-tile-cat",children:a.category||"Game"}),e.jsxs("div",{className:"pg-tile-info",children:[e.jsx("div",{className:"pg-tile-name",children:a.name}),e.jsxs("div",{className:"pg-tile-meta",children:[e.jsx("svg",{width:"9",height:"9",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),e.jsxs("span",{children:[(a.play_count||0).toLocaleString()," plays"]})]})]})]}),u&&(a.play_count>0||a.high_score>0)&&e.jsx("div",{className:"pg-tile-info",children:e.jsxs("div",{className:"pg-tile-meta",children:[e.jsx("svg",{width:"9",height:"9",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),e.jsx("span",{children:(a.play_count||0).toLocaleString()}),a.high_score>0&&e.jsxs(e.Fragment,{children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"#f5c842",children:e.jsx("path",{d:"M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9-5.4-4.7 7.1-.6z"})}),e.jsx("span",{style:{color:"#f5c842"},children:a.high_score.toLocaleString()})]})]})}),e.jsx("div",{className:"pg-tile-play",children:e.jsx("div",{className:"pg-tile-play-btn",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"#9210f6",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})})})})]})}let x=null;function H(){var S;const a=L(),[l,v]=r.useState(()=>(x==null?void 0:x.featured)||[]),[i,h]=r.useState(()=>(x==null?void 0:x.promogames)||[]),[u,m]=r.useState(!x),[b,j]=r.useState(!1),[g,p]=r.useState(null),[k,C]=r.useState(((S=a.state)==null?void 0:S.welcomeBonus)===!0),o=r.useRef(null);r.useEffect(()=>{var t;(t=a.state)!=null&&t.welcomeBonus&&window.history.replaceState({},document.title)},[]);const c=r.useCallback(async t=>{j(!1);try{const d=await(await fetch("/api/play/play-page-games",{signal:t})).json();if(!d.success)throw new Error("bad payload");x={featured:d.featured||[],promogames:d.promogames||[]},v(x.featured),h(x.promogames)}catch(s){(s==null?void 0:s.name)!=="AbortError"&&!x&&j(!0)}finally{m(!1)}},[]);r.useEffect(()=>{const t=new AbortController;return c(t.signal),()=>t.abort()},[c]),r.useEffect(()=>{let t=!1;const s=()=>{t=!1;const N=window.scrollY/(document.body.scrollHeight-window.innerHeight)*100;document.documentElement.style.setProperty("--scroll-pct",`${N}%`)},d=()=>{t||(t=!0,requestAnimationFrame(s))};return window.addEventListener("scroll",d,{passive:!0}),()=>window.removeEventListener("scroll",d)},[]),r.useEffect(()=>{const t=s=>{var d;((d=s.data)==null?void 0:d.type)==="pg:auth"&&(p(null),c(),s.data.registered&&C(!0))};return window.addEventListener("message",t),()=>window.removeEventListener("message",t)},[c]);const n=r.useCallback(t=>p(t),[]),w=r.useCallback(t=>p(t),[]),f=r.useCallback(()=>p(null),[]),y=[...l,...i];return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:R}),e.jsx(F,{}),e.jsx(P,{}),e.jsx("div",{className:"arc-scroll-bar"}),e.jsx(T,{}),e.jsx(B,{ready:!u&&i.length>0&&!g,sampleGame:i[0]||l[0],onPlay:n}),e.jsx("div",{className:"arc-content",children:u?e.jsxs("div",{className:"arc-loading",children:[e.jsx("div",{className:"arc-spin"})," Loading games…"]}):e.jsxs(e.Fragment,{children:[l.length>0&&e.jsx("section",{className:"arc-featured",children:e.jsxs("div",{className:"arc-container",children:[e.jsxs("div",{className:"arc-section-head",children:[e.jsx("h2",{className:"arc-section-title",children:"Featured Games"}),e.jsxs("a",{href:"#all-games",className:"arc-view-all",children:["View All ",e.jsx(D,{})]})]}),e.jsx("div",{className:"arc-featured-scroll",ref:o,children:l.map((t,s)=>{const d=t.thumbnail_url||t.game_logo_url||t.bg_image_url;return e.jsxs("div",{className:"arc-featured-card",role:"button",tabIndex:0,"aria-label":`Play ${t.name}`,onClick:()=>n(t),onKeyDown:N=>{(N.key==="Enter"||N.key===" ")&&(N.preventDefault(),n(t))},children:[e.jsx("div",{className:"arc-featured-thumb",children:d?e.jsx("img",{src:d,alt:t.name,loading:"lazy"}):e.jsx("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,background:"linear-gradient(150deg,rgba(146,16,246,0.35),rgba(97,4,151,0.18))"},children:"🎮"})}),e.jsxs("div",{className:"arc-featured-info",children:[e.jsx("div",{className:"arc-featured-name",children:t.name}),e.jsxs("div",{className:"arc-featured-meta",children:[e.jsx("span",{className:"arc-featured-cat",children:t.category||"Quiz"}),e.jsxs("span",{children:[(t.play_count||0).toLocaleString()," plays"]})]})]})]},t.id)})})]})}),e.jsx("section",{className:"arc-grid-section",id:"all-games",children:e.jsxs("div",{className:"arc-container",children:[e.jsx("div",{className:"arc-grid-head",children:e.jsxs("div",{className:"arc-grid-label",children:["All Games",e.jsxs("span",{className:"arc-grid-count",children:[y.length," games"]})]})}),y.length===0?e.jsxs("div",{className:"arc-empty",children:[e.jsx("div",{className:"arc-empty-ico",children:"🎮"}),e.jsxs("div",{className:"arc-empty-txt",children:[b?"Couldn't load games.":"No games are live right now — check back soon!",b&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),e.jsx("button",{onClick:()=>c(),style:{marginTop:14,padding:"10px 22px",border:"none",borderRadius:10,background:"linear-gradient(135deg, #9210f6, #610497)",color:"#fff",fontFamily:"'DM Sans', sans-serif",fontSize:13.5,fontWeight:700,cursor:"pointer"},children:"Retry"})]})]})]}):e.jsxs("div",{className:"pg-grid",children:[y.slice(0,11).map((t,s)=>e.jsx(M,{game:t,sizeClass:A[s],delay:Math.min(s*45,360),onPlay:n,eager:s<4},t.id)),y.slice(11).map((t,s)=>e.jsx(M,{game:t,sizeClass:"pg-rest",delay:Math.min(s*25,280),onPlay:n},t.id))]})]})})]})}),g&&e.jsx(I,{game:g,allGames:y,onClose:f,onSwitch:w,isLoggedIn:!!(localStorage.getItem("playerToken")||sessionStorage.getItem("playerToken"))}),k&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9e3,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(5,2,12,0.85)",backdropFilter:"blur(12px)",animation:"gmFadeIn 0.2s ease both"},children:e.jsxs("div",{style:{background:"linear-gradient(160deg, #0d0820, #12082a)",border:"1px solid rgba(146,16,246,0.3)",borderRadius:24,padding:"48px 40px 36px",maxWidth:420,width:"90%",textAlign:"center",boxShadow:"0 0 60px rgba(146,16,246,0.15), 0 24px 80px rgba(0,0,0,0.5)",animation:"gmSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) both"},children:[e.jsx("div",{style:{fontSize:56,marginBottom:12},children:"🎉"}),e.jsx("h2",{style:{fontFamily:"'Bebas Neue', sans-serif",fontSize:32,color:"#fff",letterSpacing:2,marginBottom:8},children:"Welcome Aboard!"}),e.jsxs("p",{style:{fontFamily:"'DM Sans', sans-serif",fontSize:15,color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:24},children:["You've earned a bonus of"," ",e.jsx("strong",{style:{color:"#f5c842"},children:"100 Promo Coins!"})," ","Play more and earn more!"]}),e.jsx("button",{onClick:()=>C(!1),style:{width:"100%",padding:"14px 24px",fontFamily:"'DM Sans', sans-serif",fontSize:15,fontWeight:700,color:"#fff",border:"none",borderRadius:14,cursor:"pointer",background:"linear-gradient(135deg, #9210f6, #610497)",boxShadow:"0 4px 20px rgba(146,16,246,0.35)",transition:"all 0.2s ease"},onMouseEnter:t=>{t.currentTarget.style.boxShadow="0 6px 28px rgba(146,16,246,0.5)",t.currentTarget.style.transform="translateY(-1px)"},onMouseLeave:t=>{t.currentTarget.style.boxShadow="0 4px 20px rgba(146,16,246,0.35)",t.currentTarget.style.transform="none"},children:"Let's Play!"})]})})]})}export{H as default};
