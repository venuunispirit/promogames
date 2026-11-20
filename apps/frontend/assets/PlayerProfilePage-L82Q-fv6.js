import{r as n,j as e}from"./react-vendor-gyK15t0p.js";import{u as w}from"./PlayerLayout-BEItqexe.js";import{e as S,A as z,a as _}from"./index-B2qSlCu9.js";import"./GameModal-BohLMt3z.js";import"./ShareMenu-BdQvel9y.js";const W=`
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes modal-backdrop {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 3000;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: modal-backdrop 0.2s ease both;
  }
  .modal-card {
    background: rgba(15, 7, 32, 0.95);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    width: 100%; max-width: 380px;
    overflow: hidden;
    animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .modal-title { font-size: 16px; font-weight: 800; color: #fff; }
  .modal-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.06); border: none;
    color: rgba(255,255,255,0.5); font-size: 16px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .modal-body { padding: 20px; }
`;function A({open:t,onClose:i,title:g,children:m}){return t?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:W}),e.jsx("div",{className:"modal-backdrop",onClick:r=>{r.target===r.currentTarget&&i()},children:e.jsxs("div",{className:"modal-card",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("span",{className:"modal-title",children:g}),e.jsx("button",{className:"modal-close",onClick:i,children:"✕"})]}),e.jsx("div",{className:"modal-body",children:m})]})})]}):null}function E(){const{player:t,handleLogout:i,handleAvatarChange:g,loadData:m}=w(),[r,d]=n.useState(!1),[f,u]=n.useState(t.avatar_id),[s,x]=n.useState(t.username||""),[p,l]=n.useState({text:"",type:""}),[h,b]=n.useState(!1);n.useEffect(()=>{r&&(u(t.avatar_id),x(t.username||""),l({text:"",type:""}))},[r,t.avatar_id,t.username]);const y=!t.username_changed_at||(()=>{const a=new Date(t.username_changed_at);return(new Date-a)/(1e3*60*60*24)>=30})(),v=t.username_changed_at?(()=>{const a=new Date(t.username_changed_at),o=Math.ceil(30-(new Date-a)/(1e3*60*60*24));return o>0?o:0})():0,k=async a=>{u(a),g(a),d(!1)},j=async()=>{var a,c;if(!(!s.trim()||s.trim()===t.username)){b(!0),l({text:"",type:""});try{(await _.put("/pauth/update-username",{username:s.trim()})).data.success&&(l({text:"Username updated!",type:"success"}),m(),setTimeout(()=>d(!1),800))}catch(o){l({text:((c=(a=o.response)==null?void 0:a.data)==null?void 0:c.message)||"Failed to update",type:"error"})}finally{b(!1)}}};return e.jsxs("div",{className:"fade-in",style:{padding:"0 20px"},children:[e.jsxs("div",{className:"glass-card",style:{padding:32,textAlign:"center",marginBottom:24,cursor:"pointer"},onClick:()=>d(!0),children:[e.jsxs("div",{style:{position:"relative",width:80,height:80,margin:"0 auto 16px"},children:[e.jsx(S,{avatarId:t.avatar_id,size:80,style:{border:"4px solid rgba(255,255,255,0.1)"}}),e.jsx("div",{style:{position:"absolute",bottom:-2,right:-2,width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg, #2ecfb8, #1aaa96)",border:"2px solid #0d1f2d",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#0d1f2d",fontWeight:800},children:"✎"})]}),e.jsx("h2",{style:{margin:0,fontSize:22,fontWeight:800},children:t.name}),t.username&&e.jsxs("div",{style:{fontSize:14,color:"var(--neon-purple)",fontWeight:700,marginTop:2},children:["@",t.username]}),e.jsxs("div",{style:{display:"flex",gap:12,marginTop:24},children:[e.jsxs("div",{style:{flex:1,padding:12,background:"rgba(255,255,255,0.03)",borderRadius:16},children:[e.jsx("div",{style:{fontSize:18,fontWeight:800},children:t.pc_balance}),e.jsx("div",{style:{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",fontWeight:700},children:"Available PC"})]}),e.jsxs("div",{style:{flex:1,padding:12,background:"rgba(255,255,255,0.03)",borderRadius:16},children:[e.jsx("div",{style:{fontSize:18,fontWeight:800},children:"#42"}),e.jsx("div",{style:{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",fontWeight:700},children:"Global Rank"})]})]})]}),e.jsx("button",{className:"btn-premium btn-desktop-auto",style:{width:"100%",background:"rgba(239, 68, 68, 0.1)",border:"1px solid rgba(255, 255, 255, 0.2)",color:"#ef4444"},onClick:i,children:"Logout Account"}),e.jsxs(A,{open:r,onClose:()=>d(!1),title:"Edit Profile",children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:20},children:[e.jsx("div",{style:{position:"relative",width:90,height:90,margin:"0 auto 12px"},children:e.jsx(S,{avatarId:f,size:90,style:{border:"3px solid rgba(255,255,255,0.1)"}})}),e.jsx(z,{selected:f,onSelect:k,size:70})]}),e.jsx("div",{style:{height:1,background:"rgba(255,255,255,0.06)",margin:"0 0 20px"}}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)",marginBottom:8},children:"Username"}),y?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{position:"relative"},children:[e.jsx("span",{style:{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)",fontWeight:700,fontSize:16,fontFamily:"'Outfit', sans-serif"},children:"@"}),e.jsx("input",{value:s,onChange:a=>x(a.target.value),placeholder:t.username||"choose_username",maxLength:20,onKeyDown:a=>{a.key==="Enter"&&j()},style:{width:"100%",padding:"12px 16px 12px 34px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:15,fontWeight:700,fontFamily:"'Outfit', sans-serif",outline:"none",boxSizing:"border-box"}})]}),e.jsx("div",{style:{marginTop:6,fontSize:11,color:"rgba(255,255,255,0.3)"},children:"3-20 characters. Letters, numbers, underscores."}),p.text&&e.jsx("div",{style:{marginTop:6,fontSize:12,fontWeight:600,color:p.type==="success"?"#22c55e":"#ef4444"},children:p.text}),s.trim()&&s.trim()!==t.username&&e.jsx("button",{onClick:j,disabled:h,style:{width:"100%",padding:"12px",marginTop:12,background:"linear-gradient(135deg, #7c3aed, #a855f7)",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit', sans-serif"},children:h?"Saving...":"Save Username"})]}):e.jsx("div",{style:{padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,fontSize:15,fontWeight:700,color:t.username?"#fff":"rgba(255,255,255,0.3)"},children:t.username?`@${t.username}`:"No username set"}),!y&&e.jsxs("div",{style:{marginTop:8,fontSize:11,color:"rgba(255,255,255,0.3)"},children:["Username change available in ",v," day",v!==1?"s":""]})]})]})]})}export{E as default};
