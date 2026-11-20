import{r as l,j as e}from"./react-vendor-gyK15t0p.js";import{a as C}from"./index-B2qSlCu9.js";const c={played_not_redeemed:{label:"Played · Not Redeemed",color:"#64748b",bg:"#f1f5f9"},accepted_with_code:{label:"Accepted · 6-digit code",color:"#059669",bg:"#dcfce7"},accepted_without_code:{label:"Accepted · no code",color:"#b45309",bg:"#fef3c7"}},L=n=>`"${(n==null?"":String(n)).replace(/"/g,'""')}"`;function G(){const[n,h]=l.useState([]),[E,f]=l.useState(!0),[g,u]=l.useState(null),[y,A]=l.useState(""),[i,p]=l.useState(null),[r,v]=l.useState([]),[P,j]=l.useState(!1),[b,D]=l.useState(""),[x,R]=l.useState(""),w=l.useCallback(async()=>{var a,o;f(!0),u(null);try{const{data:s}=await C.get("/internal-team/bo-logs");h(s.business_owners||[])}catch(s){u(((o=(a=s.response)==null?void 0:a.data)==null?void 0:o.message)||s.message||"Failed to load business owners")}f(!1)},[]);l.useEffect(()=>{w()},[w]);const _=async a=>{p(a),j(!0),v([]);try{const o=new URLSearchParams;b&&o.set("start_date",b),x&&o.set("end_date",x);const{data:s}=await C.get(`/internal-team/bo-logs/${a.id}/entries?${o}`);v(s.entries||[])}catch(o){console.error(o)}j(!1)},B=()=>{i&&_(i)},N=n.filter(a=>a.business_name.toLowerCase().includes(y.toLowerCase())),$=(a,o)=>{const s=[];o.forEach(t=>Object.keys(t.player_data||{}).forEach(d=>{s.includes(d)||s.push(d)}));const k=[["Session ID","Game","Player Name","Player Email","Player Phone","Played At","Completed","Score",...s,"Redemption","6-Digit Code","Code Value","Accepted At","Accepted By","Table #","Reject Reason"].map(L).join(",")];o.forEach(t=>{const d=c[t.redemption_state]||c.played_not_redeemed,T=[t.session_id,t.game_name,t.player_name,t.player_email,t.player_phone,t.played_at,t.completed?"Yes":"No",t.score,...s.map(U=>{var z;return((z=t.player_data)==null?void 0:z[U])??""}),d.label,t.code_present?"Yes":"No",t.code||"",t.accepted_at||"",t.accepted_by_name||"",t.table_number||"",t.reject_reason||""];k.push(T.map(L).join(","))});const O=new Blob([k.join(`
`)],{type:"text/csv;charset=utf-8;"}),S=URL.createObjectURL(O),m=document.createElement("a");m.href=S,m.download=`BO_Logs_${a.business_name.replace(/[^a-z0-9]/gi,"_")}.csv`,m.click(),URL.revokeObjectURL(S)};return e.jsxs("div",{className:"bol-page",children:[e.jsx("style",{children:`
        .bol-page { --indigo:#6366f1; --violet:#8b5cf6; --ink:#0f172a; --muted:#94a3b8;
          font-family:'DM Sans',system-ui,sans-serif; padding:32px; max-width:1240px; margin:0 auto; color:var(--ink); }
        .bol-head { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:24px; }
        .bol-title { font-family:'Fraunces',serif; font-size:30px; font-weight:700; margin:0; letter-spacing:-.01em; }
        .bol-sub { color:var(--muted); font-size:14px; margin:6px 0 0; }
        .bol-search { position:relative; }
        .bol-search input { padding:11px 14px 11px 38px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:13px;
          font-family:inherit; width:260px; background:var(--surface); outline:none; transition:border-color .15s, box-shadow .15s; }
        .bol-search input:focus { border-color:var(--primary); box-shadow:0 0 0 4px rgba(99,102,241,.12); }
        .bol-search svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--muted); }
        .bol-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media (max-width: 900px) { .bol-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width: 600px) { .bol-grid { grid-template-columns:1fr; } }
        .bol-card--brand { border-color:#e9d5ff; }
        .bol-card--brand::before { background:linear-gradient(90deg,#7c3aed,#6366f1); opacity:1; }
        .bol-avatar--brand { background:linear-gradient(135deg,#7c3aed,#6366f1); }
        .bol-avatar--loc { background:linear-gradient(135deg,#0ea5e9,#6366f1); }
        .bol-card--loc { padding:16px; }
        .bol-card { text-align:left; background:var(--surface); border:1px solid #eef0f5; border-radius:18px; padding:20px;
          cursor:pointer; font-family:inherit; position:relative; overflow:hidden; transition:transform .15s, box-shadow .15s, border-color .15s; }
        .bol-card::before { content:''; position:absolute; inset:0 0 auto 0; height:4px;
          background:linear-gradient(90deg,var(--primary),var(--accent)); opacity:0; transition:opacity .15s; }
        .bol-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(15,23,42,.10); border-color:#e2e8f0; }
        .bol-card:hover::before { opacity:1; }
        .bol-card-top { display:flex; align-items:center; gap:14px; }
        .bol-avatar { width:46px; height:46px; border-radius:13px; flex-shrink:0;
          background:linear-gradient(135deg,var(--primary),var(--accent)); color:#fff; display:flex; align-items:center;
          justify-content:center; font-weight:800; font-size:17px; box-shadow:0 6px 16px rgba(99,102,241,.35); }
        .bol-name { font-weight:700; font-size:16px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .bol-mail { font-size:12px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .bol-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:18px; }
        .bol-stat { background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:10px 6px; text-align:center; }
        .bol-stat-v { font-size:20px; font-weight:800; line-height:1; }
        .bol-stat-l { font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); margin-top:5px; }
        .bol-foot { margin-top:16px; font-size:12px; color:var(--muted); display:flex; align-items:center; gap:6px; }
        .bol-foot .arrow { transition:transform .15s; }
        .bol-card:hover .bol-foot .arrow { transform:translateX(3px); }
        .bol-empty, .bol-loading { text-align:center; padding:64px 0; color:var(--muted); font-size:14px; }
        .bol-err { background:#fee2e2; color:#dc2626; padding:14px 18px; border-radius:12px; font-weight:600; }

        .bol-modal-bg { position:fixed; inset:0; background:rgba(15,23,42,.55); backdrop-filter:blur(4px);
          display:flex; align-items:flex-start; justify-content:center; padding:48px 16px; z-index:1000; overflow-y:auto; }
        .bol-modal { background:var(--surface); border-radius:20px; width:100%; max-width:1080px; box-shadow:0 30px 80px rgba(0,0,0,.3);
          overflow:hidden; animation:bolpop .18s ease; }
        @keyframes bolpop { from { transform:translateY(12px) scale(.98); opacity:0; } to { transform:none; opacity:1; } }
        .bol-modal-head { padding:22px 26px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff;
          display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
        .bol-modal-head h2 { margin:0; font-family:'Fraunces',serif; font-size:22px; }
        .bol-modal-head p { margin:4px 0 0; font-size:13px; opacity:.85; }
        .bol-modal-actions { display:flex; gap:10px; align-items:center; }
        .bol-btn { padding:9px 16px; border-radius:10px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:inherit; border:none; transition:filter .15s, background .15s; }
        .bol-btn-primary { background:var(--surface); color:#5b21b6; }
        .bol-btn-primary:hover { filter:brightness(.96); }
        .bol-btn-ghost { background:rgba(255,255,255,.18); color:#fff; }
        .bol-btn-ghost:hover { background:rgba(255,255,255,.28); }
        .bol-filters { display:flex; gap:12px; padding:18px 26px; flex-wrap:wrap; align-items:flex-end; border-bottom:1px solid #f1f5f9; }
        .bol-field label { display:block; font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; margin-bottom:5px; letter-spacing:.04em; }
        .bol-field input { padding:8px 12px; border-radius:9px; border:1.5px solid #e2e8f0; font-size:12.5px; font-family:inherit; outline:none; }
        .bol-field input:focus { border-color:var(--primary); }
        .bol-apply { padding:9px 18px; border-radius:9px; border:none; background:var(--primary); color:#fff; font-size:12.5px; font-weight:700; cursor:pointer; font-family:inherit; }
        .bol-table-wrap { max-height:520px; overflow:auto; }
        .bol-table { width:100%; border-collapse:collapse; font-size:12.5px; }
        .bol-table thead th { position:sticky; top:0; background:#f8fafc; color:#475569; font-weight:700; text-align:left;
          padding:12px 14px; font-size:11px; text-transform:uppercase; letter-spacing:.03em; border-bottom:1px solid #e8edf3; white-space:nowrap; z-index:1; }
        .bol-table tbody td { padding:12px 14px; border-bottom:1px solid #f5f7fa; color:#334155; vertical-align:top; }
        .bol-table tbody tr:hover { background:#fafaff; }
        .bol-pname { font-weight:700; color:var(--ink); }
        .bol-pmeta { font-size:11px; color:var(--muted); margin-top:2px; }
        .bol-badge { display:inline-block; padding:3px 9px; border-radius:999px; font-size:10.5px; font-weight:700; white-space:nowrap; }
        .bol-foot-note { padding:12px 26px; font-size:11px; color:var(--muted); border-top:1px solid #f1f5f9; }
      `}),e.jsxs("div",{className:"bol-head",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"bol-title",children:"Business Owner Logs"}),e.jsx("p",{className:"bol-sub",children:"Track every offer — when it was accepted, with or without the 6-digit code. Players who only played also appear."})]}),e.jsxs("div",{className:"bol-search",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"11",cy:"11",r:"7"}),e.jsx("line",{x1:"21",y1:"21",x2:"16.65",y2:"16.65"})]}),e.jsx("input",{value:y,onChange:a=>A(a.target.value),placeholder:"Search business owner…"})]})]}),E?e.jsx("div",{className:"bol-loading",children:"Loading business owners…"}):g?e.jsx("div",{className:"bol-err",children:g}):N.length===0?e.jsx("div",{className:"bol-empty",children:"No business owners found"}):e.jsx("div",{className:"bol-grid",children:N.map(a=>e.jsxs("button",{className:`bol-card ${a.kind==="brand"?"bol-card--brand":"bol-card--loc"}`,onClick:()=>_(a),children:[e.jsxs("div",{className:"bol-card-top",children:[e.jsx("div",{className:`bol-avatar ${a.kind==="brand"?"bol-avatar--brand":"bol-avatar--loc"}`,children:a.business_name.slice(0,2).toUpperCase()}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("div",{className:"bol-name",children:a.business_name}),e.jsxs("div",{className:"bol-mail",children:[a.email,a.phone?` · ${a.phone}`:""]})]})]}),e.jsxs("div",{className:"bol-stats",children:[e.jsxs("div",{className:"bol-stat",children:[e.jsx("div",{className:"bol-stat-v",style:{color:"#4f46e5"},children:a.total_plays}),e.jsx("div",{className:"bol-stat-l",children:"Plays"})]}),e.jsxs("div",{className:"bol-stat",children:[e.jsx("div",{className:"bol-stat-v",style:{color:"#059669"},children:a.total_redemptions}),e.jsx("div",{className:"bol-stat-l",children:"Redeemed"})]}),e.jsxs("div",{className:"bol-stat",children:[e.jsx("div",{className:"bol-stat-v",style:{color:"#0ea5e9"},children:a.with_code}),e.jsx("div",{className:"bol-stat-l",children:"With Code"})]}),e.jsxs("div",{className:"bol-stat",children:[e.jsx("div",{className:"bol-stat-v",style:{color:"#d97706"},children:a.without_code}),e.jsx("div",{className:"bol-stat-l",children:"No Code"})]})]}),e.jsxs("div",{className:"bol-foot",children:[e.jsxs("span",{children:[a.total_games," game",a.total_games===1?"":"s"," linked"]}),e.jsx("span",{className:"arrow",style:{marginLeft:"auto"},children:"View logs →"})]})]},a.id))}),i&&e.jsx("div",{className:"bol-modal-bg",onClick:()=>p(null),children:e.jsxs("div",{className:"bol-modal",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"bol-modal-head",children:[e.jsxs("div",{children:[e.jsx("h2",{children:i.business_name}),e.jsx("p",{children:"Offer activity & game responses"})]}),e.jsxs("div",{className:"bol-modal-actions",children:[e.jsx("button",{className:"bol-btn bol-btn-primary",onClick:()=>$(i,r),disabled:!r.length,style:{opacity:r.length?1:.5},children:"⬇ Download CSV"}),e.jsx("button",{className:"bol-btn bol-btn-ghost",onClick:()=>p(null),children:"Close"})]})]}),e.jsxs("div",{className:"bol-filters",children:[e.jsxs("div",{className:"bol-field",children:[e.jsx("label",{children:"Start Date"}),e.jsx("input",{type:"date",value:b,onChange:a=>D(a.target.value)})]}),e.jsxs("div",{className:"bol-field",children:[e.jsx("label",{children:"End Date"}),e.jsx("input",{type:"date",value:x,onChange:a=>R(a.target.value)})]}),e.jsx("button",{className:"bol-apply",onClick:B,children:"Apply"})]}),P?e.jsx("div",{className:"bol-loading",children:"Loading logs…"}):r.length===0?e.jsx("div",{className:"bol-empty",children:"No activity found"}):e.jsx("div",{className:"bol-table-wrap",children:e.jsxs("table",{className:"bol-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Player"}),e.jsx("th",{children:"Game"}),e.jsx("th",{children:"Played At"}),e.jsx("th",{children:"Score"}),e.jsx("th",{children:"Redemption"}),e.jsx("th",{children:"6-Digit Code"}),e.jsx("th",{children:"Accepted At"}),e.jsx("th",{children:"Accepted By"}),e.jsx("th",{children:"Table #"})]})}),e.jsx("tbody",{children:r.map(a=>{const o=c[a.redemption_state]||c.played_not_redeemed;return e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("div",{className:"bol-pname",children:a.player_name||"—"}),e.jsx("div",{className:"bol-pmeta",children:a.player_email||a.player_phone||"Guest"})]}),e.jsx("td",{children:a.game_name}),e.jsx("td",{style:{whiteSpace:"nowrap"},children:a.played_at?new Date(a.played_at).toLocaleString():"—"}),e.jsxs("td",{children:[a.score,a.total_scoreable?` / ${a.total_scoreable}`:""]}),e.jsx("td",{children:e.jsx("span",{className:"bol-badge",style:{background:o.bg,color:o.color},children:o.label})}),e.jsx("td",{children:a.redemption_id?a.code_present?`Yes (${a.code})`:"No":"—"}),e.jsx("td",{style:{whiteSpace:"nowrap"},children:a.accepted_at?new Date(a.accepted_at).toLocaleString():"—"}),e.jsx("td",{children:a.accepted_by_name||"—"}),e.jsx("td",{children:a.table_number||"—"})]},a.session_id)})})]})}),e.jsxs("div",{className:"bol-foot-note",children:["Showing ",r.length," entr",r.length===1?"y":"ies"," · players who played but never redeemed are shown as “Played · Not Redeemed”"]})]})})]})}export{G as default};
