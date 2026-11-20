import{r as n,j as e}from"./react-vendor-gyK15t0p.js";import{S as b,g as c}from"./gsap-BwBX5_R4.js";import{M as h}from"./index-B2qSlCu9.js";c.registerPlugin(b);const f=[{bg:"#0a0a0a",accent:"#9210f6",kicker:"Company Profile",title:`Games that
reward everyone`,body:"We built PromoGames because we believe play should always feel worth it. For players — exciting challenges and real rewards. For businesses — a platform that turns engagement into loyalty.",cta:"See what we've built"},{bg:"#1a0a2e",accent:"#eac2fb",kicker:"Platform",title:`Built for scale,
designed for fun`,cards:[{icon:"🎮",title:"500+ Games",desc:"Puzzles, quizzes, spins, arcs — every genre your audience craves."},{icon:"👥",title:"10M+ Players",desc:"A growing community that plays daily and keeps coming back."},{icon:"📈",title:"Real-Time Data",desc:"Track every play, every score, every reward — live."},{icon:"⚡",title:"Instant Setup",desc:"Launch branded games in hours. No coding required."}],cta:"For businesses"},{bg:"#0d1117",accent:"#fee960",kicker:"How It Works",title:`Three steps to
your first win`,steps:[{num:"01",icon:"🎯",title:"Pick a Game",desc:"Browse 500+ games across quizzes, puzzles, spins, and arcade."},{num:"02",icon:"⚡",title:"Play & Score",desc:"Every game tests your skill or luck — climb as you go."},{num:"03",icon:"🎁",title:"Unlock Rewards",desc:"Top scorers unlock gifts, cashback, and surprise prizes."}],cta:"Start playing"},{bg:"#1a0520",accent:"#ffc3d6",kicker:"For Businesses",title:`Turn your audience
into players`,body:"Create branded games, set rewards, and watch engagement soar. Our platform handles the tech — you focus on the fun.",features:["Custom branded games with your logo and colors","Real-time player analytics and dashboards","Automated reward distribution and tracking","Leaderboards that drive repeat engagement"],cta:"Partner with us"},{bg:"#0a0a0a",accent:"#79fee7",kicker:"Our Promise",title:`Play everyday.
Win everyday.`,body:"We're not just building a platform — we're building a habit. A daily ritual where play meets purpose, and every session feels rewarding.",cta:"Get in touch"}];function y({accent:s,sectionIndex:d}){const l=n.useRef(null),x=n.useRef(Array.from({length:18},(t,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:8+Math.random()*32,speed:.3+Math.random()*.7,rotation:Math.random()*360,type:["circle","diamond","ring","dot"][Math.floor(Math.random()*4)],opacity:.06+Math.random()*.14}))).current;return n.useEffect(()=>{const t=l.current;if(!t)return;t.querySelectorAll(".cp-particle").forEach((u,p)=>{const r=x[p];r&&(c.set(u,{x:0,y:0,rotation:r.rotation,scale:0,opacity:0}),c.to(u,{scale:1,opacity:r.opacity,duration:1.2,delay:p*.06,ease:"elastic.out(1, 0.6)"}),c.to(u,{y:`+=${(Math.random()-.5)*60}`,x:`+=${(Math.random()-.5)*40}`,rotation:`+=${Math.random()*180-90}`,duration:4+Math.random()*3,repeat:-1,yoyo:!0,ease:"sine.inOut",delay:Math.random()*2}))})},[]),e.jsx("div",{ref:l,style:{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:1},children:x.map(t=>{const i={position:"absolute",left:`${t.x}%`,top:`${t.y}%`,width:t.size,height:t.size};return t.type==="circle"?e.jsx("div",{className:"cp-particle",style:{...i,borderRadius:"50%",background:s}},t.id):t.type==="diamond"?e.jsx("div",{className:"cp-particle",style:{...i,borderRadius:4,background:s,transform:"rotate(45deg)"}},t.id):t.type==="ring"?e.jsx("div",{className:"cp-particle",style:{...i,borderRadius:"50%",border:`2px solid ${s}`,background:"transparent"}},t.id):e.jsx("div",{className:"cp-particle",style:{...i,width:t.size*.4,height:t.size*.4,borderRadius:"50%",background:s}},t.id)})})}function m({color:s,size:d,x:l,y:x,blur:t,speed:i}){const u=n.useRef(null);return n.useEffect(()=>{const p=u.current;p&&(c.set(p,{scale:.8,opacity:0}),c.to(p,{scale:1,opacity:.35,duration:2,ease:"power2.out"}),c.to(p,{y:`+=${i*30}`,x:`+=${i*15}`,duration:6+i*2,repeat:-1,yoyo:!0,ease:"sine.inOut"}))},[i]),e.jsx("div",{ref:u,style:{position:"absolute",left:l,top:x,width:d,height:d,borderRadius:"50%",background:`radial-gradient(circle, ${s} 0%, transparent 70%)`,filter:`blur(${t}px)`,pointerEvents:"none",zIndex:0}})}function v({color:s}){const d=n.useRef(null);return n.useEffect(()=>{const l=d.current;l&&(c.set(l,{y:-300,opacity:0,scale:.5}),c.to(l,{y:0,opacity:1,scale:1,duration:1.2,ease:"elastic.out(1, 0.4)"}),c.to(l,{y:-14,duration:2,repeat:-1,yoyo:!0,ease:"sine.inOut"}))},[]),e.jsx("div",{ref:d,style:{width:28,height:28,borderRadius:"50%",background:`radial-gradient(circle at 30% 30%, ${s}, ${s}99)`,boxShadow:`0 8px 32px ${s}44, 0 0 60px ${s}22`}})}function j(){const[s,d]=n.useState(0),[l,x]=n.useState(!1),t=n.useRef([]),i=n.useRef([]),u=n.useRef([]);n.useEffect(()=>{const r=()=>{x(window.scrollY>60)};return window.addEventListener("scroll",r,{passive:!0}),()=>window.removeEventListener("scroll",r)},[]),n.useEffect(()=>(t.current.forEach((r,a)=>{if(!r)return;b.create({trigger:r,start:"top center",end:"bottom center",onEnter:()=>d(a),onEnterBack:()=>d(a)});const o=u.current[a];o&&c.fromTo(o,{opacity:.3,y:80},{opacity:1,y:0,duration:1,ease:"power2.out",scrollTrigger:{trigger:r,start:"top 90%",end:"top 30%",scrub:.5}})}),()=>b.getAll().forEach(r=>r.kill())),[]),n.useEffect(()=>{const r=setTimeout(()=>{i.current.forEach((a,o)=>{if(!a)return;const g=Array.from(a.querySelectorAll(".cp-kicker, .cp-title, .cp-body, .cp-cta, .cp-card, .cp-step, .cp-feature"));c.set(g,{opacity:0,y:70}),b.create({trigger:t.current[o],start:"top 65%",onEnter:()=>{c.to(g,{opacity:1,y:0,duration:.9,stagger:.1,ease:"elastic.out(1, 0.7)"})},onLeaveBack:()=>{c.set(g,{opacity:0,y:70})}})})},150);return()=>{clearTimeout(r),b.getAll().forEach(a=>a.kill())}},[]);const p=r=>{var a;(a=t.current[r])==null||a.scrollIntoView({behavior:"smooth"})};return e.jsxs(e.Fragment,{children:[e.jsx(h,{}),e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; background: #0a0a0a; font-family: 'Inter', sans-serif; }

        .cp-section {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cp-bg-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          transition: background-color 1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cp-content {
          position: relative;
          z-index: 10;
          max-width: 880px;
          width: 100%;
          padding: 100px 24px;
          text-align: center;
        }

        .cp-kicker {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 20px;
        }

        .cp-hero-logo-wrap {
          margin-bottom: 36px;
          display: flex;
          justify-content: center;
        }
        .cp-hero-logo {
          height: 120px;
          width: auto;
          border-radius: 20px;
          filter: drop-shadow(0 8px 40px rgba(121,254,231,0.3));
          animation: cpLogoFloat 4s ease-in-out infinite;
        }
        @keyframes cpLogoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .cp-title {
          font-size: clamp(38px, 7vw, 76px);
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          margin-bottom: 28px;
          letter-spacing: -2px;
          white-space: pre-line;
          text-shadow: 0 2px 40px rgba(0,0,0,0.3);
        }

        .cp-body {
          font-size: clamp(15px, 1.8vw, 18px);
          color: rgba(255,255,255,0.55);
          max-width: 540px;
          margin: 0 auto 44px;
          line-height: 1.8;
        }

        .cp-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 18px 42px;
          background: rgba(255,255,255,0.95);
          color: #0a0a0a;
          border: none;
          border-radius: 60px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          letter-spacing: 0.5px;
        }
        .cp-cta:hover {
          transform: scale(1.07) translateY(-3px);
          box-shadow: 0 20px 60px rgba(255,255,255,0.15);
        }
        .cp-cta-arrow {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-block;
          font-size: 18px;
        }
        .cp-cta:hover .cp-cta-arrow { transform: translateX(6px); }

        /* CARDS */
        .cp-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 48px auto 0;
          max-width: 700px;
        }
        .cp-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.3s ease,
                      background 0.3s ease;
        }
        .cp-card:hover {
          transform: translateY(-12px) scale(1.03);
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.07);
        }
        .cp-card-icon { font-size: 36px; margin-bottom: 14px; display: block; }
        .cp-card-title {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 6px;
        }
        .cp-card-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
        }

        /* STEPS */
        .cp-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 48px auto 0;
          max-width: 780px;
          position: relative;
        }
        .cp-steps::before {
          content: '';
          position: absolute;
          top: 48px;
          left: 18%;
          right: 18%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          z-index: 0;
        }
        .cp-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          position: relative;
          z-index: 1;
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.3s ease;
        }
        .cp-step:hover {
          transform: translateY(-10px);
          border-color: rgba(255,255,255,0.18);
        }
        .cp-step-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.25);
          margin-bottom: 16px;
        }
        .cp-step-icon { font-size: 34px; margin-bottom: 18px; display: block; }
        .cp-step-title {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }
        .cp-step-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
        }

        /* FEATURES */
        .cp-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 40px auto 0;
          max-width: 480px;
          text-align: left;
        }
        .cp-feature {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.3s ease,
                      background 0.3s ease;
        }
        .cp-feature:hover {
          transform: translateX(8px);
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
        }
        .cp-feature-check {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          color: #fff;
        }
        .cp-feature-text {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
        }

        /* NAV */
        .cp-nav {
          position: fixed;
          right: 28px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 14px;
          z-index: 200;
        }
        .cp-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 2px solid rgba(255,255,255,0.18);
          cursor: pointer;
          transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-dot.active {
          background: #fff;
          border-color: #fff;
          transform: scale(1.5);
          box-shadow: 0 0 12px rgba(255,255,255,0.3);
        }
        .cp-dot:hover:not(.active) {
          transform: scale(1.25);
          background: rgba(255,255,255,0.25);
        }

        /* BALL */
        .cp-ball-wrap {
          position: fixed;
          bottom: 36px;
          right: 36px;
          z-index: 200;
          cursor: pointer;
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-ball-wrap:hover {
          transform: scale(1.3) rotate(12deg);
        }

        /* HEADER — logo pill */
        .cp-header {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 300;
          padding: 10px 28px;
          background: rgba(10,10,10,0.65);
          backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 60px;
          transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cp-header.scrolled {
          background: rgba(10,10,10,0.85);
          border-color: rgba(255,255,255,0.12);
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }
        .cp-logo-img {
          height: 40px;
          width: auto;
          display: block;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-logo-img:hover {
          transform: scale(1.12);
        }

        @media(max-width:768px) {
          .cp-nav { display: none; }
          .cp-ball-wrap { bottom: 20px; right: 20px; }
          .cp-steps { grid-template-columns: 1fr; }
          .cp-cards { grid-template-columns: 1fr; }
          .cp-header { top: 16px; padding: 8px 20px; }
          .cp-logo-img { height: 32px; }
        }
      `}),e.jsx("div",{className:`cp-header${l?" scrolled":""}`,children:e.jsx("a",{href:"/",children:e.jsx("img",{src:"/favicon2.png",alt:"PromoGames",className:"cp-logo-img"})})}),e.jsx("div",{className:"cp-nav",children:f.map((r,a)=>e.jsx("div",{className:`cp-dot${s===a?" active":""}`,onClick:()=>p(a)},a))}),e.jsx("div",{className:"cp-ball-wrap",onClick:()=>p(Math.min(s+1,f.length-1)),children:e.jsx(v,{color:f[s].accent})}),f.map((r,a)=>e.jsxs("section",{className:"cp-section",ref:o=>t.current[a]=o,children:[e.jsx("div",{className:"cp-bg-layer",ref:o=>u.current[a]=o,style:{backgroundColor:r.bg}}),e.jsx(y,{accent:r.accent,sectionIndex:a}),e.jsx(m,{color:r.accent,size:400,x:"10%",y:"20%",blur:80,speed:.5}),e.jsx(m,{color:r.accent,size:300,x:"70%",y:"60%",blur:100,speed:.7}),e.jsx(m,{color:r.accent,size:200,x:"50%",y:"10%",blur:60,speed:.3}),e.jsxs("div",{className:"cp-content",ref:o=>i.current[a]=o,children:[e.jsx("div",{className:"cp-kicker",children:r.kicker}),e.jsx("h1",{className:"cp-title",children:r.title}),r.body&&e.jsx("p",{className:"cp-body",children:r.body}),r.cards&&e.jsx("div",{className:"cp-cards",children:r.cards.map((o,g)=>e.jsxs("div",{className:"cp-card",children:[e.jsx("span",{className:"cp-card-icon",children:o.icon}),e.jsx("div",{className:"cp-card-title",children:o.title}),e.jsx("div",{className:"cp-card-desc",children:o.desc})]},g))}),r.steps&&e.jsx("div",{className:"cp-steps",children:r.steps.map((o,g)=>e.jsxs("div",{className:"cp-step",children:[e.jsx("div",{className:"cp-step-num",children:o.num}),e.jsx("span",{className:"cp-step-icon",children:o.icon}),e.jsx("div",{className:"cp-step-title",children:o.title}),e.jsx("div",{className:"cp-step-desc",children:o.desc})]},g))}),r.features&&e.jsx("div",{className:"cp-features",children:r.features.map((o,g)=>e.jsxs("div",{className:"cp-feature",children:[e.jsx("div",{className:"cp-feature-check",children:"✓"}),e.jsx("div",{className:"cp-feature-text",children:o})]},g))}),r.cta&&e.jsxs("button",{className:"cp-cta",onClick:()=>p(Math.min(a+1,f.length-1)),children:[r.cta," ",e.jsx("span",{className:"cp-cta-arrow",children:"→"})]})]})]},a))]})}export{j as default};
