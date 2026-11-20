import{r as i,j as t}from"./react-vendor-gyK15t0p.js";import{c as z,a as E,G as fe}from"./index-B2qSlCu9.js";import{F as ge,s as xe,c as me}from"./boUtils-Hkv0EKOH.js";import{T as be}from"./triangle-alert-DDHbvRkh.js";import{X as L}from"./x-BSYMQvHz.js";import{S as he}from"./search-DxPuKftL.js";import{C as ue}from"./clipboard-list-BZr4GJLj.js";import{M as ye,C as S}from"./mail-DdJmlKhL.js";import{M as je}from"./map-pin-BRd7DZa3.js";import{C as P}from"./clock-j2DYaM2k.js";import{C as we,a as ke}from"./chevron-left-B05aKzq8.js";import{C as ve}from"./circle-x-Cy_EfXw2.js";/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],Fe=z("bell",Ce);/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],Q=z("chevron-down",Se);/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],_e=z("loader-circle",ze);/**
 * @license lucide-react v1.33.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]],Re=z("phone",Ne),Me=a=>{try{return typeof a=="string"?JSON.parse(a):a||{}}catch{return{}}},Ie=`
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes boCardIn { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:none} }
@keyframes boSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes boShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

/* Stat cards */
.redemption-stat {
  background:#fff; border:1px solid #f0eef5; border-radius:20px;
  padding:24px; display:flex; align-items:flex-start; gap:16px;
  transition:all 0.25s cubic-bezier(.4,0,.2,1);
  animation:boCardIn .4s cubic-bezier(.4,0,.2,1) both;
  position:relative; overflow:hidden;
}
.redemption-stat::after {
  content:''; position:absolute; top:0; left:0; bottom:0; width:4px;
  border-radius:0 4px 4px 0;
}
.redemption-stat:nth-child(1)::after { background:linear-gradient(180deg,#f59e0b,#f97316); }
.redemption-stat:nth-child(2)::after { background:linear-gradient(180deg,#10b981,#059669); }
.redemption-stat:nth-child(3)::after { background:linear-gradient(180deg,#3b82f6,#2563eb); }
.redemption-stat:nth-child(4)::after { background:linear-gradient(180deg,#8F2CFF,#6E11D8); }
.redemption-stat:nth-child(1) { animation-delay:0s; }
.redemption-stat:nth-child(2) { animation-delay:.05s; }
.redemption-stat:nth-child(3) { animation-delay:.1s; }
.redemption-stat:nth-child(4) { animation-delay:.15s; }
.redemption-stat:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.06); }
.redemption-stat-icon {
  width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.redemption-stat-value { font-size:32px; font-weight:800; letter-spacing:-1px; line-height:1; }
.redemption-stat-label { font-size:13px; font-weight:600; color:#64748b; margin-top:2px; }
.redemption-stat-sub { font-size:12px; color:#94a3b8; margin-top:4px; font-weight:500; }

/* Search & filters */
.redemption-search-bar {
  background:#fff; border:1.5px solid #f0eef5; border-radius:16px;
  display:flex; align-items:center; gap:12px; padding:8px 8px 8px 20px;
  transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.03);
}
.redemption-search-bar:focus-within { border-color:#8F2CFF; box-shadow:0 0 0 4px rgba(143,44,255,0.08); }
.redemption-search-input {
  flex:1; border:none; outline:none; font-size:14px; font-weight:500;
  color:#1e1b4b; font-family:inherit; background:transparent; min-width:0;
}
.redemption-search-input::placeholder { color:#94a3b8; }
.redemption-filter-btn {
  display:flex; align-items:center; gap:6px; padding:10px 16px;
  border-radius:12px; border:1px solid #f0eef5; background:#fff;
  font-size:13px; font-weight:600; color:#64748b; cursor:pointer;
  font-family:inherit; transition:all 0.2s; white-space:nowrap;
}
.redemption-filter-btn:hover { border-color:#e0d9f5; color:#8F2CFF; }
.redemption-filter-btn.active { background:#f8f7ff; border-color:#8F2CFF; color:#8F2CFF; }
.redemption-dropdown {
  position:relative; display:inline-flex;
}
.redemption-dropdown-menu {
  position:absolute; top:calc(100% + 6px); left:0; background:#fff;
  border:1px solid #f0eef5; border-radius:14px; padding:6px;
  min-width:180px; box-shadow:0 12px 40px rgba(0,0,0,0.1);
  animation:fadeIn .15s ease; z-index:50;
}
.redemption-dropdown-item {
  display:flex; align-items:center; gap:8px; width:100%; padding:10px 14px;
  border:none; background:none; color:#374151; font-size:13px; font-weight:600;
  text-align:left; cursor:pointer; border-radius:10px; font-family:inherit;
  transition:all 0.15s;
}
.redemption-dropdown-item:hover { background:#f8f7ff; color:#8F2CFF; }

/* Chips */
.redemption-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
.redemption-chip {
  display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
  border-radius:100px; font-size:13px; font-weight:600; cursor:pointer;
  border:1.5px solid transparent; transition:all 0.2s; user-select:none;
}
.redemption-chip:hover { transform:translateY(-1px); }
.redemption-chip.active { box-shadow:0 2px 8px rgba(0,0,0,0.08); }
.redemption-chip-count {
  font-size:11px; padding:1px 7px; border-radius:100px; font-weight:700;
}

/* Cards grid */
.redemption-card {
  background:#fff; border:1px solid #f0eef5; border-radius:20px;
  padding:0; overflow:hidden; transition:all 0.3s cubic-bezier(.4,0,.2,1);
  animation:boCardIn .4s cubic-bezier(.4,0,.2,1) both;
  display:flex; flex-direction:column;
}
.redemption-card:hover {
  transform:translateY(-4px); box-shadow:0 12px 32px rgba(143,44,255,0.1),0 4px 12px rgba(0,0,0,0.04);
  border-color:#e0d9f5;
}
.redemption-card-header {
  padding:20px 20px 0; display:flex; align-items:flex-start; gap:14px;
}
.redemption-card-avatar {
  width:48px; height:48px; border-radius:14px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-size:16px; font-weight:800; color:#fff;
  background:linear-gradient(135deg,#8F2CFF,#6E11D8);
}
.redemption-card-name { font-size:15px; font-weight:700; color:#1e1b4b; line-height:1.3; }
.redemption-card-badge {
  display:inline-flex; align-items:center; gap:5px; padding:4px 12px;
  border-radius:100px; font-size:11px; font-weight:700; white-space:nowrap;
  flex-shrink:0; margin-left:auto;
}
.redemption-card-body { padding:14px 20px; flex:1; }
.redemption-card-info {
  display:flex; flex-direction:column; gap:6px; font-size:12px; color:#64748b;
}
.redemption-card-info-row { display:flex; align-items:center; gap:8px; }
.redemption-card-info-row svg { color:#c4b5fd; flex-shrink:0; }
.redemption-card-info-row span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.redemption-card-gift {
  width:44px; height:44px; border-radius:12px; flex-shrink:0;
  background:linear-gradient(135deg,#f5f3ff,#ede9fe);
  display:flex; align-items:center; justify-content:center;
  margin-left:auto; align-self:center;
}
.redemption-card-footer {
  padding:14px 20px; border-top:1px solid #f8f7ff;
  display:flex; align-items:center; justify-content:space-between;
}
.redemption-card-date { font-size:11px; color:#94a3b8; font-weight:500; display:flex; align-items:center; gap:5px; }
.redemption-card-action {
  font-size:13px; font-weight:600; color:#8F2CFF; cursor:pointer;
  display:flex; align-items:center; gap:4px; background:none; border:none;
  font-family:inherit; transition:all 0.2s; padding:0;
}
.redemption-card-action:hover { gap:8px; color:#6E11D8; }

/* Pagination */
.redemption-pagination {
  display:flex; align-items:center; justify-content:center; gap:6px; margin-top:28px;
}
.redemption-page-btn {
  width:40px; height:40px; border-radius:12px; border:1px solid #f0eef5;
  background:#fff; color:#64748b; font-size:13px; font-weight:600;
  cursor:pointer; font-family:inherit; display:flex; align-items:center;
  justify-content:center; transition:all 0.2s;
}
.redemption-page-btn:hover { border-color:#e0d9f5; color:#8F2CFF; }
.redemption-page-btn.active {
  background:linear-gradient(135deg,#8F2CFF,#6E11D8); color:#fff;
  border-color:transparent; box-shadow:0 4px 12px rgba(143,44,255,0.3);
}
.redemption-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.redemption-per-page {
  display:flex; align-items:center; gap:8px; font-size:13px; color:#64748b; font-weight:500;
}
.redemption-per-page select {
  padding:8px 12px; border-radius:10px; border:1px solid #f0eef5;
  font-size:13px; font-weight:600; color:#1e1b4b; font-family:inherit;
  background:#fff; cursor:pointer; outline:none;
}

/* Toast */
.bo-toast {
  position:fixed; top:80px; right:24px; z-index:9999;
  background:#ffffff; border:1px solid #f0eef5;
  border-radius:16px; padding:18px 22px; max-width:360px; width:calc(100% - 48px);
  box-shadow:0 12px 40px rgba(143,44,255,0.12);
  animation:fadeIn .25s cubic-bezier(.4,0,.2,1);
}
.bo-toast.success{border-left:4px solid #10b981}
.bo-toast.error{border-left:4px solid #ef4444}

/* Modal */
.bo-modal-overlay{position:fixed;inset:0;background:rgba(17,24,39,0.4);backdrop-filter:blur(6px);z-index:9998;display:flex;align-items:center;justify-content:center;animation:fadeIn .15s ease}
.bo-modal{background:#fff;border-radius:24px;padding:32px;max-width:440px;width:calc(100% - 32px);box-shadow:0 24px 64px rgba(0,0,0,0.15);animation:boCardIn .3s cubic-bezier(.4,0,.2,1)}

/* Responsive */
@media(max-width:1200px){.redemption-grid{grid-template-columns:repeat(2,1fr) !important}}
@media(max-width:768px){.redemption-grid{grid-template-columns:1fr !important}}
@media(max-width:640px){
  .redemption-stats-grid{grid-template-columns:repeat(2,1fr) !important}
  .redemption-search-bar{flex-wrap:wrap}
  .redemption-card-header{flex-wrap:wrap}
}
@media(max-width:400px){.redemption-stats-grid{grid-template-columns:1fr !important}}
`,Te=[6,10,15,25];function Ve(){var K;const[a,ee]=i.useState([]),[te,B]=i.useState(!0),[$,_]=i.useState(""),[g,O]=i.useState(""),[s,Y]=i.useState("all"),[c,oe]=i.useState("newest"),[re,N]=i.useState(!1),[ne,R]=i.useState(!1),[p,ie]=i.useState(10),[d,u]=i.useState(1),[Ae,De]=i.useState(null),[y,J]=i.useState(null),M=i.useCallback((e,n="success")=>{J({message:e,type:n}),setTimeout(()=>J(null),3e3)},[]),[j,x]=i.useState(null),[w,I]=i.useState(""),[q,T]=i.useState(""),[A,G]=i.useState(!1),[k,m]=i.useState(null),[U,D]=i.useState("");i.useEffect(()=>{b();const e=setInterval(b,5e3);return()=>clearInterval(e)},[]);const b=()=>{E.get("/business/notifications").then(e=>{ee(e.data.notifications||[]),_("")}).catch(()=>{_("Failed to load redemptions.")}).finally(()=>B(!1))},V=i.useMemo(()=>{const e=new Date,n=r=>String(r).padStart(2,"0"),o=r=>`${r.getFullYear()}-${n(r.getMonth()+1)}-${n(r.getDate())}`,l=o(e);return{pending:a.filter(r=>["pending","code_revealed","code_entered"].includes(r.status)).length,completed:a.filter(r=>["completed","player_confirmed"].includes(r.status)).length,today:a.filter(r=>r.created_at&&o(new Date(r.created_at))===l).length,total:a.length}},[a]),v=i.useMemo(()=>{let e=[...a];const n=g.toLowerCase().trim();return n&&(e=e.filter(o=>{var l,r;return((l=o.player_name)==null?void 0:l.toLowerCase().includes(n))||((r=o.player_email)==null?void 0:r.toLowerCase().includes(n))})),s!=="all"&&(s==="with_code"?e=e.filter(o=>o.has_code):s==="without_code"?e=e.filter(o=>!o.has_code):e=e.filter(o=>o.status===s)),c==="newest"?e.sort((o,l)=>new Date(l.created_at)-new Date(o.created_at)):c==="oldest"?e.sort((o,l)=>new Date(o.created_at)-new Date(l.created_at)):c==="name"&&e.sort((o,l)=>(o.player_name||"").localeCompare(l.player_name||"")),e},[a,g,s,c]),h=Math.ceil(v.length/p),X=v.slice((d-1)*p,d*p);i.useEffect(()=>{u(1)},[g,s,c,p]);const f=i.useMemo(()=>({all:a.length,pending:a.filter(e=>e.status==="pending").length,completed:a.filter(e=>e.status==="completed"||e.status==="player_confirmed").length,code_revealed:a.filter(e=>e.status==="code_revealed").length,rejected:a.filter(e=>e.status==="rejected").length,with_code:a.filter(e=>e.has_code).length,without_code:a.filter(e=>!e.has_code).length}),[a]),W=[{key:"all",label:"All",color:"#8F2CFF",bg:"#f5f3ff",count:f.all},{key:"pending",label:"Pending",color:"#f59e0b",bg:"#fffbeb",count:f.pending},{key:"completed",label:"Completed",color:"#10b981",bg:"#ecfdf5",count:f.completed},{key:"code_revealed",label:"Ready",color:"#3b82f6",bg:"#eff6ff",count:f.code_revealed},{key:"rejected",label:"Failed",color:"#ef4444",bg:"#fef2f2",count:f.rejected},{key:"with_code",label:"With Code",color:"#8F2CFF",bg:"#f5f3ff",count:f.with_code},{key:"without_code",label:"Without Code",color:"#64748b",bg:"#f8fafc",count:f.without_code}],ae=e=>({pending:{bg:"#fffbeb",color:"#d97706",icon:P},code_revealed:{bg:"#eff6ff",color:"#2563eb",icon:S},code_entered:{bg:"#f5f3ff",color:"#8F2CFF",icon:S},player_confirmed:{bg:"#ecfdf5",color:"#059669",icon:S},completed:{bg:"#ecfdf5",color:"#059669",icon:S},rejected:{bg:"#fef2f2",color:"#dc2626",icon:ve}})[e]||{bg:"#f8fafc",color:"#64748b",icon:P},se=e=>{if(!e)return"";const n=new Date(e),o=n.getDate(),r=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][n.getMonth()],C=n.getFullYear(),F=n.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0});return`${o} ${r} ${C} · ${F}`},le=e=>{if(!e)return"?";const n=e.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():n[0].substring(0,2).toUpperCase()},de=async e=>{x(e),I(""),T("")},Z=async()=>{var e,n;if(j){G(!0),T("");try{const o={redemption_id:j.id};w.length===6&&(o.code=w);const{data:l}=await E.post("/business/accept-with-code",o);l.success&&(x(null),I(""),M(w.length===6?"Code verified & accepted":"Redemption accepted"),b())}catch(o){T(((n=(e=o.response)==null?void 0:e.data)==null?void 0:n.message)||"Failed to accept")}finally{G(!1)}}},ce=e=>{m(e),D("")},pe=async()=>{if(k)try{const{data:e}=await E.post("/business/reject-redemption",{redemption_id:k.id,reason:U||null});e.success&&(m(null),D(""),M("Redemption rejected"),b())}catch{M("Failed to reject","error")}};return te?t.jsxs("div",{style:{textAlign:"center",padding:80,fontFamily:"Inter, sans-serif"},children:[t.jsx(_e,{size:36,style:{color:"#8F2CFF",marginBottom:12,animation:"boSpin 1s linear infinite"}}),t.jsx("div",{style:{color:"#94a3b8",fontSize:14,fontWeight:500},children:"Loading redemptions..."})]}):$?t.jsxs("div",{style:{textAlign:"center",padding:80,fontFamily:"Inter, sans-serif"},children:[t.jsx(be,{size:36,style:{color:"#ef4444",marginBottom:12}}),t.jsx("div",{style:{color:"#ef4444",fontSize:15,fontWeight:600,marginBottom:16},children:$}),t.jsx("button",{onClick:()=>{B(!0),_(""),b()},style:{padding:"10px 24px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#8F2CFF,#6E11D8)",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 12px rgba(143,44,255,0.3)"},children:"Retry"})]}):t.jsxs("div",{style:{fontFamily:"Inter, sans-serif",color:"#1e1b4b"},children:[t.jsx("style",{children:Ie}),y&&t.jsx("div",{className:`bo-toast ${y.type}`,children:t.jsx("div",{style:{fontWeight:700,fontSize:14,color:y.type==="error"?"#ef4444":"#1e1b4b"},children:y.message})}),j&&t.jsx("div",{className:"bo-modal-overlay",onClick:()=>x(null),children:t.jsxs("div",{className:"bo-modal",onClick:e=>e.stopPropagation(),children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20},children:[t.jsxs("div",{children:[t.jsx("h3",{style:{fontSize:18,fontWeight:800,color:"#1e1b4b",margin:0},children:"Accept Redemption"}),t.jsxs("p",{style:{fontSize:13,color:"#94a3b8",margin:"4px 0 0"},children:["For ",t.jsx("strong",{style:{color:"#8F2CFF"},children:j.player_name})]})]}),t.jsx("button",{onClick:()=>x(null),style:{width:32,height:32,borderRadius:10,border:"1px solid #f0eef5",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",transition:"all 0.15s"},onMouseEnter:e=>{e.currentTarget.style.borderColor="#e0d9f5",e.currentTarget.style.color="#1e1b4b"},onMouseLeave:e=>{e.currentTarget.style.borderColor="#f0eef5",e.currentTarget.style.color="#94a3b8"},children:t.jsx(L,{size:16})})]}),t.jsx("label",{style:{display:"block",fontSize:12,fontWeight:600,color:"#64748b",marginBottom:8},children:"6-digit code (optional)"}),t.jsx("input",{style:{width:"100%",padding:"14px",fontSize:24,fontWeight:700,letterSpacing:10,textAlign:"center",background:"#f8f7ff",border:"2px solid #f0eef5",borderRadius:14,color:"#8F2CFF",outline:"none",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color 0.2s"},type:"text",maxLength:6,value:w,onChange:e=>I(e.target.value.replace(/\D/g,"")),onKeyDown:e=>e.key==="Enter"&&Z(),placeholder:"000000",autoComplete:"off",onFocus:e=>e.target.style.borderColor="#8F2CFF",onBlur:e=>e.target.style.borderColor="#f0eef5",autoFocus:!0,"aria-label":"6-digit verification code"}),t.jsx("p",{style:{margin:"8px 0 0",fontSize:11,color:"#94a3b8"},children:"Leave blank to accept without code verification."}),q&&t.jsx("div",{style:{marginTop:10,padding:"10px 14px",borderRadius:12,fontSize:12,fontWeight:600,color:"#ef4444",background:"#fef2f2",border:"1px solid #fecaca"},children:q}),t.jsxs("div",{style:{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"},children:[t.jsx("button",{onClick:()=>x(null),style:{padding:"10px 24px",borderRadius:12,border:"1px solid #f0eef5",background:"#fff",color:"#64748b",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"},onMouseEnter:e=>{e.target.style.background="#f8f7ff",e.target.style.color="#1e1b4b"},onMouseLeave:e=>{e.target.style.background="#fff",e.target.style.color="#64748b"},children:"Cancel"}),t.jsx("button",{onClick:Z,disabled:A,style:{padding:"10px 28px",borderRadius:12,border:"none",background:A?"#c4b5fd":"linear-gradient(135deg,#8F2CFF,#6E11D8)",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 12px rgba(143,44,255,0.3)",transition:"all 0.2s"},children:A?"Accepting...":"Accept"})]})]})}),k&&t.jsx("div",{className:"bo-modal-overlay",onClick:()=>m(null),children:t.jsxs("div",{className:"bo-modal",onClick:e=>e.stopPropagation(),children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20},children:[t.jsxs("div",{children:[t.jsx("h3",{style:{fontSize:18,fontWeight:800,color:"#1e1b4b",margin:0},children:"Reject Redemption"}),t.jsxs("p",{style:{fontSize:13,color:"#94a3b8",margin:"4px 0 0"},children:["For ",t.jsx("strong",{style:{color:"#8F2CFF"},children:k.player_name})]})]}),t.jsx("button",{onClick:()=>m(null),style:{width:32,height:32,borderRadius:10,border:"1px solid #f0eef5",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",transition:"all 0.15s"},onMouseEnter:e=>{e.currentTarget.style.borderColor="#e0d9f5",e.currentTarget.style.color="#1e1b4b"},onMouseLeave:e=>{e.currentTarget.style.borderColor="#f0eef5",e.currentTarget.style.color="#94a3b8"},children:t.jsx(L,{size:16})})]}),t.jsx("textarea",{value:U,onChange:e=>D(e.target.value),placeholder:"Reason (optional)",rows:3,style:{width:"100%",padding:"12px 14px",fontSize:13,fontFamily:"inherit",border:"1.5px solid #f0eef5",borderRadius:12,resize:"vertical",outline:"none",boxSizing:"border-box",color:"#1e1b4b",background:"#f8f7ff",transition:"border-color 0.2s"},onFocus:e=>e.target.style.borderColor="#8F2CFF",onBlur:e=>e.target.style.borderColor="#f0eef5"}),t.jsxs("div",{style:{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"},children:[t.jsx("button",{onClick:()=>m(null),style:{padding:"10px 24px",borderRadius:12,border:"1px solid #f0eef5",background:"#fff",color:"#64748b",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"},children:"Cancel"}),t.jsx("button",{onClick:pe,style:{padding:"10px 28px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 12px rgba(239,68,68,0.3)"},children:"Reject"})]})]})}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,flexWrap:"wrap",gap:16},children:[t.jsxs("div",{children:[t.jsx("h1",{style:{fontSize:28,fontWeight:800,margin:0,letterSpacing:"-0.5px"},children:"Redemptions"}),t.jsx("p",{style:{color:"#94a3b8",fontSize:14,margin:"6px 0 0",fontWeight:500},children:"Manage participant rewards and redemption requests."})]}),t.jsxs("button",{style:{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,border:"1.5px solid #f0eef5",background:"#fff",color:"#64748b",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",position:"relative"},onMouseEnter:e=>{e.currentTarget.style.borderColor="#8F2CFF",e.currentTarget.style.color="#8F2CFF"},onMouseLeave:e=>{e.currentTarget.style.borderColor="#f0eef5",e.currentTarget.style.color="#64748b"},children:[t.jsx(Fe,{size:16})," Notifications",V.pending>0&&t.jsx("span",{style:{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"},children:V.pending})]})]}),t.jsxs("div",{style:{display:"flex",gap:12,marginBottom:0,flexWrap:"wrap",alignItems:"center"},children:[t.jsxs("div",{className:"redemption-search-bar",style:{flex:1,minWidth:280},children:[t.jsx(he,{size:18,style:{color:"#94a3b8",flexShrink:0}}),t.jsx("input",{className:"redemption-search-input",type:"text",value:g,onChange:e=>O(e.target.value),placeholder:"Search by participant name or email...",autoComplete:"off","aria-label":"Search participants"}),g&&t.jsx("button",{onClick:()=>O(""),style:{width:28,height:28,borderRadius:8,border:"none",background:"#f0eef5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",transition:"all 0.15s",flexShrink:0},onMouseEnter:e=>e.currentTarget.style.background="#e0d9f5",onMouseLeave:e=>e.currentTarget.style.background="#f0eef5",children:t.jsx(L,{size:14})})]}),t.jsxs("div",{className:"redemption-filter-btn",style:{position:"relative"},children:[t.jsx(ge,{size:15})," Filter"]}),t.jsxs("div",{className:"redemption-dropdown",children:[t.jsxs("button",{className:`redemption-filter-btn ${s!=="all"?"active":""}`,onClick:()=>{N(e=>!e),R(!1)},children:[s==="all"?"All Status":((K=W.find(e=>e.key===s))==null?void 0:K.label)||s,t.jsx(Q,{size:14})]}),re&&t.jsx("div",{className:"redemption-dropdown-menu",style:{left:"auto",right:0},children:[{key:"all",label:"All Status"},...W.filter(e=>e.key!=="all")].map(e=>t.jsxs("button",{className:"redemption-dropdown-item",onClick:()=>{Y(e.key),N(!1)},children:[t.jsx("span",{style:{width:8,height:8,borderRadius:"50%",background:e.color,flexShrink:0}}),e.label]},e.key))})]}),t.jsxs("div",{className:"redemption-dropdown",children:[t.jsxs("button",{className:"redemption-filter-btn",onClick:()=>{R(e=>!e),N(!1)},children:[c==="newest"?"Newest First":c==="oldest"?"Oldest First":"Name A-Z",t.jsx(Q,{size:14})]}),ne&&t.jsx("div",{className:"redemption-dropdown-menu",children:[{key:"newest",label:"Newest First"},{key:"oldest",label:"Oldest First"},{key:"name",label:"Name A-Z"}].map(e=>t.jsx("button",{className:"redemption-dropdown-item",onClick:()=>{oe(e.key),R(!1)},children:e.label},e.key))})]})]}),t.jsx("div",{className:"redemption-chips",children:W.map(e=>t.jsxs("button",{className:`redemption-chip ${s===e.key?"active":""}`,style:{background:s===e.key?e.bg:"#fff",borderColor:s===e.key?e.color:"#f0eef5",color:s===e.key?e.color:"#64748b"},onClick:()=>Y(e.key),children:[e.label,t.jsx("span",{className:"redemption-chip-count",style:{background:s===e.key?e.color+"18":"#f0eef5",color:s===e.key?e.color:"#94a3b8"},children:e.count})]},e.key))}),X.length===0?t.jsxs("div",{style:{textAlign:"center",padding:"60px 20px"},children:[t.jsx("div",{style:{width:80,height:80,borderRadius:20,margin:"0 auto 16px",background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",display:"flex",alignItems:"center",justifyContent:"center"},children:t.jsx(ue,{size:36,style:{color:"#c4b5fd"}})}),t.jsx("div",{style:{color:"#64748b",fontSize:15,fontWeight:600},children:g?"No participants match your search.":"No redemptions yet."})]}):t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"redemption-grid",style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:20,alignItems:"stretch"},children:X.map((e,n)=>{const o=ae(e.status),l=o.icon;return t.jsxs("div",{className:"redemption-card",style:{animationDelay:`${n*.03}s`},children:[t.jsxs("div",{className:"redemption-card-header",children:[t.jsx("div",{className:"redemption-card-avatar",children:le(e.player_name)}),t.jsx("div",{style:{flex:1,minWidth:0},children:t.jsx("div",{className:"redemption-card-name",children:e.player_name})}),t.jsxs("span",{className:"redemption-card-badge",style:{background:o.bg,color:o.color},children:[t.jsx(l,{size:12}),xe(e.status)]})]}),t.jsx("div",{className:"redemption-card-body",children:t.jsxs("div",{style:{display:"flex",gap:12,alignItems:"flex-start"},children:[t.jsx("div",{className:"redemption-card-info",style:{flex:1,minWidth:0},children:(()=>{const r=Me(e.player_data),C=e.player_phone||r.phone||r["Phone Number"]||r["phone number"]||r.Phone||r.mobile||"",F=e.player_email||r.email||r.Email||r["Email Address"]||r["email address"]||"",H=r.city||r.City||r.location||"";return t.jsxs(t.Fragment,{children:[F&&t.jsxs("div",{className:"redemption-card-info-row",children:[t.jsx(ye,{size:13}),t.jsx("span",{children:F})]}),C&&t.jsxs("div",{className:"redemption-card-info-row",children:[t.jsx(Re,{size:13}),t.jsx("span",{children:C})]}),(e.location_name||H)&&t.jsxs("div",{className:"redemption-card-info-row",children:[t.jsx(je,{size:13}),t.jsx("span",{children:e.location_name||H})]})]})})()}),t.jsx("div",{className:"redemption-card-gift",children:t.jsx(fe,{size:20,style:{color:"#8F2CFF"}})})]})}),t.jsxs("div",{className:"redemption-card-footer",children:[t.jsxs("div",{className:"redemption-card-date",children:[t.jsx(P,{size:12})," ",se(e.created_at)]}),me(e.status)&&t.jsxs("div",{style:{display:"flex",gap:8},children:[t.jsx("button",{onClick:()=>de(e),style:{padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",boxShadow:"0 2px 8px rgba(16,185,129,0.3)"},children:"Accept"}),t.jsx("button",{onClick:()=>ce(e),style:{padding:"10px 22px",borderRadius:10,border:"2px solid #fecaca",background:"#fff",color:"#ef4444",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"},children:"Reject"})]})]})]},e.id)})}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:28,flexWrap:"wrap",gap:12},children:[t.jsxs("div",{className:"redemption-per-page",children:[t.jsx("select",{value:p,onChange:e=>ie(Number(e.target.value)),children:Te.map(e=>t.jsxs("option",{value:e,children:[e," per page"]},e))}),t.jsxs("span",{style:{color:"#94a3b8"},children:["Showing ",(d-1)*p+1,"–",Math.min(d*p,v.length)," of ",v.length]})]}),t.jsxs("div",{className:"redemption-pagination",children:[t.jsx("button",{className:"redemption-page-btn",disabled:d<=1,onClick:()=>u(e=>e-1),children:t.jsx(we,{size:16})}),Array.from({length:Math.min(h,5)},(e,n)=>{let o;return h<=5||d<=3?o=n+1:d>=h-2?o=h-4+n:o=d-2+n,t.jsx("button",{className:`redemption-page-btn ${d===o?"active":""}`,onClick:()=>u(o),children:o},o)}),t.jsx("button",{className:"redemption-page-btn",disabled:d>=h,onClick:()=>u(e=>e+1),children:t.jsx(ke,{size:16})})]})]})]})]})}export{Ve as default};
