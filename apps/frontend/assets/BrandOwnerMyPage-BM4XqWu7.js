import{r as l,j as e}from"./react-vendor-gyK15t0p.js";import{c as w,a as N}from"./index-B2qSlCu9.js";import{T as z}from"./triangle-alert-DDHbvRkh.js";import{G as k}from"./gamepad-2-CqrDM6Qy.js";import{U as C,C as S}from"./users-j0K5T9Ez.js";import{T as B}from"./trophy-B6m6IBwK.js";import{C as R}from"./clock-j2DYaM2k.js";import{E as _}from"./eye-Dh4iGwum.js";import{R as P}from"./refresh-cw-CsIk0_6a.js";import{B as W,C as I}from"./chart-column-ze4Bh0lz.js";/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]],h=w("trending-up",T),A=`
@keyframes mbFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes mbSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

.mb-stat {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  padding:24px; transition:all 0.3s cubic-bezier(.4,0,.2,1);
  animation:mbFadeIn .4s cubic-bezier(.4,0,.2,1) both;
  position:relative; overflow:hidden;
}
.mb-stat:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(143,44,255,0.1); }
.mb-stat:nth-child(1){animation-delay:0s}
.mb-stat:nth-child(2){animation-delay:.05s}
.mb-stat:nth-child(3){animation-delay:.1s}
.mb-stat:nth-child(4){animation-delay:.15s}
.mb-stat:nth-child(5){animation-delay:.2s}
.mb-stat:nth-child(6){animation-delay:.25s}
.mb-stat-icon {
  width:48px; height:48px; border-radius:14px;
  display:flex; align-items:center; justify-content:center; margin-bottom:16px;
}
.mb-stat-value { font-size:36px; font-weight:800; letter-spacing:-1.5px; line-height:1; }
.mb-stat-label { font-size:13px; font-weight:600; color:#94a3b8; margin-top:4px; }

.mb-card {
  background:#fff; border:1px solid #ece8ff; border-radius:20px;
  overflow:hidden; animation:mbFadeIn .5s cubic-bezier(.4,0,.2,1) both;
}
.mb-card-header {
  padding:20px 24px; border-bottom:1px solid #f3f0ff;
  display:flex; align-items:center; justify-content:space-between;
}
.mb-card-title { font-size:16px; font-weight:700; color:#1e1b4b; }

.mb-branch-row {
  display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr;
  align-items:center; padding:14px 24px; border-bottom:1px solid #f8f7ff;
  transition:background 0.15s; gap:12px;
}
.mb-branch-row:last-child { border-bottom:none; }
.mb-branch-row:hover { background:#faf9ff; }
.mb-branch-head {
  font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;
  letter-spacing:0.5px; padding:12px 24px; border-bottom:1px solid #ece8ff;
  background:#faf9ff;
  display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr;
  gap:12px;
}

.mb-bar-row { margin-bottom:14px; }
.mb-bar-row:last-child { margin-bottom:0; }
.mb-bar-top { display:flex; justify-content:space-between; margin-bottom:6px; }
.mb-bar-name { font-size:13px; font-weight:600; color:#1e1b4b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px; }
.mb-bar-val { font-size:13px; font-weight:700; color:#7c3aed; }
.mb-bar-track { height:8px; border-radius:100px; background:#f0eef5; overflow:hidden; }
.mb-bar-fill { height:100%; border-radius:100px; transition:width 1s cubic-bezier(.4,0,.2,1); }

.mb-readonly-badge {
  display:inline-flex; align-items:center; gap:6px;
  padding:6px 14px; border-radius:100px;
  background:#f5f3ff; border:1px solid #e0d9f5;
  font-size:12px; font-weight:600; color:#7c3aed;
}

@media(max-width:1200px) {
  .mb-stats-grid { grid-template-columns:repeat(3,1fr) !important; }
  .mb-main-grid { grid-template-columns:1fr !important; }
}
@media(max-width:768px) {
  .mb-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
  .mb-branch-row,.mb-branch-head { grid-template-columns:1fr;gap:8px; }
}
@media(max-width:480px) { .mb-stats-grid { grid-template-columns:1fr !important; } }
`,n=["#7c3aed","#2563eb","#059669","#f59e0b","#ef4444","#8b5cf6","#0ea5e9","#ec4899","#14b8a6","#f97316"];function q(){const[g,x]=l.useState(null),[y,u]=l.useState(!0),[m,b]=l.useState(""),d=l.useCallback(async()=>{var a,i;try{const{data:s}=await N.get("/business/brand-dashboard");x(s),b("")}catch(s){b(((i=(a=s.response)==null?void 0:a.data)==null?void 0:i.message)||"Failed to load brand dashboard")}finally{u(!1)}},[]);if(l.useEffect(()=>{d()},[]),y)return e.jsxs("div",{style:{textAlign:"center",padding:80},children:[e.jsx("div",{style:{width:40,height:40,border:"3px solid #ece8ff",borderTopColor:"#7c3aed",borderRadius:"50%",animation:"mbSpin 1s linear infinite",margin:"0 auto 16px"}}),e.jsx("div",{style:{color:"#94a3b8",fontSize:14,fontWeight:500},children:"Loading brand dashboard..."})]});if(m)return e.jsxs("div",{style:{textAlign:"center",padding:80},children:[e.jsx(z,{size:40,style:{color:"#f59e0b",marginBottom:16}}),e.jsx("div",{style:{color:"#ef4444",fontSize:14,fontWeight:600,marginBottom:12},children:m}),e.jsx("button",{onClick:d,style:{padding:"10px 24px",borderRadius:10,border:"none",background:"#7c3aed",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"},children:"Retry"})]});const{kpis:r,branches:t,topGames:o,playsByDay:G,totalBranches:p,brand:c}=g,j=Math.max(...(o||[]).map(a=>a.play_count),1),f=Math.max(...(t||[]).map(a=>a.play_count),1),v=[{label:"Total Games",value:r.totalGames,color:"#7c3aed",bg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",icon:k},{label:"Total Plays",value:r.totalPlays,color:"#2563eb",bg:"linear-gradient(135deg,#eff6ff,#dbeafe)",icon:h},{label:"Participants",value:r.totalParticipants,color:"#059669",bg:"linear-gradient(135deg,#ecfdf5,#d1fae5)",icon:C},{label:"Redemptions",value:r.totalRedemptions,color:"#f59e0b",bg:"linear-gradient(135deg,#fffbeb,#fef3c7)",icon:B},{label:"Pending",value:r.pendingRedemptions,color:"#ef4444",bg:"linear-gradient(135deg,#fef2f2,#fecaca)",icon:R},{label:"Completed",value:r.completedRedemptions,color:"#10b981",bg:"linear-gradient(135deg,#ecfdf5,#d1fae5)",icon:S}];return e.jsxs("div",{style:{fontFamily:"Inter, sans-serif",color:"#1e1b4b"},children:[e.jsx("style",{children:A}),e.jsxs("div",{style:{marginBottom:32,display:"flex",alignItems:"flex-start",justifyContent:"space-between"},children:[e.jsxs("div",{children:[e.jsxs("h1",{style:{fontSize:28,fontWeight:800,margin:0,letterSpacing:"-0.5px"},children:[(c==null?void 0:c.name)||"Brand"," — Overview"]}),e.jsxs("p",{style:{color:"#94a3b8",fontSize:14,margin:"6px 0 0",fontWeight:500},children:["Aggregated KPIs across ",p," branch",p!==1?"es":"",". View only — no action required."]})]}),e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsxs("div",{className:"mb-readonly-badge",children:[e.jsx(_,{size:14})," View Only"]}),e.jsx("button",{onClick:d,style:{width:40,height:40,borderRadius:12,border:"1px solid #ece8ff",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b",transition:"all 0.2s"},title:"Refresh",children:e.jsx(P,{size:16})})]})]}),e.jsx("div",{className:"mb-stats-grid",style:{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:16,marginBottom:28},children:v.map(a=>e.jsxs("div",{className:"mb-stat",style:{background:a.bg},children:[e.jsx("div",{className:"mb-stat-icon",style:{background:a.color+"15"},children:e.jsx(a.icon,{size:22,style:{color:a.color}})}),e.jsx("div",{className:"mb-stat-label",children:a.label}),e.jsx("div",{className:"mb-stat-value",style:{color:a.color},children:a.value})]},a.label))}),e.jsxs("div",{className:"mb-main-grid",style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24},children:[e.jsxs("div",{className:"mb-card",children:[e.jsxs("div",{className:"mb-card-header",children:[e.jsxs("span",{className:"mb-card-title",children:[e.jsx(W,{size:18,style:{marginRight:8,verticalAlign:"middle",color:"#7c3aed"}}),"Branch Performance"]}),e.jsxs("span",{style:{fontSize:12,color:"#94a3b8",fontWeight:500},children:[(t==null?void 0:t.length)||0," branches"]})]}),!t||t.length===0?e.jsx("div",{style:{textAlign:"center",padding:"48px 20px",color:"#94a3b8",fontSize:14},children:"No branches yet."}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-branch-head",children:[e.jsx("span",{children:"Branch"}),e.jsx("span",{children:"Games"}),e.jsx("span",{children:"Plays"}),e.jsx("span",{children:"Redemptions"}),e.jsx("span",{children:"Completed"})]}),t.map((a,i)=>{var s;return e.jsxs("div",{className:"mb-branch-row",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:n[i%n.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0},children:(((s=a.business_name)==null?void 0:s[0])||"B").toUpperCase()}),e.jsx("div",{children:e.jsx("div",{style:{fontWeight:600,fontSize:13},children:a.business_name})})]}),e.jsx("div",{style:{fontSize:13,fontWeight:600,color:"#475569"},children:a.game_count}),e.jsx("div",{style:{fontSize:13,fontWeight:600,color:"#2563eb"},children:a.play_count}),e.jsx("div",{style:{fontSize:13,fontWeight:600,color:"#f59e0b"},children:a.redemption_count}),e.jsx("div",{style:{fontSize:13,fontWeight:600,color:"#10b981"},children:a.completed_count||0})]},a.id)})]})]}),e.jsxs("div",{className:"mb-card",children:[e.jsx("div",{className:"mb-card-header",children:e.jsxs("span",{className:"mb-card-title",children:[e.jsx(I,{size:18,style:{marginRight:8,verticalAlign:"middle",color:"#2563eb"}}),"Top Games by Plays"]})}),e.jsx("div",{style:{padding:24},children:!o||o.length===0?e.jsx("div",{style:{textAlign:"center",padding:"48px 20px",color:"#94a3b8",fontSize:14},children:"No games played yet."}):o.map((a,i)=>e.jsxs("div",{className:"mb-bar-row",children:[e.jsxs("div",{className:"mb-bar-top",children:[e.jsx("span",{className:"mb-bar-name",children:a.game_name}),e.jsxs("span",{className:"mb-bar-val",children:[a.play_count," plays"]})]}),e.jsx("div",{className:"mb-bar-track",children:e.jsx("div",{className:"mb-bar-fill",style:{width:`${a.play_count/j*100}%`,background:n[i%n.length]}})})]},i))})]})]}),t&&t.length>0&&e.jsxs("div",{className:"mb-card",style:{marginBottom:24},children:[e.jsx("div",{className:"mb-card-header",children:e.jsxs("span",{className:"mb-card-title",children:[e.jsx(h,{size:18,style:{marginRight:8,verticalAlign:"middle",color:"#059669"}}),"Plays per Branch"]})}),e.jsx("div",{style:{padding:24},children:t.map((a,i)=>e.jsxs("div",{className:"mb-bar-row",children:[e.jsxs("div",{className:"mb-bar-top",children:[e.jsx("span",{className:"mb-bar-name",children:a.business_name}),e.jsxs("span",{className:"mb-bar-val",children:[a.play_count," plays · ",a.completed_count||0," completed"]})]}),e.jsx("div",{className:"mb-bar-track",children:e.jsx("div",{className:"mb-bar-fill",style:{width:`${f>0?a.play_count/f*100:0}%`,background:n[i%n.length]}})})]},a.id))})]})]})}export{q as default};
