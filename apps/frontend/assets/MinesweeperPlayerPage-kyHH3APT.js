import{r,j as i}from"./react-vendor-gyK15t0p.js";const je={1:"#8ecdfb",2:"#7ee0b8",3:"#ff8fa3",4:"#c084fc",5:"#ffd166",6:"#6fe3d6",7:"#f4e9ff",8:"#b79ad1"},Ce=[{key:"easy",label:"Easy",sub:"9×9, 10 mines",cols:9,rows:9,mines:10,accent:"#34d399"},{key:"medium",label:"Medium",sub:"16×16, 40 mines",cols:16,rows:16,mines:40,accent:"#60a5fa"},{key:"hard",label:"Hard",sub:"20×16, 70 mines",cols:16,rows:20,mines:70,accent:"#fb7185"}],ee=3,te=8;function ae(l,m){const n=[];for(let T=0;T<l;T++){const u=[];for(let g=0;g<m;g++)u.push({mine:!1,revealed:!1,flagged:!1,adj:0});n.push(u)}return n}function X(l){return l.map(m=>m.map(n=>({...n})))}function Me(l,m,n,T,u,g){let j=0;for(;j<T;){const f=Math.floor(Math.random()*m),x=Math.floor(Math.random()*n);l[f][x].mine||Math.abs(f-u)<=1&&Math.abs(x-g)<=1||(l[f][x].mine=!0,j++)}for(let f=0;f<m;f++)for(let x=0;x<n;x++){if(l[f][x].mine)continue;let R=0;for(let b=-1;b<=1;b++)for(let v=-1;v<=1;v++){if(b===0&&v===0)continue;const k=f+b,w=x+v;k>=0&&k<m&&w>=0&&w<n&&l[k][w].mine&&R++}l[f][x].adj=R}return l}function Ae(l,m,n,T,u){const g=[[m,n]];let j=0;for(;g.length;){const[f,x]=g.pop(),R=l[f][x];if(!(R.revealed||R.flagged)&&(R.revealed=!0,j++,R.adj===0))for(let b=-1;b<=1;b++)for(let v=-1;v<=1;v++){if(b===0&&v===0)continue;const k=f+b,w=x+v;k>=0&&k<T&&w>=0&&w<u&&!l[k][w].revealed&&!l[k][w].mine&&g.push([k,w])}}return j}function Se(l){for(let m=0;m<l.length;m++)for(let n=0;n<l[0].length;n++)l[m][n].mine&&(l[m][n].revealed=!0)}function ze(){const l=[];for(let n=0;n<12;n++){const T=Math.PI*2*n/12+(Math.random()*.4-.2),u=26+Math.random()*30,g=Math.cos(T)*u,j=Math.sin(T)*u,f=3+Math.random()*4,x=500+Math.random()*200;l.push({id:n,dx:g,dy:j,size:f,duration:x,color:Math.random()>.5?"#ff8c3d":"#ffdd8a"})}return l}function Ne(){const[l,m]=r.useState("menu"),[n,T]=r.useState({cols:9,rows:9,mines:10}),[u,g]=r.useState(()=>ae(9,9)),[j,f]=r.useState(0),[x,R]=r.useState(0),[b,v]=r.useState(!1),[k,w]=r.useState(!1),[ne,_]=r.useState(0),[B,re]=r.useState(!0),[se,F]=r.useState(!1),[oe,W]=r.useState(!1),[D,$]=r.useState(null),[P,ie]=r.useState(()=>({w:typeof window<"u"?window.innerWidth:390,h:typeof window<"u"?window.innerHeight:800})),le=r.useRef(null),ce=r.useRef(null);r.useEffect(()=>{const e=()=>{ie({w:window.innerWidth,h:window.innerHeight})};return window.addEventListener("resize",e),window.addEventListener("orientationchange",e),()=>{window.removeEventListener("resize",e),window.removeEventListener("orientationchange",e)}},[]),r.useEffect(()=>{let e=document.querySelector('meta[name="viewport"]');const t=!e,a=e?e.getAttribute("content"):null;return e||(e=document.createElement("meta"),e.name="viewport",document.head.appendChild(e)),e.setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"),()=>{t?e.remove():a!==null&&e.setAttribute("content",a)}},[]);const L=r.useRef(!0),S=r.useRef(null),V=r.useRef(B),y=r.useRef(null),z=r.useRef(null),C=r.useRef(null),Y=r.useRef(!1),H=r.useRef({x:0,y:0});r.useEffect(()=>{V.current=B},[B]),r.useEffect(()=>()=>clearInterval(S.current),[]);const E=r.useCallback(()=>{if(!y.current){const e=window.AudioContext||window.webkitAudioContext;if(e&&(y.current=new e),y.current){const t=y.current,a=t.createDynamicsCompressor();a.threshold.setValueAtTime(-12,t.currentTime),a.knee.setValueAtTime(18,t.currentTime),a.ratio.setValueAtTime(6,t.currentTime),a.attack.setValueAtTime(.003,t.currentTime),a.release.setValueAtTime(.25,t.currentTime);const s=t.createGain();s.gain.setValueAtTime(1.6,t.currentTime),s.connect(a),a.connect(t.destination),z.current=s}}y.current&&y.current.state==="suspended"&&y.current.resume()},[]),M=r.useCallback((e,t,a,s,d)=>{if(!V.current||!y.current)return;const h=y.current,p=h.currentTime+(d||0),c=h.createOscillator(),o=h.createGain();c.type=a||"sine",c.frequency.setValueAtTime(e,p),o.gain.setValueAtTime(0,p),o.gain.linearRampToValueAtTime(s||.55,p+.01),o.gain.exponentialRampToValueAtTime(.001,p+t),c.connect(o),o.connect(z.current),c.start(p),c.stop(p+t+.02)},[]),de=r.useCallback(()=>M(520,.09,"sine",.55),[M]),pe=r.useCallback(()=>M(660,.07,"square",.45),[M]),me=r.useCallback(()=>{if(!V.current||!y.current)return;const e=y.current,t=e.currentTime,a=e.createOscillator(),s=e.createGain();a.type="sine",a.frequency.setValueAtTime(160,t),a.frequency.exponentialRampToValueAtTime(35,t+.35),s.gain.setValueAtTime(1.3,t),s.gain.exponentialRampToValueAtTime(.001,t+.55),a.connect(s),s.connect(z.current),a.start(t),a.stop(t+.6);const d=e.sampleRate*.6,h=e.createBuffer(1,d,e.sampleRate),p=h.getChannelData(0);for(let A=0;A<d;A++)p[A]=(Math.random()*2-1)*Math.pow(1-A/d,1.6);const c=e.createBufferSource();c.buffer=h;const o=e.createBiquadFilter();o.type="lowpass",o.frequency.setValueAtTime(1200,t),o.frequency.exponentialRampToValueAtTime(200,t+.5);const I=e.createGain();I.gain.setValueAtTime(1.2,t),I.gain.exponentialRampToValueAtTime(.001,t+.55),c.connect(o),o.connect(I),I.connect(z.current),c.start(t);const Q=e.createBuffer(1,e.sampleRate*.05,e.sampleRate),Z=Q.getChannelData(0);for(let A=0;A<Z.length;A++)Z[A]=Math.random()*2-1;const U=e.createBufferSource();U.buffer=Q;const O=e.createGain();O.gain.setValueAtTime(1,t),O.gain.exponentialRampToValueAtTime(.001,t+.06),U.connect(O),O.connect(z.current),U.start(t)},[]),fe=r.useCallback(()=>{[523,659,784,1046].forEach((e,t)=>M(e,.2,"triangle",.5,t*.11))},[M]),ue=r.useCallback(()=>{if(!V.current||!y.current)return;const e=y.current,t=e.currentTime,a=e.createDelay();a.delayTime.setValueAtTime(.17,t);const s=e.createGain();s.gain.setValueAtTime(.3,t);const d=e.createGain();d.gain.setValueAtTime(.35,t),a.connect(s),s.connect(a),a.connect(d),d.connect(z.current),[{freq:880,gain:.42},{freq:1320,gain:.16},{freq:1760,gain:.08}].forEach(p=>{const c=e.createOscillator(),o=e.createGain();c.type="sine",c.frequency.setValueAtTime(p.freq,t),o.gain.setValueAtTime(1e-4,t),o.gain.linearRampToValueAtTime(p.gain,t+.006),o.gain.exponentialRampToValueAtTime(1e-4,t+.5),c.connect(o),o.connect(z.current),o.connect(a),c.start(t),c.stop(t+.55)})},[]),xe=r.useCallback(()=>{M(880,.05,"sine",.35)},[M]),G=r.useCallback(e=>{V.current&&navigator.vibrate&&navigator.vibrate(e)},[]),ge=r.useCallback((e,t)=>{F(!0),setTimeout(()=>F(!1),500),W(!0),setTimeout(()=>W(!1),550),$({r:e,c:t,particles:ze()}),setTimeout(()=>$(null),750)},[]),he=r.useCallback(()=>{clearInterval(S.current),S.current=setInterval(()=>{_(e=>e+1)},1e3)},[]),J=r.useCallback((e,t,a)=>{E(),clearInterval(S.current),T({cols:e,rows:t,mines:a}),_(0),v(!1),w(!1),f(0),R(0),$(null),F(!1),W(!1),L.current=!0,g(ae(t,e)),m("game")},[E]),be=(e,t)=>{if(b)return;E();const a=u[e][t];if(a.flagged||a.revealed)return;let s=u;L.current&&(s=Me(X(u),n.rows,n.cols,n.mines,e,t),L.current=!1,he());const d=X(s),h=d[e][t];if(h.mine){h.revealed=!0,Se(d),g(d),me(),G([100,50,100,50,150]),clearInterval(S.current),v(!0),w(!1),ge(e,t);return}de(),G(15);const p=Ae(d,e,t,n.rows,n.cols);g(d),f(c=>{const o=c+p;return o===n.rows*n.cols-n.mines&&(fe(),G([50,40,50,40,100]),clearInterval(S.current),v(!0),w(!0)),o})},K=(e,t)=>{if(b||(E(),u[e][t].revealed))return;const s=X(u);s[e][t].flagged=!s[e][t].flagged,g(s),R(d=>d+(s[e][t].flagged?1:-1)),pe(),G(20)},ve=(e,t,a)=>{Y.current=!1;const s=a.touches&&a.touches[0];H.current=s?{x:s.clientX,y:s.clientY}:{x:0,y:0},C.current=setTimeout(()=>{Y.current||K(e,t),C.current=null},450)},we=e=>{const t=e.touches&&e.touches[0];if(!t)return;const a=t.clientX-H.current.x,s=t.clientY-H.current.y;Math.hypot(a,s)>10&&(Y.current=!0,C.current&&(clearTimeout(C.current),C.current=null))},ye=()=>{C.current&&(clearTimeout(C.current),C.current=null)},ke=()=>{clearInterval(S.current),m("menu")},Te=b?k?"😎":"💥":"🙂",N=P.w<=480,q=r.useMemo(()=>{const e=n.cols>12?N?24:30:N?30:38,t=N?16:24,s=Math.min(P.w-(N?16:32),460)-t*2-te*2-(n.cols-1)*ee,d=Math.floor(s/n.cols),h=N?190:210,p=P.h-h,c=Math.floor((p-te*2-(n.rows-1)*ee)/n.rows),o=Math.min(e,d,c);return Math.max(14,o)},[P,n,N]),Re=n.mines-x;return i.jsxs("div",{className:"ms-body",children:[i.jsx("style",{children:Ve}),i.jsx("div",{className:`ms-flash-overlay ${oe?"play":""}`}),i.jsxs("div",{className:`ms-panel ${se?"shake":""}`,ref:le,children:[l==="menu"&&i.jsxs("div",{className:"ms-menu",children:[i.jsx("div",{children:"Choose a difficulty"}),i.jsx("div",{className:"ms-menu-buttons",children:Ce.map(e=>i.jsxs("button",{className:"ms-diff",style:{"--diff-accent":e.accent},onClick:()=>{E(),ue(),G(15),J(e.cols,e.rows,e.mines)},children:[e.label,i.jsx("span",{children:e.sub})]},e.key))}),i.jsxs("label",{className:"ms-sound-label",children:[i.jsx("input",{type:"checkbox",checked:B,onChange:e=>{const t=e.target.checked;E(),re(t),t&&(V.current=!0,xe())}}),"Sound & vibration"]})]}),l==="game"&&i.jsxs("div",{className:"ms-game-wrap",style:{display:"flex"},children:[i.jsxs("div",{className:"ms-hud",children:[i.jsxs("div",{children:["🚩 ",i.jsx("span",{children:Re})]}),i.jsx("button",{className:"ms-face",onClick:()=>J(n.cols,n.rows,n.mines),children:Te}),i.jsxs("div",{children:["⏱️ ",i.jsx("span",{children:ne})]})]}),i.jsx("div",{className:"ms-board-scroll",ref:ce,children:i.jsx("div",{className:"ms-board",style:{gridTemplateColumns:`repeat(${n.cols}, ${q}px)`},children:u.map((e,t)=>e.map((a,s)=>{const d=D&&D.r===t&&D.c===s,h={width:q,height:q,fontSize:q*.5};let p=null;const c=["ms-cell"];return a.revealed?(c.push("ms-cell-open"),a.mine?(c.push("ms-cell-mine"),p="💣"):a.adj>0&&(p=a.adj,h.color=je[a.adj]||"var(--text-primary)")):(c.push("ms-cell-closed"),a.flagged&&(p="🚩")),d&&c.push("blast-cell"),i.jsxs("div",{className:c.join(" "),style:h,onClick:()=>be(t,s),onContextMenu:o=>{o.preventDefault(),K(t,s)},onTouchStart:o=>ve(t,s,o),onTouchMove:we,onTouchEnd:ye,children:[p,d&&i.jsxs(i.Fragment,{children:[i.jsx("div",{className:"blast-ring"}),i.jsx("div",{className:"blast-core"}),D.particles.map(o=>i.jsx("div",{className:"blast-particle",style:{width:o.size,height:o.size,background:o.color,"--dx":`${o.dx}px`,"--dy":`${o.dy}px`,animation:`particleMove ${o.duration}ms cubic-bezier(0.2,0.7,0.3,1) forwards`}},o.id))]})]},`${t}-${s}`)}))})}),i.jsx("div",{className:"ms-status",children:b?k?"You cleared the board!":"Boom — game over.":""}),i.jsx("button",{className:"ms-change-diff",onClick:ke,children:"Change difficulty"})]})]})]})}const Ve=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Poppins:wght@500;600;700&display=swap');

.ms-body {
  --bg-deep: #0e0318;
  --bg-mid: #2a0a45;
  --velvet-1: #4a1470;
  --velvet-2: #2c0a4a;
  --velvet-3: #1b0630;
  --gold: #ffd166;
  --gold-deep: #c9932e;
  --gold-soft: rgba(255, 209, 102, 0.30);
  --accent-soft: rgba(192, 132, 252, 0.30);
  --text-primary: #f6ecff;
  --text-muted: #b79ad1;
  --cell-face: #3a1560;
  --cell-face-hi: #4d1f7e;
  --cell-open: #22093c;

  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse 800px 500px at 15% -5%, rgba(255,209,102,0.10), transparent 60%),
    radial-gradient(ellipse 900px 650px at 105% 105%, rgba(192,132,252,0.20), transparent 60%),
    linear-gradient(160deg, var(--bg-mid), var(--bg-deep) 60%);
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 20px;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  box-sizing: border-box;
  color: var(--text-primary);
  overscroll-behavior: contain;
}

.ms-body * { box-sizing: border-box; }

.ms-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 2rem 0 1.5rem;
  background:
    radial-gradient(ellipse 340px 160px at 28% 0%, rgba(255,255,255,0.10), transparent 55%),
    linear-gradient(150deg, var(--velvet-1) 0%, var(--velvet-2) 48%, var(--velvet-3) 100%);
  border-radius: 26px;
  width: 100%;
  max-width: min(460px, 96vw);
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.5),
    0 0 0 3px rgba(255,209,102,0.22),
    0 30px 70px -20px rgba(10, 0, 25, 0.85),
    inset 0 1px 0 rgba(255,255,255,0.08),
    0 0 50px -14px var(--accent-soft);
}

.ms-panel::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #fff2cf, var(--gold) 45%, var(--gold-deep));
  box-shadow: 0 0 0 3px var(--velvet-3), 0 0 18px rgba(255,209,102,0.65);
  border-radius: 4px;
}
.ms-panel::after {
  content: '';
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(255, 209, 102, 0.14);
  border-radius: 20px;
  pointer-events: none;
}

.ms-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0.6rem 1.2rem 1rem;
  width: 100%;
}
.ms-menu > div:first-child {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(17px, 5vw, 21px);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--text-primary);
  text-align: center;
}
.ms-menu > div:first-child::before,
.ms-menu > div:first-child::after {
  content: '';
  width: 26px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-soft));
  flex-shrink: 0;
}
.ms-menu > div:first-child::after { background: linear-gradient(270deg, transparent, var(--gold-soft)); }

.ms-menu-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.ms-diff {
  position: relative;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  padding: 13px 18px 11px;
  border-radius: 14px;
  border: 1px solid rgba(255,209,102,0.2);
  background:
    radial-gradient(ellipse 60px 30px at 30% 0%, rgba(255,255,255,0.16), transparent 60%),
    linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.12));
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: 0 0 0 1px var(--diff-accent, rgba(52,211,153,0.35)) inset, 0 6px 16px -8px var(--diff-accent, rgba(52,211,153,0.4));
  transition: border-color 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  flex: 1 1 130px;
  min-width: 118px;
  max-width: 160px;
}
.ms-diff::before {
  content: '◆';
  display: block;
  font-size: 11px;
  margin-bottom: 3px;
  color: var(--diff-accent, #34d399);
}
.ms-diff:hover {
  border-color: var(--gold-soft);
  transform: translateY(-2px);
}
.ms-diff:active { transform: translateY(0) scale(0.98); }
.ms-diff span {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  letter-spacing: 0.02em;
}

.ms-sound-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
  letter-spacing: 0.02em;
}
.ms-sound-label input {
  accent-color: var(--gold);
  width: 16px;
  height: 16px;
}

.ms-game-wrap {
  position: relative;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 0 1.2rem 1.2rem;
  width: 100%;
  box-sizing: border-box;
}

.ms-hud {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 360px;
  align-items: center;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ms-hud > div {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15));
  border: 1px solid rgba(255,209,102,0.22);
  padding: 6px 12px;
  border-radius: 999px;
  white-space: nowrap;
}
.ms-hud span {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--gold);
  letter-spacing: 0.02em;
  text-shadow: 0 0 14px var(--gold-soft);
}

.ms-face {
  font-size: 20px;
  line-height: 1;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,209,102,0.3);
  background:
    radial-gradient(ellipse 20px 12px at 30% 20%, rgba(255,255,255,0.35), transparent 60%),
    linear-gradient(160deg, #6a2a9e, #3d1160);
  cursor: pointer;
  box-shadow: 0 4px 12px -4px rgba(0,0,0,0.5);
  transition: transform 0.12s ease, border-color 0.18s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.ms-face:hover { border-color: var(--gold); transform: scale(1.06); }
.ms-face:active { transform: scale(0.94); }

.ms-board-scroll {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-bottom: 2px;
}

.ms-board {
  display: grid;
  gap: 3px;
  background: rgba(0,0,0,0.28);
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(255,209,102,0.16);
  box-shadow: inset 0 2px 12px rgba(0,0,0,0.5);
  width: max-content;
  margin: 0 auto;
  touch-action: manipulation;
}

.ms-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  touch-action: manipulation;
}
.ms-cell-closed {
  background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.14), transparent 55%), linear-gradient(160deg, var(--cell-face-hi), var(--cell-face));
  box-shadow: inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(255,209,102,0.06);
}
.ms-cell-open {
  background: var(--cell-open);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
}
.ms-cell-mine {
  background: linear-gradient(160deg, #4a1030, #2a0a1c) !important;
  box-shadow: inset 0 0 0 1px rgba(255,77,109,0.55), 0 0 16px rgba(255,77,109,0.4) !important;
}

.ms-status {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  min-height: 18px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.ms-change-diff {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255,209,102,0.2);
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  color: var(--text-muted);
  letter-spacing: 0.03em;
  transition: color 0.15s ease, border-color 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.ms-change-diff:hover { color: var(--text-primary); border-color: var(--gold-soft); }
.ms-change-diff:active { transform: scale(0.97); }

/* ---- blast effects ---- */
@keyframes ms-shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-6px, -3px); }
  20% { transform: translate(6px, 3px); }
  30% { transform: translate(-5px, 3px); }
  40% { transform: translate(5px, -3px); }
  50% { transform: translate(-4px, 2px); }
  60% { transform: translate(4px, -2px); }
  70% { transform: translate(-3px, 1px); }
  80% { transform: translate(3px, -1px); }
  90% { transform: translate(-1px, 1px); }
}
.ms-panel.shake { animation: ms-shake 0.45s ease; }

@keyframes ms-flashScreen {
  0% { opacity: 0.85; }
  100% { opacity: 0; }
}
.ms-flash-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,190,120,0.6) 40%, rgba(0,0,0,0) 75%);
  pointer-events: none;
  opacity: 0;
  z-index: 9999;
}
.ms-flash-overlay.play { animation: ms-flashScreen 0.5s ease-out forwards; }

.blast-cell { overflow: visible !important; }

@keyframes ringExpand {
  0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; border-width: 6px; }
  100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; border-width: 1px; }
}
.blast-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6px solid #ff7a3d;
  box-sizing: border-box;
  pointer-events: none;
  animation: ringExpand 0.5s ease-out forwards;
}

@keyframes coreFlash {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
  35% { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}
.blast-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background: radial-gradient(circle, #fff7e6 0%, #ffcf6b 30%, #ff7a3d 60%, rgba(255,80,20,0) 100%);
  pointer-events: none;
  animation: coreFlash 0.35s ease-out forwards;
  z-index: 2;
}

@keyframes particleMove {
  0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)); opacity: 0; }
}
.blast-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  pointer-events: none;
  z-index: 3;
}

/* ---- mobile responsive breakpoints ---- */
@media (max-width: 480px) {
  .ms-body { padding: 12px; }
  .ms-panel {
    padding: 1.5rem 0 1.1rem;
    border-radius: 20px;
    gap: 10px;
  }
  .ms-menu { padding: 0.4rem 0.8rem 0.8rem; gap: 12px; }
  .ms-game-wrap { padding: 0 0.7rem 0.9rem; gap: 10px; }
  .ms-diff { padding: 11px 12px 9px; font-size: 13px; min-width: 96px; }
  .ms-diff span { font-size: 10px; }
  .ms-hud { font-size: 10px; max-width: 100%; }
  .ms-hud > div { padding: 5px 10px; }
  .ms-hud span { font-size: 13px; }
  .ms-face { font-size: 18px; padding: 7px 10px; }
  .ms-status { font-size: 11px; }
  .ms-change-diff { font-size: 11px; padding: 7px 14px; }
}

@media (max-width: 360px) {
  .ms-diff { flex: 1 1 100%; max-width: none; }
}

@media (max-height: 700px) and (orientation: portrait) {
  .ms-panel { padding-top: 1rem; }
}

@media (orientation: landscape) and (max-height: 480px) {
  .ms-body { padding: 8px; align-items: flex-start; }
  .ms-panel { padding: 0.9rem 0 0.8rem; }
  .ms-menu { padding: 0.2rem 0.6rem 0.6rem; gap: 8px; }
  .ms-game-wrap { padding: 0 0.6rem 0.6rem; gap: 8px; }
}

@media (hover: none) {
  .ms-diff:hover, .ms-face:hover, .ms-change-diff:hover { border-color: inherit; }
}
`;export{Ne as default};
