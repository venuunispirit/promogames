import{r as i,j as t}from"./react-vendor-gyK15t0p.js";import{c as k,a as ie}from"./index-B2qSlCu9.js";import{c as ne,F as le,s as de}from"./boUtils-Hkv0EKOH.js";import{G as ce}from"./gamepad-2-CqrDM6Qy.js";import{C as pe}from"./clock-j2DYaM2k.js";import{C as fe,U as he}from"./users-j0K5T9Ez.js";import{T as ge}from"./triangle-alert-DDHbvRkh.js";import{S as be}from"./search-DxPuKftL.js";import{R as me}from"./refresh-cw-CsIk0_6a.js";import{C as xe}from"./clipboard-list-BZr4GJLj.js";/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]],ye=k("arrow-down-right",ue);/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]],je=k("arrow-up-right",ve);/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],ke=k("file-spreadsheet",we),Se=`
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes boCardIn { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:none} }
@keyframes boSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes boPulse { 0%,100%{box-shadow:0 0 0 0 rgba(143,44,255,0.3)} 50%{box-shadow:0 0 0 8px rgba(143,44,255,0)} }

/* Stat card */
.dash-stat {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  padding:24px; transition:all 0.3s cubic-bezier(.4,0,.2,1);
  animation:boCardIn .4s cubic-bezier(.4,0,.2,1) both;
  position:relative; overflow:hidden;
}
.dash-stat:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(143,44,255,0.1); }
.dash-stat:nth-child(1){animation-delay:0s}
.dash-stat:nth-child(2){animation-delay:.05s}
.dash-stat:nth-child(3){animation-delay:.1s}
.dash-stat:nth-child(4){animation-delay:.15s}
.dash-stat-icon {
  width:48px; height:48px; border-radius:14px;
  display:flex; align-items:center; justify-content:center; margin-bottom:16px;
}
.dash-stat-value { font-size:36px; font-weight:800; letter-spacing:-1.5px; line-height:1; }
.dash-stat-label { font-size:13px; font-weight:600; color:#94a3b8; margin-top:4px; }
.dash-stat-trend { font-size:12px; font-weight:600; margin-top:8px; display:flex; align-items:center; gap:4px; }

/* Search toolbar */
.dash-search-wrap {
  background:#fff; border:1px solid #ece8ff; border-radius:16px;
  padding:8px; display:flex; align-items:center; gap:8px;
  box-shadow:0 2px 8px rgba(0,0,0,0.02);
}
.dash-search-input {
  flex:1; border:none; outline:none; font-size:14px; font-weight:500;
  color:#1e1b4b; font-family:inherit; background:transparent;
  padding:10px 12px; min-width:0;
}
.dash-search-input::placeholder { color:#94a3b8; }
.dash-filter-btn {
  display:flex; align-items:center; gap:6px; padding:10px 14px;
  border-radius:12px; border:1px solid #ece8ff; background:#fff;
  font-size:13px; font-weight:600; color:#64748b; cursor:pointer;
  font-family:inherit; transition:all 0.2s; white-space:nowrap;
}
.dash-filter-btn:hover { border-color:#c4b5fd; color:#7c3aed; }
.dash-icon-btn {
  width:40px; height:40px; border-radius:12px; border:1px solid #ece8ff;
  background:#fff; display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:#64748b; transition:all 0.2s; flex-shrink:0;
}
.dash-icon-btn:hover { border-color:#c4b5fd; color:#7c3aed; background:#f8f7ff; }

/* Table card */
.dash-table-card {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  overflow:hidden; animation:boCardIn .5s cubic-bezier(.4,0,.2,1) both;
}
.dash-table-header {
  padding:20px 24px; border-bottom:1px solid #f3f0ff;
  display:flex; align-items:center; justify-content:space-between;
}
.dash-table-title { font-size:16px; font-weight:700; color:#1e1b4b; }
.dash-table-row {
  display:grid; grid-template-columns:2.5fr 2fr 1.2fr 1.5fr;
  align-items:center; padding:14px 24px; border-bottom:1px solid #f8f7ff;
  transition:background 0.15s; gap:12px;
}
.dash-table-row:last-child { border-bottom:none; }
.dash-table-row:hover { background:#faf9ff; }
.dash-table-head {
  font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;
  letter-spacing:0.5px; padding:12px 24px; border-bottom:1px solid #ece8ff;
  background:#faf9ff;
  display:grid; grid-template-columns:2.5fr 2fr 1.2fr 1.5fr;
  gap:12px;
}
.dash-avatar {
  width:36px; height:36px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; color:#fff;
}
.dash-status-badge {
  display:inline-flex; align-items:center; gap:4px; padding:4px 12px;
  border-radius:100px; font-size:11px; font-weight:700; white-space:nowrap;
}
.dash-view-btn {
  display:inline-flex; align-items:center; gap:4px; padding:6px 14px;
  border-radius:8px; border:1px solid #ece8ff; background:#fff;
  font-size:12px; font-weight:600; color:#7c3aed; cursor:pointer;
  font-family:inherit; transition:all 0.2s;
}
.dash-view-btn:hover { background:#f5f3ff; border-color:#c4b5fd; }

/* Activity feed */
.dash-activity {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  padding:24px; animation:boCardIn .5s cubic-bezier(.4,0,.2,1) .1s both;
}
.dash-activity-item {
  display:flex; gap:12px; padding:12px 0;
  border-bottom:1px solid #f8f7ff;
}
.dash-activity-item:last-child { border-bottom:none; }
.dash-activity-dot {
  width:10px; height:10px; border-radius:50%; margin-top:5px; flex-shrink:0;
}
.dash-activity-text { font-size:13px; color:#475569; line-height:1.5; }
.dash-activity-text strong { color:#1e1b4b; font-weight:600; }
.dash-activity-time { font-size:11px; color:#94a3b8; margin-top:2px; }

/* Chart card */
.dash-chart-card {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  padding:24px; animation:boCardIn .5s cubic-bezier(.4,0,.2,1) .2s both;
}
.dash-chart-title { font-size:16px; font-weight:700; color:#1e1b4b; margin-bottom:20px; }

/* Completion ring */
.dash-ring-wrap { display:flex; align-items:center; justify-content:center; padding:20px 0; }
.dash-ring { position:relative; width:160px; height:160px; }
.dash-ring svg { transform:rotate(-90deg); }
.dash-ring-label {
  position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
}
.dash-ring-value { font-size:36px; font-weight:800; color:#1e1b4b; letter-spacing:-1px; }
.dash-ring-text { font-size:12px; color:#94a3b8; font-weight:600; }

/* Progress bar */
.dash-progress-item { margin-bottom:16px; }
.dash-progress-item:last-child { margin-bottom:0; }
.dash-progress-top { display:flex; justify-content:space-between; margin-bottom:6px; }
.dash-progress-name { font-size:13px; font-weight:600; color:#1e1b4b; }
.dash-progress-val { font-size:13px; font-weight:700; color:#7c3aed; }
.dash-progress-bar { height:8px; border-radius:100px; background:#f0eef5; overflow:hidden; }
.dash-progress-fill { height:100%; border-radius:100px; transition:width 1s cubic-bezier(.4,0,.2,1); }

/* Toast */
.bo-toast {
  position:fixed; top:24px; right:24px; z-index:9999;
  background:#ffffff; border:1px solid #ece8ff;
  border-radius:16px; padding:18px 22px; max-width:360px;
  box-shadow:0 12px 40px rgba(143,44,255,0.12);
  animation:fadeIn .25s cubic-bezier(.4,0,.2,1);
}
.bo-toast.success{border-left:4px solid #10b981}
.bo-toast.error{border-left:4px solid #ef4444}

@media(max-width:1200px){
  .dash-main-grid{grid-template-columns:1fr !important}
  .dash-bottom-grid{grid-template-columns:1fr !important}
}
@media(max-width:768px){
  .dash-stats-grid{grid-template-columns:repeat(2,1fr) !important}
  .dash-table-row,.dash-table-head{grid-template-columns:1fr;gap:8px}
}
@media(max-width:480px){.dash-stats-grid{grid-template-columns:1fr !important}}
`,B=["#7c3aed","#2563eb","#059669","#f59e0b","#ef4444","#8b5cf6","#0ea5e9"];function Te(){const[r,E]=i.useState([]),[O,U]=i.useState(!0),[S,z]=i.useState(""),[_,W]=i.useState(""),[y,G]=i.useState("all"),[v,$]=i.useState("all"),[p,Y]=i.useState("all");i.useRef(null);const b=i.useCallback(async()=>{try{const{data:e}=await ie.get("/business/notifications");E(e.notifications||[]),z("")}catch{z("Failed to load data.")}finally{U(!1)}},[]);i.useEffect(()=>{b();const e=setInterval(b,1e4);return()=>clearInterval(e)},[]);const C=e=>String(e).padStart(2,"0"),f=e=>`${e.getFullYear()}-${C(e.getMonth()+1)}-${C(e.getDate())}`,H=e=>e.created_at?f(new Date(e.created_at)):"",l=new Date,d=f(l),N=new Date(l);N.setDate(l.getDate()-1);const D=f(N),L=new Date(l);L.setDate(l.getDate()-6);const q=f(L),K=f(new Date(l.getFullYear(),l.getMonth(),1)),V=e=>["pending","code_revealed","code_entered"].includes(e.status),J=e=>["completed","player_confirmed"].includes(e.status),F=e=>e.filter(V).length,R=e=>e.filter(J).length,A=e=>new Set(e.map(a=>a.session_id??a.player_name)).size,h=(e,a,o)=>e.filter(g=>{const n=H(g);return n>=a&&n<=o}),c=p==="all"?r:p==="today"?h(r,d,d):p==="yesterday"?h(r,D,D):p==="week"?h(r,q,d):h(r,K,d),m=h(r,d,d),x={total:r.length,pending:F(r),completed:R(r),participants:A(r)},I=[...new Set(r.map(e=>e.game_name).filter(Boolean))],j=(()=>{let e=[...c];const a=_.toLowerCase().trim();return a&&(e=e.filter(o=>{var g,n;return((g=o.player_name)==null?void 0:g.toLowerCase().includes(a))||((n=o.player_email)==null?void 0:n.toLowerCase().includes(a))})),y!=="all"&&(e=e.filter(o=>o.game_name===y)),v!=="all"&&(e=e.filter(o=>o.status===v)),e})(),T=r.slice(0,8).map(e=>{const a={pending:"#f59e0b",code_revealed:"#3b82f6",code_entered:"#8b5cf6",completed:"#10b981",player_confirmed:"#10b981",rejected:"#ef4444"};return{text:t.jsxs(t.Fragment,{children:[t.jsx("strong",{children:e.player_name})," ",ne(e.status)?"started":"completed"," ",t.jsx("strong",{children:e.game_name})]}),time:e.created_at?new Date(e.created_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}):"",color:a[e.status]||"#94a3b8"}}),Q=I.slice(0,5).map(e=>({name:e,count:r.filter(a=>a.game_name===e).length})).sort((e,a)=>a.count-e.count);Math.max(...Q.map(e=>e.count),1);const X=[{label:"Total Plays",value:x.total,trend:m.length,trendLabel:"from today",up:!0,color:"#7c3aed",bg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",icon:ce},{label:"Pending Action",value:x.pending,trend:F(m),trendLabel:"from today",up:!0,color:"#f59e0b",bg:"linear-gradient(135deg,#fffbeb,#fef3c7)",icon:pe},{label:"Completed",value:x.completed,trend:R(m),trendLabel:"from today",up:!0,color:"#10b981",bg:"linear-gradient(135deg,#ecfdf5,#d1fae5)",icon:fe},{label:"Total Participants",value:x.participants,trend:A(m),trendLabel:"from today",up:!0,color:"#7c3aed",bg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",icon:he}],Z=e=>e?new Date(e).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}):"",ee=()=>{const e=c;if(!e.length)return;const a=[];e.forEach(s=>Object.keys(s.player_data||{}).forEach(u=>{a.includes(u)||a.push(u)}));const o=s=>`"${(s??"").toString().replace(/"/g,'""')}"`,n=[["Player Name","Player Phone","Game","Status","Location Name","Table #","Has Code","Played At",...a].map(o).join(",")];e.forEach(s=>{const u=[s.player_name,s.player_phone,s.game_name,de(s.status),s.location_name,s.table_number,s.has_code?"Yes":"No",s.created_at?new Date(s.created_at).toLocaleString():"",...a.map(re=>{var P;return((P=s.player_data)==null?void 0:P[re])??""})];n.push(u.map(o).join(","))});const oe="\uFEFF",se=new Blob([oe+n.join(`
`)],{type:"text/csv;charset=utf-8;"}),M=URL.createObjectURL(se),w=document.createElement("a");w.href=M,w.download=`BO_Plays_${new Date().toISOString().split("T")[0]}.csv`,w.click(),URL.revokeObjectURL(M)},te=e=>{if(!e)return"?";const a=e.trim().split(/\s+/);return a.length>=2?(a[0][0]+a[1][0]).toUpperCase():a[0].substring(0,2).toUpperCase()},ae=e=>({pending:{bg:"#fffbeb",color:"#d97706",label:"Pending"},code_revealed:{bg:"#eff6ff",color:"#2563eb",label:"Ready"},code_entered:{bg:"#f5f3ff",color:"#7c3aed",label:"Ready"},completed:{bg:"#ecfdf5",color:"#059669",label:"Completed"},player_confirmed:{bg:"#ecfdf5",color:"#059669",label:"Completed"},rejected:{bg:"#fef2f2",color:"#dc2626",label:"Failed"}})[e]||{bg:"#f8fafc",color:"#64748b",label:e};return O?t.jsxs("div",{style:{textAlign:"center",padding:80},children:[t.jsx("div",{style:{width:40,height:40,border:"3px solid #ece8ff",borderTopColor:"#7c3aed",borderRadius:"50%",animation:"boSpin 1s linear infinite",margin:"0 auto 16px"}}),t.jsx("div",{style:{color:"#94a3b8",fontSize:14,fontWeight:500},children:"Loading dashboard..."})]}):t.jsxs("div",{style:{fontFamily:"Inter, sans-serif",color:"#1e1b4b"},children:[t.jsx("style",{children:Se}),t.jsxs("div",{style:{marginBottom:32},children:[t.jsx("h1",{style:{fontSize:28,fontWeight:800,margin:0,letterSpacing:"-0.5px"},children:"Dashboard"}),t.jsx("p",{style:{color:"#94a3b8",fontSize:14,margin:"6px 0 0",fontWeight:500},children:"Monitor your games, participants and redemptions from one place."})]}),S&&t.jsxs("div",{style:{padding:"14px 18px",borderRadius:14,marginBottom:20,background:"#fef2f2",border:"1px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[t.jsxs("span",{style:{fontSize:13,color:"#ef4444",fontWeight:600,display:"flex",alignItems:"center",gap:6},children:[t.jsx(ge,{size:15})," ",S]}),t.jsx("button",{onClick:b,style:{padding:"7px 18px",borderRadius:8,border:"none",background:"#ef4444",color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"},children:"Retry"})]}),t.jsx("div",{className:"dash-stats-grid",style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28},children:X.map(e=>t.jsxs("div",{className:"dash-stat",style:{background:e.bg},children:[t.jsx("div",{className:"dash-stat-icon",style:{background:e.color+"15"},children:t.jsx(e.icon,{size:22,style:{color:e.color}})}),t.jsx("div",{className:"dash-stat-label",children:e.label}),t.jsx("div",{className:"dash-stat-value",style:{color:e.color},children:e.value}),t.jsxs("div",{className:"dash-stat-trend",style:{color:e.up?"#10b981":"#f59e0b"},children:[e.up?t.jsx(je,{size:14}):t.jsx(ye,{size:14}),e.trend," ",e.trendLabel]})]},e.label))}),t.jsxs("div",{className:"dash-search-wrap",style:{marginBottom:24},children:[t.jsx(be,{size:18,style:{color:"#94a3b8",marginLeft:8,flexShrink:0}}),t.jsx("input",{className:"dash-search-input",value:_,onChange:e=>W(e.target.value),placeholder:"Search by participant name or email..."}),t.jsxs("div",{style:{display:"flex",gap:8,flexShrink:0},children:[t.jsxs("select",{className:"dash-filter-btn",value:p,onChange:e=>Y(e.target.value),children:[t.jsx("option",{value:"all",children:"All Dates"}),t.jsx("option",{value:"today",children:"Today"}),t.jsx("option",{value:"yesterday",children:"Yesterday"}),t.jsx("option",{value:"week",children:"Last 7 Days"}),t.jsx("option",{value:"month",children:"This Month"})]}),t.jsxs("select",{className:"dash-filter-btn",value:y,onChange:e=>G(e.target.value),children:[t.jsx("option",{value:"all",children:"All Games"}),I.map(e=>t.jsx("option",{value:e,children:e},e))]}),t.jsxs("select",{className:"dash-filter-btn",value:v,onChange:e=>$(e.target.value),children:[t.jsx("option",{value:"all",children:"All Status"}),t.jsx("option",{value:"pending",children:"Pending"}),t.jsx("option",{value:"completed",children:"Completed"}),t.jsx("option",{value:"code_revealed",children:"Ready"}),t.jsx("option",{value:"rejected",children:"Failed"})]}),t.jsxs("button",{className:"dash-filter-btn",onClick:ee,disabled:!c.length,style:{color:"#059669",opacity:c.length?1:.5,cursor:c.length?"pointer":"not-allowed"},children:[t.jsx(ke,{size:15})," Download Excel"]}),t.jsx("button",{className:"dash-icon-btn",onClick:b,children:t.jsx(me,{size:16})}),t.jsx("button",{className:"dash-icon-btn",children:t.jsx(le,{size:16})})]})]}),t.jsxs("div",{className:"dash-main-grid",style:{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,marginBottom:24},children:[t.jsxs("div",{className:"dash-table-card",children:[t.jsxs("div",{className:"dash-table-header",children:[t.jsx("span",{className:"dash-table-title",children:"Plays"}),t.jsxs("span",{style:{fontSize:12,color:"#94a3b8",fontWeight:500},children:[j.length," of ",c.length," records"]})]}),t.jsxs("div",{className:"dash-table-head",children:[t.jsx("span",{children:"Participant"}),t.jsx("span",{children:"Game"}),t.jsx("span",{children:"Status"}),t.jsx("span",{children:"Time"})]}),t.jsx("div",{style:{maxHeight:520,overflowY:"auto"},children:j.length===0?t.jsxs("div",{style:{textAlign:"center",padding:"48px 20px",color:"#94a3b8",fontSize:14},children:[t.jsx(xe,{size:28,style:{marginBottom:8,opacity:.3,color:"#c4b5fd"}}),t.jsx("div",{children:"No plays yet."})]}):j.map((e,a)=>{const o=ae(e.status);return t.jsxs("div",{className:"dash-table-row",style:{animationDelay:`${a*.03}s`},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[t.jsx("div",{className:"dash-avatar",style:{background:B[a%B.length]},children:te(e.player_name)}),t.jsxs("div",{children:[t.jsx("div",{style:{fontWeight:600,fontSize:13,color:"#1e1b4b"},children:e.player_name}),e.location_name&&t.jsx("div",{style:{fontSize:11,color:"#94a3b8",marginTop:1},children:e.location_name})]})]}),t.jsx("div",{style:{fontSize:13,fontWeight:500,color:"#475569"},children:e.game_name||"—"}),t.jsx("div",{children:t.jsx("span",{className:"dash-status-badge",style:{background:o.bg,color:o.color},children:o.label})}),t.jsx("div",{style:{fontSize:12,color:"#94a3b8",fontWeight:500},children:Z(e.created_at)})]},e.id)})})]}),t.jsxs("div",{className:"dash-activity",children:[t.jsx("div",{className:"dash-table-title",style:{marginBottom:16},children:"Activity Feed"}),T.length===0?t.jsx("div",{style:{textAlign:"center",padding:"32px 0",color:"#94a3b8",fontSize:13},children:"No activity yet"}):T.map((e,a)=>t.jsxs("div",{className:"dash-activity-item",children:[t.jsx("div",{className:"dash-activity-dot",style:{background:e.color}}),t.jsxs("div",{children:[t.jsx("div",{className:"dash-activity-text",children:e.text}),t.jsx("div",{className:"dash-activity-time",children:e.time})]})]},a))]})]})]})}export{Te as default};
