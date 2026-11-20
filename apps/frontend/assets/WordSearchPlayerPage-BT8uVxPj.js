import{r as o,j as t}from"./react-vendor-gyK15t0p.js";import{P as $e}from"./play-DF4pDxYJ.js";import{H as Ue}from"./index-B2qSlCu9.js";import{C as We}from"./check-BYpPGHX4.js";import{L as Ye}from"./lightbulb-CKenC9LP.js";import{S as Ge}from"./shuffle-CwDmCAdr.js";import{L as Ve}from"./layout-grid-DbKgJxBj.js";import{V as Ke}from"./volume-2-DbGfhel9.js";import{V as Xe}from"./volume-x-DvwFfcAz.js";import{X as _e}from"./x-BSYMQvHz.js";import{T as qe}from"./trophy-B6m6IBwK.js";const Z={animals:{label:"Safari",emoji:"🦁",tagline:"Stalk the savanna",words:["TIGER","ZEBRA","PANDA","EAGLE","KOALA","OTTER","RHINO","LEMUR","HYENA","CAMEL","GIRAFFE","CHEETAH","ELEPHANT","GAZELLE"]},ocean:{label:"Ocean",emoji:"🐙",tagline:"Dive the deep blue",words:["EEL","TUNA","CRAB","SQUID","SHARK","WHALE","CORAL","MANTA","URCHIN","DOLPHIN","LOBSTER","OCTOPUS","SEAHORSE","STARFISH","JELLYFISH"]},space:{label:"Space",emoji:"🚀",tagline:"Chart the cosmos",words:["COMET","ORBIT","LUNAR","METEOR","GALAXY","ROCKET","PLANET","NEBULA","SATURN","COSMOS","ECLIPSE","GRAVITY","SHUTTLE","ASTEROID"]},sweets:{label:"Sweets",emoji:"🍩",tagline:"Raid the bakery",words:["CANDY","MOCHA","FUDGE","DONUT","TOFFEE","WAFFLE","COOKIE","PASTRY","MUFFIN","ECLAIR","PRALINE","CARAMEL","BISCUIT","PANCAKE","GUMDROP","LOLLIPOP"]}},G={easy:{label:"Easy",size:8,count:6,hints:3,dirs:[[0,1],[1,0],[1,1]]},medium:{label:"Medium",size:10,count:8,hints:3,dirs:[[0,1],[1,0],[1,1],[-1,1],[0,-1]]},hard:{label:"Hard",size:12,count:10,hints:2,dirs:[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]}},Q=[{main:"#FF6FA5",shadow:"#D94A80"},{main:"#8B6EF0",shadow:"#6A4ED0"},{main:"#35C9A5",shadow:"#1FA688"},{main:"#FF8A3D",shadow:"#E4661B"},{main:"#4FB6FF",shadow:"#2A8FDB"},{main:"#FFC93D",shadow:"#E79A0B"}],me={main:"#FF3D7A",shadow:"#C22558"},xe=["GOOD JOB!","NICE!","SWEET!","AWESOME!","BOOM!","SUPER!"],Je=[{top:"6%",left:"8%",scale:1.1,duration:70},{top:"14%",left:"55%",scale:.8,duration:55},{top:"4%",left:"78%",scale:1.3,duration:85},{top:"22%",left:"30%",scale:.65,duration:60}];function Ze(s){const d=[...s];for(let a=d.length-1;a>0;a--){const p=Math.floor(Math.random()*(a+1));[d[a],d[p]]=[d[p],d[a]]}return d}function Qe(s,d){const{size:a,count:p,dirs:f}=G[d],C=Z[s].words.filter(c=>c.length<=a),H=Ze(C).slice(0,p).sort((c,b)=>b.length-c.length),x=Array.from({length:a},()=>Array(a).fill(null)),N=[];H.forEach((c,b)=>{let O=!1,A=0;const S=c.length;for(;!O&&A<400;){A++;const[F,g]=f[Math.floor(Math.random()*f.length)],z=F===1?0:F===-1?S-1:0,P=F===1?a-S:a-1,L=g===1?0:g===-1?S-1:0,i=g===1?a-S:a-1;if(z>P||L>i)continue;const v=z+Math.floor(Math.random()*(P-z+1)),V=L+Math.floor(Math.random()*(i-L+1));let $=!0;const T=[];for(let w=0;w<S;w++){const y=v+F*w,R=V+g*w,U=x[y][R];if(U&&U!==c[w]){$=!1;break}T.push({r:y,c:R})}$&&(T.forEach((w,y)=>{x[w.r][w.c]=c[y]}),N.push({word:c,cells:T,color:Q[b%Q.length]}),O=!0)}});for(let c=0;c<a;c++)for(let b=0;b<a;b++)x[c][b]||(x[c][b]=String.fromCharCode(65+Math.floor(Math.random()*26)));return{size:a,grid:x,placements:N}}function ge(s,d){const a=d.r-s.r,p=d.c-s.c;if(a===0&&p===0)return[s];if(!(a===0||p===0||Math.abs(a)===Math.abs(p)))return null;const C=Math.max(Math.abs(a),Math.abs(p)),H=Math.sign(a),x=Math.sign(p),N=[];for(let c=0;c<=C;c++)N.push({r:s.r+H*c,c:s.c+x*c});return N}function re(s,d){const a=100/d,p=s[0],f=s[s.length-1];return{x1:(p.c+.5)*a,y1:(p.r+.5)*a,x2:(f.c+.5)*a,y2:(f.r+.5)*a}}function he(s){const d=Math.floor(s/60).toString().padStart(2,"0"),a=(s%60).toString().padStart(2,"0");return`${d}:${a}`}function pt(){const[s,d]=o.useState("menu"),[a,p]=o.useState("animals"),[f,C]=o.useState("easy"),[H,x]=o.useState(0),[N,c]=o.useState(1),[b,O]=o.useState(0),[A,S]=o.useState(!0),[F,g]=o.useState(!1),[z,P]=o.useState(null),L=o.useRef(null),i=o.useMemo(()=>Qe(a,f),[a,f,H]),[v,V]=o.useState({}),[$,T]=o.useState(0),[w,y]=o.useState(!1),[R,U]=o.useState(G[f].hints),[ee,te]=o.useState(null),[be,se]=o.useState([]),[K,ne]=o.useState(!1),[X,ae]=o.useState(null),[D,W]=o.useState([]),ie=o.useRef([]),I=o.useRef(null);function _(){if(!I.current){const e=window.AudioContext||window.webkitAudioContext;e&&(I.current=new e)}return I.current&&I.current.state==="suspended"&&I.current.resume().catch(()=>{}),I.current}function u(e,n,r,l,h){if(!A)return;const m=_();if(!m)return;const M=m.createOscillator(),B=m.createGain();M.type=l||"sine",M.frequency.value=e;const E=m.currentTime+n;B.gain.setValueAtTime(0,E),B.gain.linearRampToValueAtTime(h||.15,E+.015),B.gain.exponentialRampToValueAtTime(1e-4,E+r),M.connect(B).connect(m.destination),M.start(E),M.stop(E+r+.05)}function j(e){try{navigator.vibrate&&navigator.vibrate(e)}catch{}}const k=()=>u(650,0,.08,"sine",.13),ve=()=>u(520,0,.06,"sine",.1),ke=()=>{u(784,0,.12,"triangle",.16),u(988,.09,.14,"triangle",.16),u(1175,.18,.22,"triangle",.18)},ye=()=>{u(660,0,.1,"sine",.14),u(880,.09,.16,"sine",.14)},je=()=>{u(1400,0,.06,"square",.07),u(1800,.05,.09,"square",.08)},Ee=()=>{[523,659,784,1047].forEach((e,n)=>u(e,n*.11,.28,"triangle",.2))},Ce=()=>u(220,0,.15,"sine",.07),le=[523.25,0,659.25,783.99,0,659.25,587.33,0,523.25,0,659.25,880,783.99,659.25,587.33,0],ce={0:130.81,8:196},oe=o.useRef(0),Y=o.useRef(null);function de(){const e=oe.current%le.length,n=le[e];n&&u(n,0,.2,"triangle",.055),ce[e]&&u(ce[e],0,.32,"sine",.05),e%2===1&&u(2400,0,.05,"square",.015),oe.current+=1}function Ne(){Y.current||(_(),oe.current=0,de(),Y.current=setInterval(de,227))}function pe(){Y.current&&(clearInterval(Y.current),Y.current=null)}o.useEffect(()=>(s==="playing"&&A&&!w?Ne():pe(),()=>pe()),[s,A,w]),o.useEffect(()=>{const e=document.createElement("link");return e.rel="stylesheet",e.href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&display=swap",document.head.appendChild(e),()=>{document.head.removeChild(e)}},[]),o.useEffect(()=>{ie.current=D},[D]),o.useEffect(()=>{V({}),T(0),y(!1),W([]),ae(null),ne(!1),te(null),U(G[f].hints),se([])},[i]),o.useEffect(()=>{if(w||s!=="playing")return;const e=setInterval(()=>T(n=>n+1),1e3);return()=>clearInterval(e)},[w,i,s]),o.useEffect(()=>{i.placements.length>0&&Object.keys(v).length===i.placements.length&&(y(!0),O(e=>e+50),Ee(),j([40,60,40,60,40,80,120]))},[v,i]),o.useEffect(()=>{if(!w)return;const e=Array.from({length:26},(n,r)=>({id:r,left:Math.random()*100,delay:Math.random()*.5,duration:1.9+Math.random()*1.3,color:Q[r%Q.length].main,rotate:Math.random()*360}));se(e)},[w]),o.useEffect(()=>{if(!K)return;const e=()=>Ae();return window.addEventListener("mouseup",e),window.addEventListener("touchend",e),()=>{window.removeEventListener("mouseup",e),window.removeEventListener("touchend",e)}},[K]);function Ae(){const e=ie.current;if(ne(!1),e.length>1){const n=e.map(({r:h,c:m})=>i.grid[h][m]).join(""),r=n.split("").reverse().join(""),l=i.placements.find(h=>!v[h.word]&&(h.word===n||h.word===r));if(l){V(m=>({...m,[l.word]:l})),O(m=>m+10),ke(),je(),j([35,45,35,45]),L.current&&clearTimeout(L.current);const h=xe[Math.floor(Math.random()*xe.length)];P({text:h,id:Date.now()}),L.current=setTimeout(()=>P(null),900)}else Ce(),j(20)}W([]),ae(null)}function Se(e,n){const r=document.elementFromPoint(e,n),l=r&&r.closest?r.closest("[data-cell]"):null;return l?{r:Number(l.dataset.r),c:Number(l.dataset.c)}:null}function we(e,n){return r=>{r.preventDefault(),_(),ne(!0),ae({r:e,c:n}),W([{r:e,c:n}]),ve(),j(18)}}function Fe(e,n){return()=>{if(!K||!X)return;const r=ge(X,{r:e,c:n});r&&W(r)}}function ze(e){if(!K||!X)return;const n=e.touches[0],r=Se(n.clientX,n.clientY);if(r){const l=ge(X,r);l&&W(l)}}function Le(){if(R<=0||w)return;const e=i.placements.filter(r=>!v[r.word]);if(e.length===0)return;const n=e[Math.floor(Math.random()*e.length)];te(n.cells[0]),U(r=>r-1),ye(),j([25,20,25]),setTimeout(()=>te(null),1400)}function Me(){k(),j(15),x(e=>e+1)}function Oe(){k(),j(15),c(e=>e+1),x(e=>e+1)}function Te(){k(),S(e=>!e)}function Re(){_(),k(),j(15),c(1),O(0),x(e=>e+1),d("playing")}function De(){k(),d("menu"),g(!1)}function Ie(e,n){k(),j(15),p(e),C(n),x(r=>r+1),g(!1),y(!1)}const Be=o.useMemo(()=>{const e=new Map;return Object.values(v).forEach(n=>n.cells.forEach(({r,c:l})=>e.set(`${r}-${l}`,n.color))),e},[v]),fe=Object.keys(v).length,q=i.placements.length,He=q?fe/q*100:0,J=100/i.size*.6,Pe=i.size<=8?"1.6rem":i.size<=10?"1.25rem":"1rem",ue=Z[a];return t.jsxs("div",{className:"ww-root",children:[t.jsx("style",{children:`
        .ww-root {
          --sky-top:#7BE1F0; --sky-bot:#CFF3D9;
          --hill-back:#8FE07C; --hill-mid:#63C862; --hill-front:#3FAE4E;
          --cream:#FFF7E9; --cream-edge:#F4E6C7;
          --outline:#5A3A1E; --outline-soft:#7A4E27;
          --orange:#FF8A3D; --orange-dark:#E4661B;
          --gold:#FFC93D; --gold-dark:#E79A0B;
          --ink:#4A3220; --ink-soft:#7A5C42;
          --wood:#8A5A2E; --wood-dark:#6B4220;
          font-family:'Nunito', system-ui, sans-serif;
          color:var(--ink);
          min-height:100vh; width:100%; box-sizing:border-box;
          display:flex; justify-content:center; position:relative; overflow:hidden;
          padding: clamp(14px,3vw,32px) clamp(10px,3vw,32px) 30px;
          background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-bot) 62%, var(--sky-bot) 100%);
        }
        .ww-root *,.ww-root *::before,.ww-root *::after{box-sizing:border-box;}
        .ww-bg{position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;}
        .ww-sun{position:absolute;top:-60px;left:-40px;width:220px;height:220px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,246,196,0.9),rgba(255,246,196,0) 70%);}
        .ww-cloud{position:absolute;width:70px;height:26px;border-radius:50px;background:#fff;opacity:0.85;
          box-shadow:18px -14px 0 -2px #fff,-16px -10px 0 -4px #fff,34px -4px 0 -6px #fff;
          animation:ww-drift linear infinite;}
        @keyframes ww-drift{from{transform:translateX(-10vw);}to{transform:translateX(110vw);}}
        .ww-hill{position:absolute;left:-15%;width:130%;border-radius:50% 50% 0 0/100% 100% 0 0;}
        .ww-hill.back{bottom:-30px;height:210px;background:var(--hill-back);opacity:0.9;}
        .ww-hill.mid{bottom:-40px;height:160px;background:var(--hill-mid);}
        .ww-hill.front{bottom:-50px;height:120px;background:var(--hill-front);}
        @media (prefers-reduced-motion: reduce){ .ww-cloud{animation:none;} }

        .ww-shell{position:relative;z-index:1;width:100%;max-width:460px;}
        .ww-btn{font-family:'Nunito',sans-serif;font-weight:800;border:none;cursor:pointer;border-radius:999px;
          transition:transform .1s ease, box-shadow .1s ease;}
        .ww-btn:active{transform:translateY(2px);}
        .ww-root button:focus-visible,.ww-root [tabindex]:focus-visible{outline:3px solid var(--gold-dark);outline-offset:2px;}

        .ww-bubble{
          font-family:'Fredoka',sans-serif; font-weight:700;
          background:linear-gradient(180deg,#FFE07A 0%,#FFB627 55%,#FF8A2E 100%);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          -webkit-text-stroke:3px var(--outline); paint-order:stroke fill;
          filter:drop-shadow(0 5px 0 rgba(90,58,30,0.35));
        }

        .ww-3d-btn{
          background:linear-gradient(180deg,var(--gold) 0%,var(--orange) 100%);
          color:var(--outline); box-shadow:0 6px 0 var(--orange-dark), 0 14px 26px -10px rgba(228,102,27,0.55);
          padding:16px 40px; font-size:1.05rem; display:inline-flex; align-items:center; gap:8px;
        }
        .ww-3d-btn:active{box-shadow:0 2px 0 var(--orange-dark);}
        .ww-3d-btn.secondary{background:linear-gradient(180deg,#fff,#EFE6D3);color:var(--ink);
          box-shadow:0 6px 0 var(--cream-edge), 0 10px 20px -10px rgba(0,0,0,0.25);}
        .ww-3d-btn.secondary:active{box-shadow:0 2px 0 var(--cream-edge);}

        /* ---------- Menu ---------- */
        .ww-menu{text-align:center;padding-top:6vh;}
        .ww-title{font-size:clamp(2.6rem,10vw,4rem);margin:0 0 2px;letter-spacing:1px;line-height:0.95;}
        .ww-menu-sub{color:var(--outline-soft);font-weight:800;margin:10px 0 30px;font-size:0.95rem;
          background:rgba(255,255,255,0.55);display:inline-block;padding:6px 16px;border-radius:999px;}
        .ww-panel{background:var(--cream);border:4px solid var(--outline);border-radius:26px;padding:22px;
          box-shadow:0 16px 0 rgba(90,58,30,0.18), 0 22px 40px -14px rgba(0,0,0,0.35); position:relative; overflow:hidden;}
        .ww-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:40%;
          background:linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0));pointer-events:none;}
        .ww-section-label{text-align:left;font-size:0.78rem;font-weight:900;text-transform:uppercase;letter-spacing:1px;
          color:var(--ink-soft);margin:0 0 10px;}
        .ww-cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:22px;}
        .ww-cat-card{background:#fff;border:3px solid var(--cream-edge);border-radius:16px;padding:12px 8px;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;gap:2px;transition:transform .12s,border-color .12s;}
        .ww-cat-card:hover{transform:translateY(-2px);}
        .ww-cat-card.is-active{border-color:var(--orange);background:#FFF1DC;}
        .ww-cat-emoji{font-size:1.6rem;}
        .ww-cat-name{font-weight:900;font-size:0.9rem;color:var(--ink);}
        .ww-cat-tag{font-size:0.68rem;color:var(--ink-soft);font-weight:700;}
        .ww-diff-row{display:flex;gap:8px;justify-content:center;margin-bottom:24px;flex-wrap:wrap;}
        .ww-diff-chip{background:#fff;border:3px solid var(--cream-edge);color:var(--ink);padding:9px 18px;
          font-size:0.82rem;border-radius:999px;cursor:pointer;font-weight:900;font-family:'Nunito',sans-serif;}
        .ww-diff-chip.is-active{border-color:var(--teal,#35C9A5);background:#DFF7F0;color:#1FA688;}

        /* ---------- HUD ---------- */
        .ww-hud{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;}
        .ww-home-btn{width:44px;height:44px;border-radius:14px;background:linear-gradient(180deg,var(--gold),var(--orange));
          border:3px solid var(--outline);display:flex;align-items:center;justify-content:center;color:var(--outline);
          box-shadow:0 4px 0 var(--orange-dark);}
        .ww-home-btn:active{box-shadow:0 1px 0 var(--orange-dark);transform:translateY(3px);}
        .ww-level-pill{font-family:'Baloo 2',sans-serif;font-weight:800;background:rgba(255,255,255,0.75);
          border:2px solid rgba(90,58,30,0.25);border-radius:999px;padding:8px 18px;font-size:0.95rem;color:var(--ink);}
        .ww-coin-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.75);
          border:2px solid rgba(90,58,30,0.25);border-radius:999px;padding:7px 14px;font-weight:900;
          font-family:'Baloo 2',sans-serif;font-size:0.95rem;}

        .ww-ribbon{position:relative;background:linear-gradient(180deg,var(--orange),var(--orange-dark));
          color:#fff;text-align:center;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;
          letter-spacing:1.5px;padding:9px 10px 8px;border-radius:12px;margin:0 26px 12px;
          border:2px solid var(--outline);box-shadow:0 4px 0 var(--outline-soft);}
        .ww-ribbon::before,.ww-ribbon::after{content:'';position:absolute;top:2px;width:0;height:0;
          border-style:solid;}
        .ww-ribbon::before{left:-16px;border-width:14px 16px 14px 0;border-color:transparent var(--orange-dark) transparent transparent;}
        .ww-ribbon::after{right:-16px;border-width:14px 0 14px 16px;border-color:transparent transparent transparent var(--orange-dark);}

        .ww-wordbank{background:rgba(90,58,30,0.28);backdrop-filter:blur(2px);border-radius:16px;padding:10px 12px;
          display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin-bottom:14px;}
        .ww-word-chip{font-family:'Baloo 2',sans-serif;font-weight:700;font-size:0.85rem;letter-spacing:0.5px;
          color:#fff;text-shadow:0 2px 0 rgba(0,0,0,0.25);transition:opacity .2s;}
        .ww-word-chip.is-found{opacity:0.55;text-decoration:line-through;text-decoration-thickness:2px;}

        .ww-grid-wrap{position:relative;margin-bottom:14px;}
        .ww-grid{position:relative;display:grid;gap:0;background:var(--cream);border:4px solid var(--outline);
          border-radius:20px;overflow:hidden;box-shadow:0 10px 0 rgba(90,58,30,0.2), 0 20px 40px -18px rgba(0,0,0,0.4);
          user-select:none;-webkit-user-select:none;touch-action:none;font-size:${Pe};padding:6px;}
        .ww-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;
          font-family:'Baloo 2',sans-serif;font-weight:700;color:var(--ink);cursor:pointer;position:relative;
          z-index:2;transition:color .12s ease;}
        .ww-cell.is-selected{color:#fff;}
        .ww-cell.is-found{color:#fff;}
        .ww-cell.is-hint{animation:ww-hint-pulse .7s ease-in-out infinite;border-radius:50%;}
        @keyframes ww-hint-pulse{0%,100%{box-shadow:inset 0 0 0 2px var(--gold-dark);}50%{box-shadow:inset 0 0 0 5px var(--gold-dark);}}
        .ww-lines{position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);z-index:1;pointer-events:none;}

        .ww-praise{position:absolute;left:50%;top:6%;transform:translate(-50%,0);font-size:1.7rem;
          pointer-events:none;z-index:5;animation:ww-praise-pop .9s ease forwards;
          font-family:'Fredoka',sans-serif;font-weight:700;
          background:linear-gradient(180deg,#FFE07A,#FFB627 55%,#FF8A2E);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          -webkit-text-stroke:2.5px var(--outline);paint-order:stroke fill;}
        @keyframes ww-praise-pop{0%{opacity:0;transform:translate(-50%,10px) scale(.6) rotate(-6deg);}
          15%{opacity:1;transform:translate(-50%,-6px) scale(1.15) rotate(3deg);}
          30%{transform:translate(-50%,-2px) scale(1) rotate(-2deg);}
          75%{opacity:1;}100%{opacity:0;transform:translate(-50%,-18px) scale(.9) rotate(0);}}

        .ww-progress-row{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:0 4px;}
        .ww-progress-track{flex:1;height:10px;background:rgba(90,58,30,0.2);border-radius:999px;overflow:hidden;}
        .ww-progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--orange));border-radius:999px;transition:width .3s ease;}
        .ww-progress-label{font-weight:900;font-size:0.78rem;color:var(--outline-soft);white-space:nowrap;}

        .ww-dock{display:flex;justify-content:space-around;align-items:center;background:linear-gradient(180deg,var(--wood),var(--wood-dark));
          border:3px solid var(--outline);border-radius:22px;padding:10px 8px;box-shadow:0 8px 0 rgba(0,0,0,0.2);}
        .ww-dock-btn{position:relative;width:54px;height:54px;border-radius:16px;background:linear-gradient(180deg,#FFF7E9,#F4E6C7);
          border:2px solid var(--outline);color:var(--ink);display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 0 rgba(0,0,0,0.25);}
        .ww-dock-btn:disabled{opacity:0.45;}
        .ww-dock-btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,0.25);}
        .ww-badge{position:absolute;top:-6px;right:-6px;background:var(--orange);color:#fff;font-size:0.65rem;
          font-weight:900;border-radius:999px;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;
          border:2px solid var(--outline);font-family:'Baloo 2',sans-serif;}

        /* ---------- Modal ---------- */
        .ww-modal-overlay{position:fixed;inset:0;background:rgba(20,20,40,0.5);display:flex;align-items:flex-end;
          justify-content:center;z-index:60;padding:0;}
        .ww-modal-card{background:var(--cream);border:4px solid var(--outline);border-radius:26px 26px 0 0;
          padding:22px 20px 28px;width:100%;max-width:460px;animation:ww-sheet-up .25s ease;}
        @keyframes ww-sheet-up{from{transform:translateY(30px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        .ww-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .ww-modal-head h3{font-family:'Fredoka',sans-serif;margin:0;font-size:1.2rem;color:var(--ink);}
        .ww-modal-close{width:34px;height:34px;border-radius:50%;background:#fff;border:2px solid var(--cream-edge);
          display:flex;align-items:center;justify-content:center;color:var(--ink);}

        /* ---------- Win overlay ---------- */
        .ww-win-overlay{position:fixed;inset:0;background:rgba(20,20,40,0.55);backdrop-filter:blur(3px);
          display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;}
        .ww-win-card{background:var(--cream);border:4px solid var(--outline);border-radius:24px;padding:36px 30px;
          text-align:center;max-width:360px;position:relative;z-index:2;animation:ww-pop .35s cubic-bezier(.2,1.4,.4,1);}
        @keyframes ww-pop{from{transform:scale(.85);opacity:0;}to{transform:scale(1);opacity:1;}}
        .ww-win-card svg{color:var(--gold-dark);}
        .ww-win-card h2{font-family:'Fredoka',sans-serif;font-size:1.7rem;margin:8px 0 6px;color:var(--ink);}
        .ww-win-card p{color:var(--ink-soft);margin:0 0 8px;font-size:0.9rem;font-weight:700;}
        .ww-win-coins{font-family:'Baloo 2',sans-serif;font-weight:800;color:var(--gold-dark);font-size:1.15rem;margin-bottom:20px;}
        .ww-win-actions{display:flex;flex-direction:column;gap:10px;}
        .ww-win-actions .ww-3d-btn{justify-content:center;padding:13px;font-size:0.92rem;}
        .ww-confetti-piece{position:fixed;top:-12px;width:8px;height:14px;z-index:40;border-radius:2px;
          animation-name:ww-fall;animation-timing-function:cubic-bezier(.4,0,.6,1);animation-iteration-count:1;animation-fill-mode:forwards;}
        @keyframes ww-fall{to{transform:translateY(105vh) rotate(540deg);opacity:0.2;}}

        .ww-bump{display:inline-block;animation:ww-bump-kf .4s ease;}
        @keyframes ww-bump-kf{0%{transform:scale(1);}30%{transform:scale(1.35);}100%{transform:scale(1);}}

        @media (max-width:380px){ .ww-cat-grid{gap:8px;} .ww-title{font-size:2.3rem;} }
      `}),t.jsxs("div",{className:"ww-bg",children:[t.jsx("div",{className:"ww-sun"}),Je.map((e,n)=>t.jsx("div",{className:"ww-cloud",style:{top:e.top,left:e.left,transform:`scale(${e.scale})`,animationDuration:`${e.duration}s`}},n)),t.jsx("div",{className:"ww-hill back"}),t.jsx("div",{className:"ww-hill mid"}),t.jsx("div",{className:"ww-hill front"})]}),t.jsxs("div",{className:"ww-shell",children:[s==="menu"&&t.jsxs("div",{className:"ww-menu",children:[t.jsxs("h1",{className:"ww-bubble ww-title",children:["WORD",t.jsx("br",{}),"SEARCH"]}),t.jsx("span",{className:"ww-menu-sub",children:"Sweep every word before time's up!"}),t.jsxs("div",{className:"ww-panel",children:[t.jsx("p",{className:"ww-section-label",children:"Choose a pack"}),t.jsx("div",{className:"ww-cat-grid",children:Object.entries(Z).map(([e,n])=>t.jsxs("div",{className:`ww-cat-card ${a===e?"is-active":""}`,onClick:()=>{k(),p(e)},role:"button",tabIndex:0,onKeyDown:r=>{r.key==="Enter"&&p(e)},children:[t.jsx("span",{className:"ww-cat-emoji",children:n.emoji}),t.jsx("span",{className:"ww-cat-name",children:n.label}),t.jsx("span",{className:"ww-cat-tag",children:n.tagline})]},e))}),t.jsx("p",{className:"ww-section-label",children:"Difficulty"}),t.jsx("div",{className:"ww-diff-row",children:Object.entries(G).map(([e,n])=>t.jsx("button",{className:`ww-diff-chip ${f===e?"is-active":""}`,onClick:()=>{k(),C(e)},children:n.label},e))}),t.jsxs("button",{className:"ww-btn ww-3d-btn",style:{width:"100%",justifyContent:"center"},onClick:Re,children:[t.jsx($e,{size:20,fill:"#5A3A1E"})," PLAY"]})]})]}),s==="playing"&&t.jsxs("div",{children:[t.jsxs("div",{className:"ww-hud",children:[t.jsx("button",{className:"ww-home-btn",onClick:De,"aria-label":"Home",children:t.jsx(Ue,{size:20})}),t.jsxs("span",{className:"ww-level-pill",children:["LEVEL ",N]}),t.jsx("span",{className:"ww-coin-pill",children:t.jsxs("span",{className:"ww-bump",children:["🪙 ",b]},b)})]}),t.jsxs("div",{className:"ww-ribbon",children:[ue.emoji," ",ue.label.toUpperCase()]}),t.jsx("div",{className:"ww-wordbank",children:i.placements.map(e=>t.jsx("span",{className:`ww-word-chip ${v[e.word]?"is-found":""}`,children:e.word},e.word))}),t.jsxs("div",{className:"ww-grid-wrap",children:[t.jsxs("div",{className:"ww-grid",style:{gridTemplateColumns:`repeat(${i.size}, 1fr)`},onTouchMove:ze,children:[i.grid.map((e,n)=>e.map((r,l)=>{const h=`${n}-${l}`,m=D.some(E=>E.r===n&&E.c===l),M=Be.get(h),B=ee&&ee.r===n&&ee.c===l;return t.jsx("div",{"data-cell":"true","data-r":n,"data-c":l,className:`ww-cell ${m?"is-selected":""} ${M?"is-found":""} ${B?"is-hint":""}`,onMouseDown:we(n,l),onMouseEnter:Fe(n,l),onTouchStart:we(n,l),children:r},h)})),t.jsxs("svg",{className:"ww-lines",viewBox:"0 0 100 100",children:[i.placements.filter(e=>v[e.word]).map(e=>{const n=re(e.cells,i.size);return t.jsxs("g",{children:[t.jsx("line",{...n,stroke:e.color.shadow,strokeWidth:J,strokeLinecap:"round",transform:"translate(0,1.6)"}),t.jsx("line",{...n,stroke:e.color.main,strokeWidth:J,strokeLinecap:"round"})]},e.word)}),D.length>1&&t.jsxs("g",{children:[t.jsx("line",{...re(D,i.size),stroke:me.shadow,strokeWidth:J,strokeLinecap:"round",transform:"translate(0,1.6)"}),t.jsx("line",{...re(D,i.size),stroke:me.main,strokeWidth:J,strokeLinecap:"round"})]})]})]}),z&&t.jsx("div",{className:"ww-praise",children:z.text},z.id)]}),t.jsxs("div",{className:"ww-progress-row",children:[t.jsx("div",{className:"ww-progress-track",children:t.jsx("div",{className:"ww-progress-fill",style:{width:`${He}%`}})}),t.jsxs("span",{className:"ww-progress-label",children:[fe,"/",q]}),t.jsxs("span",{className:"ww-progress-label",children:[t.jsx(We,{size:12,style:{verticalAlign:-1}})," ",he($)]})]}),t.jsxs("div",{className:"ww-dock",children:[t.jsxs("button",{className:"ww-dock-btn",onClick:Le,disabled:R<=0,"aria-label":"Hint",children:[t.jsx(Ye,{size:22}),t.jsx("span",{className:"ww-badge",children:R})]}),t.jsx("button",{className:"ww-dock-btn",onClick:Me,"aria-label":"Shuffle puzzle",children:t.jsx(Ge,{size:22})}),t.jsx("button",{className:"ww-dock-btn",onClick:()=>{k(),g(!0)},"aria-label":"Change pack",children:t.jsx(Ve,{size:22})}),t.jsx("button",{className:"ww-dock-btn",onClick:Te,"aria-label":"Toggle sound",children:A?t.jsx(Ke,{size:22}):t.jsx(Xe,{size:22})})]})]})]}),F&&t.jsx("div",{className:"ww-modal-overlay",onClick:()=>g(!1),children:t.jsxs("div",{className:"ww-modal-card",onClick:e=>e.stopPropagation(),children:[t.jsxs("div",{className:"ww-modal-head",children:[t.jsx("h3",{children:"Choose a pack"}),t.jsx("button",{className:"ww-modal-close",onClick:()=>g(!1),"aria-label":"Close",children:t.jsx(_e,{size:18})})]}),t.jsx("div",{className:"ww-cat-grid",style:{marginBottom:16},children:Object.entries(Z).map(([e,n])=>t.jsxs("div",{className:`ww-cat-card ${a===e?"is-active":""}`,onClick:()=>{k(),p(e)},role:"button",tabIndex:0,children:[t.jsx("span",{className:"ww-cat-emoji",children:n.emoji}),t.jsx("span",{className:"ww-cat-name",children:n.label}),t.jsx("span",{className:"ww-cat-tag",children:n.tagline})]},e))}),t.jsx("div",{className:"ww-diff-row",children:Object.entries(G).map(([e,n])=>t.jsx("button",{className:`ww-diff-chip ${f===e?"is-active":""}`,onClick:()=>{k(),C(e)},children:n.label},e))}),t.jsx("button",{className:"ww-btn ww-3d-btn",style:{width:"100%",justifyContent:"center"},onClick:()=>Ie(a,f),children:"START"})]})}),w&&t.jsxs("div",{className:"ww-win-overlay",children:[be.map(e=>t.jsx("span",{className:"ww-confetti-piece",style:{left:`${e.left}%`,background:e.color,animationDuration:`${e.duration}s`,animationDelay:`${e.delay}s`,transform:`rotate(${e.rotate}deg)`}},e.id)),t.jsxs("div",{className:"ww-win-card",children:[t.jsx(qe,{size:40}),t.jsx("h2",{children:"LEVEL COMPLETE!"}),t.jsxs("p",{children:["All ",q," words found in ",he($)]}),t.jsx("div",{className:"ww-win-coins",children:"+50 🪙"}),t.jsxs("div",{className:"ww-win-actions",children:[t.jsx("button",{className:"ww-btn ww-3d-btn",onClick:Oe,children:"NEXT LEVEL"}),t.jsx("button",{className:"ww-btn ww-3d-btn secondary",onClick:()=>{y(!1),g(!0)},children:"CHANGE PACK"})]})]})]})]})}export{pt as default};
