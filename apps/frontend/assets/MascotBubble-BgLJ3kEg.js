import{r as t,j as e}from"./react-vendor-gyK15t0p.js";const i=["Drag me down to start!","Play games, win rewards!","Check out the leaderboard!","New games added weekly!","Hey there, gamer!"],p=`
.mb-wrap{
  position:fixed;right:3%;bottom:15%;width:110px;z-index:90;
  pointer-events:none;display:flex;flex-direction:column;align-items:center;
  opacity:0;transform:translateY(20px);transition:opacity .4s ease,transform .4s ease;
}
.mb-wrap.visible{opacity:1;transform:translateY(0)}
.mb-wrap img{width:100%;height:auto;display:block;filter:drop-shadow(0 4px 16px rgba(146,16,246,0.35));animation:mbFloat 4s ease-in-out infinite}
@keyframes mbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.mb-bubble{
  position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
  min-width:130px;max-width:180px;padding:8px 12px;
  background:rgba(20,8,40,0.92);border:1px solid rgba(146,16,246,0.35);border-radius:12px;
  font-family:'DM Sans',sans-serif;font-size:11px;line-height:1.45;color:#e0d0ff;text-align:center;
  box-shadow:0 4px 18px rgba(0,0,0,0.45),0 0 10px rgba(146,16,246,0.15);
  opacity:0;transform:translateX(-50%) translateY(5px) scale(0.92);
  transition:opacity .3s ease,transform .3s ease;white-space:nowrap;z-index:20;
}
.mb-bubble.show{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}
.mb-bubble::after{
  content:'';position:absolute;bottom:-5px;left:50%;margin-left:-4px;
  width:8px;height:8px;background:rgba(20,8,40,0.92);
  border-right:1px solid rgba(146,16,246,0.35);border-bottom:1px solid rgba(146,16,246,0.35);
  transform:rotate(45deg);
}
@media(max-width:900px){.mb-wrap{display:none}}
`;function c(){const[s,n]=t.useState(!1),[r,o]=t.useState(!1),[l,b]=t.useState(0);return t.useEffect(()=>{const a=setTimeout(()=>n(!0),800);return()=>clearTimeout(a)},[]),t.useEffect(()=>{if(!s)return;const a=setTimeout(()=>o(!0),600);return()=>clearTimeout(a)},[s]),t.useEffect(()=>{if(!r)return;const a=setInterval(()=>{o(!1),setTimeout(()=>{b(m=>(m+1)%i.length),o(!0)},400)},5e3);return()=>clearInterval(a)},[r]),e.jsxs(e.Fragment,{children:[e.jsx("style",{children:p}),e.jsxs("div",{className:`mb-wrap${s?" visible":""}`,children:[e.jsx("div",{className:`mb-bubble${r?" show":""}`,children:i[l]}),e.jsx("img",{src:"/mascot-b.webp",alt:"Mascot",width:"240",height:"240",loading:"lazy"})]})]})}export{c as M};
