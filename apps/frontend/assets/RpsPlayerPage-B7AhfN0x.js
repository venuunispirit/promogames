import{r as a,j as e}from"./react-vendor-gyK15t0p.js";const te={rock:"scissors",paper:"rock",scissors:"paper"},P={rock:"✊",paper:"✋",scissors:"✌️"},g={rock:"Rock",paper:"Paper",scissors:"Scissors"},k=["rock","paper","scissors"],j=5,re=`
  .rps-root{
    --felt-dark:#1f1033;
    --felt:#3b1f5c;
    --felt-light:#54308a;
    --gold:#b48af0;
    --gold-bright:#d4b3ff;
    --oxblood-bright:#a855c9;
    --cream:#ede6f5;
    --ink:#1c1029;
    --stone:#9d8bc2;
    --win:#8b5cf6;

    min-height:100vh;
    width:100%;
    background:
      radial-gradient(circle at 50% 0%, var(--felt-light) 0%, var(--felt) 45%, var(--felt-dark) 100%);
    font-family:'Work Sans', sans-serif;
    color:var(--cream);
    display:flex;
    flex-direction:column;
    align-items:center;
    padding:28px 16px 60px;
    position:relative;
    overflow-x:hidden;
    box-sizing:border-box;
  }
  .rps-root *{box-sizing:border-box;}
  .rps-root::before{
    content:"";
    position:fixed;
    inset:0;
    pointer-events:none;
    background-image:
      repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px);
    opacity:0.4;
    z-index:0;
  }
  .rps-stage{ position:relative; z-index:1; width:100%; max-width:720px; }
  .rps-header{ text-align:center; margin-bottom:22px; }
  .rps-eyebrow{
    font-family:'JetBrains Mono', monospace;
    letter-spacing:0.35em;
    font-size:11px;
    color:var(--gold);
    text-transform:uppercase;
    margin-bottom:6px;
  }
  .rps-h1{
    font-family:'Anton', sans-serif;
    font-weight:400;
    font-size:clamp(38px, 8vw, 64px);
    letter-spacing:0.02em;
    margin:0;
    color:var(--cream);
    text-shadow:0 3px 0 rgba(0,0,0,0.35);
    line-height:0.95;
  }
  .rps-h1 span{color:var(--gold-bright);}

  /* Scoreboard: numbers only, no card/background */
  .rps-scoreboard{
    display:flex; align-items:center; justify-content:center; gap:36px;
    margin:20px auto 26px;
  }
  .rps-score-block{ text-align:center; }
  .rps-score-label{
    font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.2em;
    text-transform:uppercase; color:var(--stone); margin-bottom:4px;
  }
  .rps-score-value{ font-family:'Anton', sans-serif; font-size:48px; line-height:1; }
  .rps-score-value.you{ color:var(--gold-bright); }
  .rps-score-value.cpu{ color:var(--oxblood-bright); }
  .rps-score-sep{
    font-family:'Anton', sans-serif; font-size:28px; color:var(--stone); opacity:0.6;
  }
  .rps-goal{
    text-align:center; font-family:'JetBrains Mono', monospace; font-size:11px;
    letter-spacing:0.15em; color:var(--stone); margin-top:-14px; margin-bottom:20px; opacity:0.8;
  }

  .rps-table{
    position:relative;
    background:radial-gradient(ellipse at 50% 40%, var(--felt-light) 0%, var(--felt) 70%);
    border:6px solid #0d1a13; border-radius:16px; padding:36px 20px 28px;
    box-shadow:inset 0 0 60px rgba(0,0,0,0.45), 0 20px 40px rgba(0,0,0,0.4);
    margin-bottom:26px;
  }
  .rps-arena{ display:flex; align-items:center; justify-content:space-between; gap:0; min-height:190px; }
  .rps-slot{ flex:1; display:flex; flex-direction:column; align-items:center; gap:10px; }
  .rps-slot-label{
    font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.25em;
    text-transform:uppercase; color:var(--stone);
  }
  .rps-hand-wrap{
    width:230px; height:180px; display:flex; align-items:center; justify-content:center;
    position:relative; overflow:visible;
  }
  .rps-hand{
    font-size:110px; line-height:1; display:flex; align-items:center; justify-content:center;
    width:210px; height:162px;
    filter:drop-shadow(0 10px 8px rgba(0,0,0,0.45));
    transform:scale(0.92);
    transition:transform 0.15s ease;
  }
  .rps-slot.cpu .rps-hand{ transform:scale(0.92) scaleX(-1); }
  .rps-hand.stamp{ animation:rpsStampDown 0.32s cubic-bezier(.2,1.4,.4,1) forwards; }
  .rps-slot.cpu .rps-hand.stamp{ animation:rpsStampDownCpu 0.32s cubic-bezier(.2,1.4,.4,1) forwards; }
  @keyframes rpsStampDown{
    0%{transform:scale(1.5) rotate(-8deg); opacity:0.2;}
    60%{transform:scale(0.86) rotate(4deg); opacity:1;}
    100%{transform:scale(0.97) rotate(0deg); opacity:1;}
  }
  @keyframes rpsStampDownCpu{
    0%{transform:scale(1.5) scaleX(-1) rotate(8deg); opacity:0.2;}
    60%{transform:scale(0.86) scaleX(-1) rotate(-4deg); opacity:1;}
    100%{transform:scale(0.97) scaleX(-1) rotate(0deg); opacity:1;}
  }
  .rps-hand.shaking{ animation:rpsShake 0.28s ease-in-out infinite; }
  .rps-slot.cpu .rps-hand.shaking{ animation:rpsShakeCpu 0.28s ease-in-out infinite; }
  @keyframes rpsShake{
    0%,100%{transform:translateY(0) rotate(-4deg) scale(0.92);}
    50%{transform:translateY(-14px) rotate(4deg) scale(0.97);}
  }
  @keyframes rpsShakeCpu{
    0%,100%{transform:translateY(0) scaleX(-1) rotate(4deg) scale(0.92);}
    50%{transform:translateY(-14px) scaleX(-1) rotate(-4deg) scale(0.97);}
  }
  .rps-vs{ font-family:'Anton', sans-serif; font-size:26px; color:var(--gold); opacity:0.7; padding-top:16px; }
  .rps-result-banner{ text-align:center; margin-top:20px; min-height:66px; transition:opacity 0.2s ease; }
  .rps-result-banner .rps-headline{
    font-family:'Anton', sans-serif; font-size:clamp(30px, 6vw, 44px);
    letter-spacing:0.02em; text-shadow:0 3px 0 rgba(0,0,0,0.35);
  }
  .rps-result-banner .rps-subline{
    font-family:'Work Sans', sans-serif; font-weight:600; font-size:16px;
    color:var(--cream); opacity:0.85; margin-top:4px;
  }
  .rps-result-banner.win .rps-headline{ color:var(--win); }
  .rps-result-banner.lose .rps-headline{ color:var(--oxblood-bright); }
  .rps-result-banner.tie .rps-headline{ color:var(--gold); }
  .rps-result-banner.match .rps-headline{ color:var(--gold-bright); }
  .rps-countdown{
    text-align:center; font-family:'Anton', sans-serif; font-size:20px; color:var(--stone);
    letter-spacing:0.1em; margin-top:20px; min-height:34px;
  }
  .rps-controls{ display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:22px; }
  .rps-choice-btn{
    width:88px; height:88px; border-radius:50%; border:2px solid var(--gold);
    background:var(--ink); color:var(--cream); cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:44px; line-height:1;
    padding:0; touch-action:manipulation; -webkit-tap-highlight-color:transparent; user-select:none;
    transition:transform 0.12s ease, background 0.15s ease, box-shadow 0.15s ease;
    box-shadow:0 6px 0 #0a140e, 0 8px 14px rgba(0,0,0,0.35);
  }
  .rps-choice-btn:hover{
    background:var(--felt-light); transform:translateY(-2px);
    box-shadow:0 8px 0 #0a140e, 0 12px 18px rgba(0,0,0,0.4);
  }
  .rps-choice-btn:active, .rps-choice-btn.pressed{
    transform:translateY(4px); box-shadow:0 2px 0 #0a140e, 0 4px 8px rgba(0,0,0,0.3);
  }
  .rps-choice-btn:disabled{
    opacity:0.35; cursor:default; transform:none;
    box-shadow:0 6px 0 #0a140e, 0 8px 14px rgba(0,0,0,0.35);
  }
  .rps-choice-btn:focus-visible{ outline:3px solid var(--gold-bright); outline-offset:3px; }
  .rps-footer-row{
    display:flex; justify-content:center; align-items:center; gap:18px;
    margin-top:26px; flex-wrap:wrap;
  }
  .rps-play-again-btn{
    font-family:'Anton', sans-serif; font-size:16px; letter-spacing:0.06em;
    text-transform:uppercase; background:var(--gold-bright); border:none;
    color:var(--ink); padding:12px 30px; border-radius:6px; cursor:pointer;
    touch-action:manipulation; -webkit-tap-highlight-color:transparent;
    box-shadow:0 6px 0 #7a4fb0, 0 8px 14px rgba(0,0,0,0.35);
    transition:transform 0.12s ease;
  }
  .rps-play-again-btn:active{ transform:translateY(3px); }
  .rps-streak{
    font-family:'JetBrains Mono', monospace; font-size:12px; color:var(--gold);
    letter-spacing:0.1em; min-height:16px;
  }
  @media (prefers-reduced-motion: reduce){
    .rps-hand.stamp, .rps-hand.shaking{ animation:none; }
  }
  @media (max-width:480px){
    .rps-root{ padding:18px 10px 40px; }
    .rps-eyebrow{ font-size:10px; letter-spacing:0.28em; }
    .rps-scoreboard{ gap:24px; margin:14px auto 18px; }
    .rps-score-value{ font-size:36px; }
    .rps-goal{ margin-bottom:14px; }
    .rps-table{ padding:22px 10px 18px; border-radius:12px; }
    .rps-arena{ gap:2px; min-height:130px; }
    .rps-hand-wrap{ width:140px; height:108px; }
    .rps-hand{ width:128px; height:96px; font-size:64px; }
    .rps-vs{ font-size:18px; padding-top:8px; }
    .rps-slot-label{ font-size:10px; }
    .rps-countdown{ font-size:16px; margin-top:12px; min-height:24px; }
    .rps-result-banner{ min-height:54px; margin-top:12px; }
    .rps-choice-btn{ width:68px; height:68px; font-size:32px; }
    .rps-controls{ gap:12px; }
    .rps-footer-row{ gap:10px; margin-top:18px; }
  }
  @media (max-width:360px){
    .rps-h1{ font-size:32px; }
    .rps-hand-wrap{ width:112px; height:90px; }
    .rps-hand{ width:104px; height:80px; font-size:52px; }
    .rps-choice-btn{ width:58px; height:58px; font-size:26px; }
    .rps-score-value{ font-size:28px; }
  }
`;function oe(){const[S,R]=a.useState(0),[N,M]=a.useState(0),[I,f]=a.useState("rock"),[G,b]=a.useState("rock"),[J,C]=a.useState(""),[X,z]=a.useState(""),[D,l]=a.useState("Choose your hand"),[v,c]=a.useState({kind:"",headline:"",subline:""}),[A,w]=a.useState({count:0,who:null}),[O,T]=a.useState(!1),[F,y]=a.useState(null),[W,$]=a.useState(!1),x=a.useRef(null),E=a.useCallback(()=>{if(!x.current){const s=window.AudioContext||window.webkitAudioContext;if(!s)return null;x.current=new s}return x.current.state==="suspended"&&x.current.resume(),x.current},[]),t=a.useCallback((s,r,p="sine",h=.18,u=0)=>{const o=E();if(o)try{const i=o.createOscillator(),d=o.createGain();i.type=p,i.frequency.value=s;const n=o.currentTime+u;d.gain.setValueAtTime(1e-4,n),d.gain.linearRampToValueAtTime(h,n+.012),d.gain.exponentialRampToValueAtTime(1e-4,n+r),i.connect(d).connect(o.destination),i.start(n),i.stop(n+r+.03)}catch{}},[E]),H=a.useCallback(()=>t(520,.08,"square",.12),[t]),V=a.useCallback(()=>t(170,.16,"sine",.22),[t]),L=a.useCallback(()=>{t(523,.12,"triangle",.2,0),t(659,.12,"triangle",.2,.12),t(784,.22,"triangle",.22,.24)},[t]),_=a.useCallback(()=>{t(300,.18,"sawtooth",.14,0),t(220,.26,"sawtooth",.14,.15)},[t]),q=a.useCallback(()=>{t(400,.1,"sine",.16,0),t(400,.1,"sine",.16,.14)},[t]),K=a.useCallback(()=>{[523,659,784,1046].forEach((s,r)=>t(s,.18,"triangle",.22,r*.13))},[t]),B=typeof navigator<"u"&&"vibrate"in navigator,U=a.useCallback(s=>{if(B)try{navigator.vibrate(s)}catch{}},[B]),Q=(s,r)=>s===r?"tie":te[s]===r?"win":"lose",Z=s=>{if(O||W)return;T(!0),c({kind:"",headline:"",subline:""});const r=["rock","paper","scissors"][Math.floor(Math.random()*3)],p=Q(s,r),h=p==="win"?S+1:S,u=p==="lose"?N+1:N,o=h>=j,i=u>=j,d=[40,50,40,50,40,50,40,50,40,50,40,50,40,50,40,50];let n;o||i?n=[70,40,70,40,220]:p==="win"?n=[50,30,50,30,130]:p==="lose"?n=[280]:n=[60,60,60],H(),U([...d,...n]),C("shaking"),z("shaking"),f(k[0]),b(k[0]);let Y=0;l("Rock… Paper… Scissors…");const ae=setInterval(()=>{f(k[Y%3]),b(k[Y%3]),Y++},90);setTimeout(()=>{clearInterval(ae),C("stamp"),z("stamp"),f(s),b(r),V(),R(h),M(u),o||i?($(!0),c({kind:"match",headline:o?"You Win the Game!":"Opponent Wins the Game!",subline:`Final score ${h} - ${u}`}),l("Game Over"),K()):p==="win"?(c({kind:"win",headline:"You Win!",subline:`${g[s]} beats ${g[r]}!`}),w(m=>m.who==="you"?{count:m.count+1,who:"you"}:{count:1,who:"you"}),L(),l("Choose your next hand")):p==="lose"?(c({kind:"lose",headline:"Opponent Wins!",subline:`${g[r]} beats ${g[s]}!`}),w(m=>m.who==="cpu"?{count:m.count+1,who:"cpu"}:{count:1,who:"cpu"}),_(),l("Choose your next hand")):(c({kind:"tie",headline:"Push!",subline:"It's a tie — choose your next hand!"}),w({count:0,who:null}),q(),l("Choose your next hand")),T(!1)},750)},ee=()=>{R(0),M(0),w({count:0,who:null}),c({kind:"",headline:"",subline:""}),l("Choose your hand"),f("rock"),b("rock"),C(""),z(""),$(!1)},se=A.count>=2?`${A.who==="you"?"You are":"Opponent is"} on a ${A.count}-win streak`:"";return e.jsxs("div",{className:"rps-root",children:[e.jsx("style",{children:re}),e.jsx("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"}),e.jsxs("div",{className:"rps-stage",children:[e.jsxs("header",{className:"rps-header",children:[e.jsxs("div",{className:"rps-eyebrow",children:["First to ",j," Wins"]}),e.jsxs("h1",{className:"rps-h1",children:["ROCK · PAPER · ",e.jsx("span",{children:"SCISSORS"})]})]}),e.jsxs("div",{className:"rps-scoreboard",children:[e.jsxs("div",{className:"rps-score-block",children:[e.jsx("div",{className:"rps-score-label",children:"You"}),e.jsx("div",{className:"rps-score-value you",children:S})]}),e.jsx("div",{className:"rps-score-sep",children:"—"}),e.jsxs("div",{className:"rps-score-block",children:[e.jsx("div",{className:"rps-score-label",children:"Opponent"}),e.jsx("div",{className:"rps-score-value cpu",children:N})]})]}),e.jsxs("div",{className:"rps-goal",children:["First to ",j," points wins the game"]}),e.jsxs("div",{className:"rps-table",children:[e.jsxs("div",{className:"rps-arena",children:[e.jsxs("div",{className:"rps-slot",children:[e.jsx("div",{className:"rps-slot-label",children:"You"}),e.jsx("div",{className:"rps-hand-wrap",children:e.jsx("div",{className:`rps-hand ${J}`,children:P[I]})})]}),e.jsx("div",{className:"rps-vs",children:"VS"}),e.jsxs("div",{className:"rps-slot cpu",children:[e.jsx("div",{className:"rps-slot-label",children:"Opponent"}),e.jsx("div",{className:"rps-hand-wrap",children:e.jsx("div",{className:`rps-hand ${X}`,children:P[G]})})]})]}),e.jsx("div",{className:"rps-countdown",children:D}),e.jsx("div",{className:`rps-result-banner ${v.kind}`,children:v.headline&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"rps-headline",children:v.headline}),e.jsx("div",{className:"rps-subline",children:v.subline})]})}),W?e.jsx("div",{className:"rps-controls",children:e.jsx("button",{className:"rps-play-again-btn",onClick:ee,children:"Play Again"})}):e.jsx("div",{className:"rps-controls",children:["rock","paper","scissors"].map(s=>e.jsx("button",{className:`rps-choice-btn ${F===s?"pressed":""}`,"aria-label":`Play ${g[s]}`,disabled:O,onPointerDown:()=>y(s),onPointerUp:()=>y(null),onPointerCancel:()=>y(null),onPointerLeave:()=>y(null),onClick:()=>Z(s),children:P[s]},s))})]}),e.jsx("div",{className:"rps-footer-row",children:e.jsx("div",{className:`rps-stre
          
          ak`,children:se})})]})]})}export{oe as default};
