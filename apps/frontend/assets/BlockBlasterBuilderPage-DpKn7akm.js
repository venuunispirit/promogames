import{h as v,u as y,r as s,j as e}from"./react-vendor-gyK15t0p.js";import{a as p}from"./index-B2qSlCu9.js";const w=`
.bb-build-wrap {
  --gb-bg: #f4f6fb; --gb-surface: #ffffff; --gb-surface2: #f0f2f8;
  --gb-border: #e2e6f0; --gb-primary: #6366f1; --gb-primary-d: #4f46e5;
  --gb-primary-g: rgba(99,102,241,0.15); --gb-success: #16a34a;
  --gb-text: #1e1e2e; --gb-text2: #64657a; --gb-shadow: 0 2px 12px rgba(0,0,0,0.08);
  --gb-radius: 12px; --gb-radius-sm: 8px;
  font-family: 'DM Sans', sans-serif; background: var(--gb-bg);
  color: var(--gb-text); min-height: 100vh; padding: 24px;
}
.bb-build-wrap *, .bb-build-wrap *::before, .bb-build-wrap *::after { box-sizing: border-box; }
.bb-build-wrap input, .bb-build-wrap select, .bb-build-wrap textarea {
  width: 100%; font-family: inherit; font-size: 14px; background: var(--gb-surface);
  border: 1.5px solid var(--gb-border); border-radius: 8px; color: var(--gb-text);
  padding: 10px 12px; outline: none; transition: border-color .18s;
}
.bb-build-wrap input:focus { border-color: var(--gb-primary); }
.bb-build-wrap label { font-size: 12px; font-weight: 700; color: var(--gb-text2); text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 4px; }
.bb-build-card { background: var(--gb-surface); border: 1.5px solid var(--gb-border); border-radius: var(--gb-radius); box-shadow: var(--gb-shadow); padding: 24px; margin-bottom: 16px; }
.bb-build-title { font-size: 22px; font-weight: 800; margin: 0 0 4px; }
.bb-build-sub { font-size: 13px; color: var(--gb-text2); margin: 0 0 20px; }
.bb-build-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.bb-build-field { flex: 1; min-width: 200px; }
.bb-build-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: var(--gb-radius-sm); border: none; cursor: pointer; font-family: inherit; transition: all .15s; }
.bb-build-btn-primary { background: var(--gb-primary); color: #fff; }
.bb-build-btn-primary:hover { background: var(--gb-primary-d); transform: translateY(-1px); }
.bb-build-btn-ghost { background: var(--gb-surface); color: var(--gb-text2); border: 1.5px solid var(--gb-border); margin-right: 8px; }
.bb-build-btn-ghost:hover { border-color: var(--gb-primary); color: var(--gb-primary); }
.bb-build-preview { background: #1a1a2e; border-radius: 12px; padding: 20px; margin-top: 16px; }
.bb-build-preview h3 { color: #ffd23f; margin: 0 0 8px; font-size: 16px; }
.bb-build-preview p { color: #a9a3d6; margin: 0; font-size: 13px; line-height: 1.6; }
`;function _(){const{id:b}=v(),u=y(),[g,x]=s.useState(!0),[n,o]=s.useState(!1),[l,d]=s.useState(null),[j,m]=s.useState(null),[r,c]=s.useState({name:"",description:"",redirect_url:"",is_active:!0});s.useEffect(()=>{(async()=>{try{const a=await p.get(`/games/${b}`),i=a.data.game||a.data;m(i),c({name:i.name||"",description:i.description||"",redirect_url:i.redirect_url||"",is_active:i.is_active!==!1})}catch{d({type:"error",text:"Failed to load game"})}finally{x(!1)}})()},[b]);const t=(a,i)=>c(h=>({...h,[a]:i})),f=async()=>{o(!0);try{await p.put(`/games/${b}`,{name:r.name,description:r.description,redirect_url:r.redirect_url,is_active:r.is_active?1:0}),d({type:"success",text:"Game settings saved!"})}catch{d({type:"error",text:"Failed to save"})}finally{o(!1)}};return g?e.jsx("div",{className:"bb-build-wrap",children:e.jsx("p",{children:"Loading..."})}):e.jsxs("div",{className:"bb-build-wrap",children:[e.jsx("style",{children:w}),l&&e.jsx("div",{className:"bb-build-toast",style:{background:l.type==="success"?"#16a34a":"#dc2626"},children:l.text}),e.jsxs("div",{style:{maxWidth:640},children:[e.jsxs("div",{className:"bb-build-card",children:[e.jsx("h1",{className:"bb-build-title",children:"Block Blaster"}),e.jsx("p",{className:"bb-build-sub",children:"Configure your Block Blaster game settings."}),e.jsx("div",{className:"bb-build-row",children:e.jsxs("div",{className:"bb-build-field",children:[e.jsx("label",{children:"Game Name"}),e.jsx("input",{value:r.name,onChange:a=>t("name",a.target.value),placeholder:"Block Blaster"})]})}),e.jsx("div",{className:"bb-build-row",children:e.jsxs("div",{className:"bb-build-field",children:[e.jsx("label",{children:"Description"}),e.jsx("textarea",{rows:3,value:r.description,onChange:a=>t("description",a.target.value),placeholder:"Drag and drop puzzle pieces..."})]})}),e.jsx("div",{className:"bb-build-row",children:e.jsxs("div",{className:"bb-build-field",children:[e.jsx("label",{children:"Redirect URL (after game)"}),e.jsx("input",{value:r.redirect_url,onChange:a=>t("redirect_url",a.target.value),placeholder:"https://..."})]})}),e.jsx("div",{className:"bb-build-row",children:e.jsx("div",{className:"bb-build-field",style:{flex:"none"},children:e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:8,cursor:"pointer"},children:[e.jsx("input",{type:"checkbox",checked:r.is_active,onChange:a=>t("is_active",a.target.checked),style:{width:18,height:18}}),"Active"]})})}),e.jsxs("div",{style:{display:"flex",gap:8,marginTop:8},children:[e.jsx("button",{className:"bb-build-btn bb-build-btn-ghost",onClick:()=>u(-1),children:"Back"}),e.jsx("button",{className:"bb-build-btn bb-build-btn-primary",onClick:f,disabled:n,children:n?"Saving...":"Save Settings"})]})]}),e.jsxs("div",{className:"bb-build-card bb-build-preview",children:[e.jsx("h3",{children:"Game Preview"}),e.jsx("p",{children:"Drag pieces from the tray onto the 8x8 board. Fill complete rows or columns to clear them and score points. Game ends when no remaining pieces can be placed."})]})]})]})}export{_ as default};
