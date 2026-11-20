import{r as s,j as e}from"./react-vendor-gyK15t0p.js";import{c as y,G as z,a as S}from"./index-B2qSlCu9.js";import{T as N}from"./triangle-alert-DDHbvRkh.js";import{S as C}from"./search-DxPuKftL.js";import{R as M}from"./refresh-cw-CsIk0_6a.js";import{G}from"./grid-3x3-1fl2ymS2.js";import{G as R}from"./gamepad-2-CqrDM6Qy.js";import{M as L}from"./map-pin-BRd7DZa3.js";/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],u=y("external-link",$);/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"M3 5h.01",key:"18ugdj"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 19h.01",key:"noohij"}],["path",{d:"M8 5h13",key:"1pao27"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 19h13",key:"m83p4d"}]],W=y("list",I),F=`
@keyframes gFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes gSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

.g-stat {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  padding:20px 24px; display:flex; align-items:center; gap:16px;
  transition:all 0.3s cubic-bezier(.4,0,.2,1);
  animation:gFadeIn .4s cubic-bezier(.4,0,.2,1) both;
}
.g-stat:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(143,44,255,0.08); }
.g-stat-icon {
  width:48px; height:48px; border-radius:14px;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.g-stat-value { font-size:28px; font-weight:800; letter-spacing:-1px; line-height:1; }
.g-stat-label { font-size:12px; font-weight:600; color:#94a3b8; margin-top:2px; }

.g-search-wrap {
  background:#fff; border:1px solid #ece8ff; border-radius:16px;
  padding:8px; display:flex; align-items:center; gap:8px;
  box-shadow:0 2px 8px rgba(0,0,0,0.02);
}
.g-search-input {
  flex:1; border:none; outline:none; font-size:14px; font-weight:500;
  color:#1e1b4b; font-family:inherit; background:transparent;
  padding:10px 12px; min-width:0;
}
.g-search-input::placeholder { color:#94a3b8; }
.g-filter-btn {
  display:flex; align-items:center; gap:6px; padding:10px 14px;
  border-radius:12px; border:1px solid #ece8ff; background:#fff;
  font-size:13px; font-weight:600; color:#64748b; cursor:pointer;
  font-family:inherit; transition:all 0.2s; white-space:nowrap;
}
.g-filter-btn:hover { border-color:#c4b5fd; color:#7c3aed; }
.g-icon-btn {
  width:40px; height:40px; border-radius:12px; border:1px solid #ece8ff;
  background:#fff; display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:#64748b; transition:all 0.2s; flex-shrink:0;
}
.g-icon-btn:hover { border-color:#c4b5fd; color:#7c3aed; background:#f8f7ff; }
.g-icon-btn.active { background:#7c3aed; color:#fff; border-color:#7c3aed; }

.g-card {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  overflow:hidden; transition:all 0.3s cubic-bezier(.4,0,.2,1);
  animation:gFadeIn .4s cubic-bezier(.4,0,.2,1) both;
}
.g-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(143,44,255,0.1); }
.g-card-img {
  width:100%; height:160px; object-fit:cover;
  background:linear-gradient(135deg,#f5f3ff,#ede9fe);
}
.g-card-body { padding:20px; }
.g-card-name { font-size:16px; font-weight:700; color:#1e1b4b; margin-bottom:4px; line-height:1.3; }
.g-card-meta { display:flex; align-items:center; gap:6px; font-size:12px; color:#94a3b8; margin-top:4px; }
.g-card-badges { display:flex; gap:6px; margin-top:12px; flex-wrap:wrap; }
.g-badge {
  display:inline-flex; align-items:center; gap:4px; padding:4px 10px;
  border-radius:100px; font-size:11px; font-weight:700;
}
.g-card-footer {
  padding:14px 20px; border-top:1px solid #f3f0ff;
  display:flex; align-items:center; justify-content:space-between;
}
.g-card-link {
  display:inline-flex; align-items:center; gap:4px; padding:6px 14px;
  border-radius:8px; border:1px solid #ece8ff; background:#fff;
  font-size:12px; font-weight:600; color:#7c3aed; cursor:pointer;
  font-family:inherit; transition:all 0.2s; text-decoration:none;
}
.g-card-link:hover { background:#f5f3ff; border-color:#c4b5fd; }

.g-list-row {
  display:grid; grid-template-columns:2.5fr 1.5fr 1fr 1fr 1fr;
  align-items:center; padding:14px 24px; border-bottom:1px solid #f8f7ff;
  transition:background 0.15s; gap:12px;
}
.g-list-row:last-child { border-bottom:none; }
.g-list-row:hover { background:#faf9ff; }
.g-list-head {
  font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;
  letter-spacing:0.5px; padding:12px 24px; border-bottom:1px solid #ece8ff;
  background:#faf9ff;
  display:grid; grid-template-columns:2.5fr 1.5fr 1fr 1fr 1fr;
  gap:12px;
}

@media(max-width:768px) {
  .g-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
  .g-grid { grid-template-columns:1fr !important; }
}
@media(max-width:480px) { .g-stats-grid { grid-template-columns:1fr !important; } }
`,r=["#7c3aed","#2563eb","#059669","#f59e0b","#ef4444","#8b5cf6","#0ea5e9","#ec4899"];function D(){const[i,j]=s.useState([]),[v,k]=s.useState(!0),[g,p]=s.useState(""),[l,w]=s.useState(""),[n,_]=s.useState("all"),[d,x]=s.useState("grid"),c=async()=>{try{const{data:t}=await S.get("/business/games");j(t.games||[]),p("")}catch{p("Failed to load games.")}finally{k(!1)}};s.useEffect(()=>{c()},[]),s.useMemo(()=>({total:i.length,live:i.filter(t=>t.game_status==="live").length,development:i.filter(t=>t.game_status==="development").length,templates:i.filter(t=>t.is_template).length}),[i]);const f=s.useMemo(()=>{let t=[...i];const a=l.toLowerCase().trim();return a&&(t=t.filter(o=>{var h,b;return((h=o.game_name)==null?void 0:h.toLowerCase().includes(a))||((b=o.location_name)==null?void 0:b.toLowerCase().includes(a))})),n!=="all"&&(t=t.filter(o=>o.game_status===n)),t},[i,l,n]),m=t=>{if(!t)return"?";const a=t.trim().split(/\s+/);return a.length>=2?(a[0][0]+a[1][0]).toUpperCase():a[0].substring(0,2).toUpperCase()};return v?e.jsxs("div",{style:{textAlign:"center",padding:80},children:[e.jsx("div",{style:{width:40,height:40,border:"3px solid #ece8ff",borderTopColor:"#7c3aed",borderRadius:"50%",animation:"gSpin 1s linear infinite",margin:"0 auto 16px"}}),e.jsx("div",{style:{color:"#94a3b8",fontSize:14,fontWeight:500},children:"Loading games..."})]}):e.jsxs("div",{style:{fontFamily:"Inter, sans-serif",color:"#1e1b4b"},children:[e.jsx("style",{children:F}),e.jsxs("div",{style:{marginBottom:28},children:[e.jsx("h1",{style:{fontSize:28,fontWeight:800,margin:0,letterSpacing:"-0.5px"},children:"My Games"}),e.jsx("p",{style:{color:"#94a3b8",fontSize:14,margin:"6px 0 0",fontWeight:500},children:"All games linked to your brand and branches."})]}),g&&e.jsxs("div",{style:{padding:"14px 18px",borderRadius:14,marginBottom:20,background:"#fef2f2",border:"1px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("span",{style:{fontSize:13,color:"#ef4444",fontWeight:600,display:"flex",alignItems:"center",gap:6},children:[e.jsx(N,{size:15})," ",g]}),e.jsx("button",{onClick:c,style:{padding:"7px 18px",borderRadius:8,border:"none",background:"#ef4444",color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"},children:"Retry"})]}),e.jsxs("div",{className:"g-search-wrap",style:{marginBottom:24},children:[e.jsx(C,{size:18,style:{color:"#94a3b8",marginLeft:8,flexShrink:0}}),e.jsx("input",{className:"g-search-input",value:l,onChange:t=>w(t.target.value),placeholder:"Search games by name or location..."}),e.jsxs("div",{style:{display:"flex",gap:8,flexShrink:0},children:[e.jsxs("select",{className:"g-filter-btn",value:n,onChange:t=>_(t.target.value),children:[e.jsx("option",{value:"all",children:"All Status"}),e.jsx("option",{value:"live",children:"Live"}),e.jsx("option",{value:"development",children:"Development"}),e.jsx("option",{value:"testing",children:"Testing"})]}),e.jsx("button",{className:"g-icon-btn",onClick:c,title:"Refresh",children:e.jsx(M,{size:16})}),e.jsx("button",{className:`g-icon-btn ${d==="grid"?"active":""}`,onClick:()=>x("grid"),title:"Grid view",children:e.jsx(G,{size:16})}),e.jsx("button",{className:`g-icon-btn ${d==="list"?"active":""}`,onClick:()=>x("list"),title:"List view",children:e.jsx(W,{size:16})})]})]}),f.length===0?e.jsxs("div",{style:{textAlign:"center",padding:"64px 20px",background:"#fff",borderRadius:20,border:"1px solid #ece8ff"},children:[e.jsx(R,{size:48,style:{marginBottom:12,opacity:.2,color:"#c4b5fd"}}),e.jsx("div",{style:{color:"#94a3b8",fontSize:14,fontWeight:500},children:i.length===0?"No games linked to your account yet.":"No games match your search."})]}):d==="grid"?e.jsx("div",{className:"g-grid",style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20},children:f.map((t,a)=>e.jsxs("div",{className:"g-card",style:{animationDelay:`${a*.04}s`},children:[e.jsxs("div",{style:{position:"relative"},children:[t.game_logo_url?e.jsx("img",{src:t.game_logo_url,alt:"",className:"g-card-img",style:{objectFit:"contain",padding:16}}):e.jsx("div",{className:"g-card-img",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("div",{style:{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#7c3aed30,#7c3aed10)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:28,fontWeight:800,color:"#7c3aed"},children:m(t.game_name)})})}),e.jsx("div",{style:{position:"absolute",top:12,right:12,display:"flex",gap:6},children:e.jsxs("span",{className:"g-badge",style:{background:t.game_status==="live"?"#dcfce7":t.game_status==="testing"?"#fef3c7":"#f1f5f9",color:t.game_status==="live"?"#16a34a":t.game_status==="testing"?"#d97706":"#64748b"},children:[t.game_status==="live"&&e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:"currentColor"}}),t.game_status]})})]}),e.jsxs("div",{className:"g-card-body",children:[e.jsx("div",{className:"g-card-name",children:t.game_name}),t.location_name&&e.jsxs("div",{className:"g-card-meta",children:[e.jsx(L,{size:12})," ",t.location_name]}),t.reward_text&&e.jsxs("div",{className:"g-card-meta",style:{color:"#059669"},children:[e.jsx(z,{size:12})," ",t.reward_text]}),e.jsxs("div",{className:"g-card-badges",children:[t.is_template&&e.jsx("span",{className:"g-badge",style:{background:"#f5f3ff",color:"#7c3aed"},children:"Template"}),t.location_name&&e.jsx("span",{className:"g-badge",style:{background:"#eff6ff",color:"#2563eb"},children:"Branch Game"})]})]}),e.jsxs("div",{className:"g-card-footer",children:[e.jsx("span",{style:{fontSize:12,color:"#94a3b8",fontWeight:500},children:t.slug?`/play/${t.slug}`:"—"}),t.slug&&e.jsxs("a",{href:`/play/${t.slug}/${t.game_slug||"play"}`,target:"_blank",rel:"noopener noreferrer",className:"g-card-link",children:[e.jsx(u,{size:12})," Play"]})]})]},t.id||`template-${a}`))}):e.jsxs("div",{style:{background:"#fff",border:"1px solid #ece8ff",borderRadius:20,overflow:"hidden"},children:[e.jsxs("div",{className:"g-list-head",children:[e.jsx("span",{children:"Game"}),e.jsx("span",{children:"Location"}),e.jsx("span",{children:"Status"}),e.jsx("span",{children:"Type"}),e.jsx("span",{children:"Action"})]}),f.map((t,a)=>e.jsxs("div",{className:"g-list-row",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:40,height:40,borderRadius:12,flexShrink:0,background:t.game_logo_url?"transparent":`linear-gradient(135deg,${r[a%r.length]}20,${r[a%r.length]}08)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"},children:t.game_logo_url?e.jsx("img",{src:t.game_logo_url,alt:"",style:{width:40,height:40,objectFit:"contain"}}):e.jsx("span",{style:{fontSize:14,fontWeight:700,color:r[a%r.length]},children:m(t.game_name)})}),e.jsx("div",{style:{fontWeight:600,fontSize:13},children:t.game_name})]}),e.jsx("div",{style:{fontSize:13,color:"#64748b",fontWeight:500},children:t.location_name||e.jsx("span",{style:{color:"#cbd5e1"},children:"—"})}),e.jsx("div",{children:e.jsx("span",{className:"g-badge",style:{background:t.game_status==="live"?"#dcfce7":t.game_status==="testing"?"#fef3c7":"#f1f5f9",color:t.game_status==="live"?"#16a34a":t.game_status==="testing"?"#d97706":"#64748b"},children:t.game_status})}),e.jsx("div",{children:t.is_template?e.jsx("span",{className:"g-badge",style:{background:"#f5f3ff",color:"#7c3aed"},children:"Template"}):e.jsx("span",{className:"g-badge",style:{background:"#eff6ff",color:"#2563eb"},children:"Branch"})}),e.jsx("div",{children:t.slug&&e.jsxs("a",{href:`/play/${t.slug}/${t.game_slug||"play"}`,target:"_blank",rel:"noopener noreferrer",className:"g-card-link",children:[e.jsx(u,{size:12})," Play"]})})]},t.id||`template-${a}`))]})]})}export{D as default};
