import{r as i,j as e}from"./react-vendor-gyK15t0p.js";const A=6,S=7,I=0,v=1,H=2,Z=[3,2,4,1,5,0,6],he="connect4_scores_v1",ge="connect4_muted_v1";function be(){return Array.from({length:A},()=>Array(S).fill(I))}function $e(t){return t.map(r=>r.slice())}function ue(t){const r=[];for(let a=0;a<S;a++)t[0][a]===I&&r.push(a);return r}function ye(t,r){for(let a=A-1;a>=0;a--)if(t[a][r]===I)return a;return-1}function K(t,r,a){const n=ye(t,r);if(n===-1)return null;const u=$e(t);return u[n][r]=a,{board:u,row:n}}function Le(t){return t[0].every(r=>r!==I)}function P(t,r,a,n){const u=[[[0,1],[0,-1]],[[1,0],[-1,0]],[[1,1],[-1,-1]],[[1,-1],[-1,1]]];for(const[x,o]of u){const l=[[r,a]];for(const[f,p]of[x,o]){let g=r+f,d=a+p;for(;g>=0&&g<A&&d>=0&&d<S&&t[g][d]===n;)l.push([g,d]),g+=f,d+=p}if(l.length>=4)return l}return null}function re(t,r){for(const a of Z){const n=K(t,a,r);if(n&&P(n.board,n.row,a,r))return a}return null}function ne(t,r,a){let n=0,u=0,x=0;for(const o of t)o===r?n++:o===a?u++:x++;return n>0&&u>0?0:n===4?1e5:n===3&&x===1?120:n===2&&x===2?12:u===4?-1e5:u===3&&x===1?-150:u===2&&x===2?-10:0}function De(t,r,a){let n=0;const u=Math.floor(S/2);let x=0;for(let o=0;o<A;o++)t[o][u]===r&&x++;n+=x*6;for(let o=0;o<A;o++)for(let l=0;l<=S-4;l++){const f=[t[o][l],t[o][l+1],t[o][l+2],t[o][l+3]];n+=ne(f,r,a)}for(let o=0;o<S;o++)for(let l=0;l<=A-4;l++){const f=[t[l][o],t[l+1][o],t[l+2][o],t[l+3][o]];n+=ne(f,r,a)}for(let o=0;o<=A-4;o++)for(let l=0;l<=S-4;l++){const f=[t[o][l],t[o+1][l+1],t[o+2][l+2],t[o+3][l+3]];n+=ne(f,r,a)}for(let o=3;o<A;o++)for(let l=0;l<=S-4;l++){const f=[t[o][l],t[o-1][l+1],t[o-2][l+2],t[o-3][l+3]];n+=ne(f,r,a)}return n}function pe(t,r,a,n,u,x,o){const l=ue(t).sort((p,g)=>Z.indexOf(p)-Z.indexOf(g));if(l.length===0)return 0;if(r===0)return De(t,x,o);const f=u?x:o;if(u){let p=-1/0;for(const g of l){const d=K(t,g,f);if(!d)continue;const b=P(d.board,d.row,g,f);let k;if(b?k=1e6+r*1e3:k=pe(d.board,r-1,a,n,!1,x,o),p=Math.max(p,k),a=Math.max(a,k),a>=n)break}return p}else{let p=1/0;for(const g of l){const d=K(t,g,f);if(!d)continue;const b=P(d.board,d.row,g,f);let k;if(b?k=-1e6-r*1e3:k=pe(d.board,r-1,a,n,!0,x,o),p=Math.min(p,k),n=Math.min(n,k),a>=n)break}return p}}function Oe(t,r,a,n){let u=-1/0,x=null,o=-1/0;const l=1/0,f=ue(t).sort((p,g)=>Z.indexOf(p)-Z.indexOf(g));for(const p of f){const g=K(t,p,a);if(!g)continue;const b=P(g.board,g.row,p,a)?1e6+r*1e3:pe(g.board,r-1,o,l,!1,a,n);b>u&&(u=b,x=p),o=Math.max(o,b)}return x!==null?x:f[0]}function Be(t,r,a,n){const u=ue(t);if(u.length===0)return null;if(r==="easy"){if(Math.random()<.3){const p=re(t,a);if(p!==null)return p;const g=re(t,n);if(g!==null)return g}return u[Math.floor(Math.random()*u.length)]}const x=re(t,a);if(x!==null)return x;const o=re(t,n);return o!==null?o:Oe(t,r==="hard"?6:3,a,n)}const Fe="/audio/leberch-funny-playful-262598.mp3";function Ve(t){const r=i.useRef(null),a=i.useRef(null),n=i.useRef(null),u=i.useRef(t);u.current=t;const x=i.useCallback(()=>{if(!n.current){const b=new Audio(Fe);b.loop=!0,b.volume=.45,n.current=b}const d=n.current;u.current?d.pause():d.paused&&d.play().catch(()=>{})},[]);i.useEffect(()=>{n.current&&(t?n.current.pause():n.current.play().catch(()=>{}))},[t]),i.useEffect(()=>()=>{n.current&&(n.current.pause(),n.current=null)},[]);const o=i.useCallback(d=>{if(!a.current){const k=d.createBuffer(1,d.sampleRate*3,d.sampleRate),Y=k.getChannelData(0);let m=0;for(let T=0;T<Y.length;T++){const j=Math.random()*2-1;m=(m+.018*j)/1.018,Y[T]=m*3.2}a.current=k}return a.current},[]),l=i.useCallback(()=>{if(!r.current){const d=window.AudioContext||window.webkitAudioContext;d&&(r.current=new d)}return r.current&&r.current.state==="suspended"&&r.current.resume(),x(),r.current},[x]),f=i.useCallback((d,b,{type:k="sine",volume:Y=.18,delay:m=0,glideTo:T=null}={})=>{if(u.current)return;const j=l();if(!j)return;const M=j.currentTime+m,y=j.createOscillator(),N=j.createGain();y.type=k,y.frequency.setValueAtTime(d,M),T&&y.frequency.exponentialRampToValueAtTime(T,M+b),N.gain.setValueAtTime(0,M),N.gain.linearRampToValueAtTime(Y,M+.012),N.gain.exponentialRampToValueAtTime(1e-4,M+b),y.connect(N),N.connect(j.destination),y.start(M),y.stop(M+b+.02)},[l]),p=i.useCallback((d,{volume:b=.12,delay:k=0,freq:Y=900,freqEnd:m=null,q:T=1}={})=>{if(u.current)return;const j=l(),M=o(j);if(!j||!M)return;const y=j.currentTime+k,N=j.createBufferSource();N.buffer=M,N.loop=!0;const R=j.createBiquadFilter();R.type="bandpass",R.frequency.setValueAtTime(Y,y),m&&R.frequency.exponentialRampToValueAtTime(m,y+d),R.Q.value=T;const z=j.createGain();z.gain.setValueAtTime(0,y),z.gain.linearRampToValueAtTime(b,y+.02),z.gain.exponentialRampToValueAtTime(1e-4,y+d),N.connect(R),R.connect(z),z.connect(j.destination),N.start(y),N.stop(y+d+.05)},[l,o]);return i.useMemo(()=>({setMusicVolume:d=>{n.current&&(n.current.volume=d)},drop:()=>{f(400,.12,{type:"triangle",volume:.1,glideTo:600}),p(.18,{volume:.06,freq:1800,freqEnd:800,q:.8})},land:()=>{f(523.25,.18,{type:"sine",volume:.18}),f(659.25,.15,{type:"sine",volume:.12,delay:.06}),p(.2,{volume:.08,freq:1200,freqEnd:400,q:.7,delay:.01})},click:()=>{f(880,.05,{type:"triangle",volume:.1,glideTo:1200}),p(.04,{volume:.04,freq:2800,freqEnd:1800,q:2.5})},hover:()=>f(1100,.025,{type:"sine",volume:.03}),win:()=>{[523.25,659.25,783.99,1046.5,1318.5,1567.98].forEach((d,b)=>f(d,.28,{type:"triangle",volume:.16,delay:b*.08})),p(.6,{volume:.04,freq:3e3,freqEnd:7e3,q:.3,delay:.06})},draw:()=>{[440,392,349.23].forEach((d,b)=>f(d,.28,{type:"sine",volume:.12,delay:b*.11})),p(.35,{volume:.04,freq:600,freqEnd:300,q:.6,delay:.08})}}),[f,p])}function V(t){if(typeof navigator<"u"&&navigator.vibrate)try{navigator.vibrate(t)}catch{}}function we(){return e.jsxs("svg",{viewBox:"0 0 50 80",className:"space-rocket",children:[e.jsx("path",{d:"M25 2 C 25 2 18 18 18 40 L32 40 C32 18 25 2 25 2 Z",className:"body"}),e.jsx("path",{d:"M18 40 L12 60 L20 52 Z",className:"fin"}),e.jsx("path",{d:"M32 40 L38 60 L30 52 Z",className:"fin"}),e.jsx("circle",{cx:"25",cy:"30",r:"4",className:"window"}),e.jsx("path",{d:"M20 52 L25 72 L30 52 Z",className:"flame"})]})}function oe({ring:t}){return e.jsxs("svg",{viewBox:"0 0 60 60",className:`space-planet ${t?"has-ring":""}`,children:[e.jsx("circle",{cx:"30",cy:"30",r:"22",className:"body"}),e.jsx("ellipse",{cx:"30",cy:"30",rx:"32",ry:"8",className:"ring"}),e.jsx("circle",{cx:"22",cy:"24",r:"3",className:"crater"}),e.jsx("circle",{cx:"36",cy:"34",r:"2",className:"crater"}),e.jsx("circle",{cx:"28",cy:"38",r:"1.5",className:"crater"})]})}function X(){return e.jsxs("svg",{viewBox:"0 0 40 40",className:"space-asteroid",children:[e.jsx("polygon",{points:"20,2 32,8 38,20 34,34 20,38 8,34 2,20 8,8",className:"body"}),e.jsx("circle",{cx:"14",cy:"14",r:"3",className:"crater"}),e.jsx("circle",{cx:"26",cy:"22",r:"2",className:"crater"}),e.jsx("circle",{cx:"18",cy:"30",r:"2.5",className:"crater"})]})}function Ie(){return e.jsxs("svg",{viewBox:"0 0 70 50",className:"space-ufo",children:[e.jsx("ellipse",{cx:"35",cy:"32",rx:"30",ry:"10",className:"dome-base"}),e.jsx("path",{d:"M20 32 C20 18 50 18 50 32",className:"dome"}),e.jsx("circle",{cx:"20",cy:"34",r:"3",className:"light light-1"}),e.jsx("circle",{cx:"35",cy:"38",r:"3",className:"light light-2"}),e.jsx("circle",{cx:"50",cy:"34",r:"3",className:"light light-3"}),e.jsx("circle",{cx:"35",cy:"24",r:"5",className:"eye"})]})}function qe(){const t=i.useMemo(()=>Array.from({length:60},(r,a)=>({id:a,left:Math.random()*100,top:Math.random()*100,size:1+Math.random()*3,duration:2+Math.random()*4,delay:Math.random()*-5})),[]);return e.jsxs("div",{className:"space-scene","aria-hidden":"true",children:[e.jsx("div",{className:"space-nebula"}),t.map(r=>e.jsx("span",{className:"space-star",style:{left:`${r.left}%`,top:`${r.top}%`,width:r.size,height:r.size,animationDuration:`${r.duration}s`,animationDelay:`${r.delay}s`}},r.id)),e.jsx("div",{className:"space-obj rocket-1",children:e.jsx(we,{})}),e.jsx("div",{className:"space-obj rocket-2",children:e.jsx(we,{})}),e.jsx("div",{className:"space-obj planet-1",children:e.jsx(oe,{ring:!0})}),e.jsx("div",{className:"space-obj planet-2",children:e.jsx(oe,{})}),e.jsx("div",{className:"space-obj planet-3",children:e.jsx(oe,{ring:!0})}),e.jsx("div",{className:"space-obj asteroid-1",children:e.jsx(X,{})}),e.jsx("div",{className:"space-obj asteroid-2",children:e.jsx(X,{})}),e.jsx("div",{className:"space-obj asteroid-3",children:e.jsx(X,{})}),e.jsx("div",{className:"space-obj ufo-1",children:e.jsx(Ie,{})})]})}function _e({player:t,isFalling:r,fallRows:a,isWinning:n,delay:u=0}){const x=t===v?"disc-red":"disc-yellow",o={};return r&&(o["--fall-rows"]=a,o["--fall-duration"]=`${Math.min(.36+a*.055,.75)}s`),n&&(o.animationDelay=`${u}ms`),e.jsx("div",{className:["disc",x,r?"disc-falling":"",n?"disc-winning":""].join(" "),style:o,children:e.jsx("span",{className:"disc-shine"})})}function Ue({active:t}){const r=i.useMemo(()=>{const a=["#ff5d55","#ffd23f","#4fd8f0","#7dff8b","#c07bff","#ff9ecf"];return Array.from({length:70},(n,u)=>({id:u,left:Math.random()*100,color:a[u%a.length],delay:Math.random()*.6,duration:2.4+Math.random()*1.6,size:6+Math.random()*7,rotate:Math.random()*360,drift:(Math.random()-.5)*160,shape:Math.random()>.5?"50%":"3px"}))},[t]);return t?e.jsx("div",{className:"confetti-layer","aria-hidden":"true",children:r.map(a=>e.jsx("span",{className:"confetti-piece",style:{left:`${a.left}%`,backgroundColor:a.color,animationDelay:`${a.delay}s`,animationDuration:`${a.duration}s`,width:a.size,height:a.size,borderRadius:a.shape,transform:`rotate(${a.rotate}deg)`,"--drift":`${a.drift}px`}},a.id))}):null}function He(){const[t,r]=i.useState(()=>{try{const c=JSON.parse(localStorage.getItem(he));if(c&&typeof c.p1=="number")return c}catch{}return{p1:0,p2:0,draws:0}}),[a]=i.useState(!0),[n,u]=i.useState(()=>{try{return localStorage.getItem(ge)==="true"}catch{return!1}}),[x,o]=i.useState(!0),[l,f]=i.useState(()=>be()),[p,g]=i.useState(v),[d,b]=i.useState("ai"),[k,Y]=i.useState("hard"),[m,T]=i.useState(null),[j,M]=i.useState([]),[y,N]=i.useState([]),[R,z]=i.useState(null),[$,ie]=i.useState(!1),[E,se]=i.useState(!1),[ve,le]=i.useState(!1),[O,q]=i.useState(null),[ke,je]=i.useState(!1),[Ne,_]=i.useState(!1),[B,ce]=i.useState(!0),[Ce,J]=i.useState(""),fe=i.useRef(0),U=i.useRef(null),W=i.useRef(null),w=Ve(n);i.useEffect(()=>{const c=setTimeout(()=>je(!0),120);return()=>clearTimeout(c)},[]),i.useEffect(()=>{try{localStorage.setItem(he,JSON.stringify(t))}catch{}},[t]),i.useEffect(()=>{try{localStorage.setItem(ge,String(n))}catch{}},[n]),i.useEffect(()=>()=>{U.current&&clearTimeout(U.current),W.current&&clearTimeout(W.current)},[]);const L=d==="ai"?"Computer":"Player 2",F=!m&&!$&&!E&&!B&&(d==="pvp"||p===v),de=i.useCallback(c=>{r(s=>c===v?{...s,p1:s.p1+1}:c===H?{...s,p2:s.p2+1}:{...s,draws:s.draws+1})},[]),xe=i.useCallback((c,s,h,C)=>{const G=P(c,s,h,C);if(G){M(G),T(C),de(C),w.setMusicVolume(.05),w.win(),V([40,30,40,30,80]),le(!0),J(`${C===v?"Red":L} wins the game!`),setTimeout(()=>_(!0),550),setTimeout(()=>le(!1),4200);return}if(Le(c)){T("draw"),de("draw"),w.setMusicVolume(.05),w.draw(),V([30,40,30]),J("It's a draw!"),setTimeout(()=>_(!0),400);return}const D=C===v?H:v;g(D),J(`${D===v?"Red's":`${L}'s`} turn`),d==="ai"&&D===H&&Me(c)},[d,L,w,de]),Q=i.useCallback((c,s,h)=>{const C=K(s,c,h);if(!C)return;const{board:G,row:D}=C;N(Ae=>[...Ae,{board:s,currentPlayer:h}]),fe.current+=1,z({row:D,col:c,player:h,moveId:fe.current}),f(G),ie(!0),w.drop(),V(12);const Ee=Math.min(360+D*55,750)+40;W.current=setTimeout(()=>{ie(!1),w.land(),V(18),xe(G,D,c,h)},Ee)},[xe,w]),Me=i.useCallback(c=>{se(!0);const s=480+Math.random()*420;U.current=setTimeout(()=>{const h=Be(c,k,H,v);se(!1),h!==null&&Q(h,c,H)},s)},[k,Q]),ee=i.useCallback(c=>{m||$||E||B||d==="ai"&&p!==v||ye(l,c)!==-1&&(w.click(),Q(c,l,p))},[l,p,d,E,$,Q,B,w,m]),te=i.useCallback(()=>{U.current&&clearTimeout(U.current),W.current&&clearTimeout(W.current),f(be()),g(v),T(null),M([]),N([]),z(null),ie(!1),se(!1),le(!1),_(!1),J("Red's turn"),w.setMusicVolume(.45),w.click(),V(10)},[w]),Se=i.useCallback(()=>{if(y.length===0||m||$||E)return;w.click(),V(10);const c=d==="ai"&&y.length>=2?2:1,s=y[y.length-c];N(h=>h.slice(0,h.length-c)),f(s.board),g(s.currentPlayer),z(null),T(null),M([]),_(!1)},[d,y,E,$,w,m]);i.useCallback(()=>{w.click(),r({p1:0,p2:0,draws:0})},[w]);const Te=i.useCallback(()=>{w.click(),ce(!0),_(!1)},[w]),me=i.useCallback(c=>{w.click(),b(c),ce(!1),te()},[w,te]);i.useEffect(()=>{function c(s){if(F){if(s.key>="1"&&s.key<="7"){const h=Number(s.key)-1;ee(h);return}s.key==="ArrowLeft"?q(h=>h===null?S-1:(h+S-1)%S):s.key==="ArrowRight"?q(h=>h===null?0:(h+1)%S):(s.key==="Enter"||s.key===" ")&&O!==null&&(s.preventDefault(),ee(O))}}return window.addEventListener("keydown",c),()=>window.removeEventListener("keydown",c)},[ee,O,F]);const Re=i.useCallback((c,s)=>j.some(([h,C])=>h===c&&C===s),[j]),ae=i.useCallback(c=>l[0][c]!==I,[l]),ze=m?m==="draw"?"It's a draw!":`${m===v?"Red":L} wins!`:E?"Computer is thinking…":`${p===v?"Red":L}'s turn`,Ye=a?"theme-dark":"theme-light";return e.jsxs("div",{className:`c4-app ${Ye} ${ke?"loaded":"loading"} ${x?"":"no-anim"}`,children:[e.jsx("style",{children:We}),e.jsx(qe,{}),e.jsx("div",{className:"sr-only","aria-live":"polite",children:Ce}),e.jsxs("div",{className:"score-badge badge-red",title:"Red score",children:[e.jsx("span",{className:"badge-shine","aria-hidden":"true"}),e.jsx("span",{className:"badge-value",children:t.p1}),e.jsx("span",{className:"badge-label",children:"Red"})]}),e.jsxs("div",{className:"score-badge badge-yellow",title:`${L} score`,children:[e.jsx("span",{className:"badge-shine","aria-hidden":"true"}),e.jsx("span",{className:"badge-value",children:t.p2}),e.jsx("span",{className:"badge-label",children:d==="ai"?"CPU":"P2"})]}),e.jsxs("div",{className:"c4-shell",children:[e.jsxs("header",{className:"topbar",children:[e.jsxs("p",{className:`turn-indicator ${m?"ended":""}`,"data-player":p,children:[e.jsx("span",{className:`turn-dot ${p===v?"dot-red":"dot-yellow"} ${E?"pulsing":""}`}),ze]}),e.jsxs("div",{className:"icon-btn-row",children:[e.jsx("button",{className:"icon-btn",onClick:Se,disabled:y.length===0||!!m||$||E||B,title:"Undo last move","aria-label":"Undo last move",children:"↺"}),e.jsx("button",{className:"icon-btn",onClick:()=>u(c=>!c),title:n?"Unmute sounds":"Mute sounds","aria-label":n?"Unmute sounds":"Mute sounds","aria-pressed":n,children:n?"🔇":"🔊"})]})]}),e.jsxs("main",{className:"board-area",children:[e.jsxs("div",{className:"board-wrapper",tabIndex:0,role:"grid","aria-label":"Connect four board, 7 columns by 6 rows",onKeyDown:()=>{},children:[e.jsx("div",{className:"drop-arrow-row",children:Array.from({length:S}).map((c,s)=>e.jsx("div",{className:"drop-arrow-cell",children:F&&!ae(s)&&e.jsx("span",{className:`drop-arrow ${O===s?"active":""} ${p===v?"arrow-red":"arrow-yellow"}`,children:"▼"})},s))}),e.jsxs("div",{className:"board",children:[e.jsx("div",{className:"column-layer",children:Array.from({length:S}).map((c,s)=>e.jsx("button",{type:"button",className:`column-btn ${O===s?"hovered":""}`,disabled:!F||ae(s),onMouseEnter:()=>{q(s),F&&w.hover()},onMouseLeave:()=>q(h=>h===s?null:h),onFocus:()=>q(s),onClick:()=>ee(s),"aria-label":`Drop disc in column ${s+1}${ae(s)?" (full)":""}`,children:F&&!ae(s)&&e.jsx("span",{className:`ghost-disc ${p===v?"ghost-red":"ghost-yellow"} ${O===s?"visible":""}`})},s))}),e.jsx("div",{className:"cells-grid",children:l.map((c,s)=>c.map((h,C)=>e.jsxs("div",{className:"cell",children:[e.jsx("div",{className:"hole"}),h!==I&&e.jsx(_e,{player:h,isFalling:R&&R.row===s&&R.col===C&&R.player===h&&$,fallRows:s+1,isWinning:!!m&&m!=="draw"&&Re(s,C),delay:(s+C)*40})]},`${s}-${C}`)))})]})]}),e.jsx(Ue,{active:ve})]}),e.jsxs("footer",{className:"bottom-bar",children:[e.jsx("button",{className:"bottom-btn",onClick:Te,children:"Menu"}),e.jsx("button",{className:"bottom-btn",onClick:te,children:"Restart"})]})]}),B&&e.jsx("div",{className:"welcome-overlay",role:"dialog","aria-modal":"true","aria-label":"Connect Four settings",children:e.jsxs("div",{className:"welcome-card",children:[e.jsx("button",{className:"welcome-close",onClick:()=>ce(!1),"aria-label":"Close",children:"×"}),e.jsxs("div",{className:"welcome-banner",children:[e.jsx("div",{className:"welcome-banner-rays"}),e.jsxs("h1",{className:"c4-title",children:[e.jsx("span",{className:"l-white",children:"C"}),e.jsx("span",{className:"l-red",children:"O"}),e.jsxs("span",{className:"l-blue arrow-letter",children:["N",e.jsx("span",{className:"mini-arrow mini-arrow-up",children:"▲"})]}),e.jsxs("span",{className:"l-yellow arrow-letter",children:["N",e.jsx("span",{className:"mini-arrow mini-arrow-down",children:"▼"})]}),e.jsx("span",{className:"l-white",children:"E"}),e.jsx("span",{className:"l-red",children:"C"}),e.jsx("span",{className:"l-blue",children:"T"})]}),e.jsxs("h1",{className:"c4-title c4-title-2",children:[e.jsx("span",{className:"l-white",children:"F"}),e.jsx("span",{className:"l-yellow",children:"O"}),e.jsx("span",{className:"l-red",children:"U"}),e.jsx("span",{className:"l-blue",children:"R"})]}),e.jsxs("div",{className:"welcome-banner-floor",children:[e.jsx("div",{style:{opacity:.6},children:e.jsx(X,{})}),e.jsx("div",{style:{opacity:.7},children:e.jsx(oe,{})}),e.jsx("div",{style:{opacity:.5},children:e.jsx(X,{})})]})]}),e.jsxs("div",{className:"welcome-body",children:[e.jsx("p",{children:"Use the arrow keys or buttons located below the gameboard to select a column indicated by the flashing arrow."}),e.jsx("p",{children:"Once you have chosen, press enter or click the column to drop your disc."}),e.jsx("p",{children:"The first player with four discs in a row, up, across, or diagonally, wins!"}),e.jsxs("div",{className:"welcome-controls",children:[e.jsxs("label",{className:"anim-toggle",children:[e.jsx("input",{type:"checkbox",checked:x,onChange:c=>o(c.target.checked)}),e.jsx("span",{className:"checkbox-box","aria-hidden":"true"}),"Animation"]}),e.jsxs("div",{className:"difficulty-control",children:[e.jsx("span",{className:"control-title",children:"Difficulty"}),e.jsx("div",{className:"difficulty-options",children:[{level:"easy",label:"Easy"},{level:"medium",label:"Medium"},{level:"hard",label:"Hard"}].map(({level:c,label:s})=>e.jsxs("label",{className:"difficulty-option",children:[e.jsx("span",{children:s}),e.jsx("input",{type:"radio",name:"difficulty",checked:k===c,onChange:()=>Y(c)}),e.jsx("span",{className:"radio-dot","aria-hidden":"true"})]},c))})]})]}),e.jsxs("div",{className:"welcome-actions",children:[e.jsx("button",{className:"welcome-btn btn-computer",onClick:()=>me("ai"),children:"Vs Computer"}),e.jsx("button",{className:"welcome-btn btn-player",onClick:()=>me("pvp"),children:"Vs Player"})]})]})]})}),m&&Ne&&!B&&e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true","aria-label":"Game result",children:e.jsxs("div",{className:`overlay-card ${m==="draw"?"draw-result":m===v?"win-red-result":"win-yellow-result"}`,children:[m==="draw"?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"overlay-icon draw-icon",children:e.jsxs("svg",{width:"36",height:"36",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M8 15h8"}),e.jsx("path",{d:"M9 9h.01"}),e.jsx("path",{d:"M15 9h.01"})]})}),e.jsx("h2",{children:"It's a draw!"}),e.jsx("p",{children:"The board is full — nobody takes this one."})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"overlay-icon trophy-icon",children:e.jsxs("svg",{width:"36",height:"36",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6"}),e.jsx("path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18"}),e.jsx("path",{d:"M4 22h16"}),e.jsx("path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"}),e.jsx("path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"}),e.jsx("path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z"})]})}),e.jsxs("h2",{children:[e.jsx("span",{className:m===v?"text-red":"text-yellow",children:m===v?"Red":L})," ","wins!"]}),e.jsxs("p",{children:[m===v?t.p1:t.p2," total win",(m===v?t.p1:t.p2)===1?"":"s"," so far."]})]}),e.jsx("div",{className:"overlay-actions",children:e.jsx("button",{className:"primary-btn",onClick:te,children:"Play again"})})]})})]})}const We=`
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

/* =========================================================================
   UNDER-THE-SEA THEME
   Deep space backdrop, twinkling stars, floating planets, disc-shaped chips.
   ========================================================================= */
.c4-app {
  --ink: #0d0f1a;
  --deep-1: #0a0c18;
  --deep-2: #12142a;
  --deep-3: #1a1d3a;
  --water-surface: #2a1f4e;
  --sand: #1c1f3a;
  --sand-dark: #14162e;
  --white: #ffffff;
  --red: #d6483c;
  --red-dark: #a92f27;
  --yellow: #e0ab2c;
  --yellow-dark: #b5811a;
  --cyan: #6ec6ff;
  --cyan-dark: #3a8fd4;
  --green: #4ecf7a;
  --green-dark: #2ea35a;
  --purple: #a855f7;
  --purple-dark: #7c3aed;
  --hole: rgba(6, 8, 20, 0.55);
  --border-w: 3px;
  --border-w-lg: 4px;
  --radius-lg: 26px;
  --radius-md: 18px;
  --font-display: 'Baloo 2', system-ui, sans-serif;
  --font-body: 'Baloo 2', 'Inter', system-ui, sans-serif;

  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  font-family: var(--font-body);
  color: var(--white);
  background: linear-gradient(180deg, #0d0f1a 0%, #12142a 30%, #1a1040 60%, #0d0f1a 100%);
}

.c4-app * { box-sizing: border-box; }

.c4-app.loading .c4-shell { opacity: 0; transform: translateY(14px) scale(0.99); }
.c4-app.loaded .c4-shell {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 0.6s cubic-bezier(.2,.7,.2,1), transform 0.6s cubic-bezier(.2,.7,.2,1);
}

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ---------- space ambience ---------- */
/* ---------- space scene ---------- */
.space-scene { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.space-nebula {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(120,60,200,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(60,100,220,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(180,60,180,0.08) 0%, transparent 60%);
  animation: nebulaPulse 18s ease-in-out infinite alternate;
}
@keyframes nebulaPulse { 0% { opacity: 0.6; } 100% { opacity: 1; } }

.space-star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation-name: starTwinkle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.space-obj { position: absolute; opacity: 0.7; }

/* rockets */
.space-rocket { width: 36px; overflow: visible; }
.space-rocket .body { fill: #e0e0e0; stroke: #0d0f1a; stroke-width: 1.5; }
.space-rocket .fin { fill: var(--red); stroke: #0d0f1a; stroke-width: 1.5; }
.space-rocket .window { fill: var(--cyan); stroke: #0d0f1a; stroke-width: 1.5; }
.space-rocket .flame { fill: #f59e0b; opacity: 0.85; }
.rocket-1 { top: 8%; left: 5%; animation: rocketFloat 14s ease-in-out infinite; }
.rocket-2 { top: 20%; right: 8%; width: 28px; animation: rocketFloat 18s ease-in-out infinite reverse; }
@keyframes rocketFloat {
  0%, 100% { transform: translateY(0) rotate(-15deg); }
  50% { transform: translateY(-18px) rotate(-15deg); }
}

/* planets */
.space-planet { width: 50px; overflow: visible; }
.space-planet .body { fill: #7c3aed; opacity: 0.85; }
.space-planet.has-ring .body { fill: #c084fc; }
.space-planet .ring { fill: none; stroke: rgba(255,255,255,0.35); stroke-width: 2.5; }
.space-planet.has-ring .ring { transform: rotate(-20deg); }
.space-planet .crater { fill: rgba(0,0,0,0.2); }
.planet-1 { top: 15%; right: 5%; width: 56px; animation: planetOrbit 24s ease-in-out infinite; }
.planet-2 { bottom: 20%; left: 3%; width: 38px; animation: planetOrbit 30s ease-in-out infinite reverse; }
.planet-3 { bottom: 35%; right: 12%; width: 42px; animation: planetOrbit 28s ease-in-out infinite; animation-delay: -6s; }
@keyframes planetOrbit {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* asteroids */
.space-asteroid { width: 30px; overflow: visible; }
.space-asteroid .body { fill: #4a4a5a; stroke: #0d0f1a; stroke-width: 1.5; }
.space-asteroid .crater { fill: rgba(0,0,0,0.3); }
.asteroid-1 { top: 50%; left: 2%; width: 24px; animation: asteroidDrift 20s linear infinite; }
.asteroid-2 { top: 30%; right: 3%; width: 18px; animation: asteroidDrift 26s linear infinite reverse; }
.asteroid-3 { bottom: 15%; left: 20%; width: 20px; animation: asteroidDrift 22s linear infinite; animation-delay: -8s; }
@keyframes asteroidDrift {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-100vh) rotate(360deg); }
}

/* ufo */
.space-ufo { width: 54px; overflow: visible; }
.space-ufo .dome-base { fill: #6b7280; stroke: #0d0f1a; stroke-width: 1.5; }
.space-ufo .dome { fill: rgba(110,198,255,0.4); stroke: #0d0f1a; stroke-width: 1.5; }
.space-ufo .light { fill: #6ec6ff; opacity: 0.7; }
.space-ufo .light-1 { animation: ufoLight 1.5s ease-in-out infinite; }
.space-ufo .light-2 { animation: ufoLight 1.5s ease-in-out infinite 0.5s; }
.space-ufo .light-3 { animation: ufoLight 1.5s ease-in-out infinite 1s; }
.space-ufo .eye { fill: #0d0f1a; }
@keyframes ufoLight {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.ufo-1 { top: 45%; left: 8%; animation: ufoFloat 16s ease-in-out infinite; }
@keyframes ufoFloat {
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-12px) translateX(6px); }
  75% { transform: translateY(8px) translateX(-6px); }
}

@media (max-width: 640px) {
  .space-rocket { width: 26px; }
  .space-planet { width: 36px; }
  .space-ufo { width: 40px; }
}

/* ---------- layout shell ---------- */
.c4-shell {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: 76px 16px 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100vh;
}

/* ---------- corner score badges ---------- */
.score-badge {
  position: fixed;
  top: 22px;
  z-index: 20;
  width: 82px;
  height: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  animation: badgeBob 4s ease-in-out infinite;
}
.badge-yellow { animation-delay: -2s; }
@keyframes badgeBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.score-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid var(--ink);
}
.badge-red {
  left: 20px;
  filter: drop-shadow(0 6px 0 var(--red-dark)) drop-shadow(0 10px 14px rgba(0,0,0,0.4));
}
.badge-red, .badge-red::before {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
.badge-red {
  background: radial-gradient(circle at 34% 26%, #f19086 0%, var(--red) 46%, var(--red-dark) 100%);
}
.badge-yellow {
  right: 20px;
  filter: drop-shadow(0 6px 0 var(--yellow-dark)) drop-shadow(0 10px 14px rgba(0,0,0,0.4));
}
.badge-yellow, .badge-yellow::before {
  clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
}
.badge-yellow {
  background: radial-gradient(circle at 34% 26%, #f5dd8e 0%, var(--yellow) 46%, var(--yellow-dark) 100%);
}
.badge-shine {
  position: absolute;
  top: 16%;
  left: 24%;
  width: 30%;
  height: 20%;
  background: rgba(255,255,255,0.55);
  border-radius: 50%;
  filter: blur(2px);
  transform: rotate(-20deg);
  pointer-events: none;
}
.badge-value {
  position: relative;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
  color: var(--white);
  text-shadow: 2px 2px 0 rgba(0,0,0,0.28);
}
.badge-label {
  position: relative;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.9);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.25);
}

@media (max-width: 640px) {
  .score-badge { width: 60px; height: 60px; top: 14px; }
  .badge-value { font-size: 18px; }
  .badge-label { font-size: 7.5px; }
  .badge-red { left: 12px; }
  .badge-yellow { right: 12px; }
}

/* ---------- top bar ---------- */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(8, 38, 51, 0.55);
  border: 2px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(2px);
}

.turn-indicator {
  margin: 0;
  font-size: 13px;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.turn-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  display: inline-flex;
  border: 2px solid var(--ink);
  flex-shrink: 0;
}
.dot-red { background: var(--red); }
.dot-yellow { background: var(--yellow); }
.turn-dot.pulsing { animation: dotPulse 0.9s ease-in-out infinite; }
@keyframes dotPulse { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.25); } }

.icon-btn-row { display: flex; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.12);
  color: var(--white);
  font-size: 15px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s ease, background 0.15s ease, opacity 0.2s ease;
}
.icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.22); transform: translateY(-1px); }
.icon-btn:active:not(:disabled) { transform: translateY(1px); }
.icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.icon-btn:focus-visible, .column-btn:focus-visible {
  outline: 3px solid var(--cyan);
  outline-offset: 2px;
}

/* ---------- board area ---------- */
.board-area { position: relative; display: flex; justify-content: center; flex-direction: column; align-items: center; }

.board-wrapper {
  position: relative;
  width: 100%;
  max-width: 560px;
  outline: none;
}

.drop-arrow-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 3.2%;
  height: 24px;
}
.drop-arrow-cell { display: flex; align-items: center; justify-content: center; }
.drop-arrow {
  font-size: 15px;
  color: var(--sand);
  opacity: 0.55;
  animation: arrowFloat 1.1s ease-in-out infinite;
}
.drop-arrow.active { opacity: 1; }
.arrow-red.active { color: var(--red); }
.arrow-yellow.active { color: var(--yellow); }
@keyframes arrowFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

.board {
  position: relative;
  z-index: 1;
  aspect-ratio: 7 / 6;
  width: 100%;
  border-radius: var(--radius-lg);
  background: linear-gradient(160deg, var(--deep-3), var(--deep-2));
  box-shadow: 0 10px 0 rgba(6,26,35,0.55), 0 18px 30px rgba(0,0,0,0.35), inset 0 0 0 3px rgba(255,255,255,0.08);
  padding: 3.2%;
  border: var(--border-w-lg) solid var(--ink);
  overflow: hidden;
}

.column-layer, .cells-grid {
  position: absolute;
  inset: 3.2%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.column-layer { z-index: 3; grid-template-rows: 1fr; }
.cells-grid { z-index: 2; grid-template-rows: repeat(6, 1fr); gap: 3%; }

.column-btn {
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  padding: 0;
  transition: background 0.2s ease;
  border-radius: 10px;
}
.column-btn:disabled { cursor: not-allowed; }
.column-btn:not(:disabled):hover { background: rgba(255,255,255,0.06); }

.ghost-disc {
  position: absolute;
  top: 2%;
  left: 50%;
  width: 76%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2.5px solid var(--ink);
  transform: translate(-50%, -12px);
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}
.ghost-disc.visible { opacity: 0.6; transform: translate(-50%, 0); }
.ghost-red { background: var(--red); }
.ghost-yellow { background: var(--yellow); }

.cell { position: relative; width: 100%; height: 100%; }
.hole {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: var(--hole);
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.5);
}

/* ---------- discs (glossy planet/asteroid look) ---------- */
.disc { position: absolute; inset: 0; border-radius: 50%; z-index: 1; border: 2.5px solid var(--ink); }
.disc-shine {
  position: absolute; top: 12%; left: 18%; width: 34%; height: 26%;
  background: rgba(255,255,255,0.55);
  border-radius: 50%;
  filter: blur(1px);
}
.disc-red { background: radial-gradient(circle at 35% 30%, #ef7a6f, var(--red) 60%, var(--red-dark)); }
.disc-yellow { background: radial-gradient(circle at 35% 30%, #f3cf6e, var(--yellow) 60%, var(--yellow-dark)); }

.disc-falling {
  animation-name: dropFall;
  animation-duration: var(--fall-duration, 0.5s);
  animation-timing-function: cubic-bezier(.4,0,.9,.4);
  animation-fill-mode: backwards;
}
@keyframes dropFall {
  0% { transform: translateY(calc(-100% * var(--fall-rows) - 6%)); }
  68% { transform: translateY(0); }
  80% { transform: translateY(-9%); }
  90% { transform: translateY(0); }
  96% { transform: translateY(-3%); }
  100% { transform: translateY(0); }
}

.disc-winning {
  animation: winPulse 1s ease-in-out infinite;
  z-index: 4;
}
@keyframes winPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.14); box-shadow: 0 0 0 4px rgba(255,255,255,0.35); }
}

/* ---------- confetti ---------- */
.confetti-layer { position: fixed; inset: 0; pointer-events: none; z-index: 50; overflow: hidden; }
.confetti-piece {
  position: absolute;
  top: -5%;
  animation-name: confettiFall;
  animation-timing-function: cubic-bezier(.3,.6,.7,1);
  animation-fill-mode: forwards;
  border: 2px solid var(--ink);
}
@keyframes confettiFall {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(105vh) translateX(var(--drift)) rotate(540deg); opacity: 0; }
}

/* ---------- bottom bar ---------- */
.bottom-bar {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 4px;
}
.bottom-btn {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--white);
  background: var(--green-dark);
  border: 2px solid rgba(255,255,255,0.25);
  padding: 11px 26px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 4px 0 rgba(0,0,0,0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.bottom-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 rgba(0,0,0,0.25); }
.bottom-btn:active { transform: translateY(1px); box-shadow: 0 2px 0 rgba(0,0,0,0.25); }

/* ---------- welcome / settings modal ---------- */
.welcome-overlay {
  position: fixed; inset: 0;
  background: rgba(6, 8, 20, 0.85);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
  padding: 20px;
  animation: overlayFade 0.3s ease;
}
.welcome-card {
  position: relative;
  width: 100%;
  max-width: 460px;
  border-radius: 22px;
  overflow: hidden;
  border: 3px solid rgba(168, 85, 247, 0.5);
  box-shadow: 0 0 0 1px rgba(168,85,247,0.2), 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.15);
  background: #15172e;
  animation: overlayPop 0.4s cubic-bezier(.2,.9,.3,1.3);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}
.welcome-close {
  position: absolute;
  top: 10px; right: 12px;
  z-index: 5;
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.9);
  color: #1a1040;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.welcome-close:hover { background: var(--white); transform: scale(1.1); }

.welcome-banner {
  position: relative;
  padding: 30px 20px 38px;
  text-align: center;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 30%, #4c1d95 60%, #1e1b4b 100%);
  overflow: hidden;
}
.welcome-banner-rays {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(196,136,255,0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.15) 0%, transparent 50%),
    repeating-linear-gradient(70deg, rgba(255,255,255,0.06) 0 18px, transparent 18px 60px);
  opacity: 0.8;
}
.welcome-banner-floor {
  position: relative;
  margin-top: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 14px;
  height: 40px;
}

.c4-title {
  position: relative;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 42px;
  margin: 0;
  line-height: 1;
  letter-spacing: 0.01em;
}
.c4-title-2 { margin-top: 2px; }
.c4-title span {
  display: inline-block;
  -webkit-text-stroke: 2.5px var(--ink);
  text-shadow: 3px 3px 0 var(--ink);
}
.l-white { color: #ffffff; }
.l-red { color: var(--red); }
.l-yellow { color: var(--yellow); }
.l-blue { color: #3a6df0; }
.arrow-letter { position: relative; }
.mini-arrow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  -webkit-text-stroke: 1.5px var(--ink);
}
.mini-arrow-up { top: -18px; color: var(--red); }
.mini-arrow-down { bottom: -16px; color: var(--yellow); }

.welcome-body {
  background: #1c1f3a;
  padding: 20px 24px 24px;
  overflow-y: auto;
}
.welcome-body p {
  margin: 0 0 10px;
  font-size: 13.5px;
  line-height: 1.45;
  color: rgba(255,255,255,0.92);
  font-weight: 500;
}

.welcome-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin: 16px 0 18px;
  padding-top: 12px;
  border-top: 2px dashed rgba(168,85,247,0.25);
}

.anim-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  color: rgba(255,255,255,0.95);
  cursor: pointer;
}
.anim-toggle input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.checkbox-box {
  width: 20px; height: 20px;
  border-radius: 5px;
  border: 2.5px solid rgba(168,85,247,0.5);
  background: rgba(255,255,255,0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.anim-toggle input:checked + .checkbox-box { background: var(--purple); border-color: var(--purple); }
.anim-toggle input:checked + .checkbox-box::after {
  content: '\\2713';
  color: var(--white);
  font-size: 13px;
  font-weight: 800;
}
.anim-toggle input:focus-visible + .checkbox-box { outline: 2px solid var(--purple); outline-offset: 2px; }

.difficulty-control { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.control-title {
  font-weight: 800;
  font-size: 12.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.85);
}
.difficulty-options { display: flex; gap: 16px; }
.difficulty-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255,255,255,0.92);
  cursor: pointer;
}
.difficulty-option input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.radio-dot {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 2.5px solid rgba(168,85,247,0.5);
  background: rgba(255,255,255,0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s;
}
.difficulty-option input:checked + .radio-dot { border-color: var(--purple); background: rgba(168,85,247,0.15); }
.difficulty-option input:checked + .radio-dot::after {
  content: '';
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--purple);
}
.difficulty-option input:focus-visible + .radio-dot { outline: 2px solid var(--purple); outline-offset: 2px; }

.welcome-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; padding-bottom: 4px; }
.welcome-btn {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 13px 22px;
  border-radius: 14px;
  cursor: pointer;
  border: 3px solid rgba(255,255,255,0.15);
  color: var(--white);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex: 1 1 140px;
}
.btn-player { background: var(--green); box-shadow: 0 4px 0 var(--green-dark); }
.btn-computer { background: var(--purple); box-shadow: 0 4px 0 var(--purple-dark); }
.welcome-btn:hover { transform: translateY(-2px); }
.welcome-btn:active { transform: translateY(2px); box-shadow: none; }

/* ---------- win / draw overlay ---------- */
.overlay {
  position: fixed; inset: 0;
  background: rgba(6, 8, 20, 0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: overlayFade 0.3s ease;
}
@keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }

.overlay-card {
  position: relative;
  border: var(--border-w-lg) solid var(--ink);
  border-radius: 28px;
  padding: 36px 30px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 14px 0 rgba(0,0,0,0.25), 0 24px 40px rgba(0,0,0,0.4);
  animation: overlayPop 0.4s cubic-bezier(.2,.9,.3,1.3);
  overflow: hidden;
}
.overlay-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(70deg, rgba(255,255,255,0.08) 0 16px, transparent 16px 52px);
  pointer-events: none;
}
.overlay-card::after {
  content: '';
  position: absolute;
  width: 130px; height: 130px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  top: -50px; right: -40px;
  pointer-events: none;
}
.overlay-card.win-red-result {
  background: radial-gradient(circle at 30% 20%, #f0958a 0%, var(--red) 45%, var(--red-dark) 100%);
}
.overlay-card.win-yellow-result {
  background: radial-gradient(circle at 30% 20%, #f6de92 0%, var(--yellow) 45%, var(--yellow-dark) 100%);
}
.overlay-card.draw-result {
  background: radial-gradient(circle at 30% 20%, #7fd6ec 0%, var(--cyan) 45%, var(--cyan-dark) 100%);
}
@keyframes overlayPop {
  0% { transform: scale(0.75) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.overlay-icon {
  position: relative;
  color: var(--ink);
  margin: 0 auto 14px;
  width: 76px; height: 76px;
  display: flex; align-items: center; justify-content: center;
  background: var(--white);
  border: var(--border-w) solid var(--ink);
  border-radius: 50%;
  box-shadow: 0 4px 0 rgba(0,0,0,0.2);
}
.trophy-icon { animation: trophyBounce 1.3s ease-in-out infinite; }
@keyframes trophyBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(-6deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-5px) rotate(6deg); }
}
.draw-icon { animation: drawShake 1.2s ease-in-out infinite; }
@keyframes drawShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px) rotate(-3deg); }
  75% { transform: translateX(4px) rotate(3deg); }
}

.overlay-card h2 {
  position: relative;
  font-family: var(--font-display);
  font-size: 28px;
  margin: 0 0 8px;
  font-weight: 800;
  color: var(--ink);
  text-transform: uppercase;
}
.overlay-card p { position: relative; color: var(--ink); opacity: 0.75; margin: 0 0 22px; font-size: 13.5px; font-weight: 600; }
.win-red-result .text-red { color: var(--white); text-shadow: 2px 2px 0 var(--ink); }
.win-yellow-result .text-yellow { color: var(--red-dark); }

.overlay-actions { position: relative; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.primary-btn, .ghost-btn {
  font-family: var(--font-body);
  font-weight: 800;
  font-size: 13.5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 12px 24px;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: var(--border-w) solid var(--ink);
}
.primary-btn {
  background: var(--cyan-dark);
  color: var(--white);
  box-shadow: 4px 4px 0 var(--ink);
}
.primary-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--ink); }
.primary-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--ink); }
.ghost-btn {
  background: var(--white);
  color: var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
}
.ghost-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--ink); }
.ghost-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--ink); }

/* ---------- responsive ---------- */
@media (max-width: 640px) {
  .c4-shell { padding: 64px 12px 20px; }
  .c4-title { font-size: 30px; }
  .welcome-banner { padding: 20px 14px 24px; }
  .overlay-card { padding: 28px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .c4-app, .floating-particle, .disc-falling, .disc-winning,
  .trophy-icon, .draw-icon, .turn-dot.pulsing {
    animation: none !important;
    transition: none !important;
  }
}

.c4-app.no-anim *, .c4-app.no-anim {
  animation: none !important;
  transition: none !important;
}
`;export{He as default};
