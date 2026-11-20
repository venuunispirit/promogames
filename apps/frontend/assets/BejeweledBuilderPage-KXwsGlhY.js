import{h as E,u as L,r as n,j as e}from"./react-vendor-gyK15t0p.js";import{a as m}from"./index-B2qSlCu9.js";import{u as $}from"./builderUpload-C26jq1Dk.js";const j=`
.gb-wrap {
  font-family: 'DM Sans', sans-serif;
  background: var(--gb-bg);
  color: var(--gb-text);
  min-height: 100vh;
}
.gb-wrap *,
.gb-wrap *::before,
.gb-wrap *::after { box-sizing: border-box; }

.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]),
.gb-wrap select,
.gb-wrap textarea {
  width: 100%;
  font-family: inherit;
  font-size: 14px;
  background: var(--gb-surface);
  border: none;
  border-bottom: 1.5px solid var(--gb-border);
  border-radius: 8px;
  color: var(--gb-text);
  padding: 10px 12px 8px;
  outline: none;
  transition: border-color .18s;
}
.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]):focus,
.gb-wrap select:focus,
.gb-wrap textarea:focus {
  border-bottom-color: #22c55e;
  border-bottom-width: 2px;
}
.gb-wrap select option { background: #fff; color: #1e1e2e; }

.gb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; font-size: 13px; font-weight: 600;
  border-radius: var(--gb-radius-sm); border: none; cursor: pointer;
  transition: all .15s; white-space: nowrap; font-family: inherit;
}
.gb-btn:disabled { opacity: .5; cursor: not-allowed; }
.gb-btn-primary { background: var(--gb-primary); color: #fff; }
.gb-btn-primary:not(:disabled):hover { background: var(--gb-primary-d); transform: translateY(-1px); box-shadow: 0 4px 12px var(--gb-primary-g); }
.gb-btn-ghost { background: var(--gb-surface); color: var(--gb-text2); border: 1.5px solid var(--gb-border); }
.gb-btn-ghost:not(:disabled):hover { border-color: var(--gb-primary); color: var(--gb-primary); }
.gb-btn-danger { background: #fee2e2; color: var(--gb-danger); border: 1.5px solid #fecaca; }
.gb-btn-danger:not(:disabled):hover { background: #fecaca; }
.gb-btn-success { background: #dcfce7; color: var(--gb-success); border: 1.5px solid #bbf7d0; }
.gb-btn-success:not(:disabled):hover { background: #bbf7d0; }
.gb-btn-sm { padding: 5px 10px; font-size: 12px; }

.gb-card {
  background: var(--gb-surface);
  border: 1.5px solid var(--gb-border);
  border-radius: var(--gb-radius);
  box-shadow: var(--gb-shadow);
}
.gb-label {
  font-size: 11px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: var(--gb-text2); margin-bottom: 4px;
  display: block;
}
.gb-section {
  background: var(--gb-surface2);
  border: 1px solid var(--gb-border);
  border-radius: var(--gb-radius);
  padding: 16px;
  margin-bottom: 14px;
}
.gb-section-title {
  font-size: 12px; font-weight: 700; letter-spacing: .05em;
  text-transform: uppercase; color: var(--gb-primary);
  margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
}
.gb-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  padding: 12px 18px; border-radius: 10px; color: #fff; font-weight: 600;
  font-size: 13px; box-shadow: 0 8px 24px rgba(0,0,0,.15);
  animation: gb-slide-in .22s ease; font-family: 'DM Sans',sans-serif;
  max-width: 320px;
}
@keyframes gb-slide-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
`,w={2:"#ff6b6b",4:"#4ecdc4",8:"#45b7d1",16:"#f9ca24",32:"#f0932b",64:"#eb4d4b",128:"#574b90",256:"#2c3e50",512:"#34495e",1024:"#2c3e50",2048:"#1a1a2e",4096:"#0f3d3f"};function G(){const{id:c}=E(),S=L(),[d,k]=n.useState(null),[z,x]=n.useState(!0),[u,N]=n.useState("form"),[g,h]=n.useState(null),[f,v]=n.useState(!1),[r,b]=n.useState({grid_size:8,logo_url:"",logo_name:"",theme_colors:JSON.stringify(w),match_score:10,chain_score_multiplier:2,is_active:1}),C=$(),p=(a,t="success")=>h({msg:a,type:t}),y=n.useCallback(()=>{x(!0),Promise.all([m.get(`/games/${c}`),m.get(`/bejeweled/${c}/settings`)]).then(([a,t])=>{const s=a.data.game;if(k(s),t.data&&t.data.settings){const o=t.data.settings;b(i=>({...i,grid_size:o.grid_size??i.grid_size,logo_url:o.logo_url??"",logo_name:o.logo_name??"",theme_colors:o.theme_colors??i.theme_colors,match_score:o.match_score??i.match_score,chain_score_multiplier:o.chain_score_multiplier??i.chain_score_multiplier,is_active:o.is_active??i.is_active}))}}).catch(a=>{var t,s;p("Failed to load: "+(((s=(t=a.response)==null?void 0:t.data)==null?void 0:s.message)||a.message),"error")}).finally(()=>x(!1))},[c]);n.useEffect(()=>{y()},[y]);const l=(a,t)=>b(s=>({...s,[a]:t})),T=async()=>{var a,t;v(!0);try{const s={grid_size:parseInt(r.grid_size)||8,logo_url:r.logo_url||"",logo_name:r.logo_name||"",theme_colors:r.theme_colors||JSON.stringify(w),match_score:parseInt(r.match_score)||10,chain_score_multiplier:parseInt(r.chain_score_multiplier)||2,is_active:r.is_active?1:0},o=await m.put(`/bejeweled/${c}/settings`,s);o.data&&o.data.settings&&b(i=>({...i,...o.data.settings})),p("Settings saved")}catch(s){p("Error: "+(((t=(a=s.response)==null?void 0:a.data)==null?void 0:t.message)||s.message),"error")}v(!1)},_=d?`${window.location.origin}/play/${d.slug}/${d.client_slug}`:"";if(z)return e.jsxs("div",{className:"gb-wrap",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"},children:[e.jsx("style",{children:j}),e.jsxs("div",{style:{textAlign:"center",color:"var(--gb-text2)"},children:[e.jsx("div",{style:{width:40,height:40,borderRadius:"50%",border:"3px solid #e2e6f0",borderTopColor:"#6366f1",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}),"Loading…",e.jsx("style",{children:"@keyframes spin{to{transform:rotate(360deg)}}"})]})]});const B=[{id:"form",label:"Game Settings"}],I={};return e.jsxs("div",{className:"gb-wrap",children:[e.jsx("style",{children:j}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr auto 1fr",background:"#fff",borderBottom:"1.5px solid var(--gb-border)",padding:"10px 28px",gap:"4px 20px",alignItems:"center",position:"sticky",top:"62px",zIndex:50},children:[e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"flex-start"},children:[e.jsx("button",{className:"gb-btn gb-btn-ghost",onClick:()=>S("/dashboard/games"),style:{padding:"6px 8px",fontSize:16},children:"←"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:14},children:(d==null?void 0:d.name)||"Untitled"}),e.jsx("div",{style:{fontSize:9.5,fontWeight:600,color:"var(--gb-text3)",letterSpacing:".04em",textTransform:"uppercase"},children:"Bejeweled Builder"})]})]}),e.jsx("div",{style:{display:"flex",gap:0,borderBottom:"2px solid var(--gb-border)"},children:B.map(a=>{const t=C.tabHasError(a.id,I[a.id]||[]);return e.jsxs("button",{onClick:()=>N(a.id),style:{padding:"6px 14px",fontSize:12.5,fontWeight:600,border:"none",background:"none",cursor:"pointer",color:u===a.id?"var(--gb-primary)":"var(--gb-text2)",borderBottom:u===a.id?"2px solid var(--gb-primary)":"2px solid transparent",marginBottom:-2},children:[a.label,t&&e.jsx("span",{className:"gb-tab-err-dot"})]},a.id)})}),e.jsx("div",{style:{display:"flex",gap:6,justifySelf:"end"},children:_&&e.jsx("a",{href:_,target:"_blank",rel:"noreferrer",className:"gb-btn gb-btn-ghost",style:{padding:"6px 8px",fontSize:16,textDecoration:"none"},children:"👁"})})]}),e.jsx("div",{style:{maxWidth:1200,margin:"0 auto",padding:"24px 20px"},children:e.jsxs("div",{className:"gb-card",children:[e.jsx("div",{className:"gb-section-title",children:"💎 Bejeweled Settings"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},children:[e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Grid Size"}),e.jsx("input",{type:"number",min:4,max:12,value:r.grid_size||8,onChange:a=>l("grid_size",parseInt(a.target.value)||8)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Match Score"}),e.jsx("input",{type:"number",min:1,value:r.match_score||10,onChange:a=>l("match_score",parseInt(a.target.value)||10)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Chain Score Multiplier"}),e.jsx("input",{type:"number",step:"0.1",min:1,value:r.chain_score_multiplier||2,onChange:a=>l("chain_score_multiplier",parseFloat(a.target.value)||2)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Logo URL"}),e.jsx("input",{value:r.logo_url||"",onChange:a=>l("logo_url",a.target.value),placeholder:"https://…"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Logo Name"}),e.jsx("input",{value:r.logo_name||"",onChange:a=>l("logo_name",a.target.value),placeholder:"Brand"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("input",{type:"checkbox",checked:!!r.is_active,onChange:a=>l("is_active",a.target.checked?1:0),style:{width:"auto"}}),e.jsx("span",{className:"gb-label",style:{marginBottom:0},children:"Active (game available to play)"})]}),e.jsxs("div",{style:{gridColumn:"1 / -1"},children:[e.jsx("span",{className:"gb-label",children:"Theme Colors (JSON)"}),e.jsx("textarea",{rows:6,value:r.theme_colors||"",onChange:a=>l("theme_colors",a.target.value),style:{fontFamily:"monospace",fontSize:12}})]})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginTop:12},children:e.jsx("button",{className:"gb-btn gb-btn-primary",onClick:T,disabled:f,children:f?"⏳ Saving…":"💾 Save Settings"})})]})}),g&&e.jsxs("div",{className:"gb-toast",style:{background:g.type==="success"?"#16a34a":"#dc2626"},onClick:()=>h(null),children:[g.type==="success"?"✅":"❌"," ",g.msg]})]})}export{G as default};
