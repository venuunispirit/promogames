import{r as c,j as t}from"./react-vendor-gyK15t0p.js";const E=["#ff4d6d","#ffd23f","#4dd4ff","#7cff6b","#c77dff","#ff9f4d"],ne={easy:{label:"Easy",colors:4,initialRows:5,pushInterval:9,speed:640,desc:"Slow pace, fewer colors"},medium:{label:"Medium",colors:5,initialRows:6,pushInterval:7,speed:720,desc:"Balanced challenge"},hard:{label:"Hard",colors:6,initialRows:7,pushInterval:5,speed:820,desc:"Fast & tricky"}},Ot=5,R=400,L=660,se=10,ve=R/se,C=ve/2,et=ve*.87,we=46,B=16,ye=13,T=L-70,A=R/2,ae=C,Et=10,Bt=25,Qe="bubbleShooterHighScore_v1",_=(p,o,h)=>Math.max(o,Math.min(h,p)),Ze=(p,o,h,f)=>Math.hypot(p-h,o-f);function It(p){const o=p.replace("#","");return{r:parseInt(o.substring(0,2),16),g:parseInt(o.substring(2,4),16),b:parseInt(o.substring(4,6),16)}}function ze(p,o){const{r:h,g:f,b:d}=It(p),v=u=>_(Math.round(u+o),0,255);return`rgb(${v(h)},${v(f)},${v(d)})`}function z(p){return p%2===1?se-1:se}function H(p,o){const h=p%2===1?C:0;return{x:o*ve+C+h,y:we+p*et+C}}function Pe(p,o){return(p%2===0?[[p,o-1],[p,o+1],[p-1,o-1],[p-1,o],[p+1,o-1],[p+1,o]]:[[p,o-1],[p,o+1],[p-1,o],[p-1,o+1],[p+1,o],[p+1,o+1]]).filter(([d,v])=>d>=0&&d<B&&v>=0&&v<z(d))}function be(p){return E[Math.floor(Math.random()*p)]}function tt(){const p=[];for(let o=0;o<B;o++)p.push(new Array(se).fill(null));return p}function Ft(p,o){const h=tt();for(let f=0;f<p;f++)for(let d=0;d<z(f);d++)h[f][d]=be(o);return h}function Vt(p){const o=new Array(se).fill(null);for(let h=0;h<se;h++)o[h]=be(p);return o}function b(p,o,h){const f=o||18,d=h||"currentColor";switch(p){case"trophy":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("path",{d:"M7 4h10v3.2a5 5 0 0 1-10 0V4z",fill:d}),t.jsx("path",{d:"M7 5.2H4.2A3 3 0 0 0 7 8",stroke:d,strokeWidth:"1.6",fill:"none",strokeLinecap:"round"}),t.jsx("path",{d:"M17 5.2h2.8A3 3 0 0 1 17 8",stroke:d,strokeWidth:"1.6",fill:"none",strokeLinecap:"round"}),t.jsx("rect",{x:"10.6",y:"12.2",width:"2.8",height:"3.6",fill:d}),t.jsx("rect",{x:"7.8",y:"17",width:"8.4",height:"2.2",rx:"1.1",fill:d})]});case"star":return t.jsx("svg",{width:f,height:f,viewBox:"0 0 24 24",fill:d,xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.3 6.6L12 17.9 5.9 20.4l1.3-6.6-4.9-4.5 6.6-.7L12 2.5z"})});case"speakerOn":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("path",{d:"M4 9v6h4l5 4V5L8 9H4z",fill:d}),t.jsx("path",{d:"M16.3 8.6a5 5 0 0 1 0 6.8",stroke:d,strokeWidth:"1.8",strokeLinecap:"round",fill:"none"}),t.jsx("path",{d:"M19 6.2a8.6 8.6 0 0 1 0 11.6",stroke:d,strokeWidth:"1.8",strokeLinecap:"round",fill:"none"})]});case"speakerOff":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("path",{d:"M4 9v6h4l5 4V5L8 9H4z",fill:d}),t.jsx("line",{x1:"16",y1:"9",x2:"21",y2:"15",stroke:d,strokeWidth:"1.8",strokeLinecap:"round"}),t.jsx("line",{x1:"21",y1:"9",x2:"16",y2:"15",stroke:d,strokeWidth:"1.8",strokeLinecap:"round"})]});case"pause":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",fill:d,xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("rect",{x:"6",y:"5",width:"4",height:"14",rx:"1.4"}),t.jsx("rect",{x:"14",y:"5",width:"4",height:"14",rx:"1.4"})]});case"play":return t.jsx("svg",{width:f,height:f,viewBox:"0 0 24 24",fill:d,xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M6 4.2v15.6l13-7.8-13-7.8z"})});case"gear":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("circle",{cx:"12",cy:"12",r:"3.3",fill:d}),t.jsxs("g",{stroke:d,strokeWidth:"2.4",strokeLinecap:"round",children:[t.jsx("line",{x1:"12",y1:"2.6",x2:"12",y2:"5.1"}),t.jsx("line",{x1:"12",y1:"18.9",x2:"12",y2:"21.4"}),t.jsx("line",{x1:"2.6",y1:"12",x2:"5.1",y2:"12"}),t.jsx("line",{x1:"18.9",y1:"12",x2:"21.4",y2:"12"}),t.jsx("line",{x1:"5.2",y1:"5.2",x2:"7",y2:"7"}),t.jsx("line",{x1:"17",y1:"17",x2:"18.8",y2:"18.8"}),t.jsx("line",{x1:"18.8",y1:"5.2",x2:"17",y2:"7"}),t.jsx("line",{x1:"7",y1:"17",x2:"5.2",y2:"18.8"})]})]});case"music":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("path",{d:"M9 17a2.4 2.4 0 1 1-2.4-2.4A2.4 2.4 0 0 1 9 17zM17 15a2.4 2.4 0 1 1-2.4-2.4A2.4 2.4 0 0 1 17 15z",fill:d}),t.jsx("path",{d:"M9 17V6.3l8-1.5v10.2",stroke:d,strokeWidth:"1.6",fill:"none",strokeLinejoin:"round"})]});case"haptics":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("rect",{x:"8",y:"3",width:"8",height:"18",rx:"2",stroke:d,strokeWidth:"1.8",fill:"none"}),t.jsx("line",{x1:"2.4",y1:"9",x2:"2.4",y2:"15",stroke:d,strokeWidth:"1.8",strokeLinecap:"round"}),t.jsx("line",{x1:"21.6",y1:"9",x2:"21.6",y2:"15",stroke:d,strokeWidth:"1.8",strokeLinecap:"round"})]});case"refresh":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("path",{d:"M4 12a8 8 0 0 1 13.8-5.6L20 8",stroke:d,strokeWidth:"2",strokeLinecap:"round",fill:"none"}),t.jsx("path",{d:"M20 12a8 8 0 0 1-13.8 5.6L4 16",stroke:d,strokeWidth:"2",strokeLinecap:"round",fill:"none"}),t.jsx("path",{d:"M20 4.2v3.9h-4M4 19.8v-3.9h4",stroke:d,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})]});case"home":return t.jsx("svg",{width:f,height:f,viewBox:"0 0 24 24",fill:d,xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"})});case"arrowRight":return t.jsx("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M4 12h15M13 6l6 6-6 6",stroke:d,strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})});case"check":return t.jsx("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M4 12.5l5.5 5.5L20 6.5",stroke:d,strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})});case"cross":return t.jsx("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M5 5l14 14M19 5L5 19",stroke:d,strokeWidth:"3",strokeLinecap:"round"})});case"flame":return t.jsx("svg",{width:f,height:f,viewBox:"0 0 24 24",fill:d,xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c0-1-1-2-1-3 2 1 4 4 4 7a6 6 0 0 1-12 0c0-5 3-7 6-12z"})});case"bubble":return t.jsxs("svg",{width:f,height:f,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:[t.jsx("circle",{cx:"12",cy:"12",r:"9.2",fill:d}),t.jsx("ellipse",{cx:"9",cy:"8.6",rx:"3",ry:"1.7",fill:"rgba(255,255,255,0.6)",transform:"rotate(-20 9 8.6)"})]});default:return null}}class Yt{constructor(){this.ctx=null,this.master=null,this.muted=!1}init(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}try{const o=window.AudioContext||window.webkitAudioContext;this.ctx=new o,this.master=this.ctx.createDynamicsCompressor(),this.master.threshold.setValueAtTime(-12,this.ctx.currentTime),this.master.knee.setValueAtTime(8,this.ctx.currentTime),this.master.ratio.setValueAtTime(4,this.ctx.currentTime),this.master.attack.setValueAtTime(.003,this.ctx.currentTime),this.master.release.setValueAtTime(.08,this.ctx.currentTime),this.master.connect(this.ctx.destination)}catch{this.ctx=null}}now(){return this.ctx?this.ctx.currentTime:0}blip(o,h,f,d){if(this.muted||!this.ctx)return;const v=this.now()+(f||0),u=this.ctx.createOscillator(),g=this.ctx.createGain();u.type="sine",u.frequency.setValueAtTime(o,v),d&&u.frequency.exponentialRampToValueAtTime(Math.max(20,d),v+h),g.gain.setValueAtTime(.22,v),g.gain.exponentialRampToValueAtTime(.001,v+h),u.connect(g),g.connect(this.master),u.start(v),u.stop(v+h+.02)}popNoise(o){if(this.muted||!this.ctx)return;const h=this.now(),f=Math.max(.01,o+.02),d=this.ctx.createBuffer(1,this.ctx.sampleRate*f,this.ctx.sampleRate),v=d.getChannelData(0);for(let X=0;X<v.length;X++)v[X]=Math.random()*2-1;const u=this.ctx.createBufferSource();u.buffer=d;const g=this.ctx.createBiquadFilter();g.type="bandpass",g.frequency.setValueAtTime(3e3,h),g.Q.setValueAtTime(.8,h);const U=this.ctx.createGain();U.gain.setValueAtTime(.08,h),U.gain.exponentialRampToValueAtTime(.001,h+o),u.connect(g),g.connect(U),U.connect(this.master),u.start(h),u.stop(h+f)}launch(){const o=this;o.blip(400,.12,0,900),o.blip(600,.08,.03)}pop(){const o=this;o.blip(800,.08,0,400),o.blip(500,.06,.015),o.popNoise(.05)}collision(){const o=this;o.blip(250,.08,0,150),o.blip(180,.05,.02)}drop(){const o=this;o.blip(500,.18,0,200),o.blip(300,.12,.06)}bounce(){this.blip(500,.05,0,350)}combo(){const o=this;o.blip(800,.08,0,1200),o.blip(1e3,.07,.06,1500),o.blip(1200,.06,.12,1800)}victory(){const o=this;o.blip(523,.2,0),o.blip(659,.2,.15),o.blip(784,.3,.3)}gameover(){this.blip(300,.4,0,150)}click(){this.blip(1e3,.04,0,800)}}const S=new Yt;function _t({gameData:p,sessionToken:o,onComplete:h}){const{settings:f,soundMap:d}=p||{},v=c.useRef(d||{});c.useEffect(()=>{v.current=d||{}},[d]),c.useCallback(e=>e&&v.current[e]||null,[]);const[u,g]=c.useState("home"),[U,X]=c.useState("home"),[ke,rt]=c.useState("medium"),[ie,Oe]=c.useState(1),[N,Ee]=c.useState(0),[V,Be]=c.useState(0),[q,Ie]=c.useState(!1),[W,nt]=c.useState(!0),[oe,at]=c.useState(!0),[Fe,je]=c.useState(0),[Dt,Ve]=c.useState(""),[Ye,Me]=c.useState(!1),Se=c.useRef(null),P=c.useRef(tt()),Y=c.useRef(null),ce=c.useRef([]),le=c.useRef([]),de=c.useRef([]),K=c.useRef([]),I=c.useRef(0),D=c.useRef(0),$=c.useRef(0),J=c.useRef(-Math.PI/2),fe=c.useRef(E[0]),pe=c.useRef(E[1]),ge=c.useRef(0),De=c.useRef(!1),Q=c.useRef(!1),st=c.useRef(typeof navigator<"u"&&("ontouchstart"in window||navigator.maxTouchPoints>0)),xe=c.useRef(null),Ge=c.useRef(0),Z=c.useRef(null),Re=c.useRef(!1),O=c.useRef(u),G=c.useRef(ke),F=c.useRef(ie),Ne=c.useRef(q),Te=c.useRef(W),_e=c.useRef(oe),ue=c.useRef(N),it=c.useRef(V);c.useEffect(()=>{O.current=u},[u]),c.useEffect(()=>{G.current=ke},[ke]),c.useEffect(()=>{F.current=ie},[ie]),c.useEffect(()=>{Ne.current=q},[q]),c.useEffect(()=>{Te.current=W},[W]),c.useEffect(()=>{_e.current=oe},[oe]),c.useEffect(()=>{ue.current=N},[N]),c.useEffect(()=>{it.current=V},[V]),c.useEffect(()=>{try{const e=localStorage.getItem(Qe);e&&Be(parseInt(e,10)||0)}catch{}},[]),c.useEffect(()=>{if(N>V){Be(N);try{localStorage.setItem(Qe,String(N))}catch{}}},[N]),c.useEffect(()=>{S.init()},[]);function m(e){switch(S.muted=Ne.current,e){case"click":S.click();break;case"launch":S.launch();break;case"collision":S.collision();break;case"pop":S.pop();break;case"drop":S.drop();break;case"bounce":S.bounce();break;case"combo":S.combo();break;case"victory":S.victory();break;case"gameover":S.gameover();break;case"levelclear":S.levelclear();break}}function We(){Z.current&&clearTimeout(Z.current);const e=[[261.6,329.6,392],[392,493.9,587.3],[440,523.3,659.3],[349.2,440,523.3]],a=1;let s=0;const l=()=>{if(!(!Te.current||O.current!=="game")){if(S.muted=Ne.current,!S.muted&&S.ctx){const r=e[s%e.length];s++;const i=S.ctx,n=i.createBiquadFilter();n.type="lowpass",n.frequency.value=900,n.Q.value=.7,n.connect(S.master),r.forEach(k=>{const M=i.createOscillator(),j=i.createGain();M.type="sine",M.frequency.value=k,j.gain.setValueAtTime(0,i.currentTime),j.gain.linearRampToValueAtTime(.08,i.currentTime+.12),j.gain.setValueAtTime(.08,i.currentTime+a*.7),j.gain.linearRampToValueAtTime(0,i.currentTime+a*.98),M.connect(j),j.connect(n),M.start(i.currentTime),M.stop(i.currentTime+a+.05)});const w=i.createOscillator(),x=i.createGain();w.type="sine",w.frequency.value=r[0]*2,x.gain.setValueAtTime(0,i.currentTime),x.gain.linearRampToValueAtTime(.035,i.currentTime+.08),x.gain.linearRampToValueAtTime(0,i.currentTime+a*.5),w.connect(x),x.connect(n),w.start(i.currentTime),w.stop(i.currentTime+a*.6)}Z.current=setTimeout(l,a*1e3)}};l()}function ee(){Z.current&&(clearTimeout(Z.current),Z.current=null)}function y(e){if(_e.current&&!(typeof navigator>"u"||!navigator.vibrate))try{switch(e){case"tap":navigator.vibrate(8);break;case"aim":navigator.vibrate([5,3]);break;case"small":navigator.vibrate(12);break;case"launch":navigator.vibrate([8,4,12]);break;case"land":navigator.vibrate([10,5]);break;case"pop":navigator.vibrate([15,8,20]);break;case"medium":navigator.vibrate(25);break;case"drop":navigator.vibrate([10,6,10,6,15]);break;case"combo":navigator.vibrate([12,5,12,5,20,8,25]);break;case"large":navigator.vibrate([30,15,50]);break;case"victory":navigator.vibrate([20,10,20,10,40,15,60]);break;case"gameover":navigator.vibrate([40,20,30,15,20]);break;default:break}}catch{}}function ot(e){rt(e),G.current=e,Oe(1),F.current=1,Ee(0),ue.current=0,Re.current=!1,Me(!1),Q.current=!1,Ae(e,1),g("game"),S.init(),m("click"),y("small")}function Ae(e,a){const s=ne[e],l=Math.min(B-4,s.initialRows+a-1),r=Math.min(E.length,s.colors+Math.floor((a-1)/2));P.current=Ft(l,r),Y.current=null,ce.current=[],le.current=[],de.current=[],K.current=[],I.current=0,D.current=0,$.current=0,ge.current=0,J.current=-Math.PI/2,fe.current=be(r),pe.current=be(r)}function $e(){Q.current=!1,Ae(G.current,F.current),g("game"),m("click"),y("tap")}function ct(){const e=F.current+1;Oe(e),F.current=e,Q.current=!1,Ae(G.current,e),g("game"),m("click"),y("tap")}function Ce(){ee(),g("home"),m("click"),y("tap")}function lt(e,a){const s=P.current;let l=null,r=1/0;for(let i=0;i<B;i++)for(let n=0;n<z(i);n++){if(s[i][n]||!(i===0||Pe(i,n).some(([M,j])=>s[M][j])))continue;const x=H(i,n),k=Ze(x.x,x.y,e,a);k<r&&(r=k,l={r:i,c:n,pos:x})}if(!l){for(let i=0;i<z(0);i++)if(!s[0][i]){l={r:0,c:i,pos:H(0,i)};break}}return l}function dt(e,a,s){const l=P.current,r=new Set,i=[[e,a]],n=[];for(;i.length;){const[w,x]=i.pop(),k=w+"_"+x;if(!r.has(k)&&(r.add(k),!(!l[w]||l[w][x]!==s))){n.push([w,x]);for(const[M,j]of Pe(w,x))r.has(M+"_"+j)||i.push([M,j])}}return n}function ft(){const e=P.current,a=new Set,s=[];for(let r=0;r<z(0);r++)e[0][r]&&(s.push([0,r]),a.add("0_"+r));for(;s.length;){const[r,i]=s.pop();for(const[n,w]of Pe(r,i)){const x=n+"_"+w;!a.has(x)&&e[n][w]&&(a.add(x),s.push([n,w]))}}const l=[];for(let r=0;r<B;r++)for(let i=0;i<z(r);i++)e[r][i]&&!a.has(r+"_"+i)&&l.push([r,i]);return l}function pt(e,a,s,l){for(let r=0;r<l;r++){const i=Math.random()*Math.PI*2,n=60+Math.random()*160;ce.current.push({x:e,y:a,vx:Math.cos(i)*n,vy:Math.sin(i)*n,color:s,size:2+Math.random()*3.5,life:.5+Math.random()*.4,maxLife:.9,gravity:260})}}function ut(e,a,s,l){de.current.push({x:e,y:a,text:s,color:l,life:1,vy:-40})}function ht(){K.current=[];for(let e=0;e<90;e++)K.current.push({x:Math.random()*R,y:-20-Math.random()*200,vx:(Math.random()-.5)*60,vy:60+Math.random()*90,color:E[Math.floor(Math.random()*E.length)],size:4+Math.random()*5,rot:Math.random()*Math.PI,rotSpeed:(Math.random()-.5)*6,life:4+Math.random()*2})}function Le(e){$.current=Math.max($.current,e)}function bt(){const e=P.current;for(let a=0;a<z(ye);a++)if(e[ye][a])return!0;for(let a=ye+1;a<B;a++)for(let s=0;s<z(a);s++)if(e[a][s])return!0;return!1}function gt(){const e=P.current;for(let a=0;a<B;a++)for(let s=0;s<z(a);s++)if(e[a][s])return!1;return!0}function xt(e,a,s){const l=P.current;l[e][a]=s,m("collision"),y("land");const r=dt(e,a,s);let i=0;if(r.length>=3){I.current+=1,D.current=1.4;const x=1+I.current*.5;for(const[j,te]of r){const re=H(j,te);l[j][te]=null,pt(re.x,re.y,s,10)}i+=Math.round(r.length*Et*x),m("pop"),I.current>=2&&m("combo"),y("pop"),Le(r.length>=5?8:4);const k=ft();if(k.length){const j=1+I.current*.5;for(const[te,re]of k){const Je=H(te,re),Pt=l[te][re];l[te][re]=null,le.current.push({x:Je.x,y:Je.y,vx:(Math.random()-.5)*60,vy:20,color:Pt,rot:0,rotSpeed:(Math.random()-.5)*6,life:2})}i+=Math.round(k.length*Bt*j),m("drop"),y("drop"),Le(6)}const M=H(e,a);ut(M.x,M.y-10,"+"+i,s),je(I.current)}else I.current=0,D.current=0,je(0);i>0&&(ue.current+=i,Ee(ue.current)),ge.current+=1;const n=ne[G.current],w=Math.max(3,n.pushInterval-(F.current-1));if(ge.current>=w&&(ge.current=0,mt()),bt()){yt("Bubbles reached the bottom!");return}gt()&&wt()}function mt(){const e=P.current,a=ne[G.current],s=Math.min(E.length,a.colors+Math.floor((F.current-1)/2));for(let l=B-1;l>0;l--)e[l]=e[l-1];e[0]=Vt(s),m("drop"),y("medium"),Le(5)}function yt(e){Ve(e),g("gameover"),m("gameover"),y("gameover"),ee()}function wt(){m("victory"),y("victory"),ht(),ee(),F.current>=Ot?Me(!0):Me(!1),g("victory")}function He(e,a){let s=e-A,l=a-T;l>-20&&(l=-20);let r=Math.atan2(l,s);const i=-Math.PI+.2;return r=_(r,i,-.2),r}function Ue(){if(O.current!=="game"||Y.current)return;const e=ne[G.current],a=J.current;Y.current={x:A,y:T,vx:Math.cos(a)*e.speed,vy:Math.sin(a)*e.speed,color:fe.current},m("launch"),y("launch")}function vt(){const e=Math.min(E.length,ne[G.current].colors+Math.floor((F.current-1)/2));fe.current=pe.current,pe.current=be(e)}function Xe(e){const a=Se.current;if(!a)return{x:0,y:0};const s=a.getBoundingClientRect(),l=R/s.width,r=L/s.height,i=e.clientX!==void 0?e.clientX:e.touches&&e.touches[0]?e.touches[0].clientX:0,n=e.clientY!==void 0?e.clientY:e.touches&&e.touches[0]?e.touches[0].clientY:0;return{x:(i-s.left)*l,y:(n-s.top)*r}}function kt(e){if(O.current!=="game")return;const{x:a,y:s}=Xe(e);J.current=He(a,s)}function jt(e){if(O.current!=="game")return;De.current=!0;const{x:a,y:s}=Xe(e);J.current=He(a,s),st.current?Q.current?(Ue(),Q.current=!1):(Q.current=!0,y("aim")):Ue()}function Mt(){De.current=!1}function he(e,a,s,l,r){const i=e.createRadialGradient(a-l*.35,s-l*.4,l*.15,a,s,l);i.addColorStop(0,ze(r,90)),i.addColorStop(.45,r),i.addColorStop(1,ze(r,-40)),e.beginPath(),e.arc(a,s,l,0,Math.PI*2),e.fillStyle=i,e.shadowColor="rgba(0,0,0,0.35)",e.shadowBlur=6,e.shadowOffsetY=2,e.fill(),e.shadowColor="transparent",e.shadowBlur=0,e.shadowOffsetY=0,e.beginPath(),e.ellipse(a-l*.35,s-l*.4,l*.34,l*.2,-.5,0,Math.PI*2),e.fillStyle="rgba(255,255,255,0.55)",e.fill(),e.beginPath(),e.arc(a,s,l-.75,0,Math.PI*2),e.lineWidth=1.5,e.strokeStyle="rgba(255,255,255,0.25)",e.stroke()}function St(e){e.clearRect(0,0,R,L);const a=e.createLinearGradient(0,0,0,L);a.addColorStop(0,"#2b0f52"),a.addColorStop(.55,"#4a1f7a"),a.addColorStop(1,"#2a0f4d"),e.fillStyle=a,e.fillRect(0,0,R,L),e.fillStyle="rgba(255,255,255,0.03)";for(let r=0;r<40;r++){const i=r*53%R,n=r*97%L;e.beginPath(),e.arc(i,n,1.4,0,Math.PI*2),e.fill()}if(e.save(),$.current>.1){const r=$.current;e.translate((Math.random()-.5)*r,(Math.random()-.5)*r)}e.strokeStyle="rgba(255,80,100,0.35)",e.setLineDash([6,6]),e.beginPath();const s=we+ye*et+C;e.moveTo(0,s),e.lineTo(R,s),e.stroke(),e.setLineDash([]);const l=P.current;for(let r=0;r<B;r++)for(let i=0;i<z(r);i++)if(l[r][i]){const n=H(r,i);he(e,n.x,n.y,C-1.5,l[r][i])}for(const r of le.current)e.save(),e.translate(r.x,r.y),e.rotate(r.rot),e.globalAlpha=_(r.life/2,0,1),he(e,0,0,C-2,r.color),e.restore(),e.globalAlpha=1;if(O.current==="game"&&!Y.current&&Rt(e),Y.current){const r=Y.current;he(e,r.x,r.y,ae-1.5,r.color)}for(const r of ce.current)e.globalAlpha=_(r.life/r.maxLife,0,1),e.beginPath(),e.arc(r.x,r.y,r.size,0,Math.PI*2),e.fillStyle=r.color,e.fill();e.globalAlpha=1;for(const r of de.current)e.globalAlpha=_(r.life,0,1),e.font="bold 20px sans-serif",e.fillStyle=r.color,e.textAlign="center",e.fillText(r.text,r.x,r.y),e.globalAlpha=1;if(D.current>0&&I.current>=2){const r=_(D.current/1.4,0,1),i=1+(1-r)*.4;e.save(),e.globalAlpha=r,e.translate(R/2,L/2-60),e.scale(i,i),e.font="bold 30px sans-serif",e.textAlign="center",e.fillStyle="#ffd23f",e.shadowColor="rgba(0,0,0,0.5)",e.shadowBlur=8,e.fillText("COMBO x"+I.current+"!",0,0),e.restore(),e.globalAlpha=1}Nt(e),e.restore();for(const r of K.current)e.save(),e.translate(r.x,r.y),e.rotate(r.rot),e.globalAlpha=_(r.life/2,0,1),e.fillStyle=r.color,e.fillRect(-r.size/2,-r.size/2,r.size,r.size*.6),e.restore();e.globalAlpha=1}function Rt(e){const a=J.current;let s=Math.cos(a),l=Math.sin(a);e.save(),e.setLineDash([8,8]),e.strokeStyle="rgba(255,255,255,0.55)",e.lineWidth=2,e.beginPath(),e.moveTo(A,T);let r=0,i=A,n=T;for(;r<400&&n>we;)i+=s*4,n+=l*4,(i<=C||i>=R-C)&&(s=-s,i=_(i,C,R-C)),e.lineTo(i,n),r++;e.stroke(),e.restore(),e.setLineDash([])}function Nt(e){const a=J.current,s=e.createRadialGradient(A,T+10,5,A,T+10,60);s.addColorStop(0,"rgba(199,125,255,0.35)"),s.addColorStop(1,"rgba(199,125,255,0)"),e.fillStyle=s,e.fillRect(A-60,T-40,120,100),e.save(),e.translate(A,T),e.rotate(a+Math.PI/2);const l=e.createLinearGradient(-14,0,14,0);l.addColorStop(0,"#8a4fd1"),l.addColorStop(.5,"#c77dff"),l.addColorStop(1,"#8a4fd1"),e.fillStyle=l,e.beginPath(),e.roundRect?e.roundRect(-13,-46,26,46,8):e.rect(-13,-46,26,46),e.fill(),e.restore();const r=e.createRadialGradient(A-8,T-8,4,A,T,34);r.addColorStop(0,"#e6c7ff"),r.addColorStop(.5,"#9b5de5"),r.addColorStop(1,"#5a2a8f"),e.beginPath(),e.arc(A,T,30,0,Math.PI*2),e.fillStyle=r,e.fill(),e.lineWidth=2,e.strokeStyle="rgba(255,255,255,0.3)",e.stroke(),fe.current&&he(e,A,T,C-1,fe.current);const i=A+62,n=T+4;e.font="10px sans-serif",e.fillStyle="rgba(255,255,255,0.6)",e.textAlign="center",e.fillText("NEXT",i,n-20),pe.current&&he(e,i,n,(C-1)*.7,pe.current)}c.useEffect(()=>{function e(a){const s=Math.min(.033,(a-(Ge.current||a))/1e3);if(Ge.current=a,O.current==="game"){const n=Y.current;if(n){n.x+=n.vx*s,n.y+=n.vy*s,n.x-ae<=0&&(n.x=ae,n.vx=-n.vx,m("bounce"),y("tap")),n.x+ae>=R&&(n.x=R-ae,n.vx=-n.vx,m("bounce"),y("tap"));let w=!1;if(n.y-ae<=we)w=!0;else{const x=P.current;e:for(let k=0;k<B;k++)for(let M=0;M<z(k);M++){if(!x[k][M])continue;const j=H(k,M);if(Ze(j.x,j.y,n.x,n.y)<=ve*.92){w=!0;break e}}}if(w){const x=lt(n.x,n.y),k=n.color;Y.current=null,x&&xt(x.r,x.c,k),vt()}}D.current>0&&(D.current-=s,D.current<=0&&je(0))}const r=380;le.current=le.current.filter(n=>(n.vy+=r*s,n.x+=n.vx*s,n.y+=n.vy*s,n.rot+=n.rotSpeed*s,n.life-=s,n.life>0&&n.y<L+60)),ce.current=ce.current.filter(n=>(n.vy+=n.gravity*s,n.x+=n.vx*s,n.y+=n.vy*s,n.life-=s,n.life>0)),de.current=de.current.filter(n=>(n.y+=n.vy*s,n.life-=s*.8,n.life>0)),K.current=K.current.filter(n=>(n.x+=n.vx*s,n.y+=n.vy*s,n.rot+=n.rotSpeed*s,n.life-=s,n.life>0&&n.y<L+40)),$.current>0&&($.current*=.88);const i=Se.current;if(i){const n=i.getContext("2d");St(n)}xe.current=requestAnimationFrame(e)}return xe.current=requestAnimationFrame(e),()=>{xe.current&&cancelAnimationFrame(xe.current)}},[]),c.useEffect(()=>(u==="game"&&W?We():ee(),()=>ee()),[u,W]),c.useEffect(()=>{const e=()=>{document.hidden?ee():O.current==="game"&&Te.current&&We()};return document.addEventListener("visibilitychange",e),()=>document.removeEventListener("visibilitychange",e)},[]),c.useEffect(()=>{function e(a){a.key==="Escape"&&(O.current==="game"?(X("game"),g("paused"),m("click"),y("tap")):O.current==="paused"&&(g("game"),m("click"),y("tap")))}return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[]);function qe(e){X(e),g("settings"),m("click"),y("tap")}function Tt(){g(U),m("click"),y("tap")}function At(){g("paused"),m("click"),y("tap")}function Ct(){g("game"),m("click"),y("tap")}const Ke=c.useCallback(async()=>{if(!Re.current){Re.current=!0;try{o&&await fetch("/api/play/session/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_token:o,score:ue.current,player_data:{}})})}catch{}h==null||h()}},[o,h]);c.useEffect(()=>{u==="gameover"&&Ke()},[u,Ke]);const Lt=`
    * { box-sizing: border-box; }
    .bs-root {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(160deg, #8fe3ff 0%, #57c3f5 55%, #2e9ee0 100%);
      padding: 16px;
      position: relative;
      overflow: hidden;
    }
    .bs-stage {
      position: relative;
      width: 100%;
      max-width: 420px;
      aspect-ratio: ${R} / ${L};
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(10,60,100,0.45), 0 0 0 6px rgba(255,255,255,0.55);
    }
    .bs-canvas {
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
      cursor: crosshair;
    }
    .bs-hud {
      position: absolute;
      top: 0; left: 0; right: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px 12px;
      pointer-events: none;
    }
    .bs-hud > * { pointer-events: auto; }
    .candy-chip {
      background: linear-gradient(180deg, #fffef8, #fff3d6);
      border-radius: 999px;
      padding: 7px 14px 7px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 900;
      font-size: 13px;
      color: #5a3d1f;
      box-shadow: 0 4px 0 rgba(0,0,0,0.12), 0 6px 10px rgba(0,0,0,0.2), 0 0 0 3px rgba(255,255,255,0.6);
    }
    .candy-chip .chip-icon {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
      background: radial-gradient(circle at 35% 30%, #fff2b0, #ffb347);
      box-shadow: 0 2px 3px rgba(0,0,0,0.25);
    }
    .candy-chip .chip-sub { font-size: 9px; font-weight: 800; color: #9a7a4a; }
    .candy-icon-btn {
      width: 42px; height: 42px;
      border-radius: 50%;
      border: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
      cursor: pointer;
      position: relative;
      color: #fff;
      box-shadow: 0 4px 0 rgba(0,0,0,0.25), 0 7px 12px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,255,255,0.55);
      transition: transform 0.1s ease;
    }
    .candy-icon-btn::after {
      content: ''; position: absolute; top: 12%; left: 20%; width: 42%; height: 30%;
      border-radius: 50%; background: rgba(255,255,255,0.45); pointer-events: none;
    }
    .candy-icon-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.2), 0 0 0 3px rgba(255,255,255,0.55); }
    .icon-blue { background: linear-gradient(180deg, #7fd6ff, #329bdb); }
    .icon-purple { background: linear-gradient(180deg, #c79bff, #8a5cf0); }
    .bs-combo-pill {
      position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
      padding: 5px 16px; border-radius: 999px;
      font-size: 12px; font-weight: 900; color: #6a3d00;
      background: linear-gradient(180deg,#ffe37a,#ffb347);
      box-shadow: 0 4px 0 #d9871f, 0 6px 12px rgba(0,0,0,0.3);
      animation: bsPop 0.3s ease;
    }
    @keyframes bsPop { from { transform: translateX(-50%) scale(0.4); opacity:0; } to { transform: translateX(-50%) scale(1); opacity:1; } }
    .bs-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      background: linear-gradient(160deg, rgba(70,190,240,0.92), rgba(30,120,190,0.94));
      animation: bsFadeIn 0.3s ease;
      padding: 30px 22px 24px;
      text-align: center;
      overflow-y: auto;
    }
    @keyframes bsFadeIn { from { opacity: 0; transform: scale(0.97);} to { opacity: 1; transform: scale(1);} }
    .bs-float-bubble {
      position: absolute;
      border-radius: 50%;
      opacity: 0.45;
      animation: bsFloat 8s ease-in-out infinite;
    }
    @keyframes bsFloat {
      0%, 100% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-24px) translateX(10px); }
    }
    .ribbon-wrap { position: relative; margin-bottom: 14px; z-index: 3; }
    .ribbon {
      position: relative;
      padding: 12px 30px;
      font-weight: 900;
      font-size: 16px;
      letter-spacing: 0.3px;
      color: #fff;
      text-shadow: 0 2px 2px rgba(0,0,0,0.3);
      white-space: nowrap;
      clip-path: polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%);
      display: inline-block;
    }
    .ribbon::before, .ribbon::after {
      content: ''; position: absolute; top: 70%; width: 14px; height: 18px; z-index: -1;
    }
    .ribbon::before { left: -9px; transform: skewY(20deg); border-radius: 0 0 0 3px; }
    .ribbon::after { right: -9px; transform: skewY(-20deg); border-radius: 0 0 3px 0; }
    .ribbon-purple { background: linear-gradient(180deg, #c39bff, #7c4dd6); }
    .ribbon-purple::before, .ribbon-purple::after { background: #52299e; }
    .ribbon-orange { background: linear-gradient(180deg, #ffcb7a, #ff8a3d); }
    .ribbon-orange::before, .ribbon-orange::after { background: #c05a1a; }
    .ribbon-pink { background: linear-gradient(180deg, #ffabd9, #ff5fa0); }
    .ribbon-pink::before, .ribbon-pink::after { background: #c22d72; }
    .ribbon-teal { background: linear-gradient(180deg, #7ff0dd, #2bbfa8); }
    .ribbon-teal::before, .ribbon-teal::after { background: #178a78; }
    .ribbon-red { background: linear-gradient(180deg, #ff9d9d, #ef4444); }
    .ribbon-red::before, .ribbon-red::after { background: #a82323; }
    .candy-panel {
      background: linear-gradient(180deg, #fffef9, #fff6e4);
      border-radius: 26px;
      padding: 30px 22px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 100%;
      max-width: 300px;
      box-shadow: 0 10px 0 rgba(0,0,0,0.15), 0 18px 30px rgba(0,0,0,0.3), 0 0 0 5px rgba(255,255,255,0.3);
      position: relative;
    }
    .candy-subtitle { color: #7a6a52; font-size: 13px; font-weight: 700; margin: -6px 0 0; }
    .candy-score-big {
      font-size: 42px;
      font-weight: 900;
      color: #ff8a3d;
      text-shadow: 0 3px 0 rgba(0,0,0,0.08);
      margin: 0;
    }
    .bs-title-plain {
      font-size: 27px;
      font-weight: 900;
      color: #fff;
      text-shadow: 0 3px 0 rgba(0,0,0,0.2), 0 6px 14px rgba(0,0,0,0.25);
      margin: 0;
      letter-spacing: 0.5px;
    }
    .bs-subtitle-plain { color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 700; margin-top: -10px; }
    .candy-btn {
      position: relative;
      border: none;
      border-radius: 50px;
      padding: 15px 26px;
      font-weight: 900;
      font-size: 15px;
      color: #fff;
      text-shadow: 0 2px 2px rgba(0,0,0,0.28);
      cursor: pointer;
      width: 100%;
      max-width: 250px;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    .candy-btn::after {
      content: ''; position: absolute; top: 8%; left: 8%; right: 8%; height: 34%;
      border-radius: 50px; background: rgba(255,255,255,0.32); pointer-events: none;
    }
    .candy-btn:active { transform: translateY(4px); }
    .candy-green { background: linear-gradient(180deg,#b3e876,#6fbf3f); box-shadow: 0 6px 0 #4c8a29, 0 10px 16px rgba(0,0,0,0.3); }
    .candy-green:active { box-shadow: 0 2px 0 #4c8a29, 0 4px 8px rgba(0,0,0,0.25); }
    .candy-blue { background: linear-gradient(180deg,#7dd3ff,#2e9ee0); box-shadow: 0 6px 0 #1c6fa8, 0 10px 16px rgba(0,0,0,0.3); }
    .candy-blue:active { box-shadow: 0 2px 0 #1c6fa8, 0 4px 8px rgba(0,0,0,0.25); }
    .candy-purple { background: linear-gradient(180deg,#cba0ff,#8a5cf0); box-shadow: 0 6px 0 #5c34b8, 0 10px 16px rgba(0,0,0,0.3); }
    .candy-purple:active { box-shadow: 0 2px 0 #5c34b8, 0 4px 8px rgba(0,0,0,0.25); }
    .candy-orange { background: linear-gradient(180deg,#ffcb7a,#ff8a3d); box-shadow: 0 6px 0 #c05a1a, 0 10px 16px rgba(0,0,0,0.3); }
    .candy-orange:active { box-shadow: 0 2px 0 #c05a1a, 0 4px 8px rgba(0,0,0,0.25); }
    .candy-pink { background: linear-gradient(180deg,#ffabd9,#ff5fa0); box-shadow: 0 6px 0 #c22d72, 0 10px 16px rgba(0,0,0,0.3); }
    .candy-pink:active { box-shadow: 0 2px 0 #c22d72, 0 4px 8px rgba(0,0,0,0.25); }
    .candy-red { background: linear-gradient(180deg,#ff9d9d,#ef4444); box-shadow: 0 6px 0 #a82323, 0 10px 16px rgba(0,0,0,0.3); }
    .candy-red:active { box-shadow: 0 2px 0 #a82323, 0 4px 8px rgba(0,0,0,0.25); }
    .candy-btn.small { padding: 10px 20px; font-size: 12px; max-width: 160px; }
    .bs-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    .candy-round {
      width: 50px; height: 50px; border-radius: 50%;
      border: none; display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: #fff; cursor: pointer; position: relative;
      box-shadow: 0 5px 0 rgba(0,0,0,0.2), 0 8px 14px rgba(0,0,0,0.3);
      transition: transform 0.1s ease;
    }
    .candy-round::after {
      content: ''; position: absolute; top: 14%; left: 20%; width: 40%; height: 28%;
      border-radius: 50%; background: rgba(255,255,255,0.4);
    }
    .candy-round:active { transform: translateY(3px); }
    .candy-check { background: linear-gradient(180deg,#a4e263,#4c9a2a); box-shadow: 0 5px 0 #33691e, 0 8px 14px rgba(0,0,0,0.3); }
    .candy-x { background: linear-gradient(180deg,#ff8f8f,#e33d3d); box-shadow: 0 5px 0 #a82323, 0 8px 14px rgba(0,0,0,0.3); }
    .bs-card-row { display: flex; flex-direction: column; gap: 12px; width: 100%; }
    .bs-diff-card {
      display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
      padding: 14px 18px; border-radius: 18px; cursor: pointer; text-align: left;
      color: #4a3520; transition: transform 0.12s ease;
      box-shadow: 0 5px 0 rgba(0,0,0,0.12), 0 8px 14px rgba(0,0,0,0.18);
    }
    .bs-diff-card:active { transform: translateY(3px); }
    .bs-diff-card .bs-diff-name { font-size: 16px; font-weight: 900; }
    .bs-diff-card .bs-diff-desc { font-size: 11.5px; opacity: 0.75; font-weight: 700; }
    .bs-diff-easy { background: linear-gradient(180deg,#d4f5b0,#a4e263); }
    .bs-diff-medium { background: linear-gradient(180deg,#ffe7a8,#ffcb7a); }
    .bs-diff-hard { background: linear-gradient(180deg,#ffb3c6,#ff8fae); }
    .bs-toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; padding: 10px 6px; font-weight: 800; font-size: 13.5px; color: #4a3520;
    }
    .candy-switch {
      width: 68px; height: 32px; border-radius: 999px; position: relative;
      border: none; cursor: pointer; box-shadow: 0 3px 6px rgba(0,0,0,0.25) inset, 0 0 0 2px rgba(255,255,255,0.5);
    }
    .candy-switch.on { background: linear-gradient(180deg,#7dd3ff,#2e9ee0); }
    .candy-switch.off { background: linear-gradient(180deg,#d8dbe3,#a4a9b6); }
    .candy-switch::after {
      content: ''; position: absolute; top: 3px; width: 26px; height: 26px; border-radius: 50%;
      background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.35); transition: left 0.18s ease;
    }
    .candy-switch.on::after { left: 39px; }
    .candy-switch.off::after { left: 3px; }
    .candy-switch-label {
      position: absolute; top: 50%; transform: translateY(-50%);
      font-size: 9.5px; font-weight: 900; color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,0.3);
    }
    .candy-switch.on .candy-switch-label { left: 8px; }
    .candy-switch.off .candy-switch-label { right: 8px; color: #626878; text-shadow: none; }

    /* ---------- THANK YOU PAGE ---------- */
    .ty-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(160deg, #a855f7 0%, #7c3aed 40%, #6d28d9 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; padding: 24px 20px; text-align: center; overflow-y: auto;
      animation: bsFadeIn 0.4s ease;
    }
    .ty-confetti {
      position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
    }
    .ty-dot {
      position: absolute; top: -10px; border-radius: 50%; opacity: 0.7;
      animation: tyFall linear infinite;
    }
    @keyframes tyFall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 0.8; }
      100% { transform: translateY(680px) rotate(360deg); opacity: 0.1; }
    }
    .ty-trophy-wrap {
      position: relative; z-index: 1; margin-bottom: 2px;
    }
    .ty-trophy-glow {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 120px; height: 120px; border-radius: 50%;
      background: radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(255,215,0,0) 70%);
      animation: tyPulse 2s ease-in-out infinite;
    }
    @keyframes tyPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);} 50%{transform:translate(-50%,-50%) scale(1.15);} }
    .ty-trophy {
      position: relative; z-index: 1;
      filter: drop-shadow(0 6px 20px rgba(255,215,0,0.5));
      animation: tyBounce 0.6s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes tyBounce { 0%{transform:scale(0.3) translateY(30px);opacity:0;} 60%{transform:scale(1.1) translateY(-5px);} 100%{transform:scale(1) translateY(0);opacity:1;} }
    .ty-ribbon-wrap { position: relative; z-index: 1; margin: -4px 0 4px; }
    .ty-ribbon {
      background: linear-gradient(180deg, #4f46e5 0%, #3730a3 100%);
      color: #fff; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem;
      letter-spacing: 2px; padding: 8px 28px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: inline-flex; align-items: center; gap: 8px;
      animation: tySlideUp 0.5s cubic-bezier(.2,1.2,.4,1) 0.2s backwards;
    }
    .ty-ribbon-star { color: #FFD700; font-size: 12px; }
    @keyframes tySlideUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
    .ty-title {
      font-family: 'Fredoka', sans-serif; font-size: 1.8rem; font-weight: 700;
      color: #fff; margin: 0; text-shadow: 0 3px 12px rgba(0,0,0,0.25);
      animation: tySlideUp 0.5s cubic-bezier(.2,1.2,.4,1) 0.3s backwards;
    }
    .ty-subtitle {
      color: rgba(255,255,255,0.85); font-size: 0.85rem; font-weight: 600; margin: 0;
      animation: tySlideUp 0.5s cubic-bezier(.2,1.2,.4,1) 0.35s backwards;
    }
    .ty-subtitle strong { color: #FFD700; }
    .ty-card {
      background: rgba(255,255,255,0.95); border-radius: 20px; padding: 18px 22px;
      width: 100%; max-width: 280px; position: relative; z-index: 1;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      animation: tySlideUp 0.5s cubic-bezier(.2,1.2,.4,1) 0.4s backwards;
    }
    .ty-card-icon {
      width: 44px; height: 44px; border-radius: 50%; margin: 0 auto 8px;
      background: linear-gradient(135deg, #c4b5fd, #a78bfa);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(124,58,237,0.3);
    }
    .ty-card-label {
      font-weight: 800; font-size: 0.85rem; color: #1e1b4b; margin: 0 0 10px;
    }
    .ty-progress-bar {
      position: relative; height: 10px; background: #e9e5f5; border-radius: 999px;
      overflow: visible; margin-bottom: 6px;
    }
    .ty-progress-fill {
      height: 100%; border-radius: 999px;
      background: linear-gradient(90deg, #7c3aed, #a855f7);
      transition: width 0.8s cubic-bezier(.2,1,.4,1);
      box-shadow: 0 0 8px rgba(124,58,237,0.4);
    }
    .ty-progress-dot {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 20px; height: 20px; border-radius: 50%;
      background: #fff; border: 3px solid #7c3aed;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .ty-dot-left { left: -4px; }
    .ty-dot-right { right: -4px; }
    .ty-progress-text {
      font-size: 0.75rem; font-weight: 700; color: #6b7280; margin: 4px 0 0;
    }
    .ty-stars {
      display: flex; gap: 10px; margin: 4px 0;
      animation: tySlideUp 0.5s cubic-bezier(.2,1.2,.4,1) 0.5s backwards;
    }
    .ty-star { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }
    .ty-star.filled { animation: tyStarPop 0.4s cubic-bezier(.34,1.56,.64,1) backwards; }
    .ty-star:nth-child(2).filled { animation-delay: 0.1s; }
    .ty-star:nth-child(3).filled { animation-delay: 0.2s; }
    @keyframes tyStarPop { 0%{transform:scale(0) rotate(-30deg);} 100%{transform:scale(1) rotate(0deg);} }
    .ty-actions {
      display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 280px;
      animation: tySlideUp 0.5s cubic-bezier(.2,1.2,.4,1) 0.55s backwards;
    }
    .ty-btn {
      border: none; border-radius: 999px; padding: 14px 24px;
      font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 0.95rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ty-btn:active { transform: translateY(3px); }
    .ty-btn-primary {
      background: linear-gradient(180deg, #a855f7, #7c3aed);
      color: #fff; box-shadow: 0 5px 0 #5b21b6, 0 8px 20px rgba(124,58,237,0.4);
    }
    .ty-btn-primary:active { box-shadow: 0 2px 0 #5b21b6; }
    .ty-btn-secondary {
      background: rgba(255,255,255,0.15); color: #fff;
      border: 2px solid rgba(255,255,255,0.3);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .ty-btn-secondary:active { box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .ty-btn-icon {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;
    }
  `;function me(e,a,s){return t.jsx("div",{className:"ribbon-wrap",children:t.jsxs("span",{className:`ribbon ribbon-${a}`,children:[s&&t.jsx("span",{style:{display:"inline-flex",verticalAlign:"middle",marginRight:7,position:"relative",top:-1},children:b(s,16,"#fff")}),e]})})}const zt=c.useMemo(()=>new Array(10).fill(0).map((e,a)=>({id:a,size:20+Math.random()*50,left:Math.random()*90,top:Math.random()*90,color:E[a%E.length],delay:Math.random()*4,dur:6+Math.random()*5})),[]);return t.jsxs("div",{className:"bs-root",children:[t.jsx("style",{children:Lt}),t.jsxs("div",{className:"bs-stage",children:[t.jsx("canvas",{ref:Se,width:R,height:L,className:"bs-canvas",onPointerMove:kt,onPointerDown:jt,onPointerUp:Mt}),(u==="game"||u==="paused")&&t.jsxs("div",{className:"bs-hud",children:[t.jsxs("div",{className:"candy-chip",children:[t.jsx("span",{className:"chip-icon",children:b("trophy",14,"#a0722a")}),t.jsx("span",{children:V})]}),t.jsxs("div",{className:"candy-chip",style:{flexDirection:"column",alignItems:"flex-start",gap:0,padding:"6px 14px"},children:[t.jsxs("span",{style:{fontSize:15,display:"flex",alignItems:"center",gap:4},children:[b("star",14,"#e6a817")," ",N]}),t.jsxs("span",{className:"chip-sub",children:["LEVEL ",ie]})]}),t.jsxs("div",{style:{display:"flex",gap:8},children:[t.jsx("button",{className:"candy-icon-btn icon-blue",onClick:()=>Ie(e=>!e),title:"Mute",children:b(q?"speakerOff":"speakerOn",18,"#fff")}),t.jsx("button",{className:"candy-icon-btn icon-purple",onClick:At,title:"Pause",children:b("pause",18,"#fff")})]})]}),Fe>=2&&u==="game"&&t.jsxs("div",{className:"bs-combo-pill",children:[b("flame",12,"#e65100")," COMBO x",Fe]}),u==="home"&&t.jsxs("div",{className:"bs-overlay",children:[zt.map(e=>t.jsx("div",{className:"bs-float-bubble",style:{width:e.size,height:e.size,left:e.left+"%",top:e.top+"%",background:`radial-gradient(circle at 30% 30%, ${ze(e.color,60)}, ${e.color})`,animationDelay:e.delay+"s",animationDuration:e.dur+"s"}},e.id)),me("BUBBLE BLAST","purple","bubble"),t.jsx("p",{className:"bs-subtitle-plain",children:"Pop. Combo. Conquer."}),t.jsxs("div",{className:"candy-chip",style:{marginTop:-4},children:[t.jsx("span",{className:"chip-icon",children:b("trophy",14,"#a0722a")}),t.jsxs("span",{children:["High Score: ",V]})]}),t.jsxs("button",{className:"candy-btn candy-green",onClick:()=>{m("click"),y("tap"),g("difficulty")},children:[b("play",16,"#fff")," Play"]}),t.jsxs("button",{className:"candy-btn candy-blue",onClick:()=>qe("home"),children:[b("gear",16,"#fff")," Settings"]})]}),u==="difficulty"&&t.jsxs("div",{className:"bs-overlay",children:[me("Choose Difficulty","orange","flame"),t.jsx("div",{className:"candy-panel",style:{marginTop:-4},children:t.jsx("div",{className:"bs-card-row",children:Object.entries(ne).map(([e,a])=>t.jsxs("div",{className:`bs-diff-card bs-diff-${e}`,onClick:()=>ot(e),children:[t.jsx("span",{className:"bs-diff-name",children:a.label}),t.jsx("span",{className:"bs-diff-desc",children:a.desc})]},e))})}),t.jsx("button",{className:"candy-round candy-x",onClick:()=>{m("click"),y("tap"),g("home")},title:"Back",children:b("cross",20,"#fff")})]}),u==="paused"&&t.jsxs("div",{className:"bs-overlay",children:[me("Paused","purple","pause"),t.jsxs("div",{className:"candy-panel",style:{marginTop:-4},children:[t.jsxs("button",{className:"candy-btn candy-green",onClick:Ct,children:[b("play",16,"#fff")," Resume"]}),t.jsxs("button",{className:"candy-btn candy-blue",onClick:()=>qe("paused"),children:[b("gear",16,"#fff")," Settings"]}),t.jsxs("button",{className:"candy-btn candy-orange",onClick:$e,children:[b("refresh",16,"#fff")," Restart"]}),t.jsxs("button",{className:"candy-btn candy-pink",onClick:Ce,children:[b("home",16,"#fff")," Home"]})]})]}),u==="settings"&&t.jsxs("div",{className:"bs-overlay",children:[me("Settings","purple","gear"),t.jsxs("div",{className:"candy-panel",style:{marginTop:-4},children:[t.jsxs("div",{className:"bs-toggle-row",children:[t.jsxs("span",{children:[b("speakerOn",16,"#4a3520")," Sound"]}),t.jsx("button",{className:`candy-switch ${q?"off":"on"}`,onClick:()=>Ie(e=>!e),children:t.jsx("span",{className:"candy-switch-label",children:q?"OFF":"ON"})})]}),t.jsxs("div",{className:"bs-toggle-row",children:[t.jsxs("span",{children:[b("music",16,"#4a3520")," Music"]}),t.jsx("button",{className:`candy-switch ${W?"on":"off"}`,onClick:()=>nt(e=>!e),children:t.jsx("span",{className:"candy-switch-label",children:W?"ON":"OFF"})})]}),t.jsxs("div",{className:"bs-toggle-row",children:[t.jsxs("span",{children:[b("haptics",16,"#4a3520")," Haptics"]}),t.jsx("button",{className:`candy-switch ${oe?"on":"off"}`,onClick:()=>at(e=>!e),children:t.jsx("span",{className:"candy-switch-label",children:oe?"ON":"OFF"})})]}),t.jsx("div",{className:"bs-row",style:{marginTop:6},children:t.jsx("button",{className:"candy-round candy-check",onClick:Tt,title:"Done",children:b("check",22,"#fff")})})]})]}),(u==="gameover"||u==="victory")&&t.jsxs("div",{className:"ty-overlay",children:[t.jsx("div",{className:"ty-confetti",children:Array.from({length:18}).map((e,a)=>t.jsx("span",{className:"ty-dot",style:{left:`${8+a*5.2%85}%`,animationDelay:`${a*.3%2}s`,animationDuration:`${2+a%3*.7}s`,background:["#ff6fa5","#8b6ef0","#35c9a5","#ffc93d","#4fb6ff","#ff8a3d"][a%6],width:`${4+a%3*2}px`,height:`${4+a%3*2}px`}},a))}),t.jsxs("div",{className:"ty-trophy-wrap",children:[t.jsx("div",{className:"ty-trophy-glow"}),t.jsx("div",{className:"ty-trophy",children:b("trophy",72,"#FFD700")})]}),t.jsx("div",{className:"ty-ribbon-wrap",children:t.jsxs("div",{className:"ty-ribbon",children:[t.jsx("span",{className:"ty-ribbon-star",children:"★"}),u==="victory"?"GAME COMPLETED!":"GAME OVER",t.jsx("span",{className:"ty-ribbon-star",children:"★"})]})}),t.jsx("h2",{className:"ty-title",children:u==="victory"?"Congratulations!":"Good Try!"}),t.jsxs("p",{className:"ty-subtitle",children:["You scored ",t.jsx("strong",{children:N})," points on Level ",ie]}),t.jsxs("div",{className:"ty-card",children:[t.jsx("div",{className:"ty-card-icon",children:b("star",22,"#7c3aed")}),t.jsx("p",{className:"ty-card-label",children:"Performance"}),t.jsxs("div",{className:"ty-progress-bar",children:[t.jsx("div",{className:"ty-progress-fill",style:{width:`${Math.min(100,N/Math.max(1,V)*100)}%`}}),t.jsx("span",{className:"ty-progress-dot ty-dot-left"}),t.jsx("span",{className:"ty-progress-dot ty-dot-right"})]}),t.jsxs("p",{className:"ty-progress-text",children:[N," of ",V," best"]})]}),t.jsx("div",{className:"ty-stars",children:[1,2,3].map(e=>t.jsx("span",{className:`ty-star ${N>=e*100?"filled":""}`,children:b("star",28,N>=e*100?"#FFD700":"#d4d0e0")},e))}),t.jsxs("div",{className:"ty-actions",children:[u==="victory"&&!Ye&&t.jsxs("button",{className:"ty-btn ty-btn-primary",onClick:ct,children:[t.jsx("span",{className:"ty-btn-icon",children:b("arrowRight",18,"#fff")}),"Next Level"]}),u==="gameover"&&t.jsxs("button",{className:"ty-btn ty-btn-primary",onClick:()=>{Ve(""),$e()},children:[t.jsx("span",{className:"ty-btn-icon",children:b("refresh",18,"#fff")}),"Try Again"]}),Ye&&t.jsxs("button",{className:"ty-btn ty-btn-primary",onClick:Ce,children:[t.jsx("span",{className:"ty-btn-icon",children:b("home",18,"#fff")}),"Submit & Explore"]}),t.jsxs("button",{className:"ty-btn ty-btn-secondary",onClick:Ce,children:[b("home",16,"#7c3aed")," Back to Home"]})]})]})]})]})}export{_t as default};
