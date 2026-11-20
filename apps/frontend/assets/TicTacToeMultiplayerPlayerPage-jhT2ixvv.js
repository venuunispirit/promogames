import{r as i,j as e}from"./react-vendor-gyK15t0p.js";import{l as Pe}from"./index-SYmKJpIj.js";const Te=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];function me(c){for(const u of Te){const[m,f,d]=u;if(c[m]&&c[m]===c[f]&&c[m]===c[d])return{mark:c[m],line:u}}return null}function fe(c){const u=Math.floor(c/3);return{x:(c%3+.5)/3*100,y:(u+.5)/3*100}}const he=[-3,2,-2,3,-1,2,-3,1,-2],Se={"0,1,2":-2.2,"3,4,5":2,"6,7,8":-1.8,"0,3,6":2.2,"1,4,7":-2,"2,5,8":1.8,"0,4,8":2.4,"2,4,6":-2.4},$=()=>Array(9).fill(null);function Be(){const[c,u]=i.useState("home"),[m,f]=i.useState($()),[d,b]=i.useState("X"),[ge,J]=i.useState("X"),[y,w]=i.useState({X:0,O:0,draws:0}),[v,j]=i.useState({X:"Player X",O:"Player O"}),[D,N]=i.useState([]),[T,V]=i.useState(null),[R,H]=i.useState(null),[Z,B]=i.useState({X:!1,O:!1}),[q,be]=i.useState(""),[ee,ne]=i.useState(""),[te,C]=i.useState(""),[oe,A]=i.useState("Copy code"),[re,O]=i.useState(!1),[S,ye]=i.useState(!0),G=i.useRef(null);i.useEffect(()=>{G.current=T},[T]);const F=i.useRef(S);i.useEffect(()=>{F.current=S},[S]);const X=i.useRef(null);function ve(){if(!X.current)try{const n=window.AudioContext||window.webkitAudioContext;X.current=n?new n:null}catch{X.current=null}return X.current&&X.current.state==="suspended"&&X.current.resume().catch(()=>{}),X.current}function L(n){if(F.current)try{navigator.vibrate&&navigator.vibrate(n)}catch{}}function g({freq:n=440,duration:t=.12,type:a="sine",gain:o=.15,delay:r=0}={}){if(!F.current)return;const s=ve();if(s)try{const p=s.currentTime+r,x=s.createOscillator(),h=s.createGain();x.type=a,x.frequency.setValueAtTime(n,p),h.gain.setValueAtTime(0,p),h.gain.linearRampToValueAtTime(o,p+.008),h.gain.exponentialRampToValueAtTime(1e-4,p+t),x.connect(h),h.connect(s.destination),x.start(p),x.stop(p+t+.03)}catch{}}function ae(n){g({freq:n==="O"?460:560,duration:.07,type:"sine",gain:.12}),L(10)}function ie(){g({freq:523.25,duration:.14,gain:.16}),g({freq:659.25,duration:.14,gain:.16,delay:.11}),g({freq:783.99,duration:.24,gain:.18,delay:.22}),L([30,40,30,40,70])}function se(){g({freq:320,duration:.16,type:"triangle",gain:.13}),g({freq:260,duration:.22,type:"triangle",gain:.13,delay:.12}),L([20,30,20])}function z(){g({freq:440,duration:.05,type:"sine",gain:.08}),L(6)}function M(){g({freq:180,duration:.18,type:"sawtooth",gain:.14}),L([15,40,15,40])}function ce(){g({freq:660,duration:.1,gain:.15}),g({freq:880,duration:.16,gain:.15,delay:.1}),L([10,20,10])}i.useEffect(()=>{const n=document.createElement("link");return n.rel="stylesheet",n.href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&display=swap",document.head.appendChild(n),()=>document.head.removeChild(n)},[]);const l=me(m),le=!l&&m.every(Boolean),Y=!!l||le,de=Z.X&&Z.O,k=i.useRef(null);function pe(){var a;if((a=k.current)!=null&&a.connected)return k.current;const n=window.location.hostname==="localhost"?`http://${window.location.hostname}:8080`:window.location.origin,t=Pe(n,{transports:["websocket","polling"]});return k.current=t,t.on("ttt:opponent-joined",({names:o})=>{j(o),B({X:!0,O:!0}),ce(),u(r=>r==="online-waiting"?"online-playing":r)}),t.on("ttt:state-update",o=>{f(o.board),b(o.current),w(o.scores),N(o.history||[]),o.winner==="draw"?setTimeout(se,90):o.winner&&setTimeout(ie,90)}),t.on("ttt:new-round",o=>{f(o.board),b(o.current),J(o.startingPlayer)}),t.on("ttt:match-reset",o=>{f(o.board),w(o.scores),N(o.history||[]),b(o.current)}),t.on("ttt:opponent-left",()=>{B(o=>({...o,O:!1}))}),t}function ke(n){if(m[n]||Y)return;if(c==="online-playing"){if(!de||R!==d)return;const x=k.current;if(!(x!=null&&x.connected))return;ae(d),x.emit("ttt:make-move",{index:n},h=>{h!=null&&h.error&&M()});return}if(c!=="offline")return;const t=m.slice();t[n]=d;const a=me(t),o=t.every(Boolean);let r=y,s=D,p=d;ae(d),a?(r={...y,[a.mark]:y[a.mark]+1},s=[{type:"win",mark:a.mark},...D].slice(0,5),setTimeout(ie,90)):o?(r={...y,draws:y.draws+1},s=[{type:"draw"},...D].slice(0,5),setTimeout(se,90)):p=d==="X"?"O":"X",f(t),w(r),N(s),b(p)}function we(){var t;if(z(),c==="online-playing"){(t=k.current)==null||t.emit("ttt:new-round");return}const n=ge==="X"?"O":"X";J(n),b(n),f($())}function je(){var n;if(z(),c==="online-playing"){(n=k.current)==null||n.emit("ttt:reset-match");return}w({X:0,O:0,draws:0}),N([]),J("X"),b("X"),f($())}function K(){var n;z(),(n=k.current)==null||n.disconnect(),k.current=null,u("home"),V(null),H(null),B({X:!1,O:!1}),ne(""),C(""),f($()),w({X:0,O:0,draws:0}),N([]),j({X:"Player X",O:"Player O"})}function Ne(){z(),f($()),w({X:0,O:0,draws:0}),N([]),J("X"),b("X"),j({X:"Player X",O:"Player O"}),u("offline")}function Ce(){O(!0),C(""),pe().emit("ttt:create-room",{playerName:q.trim()||"Player X"},t=>{if(t!=null&&t.error){C(t.error),M(),O(!1);return}V(t.roomId),G.current=t.roomId,H(t.symbol),B({X:!0,O:!1}),j({X:q.trim()||"Player X",O:"Waiting…"}),u("online-waiting"),z(),O(!1)})}function Oe(){const n=ee.trim().toUpperCase();if(!n){C("Enter a room code."),M();return}O(!0),C("");const t=pe();let a=!1;const o=()=>{a||(a=!0,t.emit("ttt:join-room",{roomId:n,playerName:q.trim()||"Player O"},r=>{if(r!=null&&r.error){C(r.error),M(),O(!1);return}V(r.roomId),G.current=r.roomId,H(r.symbol),j(r.names),f(r.board),b(r.current),w(r.scores),N(r.history||[]),B({X:!0,O:!0}),u("online-playing"),ce(),O(!1)}))};t.connected?o():(t.on("connect",()=>o()),setTimeout(()=>{a||(C("Could not connect to server. Make sure the backend is running."),M(),O(!1))},5e3))}function xe(){if(T){z();try{navigator.clipboard.writeText(T),A("Copied!"),setTimeout(()=>A("Copy code"),1500)}catch{A("Copy failed"),setTimeout(()=>A("Copy code"),1500)}}}function Xe(n){const[t,,a]=n,o=s=>Math.floor(s/3),r=s=>s%3;if(o(t)===o(a)){const s=fe(t).y;return{start:{x:-4,y:s},end:{x:104,y:s}}}if(r(t)===r(a)){const s=fe(t).x;return{start:{x:s,y:-4},end:{x:s,y:104}}}return t===0?{start:{x:-4,y:-4},end:{x:104,y:104}}:{start:{x:104,y:-4},end:{x:-4,y:104}}}const P=l?Xe(l.line):null;let Q="",I=0;if(P){const{start:n,end:t}=P,a=t.x-n.x,o=t.y-n.y,r=Math.hypot(a,o),s=Se[l.line.join(",")]||0,p=-o/r,x=a/r,h=(n.x+t.x)/2+p*s,ze=(n.y+t.y)/2+x*s;Q=`M ${n.x} ${n.y} Q ${h} ${ze} ${t.x} ${t.y}`,I=r*1.02}let W;l?W=`${v[l.mark]} wins this round!`:le?W="It's a draw!":c==="online-playing"?W=R===d?"Your turn":`Waiting for ${v[d]}…`:W=`${v[d]}'s turn`;const _=e.jsx("style",{children:`
      .ttt-app{
        --paper:#f6f1e4; --paper-line:#e2d9c2; --ink:#24303d; --ink-soft:#5b6572;
        --x:#c1502e; --x-dk:#8f3a20; --o:#1f7a72; --o-dk:#155a54; --margin:#c1502e;
        min-height:100vh; width:100%;
        background:
          repeating-linear-gradient(0deg, transparent 0 27px, var(--paper-line) 27px 28px),
          var(--paper);
        font-family:'JetBrains Mono', monospace; color:var(--ink);
        display:flex; align-items:center; justify-content:center;
        padding:24px; box-sizing:border-box;
        -webkit-text-size-adjust:100%; text-size-adjust:100%;
        overscroll-behavior:contain;
      }
      .ttt-app *{ box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
      .ttt-app button{
        touch-action:manipulation; user-select:none; -webkit-user-select:none;
      }
      .ttt-app input{ touch-action:manipulation; }
      @media (max-width:480px){
        .ttt-app{ padding:14px; align-items:flex-start; }
      }
      .sheet{
        position:relative; width:100%; max-width:480px;
        background:var(--paper); border-radius:6px;
        box-shadow:0 18px 40px rgba(36,48,61,0.18), 0 2px 0 rgba(36,48,61,0.06);
        padding:clamp(20px,5vw,30px) clamp(18px,5vw,30px) clamp(18px,5vw,26px) clamp(28px,8vw,46px);
      }
      .sheet::before{
        content:""; position:absolute; left:clamp(18px,5vw,28px); top:0; bottom:0; width:1.5px; background:var(--margin); opacity:0.45;
      }
      h1{
        font-family:'Instrument Serif', serif; font-style:italic; font-weight:400;
        font-size:clamp(28px,8vw,38px); margin:0 0 2px; letter-spacing:0.3px; color:var(--ink);
      }
      .subtitle{ font-size:12px; color:var(--ink-soft); margin-bottom:20px; letter-spacing:0.3px; }
      .back-row{ margin-bottom:18px; margin-left:-10px; }
      .back-btn{
        display:inline-flex; align-items:center; gap:6px; background:transparent; border:none; cursor:pointer;
        font-family:'JetBrains Mono', monospace; font-weight:700; font-size:12px; color:var(--ink-soft);
        padding:10px; min-height:40px;
      }
      .back-btn:hover{ color:var(--ink); }
      .back-btn:active{ color:var(--ink); }

      .sound-toggle{
        position:absolute; top:16px; right:16px; z-index:5;
        width:36px; height:36px; border-radius:50%; border:1.5px solid var(--paper-line);
        background:rgba(36,48,61,0.04); color:var(--ink-soft); cursor:pointer;
        display:flex; align-items:center; justify-content:center; padding:0;
      }
      .sound-toggle:hover{ border-color:var(--ink-soft); color:var(--ink); }
      .sound-toggle:active{ background:rgba(36,48,61,0.1); }
      .sound-toggle svg{ width:17px; height:17px; }

      .home-choice{ display:flex; flex-direction:column; gap:14px; margin-top:8px; }
      .choice-card{
        display:flex; align-items:center; justify-content:space-between; gap:14px;
        background:rgba(36,48,61,0.04); border:1.5px solid var(--paper-line); border-radius:12px;
        padding:20px; cursor:pointer; text-align:left; font-family:'JetBrains Mono', monospace;
        transition:border-color .15s, transform .1s;
      }
      .choice-card:hover{ border-color:var(--ink-soft); transform:translateY(-1px); }
      .choice-card:active{ transform:translateY(0); }
      .choice-title{ font-size:16px; font-weight:700; color:var(--ink); margin-bottom:3px; }
      .choice-desc{ font-size:11.5px; color:var(--ink-soft); }
      .choice-arrow{ font-size:20px; color:var(--ink-soft); flex-shrink:0; }

      .names-row{ display:flex; align-items:center; gap:10px; margin-bottom:16px; }
      .name-field{ flex:1; display:flex; align-items:center; gap:8px; }
      .name-swatch{ width:10px; height:10px; border-radius:2px; flex-shrink:0; }
      .name-input{
        flex:1; min-width:0; background:transparent; border:none; border-bottom:1.5px dashed var(--paper-line);
        font-family:'JetBrains Mono', monospace; font-size:16px; font-weight:600; color:var(--ink);
        padding:6px 0; outline:none; min-height:32px;
      }
      .name-input:focus{ border-bottom-color:var(--ink-soft); }
      .vs{ font-size:11px; color:var(--ink-soft); font-weight:600; }

      .online-panel{
        background:rgba(36,48,61,0.04); border:1px solid var(--paper-line); border-radius:10px;
        padding:18px; margin-top:4px;
      }
      .online-label{ font-size:10.5px; text-transform:uppercase; letter-spacing:0.6px; color:var(--ink-soft); margin-bottom:6px; }
      .online-input{
        width:100%; background:var(--paper); border:1.5px solid var(--paper-line); border-radius:7px;
        font-family:'JetBrains Mono', monospace; font-size:16px; font-weight:600; color:var(--ink);
        padding:11px 10px; outline:none; margin-bottom:10px; min-height:44px;
      }
      .online-input:focus{ border-color:var(--ink-soft); }
      .online-input.code{ text-transform:uppercase; letter-spacing:3px; text-align:center; font-size:16px; }
      .online-actions{ display:flex; flex-direction:column; gap:12px; }
      .online-divider{ display:flex; align-items:center; gap:10px; color:var(--ink-soft); font-size:10.5px; margin:2px 0; }
      .online-divider::before, .online-divider::after{ content:""; flex:1; height:1px; background:var(--paper-line); }
      .join-row{ display:flex; gap:8px; }
      .join-row .online-input{ margin-bottom:0; }
      .join-error{ color:var(--x-dk); font-size:11.5px; margin-top:8px; }

      .room-badge{
        display:flex; align-items:center; justify-content:space-between; gap:10px;
        background:rgba(36,48,61,0.04); border:1px solid var(--paper-line); border-radius:9px;
        padding:12px 14px; margin-bottom:18px;
      }
      .room-badge-left{ display:flex; flex-direction:column; gap:2px; }
      .room-badge-label{ font-size:9.5px; text-transform:uppercase; letter-spacing:0.6px; color:var(--ink-soft); }
      .room-badge-code{ font-size:20px; font-weight:700; letter-spacing:3px; }
      .room-badge-you{ font-size:11px; color:var(--ink-soft); }
      .copy-btn{
        font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:700; padding:8px 11px;
        border-radius:6px; border:1.5px solid var(--ink); background:transparent; color:var(--ink); cursor:pointer;
        min-height:40px;
      }
      .copy-btn:hover{ background:rgba(36,48,61,0.08); }
      .copy-btn:active{ background:rgba(36,48,61,0.14); }
      .leave-btn{
        font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:700; padding:8px 11px;
        border-radius:6px; border:1.5px solid var(--x-dk); background:transparent; color:var(--x-dk); cursor:pointer;
        min-height:40px;
      }
      .leave-btn:hover{ background:rgba(193,80,46,0.08); }
      .leave-btn:active{ background:rgba(193,80,46,0.16); }

      .waiting-page{ text-align:center; padding:20px 6px; }
      .waiting-note{ font-size:13px; color:var(--ink-soft); margin-top:22px; }
      .waiting-spinner{
        width:34px; height:34px; margin:6px auto 0; border-radius:50%;
        border:3px solid var(--paper-line); border-top-color:var(--ink-soft);
        animation:spin 0.9s linear infinite;
      }
      @keyframes spin{ to{ transform:rotate(360deg); } }

      .score-row{
        display:flex; align-items:stretch; justify-content:space-between; gap:8px;
        margin-bottom:20px; padding:12px 14px; background:rgba(36,48,61,0.04);
        border-radius:8px; border:1px solid var(--paper-line);
      }
      .score-cell{ flex:1; text-align:center; }
      .score-num{ font-size:24px; font-weight:700; line-height:1; }
      .score-num.x{ color:var(--x); }
      .score-num.o{ color:var(--o); }
      .score-label{ font-size:9.5px; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.6px; margin-top:4px; }
      .score-div{ width:1px; background:var(--paper-line); }

      .status-row{
        display:flex; align-items:center; justify-content:center; gap:8px;
        font-size:13.5px; font-weight:600; margin-bottom:14px; min-height:20px;
      }
      .status-dot{ width:9px; height:9px; border-radius:2px; transform:rotate(45deg); }

      .board-wrap{ position:relative; width:100%; aspect-ratio:1/1; margin-bottom:20px; }
      .board{
        position:relative; z-index:1; width:100%; height:100%;
        display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr);
        background:var(--ink); border-radius:10px; overflow:hidden; gap:2px;
        box-shadow:inset 0 0 0 2px var(--ink);
      }
      .board.locked{ opacity:0.55; }
      .cell{
        background:var(--paper); border:none; cursor:pointer;
        display:flex; align-items:center; justify-content:center; position:relative;
        padding:0;
      }
      .cell:disabled{ cursor:default; }
      .cell:not(:disabled):hover{ background:#efe7d3; }
      .cell:not(:disabled):active{ background:#e8dfc7; }
      .mark{ width:52%; height:52%; animation:markPop 0.28s cubic-bezier(.2,1.4,.4,1); }
      @keyframes markPop{ from{ transform:scale(0.3) rotate(-6deg); opacity:0; } to{ transform:scale(1) rotate(0deg); opacity:1; } }

      .win-overlay{ position:absolute; inset:0; z-index:2; pointer-events:none; overflow:visible; }
      .win-glow{ filter:blur(2.2px); animation:drawLine 0.45s cubic-bezier(.3,.9,.4,1) forwards 0.08s, glowPulse 1.8s ease-in-out 0.6s infinite; }
      .win-core{ animation:drawLine 0.45s cubic-bezier(.3,.9,.4,1) forwards 0.08s; filter:drop-shadow(0 1px 1px rgba(36,48,61,0.25)); }
      .win-dot{ opacity:0; animation:dotPop 0.25s ease forwards 0.5s; }
      @keyframes drawLine{ to{ stroke-dashoffset:0; } }
      @keyframes glowPulse{ 0%,100%{ opacity:0.45; } 50%{ opacity:0.75; } }
      @keyframes dotPop{ from{ opacity:0; transform:scale(0.3); } to{ opacity:1; transform:scale(1); } }

      .btn-row{ display:flex; gap:10px; }
      .btn{
        flex:1; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:12.5px;
        letter-spacing:0.3px; padding:12px 14px; border-radius:8px; cursor:pointer; border:1.5px solid var(--ink);
        transition:transform .1s; min-height:46px;
      }
      .btn:active{ transform:translateY(1px); }
      .btn:disabled{ opacity:0.5; cursor:default; }
      .btn-primary{ background:var(--ink); color:var(--paper); }
      .btn-primary:hover{ background:#3a4756; }
      .btn-primary:active{ background:#3a4756; }
      .btn-ghost{ background:transparent; color:var(--ink); }
      .btn-ghost:hover{ background:rgba(36,48,61,0.06); }
      .btn-ghost:active{ background:rgba(36,48,61,0.1); }

      .history-row{ display:flex; gap:5px; justify-content:center; margin-top:16px; min-height:12px; }
      .history-chip{ width:9px; height:9px; border-radius:2px; }
      .history-chip.x{ background:var(--x); }
      .history-chip.o{ background:var(--o); }
      .history-chip.draw{ background:var(--ink-soft); }
    `}),U=e.jsx("button",{className:"sound-toggle",onClick:()=>ye(n=>!n),"aria-label":S?"Mute sound and haptics":"Unmute sound and haptics",title:S?"Sound & haptics on":"Sound & haptics off",children:S?e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"4,9 8,9 12,5 12,19 8,15 4,15",fill:"currentColor",stroke:"none"}),e.jsx("path",{d:"M16 8.5c1 1 1.5 2.2 1.5 3.5s-.5 2.5-1.5 3.5"}),e.jsx("path",{d:"M18.5 6c1.8 1.8 2.7 4 2.7 6s-.9 4.2-2.7 6"})]}):e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"4,9 8,9 12,5 12,19 8,15 4,15",fill:"currentColor",stroke:"none"}),e.jsx("line",{x1:"16",y1:"9",x2:"21",y2:"14"}),e.jsx("line",{x1:"21",y1:"9",x2:"16",y2:"14"})]})});if(c==="home")return e.jsxs("div",{className:"ttt-app",children:[_,e.jsxs("div",{className:"sheet",children:[U,e.jsx("h1",{children:"Tic-Tac-Toe"}),e.jsx("div",{className:"subtitle",children:"choose how you'd like to play"}),e.jsxs("div",{className:"home-choice",children:[e.jsxs("button",{className:"choice-card",onClick:Ne,children:[e.jsxs("div",{children:[e.jsx("div",{className:"choice-title",children:"Play Offline"}),e.jsx("div",{className:"choice-desc",children:"Pass & play on this device"})]}),e.jsx("span",{className:"choice-arrow",children:"→"})]}),e.jsxs("button",{className:"choice-card",onClick:()=>{z(),u("online-menu")},children:[e.jsxs("div",{children:[e.jsx("div",{className:"choice-title",children:"Play Online"}),e.jsx("div",{className:"choice-desc",children:"Create or join a room with a code"})]}),e.jsx("span",{className:"choice-arrow",children:"→"})]})]})]})]});if(c==="online-menu")return e.jsxs("div",{className:"ttt-app",children:[_,e.jsxs("div",{className:"sheet",children:[U,e.jsx("div",{className:"back-row",children:e.jsx("button",{className:"back-btn",onClick:K,children:"← Back"})}),e.jsx("h1",{children:"Play Online"}),e.jsx("div",{className:"subtitle",children:"create a room or join one with a code"}),e.jsxs("div",{className:"online-panel",children:[e.jsx("div",{className:"online-label",children:"Your name"}),e.jsx("input",{className:"online-input",placeholder:"e.g. Priya",value:q,maxLength:16,onChange:n=>be(n.target.value)}),e.jsxs("div",{className:"online-actions",children:[e.jsx("button",{className:"btn btn-primary",style:{flex:"none"},onClick:Ce,disabled:re,children:"Create Room"}),e.jsx("div",{className:"online-divider",children:"or join one"}),e.jsxs("div",{className:"join-row",children:[e.jsx("input",{className:"online-input code",placeholder:"CODE",maxLength:4,value:ee,onChange:n=>ne(n.target.value.toUpperCase())}),e.jsx("button",{className:"btn btn-ghost",style:{flex:"none"},onClick:Oe,disabled:re,children:"Join Room"})]}),te&&e.jsx("div",{className:"join-error",children:te})]})]})]})]});if(c==="online-waiting")return e.jsxs("div",{className:"ttt-app",children:[_,e.jsxs("div",{className:"sheet",children:[U,e.jsx("div",{className:"back-row",children:e.jsx("button",{className:"back-btn",onClick:K,children:"← Leave room"})}),e.jsx("h1",{children:"Waiting Room"}),e.jsx("div",{className:"subtitle",children:"share this code with your opponent"}),e.jsxs("div",{className:"room-badge",children:[e.jsxs("div",{className:"room-badge-left",children:[e.jsx("span",{className:"room-badge-label",children:"Room code"}),e.jsx("span",{className:"room-badge-code",children:T}),e.jsxs("span",{className:"room-badge-you",children:["You're playing as ",e.jsx("strong",{children:"X"})]})]}),e.jsx("button",{className:"copy-btn",onClick:xe,children:oe})]}),e.jsxs("div",{className:"waiting-page",children:[e.jsx("div",{className:"waiting-spinner"}),e.jsx("div",{className:"waiting-note",children:"Waiting for your opponent to join…"})]})]})]});const E=c==="online-playing",ue=E?de:!0;return e.jsxs("div",{className:"ttt-app",children:[_,e.jsxs("div",{className:"sheet",children:[U,e.jsx("div",{className:"back-row",children:e.jsx("button",{className:"back-btn",onClick:K,children:E?"← Leave room":"← Back"})}),e.jsx("h1",{children:"Tic-Tac-Toe"}),e.jsx("div",{className:"subtitle",children:E?"playing online — first to three in a row wins the round":"pass & play — first to three in a row wins the round"}),E?e.jsxs("div",{className:"room-badge",children:[e.jsxs("div",{className:"room-badge-left",children:[e.jsx("span",{className:"room-badge-label",children:"Room code"}),e.jsx("span",{className:"room-badge-code",children:T}),e.jsxs("span",{className:"room-badge-you",children:["You're playing as ",e.jsx("strong",{children:R})," (",v[R]||"you",")"]})]}),e.jsx("button",{className:"copy-btn",onClick:xe,children:oe})]}):e.jsxs("div",{className:"names-row",children:[e.jsxs("div",{className:"name-field",children:[e.jsx("span",{className:"name-swatch",style:{background:"var(--x)"}}),e.jsx("input",{className:"name-input",value:v.X,maxLength:16,onChange:n=>j(t=>({...t,X:n.target.value||"Player X"}))})]}),e.jsx("span",{className:"vs",children:"vs"}),e.jsxs("div",{className:"name-field",children:[e.jsx("span",{className:"name-swatch",style:{background:"var(--o)"}}),e.jsx("input",{className:"name-input",value:v.O,maxLength:16,onChange:n=>j(t=>({...t,O:n.target.value||"Player O"}))})]})]}),e.jsxs("div",{className:"score-row",children:[e.jsxs("div",{className:"score-cell",children:[e.jsx("div",{className:"score-num x",children:y.X}),e.jsx("div",{className:"score-label",children:v.X})]}),e.jsx("div",{className:"score-div"}),e.jsxs("div",{className:"score-cell",children:[e.jsx("div",{className:"score-num",style:{color:"var(--ink-soft)"},children:y.draws}),e.jsx("div",{className:"score-label",children:"Draws"})]}),e.jsx("div",{className:"score-div"}),e.jsxs("div",{className:"score-cell",children:[e.jsx("div",{className:"score-num o",children:y.O}),e.jsx("div",{className:"score-label",children:v.O})]})]}),e.jsxs("div",{className:"status-row",children:[!Y&&e.jsx("span",{className:"status-dot",style:{background:d==="X"?"var(--x)":"var(--o)"}}),e.jsx("span",{children:W})]}),e.jsxs("div",{className:"board-wrap",children:[e.jsx("div",{className:"board"+(ue?"":" locked"),children:m.map((n,t)=>{const a=l&&l.line.includes(t),o=!!n||Y||!ue||E&&R!==d;return e.jsxs("button",{className:"cell",disabled:o,onClick:()=>ke(t),"aria-label":`Cell ${t+1}${n?`, ${n}`:", empty"}`,children:[n==="X"&&e.jsxs("svg",{className:"mark",viewBox:"0 0 100 100",style:{transform:`rotate(${he[t]}deg)`},children:[e.jsx("line",{x1:"18",y1:"18",x2:"82",y2:"82",stroke:"var(--x)",strokeWidth:"11",strokeLinecap:"round",opacity:a||!l?1:.35}),e.jsx("line",{x1:"82",y1:"18",x2:"18",y2:"82",stroke:"var(--x)",strokeWidth:"11",strokeLinecap:"round",opacity:a||!l?1:.35})]}),n==="O"&&e.jsx("svg",{className:"mark",viewBox:"0 0 100 100",style:{transform:`rotate(${he[t]}deg)`},children:e.jsx("circle",{cx:"50",cy:"50",r:"34",fill:"none",stroke:"var(--o)",strokeWidth:"11",strokeLinecap:"round",opacity:a||!l?1:.35})})]},t)})}),P&&e.jsx("svg",{className:"win-overlay",viewBox:"0 0 100 100",preserveAspectRatio:"none",children:(()=>{const n=l.mark==="X"?"var(--x-dk)":"var(--o-dk)",t=l.mark==="X"?"var(--x)":"var(--o)";return e.jsxs("g",{children:[e.jsx("path",{d:Q,className:"win-glow",fill:"none",stroke:t,strokeWidth:"7",strokeLinecap:"round",style:{strokeDasharray:I,strokeDashoffset:I}}),e.jsx("path",{d:Q,className:"win-core",fill:"none",stroke:n,strokeWidth:"3.4",strokeLinecap:"round",style:{strokeDasharray:I,strokeDashoffset:I}}),e.jsx("circle",{className:"win-dot",cx:P.start.x,cy:P.start.y,r:"2.1",fill:n}),e.jsx("circle",{className:"win-dot",cx:P.end.x,cy:P.end.y,r:"2.1",fill:n})]},l.line.join(","))})()})]}),e.jsxs("div",{className:"btn-row",children:[e.jsx("button",{className:"btn btn-primary",onClick:we,children:Y?"Next Round":"Restart Round"}),e.jsx("button",{className:"btn btn-ghost",onClick:je,children:"Reset Match"})]}),e.jsx("div",{className:"history-row",children:D.map((n,t)=>e.jsx("span",{className:"history-chip "+(n.type==="draw"?"draw":n.mark.toLowerCase()),title:n.type==="draw"?"Draw":`${n.mark} won`},t))})]})]})}export{Be as default};
