import{r,j as e}from"./react-vendor-gyK15t0p.js";import{a as w}from"./index-B2qSlCu9.js";const b={pass:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"#16a34a",strokeWidth:"2.5",children:[e.jsx("path",{d:"M22 11.08V12a10 10 0 11-5.93-9.14"}),e.jsx("polyline",{points:"22 4 12 14.01 9 11.01"})]}),fail:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"#dc2626",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("line",{x1:"15",y1:"9",x2:"9",y2:"15"}),e.jsx("line",{x1:"9",y1:"9",x2:"15",y2:"15"})]}),warn:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"#d97706",strokeWidth:"2.5",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})};function N({title:s,tests:n,expanded:i,onToggle:c}){const p=n.filter(t=>t.status==="pass").length,o=n.filter(t=>t.status==="fail").length,x=n.filter(t=>t.status==="warn").length,g=n.length;return e.jsxs("div",{className:"st-card",children:[e.jsxs("button",{className:"st-card-header",onClick:c,children:[e.jsxs("div",{className:"st-card-title-row",children:[e.jsx("span",{className:"st-card-title",children:s}),e.jsxs("div",{className:"st-card-badges",children:[e.jsxs("span",{className:"st-badge st-badge-pass",children:[p,"/",g," OK"]}),o>0&&e.jsxs("span",{className:"st-badge st-badge-fail",children:[o," Failed"]}),x>0&&e.jsxs("span",{className:"st-badge st-badge-warn",children:[x," Warnings"]})]})]}),e.jsx("span",{className:`st-chevron ${i?"st-expanded":""}`,children:"▼"})]}),i&&e.jsx("div",{className:"st-card-body",children:n.map((t,f)=>e.jsxs("div",{className:`st-test-row st-test-${t.status}`,children:[e.jsx("div",{className:"st-test-icon",children:b[t.status]||b.warn}),e.jsxs("div",{className:"st-test-info",children:[e.jsx("span",{className:"st-test-name",children:t.name}),e.jsx("span",{className:"st-test-msg",children:t.message})]}),e.jsx("div",{className:"st-test-expected",title:t.expected,children:t.expected})]},f))})]})}function C(){const[s,n]=r.useState(null),[i,c]=r.useState(!1),[p,o]=r.useState(null),[x,g]=r.useState({}),[t,f]=r.useState(null),[u,v]=r.useState(!0),d=r.useCallback(async()=>{var a,l;c(!0),o(null);try{const{data:h}=await w.get("/system/status",{timeout:6e4,headers:{"Cache-Control":"no-cache",Pragma:"no-cache"}});n(h),f(new Date().toLocaleTimeString())}catch(h){o(((l=(a=h.response)==null?void 0:a.data)==null?void 0:l.message)||h.message||"Failed to fetch system status")}c(!1)},[]);r.useEffect(()=>{d()},[d]),r.useEffect(()=>{if(!u||i)return;const a=setInterval(d,3e4);return()=>clearInterval(a)},[u,d,i]);const y=a=>{g(l=>({...l,[a]:!l[a]}))},j=r.useMemo(()=>s!=null&&s.categories?Object.entries(s.categories):[],[s]),m=(s==null?void 0:s.health)==="healthy"?"#16a34a":(s==null?void 0:s.health)==="degraded"?"#d97706":"#dc2626";return e.jsxs("div",{className:"st-page",children:[e.jsx("style",{children:`
        .st-page {
          padding: 32px;
          font-family: 'DM Sans', 'Inter', sans-serif;
          color: var(--text);
          max-width: 1200px;
          margin: 0 auto;
        }
        .st-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .st-header-left h1 {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 4px;
        }
        .st-header-left p {
          color: var(--text2);
          margin: 0;
          font-size: 14px;
        }
        .st-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .st-health-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 14px;
          background: ${m}18;
          color: ${m};
          border: 1.5px solid ${m}40;
        }
        .st-health-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${m};
          animation: st-pulse 1.5s infinite;
        }
        @keyframes st-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        .st-btn {
          padding: 8px 18px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all .12s;
          color: var(--text);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .st-btn:hover { border-color: #6366f1; color: #6366f1; }
        .st-btn:disabled { opacity: .5; cursor: not-allowed; }
        .st-btn-primary {
          background: #6366f1;
          border-color: #6366f1;
          color: #fff;
        }
        .st-btn-primary:hover { background: #4f46e5; color: #fff; }
        .st-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        .st-summary-item {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          text-align: center;
        }
        .st-summary-value {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
        }
        .st-summary-label {
          font-size: 12px;
          color: var(--text3);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .04em;
          margin-top: 2px;
        }
        .st-summary-value.pass { color: #16a34a; }
        .st-summary-value.fail { color: #dc2626; }
        .st-summary-value.warn { color: #d97706; }
        .st-summary-value.total { color: #6366f1; }
        .st-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          margin-bottom: 10px;
          overflow: hidden;
        }
        .st-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 14px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background .1s;
        }
        .st-card-header:hover { background: var(--surface2); }
        .st-card-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .st-card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
        }
        .st-card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .st-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 100px;
          letter-spacing: .02em;
        }
        .st-badge-pass { background: #dcfce7; color: #15803d; }
        .st-badge-fail { background: #fee2e2; color: #dc2626; }
        .st-badge-warn { background: #fef3c7; color: #b45309; }
        .st-chevron {
          font-size: 11px;
          color: var(--text3);
          transition: transform .2s;
        }
        .st-chevron.st-expanded { transform: rotate(180deg); }
        .st-card-body { border-top: 1px solid var(--surface2); }
        .st-test-row {
          display: grid;
          grid-template-columns: 28px 1fr 200px;
          gap: 10px;
          align-items: center;
          padding: 10px 20px;
          font-size: 13px;
          border-bottom: 1px solid var(--surface2);
        }
        .st-test-row:last-child { border-bottom: none; }
        .st-test-pass { background: #fafff7; }
        .st-test-fail { background: #fff5f5; }
        .st-test-warn { background: #fffbeb; }
        .st-test-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .st-test-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .st-test-name {
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .st-test-msg {
          font-size: 12px;
          color: var(--text2);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .st-test-expected {
          font-size: 11px;
          color: var(--text3);
          text-align: right;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .st-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px;
          color: var(--text2);
        }
        .st-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255,255,255,0.7);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 999;
          padding-top: 120px;
          backdrop-filter: blur(2px);
        }
        .st-loading-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface);
          padding: 16px 28px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          font-weight: 600;
          color: var(--text);
          font-size: 15px;
        }
        .st-spin {
          width: 28px;
          height: 28px;
          border: 3px solid var(--border);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: st-spin .6s linear infinite;
          margin-right: 12px;
        }
        @keyframes st-spin { to { transform: rotate(360deg); } }
        .st-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 16px 20px;
          border-radius: 10px;
          font-weight: 600;
        }
        .st-timestamp {
          font-size: 12px;
          color: var(--text3);
          margin-top: 16px;
          text-align: center;
        }
        .st-toggle-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text2);
          cursor: pointer;
          user-select: none;
        }
      `}),e.jsxs("div",{className:"st-header",children:[e.jsxs("div",{className:"st-header-left",children:[e.jsx("h1",{children:"System Status"}),e.jsx("p",{children:"Comprehensive health check for all components, endpoints, and configurations"})]}),e.jsxs("div",{className:"st-header-right",children:[e.jsxs("label",{className:"st-toggle-label",children:[e.jsx("input",{type:"checkbox",checked:u,onChange:a=>v(a.target.checked),style:{accentColor:"#6366f1"}}),"Auto-refresh"]}),e.jsx("button",{className:"st-btn",onClick:d,disabled:i,children:i?"Running...":"⟳ Run Tests"}),s&&e.jsxs("div",{className:"st-health-badge",children:[e.jsx("div",{className:"st-health-dot"}),s.health.toUpperCase()]})]})]}),i&&!s&&e.jsxs("div",{className:"st-loading",children:[e.jsx("div",{className:"st-spin"}),"Running comprehensive system checks..."]}),i&&s&&e.jsx("div",{className:"st-loading-overlay",children:e.jsxs("div",{className:"st-loading-inner",children:[e.jsx("div",{className:"st-spin"}),"Re-running tests..."]})}),p&&e.jsxs("div",{className:"st-error",children:["Error: ",p]}),s&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"st-summary",children:[e.jsxs("div",{className:"st-summary-item",children:[e.jsx("div",{className:"st-summary-value total",children:s.summary.total}),e.jsx("div",{className:"st-summary-label",children:"Total Tests"})]}),e.jsxs("div",{className:"st-summary-item",children:[e.jsx("div",{className:"st-summary-value pass",children:s.summary.passed}),e.jsx("div",{className:"st-summary-label",children:"Passed"})]}),e.jsxs("div",{className:"st-summary-item",children:[e.jsx("div",{className:"st-summary-value fail",children:s.summary.failed}),e.jsx("div",{className:"st-summary-label",children:"Failed"})]}),e.jsxs("div",{className:"st-summary-item",children:[e.jsx("div",{className:"st-summary-value warn",children:s.summary.warnings}),e.jsx("div",{className:"st-summary-label",children:"Warnings"})]})]}),j.map(([a,l])=>e.jsx(N,{title:a,tests:l.tests,expanded:x[a],onToggle:()=>y(a)},a)),e.jsxs("div",{className:"st-timestamp",children:["Last checked: ",t," • Auto-refreshes every 30s"]})]})]})}export{C as default};
