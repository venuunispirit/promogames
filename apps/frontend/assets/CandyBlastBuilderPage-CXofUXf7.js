import{h as B,u as L,r as l,j as e}from"./react-vendor-gyK15t0p.js";import{a as m}from"./index-B2qSlCu9.js";const w=`
.gb-wrap {
  --gb-bg:        #f4f6fb;
  --gb-surface:   #ffffff;
  --gb-surface2:  #f0f2f8;
  --gb-border:    #e2e6f0;
  --gb-border2:   #cdd3e0;
  --gb-primary:   #6366f1;
  --gb-primary-d: #4f46e5;
  --gb-primary-g: rgba(99,102,241,0.15);
  --gb-success:   #16a34a;
  --gb-danger:    #dc2626;
  --gb-text:      #1e1e2e;
  --gb-text2:     #64657a;
  --gb-text3:     #9899ae;
  --gb-shadow:    0 2px 12px rgba(0,0,0,0.08);
  --gb-shadow-md: 0 4px 24px rgba(0,0,0,0.10);
  --gb-radius:    12px;
  --gb-radius-sm: 8px;
  font-family: 'DM Sans', sans-serif;
  background: var(--gb-bg);
  color: var(--gb-text);
  min-height: 100vh;
}
.gb-wrap *, .gb-wrap *::before, .gb-wrap *::after { box-sizing: border-box; }
.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]),
.gb-wrap select, .gb-wrap textarea {
  width: 100%; font-family: inherit; font-size: 14px; background: var(--gb-surface);
  border: none; border-bottom: 1.5px solid var(--gb-border); border-radius: 8px;
  color: var(--gb-text); padding: 10px 12px 8px; outline: none; transition: border-color .18s;
}
.gb-wrap input:not([type=checkbox]):not([type=file]):not([type=color]):not([type=range]):focus,
.gb-wrap select:focus, .gb-wrap textarea:focus { border-bottom-color: #22c55e; border-bottom-width: 2px; }
.gb-wrap select option { background: #fff; color: #1e1e2e; }
.gb-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600;
  border-radius: var(--gb-radius-sm); border: none; cursor: pointer; transition: all .15s; white-space: nowrap; font-family: inherit; }
.gb-btn:disabled { opacity: .5; cursor: not-allowed; }
.gb-btn-primary { background: var(--gb-primary); color: #fff; }
.gb-btn-primary:not(:disabled):hover { background: var(--gb-primary-d); transform: translateY(-1px); box-shadow: 0 4px 12px var(--gb-primary-g); }
.gb-btn-ghost { background: var(--gb-surface); color: var(--gb-text2); border: 1.5px solid var(--gb-border); }
.gb-btn-ghost:not(:disabled):hover { border-color: var(--gb-primary); color: var(--gb-primary); }
.gb-card { background: var(--gb-surface); border: 1.5px solid var(--gb-border); border-radius: var(--gb-radius); box-shadow: var(--gb-shadow); }
.gb-label { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--gb-text2); margin-bottom: 4px; display: block; }
.gb-section { background: var(--gb-surface2); border: 1px solid var(--gb-border); border-radius: var(--gb-radius); padding: 16px; margin-bottom: 14px; }
.gb-section-title { font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--gb-primary);
  margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.gb-toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 12px 18px; border-radius: 10px; color: #fff;
  font-weight: 600; font-size: 13px; box-shadow: 0 8px 24px rgba(0,0,0,.15); animation: gb-slide-in .22s ease;
  font-family: 'DM Sans',sans-serif; max-width: 320px; }
@keyframes gb-slide-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
`,T=JSON.stringify([{target:800,moves:18},{target:1400,moves:19},{target:2e3,moves:20},{target:2700,moves:21},{target:3500,moves:22},{target:4400,moves:23},{target:5400,moves:24},{target:6500,moves:25},{target:7700,moves:26},{target:9e3,moves:28}]);function F(){const{id:g}=B(),S=L(),[d,k]=l.useState(null),[C,x]=l.useState(!0),[u,N]=l.useState("form"),[c,f]=l.useState(null),[y,h]=l.useState(!1),[t,p]=l.useState({grid_size:8,logo_url:"",logo_name:"",levels_json:T,candy_types:6,match_score:10,combo_multiplier:40,special_spawn_rate:.17,is_active:1}),b=(a,r="success")=>f({msg:a,type:r}),v=l.useCallback(()=>{x(!0),Promise.all([m.get(`/games/${g}`),m.get(`/candyblast/${g}/settings`)]).then(([a,r])=>{const s=a.data.game;if(k(s),r.data&&r.data.settings){const n=r.data.settings;p(o=>({...o,grid_size:n.grid_size??o.grid_size,logo_url:n.logo_url??"",logo_name:n.logo_name??"",levels_json:n.levels_json??o.levels_json,candy_types:n.candy_types??o.candy_types,match_score:n.match_score??o.match_score,combo_multiplier:n.combo_multiplier??o.combo_multiplier,special_spawn_rate:n.special_spawn_rate??o.special_spawn_rate,is_active:n.is_active??o.is_active}))}}).catch(a=>{var r,s;b("Failed to load: "+(((s=(r=a.response)==null?void 0:r.data)==null?void 0:s.message)||a.message),"error")}).finally(()=>x(!1))},[g]);l.useEffect(()=>{v()},[v]);const i=(a,r)=>p(s=>({...s,[a]:r})),z=async()=>{var a,r;h(!0);try{let s=t.levels_json;try{s=JSON.parse(t.levels_json)}catch{}const n={grid_size:parseInt(t.grid_size)||8,logo_url:t.logo_url||"",logo_name:t.logo_name||"",levels_json:typeof s=="string"?s:JSON.stringify(s),candy_types:parseInt(t.candy_types)||6,match_score:parseInt(t.match_score)||10,combo_multiplier:parseInt(t.combo_multiplier)||40,special_spawn_rate:parseFloat(t.special_spawn_rate)||.17,is_active:t.is_active?1:0},o=await m.put(`/candyblast/${g}/settings`,n);o.data&&o.data.settings&&p(j=>({...j,...o.data.settings})),b("Settings saved")}catch(s){b("Error: "+(((r=(a=s.response)==null?void 0:a.data)==null?void 0:r.message)||s.message),"error")}h(!1)},_=d?`${window.location.origin}/play/${d.slug}/${d.client_slug}`:"";if(C)return e.jsxs("div",{className:"gb-wrap",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"},children:[e.jsx("style",{children:w}),e.jsxs("div",{style:{textAlign:"center",color:"var(--gb-text2)"},children:[e.jsx("div",{style:{width:40,height:40,borderRadius:"50%",border:"3px solid #e2e6f0",borderTopColor:"#6366f1",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}),"Loading…",e.jsx("style",{children:"@keyframes spin{to{transform:rotate(360deg)}}"})]})]});const I=[{id:"form",label:"Game Settings"}];return e.jsxs("div",{className:"gb-wrap",children:[e.jsx("style",{children:w}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr auto 1fr",background:"#fff",borderBottom:"1.5px solid var(--gb-border)",padding:"10px 28px",gap:"4px 20px",alignItems:"center",position:"sticky",top:0,zIndex:50},children:[e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"flex-start"},children:[e.jsx("button",{className:"gb-btn gb-btn-ghost",onClick:()=>S("/dashboard/games"),style:{padding:"6px 8px",fontSize:16},children:"←"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:14},children:(d==null?void 0:d.name)||"Untitled"}),e.jsx("div",{style:{fontSize:9.5,fontWeight:600,color:"var(--gb-text3)",letterSpacing:".04em",textTransform:"uppercase"},children:"Candy Blast Builder"})]})]}),e.jsx("div",{style:{display:"flex",gap:0,borderBottom:"2px solid var(--gb-border)"},children:I.map(a=>e.jsx("button",{onClick:()=>N(a.id),style:{padding:"6px 14px",fontSize:12.5,fontWeight:600,border:"none",background:"none",cursor:"pointer",color:u===a.id?"var(--gb-primary)":"var(--gb-text2)",borderBottom:u===a.id?"2px solid var(--gb-primary)":"2px solid transparent",marginBottom:-2},children:a.label},a.id))}),e.jsx("div",{style:{display:"flex",gap:6,justifySelf:"end"},children:_&&e.jsx("a",{href:_,target:"_blank",rel:"noreferrer",className:"gb-btn gb-btn-ghost",style:{padding:"6px 8px",fontSize:16,textDecoration:"none"},children:"👁"})})]}),e.jsx("div",{style:{maxWidth:1200,margin:"0 auto",padding:"24px 20px"},children:e.jsxs("div",{className:"gb-card",style:{padding:20},children:[e.jsx("div",{className:"gb-section-title",children:"Candy Blast Settings"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},children:[e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Grid Size"}),e.jsx("input",{type:"number",min:4,max:12,value:t.grid_size||8,onChange:a=>i("grid_size",parseInt(a.target.value)||8)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Number of Candy Types"}),e.jsx("input",{type:"number",min:3,max:8,value:t.candy_types||6,onChange:a=>i("candy_types",parseInt(a.target.value)||6)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Match Score (per candy)"}),e.jsx("input",{type:"number",min:1,value:t.match_score||10,onChange:a=>i("match_score",parseInt(a.target.value)||10)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Combo Multiplier (per chain)"}),e.jsx("input",{type:"number",min:10,value:t.combo_multiplier||40,onChange:a=>i("combo_multiplier",parseInt(a.target.value)||40)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Special Spawn Rate (0-1)"}),e.jsx("input",{type:"number",step:"0.01",min:0,max:1,value:t.special_spawn_rate||.17,onChange:a=>i("special_spawn_rate",parseFloat(a.target.value)||.17)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Logo URL"}),e.jsx("input",{value:t.logo_url||"",onChange:a=>i("logo_url",a.target.value),placeholder:"https://..."})]}),e.jsxs("div",{children:[e.jsx("span",{className:"gb-label",children:"Logo Name"}),e.jsx("input",{value:t.logo_name||"",onChange:a=>i("logo_name",a.target.value),placeholder:"Brand"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("input",{type:"checkbox",checked:!!t.is_active,onChange:a=>i("is_active",a.target.checked?1:0),style:{width:"auto"}}),e.jsx("span",{className:"gb-label",style:{marginBottom:0},children:"Active (game available to play)"})]}),e.jsxs("div",{style:{gridColumn:"1 / -1"},children:[e.jsxs("span",{className:"gb-label",children:["Levels JSON (array of ","{target, moves}",")"]}),e.jsx("textarea",{rows:8,value:t.levels_json||"",onChange:a=>i("levels_json",a.target.value),style:{fontFamily:"monospace",fontSize:12}})]})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginTop:12},children:e.jsx("button",{className:"gb-btn gb-btn-primary",onClick:z,disabled:y,children:y?"Saving...":"Save Settings"})})]})}),c&&e.jsx("div",{className:"gb-toast",style:{background:c.type==="success"?"#16a34a":"#dc2626"},onClick:()=>f(null),children:c.msg})]})}export{F as default};
