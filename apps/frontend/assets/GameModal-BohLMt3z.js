import{r as n,j as r}from"./react-vendor-gyK15t0p.js";import{S as j}from"./ShareMenu-BdQvel9y.js";const E=`
  .gm-overlay{position:fixed;inset:0;z-index:8000;background:rgba(5,2,12,0.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:0;animation:gmFadeIn .2s ease both}
  @keyframes gmFadeIn{from{opacity:0}to{opacity:1}}
  .gm-modal{position:relative;width:100%;height:100dvh;display:flex;flex-direction:column;background:#0a0514;animation:gmSlideUp .28s cubic-bezier(.22,1,.36,1) both;overflow:hidden}
  @media(min-width:640px){
    .gm-modal{width:calc(100% - 48px);height:94dvh;max-width:1000px;border-radius:20px;border:1px solid rgba(146,16,246,0.25);box-shadow:0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(146,16,246,0.08)}
  }
  @keyframes gmSlideUp{from{opacity:0;transform:translateY(30px) scale(0.96)}to{opacity:1;transform:none}}
  .gm-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(10,5,20,0.98);border-bottom:1px solid rgba(146,16,246,0.15);flex-shrink:0;min-height:52px}
  .gm-bar-cat{font-family:'Karla',sans-serif;font-size:9.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(146,16,246,0.2);border:1px solid rgba(146,16,246,0.35);color:#c084fc;flex-shrink:0}
  .gm-bar-name{font-family:'Karla',sans-serif;font-size:15px;color:#fff;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gm-bar-plays{font-family:'Karla',sans-serif;font-size:11px;color:rgba(255,255,255,0.58);display:flex;align-items:center;gap:4px;flex-shrink:0}
  .gm-close{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:15px;transition:background .2s,transform .2s,color .2s}
  .gm-close:hover{background:rgba(255,255,255,0.16);color:#fff;transform:rotate(90deg)}
  .gm-iframe-wrap{flex:1;position:relative;overflow:hidden;background:#0a0514;min-height:0}
  .gm-iframe{width:100%;height:100%;border:none;display:block}
  .gm-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0a0514;z-index:5;transition:opacity .35s,visibility .35s}
  .gm-loader.gone{opacity:0;visibility:hidden}
  .gm-loader-ring{width:40px;height:40px;border-radius:50%;border:3px solid rgba(146,16,246,0.18);border-top-color:#9210f6;animation:gmSpin .75s linear infinite}
  @keyframes gmSpin{to{transform:rotate(360deg)}}
  .gm-loader-txt{font-family:'Karla',sans-serif;font-size:13px;color:rgba(255,255,255,0.58)}
  body.gm-pointer-in-iframe .mascot-cursor{opacity:0!important}
`,S=`
  <svg viewBox="0 0 90 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gmMcGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e7b8ff"/>
        <stop offset="55%" stop-color="#9210f6"/>
        <stop offset="100%" stop-color="#5c0499"/>
      </linearGradient>
    </defs>
    <path d="M10 4 C6 2 2 6 4 11 L24 84 C26 91 35 92 38 85 L46 64 L66 80 C73 85 82 78 78 70 L64 50 C75 48 79 38 71 32 L16 6 C14 4 12 3 10 4 Z"
      fill="url(#gmMcGrad)" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round"/>
    <path d="M10 4 C6 2 2 6 4 11 L24 84 C26 91 35 92 38 85 L46 64 L66 80 C73 85 82 78 78 70 L64 50 C75 48 79 38 71 32 L16 6 C14 4 12 3 10 4 Z"
      fill="none" stroke="#f5c842" strokeWidth="1" opacity=".6"/>
    <path d="M16 20 Q24 12 33 17" fill="none" stroke="#5c0499" strokeWidth="3" strokeLinecap="round"/>
    <g>
      <circle cx="27" cy="32" r="8" fill="#fff" stroke="#5c0499" strokeWidth="2"/>
      <circle class="pupil" cx="27" cy="32" r="3.6" fill="#1a0a26"/>
    </g>
    <g>
      <circle cx="44" cy="30" r="9.5" fill="#fff" stroke="#5c0499" strokeWidth="2"/>
      <circle class="pupil" cx="44" cy="30" r="4.1" fill="#1a0a26"/>
    </g>
    <path class="mc-mouth" d="M22 50 Q32 56 42 48" fill="none" stroke="#5c0499" strokeWidth="2.4" strokeLinecap="round"/>
  </svg>
`;function C(e){if(!e||e.getElementById("gm-mascot-cursor"))return;const x=e.createElement("style");x.textContent=`
    #gm-mascot-cursor{position:fixed;top:0;left:0;width:34px;height:38px;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .2s ease;will-change:transform}
    @media (max-width:640px){#gm-mascot-cursor{display:none!important}}
    @media (pointer:coarse){#gm-mascot-cursor{display:none!important}}
    #gm-mascot-cursor svg{width:100%;height:100%;display:block;pointer-events:none;filter:drop-shadow(0 4px 10px rgba(92,4,153,0.35))}
    #gm-mascot-cursor .pupil{transform-origin:center}
    #gm-mascot-cursor.visible{opacity:1}
    body.gm-cursor-on, body.gm-cursor-on *{cursor:none!important}
  `,e.head.appendChild(x);const s=e.createElement("div");s.id="gm-mascot-cursor",s.innerHTML=S,e.body.appendChild(s);let u=0,d=0,a=0,m=0,g=0,p=0,f=performance.now(),l=null;const i=window.matchMedia("(prefers-reduced-motion: reduce)").matches;function h(){if(a+=(g-a)*.15,m+=(p-m)*.15,s.style.transform=`translate(${u-6}px,${d-4}px) rotate(8deg)`,s.querySelectorAll(".pupil").forEach(y=>{y.style.transform=`translate(${a}px,${m}px)`}),g*=.985,p*=.985,performance.now()-f>400){l=null;return}l=requestAnimationFrame(h)}const t=y=>{const L=u,k=d;u=y.clientX,d=y.clientY,f=performance.now(),l||(l=requestAnimationFrame(h)),s.classList.add("visible"),e.body.classList.add("gm-cursor-on");const b=u-L,v=d-k;if(!i&&Math.hypot(b,v)>1.5){const w=Math.atan2(v,b);g=Math.cos(w)*3.4,p=Math.sin(w)*3.4}},o=()=>{s.classList.remove("visible"),e.body.classList.remove("gm-cursor-on")},c=()=>{s.classList.add("visible"),e.body.classList.add("gm-cursor-on")};e.addEventListener("mousemove",t,{passive:!0}),e.addEventListener("mouseleave",o),e.addEventListener("mouseenter",c),s._gmCleanup=()=>{l&&cancelAnimationFrame(l),e.removeEventListener("mousemove",t),e.removeEventListener("mouseleave",o),e.removeEventListener("mouseenter",c),s.remove(),x.remove(),e.body.classList.remove("gm-cursor-on")}}function N({game:e,allGames:x,onClose:s,onSwitch:u,isLoggedIn:d}){const[a,m]=n.useState(!1),[g,p]=n.useState(e.play_count||0),f=n.useRef(null),l=`/play/${e.slug}/${e.client_slug}?source=${d?"player":"direct"}`;n.useEffect(()=>{m(!1),p(e.play_count||0)},[e.id]),n.useEffect(()=>{const t=f.current;if(!t||!a)return;const o=t.contentDocument;o&&C(o)},[a,e.id]),n.useEffect(()=>{const t=f.current;if(!t)return;const o=()=>document.body.classList.add("gm-pointer-in-iframe"),c=()=>document.body.classList.remove("gm-pointer-in-iframe");return t.addEventListener("mouseenter",o),t.addEventListener("mouseleave",c),()=>{t.removeEventListener("mouseenter",o),t.removeEventListener("mouseleave",c),document.body.classList.remove("gm-pointer-in-iframe")}},[e.id,a]),n.useEffect(()=>{const t=o=>{o.key==="Escape"&&s()};return document.addEventListener("keydown",t),document.body.style.overflow="hidden",()=>{document.removeEventListener("keydown",t),document.body.style.overflow=""}},[s]),n.useEffect(()=>{const t=setInterval(async()=>{if(!document.hidden)try{const c=await(await fetch(`/api/play/game/${e.id}/play-count`)).json();c.play_count!==void 0&&p(c.play_count)}catch{}},1e4);return()=>clearInterval(t)},[e.id]);const[i,h]=n.useState(null);return n.useEffect(()=>{let t=!0;return h(null),fetch(`/api/play/game/${e.id}/score-info`).then(o=>o.json()).then(o=>{t&&o.success&&h(o)}).catch(()=>{}),()=>{t=!1}},[e.id]),r.jsxs(r.Fragment,{children:[r.jsx("style",{children:E}),r.jsx("div",{className:"gm-overlay",onClick:t=>{t.target===t.currentTarget&&s()},children:r.jsxs("div",{className:"gm-modal",children:[r.jsxs("div",{className:"gm-bar",children:[r.jsx("span",{className:"gm-bar-cat",children:e.category||"Quiz"}),r.jsx("span",{className:"gm-bar-name",children:e.name}),r.jsxs("span",{className:"gm-bar-plays",children:[r.jsx("svg",{width:"9",height:"9",viewBox:"0 0 24 24",fill:"currentColor",children:r.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),g.toLocaleString()," plays"]}),(i==null?void 0:i.high_score)>0&&r.jsxs("span",{className:"gm-bar-plays",style:{color:"#f5c842"},title:`High score: ${i.high_score.toLocaleString()}`,children:[r.jsx("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"#f5c842",children:r.jsx("path",{d:"M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9-5.4-4.7 7.1-.6z"})}),i.high_score.toLocaleString(),i.player_best!=null&&i.player_best>=i.high_score?" · You!":""]}),r.jsx(j,{game:e,label:`Share ${e.name}`}),r.jsx("button",{className:"gm-close",onClick:s,title:"Close (Esc)",children:"✕"})]}),r.jsxs("div",{className:"gm-iframe-wrap",children:[r.jsxs("div",{className:`gm-loader${a?" gone":""}`,children:[r.jsx("div",{className:"gm-loader-ring"}),r.jsxs("div",{className:"gm-loader-txt",children:["Loading ",e.name,"…"]})]}),r.jsx("iframe",{ref:f,src:l,className:"gm-iframe",title:e.name,allow:"fullscreen",onLoad:()=>m(!0)},e.id)]})]})})]})}export{N as G};
