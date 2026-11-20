import{r,j as e}from"./react-vendor-gyK15t0p.js";const h=(t,a)=>Math.floor(Math.random()*(a-t+1))+t,A=t=>t[h(0,t.length-1)],pe=(t,a,s)=>Math.max(a,Math.min(s,t)),Y=[{level:1,label:"Warm-Up",numMax:10,ops:["+","−"],choices:2,baseTime:12},{level:2,label:"Getting Sharp",numMax:20,ops:["+","−","×"],choices:3,baseTime:11},{level:3,label:"Full Speed",numMax:50,ops:["×","÷"],choices:3,baseTime:10},{level:4,label:"Brain Teaser",numMax:80,ops:["+","−","×","÷"],choices:4,baseTime:9},{level:5,label:"Math Wizard",numMax:100,ops:["+","−","×","÷"],choices:4,baseTime:7}],xe=[0,6,14,24,36];function Ye(t){let a=1;for(let s=0;s<xe.length;s++)t>=xe[s]&&(a=s+1);return t>=36&&(a=5+Math.floor((t-36)/14)),a}function U(t){const a=Y[Math.min(t,5)-1]||Y[4];if(t<=5)return{...a,level:t};const s=t-5;return{...Y[4],level:t,label:"Math Wizard +"+s,baseTime:Math.max(4,Y[4].baseTime-s*.35),numMax:Math.min(300,Y[4].numMax+s*8)}}function ue(t){const a=t.ops.filter(m=>m==="+"||m==="−"),s=A(a.length?a:["+"]),n=h(1,t.numMax),o=h(1,t.numMax);if(s==="−"){const m=Math.max(n,o),p=Math.min(n,o);return{display:`${m} − ${p}`,answer:m-p}}return{display:`${n} + ${o}`,answer:n+o}}function Ie(t){if(A(t.ops)==="×"){const s=h(2,Math.min(12,t.numMax)),n=h(2,9);return{display:`${s} × ${n}`,answer:s*n}}return ue({...t,ops:["+","−"]})}function He(){if(A(["×","÷"])==="÷"){const n=h(2,11),o=h(2,11);return{display:`${n*o} ÷ ${n}`,answer:o}}const a=h(2,12),s=h(2,11);return{display:`${a} × ${s}`,answer:a*s}}function We(t){const a=h(2,Math.min(20,t.numMax)),s=h(2,Math.min(15,t.numMax)),n=h(2,Math.min(12,t.numMax)),o=h(0,3);if(o===0)return{display:`(${a} + ${s}) × ${n}`,answer:(a+s)*n};if(o===1){const m=Math.max(a,s),p=Math.min(a,s);return{display:`(${m} − ${p}) + ${n}`,answer:m-p+n}}if(o===2){const m=a*n,p=[];for(let l=2;l<=12;l++)m%l===0&&p.push(l);const i=p.length?A(p):1;return{display:`(${a} × ${n}) ÷ ${i}`,answer:a*n/i}}return{display:`${a} + (${s} × ${n})`,answer:a+s*n}}function Fe(t){const a=h(2,Math.min(30,t.numMax)),s=h(2,Math.min(20,t.numMax)),n=h(2,12),o=h(2,10),m=h(0,4);if(m===0){const l=a+s*n,d=Math.min(o,l);return{display:`${a} + ${s} × ${n} − ${d}`,answer:l-d}}if(m===1){const l=a+s,d=[];for(let c=2;c<=12;c++)l%c===0&&d.push(c);const f=d.length?A(d):1;return{display:`(${a} + ${s}) ÷ ${f} × ${n}`,answer:l/f*n}}if(m===2){const l=h(3,9),d=h(2,9),f=h(1,10),c=h(1,l*d-1),x=f+c;return{display:`${l} × ${d} − (${x} − ${f})`,answer:l*d-c}}if(m===3){const l=A([2,3,4,5,6]),d=l*h(2,10);return{display:`${d} ÷ ${l} + ${s} × ${n}`,answer:d/l+s*n}}const p=Math.max(a,s),i=Math.min(a,s);return{display:`(${p} − ${i}) + (${n} × ${o})`,answer:p-i+n*o}}function Xe(t,a){const s=U(t);let n,o=0;do s.level===1?n=ue(s):s.level===2?n=Ie(s):s.level===3?n=He():s.level===4?n=We(s):n=Fe(s),o++;while(a.has(n.display)&&o<40);return a.add(n.display),{...n,cfg:s}}function Ge(t,a){const s=new Set([t]),n=Math.max(2,Math.round(Math.abs(t)*.18));let o=0;for(;s.size<a&&o<200;){o++;const p=h(1,Math.max(3,n))*(Math.random()<.5?-1:1),i=t+p;i>=0&&!s.has(i)&&s.add(i)}const m=[...s];for(let p=m.length-1;p>0;p--){const i=h(0,p);[m[p],m[i]]=[m[i],m[p]]}return m}function Pe(t){const a=r.useRef(null),s=r.useRef(null),n=r.useCallback(()=>{if(!a.current){const i=window.AudioContext||window.webkitAudioContext;if(!i)return null;a.current=new i}return a.current.state==="suspended"&&a.current.resume(),a.current},[]),o=r.useCallback((i,l,d="sine",f=.16,c=0)=>{if(!t)return;const x=n();if(!x)return;const y=x.createOscillator(),v=x.createGain();y.type=d,y.frequency.setValueAtTime(i,x.currentTime+c),v.gain.setValueAtTime(f,x.currentTime+c),v.gain.exponentialRampToValueAtTime(.001,x.currentTime+c+l),y.connect(v),v.connect(x.destination),y.start(x.currentTime+c),y.stop(x.currentTime+c+l)},[t,n]),m=r.useCallback((i=.18,l=.1,d=2200)=>{if(!t)return;const f=n();if(!f)return;const c=Math.max(1,Math.floor(f.sampleRate*i)),x=f.createBuffer(1,c,f.sampleRate),y=x.getChannelData(0);for(let N=0;N<c;N++)y[N]=(Math.random()*2-1)*(1-N/c);const v=f.createBufferSource();v.buffer=x;const M=f.createBiquadFilter();M.type="bandpass",M.frequency.value=d;const B=f.createGain();B.gain.value=l,v.connect(M),M.connect(B),B.connect(f.destination),v.start()},[t,n]),p=r.useCallback((i,l,d=.06,f=.12)=>{o(i,d,"sine",f),o(l,d,"sine",f*.8,d*.45)},[o]);return r.useMemo(()=>({pop:()=>{p(880,1320,.05,.1),m(.08,.05,3800)},click:()=>{o(660,.04,"square",.06),o(990,.04,"square",.04,.02)},correct:()=>{o(880,.09,"sine",.14),o(1175,.09,"sine",.12,.06),o(1568,.14,"sine",.1,.12),o(2093,.08,"sine",.06,.18),o(2637,.06,"sine",.04,.22)},wrong:()=>{o(260,.15,"sawtooth",.12),o(190,.18,"sawtooth",.09,.04),o(140,.14,"sawtooth",.06,.08),m(.1,.06,600)},beep:()=>{o(1046,.05,"square",.08),o(1046,.05,"square",.05,.06)},levelup:()=>{[523,659,784,1046,1318,1568].forEach((l,d)=>o(l,.14,"triangle",.11,d*.07)),o(1046,.2,"sine",.08,.45),o(1318,.2,"sine",.06,.45),o(1568,.2,"sine",.05,.45)},highscore:()=>{[659,880,1046,1318,1568,2093].forEach((i,l)=>o(i,.18,"sine",.12,l*.09)),o(1046,.3,"triangle",.06,.5),o(1318,.3,"triangle",.05,.52),o(1568,.25,"triangle",.04,.54)},ambientStart:()=>{if(!t||s.current)return;const i=n();if(!i)return;const l=i.sampleRate*2,d=i.createBuffer(1,l,i.sampleRate),f=d.getChannelData(0);for(let v=0;v<l;v++)f[v]=(Math.random()*2-1)*.02;const c=i.createBufferSource();c.buffer=d,c.loop=!0;const x=i.createBiquadFilter();x.type="lowpass",x.frequency.value=340;const y=i.createGain();y.gain.value=.5,c.connect(x),x.connect(y),y.connect(i.destination),c.start(),s.current=c},ambientStop:()=>{if(s.current){try{s.current.stop()}catch{}s.current=null}}}),[t,o,m,p,n])}function T(t){if(typeof navigator<"u"&&navigator.vibrate)try{navigator.vibrate(t)}catch{}}const he="mathChallenge.bestScore.v2";function Ve(){try{return parseInt(localStorage.getItem(he),10)||0}catch{return 0}}function fe(t){try{localStorage.setItem(he,String(t))}catch{}}const ge=({filled:t=!0,size:a=18})=>e.jsx("svg",{width:a,height:a,viewBox:"0 0 24 24",fill:t?"currentColor":"none",stroke:"currentColor",strokeWidth:"1.6",children:e.jsx("path",{d:"M12 2.5l2.9 6.32 6.85.65-5.2 4.66 1.55 6.87L12 17.9l-6.1 3.1 1.55-6.87-5.2-4.66 6.85-.65L12 2.5z",strokeLinejoin:"round"})}),De=({size:t=18})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"#8b2fd9",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M8 4h8v5a4 4 0 01-8 0V4z",fill:"#ffc94a",stroke:"#E88A00"}),e.jsx("path",{d:"M8 5H5a2 2 0 002 4",stroke:"#c084fc",strokeWidth:"1.5"}),e.jsx("path",{d:"M16 5h3a2 2 0 01-2 4",stroke:"#c084fc",strokeWidth:"1.5"}),e.jsx("path",{d:"M12 13v3",stroke:"#E88A00"}),e.jsx("path",{d:"M9 20h6",stroke:"#E88A00",strokeWidth:"1.8"}),e.jsx("path",{d:"M12 16c-2 0-3 1.4-3 4h6c0-2.6-1-4-3-4z",fill:"#ffc94a",stroke:"#E88A00"})]}),Oe=({size:t=18})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",fill:"#FFC94A",stroke:"#E88A00",strokeWidth:"1.4"}),e.jsx("circle",{cx:"12",cy:"12",r:"6.4",fill:"none",stroke:"#E88A00",strokeWidth:"1.2",opacity:"0.6"}),e.jsx("text",{x:"12",y:"16",textAnchor:"middle",fontSize:"10",fontWeight:"700",fill:"#E88A00",fontFamily:"Baloo 2, sans-serif",children:"$"})]}),Qe=({on:t,size:a=20})=>e.jsxs("svg",{width:a,height:a,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.9",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M4 9v6h4l5 4V5L8 9H4z"}),t&&e.jsx("path",{d:"M16.5 8.5a5 5 0 010 7"}),t&&e.jsx("path",{d:"M19 6a8.5 8.5 0 010 12"}),!t&&e.jsx("path",{d:"M17 9l4 6M21 9l-4 6"})]}),_e=({size:t=20})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"})]}),be=({size:t=20})=>e.jsx("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M19 12H5M11 6l-6 6 6 6"})}),Ke=({size:t=15})=>e.jsxs("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M12 7v5l3.5 2"})]});function ve({className:t="",mood:a="happy"}){return e.jsx("img",{src:"/mascotques.webp",alt:"Mascot",className:`mc-mascot-img ${t}`})}function we(){const t=r.useMemo(()=>{const a=["+","−","×","÷","="];return[...Array(16)].map((s,n)=>({ch:a[n%a.length],left:n*37%100,delay:n*.27%3.2,dur:4+n*13%5,size:18+n*7%22}))},[]);return e.jsx("div",{className:"mc-intro-symbols","aria-hidden":"true",children:t.map((a,s)=>e.jsx("span",{className:"mc-intro-symbol",style:{left:`${a.left}%`,animationDelay:`${a.delay}s`,animationDuration:`${a.dur}s`,fontSize:`${a.size}px`},children:a.ch},s))})}function Ue({burst:t}){return t?e.jsx("div",{className:"mc-particles",style:{left:t.x,top:t.y},children:t.dots.map((a,s)=>e.jsx("span",{className:"mc-particle",style:{"--tx":`${a.tx}px`,"--ty":`${a.ty}px`,"--rot":`${a.rot}deg`,background:a.color,animationDelay:`${a.delay}ms`}},s))}):null}function Je({trigger:t}){return t?e.jsx("div",{className:"mc-star-float-wrap",children:[...Array(7)].map((a,s)=>e.jsx("span",{className:"mc-star-float",style:{left:`${8+s*13}%`,animationDelay:`${s*60}ms`},children:e.jsx(ge,{size:20})},s))}):null}function nt(){const[t,a]=r.useState("home"),[s,n]=r.useState(!0),[o,m]=r.useState(!0),[p,i]=r.useState(!1),[l,d]=r.useState(!1),[f,c]=r.useState(0),[x,y]=r.useState(0),[v,M]=r.useState(0),[B,N]=r.useState(0),[S,I]=r.useState(1),[V,E]=r.useState(!1),[q,H]=r.useState(3),[j,z]=r.useState(0),[L,J]=r.useState(0),[W,ye]=r.useState(null),[je,ke]=r.useState([]),[Z,Me]=r.useState(0),[F,Ne]=r.useState(12),[Se,X]=r.useState(12),[$,G]=r.useState(null),[ee,D]=r.useState(null),[$e,O]=r.useState([]),[Ce,Q]=r.useState(null),[Be,te]=r.useState(0),[ze,ae]=r.useState(!1),se=r.useRef(new Set),_=r.useRef(null),Ae=r.useRef(0),w=Pe(s);r.useEffect(()=>{c(Ve());const u=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)");u&&u.matches&&i(!0)},[]),r.useEffect(()=>{const u=()=>{document.hidden?w.ambientStop():t==="playing"&&s&&w.ambientStart()};return document.addEventListener("visibilitychange",u),()=>document.removeEventListener("visibilitychange",u)},[t,s,w]);const ne=r.useMemo(()=>Math.min(3,1+Math.floor(v/3)*.5),[v]),oe=j>0?Math.round(L/j*100):100,Le=Math.round(12*S*ne),P=r.useCallback(u=>{const g=U(u),b=Xe(u,se.current),k=Ge(b.answer,g.choices);ye(b),ke(k),Me(C=>C+1),G(null),D(null),Ne(g.baseTime),X(g.baseTime),_.current=null,w.pop()},[w]),re=r.useCallback(()=>{se.current=new Set,y(0),M(0),N(0),I(1),H(3),z(0),J(0),ae(!1),O([]),Q(null),te(0),a("playing"),P(1),s&&w.ambientStart(),o&&T([10,20,10])},[P,w,s]),Te=r.useCallback(u=>{w.ambientStop(),a("gameover"),c(g=>u>g?(fe(u),ae(!0),w.highscore(),o&&T([20,15,20,15,20,15,40]),u):g)},[w,o]),ie=r.useCallback(()=>{w.ambientStop(),a("home"),d(!1)},[w]);r.useEffect(()=>{if(t!=="playing"||$!==null)return;const u=setInterval(()=>{X(g=>{const b=Math.max(0,g-.1),k=Math.ceil(b);return k<=3&&k>=1&&k!==_.current&&b>0&&(_.current=k,w.beep()),b<=0&&G(C=>C===null?"wrong":C),b})},100);return()=>clearInterval(u)},[t,$,Z]),r.useEffect(()=>{$==="wrong"&&ee===null&&le(null)},[$]);const ce=(u,g)=>{const b=Ae.current++;O(k=>[...k,{id:b,text:u,positive:g}]),setTimeout(()=>O(k=>k.filter(C=>C.id!==b)),900)},Ee=u=>{const g=[...Array(14)].map(()=>{const b=Math.random()*Math.PI*2,k=40+Math.random()*60;return{tx:Math.cos(b)*k,ty:Math.sin(b)*k,rot:Math.random()*360,color:A(u),delay:Math.random()*80}});Q({x:"50%",y:"46%",dots:g}),setTimeout(()=>Q(null),700)},qe=u=>{if($!==null)return;D(u),G("correct"),w.correct(),o&&T([15,40,25]),Ee(["#c084fc","#6FE07A","#a855f7","#ffffff"]);const g=v+1,b=L+1,k=j+1,C=Math.min(3,1+Math.floor(g/3)*.5),me=Math.round(12*S*C),de=x+me,K=Ye(b);M(g),J(b),z(k),N(R=>Math.max(R,g)),y(de),ce(`+${me}`,!0),K!==S&&(I(K),E(!0),w.levelup(),o&&T([20,30,20,30,40]),setTimeout(()=>E(!1),1300)),Math.floor(de/300)>Math.floor(x/300)&&te(R=>R+1),X(R=>Math.min(F,R+F*.18)),setTimeout(()=>P(K),480)},le=u=>{if($!==null&&u!==null)return;D(u),G("wrong"),w.wrong(),o&&T([50,20,30,20,50]),ce("Miss",!1),M(0),z(b=>b+1),X(b=>Math.max(0,b-F*.2));const g=q-1;H(g),g<=0?setTimeout(()=>Te(x),550):setTimeout(()=>P(S),550)},Re=(u,g)=>{$!==null||!W||(w.click(),o&&T(12),u===W.answer?qe(g):le(g))};return e.jsxs("div",{className:"mc-root",children:[e.jsx("style",{children:at}),t==="home"&&e.jsx(Ze,{bestScore:f,onPlay:re,soundOn:s,setSoundOn:n,settingsOpen:l,setSettingsOpen:d,hapticsOn:o,setHapticsOn:m,reducedMotion:p,setReducedMotion:i,onResetBest:()=>{fe(0),c(0)}}),t==="playing"&&W&&e.jsx(et,{score:x,streak:v,comboMultiplier:ne,level:S,levelLabel:U(S).label,levelUpFlash:V,stars:q,timeLeft:Se,maxTime:F,question:W,questionKey:Z,choices:je,feedback:$,pickedIdx:ee,onAnswer:Re,popups:$e,burst:Ce,milestone:Be,onHome:ie,nextPreviewPts:Le,accuracy:oe}),t==="gameover"&&e.jsx(tt,{score:x,bestScore:f,accuracy:oe,highestCombo:B,questionsAnswered:j,isNewBest:ze,onRestart:re,onHome:ie})]})}function Ze({bestScore:t,onPlay:a,soundOn:s,setSoundOn:n,settingsOpen:o,setSettingsOpen:m,hapticsOn:p,setHapticsOn:i,reducedMotion:l,setReducedMotion:d,onResetBest:f}){return e.jsxs("div",{className:"mc-screen mc-home",children:[e.jsx(we,{}),e.jsx("div",{className:"mc-home-topbar",children:e.jsxs("div",{className:"mc-topbar-actions",children:[e.jsx("button",{className:"mc-icon-btn",onClick:()=>n(c=>!c),"aria-label":"Toggle sound",children:e.jsx(Qe,{on:s})}),e.jsx("button",{className:"mc-icon-btn",onClick:()=>m(c=>!c),"aria-label":"Settings",children:e.jsx(_e,{})})]})}),o&&e.jsxs("div",{className:"mc-settings-panel",children:[e.jsxs("div",{className:"mc-settings-row",children:[e.jsx("span",{children:"Sound effects"}),e.jsx("button",{className:`mc-toggle ${s?"on":""}`,onClick:()=>n(c=>!c),children:e.jsx("i",{})})]}),e.jsxs("div",{className:"mc-settings-row",children:[e.jsx("span",{children:"Haptics"}),e.jsx("button",{className:`mc-toggle ${p?"on":""}`,onClick:()=>i(c=>!c),children:e.jsx("i",{})})]}),e.jsxs("div",{className:"mc-settings-row",children:[e.jsx("span",{children:"Reduce motion"}),e.jsx("button",{className:`mc-toggle ${l?"on":""}`,onClick:()=>d(c=>!c),children:e.jsx("i",{})})]}),e.jsx("button",{className:"mc-settings-reset",onClick:f,children:"Reset best score"})]}),e.jsx("div",{className:"mc-home-center",children:e.jsxs("div",{className:"mc-home-card",children:[e.jsx(ve,{className:"mc-home-mascot"}),e.jsx("div",{className:"mc-title-wrap",children:e.jsxs("h1",{className:"mc-title",children:["Math",e.jsx("span",{className:"mc-title-accent",children:" Challenge"})]})}),e.jsx("p",{className:"mc-home-sub",children:"Solve fast. Chain combos. Beat the board."}),e.jsxs("div",{className:"mc-best-pill",children:[e.jsx(De,{size:22}),e.jsxs("div",{className:"mc-best-pill-text",children:[e.jsx("span",{className:"mc-best-label",children:"Best score"}),e.jsx("span",{className:"mc-best-value",children:t})]})]}),e.jsx("button",{className:"mc-btn-3d green big",onClick:a,children:"Play"})]})})]})}function et({score:t,streak:a,comboMultiplier:s,level:n,levelLabel:o,levelUpFlash:m,stars:p,timeLeft:i,maxTime:l,question:d,questionKey:f,choices:c,feedback:x,pickedIdx:y,onAnswer:v,popups:M,burst:B,milestone:N,onHome:S,nextPreviewPts:I,accuracy:V}){const E=pe(i/l*100,0,100),q=E<=25,H=Math.ceil(i);return e.jsxs("div",{className:`mc-screen mc-game ${x==="correct"?"flash-green":""} ${x==="wrong"?"flash-red shake":""}`,children:[e.jsxs("div",{className:"mc-hud-top",children:[e.jsx("button",{className:"mc-icon-btn round-white",onClick:S,"aria-label":"Home",children:e.jsx(be,{size:19})}),e.jsxs("div",{className:"mc-level-block",children:[e.jsxs("div",{className:"mc-level-title",children:["Level ",n]}),e.jsx("div",{className:"mc-level-sub",children:o})]}),e.jsx("div",{className:"mc-stars-row",children:[0,1,2].map(j=>e.jsx("span",{className:`mc-life-star ${j<p?"lit":"dim"}`,children:e.jsx(ge,{filled:j<p,size:17})},j))})]}),e.jsx("div",{className:"mc-progress-track",children:e.jsx("div",{className:"mc-progress-fill",style:{width:`${pe(a%6/6*100+8,8,100)}%`}})}),e.jsxs("div",{className:"mc-hud-mid",children:[e.jsxs("div",{className:"mc-timer-chip",children:[e.jsx(Ke,{size:14}),e.jsxs("span",{className:q?"urgent":"",children:["00:",String(Math.max(0,Math.floor(H))).padStart(2,"0")]})]}),e.jsx("div",{className:"mc-timer-track",children:e.jsx("div",{className:`mc-timer-fill ${q?"urgent":""}`,style:{width:`${E}%`}})})]}),e.jsxs("div",{className:`mc-stat-row ${m?"level-pop":""}`,children:[e.jsxs("div",{className:"mc-stat-chip",children:[e.jsx("span",{children:"Score"}),e.jsx("b",{children:t})]}),e.jsxs("div",{className:`mc-stat-chip ${a>=3?"combo-active":""}`,children:[e.jsx("span",{children:"Combo"}),e.jsxs("b",{children:["×",s.toFixed(1)]})]}),e.jsxs("div",{className:"mc-stat-chip",children:[e.jsx("span",{children:"Accuracy"}),e.jsxs("b",{children:[V,"%"]})]})]}),e.jsxs("div",{className:"mc-board",children:[e.jsx("div",{className:"mc-equation-card",children:e.jsx("div",{className:"mc-equation",children:d.display})}),e.jsxs("div",{className:"mc-reward-chip",children:[e.jsx(Oe,{size:16})," +",I]}),e.jsx("div",{className:`mc-choices choices-${c.length}`,children:c.map((j,z)=>{let L="mc-choice-btn";return x&&y===z?L+=x==="correct"?" correct":" wrong":x==="correct"&&j===d.answer&&(L+=" correct"),e.jsx("button",{className:L,onClick:()=>v(j,z),disabled:x!==null,children:j},z)})})]},f),e.jsx("div",{className:"mc-popup-layer",children:M.map(j=>e.jsx("div",{className:`mc-popup ${j.positive?"pos":"neg"}`,children:j.text},j.id))}),e.jsx(Ue,{burst:B}),e.jsx(Je,{trigger:N>0?N:0})]})}function tt({score:t,bestScore:a,accuracy:s,highestCombo:n,questionsAnswered:o,isNewBest:m,onRestart:p,onHome:i}){return e.jsxs("div",{className:"mc-screen mc-gameover",children:[e.jsx(we,{}),e.jsxs("div",{className:"mc-go-card",children:[m&&e.jsx("div",{className:"mc-newbest-badge",children:"New Best!"}),e.jsx(ve,{className:"mc-go-mascot",mood:"sad"}),e.jsx("div",{className:"mc-go-title",children:"Game Over"}),e.jsx("div",{className:"mc-go-score",children:t}),e.jsxs("div",{className:"mc-go-grid",children:[e.jsxs("div",{className:"mc-go-stat",children:[e.jsx("span",{children:"Accuracy"}),e.jsxs("b",{children:[s,"%"]})]}),e.jsxs("div",{className:"mc-go-stat",children:[e.jsx("span",{children:"Best Combo"}),e.jsxs("b",{children:["×",(1+Math.floor(n/3)*.5).toFixed(1)]})]}),e.jsxs("div",{className:"mc-go-stat",children:[e.jsx("span",{children:"Questions"}),e.jsx("b",{children:o})]}),e.jsxs("div",{className:"mc-go-stat",children:[e.jsx("span",{children:"Best Score"}),e.jsx("b",{children:a})]})]}),e.jsxs("div",{className:"mc-go-actions",children:[e.jsxs("button",{className:"mc-btn-3d blue",onClick:i,children:[e.jsx(be,{size:16})," Home"]}),e.jsx("button",{className:"mc-btn-3d green",onClick:p,children:"Play Again"})]})]})]})}const at=`
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');

.mc-root {
  --blue-top: #8b5cf6;
  --blue-bottom: #2e1065;
  --panel: #f1eaff;
  --panel-border: rgba(124,58,237,0.18);
  --ink: #241147;
  --ink-soft: rgba(36,17,71,0.62);
  --white: #ffffff;
  --green-top: #8bdc6b;
  --green-bottom: #4c9a2a;
  --green-bevel: #357016;
  --blue-btn-top: #a879ff;
  --blue-btn-bottom: #7c3aed;
  --blue-btn-bevel: #4c1d95;
  --red-top: #ff8a80;
  --red-bottom: #e5534b;
  --red-bevel: #b23328;
  --gold: #ffc94a;
  --gold-bottom: #f59f00;
  --radius-lg: 28px;
  --radius-md: 20px;
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, var(--blue-top) 0%, var(--blue-bottom) 100%);
  font-family: 'Nunito', sans-serif;
  color: var(--white);
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.mc-screen {
  position: relative; z-index: 1;
  width: 100%; max-width: 460px;
  min-height: 100vh; min-height: 100dvh;
  margin: 0 auto;
  display: flex; flex-direction: column;
  padding: 20px 20px 26px;
  box-sizing: border-box;
}

/* ---------- shared ---------- */

.mc-icon-btn {
  width: 42px; height: 42px; border-radius: 14px;
  background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.4);
  color: var(--white); display: flex; align-items: center; justify-content: center;
  cursor: pointer; backdrop-filter: blur(4px);
  transition: transform .15s ease, background .15s ease;
}
.mc-icon-btn:hover { background: rgba(255,255,255,0.32); }
.mc-icon-btn:active { transform: scale(0.9); }
.mc-icon-btn.round-white { background: var(--white); color: var(--blue-bottom); border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
.mc-icon-btn.on-bar { background: rgba(255,255,255,0.16); }

.mc-btn-3d {
  font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 18px;
  border: none; border-radius: 999px; cursor: pointer; color: var(--white);
  padding: 15px 34px; position: relative;
  box-shadow: 0 5px 0 var(--green-bevel), 0 10px 22px rgba(0,0,0,0.22);
  background: linear-gradient(180deg, var(--green-top), var(--green-bottom));
  transition: transform .08s ease, box-shadow .08s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
}
.mc-btn-3d.big { padding: 17px 60px; font-size: 21px; }
.mc-btn-3d.blue { background: linear-gradient(180deg, var(--blue-btn-top), var(--blue-btn-bottom)); box-shadow: 0 5px 0 var(--blue-btn-bevel), 0 10px 22px rgba(0,0,0,0.22); }
.mc-btn-3d.red { background: linear-gradient(180deg, var(--red-top), var(--red-bottom)); box-shadow: 0 5px 0 var(--red-bevel), 0 10px 22px rgba(0,0,0,0.22); }
.mc-btn-3d:active { transform: translateY(4px); box-shadow: 0 1px 0 var(--green-bevel), 0 4px 10px rgba(0,0,0,0.2); }
.mc-btn-3d.blue:active { box-shadow: 0 1px 0 var(--blue-btn-bevel), 0 4px 10px rgba(0,0,0,0.2); }

.mc-title { font-family: 'Baloo 2', sans-serif; font-weight: 800; font-size: clamp(32px, 8.5vw, 46px); margin: 0; color: var(--white); text-shadow: 0 3px 0 rgba(0,0,0,0.18); }
.mc-title-accent { color: #e9d5ff; }

/* ---------- mascot ---------- */

.mc-mascot-img { width: 110px; height: auto; filter: drop-shadow(0 10px 14px rgba(0,0,0,0.28)); object-fit: contain; }
.mc-home-mascot { animation: mc-bounce 2.6s ease-in-out infinite; margin-bottom: 4px; }
.mc-go-mascot { width: 86px; margin: 0 auto 8px; }

/* ---------- floating symbols ---------- */

.mc-intro-symbols { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.mc-intro-symbol {
  position: absolute; top: -60px; color: rgba(255,255,255,0.28); font-family: 'Baloo 2', sans-serif; font-weight: 700;
  animation: mc-symbol-fall linear infinite;
}

/* ---------- home screen ---------- */

.mc-home { justify-content: flex-start; }
.mc-home-topbar { display: flex; align-items: center; justify-content: space-between; }
.mc-topbar-actions { display: flex; gap: 10px; margin-left: auto; }
.mc-home-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-top: -20px; }
.mc-home-sub { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.88); margin: 0; }

.mc-home-card {
  width: 100%; max-width: 340px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.28);
  border-radius: var(--radius-lg);
  padding: 32px 24px 28px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
  backdrop-filter: blur(6px);
}

.mc-best-pill {
  display: flex; align-items: center; gap: 10px; background: var(--white); color: var(--ink);
  border-radius: 999px; padding: 8px 20px 8px 12px; box-shadow: 0 8px 18px rgba(0,0,0,0.18);
  margin-top: 4px;
}
.mc-best-pill-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; }
.mc-best-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-soft); font-weight: 700; }
.mc-best-value { font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 19px; color: var(--blue-bottom); }

.mc-settings-panel {
  position: absolute; top: 68px; right: 20px; z-index: 5;
  background: var(--white); color: var(--ink); border-radius: var(--radius-md); padding: 16px; width: 220px;
  box-shadow: 0 16px 34px rgba(0,0,0,0.25); animation: mc-fade-scale-in .18s ease;
}
.mc-settings-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; font-size: 14px; font-weight: 700; }
.mc-toggle { width: 40px; height: 22px; border-radius: 999px; background: rgba(36,17,71,0.15); border: none; position: relative; cursor: pointer; }
.mc-toggle i { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: var(--white); transition: left .18s ease; display: block; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
.mc-toggle.on { background: var(--green-bottom); }
.mc-toggle.on i { left: 20px; }
.mc-settings-reset { margin-top: 8px; width: 100%; background: transparent; border: 1px solid rgba(36,17,71,0.2); color: var(--red-bottom); border-radius: 10px; padding: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }

/* ---------- game screen ---------- */

.mc-game { transition: background .25s ease; }
.mc-game.flash-green::before, .mc-game.flash-red::before { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none; animation: mc-flash 0.5s ease-out; }
.mc-game.flash-green::before { background: radial-gradient(circle at 50% 45%, rgba(139,220,107,0.4), transparent 70%); }
.mc-game.flash-red::before { background: radial-gradient(circle at 50% 45%, rgba(229,83,75,0.4), transparent 70%); }
.mc-game.shake .mc-board { animation: mc-shake 0.4s ease; }

.mc-hud-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.mc-level-block { text-align: center; }
.mc-level-title { font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 19px; }
.mc-level-sub { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.75); margin-top: -2px; }
.mc-stars-row { display: flex; gap: 3px; min-width: 60px; justify-content: flex-end; }
.mc-life-star.lit { color: var(--gold); filter: drop-shadow(0 0 4px rgba(255,201,74,0.7)); }
.mc-life-star.dim { color: rgba(255,255,255,0.3); }

.mc-progress-track { height: 6px; border-radius: 999px; background: rgba(255,255,255,0.25); margin-top: 12px; overflow: hidden; }
.mc-progress-fill { height: 100%; border-radius: 999px; background: var(--gold); transition: width .3s ease; }

.mc-hud-mid { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.mc-timer-chip {
  display: flex; align-items: center; gap: 5px; background: var(--white); color: var(--ink);
  border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: 13px; font-family: 'Baloo 2', sans-serif;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15); white-space: nowrap;
}
.mc-timer-chip .urgent { color: var(--red-bottom); }
.mc-timer-track { flex: 1; height: 10px; border-radius: 999px; background: rgba(255,255,255,0.25); overflow: hidden; }
.mc-timer-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--gold), #ffe27a); transition: width .12s linear, background .3s ease; }
.mc-timer-fill.urgent { background: linear-gradient(90deg, var(--red-bottom), #ff9d8f); }

.mc-stat-row { display: flex; gap: 8px; margin-top: 14px; }
.mc-stat-chip { flex: 1; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); border-radius: 14px; padding: 8px 6px; text-align: center; display: flex; flex-direction: column; gap: 1px; }
.mc-stat-chip span { font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; color: rgba(255,255,255,0.75); }
.mc-stat-chip b { font-family: 'Baloo 2', sans-serif; font-size: 16px; }
.mc-stat-chip.combo-active { background: rgba(255,201,74,0.25); border-color: rgba(255,201,74,0.5); }
.mc-stat-chip.combo-active b { color: var(--gold); animation: mc-combo-pulse 0.6s ease; }
.mc-stat-row.level-pop .mc-level-title { animation: mc-level-pop 1.2s ease; }

.mc-board { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; position: relative; }

.mc-equation-card {
  width: 100%; max-width: 340px; background: linear-gradient(180deg, #7c3aed, #3b1077);
  border-radius: var(--radius-lg); padding: 34px 18px; text-align: center;
  box-shadow: 0 14px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
  animation: mc-fade-scale-in .35s cubic-bezier(.2,.9,.3,1.2);
}
.mc-equation { font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: clamp(32px, 8.5vw, 46px); color: var(--white); text-shadow: 0 2px 0 rgba(0,0,0,0.2); }

.mc-reward-chip {
  display: flex; align-items: center; gap: 6px; background: var(--white); color: var(--ink);
  font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 14px; padding: 6px 16px; border-radius: 999px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.15); margin-top: -6px;
}

.mc-choices { display: grid; gap: 14px; width: 100%; max-width: 340px; }
.choices-2 { grid-template-columns: repeat(2, 1fr); }
.choices-3 { grid-template-columns: repeat(3, 1fr); }
.choices-4 { grid-template-columns: repeat(2, 1fr); }

.mc-choice-btn {
  font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 24px; color: var(--white);
  background: linear-gradient(180deg, var(--blue-btn-top), var(--blue-btn-bottom));
  border: none; border-radius: 20px; padding: 22px 10px; cursor: pointer;
  box-shadow: 0 5px 0 var(--blue-btn-bevel), 0 10px 18px rgba(0,0,0,0.2);
  transition: transform .1s ease, box-shadow .1s ease;
}
.mc-choice-btn:active { transform: translateY(4px); box-shadow: 0 1px 0 var(--blue-btn-bevel), 0 4px 8px rgba(0,0,0,0.2); }
.mc-choice-btn:disabled { cursor: default; }
.mc-choice-btn.correct { background: linear-gradient(180deg, var(--green-top), var(--green-bottom)); box-shadow: 0 5px 0 var(--green-bevel), 0 10px 18px rgba(0,0,0,0.2); animation: mc-pop .35s ease; }
.mc-choice-btn.wrong { background: linear-gradient(180deg, var(--red-top), var(--red-bottom)); box-shadow: 0 5px 0 var(--red-bevel), 0 10px 18px rgba(0,0,0,0.2); animation: mc-shake .35s ease; }

.mc-popup-layer { position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; }
.mc-popup { position: absolute; top: 38%; font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 26px; animation: mc-float-up 0.9s ease-out forwards; }
.mc-popup.pos { color: #f3d9ff; text-shadow: 0 2px 6px rgba(0,0,0,0.3); }
.mc-popup.neg { color: #ffd6d2; text-shadow: 0 2px 6px rgba(0,0,0,0.3); }

.mc-particles { position: absolute; width: 0; height: 0; pointer-events: none; }
.mc-particle { position: absolute; width: 8px; height: 8px; border-radius: 3px; animation: mc-particle-fly 0.65s ease-out forwards; }

.mc-star-float-wrap { position: absolute; bottom: 30%; left: 0; right: 0; height: 0; pointer-events: none; }
.mc-star-float { position: absolute; color: var(--gold); animation: mc-star-rise 1.3s ease-out forwards; }

/* ---------- game over screen ---------- */

.mc-gameover { align-items: center; justify-content: center; }
.mc-go-card {
  width: 100%; max-width: 360px; background: var(--white); color: var(--ink);
  border-radius: var(--radius-lg); padding: 30px 26px; text-align: center;
  box-shadow: 0 22px 50px rgba(0,0,0,0.35); position: relative;
  animation: mc-fade-scale-in .3s ease;
}
.mc-newbest-badge {
  position: absolute; top: -16px; left: 50%; transform: translateX(-50%) translateY(-120px) scale(1.4);
  background: linear-gradient(180deg, var(--gold), var(--gold-bottom)); color: #6b4700;
  font-family: 'Baloo 2', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; padding: 6px 16px; border-radius: 999px;
  box-shadow: 0 8px 20px rgba(245,159,0,0.35); animation: mc-newbest-slam 0.5s cubic-bezier(.2,1,.3,1) forwards, mc-combo-pulse 1s ease 0.5s infinite;
}
.mc-go-title { font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 20px; color: var(--ink-soft); margin-bottom: 4px; }
.mc-go-score { font-family: 'Baloo 2', sans-serif; font-weight: 800; font-size: 54px; color: var(--blue-bottom); margin-bottom: 18px; }
.mc-go-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.mc-go-stat { background: var(--panel); border: 1px solid var(--panel-border); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 4px; }
.mc-go-stat span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-soft); font-weight: 700; }
.mc-go-stat b { font-family: 'Baloo 2', sans-serif; font-size: 18px; color: var(--ink); }
.mc-go-actions { display: flex; gap: 10px; }
.mc-go-actions .mc-btn-3d { flex: 1; padding: 14px 10px; font-size: 15px; }

/* ---------- keyframes ---------- */

@keyframes mc-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes mc-spark-glow { 0%,100% { opacity: 0.5; filter: drop-shadow(0 0 2px rgba(192,132,252,0.6)); } 50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(192,132,252,1)); } }
@keyframes mc-fade-scale-in { from { opacity: 0; transform: scale(0.9) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes mc-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(4px); } }
@keyframes mc-flash { from { opacity: 1; } to { opacity: 0; } }
@keyframes mc-pop { 0% { transform: scale(1); } 40% { transform: scale(1.08); } 100% { transform: scale(1); } }
@keyframes mc-float-up { 0% { opacity: 0; transform: translateY(10px) scale(0.8); } 20% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(1.1); } }
@keyframes mc-particle-fly { 0% { opacity: 1; transform: translate(0,0) rotate(0deg) scale(1); } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.4); } }
@keyframes mc-star-rise { 0% { opacity: 0; transform: translateY(0) scale(0.6) rotate(0deg); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-140px) scale(1.1) rotate(25deg); } }
@keyframes mc-newbest-slam {
  0% { transform: translateX(-50%) translateY(-120px) scale(1.4); }
  50% { transform: translateX(-50%) translateY(6px) scale(0.95); }
  70% { transform: translateX(-50%) translateY(-4px) scale(1.05); }
  85% { transform: translateX(-50%) translateY(2px) scale(0.98); }
  100% { transform: translateX(-50%) translateY(0) scale(1); }
}
@keyframes mc-combo-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
@keyframes mc-level-pop { 0% { transform: scale(1); } 15% { transform: scale(1.2); color: var(--gold); } 100% { transform: scale(1); } }
@keyframes mc-symbol-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(110vh) rotate(40deg); opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .mc-title, .mc-home-mascot, .mc-choice-btn, .mc-particle, .mc-star-float, .mc-newbest-badge, .mc-intro-symbol { animation: none !important; transform: none !important; }
}

@media (max-width: 380px) {
  .mc-equation { font-size: 28px; }
  .mc-choice-btn { font-size: 19px; padding: 18px 8px; }
  .mc-go-score { font-size: 44px; }
}
`;export{nt as default};
