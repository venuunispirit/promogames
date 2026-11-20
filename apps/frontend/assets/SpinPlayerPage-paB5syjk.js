import{r as l,j as e}from"./react-vendor-gyK15t0p.js";import{a as me}from"./index-B2qSlCu9.js";const ie=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.sp-body {
  min-height: 100dvh;
  background: linear-gradient(160deg, #0f0a1e 0%, #1a1035 30%, #12082e 60%, #0d0b1a 100%);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
}

.sp-body::before {
  content: '';
  position: absolute;
  top: -30%;
  left: -20%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(124,107,247,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.sp-body::after {
  content: '';
  position: absolute;
  bottom: -20%;
  right: -20%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.sp-content {
  position: relative;
  z-index: 1;
  max-width: 440px;
  margin: 0 auto;
  padding: 20px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sp-logos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 16px;
}
.sp-logos img { height: 36px; object-fit: contain; border-radius: 8px; }

.sp-title-area {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}
.sp-title {
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
  line-height: 1.2;
  text-align: center;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
.sp-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  margin-top: 6px;
  font-weight: 500;
}

.sp-stats {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}
.sp-stat-card {
  flex: 1;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 14px 10px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
}
.sp-stat-icon { font-size: 22px; margin-bottom: 4px; }
.sp-stat-val { font-size: 20px; font-weight: 800; color: #fff; }
.sp-stat-label { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

.sp-wheel-wrap {
  position: relative;
  margin: 0;
}

.sp-wheel-shadow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  filter: drop-shadow(0 12px 48px rgba(0,0,0,0.5));
  pointer-events: none;
  z-index: 1;
}

.sp-wheel-svg {
  display: block;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.sp-wheel-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 88%;
  height: 88%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124,107,247,0.2) 0%, transparent 70%);
  pointer-events: none;
  animation: spPulse 3s ease-in-out infinite;
}
@keyframes spPulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}

.sp-leds {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.sp-led-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
}

.sp-pointer {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
}

.sp-spin-btn {
  margin-top: 20px;
  padding: 16px 56px;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #7C6FF7, #9b8cff, #7C6FF7);
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 3px;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(124,107,247,0.5), 0 0 48px rgba(124,107,247,0.2), 0 8px 32px rgba(0,0,0,0.3);
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}
.sp-spin-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: spShimmer 2s infinite;
}
@keyframes spShimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
.sp-spin-btn:active:not(:disabled) {
  transform: scale(0.95);
  box-shadow: 0 0 12px rgba(124,107,247,0.4), 0 4px 16px rgba(0,0,0,0.3);
}
.sp-spin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.3);
}
.sp-spin-btn:disabled::before { animation: none; }

.sp-trust {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.sp-result-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: spFadeIn 0.3s ease;
}
@keyframes spFadeIn { from { opacity: 0; } to { opacity: 1; } }

.sp-result-card {
  background: linear-gradient(160deg, #1e1545, #151030);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 36px 28px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  animation: spPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  position: relative;
  overflow: hidden;
}
.sp-result-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent);
}
@keyframes spPopIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.sp-result-emoji { font-size: 64px; margin-bottom: 16px; }
.sp-result-label {
  display: inline-block;
  padding: 6px 20px;
  border-radius: 24px;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 14px;
}
.sp-result-msg { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.9); margin: 0 0 12px; line-height: 1.5; }
.sp-result-desc { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 20px; line-height: 1.5; }

.sp-coupon-box {
  background: rgba(255,255,255,0.05);
  border: 2px dashed rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.sp-coupon-label { font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
.sp-coupon-code { font-size: 24px; font-weight: 900; color: #F59E0B; letter-spacing: 4px; font-family: monospace; }

.sp-claim-btn {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 6px 24px rgba(245,158,11,0.3);
  transition: transform 0.15s;
}
.sp-claim-btn:active { transform: scale(0.97); }

.sp-done-card {
  background: linear-gradient(160deg, #1e1545, #151030);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 40px 28px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  position: relative;
  z-index: 10;
}

.sp-error-card, .sp-already-card {
  background: linear-gradient(160deg, #1e1545, #151030);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 40px 28px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}
`,ve=l.memo(function({segments:d,spinning:g,settings:c,onSpin:k,wheelRef:p}){const[i,E]=l.useState(Math.min(window.innerWidth*.85,320)),P=(c==null?void 0:c.primary_color)||"#7C6FF7",K=(c==null?void 0:c.pointer_color)||"#EF4444";l.useEffect(()=>{const a=()=>E(Math.min(window.innerWidth*.85,320));return window.addEventListener("resize",a),()=>window.removeEventListener("resize",a)},[]),l.useEffect(()=>{p.current&&(p.current.style.transform="rotate(0deg) translateZ(0)")},[p]);const S=i+28,m=S/2,b=S/2,z=i/2-10,D=360/(d.length||1);let G=-90;const ue=d.map(a=>{const u=D,y=G+u,L=G+u/2,H=G*Math.PI/180,n=y*Math.PI/180,x=L*Math.PI/180,se=m+z*Math.cos(H),j=b+z*Math.sin(H),U=m+z*Math.cos(n),Z=b+z*Math.sin(n),ae=u>180?1:0,ne=`M ${m} ${b} L ${se} ${j} A ${z} ${z} 0 ${ae} 1 ${U} ${Z} Z`,J=z*.62,re=m+J*Math.cos(x),le=b+J*Math.sin(x);return G=y,{d:ne,tx:re,ty:le,angle:L,color:a.bg_color||"#7C6FF7",textColor:a.text_color||"#fff",label:a.label}}),F=i*.12,fe=(c==null?void 0:c.center_color)||"#1F2937",ee=(c==null?void 0:c.center_label)||"SPIN",q=c==null?void 0:c.center_image_url,te=20,N=S/2-4,$=Array.from({length:te},(a,u)=>{const y=u/te*Math.PI*2-Math.PI/2;return{x:m+N*Math.cos(y),y:b+N*Math.sin(y),color:u%2===0?"#F59E0B":P}});return e.jsxs("div",{className:"sp-wheel-wrap",style:{width:S,height:S},children:[e.jsx("div",{className:"sp-leds",children:$.map((a,u)=>e.jsx("div",{className:"sp-led-dot",style:{left:a.x-3,top:a.y-3,color:a.color,background:a.color}},u))}),e.jsx("div",{className:"sp-wheel-shadow"}),e.jsx("div",{className:"sp-wheel-glow"}),e.jsx("div",{className:"sp-pointer",children:e.jsxs("svg",{width:"34",height:"44",viewBox:"0 0 34 44",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"ptrGrad",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:K}),e.jsx("stop",{offset:"100%",stopColor:K,stopOpacity:"0.7"})]})}),e.jsxs("g",{transform:"translate(0,44) scale(1,-1)",children:[e.jsx("polygon",{points:"17,4 3,36 17,28 31,36",fill:"url(#ptrGrad)",stroke:"#fff",strokeWidth:"2.5",strokeLinejoin:"round"}),e.jsx("circle",{cx:"17",cy:"8",r:"4.5",fill:"#F59E0B",stroke:"#fff",strokeWidth:"1.5"})]})]})}),e.jsxs("svg",{ref:p,className:"sp-wheel-svg",width:S,height:S,viewBox:`0 0 ${S} ${S}`,style:{transition:"none"},children:[e.jsx("circle",{cx:m,cy:b,r:z+12,fill:"none",stroke:`${P}4D`,strokeWidth:"10"}),e.jsx("circle",{cx:m,cy:b,r:z+6,fill:"none",stroke:"rgba(255,255,255,0.08)",strokeWidth:"3"}),ue.map((a,u)=>e.jsxs("g",{children:[e.jsx("path",{d:a.d,fill:a.color,stroke:(c==null?void 0:c.wheel_bg_color)||"rgba(255,255,255,0.15)",strokeWidth:"2"}),e.jsx("text",{x:a.tx,y:a.ty,textAnchor:"middle",dominantBaseline:"middle",fill:a.textColor,fontSize:Math.max(8,Math.min(12,i/24)),fontWeight:"800",transform:`rotate(${a.angle+90+90}, ${a.tx}, ${a.ty})`,style:{pointerEvents:"none",fontFamily:"Inter, sans-serif"},children:a.label.length>14?a.label.slice(0,13)+"…":a.label})]},u)),e.jsx("circle",{cx:m,cy:b,r:F+8,fill:`${P}26`}),e.jsx("circle",{cx:m,cy:b,r:F+4,fill:"none",stroke:"rgba(245,158,11,0.4)",strokeWidth:"2"}),e.jsx("circle",{cx:m,cy:b,r:F,fill:fe,stroke:"rgba(245,158,11,0.6)",strokeWidth:"3",style:{cursor:g?"not-allowed":"pointer"},onClick:g?void 0:k}),q?e.jsx("image",{href:q,x:m-F*.6,y:b-F*.6,width:F*1.2,height:F*1.2,style:{clipPath:`circle(${F*.6}px at ${m}px ${b}px)`,pointerEvents:"none"}}):e.jsx("text",{x:m,y:b,textAnchor:"middle",dominantBaseline:"middle",fill:"#fff",fontSize:i*.06,fontWeight:"900",style:{pointerEvents:"none",fontFamily:"Inter, sans-serif",letterSpacing:2},children:ee})]})]})});function ke({segment:s,settings:d,onClose:g}){if(!(s.segment_type==="prize")){const p=s.lose_message||"Oops! The wheel wasn't in your favor this time. Better luck on your next spin! 🍀";return e.jsx("div",{className:"sp-result-overlay",children:e.jsxs("div",{className:"sp-result-card",style:{textAlign:"center"},children:[e.jsx("div",{style:{fontSize:64,marginBottom:16},children:"😔"}),e.jsx("h2",{style:{margin:"0 0 12px",fontWeight:800,color:"#fff",fontSize:22,lineHeight:1.3},children:p}),e.jsx("button",{className:"sp-claim-btn",onClick:g,style:{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)"},children:d.continue_button_text||"Continue"})]})})}const k=s.win_message||(d==null?void 0:d.win_message)||"Congratulations! You won!";return e.jsx("div",{className:"sp-result-overlay",children:e.jsxs("div",{className:"sp-result-card",children:[s.overlay_image_url?e.jsx("img",{src:s.overlay_image_url,alt:"",style:{width:"100%",borderRadius:16,marginBottom:20,objectFit:"contain",maxHeight:200}}):e.jsx("div",{className:"sp-result-emoji",children:"🎉"}),e.jsx("div",{className:"sp-result-label",style:{background:s.bg_color||"#7C6FF7",color:s.text_color||"#fff"},children:s.label}),e.jsx("p",{className:"sp-result-msg",children:k}),s.prize_description&&e.jsx("p",{className:"sp-result-desc",children:s.prize_description}),s.coupon_code&&e.jsxs("div",{className:"sp-coupon-box",children:[e.jsx("div",{className:"sp-coupon-label",children:"Your Coupon Code"}),e.jsx("div",{className:"sp-coupon-code",children:s.coupon_code})]}),s.coupon_image_url&&e.jsx("img",{src:s.coupon_image_url,alt:"coupon",style:{width:"80%",borderRadius:12,marginBottom:20}}),e.jsx("button",{className:"sp-claim-btn",onClick:g,children:"🎉 Claim Reward"})]})})}function Se(){const s=l.useRef();return l.useEffect(()=>{const d=s.current;if(!d)return;const g=d.getContext("2d");d.width=window.innerWidth,d.height=window.innerHeight;const c=Array.from({length:90},()=>({x:Math.random()*d.width,y:Math.random()*d.height-d.height,r:6+Math.random()*8,d:Math.random()*90,color:["#7C6FF7","#F59E0B","#EC4899","#10B981","#3B82F6","#EF4444"][Math.floor(Math.random()*6)],tilt:Math.random()*10-5,tiltAngle:0,tiltAngleIncrement:Math.random()*.07+.05}));let k;const p=()=>{g.clearRect(0,0,d.width,d.height),c.forEach(i=>{i.tiltAngle+=i.tiltAngleIncrement,i.y+=Math.cos(i.d)+1.5,i.tilt=Math.sin(i.tiltAngle)*15,i.y>d.height&&(i.y=-10,i.x=Math.random()*d.width),g.beginPath(),g.lineWidth=i.r/2,g.strokeStyle=i.color,g.moveTo(i.x+i.tilt+i.r/4,i.y),g.lineTo(i.x+i.tilt,i.y+i.tilt+i.r/4),g.stroke()}),k=requestAnimationFrame(p)};return p(),()=>cancelAnimationFrame(k)},[]),e.jsx("canvas",{ref:s,style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:200}})}function Fe({gameData:s,sessionToken:d,sessionId:g,onSessionStart:c,onComplete:k}){const[p,i]=l.useState("ready"),[E,P]=l.useState(null),[K,S]=l.useState(d),[m,b]=l.useState(g),[z,pe]=l.useState(!1),[D,G]=l.useState(null),[ue,F]=l.useState(0),[fe,ee]=l.useState(1),[q,te]=l.useState(null),N=l.useRef(!1),$=l.useRef(0),a=l.useRef(0),u=l.useRef(null),y=l.useRef(null),L=l.useRef(null),H=l.useRef(null),n=(s==null?void 0:s.settings)||{},x=(s==null?void 0:s.segments)||[],se=(s==null?void 0:s.soundMap)||{},j=n.primary_color||"#7C6FF7",U=t=>{if(!t)return null;const o=parseInt(t);return isNaN(o)?t:se[o]||null},Z=t=>{if(t)try{new Audio(t).play().catch(()=>{})}catch{}};l.useEffect(()=>{if(p!=="done"||!n.redirect_url||!n.redirect_delay)return;const t=parseInt(n.redirect_delay);if(!t||t<=0)return;const o=setTimeout(()=>{window.top.location.href=n.redirect_url},t*1e3);return()=>clearTimeout(o)},[p,n.redirect_url,n.redirect_delay]);const ae=l.useCallback(()=>{if(!x.length)return null;const t=x.reduce((r,h)=>r+(parseInt(h.weight)||1),0);let o=Math.random()*t;for(let r=0;r<x.length;r++)if(o-=parseInt(x[r].weight)||1,o<=0)return r;return x.length-1},[x]),ne=l.useCallback(()=>{try{if(!y.current){const v=new(window.AudioContext||window.webkitAudioContext);y.current=v;const O=v.sampleRate,V=Math.floor(O*.04),Q=v.createBuffer(1,V,O),de=Q.getChannelData(0);for(let Y=0;Y<V;Y++)de[Y]=Math.random()*2-1;L.current=Q}const t=y.current;t.state==="suspended"&&t.resume();const o=L.current;if(!o)return;const r=t.currentTime,h=.2,f=.018,C=2200+(Math.random()-.5)*200,T=700,A=t.createOscillator();A.type="sine",A.frequency.value=C;const R=t.createGain();R.gain.setValueAtTime(h*.55,r),R.gain.exponentialRampToValueAtTime(.001,r+f);const I=t.createOscillator();I.type="sine",I.frequency.value=T;const _=t.createGain();_.gain.setValueAtTime(h*.25,r),_.gain.exponentialRampToValueAtTime(.001,r+f*1.2);const W=t.createBufferSource();W.buffer=o;const w=t.createBiquadFilter();w.type="bandpass",w.frequency.value=C,w.Q.value=1.2;const B=t.createGain();B.gain.setValueAtTime(h*.35,r),B.gain.exponentialRampToValueAtTime(.001,r+f),A.connect(R),R.connect(t.destination),I.connect(_),_.connect(t.destination),W.connect(w),w.connect(B),B.connect(t.destination),A.start(r),A.stop(r+f+.01),I.start(r),I.stop(r+f*1.2+.01),W.start(r),W.stop(r+f+.01)}catch{}},[]),J=l.useCallback(t=>{let o=t,r=0;for(;o>.05;)o*=o>20?.992:o>5?.985:.96,r+=o*(1/60);return r},[]),re=l.useCallback(t=>{let o=0,r=3e3;for(let h=0;h<60;h++){const f=(o+r)/2;if(f===o||f===r)break;J(f)<t?o=f:r=f}return(o+r)/2},[J]),le=l.useCallback((t,o,r,h)=>{const f=o-t,M=re(f),C=x.length||1,T=360/C;let A=-1;a.current=M,$.current=t;const R=_=>{H.current&&(H.current.style.transform=`rotate(${_}deg) translateZ(0)`)},I=()=>{const _=a.current,W=_>20?.992:_>5?.985:.96;a.current=_*W,$.current+=a.current*(1/60);const w=$.current;R(w);const B=(w%360+360)%360,v=Math.floor(B/T)%C;if(v!==A&&(A=v,ne()),a.current>.05){u.current=requestAnimationFrame(I);return}const O=o;let V=0;const Q=8,de=3,Y=()=>{V++;const ge=V/Q,we=Math.max(0,1-ge*1.2),je=de*Math.sin(ge*Math.PI*2.5)*we;R(O+je),V<Q?u.current=requestAnimationFrame(Y):(R(O),$.current=O%360,setTimeout(()=>{P(r),i("result"),Z(U(r.sound_id||(r.segment_type==="prize"?n.sound_win_id:n.sound_lose_id))),r.segment_type==="prize"&&(F(X=>X+1),(!q||(r.weight||0)>(q.weight||0))&&te({label:r.label,weight:r.weight}));try{me.post("/play/session/complete",{session_token:h,score:r.segment_type==="prize"?1:0,player_data:{segment_id:r.id,segment_label:r.label,segment_type:r.segment_type,coupon_code:r.coupon_code||null,prize_description:r.prize_description||null}}).then(X=>{k&&X.data&&(window.__spinCompleteData=X.data)})}catch{}N.current=!1},350))};Y()};u.current=requestAnimationFrame(I)},[x,n,q,k,U,Z,ne,re]),xe=async()=>{if(N.current||p!=="ready")return;N.current=!0,be();let t=K,o=m;if(!t)try{const w=JSON.parse(localStorage.getItem("playerUser")||"{}"),B=new URLSearchParams(window.location.search).get("source")==="direct"?"direct":"link",v=await me.post("/play/session/start",{game_id:s.id,player_data:{},source_type:B,promo_player_id:w.id||null});if(!v.data.success){if(v.data.message==="already_played"){pe(!0),N.current=!1;return}throw new Error(v.data.message)}t=v.data.session_token,o=v.data.session_id,S(t),b(o),c&&c(t,o)}catch(w){G(w.message||"Could not start game"),N.current=!1;return}const r=ae();if(r===null){N.current=!1;return}const h=x[r],M=360/(x.length||1),C=(r+.5)*M,T=6+Math.floor(Math.random()*3),A=(Math.random()-.5)*M*.12,R=((360-C+A)%360+360)%360,I=($.current%360+360)%360;let _=R-I;_<0&&(_+=360);const W=$.current+T*360+_;Z(U(n.sound_spin_id)),i("spinning"),ee(w=>Math.max(0,w-1)),u.current&&cancelAnimationFrame(u.current),le($.current,W,h,t)};l.useEffect(()=>()=>{u.current&&cancelAnimationFrame(u.current),y.current&&y.current.close()},[]);const be=l.useCallback(()=>{try{if(y.current){y.current.state==="suspended"&&y.current.resume();return}const t=new(window.AudioContext||window.webkitAudioContext);y.current=t;const o=t.sampleRate,r=Math.floor(o*.04),h=t.createBuffer(1,r,o),f=h.getChannelData(0);for(let T=0;T<r;T++)f[T]=Math.random()*2-1;L.current=h;const M=t.createBufferSource();M.buffer=h;const C=t.createGain();C.gain.setValueAtTime(.001,t.currentTime),M.connect(C),C.connect(t.destination),M.start(),M.stop(t.currentTime+.02)}catch{}},[]),ye=()=>{const t=window.__spinCompleteData||{};E==null||E.segment_type,n.spin_mode==="unlimited"?(window.__spinCompleteData=null,P(null),i("ready"),ee(o=>o)):(window.__spinCompleteData=null,P(null),k?k({...t,redirect_url:n.redirect_url||s.redirect_url}):i("done"))},_e=n.font_family?`'${n.font_family}', sans-serif`:"'Inter', sans-serif",ce=n.bg_color||"",he=n.bg_image_url,oe={fontFamily:_e,...he?{background:`url(${he}) center/cover no-repeat, #0f0a1e`}:ce?{background:`linear-gradient(160deg, ${ce} 0%, ${ce} 100%)`}:{}};if(z)return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ie}),e.jsx("div",{className:"sp-body",style:oe,children:e.jsx("div",{className:"sp-content",style:{minHeight:"100dvh",justifyContent:"center"},children:e.jsxs("div",{className:"sp-already-card",children:[e.jsx("div",{style:{fontSize:56,marginBottom:16},children:"🎡"}),e.jsx("h2",{style:{margin:"0 0 10px",fontWeight:800,color:"#fff",fontSize:22},children:"Already Played!"}),e.jsx("p",{style:{color:"rgba(255,255,255,0.5)",margin:0,fontSize:14},children:"You've already spun this wheel. Come back for more games!"})]})})})]});if(D)return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ie}),e.jsx("div",{className:"sp-body",style:oe,children:e.jsx("div",{className:"sp-content",style:{minHeight:"100dvh",justifyContent:"center"},children:e.jsxs("div",{className:"sp-error-card",children:[e.jsx("div",{style:{fontSize:48,marginBottom:12},children:"❌"}),e.jsx("p",{style:{color:"rgba(255,255,255,0.8)",fontSize:16},children:D})]})})})]});if(p==="done"){const t=n.redirect_url&&n.redirect_delay;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ie}),e.jsxs("div",{className:"sp-body",style:oe,children:[e.jsx(Se,{}),e.jsx("div",{className:"sp-content",style:{minHeight:"100dvh",justifyContent:"center"},children:e.jsxs("div",{className:"sp-done-card",children:[n.submit_confirm_gif_url?e.jsx("img",{src:n.submit_confirm_gif_url,alt:"",style:{maxWidth:"100%",maxHeight:160,objectFit:"contain",borderRadius:16,marginBottom:16}}):e.jsx("div",{style:{fontSize:64,marginBottom:16},children:"🎊"}),e.jsx("h2",{style:{margin:"0 0 10px",fontWeight:800,color:"#fff",fontSize:24},children:n.outro_text||"Thanks for playing!"}),n.thankyou_subtitle&&e.jsx("p",{style:{color:n.thankyou_subtitle_color||"rgba(255,255,255,0.5)",fontSize:14},children:n.thankyou_subtitle}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,marginTop:16,width:"100%"},children:[n.submit_button_text&&e.jsx("a",{href:n.redirect_url||"#",target:n.redirect_open_new_tab?"_blank":"_self",rel:"noopener noreferrer",style:{display:"block",textAlign:"center",padding:"14px 28px",borderRadius:12,background:n.submit_button_bg_color||`linear-gradient(135deg,${j},${j}cc)`,color:n.submit_button_text_color||"#fff",fontWeight:700,fontSize:15,textDecoration:"none",boxShadow:`0 6px 24px ${j}44`},children:n.submit_button_text}),n.redirect_url&&n.continue_button_text&&e.jsx("a",{href:n.redirect_url,target:n.redirect_open_new_tab?"_blank":"_self",rel:"noopener noreferrer",style:{display:"block",textAlign:"center",padding:"12px 24px",borderRadius:12,background:n.continue_button_bg_color||"rgba(255,255,255,0.1)",color:n.continue_button_text_color||"#fff",fontWeight:600,fontSize:14,textDecoration:"none",border:"1px solid rgba(255,255,255,0.15)"},children:n.continue_button_text})]}),t&&e.jsxs("p",{style:{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:12},children:["Redirecting in ",n.redirect_delay,"s…"]})]})})]})]})}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ie}),e.jsx("style",{children:`.sp-body::before { background: radial-gradient(circle, ${j}1f 0%, transparent 70%); }
.sp-wheel-glow { background: radial-gradient(circle, ${j}33 0%, transparent 70%); }
.sp-spin-btn:active:not(:disabled) { box-shadow: 0 0 12px ${j}66, 0 4px 16px rgba(0,0,0,0.3); }`}),e.jsxs("div",{className:"sp-body",style:oe,children:[e.jsx("div",{className:"sp-content",children:e.jsxs("div",{style:{position:"relative",padding:"10%",borderRadius:24,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",alignItems:"center",gap:16,width:"100%",boxSizing:"border-box"},children:[n.game_logo_url&&e.jsx("div",{style:{display:"flex",justifyContent:"center",width:"100%"},children:e.jsx("img",{src:n.game_logo_url,alt:"Logo",style:{maxWidth:"100%",maxHeight:432,width:"auto",height:"auto",objectFit:"contain",borderRadius:10,display:"block"}})}),n.heading_1&&e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{style:{fontFamily:"Inter, sans-serif",fontSize:28,fontWeight:700,color:n.heading_1_color||"#ffffff",lineHeight:1.2,textShadow:"0 2px 12px rgba(0,0,0,0.3)"},children:n.heading_1}),n.heading_2&&e.jsx("div",{style:{fontFamily:"Inter, sans-serif",fontSize:13,fontWeight:500,color:n.heading_2_color||"rgba(255,255,255,0.55)",marginTop:6},children:n.heading_2})]}),x.length>0?e.jsx(ve,{segments:x,spinning:p==="spinning",settings:n,onSpin:xe,wheelRef:H}):e.jsx("div",{style:{width:280,height:280,borderRadius:"50%",background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.3)",fontSize:14},children:"No segments configured"}),x.length>0&&e.jsx("button",{className:"sp-spin-btn",onClick:xe,disabled:p!=="ready",style:{background:`linear-gradient(135deg, ${j}, ${j}cc, ${j})`,boxShadow:`0 0 24px ${j}80, 0 0 48px ${j}33, 0 8px 32px rgba(0,0,0,0.3)`,margin:0},children:p==="spinning"?"⏳ Spinning…":"⭐ SPIN!"}),n.spin_mode==="unlimited"&&p==="ready"&&e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:-8},children:"Spin as many times as you like!"}),e.jsx("div",{style:{fontSize:12,color:"rgba(255,255,255,0.4)",textAlign:"center",marginTop:4},children:"🛡️ Good luck! Every spin is a chance to win!"})]})}),p==="result"&&E&&e.jsx(ke,{segment:E,settings:n,onClose:ye})]})]})}export{Fe as default};
