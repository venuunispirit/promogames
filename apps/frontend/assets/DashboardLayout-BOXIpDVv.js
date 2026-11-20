import{u as O,r as x,j as e,d as J,L as D,O as Y}from"./react-vendor-gyK15t0p.js";import{a as I,u as _,b as P}from"./index-B2qSlCu9.js";const U=t=>{const n=Date.now()-new Date(t).getTime(),r=Math.floor(n/6e4);if(r<1)return"just now";if(r<60)return`${r}m ago`;const o=Math.floor(r/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`},A={info:{color:"var(--chip-primary-fg)",bg:"var(--chip-primary-bg)"},success:{color:"var(--chip-green-fg)",bg:"var(--chip-green-bg)"},warning:{color:"var(--chip-amber-fg)",bg:"var(--chip-amber-bg)"},error:{color:"var(--chip-red-fg)",bg:"var(--chip-red-bg)"}};function V({apiBase:t="/notifications"}){const n=O(),[r,o]=x.useState(!1),[l,p]=x.useState([]),[d,g]=x.useState(0),h=x.useRef(),y=()=>{I.get(t).then(({data:a})=>{a.success&&(p(a.notifications||[]),g(a.unreadCount||0))}).catch(()=>{})};x.useEffect(()=>{y();const a=setInterval(y,3e4);return()=>clearInterval(a)},[t]),x.useEffect(()=>{const a=u=>{h.current&&!h.current.contains(u.target)&&o(!1)};return document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[]);const i=async()=>{await I.put(`${t}/read-all`),g(0),p(a=>a.map(u=>({...u,read_at:u.read_at||new Date().toISOString()})))},f=async a=>{a.read_at||(await I.put(`${t}/${a.id}/read`),g(u=>Math.max(0,u-1)),p(u=>u.map(b=>b.id===a.id?{...b,read_at:new Date().toISOString()}:b))),o(!1),a.link&&n(a.link)};return e.jsxs("div",{ref:h,style:{position:"relative"},children:[e.jsxs("button",{onClick:()=>o(a=>!a),style:{position:"relative",width:36,height:36,borderRadius:10,border:"1.5px solid var(--border)",background:"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--text2)",fontSize:16,flexShrink:0},title:"Notifications",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"}),e.jsx("path",{d:"M13.73 21a2 2 0 0 1-3.46 0"})]}),d>0&&e.jsx("span",{style:{position:"absolute",top:-4,right:-4,minWidth:18,height:18,borderRadius:9,background:"var(--error)",color:"var(--surface)",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",lineHeight:1,boxShadow:"0 2px 6px rgba(220,38,38,.35)"},children:d>99?"99+":d})]}),r&&e.jsxs("div",{style:{position:"absolute",top:"calc(100% + 8px)",right:0,width:380,background:"var(--surface)",borderRadius:14,border:"1px solid var(--border)",boxShadow:"0 12px 48px rgba(0,0,0,.12)",zIndex:999,maxHeight:480,display:"flex",flexDirection:"column",animation:"nav-fade-down .18s ease both"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 10px",borderBottom:"1px solid var(--border-light)",flexShrink:0},children:[e.jsx("span",{style:{fontSize:13,fontWeight:700,color:"var(--text)"},children:"Notifications"}),d>0&&e.jsx("button",{onClick:i,style:{fontSize:11,fontWeight:600,color:"var(--primary)",background:"none",border:"none",cursor:"pointer",fontFamily:"DM Sans"},children:"Mark all read"})]}),e.jsx("div",{style:{overflow:"auto",flex:1},children:l.length===0?e.jsx("div",{style:{padding:"32px 18px",textAlign:"center",color:"var(--text3)",fontSize:13},children:"No notifications yet"}):l.map(a=>{const u=A[a.type]||A.info;return e.jsxs("button",{onClick:()=>f(a),style:{display:"flex",gap:12,width:"100%",padding:"13px 18px",textAlign:"left",background:"transparent",border:"none",borderBottom:"1px solid var(--border-light)",cursor:"pointer",fontFamily:"DM Sans",transition:"background .1s"},onMouseEnter:b=>b.currentTarget.style.background="var(--surface2)",onMouseLeave:b=>b.currentTarget.style.background="transparent",children:[e.jsx("div",{style:{width:28,height:28,borderRadius:7,background:u.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,marginTop:1},children:a.type==="success"?"✓":a.type==="error"?"✕":a.type==="warning"?"⚠":"ℹ"}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx("span",{style:{fontSize:12.5,fontWeight:700,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:a.title}),!a.read_at&&e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:"var(--primary)",flexShrink:0}})]}),e.jsx("div",{style:{fontSize:12,color:"var(--text2)",marginTop:1,lineHeight:1.4},children:a.message}),e.jsx("div",{style:{fontSize:10.5,color:"var(--text3)",marginTop:4},children:U(a.created_at)})]})]},a.id)})})]})]})}function B(t){let n=String(t||"").replace("#","").trim();n.length===3&&(n=n.split("").map(o=>o+o).join(""));const r=parseInt(n,16);return isNaN(r)||n.length!==6?null:{r:r>>16&255,g:r>>8&255,b:r&255}}function q(t,n,r){const o=l=>Math.max(0,Math.min(255,Math.round(l))).toString(16).padStart(2,"0");return`#${o(t)}${o(n)}${o(r)}`}function K(t,n,r){t/=255,n/=255,r/=255;const o=Math.max(t,n,r),l=Math.min(t,n,r);let p=0,d=0;const g=(o+l)/2;if(o!==l){const h=o-l;switch(d=g>.5?h/(2-o-l):h/(o+l),o){case t:p=(n-r)/h+(n<r?6:0);break;case n:p=(r-t)/h+2;break;default:p=(t-n)/h+4}p*=60}return{h:p,s:d*100,l:g*100}}function Q(t,n,r){if(t/=360,n/=100,r/=100,n===0){const d=Math.round(r*255);return{r:d,g:d,b:d}}const o=r<.5?r*(1+n):r+n-r*n,l=2*r-o,p=d=>(d<0&&(d+=1),d>1&&(d-=1),d<1/6?l+(o-l)*6*d:d<1/2?o:d<2/3?l+(o-l)*(2/3-d)*6:l);return{r:Math.round(p(t+1/3)*255),g:Math.round(p(t)*255),b:Math.round(p(t-1/3)*255)}}function w(t,n){const r=B(t);if(!r)return null;const{h:o,s:l,l:p}=K(r.r,r.g,r.b),d=Math.max(4,Math.min(96,p+n)),g=Q(o,l,d);return q(g.r,g.g,g.b)}function M(t,n){const r=B(t);return r?`rgba(${r.r}, ${r.g}, ${r.b}, ${n})`:null}function X(t){if(!B(t))return{};const r=w(t,8),o=w(t,18);w(t,-8);const l=w(t,-16),p=w(t,-26);return{"--primary":t,"--primary-hover":r,"--primary-light":o,"--primary-bg":M(t,.1),"--accent":r,"--accent-light":o,"--gb-primary":t,"--gb-primary-d":r,"--gb-primary-g":M(t,.1),"--gb-primary-bg":M(t,.1),"--border":M(t,.25),"--gb-border":M(t,.28),"--border-light":M(t,.14),"--gb-primary-d2":l,"--gb-primary-d3":p}}function F(t){return{lighter:[w(t,8),w(t,18),w(t,30)],darker:[w(t,-8),w(t,-16),w(t,-26)]}}const k="#a855f7",Z=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],s={card:"var(--surface2)",cardBorder:"var(--border)",hair:"var(--border-light)",text:"var(--text)",text2:"var(--text2)",text3:"var(--text3)",danger:"var(--error)",dangerBg:"var(--error-bg)",dangerBorder:"var(--error-border)"};function R({icon:t,title:n,subtitle:r,chevron:o,onClick:l,right:p}){return e.jsxs("button",{onClick:l,style:{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"13px 14px",background:"none",border:"none",cursor:l?"pointer":"default",fontFamily:"inherit",textAlign:"left"},children:[e.jsx("span",{style:{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",color:k,flexShrink:0},children:t}),e.jsxs("span",{style:{flex:1,minWidth:0},children:[e.jsx("span",{style:{display:"block",fontSize:14,fontWeight:600,color:s.text},children:n}),r&&e.jsx("span",{style:{display:"block",fontSize:12,color:s.text2,marginTop:1},children:r})]}),p,o&&e.jsx("span",{style:{color:s.text3,fontSize:16},children:"›"})]})}function H({user:t,onLogout:n,isDark:r,toggleTheme:o,MiniCalendar:l,ChangePasswordForm:p}){const[d,g]=x.useState("main"),[h,y]=x.useState(!1),[i,f]=x.useState({games:0,players:0}),[a,u]=x.useState(()=>localStorage.getItem("consoleColor")||k),[b,z]=x.useState(()=>{try{return JSON.parse(localStorage.getItem("consoleSwatches")||"[]")}catch{return[]}});x.useEffect(()=>{d==="main"&&Promise.all([fetch("/api/games",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}).then(c=>c.json()).catch(()=>null),fetch("/api/players-admin",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}).then(c=>c.json()).catch(()=>null)]).then(([c,m])=>{var N,$;const j=((N=c==null?void 0:c.games)==null?void 0:N.length)||(c==null?void 0:c.length)||0,C=(($=m==null?void 0:m.players)==null?void 0:$.length)||(m==null?void 0:m.length)||0;f({games:j,players:C})})},[d]);const v=c=>{const m=X(c);let j=document.getElementById("custom-console-theme");j||(j=document.createElement("style"),j.id="custom-console-theme",document.head.appendChild(j));const C=Object.entries(m).map(([N,$])=>`  ${N}: ${$};`).join(`
`);j.textContent=`[data-theme='light'] {
${C}
}
[data-theme='dark'] {
${C}
}`},S=c=>{u(c),localStorage.setItem("consoleColor",c),v(c),z(m=>{const j=[c,...m.filter(C=>C.toLowerCase()!==c.toLowerCase())].slice(0,5);return localStorage.setItem("consoleSwatches",JSON.stringify(j)),j})},W=()=>{localStorage.removeItem("consoleColor"),localStorage.removeItem("consoleSwatches");const c=document.getElementById("custom-console-theme");c&&(c.textContent=""),u(k),z([])},E=((t==null?void 0:t.name)||"A").trim().charAt(0).toUpperCase(),T=new Date,G=F(a).lighter.concat([a]).concat(F(a).darker);return d==="calendar"?e.jsxs("div",{style:{padding:14},children:[e.jsx("button",{onClick:()=>g("main"),style:{background:"none",border:"none",cursor:"pointer",fontSize:14,color:s.text2,fontFamily:"inherit",marginBottom:10},children:"‹ back"}),e.jsx(l,{})]}):d==="password"?e.jsxs("div",{style:{padding:14},children:[e.jsx("button",{onClick:()=>g("main"),style:{background:"none",border:"none",cursor:"pointer",fontSize:14,color:s.text2,fontFamily:"inherit",marginBottom:10},children:"‹ back"}),e.jsx(p,{onClose:()=>g("main")})]}):e.jsxs("div",{style:{padding:14,display:"flex",flexDirection:"column",gap:14},children:[e.jsxs("div",{style:{background:s.card,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:`1px solid ${s.cardBorder}`,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:52,height:52,borderRadius:"50%",flexShrink:0,background:"rgba(168,85,247,0.12)",color:k,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800},children:E}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{style:{fontSize:15,fontWeight:600,color:s.text},children:(t==null?void 0:t.name)||"Admin"}),e.jsx("span",{style:{fontSize:11,fontWeight:700,color:k,background:"rgba(168,85,247,0.12)",padding:"2px 8px",borderRadius:20},children:(t==null?void 0:t.role)||"admin"})]}),e.jsx("div",{style:{fontSize:12.5,color:s.text2,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:(t==null?void 0:t.email)||""})]}),e.jsx("span",{style:{color:s.text3,fontSize:18},children:"›"})]}),e.jsx("div",{style:{background:s.card,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:`1px solid ${s.cardBorder}`,borderRadius:12,display:"flex"},children:[{n:i.games,l:"Games"},{n:i.players,l:"Players"},{n:`${Z[T.getMonth()]} ${T.getDate()}`,l:"Today"}].map((c,m)=>e.jsxs("div",{style:{flex:1,padding:"14px 8px",textAlign:"center",borderLeft:m===0?"none":`1px solid ${s.hair}`},children:[e.jsx("div",{style:{fontSize:20,fontWeight:700,color:s.text,lineHeight:1},children:c.n}),e.jsx("div",{style:{fontSize:11.5,color:s.text2,marginTop:4},children:c.l})]},c.l))}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:11.5,fontWeight:600,color:s.text2,textTransform:"uppercase",letterSpacing:".05em",padding:"0 4px 6px"},children:"Account"}),e.jsxs("div",{style:{background:s.card,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:`1px solid ${s.cardBorder}`,borderRadius:12,overflow:"hidden"},children:[e.jsx(R,{icon:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2"}),e.jsx("path",{d:"M16 2v4M8 2v4M3 10h18"})]}),title:"Calendar",subtitle:T.toDateString(),onClick:()=>g("calendar")}),e.jsx("div",{style:{height:1,background:s.hair}}),e.jsx(R,{icon:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2"}),e.jsx("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]}),title:"Change password",subtitle:"Update your credentials",chevron:!0,onClick:()=>g("password")})]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:11.5,fontWeight:600,color:s.text2,textTransform:"uppercase",letterSpacing:".05em",padding:"0 4px 6px"},children:"Appearance"}),e.jsxs("div",{style:{background:s.card,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:`1px solid ${s.cardBorder}`,borderRadius:12,overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,padding:"13px 14px"},children:[e.jsx("span",{style:{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",color:k,flexShrink:0},children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"4"}),e.jsx("path",{d:"M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"})]})}),e.jsx("span",{style:{flex:1,fontSize:14,fontWeight:600,color:s.text},children:"Theme"}),e.jsx("button",{onClick:o,"aria-label":"Toggle theme",style:{width:46,height:26,borderRadius:100,padding:3,cursor:"pointer",border:`1px solid ${s.hair}`,background:"rgba(0,0,0,0.06)",position:"relative",transition:"background .2s"},children:e.jsx("span",{style:{position:"absolute",top:2,left:r?"calc(100% - 22px)":2,width:20,height:20,borderRadius:"50%",background:k,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.25)"}})})]}),e.jsx("div",{style:{height:1,background:s.hair}}),e.jsxs("div",{onClick:()=>y(c=>!c),style:{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",cursor:"pointer"},children:[e.jsx("span",{style:{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",color:k,flexShrink:0},children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"13.5",cy:"6.5",r:"2.5"}),e.jsx("circle",{cx:"17.5",cy:"10.5",r:"2.5"}),e.jsx("circle",{cx:"8.5",cy:"7.5",r:"2.5"}),e.jsx("circle",{cx:"6.5",cy:"12.5",r:"2.5"}),e.jsx("path",{d:"M12 2a10 10 0 0 0 0 20"})]})}),e.jsx("span",{style:{flex:1,fontSize:14,fontWeight:600,color:s.text},children:"Console color"}),e.jsx("span",{style:{width:18,height:18,borderRadius:5,background:a,border:`1px solid ${s.hair}`}}),e.jsx("span",{style:{fontSize:12,fontFamily:"monospace",color:s.text2},children:a.toUpperCase()}),e.jsx("span",{style:{color:s.text3,fontSize:16},children:"›"})]}),h&&e.jsxs("div",{style:{padding:"0 14px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:10},children:[e.jsx("input",{type:"color",value:a,onChange:c=>S(c.target.value),style:{width:40,height:40,padding:0,border:`1px solid ${s.hair}`,borderRadius:8,background:"none",cursor:"pointer"}}),e.jsx("input",{value:a,onChange:c=>{const m=c.target.value;/^#([0-9a-fA-F]{6})$/.test(m)?(u(m),S(m)):u(m)},style:{flex:1,fontSize:13,padding:"9px 10px",borderRadius:8,border:`1px solid ${s.hair}`,background:"var(--bg-secondary)",color:s.text,outline:"none",fontFamily:"monospace"}})]}),e.jsx("div",{style:{display:"flex",gap:8,marginBottom:4},children:G.map((c,m)=>e.jsx("button",{onClick:()=>S(c),title:c,style:{flex:1,height:26,borderRadius:6,cursor:"pointer",background:c,border:`2px solid ${s.cardBorder}`,boxShadow:c.toLowerCase()===a.toLowerCase()?`0 0 0 2px ${s.text2}`:"none"}},m))})]}),e.jsxs("button",{onClick:W,style:{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"11px",background:"none",border:"none",borderTop:`1px solid ${s.hair}`,cursor:"pointer",fontSize:12.5,fontWeight:600,color:s.text2,fontFamily:"inherit"},children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M23 4v6h-6"}),e.jsx("path",{d:"M1 20v-6h6"}),e.jsx("path",{d:"M3.5 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.5 15"})]}),"Reset to default"]})]})]}),e.jsxs("button",{onClick:n,style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",marginTop:6,padding:"12px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,color:s.danger,background:s.dangerBg,border:`1px solid ${s.dangerBorder}`},children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}),e.jsx("path",{d:"M16 17l5-5-5-5M21 12H9"})]}),"Log out"]})]})}const ee=`
@keyframes nav-fade-down {
  from { opacity:0; transform:translateY(-8px) }
  to   { opacity:1; transform:none }
}
@keyframes nav-spin { to { transform:rotate(360deg) } }

.nav-root {
  background: var(--surface);
  border-bottom: 1.5px solid var(--border);
  height: 62px;
  padding: 0 28px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 1px 12px rgba(0,0,0,0.06);
  font-family: 'DM Sans', 'Inter', sans-serif;
}

/* ── left: logo ── */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0;
  text-decoration: none;
}
.nav-logo img {
  height: 38px;
  width: auto;
  display: block;
}

/* ── center: links ── */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 12px;
  padding: 4px;
}
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 0px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  text-decoration: none;
  transition: all .15s;
  white-space: nowrap;
  border: none;
}
.nav-link:hover {
  color: var(--text);
  background: transparent;
  border-color: none;
}
.nav-link.active {
  color: var(--primary);
  background: transparent;
  border-color: none;
  border-radius: 12px;
  box-shadow: 0 5px 26px rgba(88, 19, 140, 0.47);
}

/* ── right: greeting + avatar ── */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}
.nav-greeting {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.3;
}
.nav-greeting-msg {
  font-size: 11px;
  color: var(--primary);
  font-weight: 500;
}
.nav-greeting-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

/* ── avatar button ── */
.nav-avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
  flex-shrink: 0;
  font-family: inherit;
}
.nav-avatar-btn:hover {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
  transform: scale(1.05);
}

/* ── dropdown ── */
.nav-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 360px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  animation: nav-fade-down .18s ease;
  overflow: hidden;
  z-index: 300;
}

/* dropdown sections */
.nav-dd-header {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-dd-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  color: #fff; font-size: 18px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; border: 2px solid rgba(255,255,255,0.4);
}
.nav-dd-name  { font-size: 15px; font-weight: 700; color: #fff; }
.nav-dd-email { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 1px; }
.nav-dd-role  { display:inline-flex; align-items:center; padding:2px 8px; background:rgba(255,255,255,0.2); border-radius:20px; font-size:10px; font-weight:700; color:#fff; margin-top:4px; letter-spacing:.04em; text-transform:uppercase; }

.nav-dd-body  { padding: 12px; }
.nav-dd-sep   { height: 1px; background: var(--border-light); margin: 8px 0; }

.nav-dd-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  font-size: 13px; font-weight: 600; color: var(--text);
  transition: background .12s;
  border: none; background: none; width: 100%; text-align: left;
  font-family: inherit;
}
.nav-dd-item:hover { background: var(--surface2); color: var(--primary); }
.nav-dd-item.danger:hover { background: var(--error-bg); color: var(--error); }
.nav-dd-icon { font-size: 16px; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; background:var(--surface2); border-radius:8px; flex-shrink:0; }
.nav-dd-item.danger .nav-dd-icon { background: var(--error-bg); }

/* ── calendar panel ── */
.nav-cal {
  padding: 0 12px 12px;
}
.nav-cal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 4px 8px; font-size: 13px; font-weight: 700; color: var(--text);
}
.nav-cal-nav {
  background: none; border: 1px solid var(--border); border-radius: 6px;
  width: 26px; height: 26px; cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text2); transition: all .12s;
}
.nav-cal-nav:hover { background: var(--surface2); color: var(--primary); border-color: #c7d2fe; }
.nav-cal-grid {
  display: grid; grid-template-columns: repeat(7,1fr); gap: 2px;
}
.nav-cal-dow {
  text-align: center; font-size: 10px; font-weight: 700;
  color: var(--text3); padding: 4px 0; letter-spacing:.04em;
}
.nav-cal-day {
  text-align: center; font-size: 12px; font-weight: 500;
  padding: 5px 2px; border-radius: 6px; cursor: default;
  color: var(--text); line-height: 1;
}
.nav-cal-day.today {
  background: #6366f1; color: #fff; font-weight: 800;
  box-shadow: 0 2px 6px rgba(99,102,241,0.3);
}
.nav-cal-day.other-month { color: var(--text3); }
.nav-cal-day.weekend { color: #a855f7; }
.nav-cal-day.today.weekend { color: #fff; }

/* ── password form ── */
.nav-pw-form { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.nav-pw-input {
  width: 100%; padding: 9px 12px; border: 1.5px solid var(--border);
  border-radius: 8px; font-size: 13px; font-family: inherit;
  color: var(--text); background: var(--surface2); outline: none;
  transition: border-color .14s;
}
.nav-pw-input:focus { border-color: #6366f1; background: var(--surface); }
.nav-pw-btn {
  padding: 9px; border-radius: 8px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 700; font-family: inherit;
  background: #6366f1; color: #fff; transition: background .14s;
}
.nav-pw-btn:hover:not(:disabled) { background: #4f46e5; }
.nav-pw-btn:disabled { opacity:.5; cursor:not-allowed; }
.nav-pw-msg { font-size: 12px; font-weight: 600; padding: 6px 10px; border-radius: 7px; }
.nav-pw-msg.ok  { background: var(--success-bg); color: var(--success); }
.nav-pw-msg.err { background: var(--error-bg); color: var(--error); }

/* ── quick stat chips ── */
.nav-stats { display:flex; gap:6px; padding: 0 12px 12px; }
.nav-stat { flex:1; background:var(--surface2); border-radius:10px; padding:10px 8px; text-align:center; }
.nav-stat-val { font-size:16px; font-weight:800; color:#6366f1; }
.nav-stat-lbl { font-size:10px; color:var(--text3); font-weight:600; text-transform:uppercase; letter-spacing:.04em; margin-top:2px; }
`,te=["January","February","March","April","May","June","July","August","September","October","November","December"],re=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function L(){const t=new Date().getHours();return t<12?{msg:"Good morning",emoji:"☀️"}:t<17?{msg:"Good afternoon",emoji:"🌤️"}:t<21?{msg:"Good evening",emoji:"🌆"}:{msg:"Good night",emoji:"🌙"}}function ne(t=""){return t.trim().split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U"}function oe(){const t=new Date,[n,r]=x.useState({y:t.getFullYear(),m:t.getMonth()}),o=()=>r(i=>i.m===0?{y:i.y-1,m:11}:{y:i.y,m:i.m-1}),l=()=>r(i=>i.m===11?{y:i.y+1,m:0}:{y:i.y,m:i.m+1}),p=new Date(n.y,n.m,1).getDay(),d=new Date(n.y,n.m+1,0).getDate(),g=new Date(n.y,n.m,0).getDate(),h=[];for(let i=p-1;i>=0;i--)h.push({d:g-i,cur:!1});for(let i=1;i<=d;i++)h.push({d:i,cur:!0});const y=42-h.length;for(let i=1;i<=y;i++)h.push({d:i,cur:!1});return e.jsxs("div",{className:"nav-cal",children:[e.jsxs("div",{className:"nav-cal-header",children:[e.jsx("button",{className:"nav-cal-nav",onClick:o,children:"‹"}),e.jsxs("span",{children:[te[n.m]," ",n.y]}),e.jsx("button",{className:"nav-cal-nav",onClick:l,children:"›"})]}),e.jsxs("div",{className:"nav-cal-grid",children:[re.map(i=>e.jsx("div",{className:"nav-cal-dow",children:i},i)),h.map((i,f)=>{const a=i.cur&&i.d===t.getDate()&&n.m===t.getMonth()&&n.y===t.getFullYear(),u=f%7,b=u===0||u===6;return e.jsx("div",{className:`nav-cal-day${a?" today":""}${i.cur?"":" other-month"}${b&&!a?" weekend":""}`,children:i.d},f)})]})]})}function ae({onClose:t}){const[n,r]=x.useState(""),[o,l]=x.useState(""),[p,d]=x.useState(""),[g,h]=x.useState(null),[y,i]=x.useState(!1),[f,a]=x.useState(!1),[u,b]=x.useState(!1),z=async()=>{var v,S;if(!n||!o||!p){h({text:"All fields required",ok:!1});return}if(o!==p){h({text:"New passwords do not match",ok:!1});return}if(o.length<6){h({text:"Password must be at least 6 characters",ok:!1});return}i(!0),h(null);try{await I.post("/auth/change-password",{oldPassword:n,newPassword:o}),h({text:"Password changed successfully ✅",ok:!0}),r(""),l(""),d(""),setTimeout(t,1800)}catch(W){h({text:((S=(v=W.response)==null?void 0:v.data)==null?void 0:S.message)||"Failed to change password",ok:!1})}i(!1)};return e.jsxs("div",{className:"nav-pw-form",children:[e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{className:"nav-pw-input",type:f?"text":"password",placeholder:"Current password",value:n,onChange:v=>r(v.target.value)}),e.jsx("span",{onClick:()=>a(v=>!v),style:{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:14,color:"var(--text3)"},children:f?"🙈":"👁"})]}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{className:"nav-pw-input",type:u?"text":"password",placeholder:"New password (min 6 chars)",value:o,onChange:v=>l(v.target.value)}),e.jsx("span",{onClick:()=>b(v=>!v),style:{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:14,color:"var(--text3)"},children:u?"🙈":"👁"})]}),e.jsx("input",{className:"nav-pw-input",type:"password",placeholder:"Confirm new password",value:p,onChange:v=>d(v.target.value),onKeyDown:v=>v.key==="Enter"&&z()}),g&&e.jsx("div",{className:`nav-pw-msg ${g.ok?"ok":"err"}`,children:g.text}),e.jsxs("div",{style:{display:"flex",gap:6},children:[e.jsx("button",{className:"nav-pw-btn",onClick:z,disabled:y,style:{flex:1},children:y?"Saving…":"🔐 Update Password"}),e.jsx("button",{className:"nav-pw-btn",onClick:t,style:{background:"var(--surface2)",color:"var(--text2)",flex:"0 0 auto",padding:"9px 14px"},children:"Cancel"})]})]})}function ie({user:t,onLogout:n}){const[r,o]=x.useState(!1),l=x.useRef(),{isDark:p,toggleTheme:d}=P();return x.useEffect(()=>{const g=h=>{l.current&&!l.current.contains(h.target)&&o(!1)};return document.addEventListener("mousedown",g),()=>document.removeEventListener("mousedown",g)},[]),e.jsxs("div",{ref:l,style:{position:"relative"},children:[e.jsx("button",{className:"nav-avatar-btn",onClick:()=>o(g=>!g),title:"Account menu",children:ne(t==null?void 0:t.name)}),r&&e.jsx("div",{className:"nav-dropdown",style:{width:400,background:"var(--surface)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid var(--border)"},children:e.jsx(H,{user:t,onLogout:n,isDark:p,toggleTheme:d,MiniCalendar:oe,ChangePasswordForm:ae})})]})}function de(){var i;const{user:t,logout:n}=_(),{isDark:r}=P(),o=O(),l=J(),[p,d]=x.useState(L());x.useEffect(()=>{const f=setInterval(()=>d(L()),6e4);return()=>clearInterval(f)},[]);const g=()=>{n(),o("/login")},h=[{to:"/dashboard",label:"Dashboard",icon:"🏠",exact:!0},{to:"/dashboard/clients",label:"Clients",icon:"🏢"},{to:"/dashboard/games",label:"Games",icon:"🎮"},{to:"/dashboard/thumbnails",label:"Thumbnail",icon:"🖼️"},{to:"/dashboard/crm",label:"Team",icon:"👥"},{to:"/dashboard/players",label:"Players",icon:"🎯"},{to:"/dashboard/status",label:"Status",icon:"📊"},{to:"/dashboard/bo-logs",label:"BO Logs",icon:"🧾"}],y=f=>f.exact?l.pathname===f.to:l.pathname.startsWith(f.to);return e.jsxs("div",{style:{minHeight:"100vh",background:"var(--bg)",transition:"var(--transition)"},children:[e.jsx("style",{children:ee}),e.jsxs("nav",{className:"nav-root",children:[e.jsx("div",{children:e.jsx(D,{to:"/dashboard",className:"nav-logo",children:e.jsx("img",{src:r?"/favicon2.png":"/favicon3.png",alt:"PromoGames"})})}),e.jsx("div",{className:"nav-links",children:h.map(f=>e.jsxs(D,{to:f.to,className:`nav-link${y(f)?" active":""}`,children:[e.jsx("span",{children:f.icon}),f.label]},f.to))}),e.jsxs("div",{className:"nav-right",children:[e.jsxs("div",{className:"nav-greeting",children:[e.jsxs("span",{className:"nav-greeting-msg",children:[p.emoji," ",p.msg]}),e.jsxs("span",{className:"nav-greeting-name",children:[((i=t==null?void 0:t.name)==null?void 0:i.split(" ")[0])||"there","!"]})]}),e.jsx(ie,{user:t,onLogout:g}),e.jsx(V,{})]})]}),e.jsx(Y,{})]})}export{de as default};
