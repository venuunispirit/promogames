import{r as a,j as e}from"./react-vendor-gyK15t0p.js";import{a as R}from"./index-B2qSlCu9.js";function B(r){if(r)try{new Audio(r).play().catch(()=>{})}catch{}}const v=`
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

.sb-game *, .sb-game *::before, .sb-game *::after { box-sizing: border-box; margin: 0; padding: 0; }

.sb-game {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
}

.sb-game::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(ellipse at center, rgba(147,51,234,0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.08) 0%, transparent 40%);
  pointer-events: none; z-index: 1;
}

.sb-game::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(30, 0, 60, 0.35);
  pointer-events: none; z-index: 0;
}

.sb-game-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 32px 24px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.1),
              0 0 0 1px rgba(255,255,255,0.08);
  position: relative; z-index: 2;
  max-width: 420px; width: 100%;
}

.sb-game-logo {
  height: 52px; object-fit: contain;
  margin-bottom: 20px; border-radius: 12px;
  display: block; margin-left: auto; margin-right: auto;
}

.sb-game-heading { text-align: center; margin-bottom: 24px; }
.sb-game-heading h1 { font-size: 28px; font-weight: 900; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.5px; }
.sb-game-heading p { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; }

.sb-stats-bar {
  display: flex; gap: 12px; margin-bottom: 24px;
}

.sb-stat-card {
  flex: 1; padding: 16px 12px; border-radius: 16px;
  text-align: center; position: relative; overflow: hidden;
  transition: transform 0.3s ease;
}
.sb-stat-card:hover { transform: translateY(-2px); }
.sb-stat-card.clicks-card { background: linear-gradient(135deg, #ec4899, #db2777); box-shadow: 0 8px 24px rgba(236,72,153,0.3); }
.sb-stat-card.health-card { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 8px 24px rgba(34,197,94,0.3); }
.sb-stat-card.timer-card { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 8px 24px rgba(245,158,11,0.3); }

.sb-stat-number { font-size: 36px; font-weight: 900; color: #1a1a1a; line-height: 1; margin-bottom: 4px; }
.sb-stat-label { font-size: 11px; font-weight: 700; color: rgba(26,26,26,0.7); text-transform: uppercase; letter-spacing: 1px; }

.sb-health-bar-wrap {
  width: 100%; height: 20px; background: rgba(255,255,255,0.15);
  border-radius: 50px; overflow: hidden; margin-bottom: 24px;
  border: 1px solid rgba(255,255,255,0.1);
}

.sb-health-bar {
  height: 100%; border-radius: 50px;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
}

.sb-health-bar::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%);
  border-radius: 50px;
}

.sb-health-text {
  text-align: center; font-size: 12px; font-weight: 700;
  color: rgba(255,255,255,0.7); margin-bottom: 20px;
}

.sb-tom-wrap {
  position: relative; width: 200px; height: 200px;
  margin: 0 auto 24px; cursor: pointer;
  transition: transform 0.1s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none; -webkit-user-select: none;
}

.sb-tom-wrap:active { transform: scale(0.95); }

.sb-tom-img {
  width: 100%; height: 100%; object-fit: contain;
  transition: filter 0.15s ease;
  filter: drop-shadow(0 8px 24px rgba(147,51,234,0.4));
}

.sb-tom-wrap:hover .sb-tom-img {
  filter: drop-shadow(0 12px 32px rgba(147,51,234,0.6)) brightness(1.05);
}

.sb-tom-wrap.hit .sb-tom-img {
  animation: sb-shake 0.3s ease;
}

@keyframes sb-shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  20% { transform: translateX(-8px) rotate(-3deg); }
  40% { transform: translateX(8px) rotate(3deg); }
  60% { transform: translateX(-5px) rotate(-2deg); }
  80% { transform: translateX(5px) rotate(2deg); }
}

.sb-damage-num {
  position: absolute; top: 50%; left: 50%;
  font-size: 28px; font-weight: 900; color: #ef4444;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  pointer-events: none;
  animation: sb-damage-float 0.8s ease-out forwards;
  z-index: 10;
}

@keyframes sb-damage-float {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -120%) scale(1.5); }
}

.sb-start-btn {
  width: 100%; padding: 16px; border-radius: 50px;
  border: none; font-size: 17px; font-weight: 800;
  font-family: 'Poppins', sans-serif; cursor: pointer;
  transition: all 0.3s ease; text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sb-start-btn:hover { transform: translateY(-2px); }

.sb-btn-start {
  background: linear-gradient(135deg, #9333ea, #7e22ce);
  color: #fff;
  box-shadow: 0 6px 20px rgba(147,51,234,0.4);
}
.sb-btn-start:hover { box-shadow: 0 8px 28px rgba(147,51,234,0.6); }

.sb-popup-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
  animation: sb-fade-in 0.3s ease;
}

@keyframes sb-fade-in { from { opacity: 0; } to { opacity: 1; } }

.sb-popup-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-radius: 28px; padding: 40px 32px;
  max-width: 360px; width: 100%; text-align: center;
  box-shadow: 0 25px 80px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.12),
              0 0 0 1px rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.12);
  animation: sb-popup-pop 0.5s cubic-bezier(0.68,-0.55,0.265,1.55);
}

@keyframes sb-popup-pop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.sb-popup-emoji {
  font-size: 72px; margin-bottom: 16px;
  animation: sb-bounce 1s ease-in-out infinite;
}

@keyframes sb-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.sb-popup-title {
  font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 8px;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #22c55e, #4ade80);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sb-popup-stats {
  display: flex; gap: 12px; justify-content: center; margin: 20px 0;
  flex-wrap: wrap;
}

.sb-popup-stat {
  background: rgba(255,255,255,0.1); border-radius: 12px;
  padding: 12px 20px; min-width: 100px;
  border: 1px solid rgba(255,255,255,0.1);
}

.sb-popup-stat-val { font-size: 22px; font-weight: 900; color: #fff; }
.sb-popup-stat-lbl { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

.sb-popup-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }

.sb-popup-btn {
  padding: 14px 32px; border-radius: 50px; border: none;
  font-size: 15px; font-weight: 700; font-family: 'Poppins', sans-serif;
  cursor: pointer; transition: all 0.3s ease; text-transform: uppercase;
  letter-spacing: 0.5px;
}
.sb-popup-btn:hover { transform: translateY(-2px); }

.sb-popup-btn.primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff; box-shadow: 0 6px 20px rgba(34,197,94,0.4);
}
.sb-popup-btn.secondary {
  background: rgba(255,255,255,0.1); color: #fff;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
}

.sb-timer-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px; border-radius: 50px;
  font-size: 15px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 20px rgba(245,158,11,0.4);
  margin-bottom: 20px;
  animation: sb-pulse 2s ease-in-out infinite;
}

@keyframes sb-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.sb-progress-text {
  text-align: center; font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,0.6); margin-bottom: 16px;
}

.sb-tom-default {
  width: 160px; height: 160px;
  background: linear-gradient(135deg, rgba(147,51,234,0.3), rgba(236,72,153,0.3));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 80px; line-height: 1;
  border: 4px solid rgba(255,255,255,0.2);
  box-shadow: 0 12px 40px rgba(147,51,234,0.3),
              inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.2s ease;
}

.sb-tom-wrap:hover .sb-tom-default {
  box-shadow: 0 16px 48px rgba(147,51,234,0.5),
              inset 0 1px 0 rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.sb-tom-wrap.hit .sb-tom-default {
  animation: sb-shake 0.3s ease;
}

@media (max-width: 400px) {
  .sb-game-card { padding: 24px 16px; border-radius: 24px; }
  .sb-game-heading h1 { font-size: 24px; }
  .sb-tom-wrap { width: 160px; height: 160px; }
  .sb-stat-number { font-size: 28px; }
}
`,Y="🐱";function re({gameData:r,sessionToken:F,sessionId:ee,onSessionStart:j,onComplete:N,onLose:te}){const t=(r==null?void 0:r.settings)||{},O=(r==null?void 0:r.soundMap)||{},o=t.click_limit||150,l=t.timer_enabled===1||t.timer_enabled===!0||t.timer_enabled===void 0,x=t.show_click_count===1||t.show_click_count===!0||t.show_click_count===void 0,[c,h]=a.useState("start"),[m,z]=a.useState(0),[u,S]=a.useState(o),[b,T]=a.useState(0),[C,E]=a.useState(!1),[y,G]=a.useState(F),[H,L]=a.useState(!1),[P,X]=a.useState(null),[U,_]=a.useState([]),[$,J]=a.useState(0),p=a.useRef(null),g=a.useRef({clicks:0,time:0}),A=a.useRef(0),I=s=>{if(!s)return null;const n=parseInt(s);return isNaN(n)?s:O[n]||null};a.useEffect(()=>()=>{p.current&&clearInterval(p.current)},[]),a.useEffect(()=>(c==="playing"&&l&&(p.current=setInterval(()=>{T(s=>s+1)},1e3)),()=>{p.current&&clearInterval(p.current)}),[c,l]);const f=s=>{const n=Math.floor(s/60),d=s%60;return`${n}:${d.toString().padStart(2,"0")}`},K=async()=>{let s=y;if(!s)try{const n=JSON.parse(localStorage.getItem("playerUser")||"{}"),d=new URLSearchParams(window.location.search).get("source")==="direct"?"direct":"link",i=await R.post("/play/session/start",{game_id:r.id,player_data:{},source_type:d,promo_player_id:n.id||null});if(!i.data.success){if(i.data.message==="already_played"){L(!0);return}throw new Error(i.data.message)}s=i.data.session_token,G(s),j&&j(s,i.data.session_id)}catch(n){X(n.message||"Could not start game");return}h("playing")},W=a.useCallback(()=>{if(c!=="playing"||C)return;B(I(t.sound_correct_id));const s=m+1,n=u-1;z(s),S(n),J(i=>i+1),A.current++;const d=A.current;_(i=>[...i,{id:d,x:Math.random()*60-30,y:-20}]),setTimeout(()=>{_(i=>i.filter(D=>D.id!==d))},800),s>=o&&q(s)},[c,C,m,u,o,t]),q=a.useCallback(s=>{p.current&&clearInterval(p.current),E(!0),h("result");const n=b;g.current={clicks:s,time:n},B(I(t.win_sound_id));try{R.post("/play/session/complete",{session_token:y,score:s,player_data:{total_clicks:s,max_clicks:o,time_taken:n,game_result:"completed"}}).catch(()=>{})}catch{}},[b,y,o,t]),Q=()=>{z(0),S(o),T(0),E(!1),h("playing"),_([]),g.current={clicks:0,time:0}},V=()=>{N&&N({redirect_url:(r==null?void 0:r.redirect_url)||null,session:{score:g.current.clicks,total_scoreable:o}})},k=Math.max(0,u/o*100),M=k>60?"#22c55e":k>30?"#f59e0b":"#ef4444",w=t.bg_image_url?{backgroundImage:`url(${t.bg_image_url})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"}:{background:t.bg_color||"#1e1b4b"},Z=t.font_family?`'${t.font_family}', sans-serif`:"'Poppins', sans-serif";return H?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:v}),e.jsx("div",{className:"sb-game",style:w,children:e.jsx("div",{className:"sb-game-card",children:e.jsxs("div",{style:{textAlign:"center",padding:"40px 20px"},children:[e.jsx("div",{style:{fontSize:56,marginBottom:16},children:"❌"}),e.jsx("h2",{style:{color:"#fff",fontSize:24,fontWeight:800,margin:"0 0 8px"},children:"Already Played!"}),e.jsx("p",{style:{color:"rgba(255,255,255,0.6)",fontSize:14},children:"You've already completed this game."})]})})})]}):P?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:v}),e.jsx("div",{className:"sb-game",style:w,children:e.jsx("div",{className:"sb-game-card",children:e.jsxs("div",{style:{textAlign:"center",padding:"40px 20px"},children:[e.jsx("div",{style:{fontSize:56,marginBottom:16},children:"❌"}),e.jsx("h2",{style:{color:"#fff",fontSize:24,fontWeight:800,margin:"0 0 8px"},children:"Error"}),e.jsx("p",{style:{color:"rgba(255,255,255,0.6)",fontSize:14},children:P})]})})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:v}),e.jsxs("div",{className:"sb-game",style:{...w,fontFamily:Z},children:[e.jsxs("div",{className:"sb-game-card",children:[t.game_logo_url&&e.jsx("img",{src:t.game_logo_url,alt:"Logo",className:"sb-game-logo"}),e.jsxs("div",{className:"sb-game-heading",children:[t.heading_1&&e.jsx("h1",{style:{color:t.heading_1_color||"#fff"},children:t.heading_1}),t.heading_2&&e.jsx("p",{style:{color:t.heading_2_color||"rgba(255,255,255,0.5)"},children:t.heading_2})]}),c==="start"&&e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{className:"sb-tom-default",style:{margin:"0 auto 20px"},children:Y}),t.heading_3&&e.jsx("p",{style:{color:"rgba(255,255,255,0.5)",fontSize:13,marginBottom:8},children:t.heading_3}),e.jsxs("p",{style:{color:"rgba(255,255,255,0.4)",fontSize:12,marginBottom:20},children:["Click Tom ",o," times to win!",l&&" Beat the clock!"]}),e.jsx("button",{onClick:K,className:"sb-start-btn sb-btn-start",style:{color:t.start_button_text_color||"#fff",background:t.start_button_bg_color||void 0},children:t.start_button_text||"Start Game"})]}),c==="playing"&&e.jsxs(e.Fragment,{children:[x&&e.jsxs("div",{className:"sb-stats-bar",children:[e.jsxs("div",{className:"sb-stat-card clicks-card",children:[e.jsx("div",{className:"sb-stat-number",children:m}),e.jsx("div",{className:"sb-stat-label",children:"Clicks"})]}),l&&e.jsxs("div",{className:"sb-stat-card timer-card",children:[e.jsx("div",{className:"sb-stat-number",children:f(b)}),e.jsx("div",{className:"sb-stat-label",children:"Time"})]})]}),!x&&l&&e.jsx("div",{style:{textAlign:"center",marginBottom:20},children:e.jsx("div",{className:"sb-timer-badge",children:f(b)})}),e.jsx("div",{className:"sb-health-bar-wrap",children:e.jsx("div",{className:"sb-health-bar",style:{width:`${k}%`,background:`linear-gradient(135deg, ${M}, ${M}cc)`}})}),e.jsxs("div",{className:"sb-health-text",children:["Health: ",u," / ",o]}),e.jsxs("div",{className:"sb-progress-text",children:[x&&`${m} / ${o} clicks`,x&&l&&" - ",l&&`${f(b)}`]}),e.jsxs("div",{className:`sb-tom-wrap ${$>0?"hit":""}`,onClick:W,children:[t.o_image_url?e.jsx("img",{src:t.o_image_url,alt:"Tom",className:"sb-tom-img"}):e.jsx("div",{className:"sb-tom-default",children:Y}),U.map(s=>e.jsx("div",{className:"sb-damage-num",style:{left:`calc(50% + ${s.x}px)`,top:`calc(50% + ${s.y}px)`},children:"-1"},s.id))]},$),e.jsx("p",{style:{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:11},children:"Tap Tom to deal damage!"})]})]}),c==="result"&&e.jsx("div",{className:"sb-popup-overlay",children:e.jsxs("div",{className:"sb-popup-card",children:[e.jsx("div",{className:"sb-popup-emoji",children:"🎉"}),e.jsx("div",{className:"sb-popup-title",children:"TOM DEFEATED!"}),e.jsx("p",{style:{color:"rgba(255,255,255,0.6)",fontSize:14,marginBottom:8},children:t.custom_win_msg||"You dealt all the damage!"}),e.jsxs("div",{className:"sb-popup-stats",children:[e.jsxs("div",{className:"sb-popup-stat",children:[e.jsx("div",{className:"sb-popup-stat-val",children:g.current.clicks}),e.jsx("div",{className:"sb-popup-stat-lbl",children:"Total Clicks"})]}),l&&e.jsxs("div",{className:"sb-popup-stat",children:[e.jsx("div",{className:"sb-popup-stat-val",children:f(g.current.time)}),e.jsx("div",{className:"sb-popup-stat-lbl",children:"Time Taken"})]})]}),e.jsxs("div",{className:"sb-popup-actions",children:[e.jsx("button",{onClick:Q,className:"sb-popup-btn secondary",style:{color:t.try_again_text_color||"#fff",background:t.try_again_bg_color||"rgba(255,255,255,0.1)",border:t.try_again_bg_color?"none":"1px solid rgba(255,255,255,0.15)"},children:t.try_again_btn_text||"Try Again"}),e.jsx("button",{onClick:V,className:"sb-popup-btn primary",style:{color:t.continue_btn_text_color||"#fff",background:t.continue_btn_bg_color||void 0,boxShadow:t.continue_btn_bg_color?`0 6px 20px ${t.continue_btn_bg_color}66`:void 0},children:t.continue_btn_text||"Continue"})]})]})})]})]})}export{re as default};
