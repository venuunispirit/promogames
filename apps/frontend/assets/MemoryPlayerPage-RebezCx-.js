import{r as i,j as e}from"./react-vendor-gyK15t0p.js";import{a as pe}from"./index-B2qSlCu9.js";function Ie(g){if(!g||g==="DM Sans")return;const h="gf-"+g.replace(/\s/g,"-");if(document.getElementById(h))return;const f=document.createElement("link");f.id=h,f.rel="stylesheet",f.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(g)}:wght@400;600;700;800&display=swap`,document.head.appendChild(f)}function P(g,h){if(!(!h||!(g!=null&&g[h])))try{new Audio(g[h]).play().catch(()=>{})}catch{}}function Me(g){switch(g){case"rounded-sm":return{borderRadius:4};case"rounded":return{borderRadius:8};case"rounded-lg":return{borderRadius:16};case"circle":return{borderRadius:"50%"};case"hexagon":return{clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"};default:return{borderRadius:2}}}function $e({count:g=40}){const h=["#6366f1","#ec4899","#f59e0b","#22c55e","#3b82f6","#ef4444","#8b5cf6","#FFD700"];return e.jsx("div",{style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden"},children:Array.from({length:g},(f,c)=>e.jsx("div",{style:{position:"absolute",top:-20,left:`${Math.random()*100}%`,width:6+Math.random()*8,height:6+Math.random()*8,background:h[c%h.length],borderRadius:Math.random()>.5?"50%":"2px",animation:`memConfettiFall ${2+Math.random()*3}s ${Math.random()*2}s ease-in forwards`,transform:`rotate(${Math.random()*360}deg)`}},c))})}const J=`
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
@keyframes memFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes memPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
@keyframes memGlow { 0%,100%{box-shadow:0 0 8px 2px rgba(255,215,0,.6)} 50%{box-shadow:0 0 20px 6px rgba(255,215,0,.9)} }
@keyframes memPopIn { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
@keyframes memMatchPop { 0%{transform:scale(1)} 30%{transform:scale(1.15) rotate(5deg)} 100%{transform:scale(1)} }
@keyframes memShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes memSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes memConfettiFall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
@keyframes memFadeIn { from{opacity:0} to{opacity:1} }
@keyframes memBounceIn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} 70%{transform:scale(0.92)} 100%{transform:scale(1);opacity:1} }
@keyframes memShuffleOut { 0%{transform:scale(1) rotate(0);opacity:1} 50%{transform:scale(.6) rotate(180deg);opacity:.5} 100%{transform:scale(0) rotate(360deg);opacity:0} }
@keyframes memShuffleIn { 0%{transform:scale(0) rotate(360deg);opacity:0} 50%{transform:scale(1.1) rotate(-10deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
@keyframes memShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
@keyframes memFlyFromBottom { from{transform:translateY(110vh) scale(0.9);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes memFlyToTop { from{transform:translateY(0) scale(1);opacity:1} to{transform:translateY(-110vh) scale(0.9);opacity:0} }
@keyframes memNextBtnIn { from{opacity:0;transform:translateY(16px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }

.mem-game {
  min-height:100vh; min-height:100dvh;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  font-family:'Poppins',sans-serif; padding:16px; position:relative; overflow:hidden;
}
.mem-game::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg,#e84393 0%,#6c5ce7 25%,#00cec9 50%,#fdcb6e 75%,#e84393 100%);
  background-size:400% 400%; animation:memShimmer 15s ease infinite; z-index:0;
}
.mem-game.has-custom-bg::before { display:none; }
.mem-game::after {
  content:''; position:absolute; inset:0;
  background:radial-gradient(circle at 20% 80%,rgba(255,255,255,.15) 0%,transparent 50%),
             radial-gradient(circle at 80% 20%,rgba(255,255,255,.1) 0%,transparent 50%);
  z-index:0; pointer-events:none;
}
.mem-glass {
  position:relative; z-index:1; width:100%; max-width:420px;
  background:rgba(255,255,255,.12); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
  border-radius:28px; padding:28px 20px 20px; text-align:center;
  box-shadow:0 16px 48px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.25);
  border:1px solid rgba(255,255,255,.2);
}
.mem-title {
  font-size:28px; font-weight:900; color:#FFD700; margin:0 0 2px;
  text-shadow:0 2px 8px rgba(0,0,0,.2), 0 0 20px rgba(255,215,0,.3); letter-spacing:1px;
}
.mem-subtitle { font-size:13px; color:rgba(255,255,255,.7); margin:0 0 16px; font-weight:500; }
.mem-logo { text-align:center; margin-bottom:12px; }
.mem-logo img { height:48px; max-width:180px; object-fit:contain; border-radius:8px; }
.mem-stats { display:flex; gap:8px; margin-bottom:16px; justify-content:center; }
.mem-stat {
  flex:1; max-width:110px; padding:10px 6px; border-radius:16px; text-align:center;
  background:linear-gradient(135deg,rgba(108,92,231,.7),rgba(45,52,54,.5));
  box-shadow:0 4px 12px rgba(0,0,0,.15);
}
.mem-stat-icon { font-size:18px; margin-bottom:2px; }
.mem-stat-val { font-size:20px; font-weight:800; color:#fff; line-height:1.1; }
.mem-stat-lbl { font-size:9px; font-weight:700; color:rgba(255,255,255,.6); text-transform:uppercase; letter-spacing:1px; }
.mem-board { display:flex; flex-direction:column; gap:8px; align-items:center; margin-bottom:16px; }
.mem-row { display:flex; gap:8px; justify-content:center; }
.mem-card {
  width:72px; height:72px; border-radius:14px; cursor:pointer; position:relative; perspective:600px;
  transition:transform .2s;
}
.mem-card:active { transform:scale(.95); }
.mem-card.matched { animation:memMatchPop .4s ease; pointer-events:none; }
.mem-card-inner {
  width:100%; height:100%; position:relative; transform-style:preserve-3d;
  transition:transform .5s cubic-bezier(.4,.0,.2,1); border-radius:14px;
}
.mem-card.flipped .mem-card-inner { transform:rotateY(180deg); }
.mem-card-face {
  position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden;
  border-radius:14px; display:flex; align-items:center; justify-content:center; overflow:hidden;
}
.mem-card-back {
  background:linear-gradient(135deg,#8b5cf6,#6c5ce7);
  box-shadow:0 4px 12px rgba(108,92,231,.4);
}
.mem-card-back::after { content:'♛'; font-size:28px; color:rgba(255,255,255,.25); font-weight:900; }
.mem-card-back.custom-cover {
  background-size:cover; background-position:center; background-repeat:no-repeat;
}
.mem-card-back.custom-cover::after { display:none; }
.mem-card-front {
  transform:rotateY(180deg);
  background:linear-gradient(135deg,#fff9e6,#ffeaa7);
  box-shadow:0 4px 12px rgba(0,0,0,.15);
  border:2px solid rgba(255,215,0,.4);
}
.mem-card-front img { width:100%; height:100%; object-fit:cover; border-radius:12px; }
.mem-card.hint-glow { animation:memGlow 1s ease-in-out infinite; }
.mem-card.shuffle-out { animation:memShuffleOut .4s ease-in forwards; }
.mem-card.shuffle-in { animation:memShuffleIn .45s ease-out forwards; }
.mem-powerups { display:flex; gap:10px; justify-content:center; }
.mem-powerup {
  display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px 16px;
  border-radius:16px; border:none; cursor:pointer; font-family:'Poppins',sans-serif;
  font-size:12px; font-weight:700; color:#fff; position:relative; transition:transform .15s;
  box-shadow:0 4px 12px rgba(0,0,0,.2);
}
.mem-powerup:hover { transform:translateY(-2px); }
.mem-powerup:active { transform:scale(.95); }
.mem-powerup:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.mem-powerup-icon { font-size:22px; }
.mem-powerup-tooltip {
  position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%);
  background:rgba(0,0,0,.85); color:#fff; font-size:11px; font-weight:600; padding:6px 12px;
  border-radius:8px; white-space:nowrap; z-index:10;
  opacity:0; visibility:hidden; transition:opacity .15s,visibility .15s; pointer-events:none;
}
.mem-powerup-wrap:hover .mem-powerup-tooltip { opacity:1; visibility:visible; }
.mem-powerup-tooltip::after {
  content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
  border:5px solid transparent; border-top-color:rgba(0,0,0,.85);
}
.mem-powerup-badge {
  position:absolute; top:-4px; right:-4px; width:20px; height:20px; border-radius:50%;
  background:#e74c3c; color:#fff; font-size:11px; font-weight:800; display:flex;
  align-items:center; justify-content:center; border:2px solid #fff;
}
.mem-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center; z-index:100; padding:24px;
}
.mem-overlay-card {
  background:rgba(255,255,255,.12); backdrop-filter:blur(24px); border-radius:28px;
  padding:36px 28px; max-width:360px; width:100%; text-align:center;
  box-shadow:0 24px 64px rgba(0,0,0,.4); border:1px solid rgba(255,255,255,.15);
  animation:memPopIn .4s cubic-bezier(.68,-.55,.265,1.55);
}
.mem-overlay-emoji { font-size:64px; margin-bottom:12px; animation:memFloat 2s ease-in-out infinite; }
.mem-overlay-title { font-size:24px; font-weight:800; color:#FFD700; margin:0 0 8px; text-shadow:0 2px 8px rgba(0,0,0,.2); }
.mem-overlay-sub { font-size:14px; color:rgba(255,255,255,.7); margin:0 0 20px; }
.mem-overlay-btn {
  width:100%; padding:14px; border-radius:14px; border:none; font-size:16px; font-weight:700;
  font-family:'Poppins',sans-serif; cursor:pointer; transition:transform .15s;
}
.mem-overlay-btn:hover { transform:translateY(-2px); }
.mem-form { text-align:left; }
.mem-form-field { margin-bottom:10px; }
.mem-form-label { font-size:11px; font-weight:700; color:rgba(255,255,255,.6); text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; display:block; }
.mem-form-input {
  width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid rgba(255,255,255,.2);
  background:rgba(255,255,255,.1); color:#fff; font-size:14px; font-family:'Poppins',sans-serif;
  outline:none; box-sizing:border-box;
}
.mem-form-input::placeholder { color:rgba(255,255,255,.4); }
.mem-form-input:focus { border-color:rgba(255,215,0,.6); }
.mem-popup {
  position:fixed; top:20px; left:50%; transform:translateX(-50%); padding:12px 24px;
  border-radius:12px; background:#e74c3c; color:#fff; font-weight:700; font-size:13px;
  z-index:200; animation:memSlideUp .3s ease;
}
.mem-already-played {
  min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:20px; font-family:'Poppins',sans-serif;
  background:linear-gradient(135deg,#e84393,#6c5ce7,#00cec9,#fdcb6e); background-size:400% 400%;
}
.mem-game-over-card {
  background:rgba(255,255,255,.92); backdrop-filter:blur(12px); border-radius:20px;
  padding:28px 24px; max-width:340px; width:100%; text-align:center;
  box-shadow:0 8px 32px rgba(0,0,0,.1); animation:memSlideUp .4s ease;
}
@media(max-width:400px) {
  .mem-card { width:62px; height:62px; }
  .mem-title { font-size:24px; }
  .mem-glass { padding:20px 14px 14px; border-radius:22px; }
}
`;function Ee({gameData:g,sessionToken:h,onComplete:f}){const c=g,a=c.settings||{},S=c.soundMap||{},N=c.tiles||[],V=c.formFields||[],[T,fe]=i.useState(h?"playing":"intro"),[x,y]=i.useState([]),[j,I]=i.useState([]),[Pe,B]=i.useState(new Set),[C,K]=i.useState(0),[Q,O]=i.useState(0),[z,Y]=i.useState(!1),[A,R]=i.useState(!1),[ue,Z]=i.useState(""),[b,ge]=i.useState(!1),[ee,te]=i.useState(0),[G,xe]=i.useState(3),[U,he]=i.useState(3),[Te,Ce]=i.useState(3),[M,ae]=i.useState(!1),[E,re]=i.useState(null),[se,be]=i.useState(h),[_,D]=i.useState({}),[k,$]=i.useState({}),[ie,X]=i.useState(!1),[ye,ve]=i.useState(!1),[ne,_e]=i.useState(!1),F=i.useRef(null),oe=i.useRef(!1),w=parseInt(a.grid_cols)||4,we=new Set(N.map(t=>t.pair_id).filter(Boolean)),je=new Set(N.map(t=>t.image_url).filter(Boolean)),le=we.size||je.size||N.length;i.useEffect(()=>{Ie(a.font_family)},[a.font_family]),i.useEffect(()=>{if(!N.length)return;const t=[...N].sort(()=>Math.random()-.5).map((n,r)=>({...n,cardIndex:r,isFlipped:!1,isMatched:!1}));y(t),O(0),K(0),I([]),B(new Set)},[N]),i.useEffect(()=>{if(!(T!=="playing"||!a.time_limit_seconds||b))return te(a.time_limit_seconds),F.current=setInterval(()=>{te(t=>t<=1?(clearInterval(F.current),q(),0):t-1)},1e3),()=>{F.current&&clearInterval(F.current)}},[T,b]);const ke=async()=>{var n;const t={};for(const r of V)Number(r.is_required)===1&&!((n=_[r.field_label])!=null&&n.trim())&&(t[r.field_label]="Required");if(Number(a.terms_enabled)===1&&!ne&&(t._terms="Accept terms"),Object.keys(t).length){$(t);return}$({}),X(!0);try{const r=JSON.parse(localStorage.getItem("playerUser")||"{}"),s=new URLSearchParams(window.location.search).get("source")==="direct"?"direct":"link",o=await pe.post("/play/session/start",{game_id:c.id,player_data:_,source_type:s,promo_player_id:r.id||null});if(!o.data.success){if(o.data.message==="already_played"){ve(!0),X(!1);return}throw new Error(o.data.message)}be(o.data.session_token),fe("playing")}catch(r){re(r.message||"Error starting game"),setTimeout(()=>re(null),3e3)}X(!1)},me=i.useCallback(t=>{var s,o;if(z||b||j.length>=2||(s=x[t])!=null&&s.isMatched||(o=x[t])!=null&&o.isFlipped)return;P(S,a.sound_flip_id);const n=[...x];n[t]={...n[t],isFlipped:!0},y(n);const r=[...j,t];if(I(r),r.length===2){K(m=>m+1),Y(!0);const[d,l]=r,u=n[d],v=n[l];u.pair_id!=null&&v.pair_id!=null&&u.pair_id===v.pair_id?setTimeout(()=>{P(S,a.sound_match_id),y(m=>{const p=[...m];return p[d]={...p[d],isMatched:!0},p[l]={...p[l],isMatched:!0},p}),B(m=>new Set([...m,u.pair_id])),O(m=>m+1),I([]),Y(!1),a.overlay_animation_in&&R(!0)},400):u.pair_id==null&&v.pair_id==null&&u.image_url&&u.image_url===v.image_url?setTimeout(()=>{P(S,a.sound_match_id),y(m=>{const p=[...m];return p[d]={...p[d],isMatched:!0,pair_id:d},p[l]={...p[l],isMatched:!0,pair_id:d},p}),B(m=>new Set([...m,d])),O(m=>m+1),I([]),Y(!1),a.overlay_animation_in&&R(!0)},400):setTimeout(()=>{P(S,a.sound_nomatch_id),y(m=>{const p=[...m];return p[d]={...p[d],isFlipped:!1},p[l]={...p[l],isFlipped:!1},p}),I([]),Y(!1)},1e3)}},[x,j,z,b,S,a]),Se=()=>{Z(a.overlay_animation_out||"memFlyToTop"),setTimeout(()=>{R(!1),Z("")},400)},q=async()=>{if(!oe.current){if(oe.current=!0,F.current&&clearInterval(F.current),ge(!0),P(S,a.win_sound_id),!se){f==null||f({redirect_url:a.redirect_url||c.redirect_url});return}try{const t=await pe.post("/play/session/complete",{session_token:se,score:C,player_data:{total_moves:C,total_pairs:le,time_taken:a.time_limit_seconds?a.time_limit_seconds-ee:0}});f==null||f({...t.data,redirect_url:t.data.redirect_url||a.redirect_url||c.redirect_url})}catch{f==null||f({redirect_url:a.redirect_url||c.redirect_url})}}},Ne=()=>{if(G<=0||j.length!==1||z)return;const t=j[0],n=x[t];if(!n)return;let r=-1;n.pair_id!=null?r=x.findIndex((s,o)=>o!==t&&s.pair_id===n.pair_id&&!s.isMatched&&!s.isFlipped):n.image_url&&(r=x.findIndex((s,o)=>o!==t&&s.image_url===n.image_url&&!s.isMatched&&!s.isFlipped)),r!==-1&&(xe(s=>s-1),y(s=>{const o=[...s];return o[r]={...o[r],hintGlow:!0},o}),setTimeout(()=>{y(s=>{const o=[...s];return o[r]={...o[r],hintGlow:!1},o})},2e3))},ze=()=>{U<=0||z||M||(he(t=>t-1),ae(!0),setTimeout(()=>{const n=[...x.filter(r=>!r.isMatched)].sort(()=>Math.random()-.5);y(r=>{const s=[...r];let o=0;for(let d=0;d<s.length;d++)s[d].isMatched||(s[d]={...n[o],cardIndex:d,isFlipped:!1,shuffleIn:!0},o++);return s}),setTimeout(()=>{ae(!1),y(r=>r.map(s=>({...s,shuffleIn:!1})))},450)},400))},ce=x.length>0&&x.every(t=>t.isMatched);i.useEffect(()=>{ce&&Q>0&&!b&&(A?setTimeout(()=>{R(!1),q()},1500):q())},[ce]);const Fe=t=>`${Math.floor(t/60)}:${(t%60).toString().padStart(2,"0")}`,H=a.bg_image_url?{background:`url(${a.bg_image_url}) center/cover no-repeat`}:{background:a.bg_color||"#0097A7"},de=a.game_logo_url||c.game_logo_url,L=`mem-game${a.bg_image_url||a.bg_color?" has-custom-bg":""}`,W=de?e.jsx("div",{className:"mem-logo",children:e.jsx("img",{src:de,alt:c.name?`${c.name} logo`:"Game logo"})}):null;if(ye)return e.jsxs("div",{className:L,style:H,children:[e.jsx("style",{children:J}),e.jsxs("div",{className:"mem-glass",children:[W,e.jsx("div",{style:{fontSize:48,marginBottom:12},children:"⚠️"}),e.jsx("h2",{style:{color:"#fff",marginBottom:8,fontSize:20},children:"Already Played"}),e.jsx("p",{style:{color:"rgba(255,255,255,.7)",fontSize:13,textAlign:"center"},children:"You have already completed this game. Each game can only be played once."})]})]});if(T==="intro")return e.jsxs("div",{className:L,style:H,children:[e.jsx("style",{children:J}),e.jsxs("div",{className:"mem-glass",children:[W,e.jsx("div",{className:"mem-title",children:"✨ Memory Match ✨"}),e.jsx("div",{className:"mem-subtitle",children:a.heading_2||c.name}),a.heading_3&&e.jsx("p",{style:{color:"rgba(255,255,255,.5)",fontSize:12,marginBottom:8},children:a.heading_3}),a.description_text&&e.jsx("p",{style:{color:"rgba(255,255,255,.5)",fontSize:12,marginBottom:16,lineHeight:1.4},children:a.description_text}),e.jsxs("div",{className:"mem-form",children:[c.game_type!=="promogames"&&V.map((t,n)=>e.jsxs("div",{className:"mem-form-field",children:[e.jsxs("label",{className:"mem-form-label",children:[t.field_label," ",Number(t.is_required)===1&&e.jsx("span",{style:{color:"#e74c3c"},children:"*"})]}),t.field_type==="textarea"?e.jsx("textarea",{rows:3,value:_[t.field_label]||"",onChange:r=>{D({..._,[t.field_label]:r.target.value}),$({...k,[t.field_label]:""})},className:"mem-form-input",style:{resize:"vertical"}}):t.field_type==="select"?e.jsxs("select",{value:_[t.field_label]||"",onChange:r=>D({..._,[t.field_label]:r.target.value}),className:"mem-form-input",children:[e.jsx("option",{value:"",children:"Select..."}),(t.field_options||[]).map((r,s)=>e.jsx("option",{value:r,children:r},s))]}):e.jsx("input",{type:t.field_type==="email"?"email":t.field_type==="phone"?"tel":t.field_type==="number"?"number":"text",value:_[t.field_label]||"",onChange:r=>{D({..._,[t.field_label]:r.target.value}),$({...k,[t.field_label]:""})},className:"mem-form-input",placeholder:t.field_label}),k[t.field_label]&&e.jsx("p",{style:{color:"#e74c3c",fontSize:11,margin:"3px 0 0"},children:k[t.field_label]})]},n)),Number(a.terms_enabled)===1&&e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:8,margin:"12px 0",cursor:"pointer",fontSize:12,color:"rgba(255,255,255,.7)"},children:[e.jsx("input",{type:"checkbox",checked:ne,onChange:t=>{_e(t.target.checked),$({...k,_terms:""})},style:{width:16,height:16}}),e.jsx("span",{children:a.terms_url?e.jsx("a",{href:a.terms_url,target:"_blank",style:{color:"#FFD700"},children:a.terms_text||"Terms & Conditions"}):a.terms_text||"Terms & Conditions"})]}),k._terms&&e.jsx("p",{style:{color:"#e74c3c",fontSize:11,margin:"3px 0 0"},children:k._terms}),e.jsx("button",{onClick:ke,disabled:ie,className:"mem-overlay-btn",style:{background:"linear-gradient(135deg,#FFD700,#f39c12)",color:"#1a1a2e",marginTop:12},children:ie?"⏳ Starting...":a.start_button_text||"🎮 Start Game"})]})]}),E&&e.jsx("div",{className:"mem-popup",children:E})]});if(T==="playing"||b){const t=Me(a.card_shape||"square"),n=!!a.card_cover_image_url;return e.jsxs("div",{className:L,style:H,children:[e.jsx("style",{children:J}),b&&e.jsx($e,{}),e.jsxs("div",{className:"mem-glass",children:[W,e.jsx("div",{className:"mem-title",children:"✨ Memory Match ✨"}),e.jsx("div",{className:"mem-subtitle",children:a.heading_2||c.name}),e.jsxs("div",{className:"mem-stats",children:[e.jsxs("div",{className:"mem-stat",children:[e.jsx("div",{className:"mem-stat-icon",children:"⏱️"}),e.jsx("div",{className:"mem-stat-val",children:a.time_limit_seconds?Fe(ee):"0:00"}),e.jsx("div",{className:"mem-stat-lbl",children:"TIME"})]}),e.jsxs("div",{className:"mem-stat",children:[e.jsx("div",{className:"mem-stat-icon",children:"⭐"}),e.jsx("div",{className:"mem-stat-val",children:C}),e.jsx("div",{className:"mem-stat-lbl",children:"MOVES"})]}),e.jsxs("div",{className:"mem-stat",children:[e.jsx("div",{className:"mem-stat-icon",children:"🏆"}),e.jsxs("div",{className:"mem-stat-val",children:[Q,"/",le]}),e.jsx("div",{className:"mem-stat-lbl",children:"BEST"})]})]}),!b&&e.jsx("div",{className:"mem-board",children:(()=>{const r=x.length,s=Math.floor(r/w),o=r%w,d=[];for(let l=0;l<s;l++)d.push(e.jsx("div",{className:"mem-row",children:x.slice(l*w,l*w+w).map((u,v)=>{const m=l*w+v,p=u.isFlipped||u.isMatched;return e.jsx("div",{className:`mem-card${p?" flipped":""}${u.isMatched?" matched":""}${u.hintGlow?" hint-glow":""}${M&&!u.isMatched?" shuffle-out":""}${!M&&u.shuffleIn?" shuffle-in":""}`,onClick:()=>me(m),children:e.jsxs("div",{className:"mem-card-inner",style:{transform:p?"rotateY(180deg)":"rotateY(0)"},children:[e.jsx("div",{className:`mem-card-face mem-card-back${n?" custom-cover":""}`,style:n?{backgroundImage:`url(${a.card_cover_image_url})`}:{...t}}),e.jsx("div",{className:"mem-card-face mem-card-front",style:t,children:u.image_url?e.jsx("img",{src:u.image_url,alt:""}):e.jsx("span",{style:{fontSize:28},children:"🃏"})})]})},u.cardIndex??m)})},`row-${l}`));return o>0&&d.push(e.jsx("div",{className:"mem-row",children:x.slice(s*w).map((l,u)=>{const v=s*w+u,m=l.isFlipped||l.isMatched;return e.jsx("div",{className:`mem-card${m?" flipped":""}${l.isMatched?" matched":""}${l.hintGlow?" hint-glow":""}${M&&!l.isMatched?" shuffle-out":""}${!M&&l.shuffleIn?" shuffle-in":""}`,onClick:()=>me(v),children:e.jsxs("div",{className:"mem-card-inner",style:{transform:m?"rotateY(180deg)":"rotateY(0)"},children:[e.jsx("div",{className:`mem-card-face mem-card-back${n?" custom-cover":""}`,style:n?{backgroundImage:`url(${a.card_cover_image_url})`}:{...t}}),e.jsx("div",{className:"mem-card-face mem-card-front",style:t,children:l.image_url?e.jsx("img",{src:l.image_url,alt:""}):e.jsx("span",{style:{fontSize:28},children:"🃏"})})]})},l.cardIndex??v)})},"last-row")),d})()}),b&&!A&&e.jsx("div",{style:{textAlign:"center",padding:"20px 0"},children:e.jsxs("div",{className:"mem-game-over-card",style:{background:"rgba(255,255,255,.92)",backdropFilter:"blur(12px)",borderRadius:20,padding:"28px 24px",boxShadow:"0 8px 32px rgba(0,0,0,.1)",animation:"memSlideUp .4s ease"},children:[e.jsx("div",{style:{fontSize:48,marginBottom:8},children:"🎉"}),e.jsx("h2",{style:{fontSize:20,fontWeight:800,color:a.heading_1_color||"#1a1a2e",margin:"0 0 4px"},children:c.text1||"🎉 Congratulations!"}),e.jsx("p",{style:{fontSize:14,color:a.heading_2_color||"#666",margin:"0 0 8px"},children:c.text2||`You matched all cards in ${C} moves!`}),a.outro_text&&e.jsx("p",{style:{fontSize:13,color:a.description_color||"#888",margin:"0 0 16px",lineHeight:1.4},children:a.outro_text}),e.jsx("button",{className:"mem-overlay-btn",onClick:()=>f==null?void 0:f({redirect_url:a.redirect_url||c.redirect_url}),style:{background:a.primary_color||"#6366f1",color:"#fff",marginBottom:10},children:a.continue_button_text||"Continue →"}),e.jsx("button",{className:"mem-overlay-btn",onClick:()=>window.location.reload(),style:{background:"rgba(0,0,0,.08)",color:"#333"},children:"Play Again"})]})}),!b&&e.jsxs("div",{className:"mem-powerups",children:[e.jsxs("div",{className:"mem-powerup-wrap",style:{position:"relative"},children:[e.jsxs("button",{className:"mem-powerup",style:{background:"linear-gradient(135deg,#3498db,#2980b9)"},onClick:Ne,disabled:G<=0||j.length!==1||z,children:[e.jsx("div",{className:"mem-powerup-icon",children:"🔍"}),e.jsx("div",{children:"Hint"}),e.jsx("div",{className:"mem-powerup-badge",children:G})]}),e.jsx("div",{className:"mem-powerup-tooltip",children:j.length!==1?"Select 1 card first":"Reveal matching card"})]}),e.jsxs("div",{className:"mem-powerup-wrap",style:{position:"relative"},children:[e.jsxs("button",{className:"mem-powerup",style:{background:"linear-gradient(135deg,#27ae60,#229954)"},onClick:ze,disabled:U<=0||z,children:[e.jsx("div",{className:"mem-powerup-icon",children:"🔄"}),e.jsx("div",{children:"Shuffle"}),e.jsx("div",{className:"mem-powerup-badge",children:U})]}),e.jsx("div",{className:"mem-powerup-tooltip",children:"Rearrange unmatched cards"})]})]})]}),A&&e.jsx("div",{className:"mem-overlay",children:e.jsx("div",{style:{animationName:ue||a.overlay_animation_in||"memFlyFromBottom",animationDuration:".4s",animationFillMode:"both"},children:e.jsxs("div",{className:"mem-overlay-card",children:[a.overlay_image_url?e.jsx("img",{src:a.overlay_image_url,alt:"",style:{maxWidth:"80vw",maxHeight:"50vh",borderRadius:16,boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}):e.jsx("div",{className:"mem-overlay-emoji",children:"🎉"}),e.jsx("div",{className:"mem-overlay-title",children:a.heading_1||"Nice!"}),e.jsx("div",{className:"mem-overlay-sub",children:"You found a match!"}),e.jsx("button",{onClick:Se,className:"mem-overlay-btn",style:{background:a.primary_color||"#6366f1",color:"#fff",animation:"memNextBtnIn .3s ease .2s both"},children:"Next →"})]})})}),E&&e.jsx("div",{className:"mem-popup",children:E})]})}return null}export{Ee as default};
