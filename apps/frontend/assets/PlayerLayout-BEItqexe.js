import{j as e,u as N,r as s,O as I}from"./react-vendor-gyK15t0p.js";import{a as S,P as T}from"./index-B2qSlCu9.js";import{G as R}from"./GameModal-BohLMt3z.js";const _=`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  :root {
    --glass-bg: rgba(255, 255, 255, 0.06);
    --glass-border: rgba(255, 255, 255, 0.1);
    --neon-purple: #a855f7;
    --neon-glow: 0 8px 32px rgba(139, 92, 246, 0.25);
    --deep-bg: #0f0720;
  }

  body {
    background: var(--deep-bg);
    font-family: 'Outfit', sans-serif;
    color: #fff;
    margin: 0;
    overflow-x: hidden;
  }

  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    box-shadow: var(--neon-glow);
  }

  .neon-text {
    color: var(--neon-purple);
    text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
  }

  .btn-premium {
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: #fff;
    border: none;
    border-radius: 16px;
    padding: 12px 24px;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-premium:active {
    transform: scale(0.95);
  }

  .capsule-nav-container {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: 400px;
    height: 72px;
    background: rgba(15, 7, 32, 0.3);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 10px;
    z-index: 2000;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.15);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    font-size: 10px;
    font-weight: 700;
    flex: 1;
    cursor: pointer;
    position: relative;
  }

  .nav-item.active {
    color: #fff;
  }

  .nav-item.active .nav-icon {
    color: var(--neon-purple);
    transform: translateY(-4px);
    filter: drop-shadow(0 0 8px var(--neon-purple));
  }

  .nav-item.active span {
    color: #fff;
    text-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
  }

  .nav-item:not(.active):hover .nav-icon {
    color: rgba(255, 255, 255, 0.8);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 0 20px 24px;
  }

  @media (min-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }

  @media (min-width: 1024px) {
    .btn-desktop-auto {
      width: auto !important;
      min-width: 200px;
      margin: 24px auto 0 !important;
      padding: 12px 32px !important;
    }
  }

  .challenges-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  @media (min-width: 1024px) {
    .challenges-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 0 20px 24px;
    }
    .challenges-grid > div {
      margin: 0 !important;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
  .animate-rotate { animation: rotate-slow 20s linear infinite; }

  .game-card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 40px;
  }

  @media (min-width: 768px) {
    .game-card-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
  }

  .premium-game-card {
    width: 100%;
    aspect-ratio: 280 / 420;
    height: auto;
    background: rgba(15, 7, 32, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .premium-game-card {
      width: 280px;
      height: 420px;
      aspect-ratio: auto;
      border-radius: 24px;
    }
  }

  .premium-game-card:hover {
    transform: translateY(-8px);
    border-color: #a855f7;
    box-shadow: 0 15px 45px rgba(139, 92, 246, 0.3), 0 0 20px rgba(168, 85, 247, 0.2);
  }

  .premium-game-card .image-container {
    height: 65%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .premium-game-card .image-container.logo-container {
    width: auto;
    margin: 20px 20px 0;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.92);
    border-radius: 18px;
    box-sizing: border-box;
  }

  .premium-game-card .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .premium-game-card .game-image.logo-image {
    object-fit: contain;
  }

  .premium-game-card:hover .game-image {
    transform: scale(1.08);
  }

  .premium-game-card .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 20%, rgba(15, 7, 32, 0.95) 100%);
  }

  .premium-game-card .reward-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(34, 197, 94, 0.9);
    color: #fff;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 800;
    backdrop-filter: blur(4px);
    z-index: 2;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  @media (min-width: 768px) {
    .premium-game-card .reward-badge {
      top: 16px;
      right: 16px;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  .premium-game-card .category-pill {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(168, 85, 247, 0.8);
    color: #fff;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 2;
    backdrop-filter: blur(4px);
  }

  @media (min-width: 768px) {
    .premium-game-card .category-pill {
      top: 16px;
      left: 16px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 10px;
      letter-spacing: 1px;
    }
  }

  .premium-game-card .content {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    z-index: 2;
  }

  @media (min-width: 768px) {
    .premium-game-card .content {
      padding: 20px;
    }
  }

  .premium-game-card .game-title {
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 4px;
    line-height: 1.2;
    background: linear-gradient(to right, #fff, rgba(255,255,255,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (min-width: 768px) {
    .premium-game-card .game-title {
      font-size: 20px;
      margin-bottom: 8px;
    }
  }

  .premium-game-card .metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 9px;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
  }

  @media (min-width: 768px) {
    .premium-game-card .metadata {
      gap: 12px;
      font-size: 11px;
    }
  }

  .premium-game-card .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .premium-game-card .card-index-number {
    position: absolute;
    bottom: -15px;
    right: -5px;
    font-size: 100px;
    font-weight: 900;
    line-height: 1;
    color: rgba(255, 255, 255, 0.05);
    z-index: 1;
    pointer-events: none;
    font-family: 'Outfit', sans-serif;
    transition: all 0.4s ease;
  }

  .premium-game-card:hover .card-index-number {
    color: rgba(168, 85, 247, 0.15);
    transform: scale(1.1) translateX(-10px);
  }

  .premium-game-card .share-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(6px);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity .2s ease;
  }
  .premium-game-card:hover .share-btn {
    opacity: 1;
  }
  .premium-game-card .share-btn:hover {
    background: rgba(168, 85, 247, 0.45);
  }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;function D({message:t,onRetry:a}){return e.jsxs("div",{style:{minHeight:"100vh",background:"#0f0720",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:24,padding:40,textAlign:"center"},children:[e.jsx("div",{style:{fontSize:64},children:"⚠️"}),e.jsxs("div",{style:{maxWidth:300},children:[e.jsx("div",{style:{fontSize:20,fontWeight:800,marginBottom:8},children:"Data Loading Failed"}),e.jsx("div",{style:{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.5},children:t})]}),e.jsx("button",{className:"btn-premium",onClick:a,style:{minWidth:160},children:"🔄 Try Again"})]})}function M({balance:t,city:a,onPlayMore:r}){const o=Math.min(t/2e3*100,100),i=60,c=2*Math.PI*i,p=o/100*c;return e.jsxs("div",{className:"glass-card",style:{margin:"0 20px 24px",padding:"28px 24px",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",top:-30,right:-20,fontSize:100,opacity:.05},className:"animate-float",children:"💎"}),e.jsx("div",{style:{position:"absolute",bottom:-40,left:-20,width:120,height:120,background:"rgba(168, 85, 247, 0.1)",filter:"blur(40px)",borderRadius:"50%"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:24},children:[e.jsxs("div",{style:{position:"relative",flexShrink:0},children:[e.jsxs("svg",{width:130,height:130,style:{transform:"rotate(-90deg)"},children:[e.jsx("circle",{cx:65,cy:65,r:i,fill:"none",stroke:"rgba(255,255,255,0.03)",strokeWidth:8}),e.jsx("circle",{cx:65,cy:65,r:i,fill:"none",stroke:"url(#wallet-grad)",strokeWidth:8,strokeLinecap:"round",strokeDasharray:`${p} ${c-p}`,style:{transition:"stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)"}}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"wallet-grad",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[e.jsx("stop",{offset:"0%",stopColor:"#7c3aed"}),e.jsx("stop",{offset:"100%",stopColor:"#a855f7"})]})})]}),e.jsxs("div",{style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:24,fontWeight:800},children:t}),e.jsx("div",{style:{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700},children:"PC"})]})]}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontSize:12,fontWeight:700,color:"var(--neon-purple)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4},children:"Balance"}),e.jsx("div",{style:{fontSize:20,fontWeight:800,marginBottom:2},children:"Promo Coins"}),e.jsxs("div",{style:{fontSize:12,color:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",gap:4},children:[e.jsx("span",{children:"📍"})," ",a||"Bangalore"]}),e.jsxs("div",{style:{marginTop:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:6,fontWeight:600},children:[e.jsx("span",{style:{color:"rgba(255,255,255,0.6)"},children:"Level 5 Explorer"}),e.jsxs("span",{className:"neon-text",children:[Math.round(o),"% to LVL 6"]})]}),e.jsx("div",{style:{height:6,background:"rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"},children:e.jsx("div",{style:{width:`${o}%`,height:"100%",background:"linear-gradient(90deg, #7c3aed, #a855f7)",borderRadius:10,boxShadow:"0 0 12px rgba(168, 85, 247, 0.4)"}})})]})]})]}),e.jsx("button",{className:"btn-premium btn-desktop-auto",style:{width:"100%",marginTop:24,fontSize:14},onClick:r,children:"🕹️ Play & Earn More"})]})}function G({icon:t,label:a,value:r}){return e.jsxs("div",{className:"glass-card",style:{padding:"16px 14px",display:"flex",flexDirection:"column",gap:6,position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{fontSize:20,marginBottom:2},children:t}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",fontWeight:800,letterSpacing:.5},children:a}),e.jsx("div",{style:{fontSize:16,fontWeight:800,marginTop:1},children:r})]}),e.jsx("div",{style:{position:"absolute",bottom:-10,right:-10,fontSize:32,opacity:.03},children:t})]})}function O({days:t}){return e.jsxs("div",{className:"glass-card",style:{margin:"0 20px 16px",padding:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.8},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:16},children:[e.jsx("div",{style:{fontSize:32,filter:"drop-shadow(0 0 10px rgba(245,158,11,0.5))",opacity:.5},className:"animate-float",children:"🔥"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:16,fontWeight:800},children:"Daily Streak"}),e.jsx("div",{style:{fontSize:12,color:"var(--neon-purple)",fontWeight:700,textTransform:"uppercase",letterSpacing:1},children:"Coming soon..."})]})]}),e.jsxs("div",{style:{textAlign:"right",opacity:.3},children:[e.jsx("div",{style:{fontSize:18,fontWeight:800,color:"#f59e0b"},children:"0 Days"}),e.jsx("div",{style:{display:"flex",gap:5,marginTop:6},children:[1,2,3,4,5,6,7].map(a=>e.jsx("div",{style:{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}},a))})]})]})}function H({progress:t,total:a,reward:r}){return e.jsxs("div",{className:"glass-card",style:{margin:"0 20px 24px",padding:"20px",opacity:.8},children:[e.jsx("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:14},children:e.jsxs("div",{style:{display:"flex",gap:12},children:[e.jsx("div",{style:{fontSize:24,filter:"drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))",opacity:.5},children:"🎯"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:15,fontWeight:800},children:"Weekly Challenge"}),e.jsx("div",{style:{fontSize:12,color:"var(--neon-purple)",fontWeight:700,textTransform:"uppercase",letterSpacing:1},children:"Coming soon..."})]})]})}),e.jsx("div",{style:{height:8,background:"rgba(255,255,255,0.05)",borderRadius:10,overflow:"hidden",position:"relative",opacity:.3},children:e.jsx("div",{style:{width:"0%",height:"100%",background:"linear-gradient(90deg, #7c3aed, #a855f7)",borderRadius:10}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:10,color:"rgba(255,255,255,0.3)",fontWeight:600},children:[e.jsx("span",{children:"New challenges arriving weekly"}),e.jsx("span",{children:"0/5 Done"})]})]})}function U({txs:t,onBrowseGames:a}){return e.jsxs("div",{className:"glass-card",style:{margin:"0 20px 24px",padding:"24px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20},children:[e.jsx("h3",{style:{margin:0,fontSize:17,fontWeight:800},children:"Recent Activity"}),e.jsx("span",{style:{fontSize:11,fontWeight:700,color:"var(--neon-purple)",textTransform:"uppercase"},children:"History"})]}),t.length===0?e.jsxs("div",{style:{textAlign:"center",padding:"10px 0"},children:[e.jsx("div",{style:{fontSize:56,marginBottom:12,filter:"grayscale(0.5) opacity(0.5)"},children:"🎮"}),e.jsx("div",{style:{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:20},children:"Ready for your first win?"}),e.jsx("button",{className:"btn-premium",style:{background:"rgba(255,255,255,0.03)",border:"1.5px solid var(--neon-purple)",color:"#fff",width:"100%"},onClick:a,children:"Browse Games"})]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:18},children:t.slice(0,3).map(r=>e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e.jsx("div",{style:{width:42,height:42,borderRadius:14,background:r.type==="earn"?"rgba(34, 197, 94, 0.1)":"rgba(239, 68, 68, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18},children:r.type==="earn"?"💰":"🎁"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:14,fontWeight:700,letterSpacing:-.2},children:r.note||(r.game_name?`Win: ${r.game_name}`:"Reward")}),e.jsx("div",{style:{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:1},children:new Date(r.created_at).toLocaleDateString(void 0,{month:"short",day:"numeric"})})]})]}),e.jsxs("div",{style:{fontWeight:800,fontSize:15,color:r.type==="earn"?"#22c55e":"#ef4444"},children:[r.type==="earn"?"+":"-",r.points]})]},r.id))})]})}function Y({title:t,icon:a,unlocked:r}){return e.jsxs("div",{className:"glass-card",style:{minWidth:140,padding:"24px 16px",textAlign:"center",opacity:r?1:.4,filter:r?"none":"grayscale(0.8) blur(0.5px)",border:r?"1px solid rgba(168, 85, 247, 0.4)":"1px solid var(--glass-border)",boxShadow:r?"0 0 24px rgba(168, 85, 247, 0.2)":"none",transition:"all 0.3s ease"},children:[e.jsx("div",{style:{fontSize:40,marginBottom:14},className:r?"animate-float":"",children:a}),e.jsx("div",{style:{fontSize:12,fontWeight:800,lineHeight:1.3,marginBottom:4},children:t}),e.jsx("div",{style:{fontSize:9,color:r?"var(--neon-purple)":"rgba(255,255,255,0.3)",fontWeight:700,textTransform:"uppercase"},children:r?"Collected":"Locked"})]})}function F({game:t,onPlay:a,pcAmount:r,index:b,username:o}){var x;const i=!!t.game_logo_url,c=t.game_logo_url||t.bg_image_url,p=y=>{y.stopPropagation();const v=window.location.origin,m=t.slug||"",f=t.client_slug||"",g=o?`?utm_source=@${o}`:"",j=`${v}/play/${m}/${f}${g}`;navigator.share?navigator.share({title:t.name,url:j}):navigator.clipboard.writeText(j)};return e.jsxs("div",{className:"premium-game-card",onClick:()=>a(t),children:[e.jsx("div",{className:"card-index-number",children:b+1}),e.jsxs("div",{className:"reward-badge",children:["+",r," PC"]}),e.jsx("div",{className:"category-pill",children:t.category||"Arcade"}),o&&e.jsx("button",{className:"share-btn",onClick:p,title:"Share game",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"18",cy:"5",r:"3"}),e.jsx("circle",{cx:"6",cy:"12",r:"3"}),e.jsx("circle",{cx:"18",cy:"19",r:"3"}),e.jsx("line",{x1:"8.59",y1:"13.51",x2:"15.42",y2:"17.49"}),e.jsx("line",{x1:"15.41",y1:"6.51",x2:"8.59",y2:"10.49"})]})}),e.jsx("div",{className:`image-container${i?" logo-container":""}`,children:c?e.jsx("img",{src:c,alt:t.name,className:`game-image${i?" logo-image":""}`}):e.jsx("div",{className:"card-overlay"})}),e.jsxs("div",{className:"content",children:[e.jsx("div",{className:"game-title",children:t.name}),e.jsxs("div",{className:"metadata",children:[e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{children:"💎"})," +",r," PC"]}),e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{children:"🎮"})," ",((x=t.category)==null?void 0:x.toUpperCase())||"ARCADE"]})]})]})]})}const z=s.createContext(null);function P(){return s.useContext(z)}function L(){return localStorage.getItem("playerToken")||sessionStorage.getItem("playerToken")}function B(){const t=N(),[a,r]=s.useState(null),[b,o]=s.useState([]),[i,c]=s.useState({promogames:[],branded:[]}),[p,x]=s.useState(!0),[y,v]=s.useState(null),[m,f]=s.useState(null);s.useEffect(()=>{const n=document.createElement("style");n.innerHTML=_,document.head.appendChild(n);const l=localStorage.getItem("playerUser")||sessionStorage.getItem("playerUser");if(!l){t("/login");return}try{const d=JSON.parse(l);r(d),d&&g()}catch(d){console.error("Failed to parse stored user:",d),t("/login")}return()=>{document.head.removeChild(n)}},[]);const g=async()=>{var n,l,d;v(null),x(!0);try{const h=await S.get("/pauth/me");r(h.data.player);const u=await S.get("/pauth/transactions");o(u.data.transactions||[]);const w=await S.get("/play/dashboard-games");c(w.data.games||{promogames:[],branded:[]})}catch(h){const u=(n=h.response)==null?void 0:n.status,w=((d=(l=h.response)==null?void 0:l.data)==null?void 0:d.message)||h.message||"Unknown error occurred";if(u===401||u===403)return;v(`Error ${u||""}: ${w}`)}finally{x(!1)}},j=()=>{localStorage.removeItem("playerToken"),localStorage.removeItem("playerUser"),sessionStorage.removeItem("playerToken"),sessionStorage.removeItem("playerUser"),t("/login")},C=n=>{const l={...a,avatar_id:n};r(l),(localStorage.getItem("playerUser")?localStorage:sessionStorage).setItem("playerUser",JSON.stringify(l)),window.dispatchEvent(new Event("player-updated"))},k=()=>{f(null),g()};if(p)return e.jsxs("div",{style:{minHeight:"100vh",background:"#0f0720",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20},children:[e.jsx("div",{className:"animate-pulse-glow",style:{fontSize:56},children:"💎"}),e.jsx("div",{style:{fontSize:12,fontWeight:700,color:"var(--neon-purple)",textTransform:"uppercase",letterSpacing:2},children:"Loading Engine..."})]});if(y)return e.jsx(D,{message:y,onRetry:g});if(!a)return null;const W={player:a,txs:b,games:i,loadData:g,handleLogout:j,handleAvatarChange:C,activeGame:m,setActiveGame:f,handleCloseGame:k};return e.jsx(z.Provider,{value:W,children:e.jsxs("div",{style:{minHeight:"100vh",paddingTop:110,position:"relative"},children:[e.jsx("div",{style:{position:"fixed",inset:0,background:"radial-gradient(circle at 50% -20%, #2e1065, #0f0720)",zIndex:-1}}),e.jsx("div",{style:{position:"fixed",top:"5%",right:"-10%",width:"70%",height:"70%",background:"radial-gradient(circle, rgba(124, 58, 237, 0.1), transparent 70%)",zIndex:-1},className:"animate-pulse-glow"}),e.jsx("div",{style:{position:"fixed",bottom:"10%",left:"-10%",width:"60%",height:"60%",background:"radial-gradient(circle, rgba(168, 85, 247, 0.08), transparent 70%)",zIndex:-1},className:"animate-pulse-glow"}),e.jsx("div",{style:{position:"fixed",inset:0,opacity:.1,pointerEvents:"none",zIndex:-1,background:"linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",backgroundSize:"40px 40px"}}),e.jsx(T,{}),(a==null?void 0:a.profile_complete)===0&&!(a!=null&&a.nudge_dismissed)&&e.jsxs("div",{style:{maxWidth:1100,margin:"0 auto 8px",padding:"12px 18px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",background:"linear-gradient(90deg, rgba(146,16,246,0.16), rgba(97,4,151,0.10))",border:"1px solid rgba(146,16,246,0.35)",borderRadius:14,fontFamily:"'DM Sans', sans-serif"},children:[e.jsx("span",{style:{fontSize:18},children:"🪪"}),e.jsx("span",{style:{flex:1,minWidth:200,fontSize:13.5,color:"rgba(255,255,255,0.85)"},children:"Finish setting up your profile — pick a username so friends can find you and you can earn referral coins."}),e.jsx("button",{onClick:()=>t("/player/profile"),style:{padding:"8px 18px",borderRadius:100,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#9210f6,#610497)",color:"#fff",fontSize:12.5,fontWeight:700},children:"Complete profile"}),e.jsx("button",{onClick:()=>r(n=>({...n,nudge_dismissed:!0})),"aria-label":"Dismiss",style:{background:"none",border:"none",color:"rgba(255,255,255,0.45)",fontSize:15,cursor:"pointer",padding:4},children:"✕"})]}),e.jsx(I,{}),m&&e.jsx(R,{game:m,allGames:[...i.branded||[],...i.promogames||[]],onClose:k,onSwitch:f,isLoggedIn:!!L()})]})})}const J=Object.freeze(Object.defineProperty({__proto__:null,default:B,usePlayer:P},Symbol.toStringTag,{value:"Module"}));export{Y as A,O as D,J as P,G as Q,U as R,M as W,H as a,F as b,P as u};
