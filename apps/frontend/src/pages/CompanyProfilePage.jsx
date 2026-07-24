import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Target, Gift, Users, BarChart3, Smartphone, ShieldCheck, Zap,
  Sparkles, Trophy, Lightbulb, Search, Code2, Rocket, RefreshCw, Handshake,
  Eye, Wand2, LineChart, Layers, Clock, ChevronDown, Crown, Dices, ArrowRight,
} from "lucide-react";

/* ================================================================== */
/*  Hooks                                                              */
/* ================================================================== */

function Reveal({ children, as: Tag = "div", className = "", delay = 0, variant = "up" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); io.unobserve(node); } }),
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`pg-reveal pg-reveal-${variant} ${visible ? "pg-reveal-in" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

function Counter({ target, suffix = "", duration = 1800 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const isFloat = target % 1 !== 0;
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(isFloat ? +(eased * target).toFixed(1) : Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(tick); else setValue(target);
          };
          requestAnimationFrame(tick);
          io.unobserve(node);
        }
      }),
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target, duration, isFloat]);
  return <span ref={ref} className="pg-counter">{value}{suffix}</span>;
}

function useTilt(max = 6) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onMove = (e) => {
      const r = node.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -max;
      const ry = (px - 0.5) * max;
      node.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      node.style.setProperty("--mx", `${px * 100}%`);
      node.style.setProperty("--my", `${py * 100}%`);
    };
    const onLeave = () => { node.style.transform = ""; };
    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    return () => { node.removeEventListener("mousemove", onMove); node.removeEventListener("mouseleave", onLeave); };
  }, [max]);
  return ref;
}

function TiltCard({ children, className = "", tilt = 6 }) {
  const ref = useTilt(tilt);
  return <div ref={ref} className={`pg-glass pg-tilt ${className}`}>{children}</div>;
}

/* ================================================================== */
/*  Section index — the page's structural signature                   */
/* ================================================================== */
function SectionIndex({ n, label }) {
  return (
    <div className="pg-index">
      <span className="pg-index-num">{String(n).padStart(2, "0")}</span>
      <span className="pg-index-line" />
      <span className="pg-index-label">{label}</span>
    </div>
  );
}

/* ================================================================== */
/*  Signature diagram — the "two ways to play" convergence graphic     */
/* ================================================================== */
function DualPathDiagram() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setOn(true); io.unobserve(node); } }), { threshold: 0.4 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`pg-diagram ${on ? "pg-diagram-on" : ""}`}>
      <svg viewBox="0 0 420 300" width="100%" height="100%">
        <defs>
          <linearGradient id="dpPurple" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B2FE0" />
            <stop offset="100%" stopColor="#C9A6FF" />
          </linearGradient>
          <linearGradient id="dpGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C98A16" />
            <stop offset="100%" stopColor="#F7C948" />
          </linearGradient>
        </defs>
        <path className="pg-diagram-path pg-diagram-path-a" d="M20 70 C 160 70, 200 150, 320 150" fill="none" stroke="url(#dpPurple)" strokeWidth="2.5" strokeLinecap="round" />
        <path className="pg-diagram-path pg-diagram-path-b" d="M20 230 C 160 230, 200 150, 320 150" fill="none" stroke="url(#dpGold)" strokeWidth="2.5" strokeLinecap="round" />
        <circle className="pg-diagram-dot" cx="20" cy="70" r="7" fill="#C9A6FF" />
        <circle className="pg-diagram-dot" cx="20" cy="230" r="7" fill="#F7C948" />
        <circle className="pg-diagram-node" cx="320" cy="150" r="34" fill="#0D0819" stroke="#8B2FE0" strokeWidth="2" />
        <circle className="pg-diagram-node-ring" cx="320" cy="150" r="34" fill="none" stroke="#C9A6FF" strokeWidth="1" opacity="0.4" />
      </svg>
      <div className="pg-diagram-label pg-diagram-label-a"><Dices size={15} /> Quick-play arcade</div>
      <div className="pg-diagram-label pg-diagram-label-b"><Gift size={15} /> Branded campaigns</div>
      <div className="pg-diagram-node-label">PromoGames<br /><span>engine</span></div>
    </div>
  );
}

/* ================================================================== */
/*  Content data                                                       */
/* ================================================================== */

const STORY = [
  { icon: Lightbulb, title: "Idea", text: "PromoGames started with two ideas that turned out to be one: people love quick games to kill a few minutes, and businesses need attention worth paying for. We set out to build a single platform for both." },
  { icon: Search, title: "Research", text: "We studied why casual games keep people coming back — short sessions, instant feedback, real stakes — and why most brand promotions don't. The gap between the two was the opportunity." },
  { icon: Code2, title: "Platform Development", text: "We built one game engine that works two ways: as a free-to-play arcade for anyone who wants a quick game, and as a white-label promo builder businesses can brand and run campaigns through." },
  { icon: Rocket, title: "Launch", text: "PromoGames launched with a growing library of casual games for everyday players, plus the campaign tools that let businesses turn any of those same games into a branded promotion." },
  { icon: RefreshCw, title: "Continuous Innovation", text: "We keep shipping new game formats, leaderboards, and reward mechanics, shaped by data from millions of casual play sessions and feedback from the businesses running campaigns on top of them." },
];

const OFFER_FEATURED = [
  { icon: Dices, tone: "purple", title: "Quick-Play Arcade", text: "A library of fast, addictive time-pass games anyone can jump into instantly — spin wheels, quizzes, puzzles, no account required to start playing." },
  { icon: Gift, tone: "gold", title: "Branded Promotional Games", text: "The same game engine, reskinned with your brand, prizes, and rules — built for real marketing campaigns businesses can launch in minutes." },
];
const OFFER_SMALL = [
  { icon: Layers, title: "Campaign Management", text: "Schedule and manage promotions from one dashboard." },
  { icon: Crown, title: "Leaderboards & Rewards", text: "Daily rankings that keep players coming back." },
  { icon: Gift, title: "Coupon Distribution", text: "Prizes delivered the instant someone wins." },
  { icon: BarChart3, title: "Performance Tracking", text: "Plays, win rates, and conversions in real time." },
];

const WHY = [
  { icon: ShieldCheck, title: "Secure Platform" },
  { icon: Wand2, title: "Easy Campaign Creation" },
  { icon: Smartphone, title: "Mobile Friendly" },
  { icon: Layers, title: "Fully Customizable" },
  { icon: LineChart, title: "Real-Time Analytics" },
  { icon: Zap, title: "Fast Performance" },
  { icon: Trophy, title: "Reward-Based Engagement" },
  { icon: Sparkles, title: "Premium User Experience" },
];

const VALUES = [
  { title: "Innovation", text: "We treat every game format — arcade or branded — as something worth testing, and we ship improvements continuously." },
  { title: "Transparency", text: "Businesses see exactly how campaigns perform, and players always know the odds and terms before they play." },
  { title: "Reliability", text: "Millions of quick-play sessions and live campaigns run on infrastructure built to stay online under real traffic spikes." },
  { title: "Customer Success", text: "We measure success by how much players enjoy playing and how well our customers' campaigns perform — not feature counts." },
];

const PROCESS = [
  { icon: Layers, title: "Create Campaign", text: "Pick a game and set your goal, budget, and audience." },
  { icon: Wand2, title: "Customize Game", text: "Brand the game and set the rewards." },
  { icon: Rocket, title: "Launch Promotion", text: "Publish across web, app, or social." },
  { icon: Users, title: "Engage Customers", text: "Players discover and play, right alongside the arcade." },
  { icon: BarChart3, title: "Track Analytics", text: "Watch plays and conversions update live." },
  { icon: Gift, title: "Reward Winners", text: "Prizes and coupons delivered automatically." },
];

const STATS = [
  { target: 1000, suffix: "+", label: "Campaigns Launched" },
  { target: 500, suffix: "K+", label: "Active Players" },
  { target: 12, suffix: "M+", label: "Game Sessions Played" },
  { target: 99.9, suffix: "%", label: "Platform Availability" },
];

const FAQS = [
  { q: "What is PromoGames?", a: "PromoGames is two things in one: a free arcade of quick, fun games anyone can play, and a platform businesses use to turn those same games into branded promotional campaigns with real rewards." },
  { q: "Is PromoGames just for businesses?", a: "No. Anyone can play the arcade games for fun and climb the leaderboards. Businesses additionally use the platform to run branded, reward-based promotional campaigns." },
  { q: "Who can run a promotional campaign?", a: "Any business that wants to promote a product, service, or event — from independent shops to large retail and e-commerce brands." },
  { q: "Are the games customizable?", a: "Yes. For campaigns, colors, branding, prizes, rules, and odds can all be customized. Arcade games are ready to play as-is." },
  { q: "Is coding required to build a campaign?", a: "No. Campaigns are built through a visual, no-code editor designed for marketing teams, not developers." },
  { q: "Is PromoGames mobile friendly?", a: "Every game — arcade or campaign — is designed mobile-first for a smooth experience on phones, tablets, and desktop." },
  { q: "How are winners rewarded?", a: "Winners receive their coupon, discount, or prize instantly through the game, delivered by email or on-screen code." },
  { q: "Can businesses track analytics?", a: "Yes. A real-time dashboard shows plays, participation rate, conversions, and redemptions for every campaign." },
  { q: "Is PromoGames secure?", a: "PromoGames uses secure infrastructure and fraud-prevention checks to protect campaign data, prizes, and player information." },
  { q: "How can I contact support?", a: "Our support team is reachable by phone or email, listed in the footer, and typically responds within one business day." },
];

function FaqItem({ item, index, open, onToggle }) {
  return (
    <div className={`pg-faq-item ${open ? "pg-faq-open" : ""}`}>
      <button className="pg-faq-q" onClick={onToggle} aria-expanded={open}>
        <span className="pg-faq-idx">{String(index + 1).padStart(2, "0")}</span>
        <span className="pg-faq-qtext">{item.q}</span>
        <ChevronDown className="pg-faq-chevron" size={18} />
      </button>
      <div className="pg-faq-a-wrap"><div className="pg-faq-a-inner"><p className="pg-faq-a">{item.a}</p></div></div>
    </div>
  );
}

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */

export default function PromoGamesAbout() {
  const [openFaq, setOpenFaq] = useState(0);
  const toggleFaq = useCallback((i) => setOpenFaq((c) => (c === i ? -1 : i)), []);

  const orgSchema = {
    "@context": "https://schema.org", "@type": "Organization", name: "PromoGames",
    slogan: "Quick Games. Real Rewards.", url: "https://www.promogames.com",
    description: "PromoGames is a quick-play games arcade and a promotional-gaming platform businesses use to run branded, reward-based marketing campaigns.",
  };
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="pg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .pg-root {
          --bg: #07040F;
          --surface: rgba(255,255,255,0.045);
          --surface-2: rgba(255,255,255,0.07);
          --border: rgba(255,255,255,0.09);
          --purple-300: #C9A6FF;
          --purple-400: #B166F5;
          --purple-500: #A855F7;
          --purple-600: #8B2FE0;
          --purple-700: #5B1899;
          --magenta: #E879F9;
          --gold: #F7C948;
          --gold-dim: #C98A16;
          --ink: #F3EEFD;
          --ink-soft: #B4A6D1;
          --ink-dim: #746890;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--ink);
          background: radial-gradient(ellipse 90% 60% at 50% -10%, #1B0F35 0%, var(--bg) 55%);
          position: relative;
          overflow: hidden;
        }
        .pg-root * { box-sizing: border-box; }
        .pg-display { font-family: 'Space Grotesk', 'Inter', sans-serif; letter-spacing: -0.01em; }
        .pg-mono { font-family: 'IBM Plex Mono', monospace; }

        .pg-blob { position:absolute; border-radius:50%; filter: blur(90px); z-index:0; pointer-events:none; animation: pgFloat 18s ease-in-out infinite; }
        @keyframes pgFloat { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-40px) scale(1.08); } 66% { transform: translate(-25px,25px) scale(0.94); } }
        .pg-noise { position:absolute; inset:0; z-index:0; pointer-events:none; opacity:0.3; mix-blend-mode:overlay; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 3px 3px; }

        .pg-btn { display:inline-flex; align-items:center; gap:8px; position:relative; overflow:hidden; padding: 13px 26px; border-radius: 999px; font-weight:600; font-size:15px; border:none; cursor:pointer; transition: transform .25s ease, box-shadow .25s ease; text-decoration:none; }
        .pg-btn:hover { transform: translateY(-3px); }
        .pg-btn:focus-visible { outline: 3px solid var(--purple-400); outline-offset: 2px; }
        .pg-btn::after { content:""; position:absolute; top:0; left:-60%; width:50%; height:100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent); transform: skewX(-20deg); transition: left .6s ease; }
        .pg-btn:hover::after { left: 130%; }
        .pg-btn-light { background: #fff; color: var(--purple-700); }
        .pg-btn-outline-light { background: transparent; color:#fff; border: 1.5px solid rgba(255,255,255,0.35); }

        .pg-glass { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; backdrop-filter: blur(16px); box-shadow: 0 8px 30px rgba(0,0,0,0.35); }
        .pg-tilt { position:relative; overflow:hidden; transition: transform .18s ease-out, border-color .3s ease; will-change: transform; }
        .pg-tilt::before { content:""; position:absolute; inset:0; z-index:0; opacity:0; transition: opacity .35s ease; background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(168,85,247,0.28), transparent 55%); }
        .pg-tilt:hover { border-color: rgba(168,85,247,0.4); }
        .pg-tilt:hover::before { opacity:1; }
        .pg-tilt > * { position:relative; z-index:1; }

        .pg-reveal { opacity:0; transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); }
        .pg-reveal-up { transform: translateY(28px); }
        .pg-reveal-left { transform: translateX(-36px); }
        .pg-reveal-right { transform: translateX(36px); }
        .pg-reveal-scale { transform: scale(0.94); }
        .pg-reveal-in { opacity:1; transform: translate(0,0) scale(1); }
        @media (prefers-reduced-motion: reduce) {
          .pg-reveal { opacity:1 !important; transform:none !important; transition:none !important; }
          .pg-blob, .pg-diagram-dot, .pg-diagram-node-ring { animation:none !important; }
        }

        .pg-section { position:relative; z-index:1; padding: 84px 6vw; max-width: 1180px; margin: 0 auto; }

        /* signature section index */
        .pg-index { display:flex; align-items:center; gap:14px; margin-bottom: 18px; }
        .pg-index-num { font-family:'IBM Plex Mono',monospace; font-size:13px; color: var(--purple-300); font-weight:600; }
        .pg-index-line { width:40px; height:1px; background: var(--border); }
        .pg-index-label { font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.14em; text-transform:uppercase; color: var(--ink-dim); }
        .pg-h2 { font-size: clamp(26px,3.2vw,38px); margin: 0 0 16px; line-height:1.15; font-weight:600; }
        .pg-h2 em { font-style:normal; color: var(--purple-300); }
        .pg-lead { color: var(--ink-soft); font-size:16px; line-height:1.8; }

        /* ---------- who we are + diagram ---------- */
        .pg-who-grid { display:grid; grid-template-columns: 1.15fr 0.85fr; gap: 50px; align-items:center; }
        @media (max-width: 900px) { .pg-who-grid { grid-template-columns: 1fr; } }
        .pg-diagram { position:relative; height: 280px; }
        .pg-diagram-path { stroke-dasharray: 420; stroke-dashoffset: 420; transition: stroke-dashoffset 1.4s ease; }
        .pg-diagram-on .pg-diagram-path { stroke-dashoffset: 0; }
        .pg-diagram-on .pg-diagram-path-b { transition-delay: .2s; }
        .pg-diagram-dot { filter: drop-shadow(0 0 6px currentColor); animation: pgPulseDot 2.4s ease-in-out infinite; }
        @keyframes pgPulseDot { 0%,100% { r:7; opacity:1; } 50% { r:9; opacity:0.7; } }
        .pg-diagram-node-ring { animation: pgRingGrow 2.6s ease-in-out infinite; transform-origin: 320px 150px; }
        @keyframes pgRingGrow { 0%,100% { r:34; opacity:0.4; } 50% { r:42; opacity:0; } }
        .pg-diagram-label { position:absolute; display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600; color: var(--ink-soft); background: rgba(13,8,25,0.7); padding:5px 12px; border-radius:999px; border:1px solid var(--border); }
        .pg-diagram-label-a { left: 0; top: 12%; color: var(--purple-300); }
        .pg-diagram-label-b { left: 0; bottom: 8%; color: var(--gold); }
        .pg-diagram-node-label { position:absolute; right: 4%; top: 50%; transform: translate(-50%,-50%); font-family:'Space Grotesk',sans-serif; font-size:12.5px; font-weight:600; text-align:center; line-height:1.3; color: var(--ink); }
        .pg-diagram-node-label span { display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; color: var(--ink-dim); text-transform:uppercase; letter-spacing:0.08em; }

        /* ---------- zigzag story timeline ---------- */
        .pg-story-line { position:relative; max-width: 900px; margin: 44px auto 0; }
        .pg-story-line::before { content:""; position:absolute; left:50%; top:0; bottom:0; width:2px; transform:translateX(-50%); background: linear-gradient(var(--purple-700), var(--magenta), var(--purple-700)); opacity:0.35; }
        @media (max-width: 760px) { .pg-story-line::before { left: 27px; } }
        .pg-story-item { position:relative; display:flex; margin-bottom: 40px; }
        .pg-story-item:last-child { margin-bottom:0; }
        .pg-story-item:nth-child(odd) { justify-content:flex-start; }
        .pg-story-item:nth-child(even) { justify-content:flex-end; }
        @media (max-width: 760px) { .pg-story-item, .pg-story-item:nth-child(even) { justify-content:flex-start; } }
        .pg-story-card { width: 44%; padding: 22px; }
        @media (max-width: 760px) { .pg-story-card { width: calc(100% - 56px); margin-left:56px; } }
        .pg-story-dot { position:absolute; left:50%; top: 18px; transform:translateX(-50%); width:14px; height:14px; border-radius:50%; background: var(--purple-400); box-shadow: 0 0 0 5px rgba(168,85,247,0.16), 0 0 14px rgba(168,85,247,0.8); z-index:2; }
        @media (max-width: 760px) { .pg-story-dot { left: 27px; } }
        .pg-story-icon { width:40px; height:40px; border-radius:12px; margin-bottom:12px; background: linear-gradient(135deg, var(--purple-500), var(--purple-700)); display:flex; align-items:center; justify-content:center; color:#fff; }
        .pg-story-title { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:16.5px; margin-bottom:6px; }
        .pg-story-text { color: var(--ink-soft); font-size:14px; line-height:1.7; }

        /* ---------- mission / vision — single split card ---------- */
        .pg-mv-card { display:grid; grid-template-columns:1fr 1fr; }
        @media (max-width:700px){ .pg-mv-card { grid-template-columns:1fr; } }
        .pg-mv-half { padding: 36px 34px; position:relative; }
        .pg-mv-half + .pg-mv-half { border-left: 1px solid var(--border); }
        @media (max-width:700px){ .pg-mv-half + .pg-mv-half { border-left:none; border-top:1px solid var(--border); } }
        .pg-mv-icon { color: var(--purple-400); margin-bottom:14px; }
        .pg-mv-label { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color: var(--purple-300); margin-bottom:12px; }
        .pg-mv-text { font-family:'Space Grotesk',sans-serif; font-size:19px; line-height:1.5; font-weight:500; color: var(--ink); }

        /* ---------- offer: bento ---------- */
        .pg-bento-top { display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top: 40px; }
        .pg-bento-bottom { display:grid; grid-template-columns: repeat(4,1fr); gap:16px; margin-top:16px; }
        @media (max-width: 900px) { .pg-bento-top { grid-template-columns:1fr; } .pg-bento-bottom { grid-template-columns: repeat(2,1fr); } }
        .pg-feature-lg { padding: 32px; }
        .pg-feature-lg-icon { width:52px; height:52px; border-radius:14px; margin-bottom:20px; display:flex; align-items:center; justify-content:center; }
        .pg-tone-purple .pg-feature-lg-icon { background: rgba(168,85,247,0.16); color: var(--purple-300); }
        .pg-tone-gold .pg-feature-lg-icon { background: rgba(247,201,72,0.16); color: var(--gold); }
        .pg-feature-lg-title { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:20px; margin-bottom:10px; }
        .pg-feature-lg-text { color: var(--ink-soft); font-size:14.5px; line-height:1.7; max-width: 360px; }
        .pg-feature-sm { padding: 22px; }
        .pg-feature-sm-icon { width:38px; height:38px; border-radius:11px; margin-bottom:14px; background: rgba(255,255,255,0.06); color: var(--purple-300); display:flex; align-items:center; justify-content:center; }
        .pg-feature-sm-title { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:14.5px; margin-bottom:6px; }
        .pg-feature-sm-text { color: var(--ink-dim); font-size:13px; line-height:1.6; }

        /* ---------- why: chip cloud ---------- */
        .pg-chip-cloud { display:flex; flex-wrap:wrap; gap:14px; margin-top: 36px; }
        .pg-chip { display:inline-flex; align-items:center; gap:10px; padding: 13px 22px; border-radius:999px; background: var(--surface); border:1px solid var(--border); font-size:14px; font-weight:500; transition: transform .25s ease, border-color .25s ease, background .25s ease; }
        .pg-chip:hover { transform: translateY(-4px); border-color: rgba(168,85,247,0.45); background: rgba(168,85,247,0.08); }
        .pg-chip svg { color: var(--purple-300); }
        .pg-chip:nth-child(2n) { transform: translateY(5px); }
        .pg-chip:nth-child(2n):hover { transform: translateY(1px); }
        .pg-chip:nth-child(3n) { transform: translateY(-4px); }
        .pg-chip:nth-child(3n):hover { transform: translateY(-9px); }

        /* ---------- values: editorial numbered list ---------- */
        .pg-value-row { display:grid; grid-template-columns: 100px 1fr; gap: 30px; padding: 30px 0; border-top: 1px solid var(--border); align-items:start; }
        .pg-value-row:last-child { border-bottom: 1px solid var(--border); }
        @media (max-width:640px) { .pg-value-row { grid-template-columns: 56px 1fr; gap:18px; } }
        .pg-value-num { font-family:'IBM Plex Mono',monospace; font-size:38px; font-weight:500; color: rgba(255,255,255,0.12); line-height:1; }
        .pg-value-body { display:flex; flex-wrap:wrap; gap: 8px 30px; align-items:baseline; }
        .pg-value-title { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:19px; min-width: 190px; }
        .pg-value-text { color: var(--ink-soft); font-size:14.5px; line-height:1.7; max-width:520px; flex:1; }

        /* ---------- process: connected flow ---------- */
        .pg-grid-process { display:grid; grid-template-columns: repeat(3,1fr); gap: 42px 40px; margin-top: 40px; }
        @media (max-width: 900px) { .pg-grid-process { grid-template-columns: repeat(2,1fr); gap: 34px 20px; } }
        @media (max-width: 560px) { .pg-grid-process { grid-template-columns: 1fr; } }
        .pg-process-card { padding: 24px; position:relative; }
        .pg-process-num { position:absolute; top:14px; right:18px; font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:12px; color: var(--ink-dim); }
        .pg-process-card:not(:nth-child(3n))::after {
          content: "→"; position:absolute; top:50%; right:-32px; transform: translateY(-50%);
          font-family:'IBM Plex Mono',monospace; font-size:18px; color: var(--purple-400); opacity:0.55;
        }
        @media (max-width: 900px) { .pg-process-card::after { display:none !important; } }
        .pg-feature-icon { width:42px; height:42px; border-radius:12px; margin-bottom:14px; background: rgba(168,85,247,0.14); color: var(--purple-300); display:flex; align-items:center; justify-content:center; }
        .pg-feature-title { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:15.5px; margin-bottom:6px; }
        .pg-feature-text { color: var(--ink-soft); font-size:13.5px; line-height:1.6; }

        /* ---------- stats: ticker strip ---------- */
        .pg-stats-section { background: linear-gradient(135deg, #2A1350, #150A2B); border: 1px solid var(--border); border-radius:24px; padding: 8px 6vw; position:relative; overflow:hidden; }
        .pg-stats-row { display:flex; position:relative; z-index:1; }
        .pg-stats-row > div { flex:1; text-align:center; padding: 40px 20px; }
        .pg-stats-row > div + div { border-left:1px solid rgba(255,255,255,0.1); }
        @media (max-width:700px) { .pg-stats-row { flex-wrap:wrap; } .pg-stats-row > div { flex: 1 1 50%; } .pg-stats-row > div:nth-child(2n+1) { border-left:none; } .pg-stats-row > div:nth-child(n+3) { border-top:1px solid rgba(255,255,255,0.1); } }
        .pg-counter { font-family:'IBM Plex Mono',monospace; font-size: clamp(26px,3.4vw,38px); font-weight:600; color:#fff; }
        .pg-stat-label { color: var(--ink-soft); font-size:12.5px; margin-top:8px; font-family:'IBM Plex Mono',monospace; letter-spacing:0.02em; }

        /* ---------- faq ---------- */
        .pg-faq-wrap { max-width: 760px; margin: 36px auto 0; }
        .pg-faq-item { border-bottom: 1px solid var(--border); }
        .pg-faq-q { width:100%; display:flex; align-items:center; gap: 18px; background:none; border:none; text-align:left; padding: 20px 4px; cursor:pointer; font-size:15px; font-weight:600; color: var(--ink); }
        .pg-faq-idx { font-family:'IBM Plex Mono',monospace; font-size:12.5px; color: var(--ink-dim); flex:none; width: 22px; }
        .pg-faq-qtext { flex:1; }
        .pg-faq-q:focus-visible { outline: 3px solid var(--purple-400); outline-offset: 2px; border-radius: 8px; }
        .pg-faq-chevron { transition: transform .3s ease; color: var(--purple-400); flex:none; }
        .pg-faq-open .pg-faq-chevron { transform: rotate(180deg); }
        .pg-faq-a-wrap { display:grid; grid-template-rows: 0fr; transition: grid-template-rows .35s ease; }
        .pg-faq-open .pg-faq-a-wrap { grid-template-rows: 1fr; }
        .pg-faq-a-inner { overflow:hidden; min-height:0; }
        .pg-faq-a { color: var(--ink-soft); font-size:14px; line-height:1.7; padding: 0 4px 20px 40px; margin:0; }

        /* ---------- final cta ---------- */
        .pg-cta { border-radius: 24px; padding: 60px 6vw; text-align:center; position:relative; overflow:hidden; background: linear-gradient(135deg, var(--purple-600), var(--magenta)); color:#fff; }
        .pg-cta-title { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size: clamp(24px,3.2vw,34px); margin-bottom:14px; }
        .pg-cta-sub { max-width:540px; margin:0 auto 28px; opacity:0.92; font-size:15px; line-height:1.7; }
        .pg-cta-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="pg-noise" />
      <div className="pg-blob" style={{ width: 460, height: 460, top: -140, left: -120, background: "#7C1FD1", opacity: 0.32 }} />
      <div className="pg-blob" style={{ width: 400, height: 400, top: 700, right: -160, background: "#8B2FE0", opacity: 0.22, animationDelay: "4s" }} />
      <div className="pg-blob" style={{ width: 340, height: 340, bottom: -120, left: "32%", background: "#F7C948", opacity: 0.09, animationDelay: "8s" }} />

      <main>
        {/* ============ WHO WE ARE ============ */}
        <section className="pg-section" id="who-we-are" aria-label="Who we are" style={{ paddingTop: 100 }}>
          <div className="pg-who-grid">
            <div>
              <Reveal><SectionIndex n={1} label="Who we are" /></Reveal>
              <Reveal delay={60}><h2 className="pg-h2 pg-display">One platform. <em>Two ways</em> to play.</h2></Reveal>
              <Reveal delay={120}>
                <div className="pg-lead">
                  <p style={{ marginBottom: 16 }}>
                    PromoGames is a gaming and promotional-marketing platform built around one
                    game engine used two ways. Anyone can drop into the free arcade for quick,
                    time-pass games — spin wheels, quizzes, puzzles, and more — and climb the
                    leaderboards. Businesses use that same engine to reskin and brand those games
                    into promotional campaigns with real rewards attached.
                  </p>
                  <p style={{ marginBottom: 16 }}>
                    We built PromoGames because casual games already hold attention that ads
                    can't, and because traditional promotions — banners, pop-ups, static coupons —
                    have stopped converting the way they used to.
                  </p>
                  <p>
                    What makes PromoGames different is that both sides run on the same
                    infrastructure — proven by daily arcade traffic, ready for any business to
                    brand on demand, without engineering support.
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal variant="scale" delay={160}><DualPathDiagram /></Reveal>
          </div>
        </section>

        {/* ============ OUR STORY ============ */}
        <section className="pg-section" aria-label="Our story">
          <Reveal><SectionIndex n={2} label="Our story" /></Reveal>
          <Reveal delay={60}><h2 className="pg-h2 pg-display">From idea to everyday platform</h2></Reveal>
          <div className="pg-story-line">
            {STORY.map((s, i) => (
              <div className="pg-story-item" key={s.title}>
                <div className="pg-story-dot" />
                <Reveal variant={i % 2 === 0 ? "left" : "right"} delay={i * 60}>
                  <TiltCard className="pg-story-card">
                    <div className="pg-story-icon"><s.icon size={18} /></div>
                    <div className="pg-story-title">{s.title}</div>
                    <p className="pg-story-text">{s.text}</p>
                  </TiltCard>
                </Reveal>
              </div>
            ))}
          </div>
        </section>

        {/* ============ MISSION & VISION ============ */}
        <section className="pg-section" aria-label="Mission and vision">
          <Reveal><SectionIndex n={3} label="Mission & vision" /></Reveal>
          <Reveal delay={80} variant="scale">
            <TiltCard className="pg-mv-card" tilt={3}>
              <div className="pg-mv-half">
                <Target className="pg-mv-icon" size={26} />
                <div className="pg-mv-label">Mission</div>
                <p className="pg-mv-text">To help businesses create meaningful customer engagement through innovative promotional games.</p>
              </div>
              <div className="pg-mv-half">
                <Eye className="pg-mv-icon" size={26} />
                <div className="pg-mv-label">Vision</div>
                <p className="pg-mv-text">To become the world's most trusted gamified marketing platform.</p>
              </div>
            </TiltCard>
          </Reveal>
        </section>

        {/* ============ WHAT WE OFFER ============ */}
        <section className="pg-section" id="offer" aria-label="What we offer">
          <Reveal><SectionIndex n={4} label="What we offer" /></Reveal>
          <Reveal delay={60}><h2 className="pg-h2 pg-display">Play for fun, or play as a promotion</h2></Reveal>
          <div className="pg-bento-top">
            {OFFER_FEATURED.map((f, i) => (
              <Reveal key={f.title} variant={i === 0 ? "left" : "right"} delay={i * 80}>
                <TiltCard className={`pg-feature-lg pg-tone-${f.tone}`}>
                  <div className="pg-feature-lg-icon"><f.icon size={24} /></div>
                  <div className="pg-feature-lg-title">{f.title}</div>
                  <p className="pg-feature-lg-text">{f.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <div className="pg-bento-bottom">
            {OFFER_SMALL.map((f, i) => (
              <Reveal key={f.title} variant="up" delay={i * 60}>
                <TiltCard className="pg-feature-sm">
                  <div className="pg-feature-sm-icon"><f.icon size={18} /></div>
                  <div className="pg-feature-sm-title">{f.title}</div>
                  <p className="pg-feature-sm-text">{f.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ WHY CHOOSE ============ */}
        <section className="pg-section" aria-label="Why choose PromoGames">
          <Reveal><SectionIndex n={5} label="Why choose us" /></Reveal>
          <Reveal delay={60}><h2 className="pg-h2 pg-display">Built to be trusted by players and businesses</h2></Reveal>
          <Reveal delay={120}>
            <div className="pg-chip-cloud">
              {WHY.map((w) => (
                <div className="pg-chip" key={w.title}><w.icon size={16} />{w.title}</div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============ VALUES ============ */}
        <section className="pg-section" aria-label="Our values">
          <Reveal><SectionIndex n={6} label="Our values" /></Reveal>
          <Reveal delay={60}><h2 className="pg-h2 pg-display">What guides how we build</h2></Reveal>
          <div style={{ marginTop: 30 }}>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div className="pg-value-row">
                  <div className="pg-value-num pg-mono">{String(i + 1).padStart(2, "0")}</div>
                  <div className="pg-value-body">
                    <div className="pg-value-title">{v.title}</div>
                    <p className="pg-value-text">{v.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ PROCESS ============ */}
        <section className="pg-section" aria-label="Our process">
          <Reveal><SectionIndex n={7} label="Our process" /></Reveal>
          <Reveal delay={60}><h2 className="pg-h2 pg-display">How a campaign comes to life</h2></Reveal>
          <div className="pg-grid-process">
            {PROCESS.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <TiltCard className="pg-process-card">
                  <div className="pg-process-num pg-mono">{String(i + 1).padStart(2, "0")}</div>
                  <div className="pg-feature-icon"><p.icon size={19} /></div>
                  <div className="pg-feature-title">{p.title}</div>
                  <p className="pg-feature-text">{p.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ STATISTICS ============ */}
        <section className="pg-section" id="stats" aria-label="Platform statistics" style={{ paddingTop: 0 }}>
          <Reveal variant="scale">
            <div className="pg-stats-section">
              <div className="pg-blob" style={{ width: 260, height: 260, top: -80, right: -60, background: "#C084FC", opacity: 0.18 }} />
              <div className="pg-stats-row">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <Counter target={s.target} suffix={s.suffix} />
                    <div className="pg-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ============ FAQ ============ */}
        <section className="pg-section" id="faq" aria-label="Frequently asked questions">
          <Reveal><SectionIndex n={8} label="FAQ" /></Reveal>
          <Reveal delay={60}><h2 className="pg-h2 pg-display">Frequently asked questions</h2></Reveal>
          <Reveal delay={120}>
            <div className="pg-faq-wrap">
              {FAQS.map((item, i) => (
                <FaqItem key={item.q} item={item} index={i} open={openFaq === i} onToggle={() => toggleFaq(i)} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="pg-section" style={{ paddingTop: 0 }} id="contact" aria-label="Get started">
          <Reveal variant="scale">
            <div className="pg-cta">
              <div className="pg-blob" style={{ width: 240, height: 240, bottom: -80, left: -60, background: "#fff", opacity: 0.12 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 className="pg-cta-title">Ready to transform customer engagement?</h2>
                <p className="pg-cta-sub">Launch your first promotional game in minutes, or just start playing — either way, PromoGames makes it worth showing up.</p>
                <div className="pg-cta-actions">
                  <Link to="/business" className="pg-btn pg-btn-light">Start Now <ArrowRight size={18} /></Link>
                  <a href="#contact" className="pg-btn pg-btn-outline-light">Contact Us</a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}