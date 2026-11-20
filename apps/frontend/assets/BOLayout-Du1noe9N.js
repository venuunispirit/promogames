import{d as Q,u as Z,r as t,j as e,L as ee,O as oe}from"./react-vendor-gyK15t0p.js";import{c as te,a as O,L as ie}from"./index-B2qSlCu9.js";import{X as ne}from"./x-BSYMQvHz.js";import{V as re}from"./volume-2-DbGfhel9.js";import{V as se}from"./volume-x-DvwFfcAz.js";import{M as ae}from"./menu-BS9ah9HV.js";import{E as le}from"./eye-Dh4iGwum.js";import{G as de}from"./gamepad-2-CqrDM6Qy.js";import{T as ce}from"./trophy-B6m6IBwK.js";/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],fe=te("layout-dashboard",pe),be=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes boFadeDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:none } }
@keyframes boSlideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
@keyframes boPulse { 0%,100%{box-shadow:0 0 0 0 rgba(146,16,246,0.4)} 50%{box-shadow:0 0 0 12px rgba(146,16,246,0)} }
@keyframes boShake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.bo-layout { display: flex; min-height: 100vh; background: #f8f7ff; }

/* ── Sidebar ── */
.bo-sidebar {
  width: 260px; flex-shrink: 0;
  background: linear-gradient(180deg, #0f0a1e 0%, #0a0614 30%, #07040f 70%, #05030b 100%);
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 200;
  transition: transform 0.3s cubic-bezier(.4,0,.2,1);
}
.bo-sidebar-logo { padding: 24px 24px 0; display: flex; align-items: center; gap: 10px; }
.bo-sidebar-logo-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(146,16,246,0.2);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 16px; font-weight: 900;
  border: 1px solid rgba(146,16,246,0.3);
}
.bo-sidebar-logo-text { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; }
.bo-sidebar-greeting { padding: 20px 24px 0; font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 500; }
.bo-sidebar-nav { flex: 1; padding: 16px 12px 0; display: flex; flex-direction: column; gap: 4px; }
.bo-sidebar-link {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600;
  color: rgba(255,255,255,0.65); text-decoration: none;
  transition: all 0.2s cubic-bezier(.4,0,.2,1); position: relative;
}
.bo-sidebar-link:hover { background: rgba(146,16,246,0.1); color: #ffffff; }
.bo-sidebar-link.active {
  background: rgba(146,16,246,0.18);
  color: #ffffff; box-shadow: 0 2px 12px rgba(146,16,246,0.15);
  border: 1px solid rgba(146,16,246,0.2);
}
.bo-sidebar-link .badge {
  position:absolute; top:8px; right:12px; min-width:20px; height:20px; border-radius:10px;
  background:#ef4444; color:#fff; font-size:11px; font-weight:700;
  display:flex; align-items:center; justify-content:center; padding:0 6px;
  animation: boPulse 2s ease infinite;
}
.bo-sidebar-promo {
  margin: 12px; padding: 20px; border-radius: 16px;
  background: rgba(146,16,246,0.12);
  color: #fff; position: relative; overflow: hidden;
  border: 1px solid rgba(146,16,246,0.2);
}
.bo-sidebar-promo::before { content:''; position:absolute; top:-20px; right:-20px; width:80px; height:80px; border-radius:50%; background:rgba(146,16,246,0.12); }
.bo-sidebar-promo::after { content:''; position:absolute; bottom:-30px; left:-10px; width:60px; height:60px; border-radius:50%; background:rgba(146,16,246,0.08); }
.bo-sidebar-promo-title { font-size:14px; font-weight:800; line-height:1.3; position:relative; z-index:1; }
.bo-sidebar-promo-sub { font-size:11px; opacity:0.6; margin-top:4px; position:relative; z-index:1; }
.bo-sidebar-promo-mascot { width:56px; height:56px; border-radius:14px; margin:12px auto 0; background:rgba(146,16,246,0.15); display:flex; align-items:center; justify-content:center; font-size:28px; position:relative; z-index:1; border:1px solid rgba(146,16,246,0.2); }
.bo-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(146,16,246,0.15); font-size:11px; color:rgba(255,255,255,0.45); }

/* ── Main ── */
.bo-main { flex:1; margin-left:260px; display:flex; flex-direction:column; min-height:100vh; }

/* ── Toast ── */
.bo-toast {
  position:fixed; top:24px; right:24px; z-index:11000;
  padding:14px 22px; border-radius:14px;
  background:#fff; box-shadow:0 8px 32px rgba(0,0,0,0.12);
  animation:boFadeDown .3s ease;
  border:1px solid #ece8ff;
}

/* ── Force Popup ── */
.bo-force-overlay {
  position:fixed; inset:0; background:rgba(17,24,39,0.6); backdrop-filter:blur(8px);
  z-index:10000; display:flex; align-items:center; justify-content:center;
  animation:boFadeDown .25s ease;
}
.bo-force-card {
  background:#fff; border-radius:24; max-width:440px; width:calc(100% - 32px);
  box-shadow:0 32px 80px rgba(143,44,255,0.35); animation:boSlideUp .3s cubic-bezier(.4,0,.2,1);
  overflow:hidden;
}
.bo-force-header {
  background:linear-gradient(135deg,#9210f6,#6E11D8); padding:20px 24px 16px; position:relative;
}
.bo-force-body { padding:24px; }

/* Mobile hamburger */
.bo-hamburger {
  display:none; position:fixed; top:16px; left:16px; z-index:210;
  width:42px; height:42px; border-radius:12px; border:1px solid #f0eef5;
  background:#fff; align-items:center; justify-content:center; cursor:pointer;
  color:#64748b; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.06);
}
.bo-hamburger:hover { border-color:#e0d9f5; color:#9210f6; }
.bo-mobile-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.3); z-index:199; backdrop-filter:blur(2px); }

@media (max-width:1024px) {
  .bo-sidebar { transform:translateX(-100%); }
  .bo-sidebar.open { transform:translateX(0); }
  .bo-main { margin-left:0; }
  .bo-hamburger { display:flex; }
  .bo-mobile-overlay.open { display:block; }
}
`;let g=null;function ue(){try{const x=window.AudioContext||window.webkitAudioContext;if(!x)return;(!g||g.state==="closed")&&(g=new x),g.state==="suspended"&&g.resume();const d=g,i=d.currentTime,y=(v,s,h)=>{const c=d.createOscillator(),r=d.createGain();c.type="sine",c.frequency.setValueAtTime(v,s),r.gain.setValueAtTime(.001,s),r.gain.exponentialRampToValueAtTime(.4,s+.02),r.gain.exponentialRampToValueAtTime(.001,s+h),c.connect(r).connect(d.destination),c.start(s),c.stop(s+h+.05)};y(880,i,.18),y(1174.66,i+.12,.25)}catch{}}function Se(){var D,G;const x=Q(),d=Z(),[i,y]=t.useState(null),[v,s]=t.useState(!1),[h,c]=t.useState(0),[r,_]=t.useState(null),[z,C]=t.useState(5),[T,k]=t.useState(""),[p,f]=t.useState(""),[E,j]=t.useState(null),[a,b]=t.useState(!1),[m,V]=t.useState(!0),[R,L]=t.useState(null),M=t.useRef(null),I=t.useRef(null),w=t.useRef(null),N=t.useRef(new Set),F=t.useRef(0),W=t.useCallback((o,n="success")=>{L({msg:o,type:n}),setTimeout(()=>L(null),3e3)},[]),u=t.useCallback(()=>{_(null),C(5),k(""),f(""),j(null),b(!1),clearInterval(w.current),clearTimeout(I.current)},[]),P=t.useCallback(o=>{if(N.current.has(o.id))return;N.current.add(o.id),m&&ue(),_(o),C(5),k(""),f(""),j(null),b(!1);let n=5;w.current=setInterval(()=>{n-=1,C(n),n<=0&&(clearInterval(w.current),I.current=setTimeout(()=>u(),500))},1e3)},[u,m]),B=async()=>{var o,n;if(r){f(""),b(!0);try{const l={redemption_id:r.id};T&&(l.code=T),await O.post("/business/accept-with-code",l),W("Redemption accepted!"),u()}catch(l){f(((n=(o=l.response)==null?void 0:o.data)==null?void 0:n.message)||"Invalid code"),b(!1)}}},U=async()=>{if(r){b(!0);try{await O.post("/business/reject-redemption",{redemption_id:r.id}),W("Redemption rejected"),u()}catch{W("Failed to reject","error")}finally{b(!1)}}},A=t.useCallback(async()=>{try{const{data:o}=await O.get("/business/notifications"),l=(o.notifications||[]).filter(S=>["pending","code_revealed","code_entered"].includes(S.status));if(c(l.length),l.length>F.current&&F.current>=0){const S=l.filter(K=>!N.current.has(K.id));S.length>0&&P(S[0])}F.current=l.length}catch{}},[m,P]);t.useEffect(()=>(A(),M.current=setInterval(A,5e3),()=>{clearInterval(M.current),clearInterval(w.current),clearTimeout(I.current)}),[A]),t.useEffect(()=>{const o=localStorage.getItem("businessUser");if(!localStorage.getItem("businessToken")||!o){d("/login");return}try{y(JSON.parse(o))}catch{localStorage.removeItem("businessUser"),localStorage.removeItem("businessToken"),d("/login")}},[]),t.useEffect(()=>{s(!1)},[x.pathname]);const X=()=>{localStorage.removeItem("businessToken"),localStorage.removeItem("businessUser"),d("/login")},$=o=>x.pathname.startsWith(o),Y=(()=>{const o=new Date().getHours();return o<12?"Good Morning":o<17?"Good Afternoon":"Good Evening"})(),q=i&&!i.parent_id,H=[{to:"/bo/dashboard",icon:fe,label:"Dashboard"},...q?[{to:"/bo/my-page",icon:le,label:"Franchise Overview"}]:[],{to:"/bo/games",icon:de,label:"My Games"},{to:"/bo/redemptions",icon:ce,label:"Redemptions"}],J=o=>{if(!o)return"?";const n=o.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():n[0].substring(0,2).toUpperCase()};return e.jsxs("div",{className:"bo-layout",children:[e.jsx("style",{children:be}),R&&e.jsx("div",{className:"bo-toast",children:e.jsx("div",{style:{fontWeight:700,fontSize:14,color:R.type==="error"?"#ef4444":"#1e1b4b"},children:R.msg})}),r&&e.jsx("div",{className:"bo-force-overlay",onClick:u,children:e.jsxs("div",{className:"bo-force-card",onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{className:"bo-force-header",children:[e.jsx("button",{onClick:u,style:{position:"absolute",top:12,right:12,width:32,height:32,borderRadius:10,border:"none",background:"rgba(255,255,255,0.15)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(ne,{size:16})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{color:"#fff",fontSize:20,fontWeight:800},children:"New Player Submission!"}),e.jsxs("div",{style:{color:"rgba(255,255,255,0.7)",fontSize:13,marginTop:4},children:["Action required within ",z,"s"]})]}),e.jsx("button",{onClick:()=>V(!m),style:{background:"none",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",padding:4},children:m?e.jsx(re,{size:18}):e.jsx(se,{size:18})})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"10px 0 0",marginTop:12},children:[e.jsx("div",{style:{flex:1,height:4,borderRadius:2,background:"rgba(255,255,255,0.15)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${z/5*100}%`,borderRadius:2,background:"linear-gradient(90deg,#c040ff,#fff)",transition:"width 1s linear"}})}),e.jsxs("span",{style:{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.8)",minWidth:20,textAlign:"center"},children:[z,"s"]})]})]}),e.jsxs("div",{className:"bo-force-body",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("div",{style:{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#7c3aed",fontSize:18,flexShrink:0},children:J(r.player_name)}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsx("div",{style:{fontWeight:700,fontSize:15},children:r.player_name}),e.jsx("div",{style:{fontSize:12,color:"#94a3b8",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:r.game_name})]})]}),E==="code"&&e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6},children:"6-digit code (optional)"}),e.jsx("input",{type:"text",inputMode:"numeric",maxLength:6,value:T,onChange:o=>{k(o.target.value.replace(/\D/g,"").slice(0,6)),f("")},autoFocus:!0,placeholder:"000000",style:{width:"100%",padding:"12px 16px",fontSize:20,fontWeight:700,letterSpacing:8,textAlign:"center",border:p?"2px solid #ef4444":"2px solid #e5e7eb",borderRadius:12,outline:"none",fontFamily:"Inter, monospace",color:"#1e1b4b",background:p?"#fef2f2":"#f9fafb",animation:p?"boShake .4s ease":"none"},onKeyDown:o=>{o.key==="Enter"&&B()}}),p&&e.jsx("div",{style:{fontSize:12,color:"#ef4444",fontWeight:600,marginTop:6},children:p}),!p&&e.jsx("div",{style:{fontSize:11,color:"#94a3b8",fontWeight:500,marginTop:6},children:"Leave blank to accept without code verification."})]}),E?e.jsxs("div",{style:{display:"flex",gap:10},children:[e.jsx("button",{onClick:()=>{j(null),k(""),f("")},style:{padding:13,borderRadius:12,border:"1px solid #e5e7eb",background:"#fff",color:"#64748b",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"},children:"← Back"}),e.jsx("button",{onClick:B,disabled:a,style:{flex:1,padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontWeight:700,fontSize:13,cursor:a?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(16,185,129,0.3)",transition:"all 0.2s",opacity:a?.6:1},children:a?"Accepting...":"Accept"}),e.jsx("button",{onClick:U,disabled:a,style:{padding:13,borderRadius:12,border:"2px solid #fecaca",background:"#fff",color:"#ef4444",fontWeight:700,fontSize:13,cursor:a?"not-allowed":"pointer",fontFamily:"inherit",opacity:a?.6:1,transition:"all 0.2s"},children:"Reject"})]}):e.jsxs("div",{style:{display:"flex",gap:10},children:[e.jsx("button",{onClick:()=>j("code"),style:{flex:1,padding:13,borderRadius:12,border:"2px solid #e5e7eb",background:"#f9fafb",color:"#374151",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"},onMouseEnter:o=>{o.currentTarget.style.borderColor="#9210f6",o.currentTarget.style.color="#9210f6"},onMouseLeave:o=>{o.currentTarget.style.borderColor="#e5e7eb",o.currentTarget.style.color="#374151"},children:"Accept"}),e.jsx("button",{onClick:U,disabled:a,style:{flex:1,padding:13,borderRadius:12,border:"2px solid #fecaca",background:"#fff",color:"#ef4444",fontWeight:700,fontSize:13,cursor:a?"not-allowed":"pointer",fontFamily:"inherit",opacity:a?.6:1,transition:"all 0.2s"},children:"Reject"})]})]})]})}),e.jsx("div",{className:`bo-mobile-overlay ${v?"open":""}`,onClick:()=>s(!1)}),e.jsx("button",{className:"bo-hamburger",onClick:()=>s(!0),children:e.jsx(ae,{size:20})}),e.jsxs("aside",{className:`bo-sidebar${v?" open":""}`,children:[e.jsxs("div",{className:"bo-sidebar-logo",children:[e.jsx("div",{className:"bo-sidebar-logo-icon",children:(((D=i==null?void 0:i.business_name)==null?void 0:D[0])||"B").toUpperCase()}),e.jsx("span",{className:"bo-sidebar-logo-text",children:(i==null?void 0:i.business_name)||"Business"})]}),e.jsxs("div",{className:"bo-sidebar-greeting",children:[Y,", ",((G=i==null?void 0:i.business_name)==null?void 0:G.split(" ")[0])||"User"," 👋"]}),e.jsx("nav",{className:"bo-sidebar-nav",children:H.map(o=>e.jsxs(ee,{to:o.to,className:`bo-sidebar-link ${$(o.to)?"active":""}`,children:[e.jsx(o.icon,{size:20}),e.jsx("span",{children:o.label}),o.to==="/bo/redemptions"&&h>0&&e.jsx("span",{className:"badge",children:h})]},o.to))}),e.jsx("div",{style:{padding:"12px",marginTop:"auto"},children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx("div",{style:{position:"absolute",inset:"20%",background:"rgba(146,16,246,0.35)",borderRadius:"50%",filter:"blur(30px)",zIndex:0}}),e.jsx("img",{src:"/mascot.webp",alt:"PromoGames",style:{width:"100%",borderRadius:16,display:"block",position:"relative",zIndex:1}})]})}),e.jsx("div",{style:{padding:"0 12px 16px"},children:e.jsxs("button",{onClick:X,style:{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"},onMouseEnter:o=>{o.currentTarget.style.background="rgba(255,255,255,0.15)",o.currentTarget.style.color="#fff"},onMouseLeave:o=>{o.currentTarget.style.background="rgba(255,255,255,0.08)",o.currentTarget.style.color="rgba(255,255,255,0.75)"},children:[e.jsx(ie,{size:16})," Sign Out"]})}),e.jsxs("div",{className:"bo-sidebar-footer",children:["© 2025 ",(i==null?void 0:i.business_name)||"Business",e.jsx("br",{}),"All rights reserved."]})]}),e.jsx("div",{className:"bo-main",children:e.jsx("div",{className:"bo-content",style:{padding:32,animation:"boSlideUp 0.4s cubic-bezier(.4,0,.2,1)"},children:e.jsx(oe,{})})})]})}export{Se as default};
