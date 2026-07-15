import { useState, useEffect, useRef, useCallback } from "react";
import CountUp from "../components/CountUp";
import PlayerNavbar from "../components/PlayerNavbar";
import ArkanoidGame from "../components/ArkanoidGame";
import MascotCursor from "../components/MascotCursor";

import gsap from "gsap";

/* ─── INLINE SVG ICONS ────────────────────────────── */
const ICONS = {
  dice:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
  zap:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>',
  puzzle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h4a2 2 0 0 1 4 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1 0 4v2H2v-2a2 2 0 0 1 0-4V9a2 2 0 0 1 2-2z"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 21h8M12 17v4M6 3h12l-1 7a5 5 0 0 1-10 0L6 3zM6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3"/></svg>',
  gift:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 7h-3.2a3 3 0 1 0-4.8-3 3 3 0 1 0-4.8 3H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z"/><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 7v14"/></svg>',
  tap:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11V6a2 2 0 1 1 4 0M13 6a2 2 0 1 1 4 0v6M9 12V9a2 2 0 1 0-4 0v7a7 7 0 0 0 7 7h1a7 7 0 0 0 7-7v-3a2 2 0 1 0-4 0"/></svg>',
  blocks:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  pointer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/><path d="M9.12 12.88L4 4"/></svg>',
  star:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9-5.4-4.7 7.1-.6z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  starSolid: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9-5.4-4.7 7.1-.6z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  gamepad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 11h.01M18 13h.01"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .3 2 .5 3 .7a2 2 0 0 1 1.7 2z"/></svg>',
  mail:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v2a5 5 0 0 1 2-3z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 5.9a8.4 8.4 0 0 1-2.4.66 4.2 4.2 0 0 0 1.83-2.3 8.3 8.3 0 0 1-2.65 1 4.17 4.17 0 0 0-7.1 3.8A11.83 11.83 0 0 1 3.15 4.6a4.16 4.16 0 0 0 1.29 5.56 4.1 4.1 0 0 1-1.89-.52v.05a4.17 4.17 0 0 0 3.34 4.09 4.2 4.2 0 0 1-1.88.07 4.18 4.18 0 0 0 3.89 2.9A8.35 8.35 0 0 1 2 18.57a11.78 11.78 0 0 0 6.4 1.88c7.68 0 11.88-6.37 11.88-11.89l-.01-.54A8.5 8.5 0 0 0 22 5.9z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/></svg>',
  badgeCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.77 4 4 0 0 1 0 6.76 4 4 0 0 1-4.78 4.77 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>',
};

const SvgIcon = ({ name, size = 24, className = "", style = {} }) => (
  <span
    className={className}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0, ...style }}
    dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }}
  />
);

/* ─── DATA ─────────────────────────────────────────── */
const MARQUEE_TEXTS = [
  "Play Fast. Win Big.",
  "Every Game Is A Chance To Win.",
  "Compete. Score. Unlock Rewards.",
  "Turn Your Free Time Into Winning Time.",
  "Every Game Played Is A Treat You Give Yourself.",
];

const GAME_CATEGORIES = [
  { icon: <SvgIcon name="dice" size={40} />, label: "Spin & Win",    color: "#9210f6" },
  { icon: <SvgIcon name="zap" size={40} />, label: "Quick Reflex",  color: "#610497" },
  { icon: <SvgIcon name="blocks" size={40} />, label: "Puzzle Rush",   color: "#7C3AED" },
  { icon: <SvgIcon name="trophy" size={40} />, label: "Quiz Battle",   color: "#4F46E5" },
  { icon: <SvgIcon name="gift" size={40} />, label: "Lucky Drop",    color: "#9210f6" },
  { icon: <SvgIcon name="pointer" size={40} />, label: "Tap Challenge", color: "#610497" },
];

const HOW_STEPS = [
  { num: "01", icon: <SvgIcon name="gamepad" size={32} />, title: "Choose A Game",  desc: "Jump into fun quick games anytime, anywhere." },
  { num: "02", icon: <SvgIcon name="star" size={32} />, title: "Earn Points",    desc: "Score higher and move up the leaderboard with every play." },
  { num: "03", icon: <SvgIcon name="gift" size={32} />, title: "Unlock Rewards", desc: "Top players win exciting gifts, rewards, and exclusive surprises." },
];

const REWARD_TAGS = [
  "Real-Time Rewards", "monthly Winners", "Exclusive Gifts",
  "Bonus Unlocks", "Daily Surprises",
];

const REWARD_CARDS_DATA = [
  { icon: <SvgIcon name="zap" size={38} />, title: "Real-Time Rewards", desc: "Earn points and redeem rewards instantly — no waiting, no delays." },
  { icon: <SvgIcon name="trophy" size={38} />, title: "monthly Winners",    desc: "Top scorers every week get exclusive prizes and surprises." },
  { icon: <SvgIcon name="gift" size={38} />, title: "Exclusive Gifts",   desc: "Unlock curated gifts and offers only available to top players." },
  { icon: <SvgIcon name="dice" size={38} />, title: "Daily Surprises",   desc: "Log in every day for bonus drops, mystery rewards, and more." },
];

const WHY_POINTS = [
  "Quick games that are easy to play",
  "Real rewards for top players",
  "New challenges every day",
  "Compete with friends and players",
  "Instant fun anytime you play",
];

const STATS = [
  { val: "20+",   label: "Games Played"    },
  { val: "50+", label: "Rewards Claimed" },
  { val: "10+", label: "Daily Players"   },
  { val: "10+",  label: "Active Games"    },
];

const FOOTER_NAV = [
  ["Play Now", "/arcade"],
  ["Leaderboard", "/leaderboard"],
  ["Business", "/business"],
  ["Log In", "/login"],
];

const TESTIMONIALS = [
  {
    quote: "I jumped on during my lunch break and ended up winning a ₹500 voucher in the quiz battle. Never thought a 10-minute game could actually pay off!",
    name: "Arjun K.", handle: "Quiz Battle Champion", badge: "Quiz Battle", initials: "AK",
    grad: "linear-gradient(135deg,#9210f6,#610497)",
  },
  {
    quote: "The leaderboard is addictive. I check it every morning before work — seeing my name climb keeps me coming back for more every single day.",
    name: "Priya S.", handle: "Top 10 Player", badge: "Top 10", initials: "PS",
    grad: "linear-gradient(135deg,#7C3AED,#4F46E5)",
  },
  {
    quote: "Scratch cards on PromoGames are the best stress buster. Got an exclusive discount on my favourite brand — totally unexpected and so exciting!",
    name: "Rohit V.", handle: "Scratch Card Enthusiast", badge: "Scratch Cards", initials: "RV",
    grad: "linear-gradient(135deg,#610497,#9210f6)",
  },
  {
    quote: "My whole family plays spin and win together on weekends. It's become our little tradition — and we've won some great gifts along the way!",
    name: "Meera S.", handle: "Family Player", badge: "Spin & Win", initials: "MS",
    grad: "linear-gradient(135deg,#4F46E5,#7C3AED)",
  },
  {
    quote: "Fast games, real rewards, zero nonsense. PromoGames is the only platform that actually gives back. Won concert tickets last week — unreal!",
    name: "Kiran P.", handle: "Daily Player", badge: "Daily Player", initials: "KP",
    grad: "linear-gradient(135deg,#9210f6,#7C3AED)",
  },
  {
    quote: "I've tried every gaming app out there — nothing comes close to the reward system here. The surprises keep coming and I keep winning!",
    name: "Divya R.", handle: "monthly Winner", badge: "monthly Winner", initials: "DR",
    grad: "linear-gradient(135deg,#610497,#4F46E5)",
  },
];

const LB_MOCK = [
  { initials: "AK", name: "Arjun K.",  score: "48,200", pct: 100 },
  { initials: "PS", name: "Priya S.",  score: "44,750", pct: 93  },
  { initials: "RV", name: "Rohit V.",  score: "41,100", pct: 85  },
  { initials: "MS", name: "Meera S.",  score: "38,600", pct: 80  },
  { initials: "KP", name: "Kiran P.",  score: "35,900", pct: 74  },
];

const DUMMY_LEADERBOARD = [
  { name: "Arjun K.",      score: 48200, has_account: true  },
  { name: "Priya S.",      score: 44750, has_account: true  },
  { name: "Rohit V.",      score: 41100, has_account: false },
  { name: "Meera S.",      score: 38600, has_account: true  },
  { name: "Kiran P.",      score: 35900, has_account: false },
  { name: "Divya R.",      score: 32400, has_account: true  },
  { name: "Aman S.",       score: 29800, has_account: false },
  { name: "Neha G.",       score: 27100, has_account: true  },
  { name: "Rajesh M.",     score: 24500, has_account: false },
  { name: "Sneha T.",      score: 21800, has_account: true  },
];

/* ─── CSS ──────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07040f;
  --bg2:#0d0820;
  --purple:#9210f6;
  --purple2:#610497;
  --purple3:#7C3AED;
  --purple4:#4F46E5;
  --accent:#c040ff;
  --gold:#f5c842;
  --glass:rgba(255,255,255,0.05);
  --gb:rgba(255,255,255,0.10);
  --muted:rgba(255,255,255,0.52);
  --fh:'Bebas Neue',sans-serif;
  --fb:'DM Sans',sans-serif;
  --fm:'Space Mono',monospace;
}
html{scroll-behavior:smooth}
body{font-family:var(--fb);background:var(--bg);color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased;cursor:none;max-width:100vw}
img{display:block;max-width:100%}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--purple);border-radius:3px}

.scroll-bar{position:fixed;top:0;left:0;height:3px;z-index:9999;background:linear-gradient(90deg,var(--purple),var(--purple3),var(--gold));width:var(--scroll-pct,0%);transition:width .05s linear;box-shadow:0 0 12px var(--purple)}



/* BUTTONS */
.btn-primary{display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 32px;border-radius:100px;background:linear-gradient(90deg,var(--purple2),var(--purple));color:#fff;font-family:var(--fb);font-weight:700;font-size:15px;text-decoration:none;cursor:none;border:none;transition:opacity .2s,transform .2s}
.btn-primary:hover{opacity:.88;transform:translateY(-2px)}
.btn-ghost{display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 30px;border-radius:100px;border:1px solid rgba(255,255,255,0.22);color:#fff;font-family:var(--fb);font-weight:600;font-size:15px;text-decoration:none;cursor:none;background:rgba(255,255,255,0.04);transition:background .2s,border-color .2s,transform .2s}
.btn-ghost:hover{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.4);transform:translateY(-2px)}

.section-kicker{font-family:var(--fm);font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.section-h2{font-family:var(--fh);font-size:clamp(36px,5vw,72px);font-weight:400;letter-spacing:2px;line-height:1.0;margin-bottom:14px}
.section-sub{font-family:var(--fb);font-size:16px;color:var(--muted);line-height:1.75;max-width:560px}

@keyframes shimmerSweep{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(146,16,246,0)}50%{box-shadow:0 0 28px 6px rgba(146,16,246,0.35)}}
@keyframes marqueeScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes mascotBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes rankPop{from{opacity:0;transform:scale(0.6) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}

/* HERO */
#home{width:100%;min-height:100svh;padding:120px 6% 70px;display:flex;align-items:center;position:relative;overflow:hidden;background:radial-gradient(ellipse 90% 60% at 50% -10%,rgba(146,16,246,0.22) 0%,transparent 65%),radial-gradient(ellipse 50% 40% at 85% 60%,rgba(97,4,151,0.14) 0%,transparent 60%),var(--bg)}
.hero-mascot-wrap{flex:1;display:flex;align-items:center;justify-content:flex-end;margin-right:-6%;animation:fadeUp .6s .2s ease both}
.hero-mascot-img{width:100%;max-width:800px;height:auto;filter:drop-shadow(0 8px 32px rgba(146,16,246,0.3))}
.hero-inner{width:100%;max-width:1440px;margin:0 auto;display:flex;align-items:center;gap:40px}
.hero-left{flex:1;min-width:0}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 16px;border-radius:100px;background:rgba(146,16,246,0.12);border:1px solid rgba(146,16,246,0.30);font-family:var(--fm);font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--accent);margin-bottom:32px;animation:fadeUp .6s ease both}
.hero-h1{font-family:'Inter',var(--fh);font-size:clamp(52px,7.5vw,110px);font-weight:900;letter-spacing:-0.03em;line-height:1;margin-bottom:32px;animation:fadeUp .6s .1s ease both}
.hero-h1 .glitch-line{
  color:rgba(150,150,150,0.2);
  background:linear-gradient(to right,#4a4a4a,#7a7a7a);
  background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-repeat:no-repeat;background-size:0% 100%;
  border-bottom:none;
  display:block;position:relative;cursor:pointer;overflow:hidden;
  white-space:nowrap;transform:scale(0.95);opacity:0.7;
  padding:0;margin-bottom:8px;transition:opacity .5s ease,transform .5s ease;
  line-height:1.05;
}
.hero-h1 .glitch-line.accent{
  background:linear-gradient(90deg,var(--purple),var(--accent),var(--gold));
  background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-h1 .glitch-line.accent .overlay{
  background:linear-gradient(90deg,var(--purple),var(--accent),var(--gold));
  background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-h1 .glitch-line .overlay{
  position:absolute;width:100%;height:100%;top:0;left:0;
  font-weight:900;display:flex;align-items:center;
  background-color:transparent;
  color:rgba(255,255,255,0.9);-webkit-text-fill-color:rgba(255,255,255,0.9);
  clip-path:polygon(0 50%,100% 50%,100% 50%,0 50%);
  transition:clip-path .4s cubic-bezier(0.25,0.46,0.45,0.94);
  pointer-events:none;overflow:hidden;white-space:nowrap;
  letter-spacing:0.0em;padding:0;
}
.hero-h1 .glitch-line:hover{background:none;-webkit-text-fill-color:transparent;border-bottom-color:transparent}
.hero-h1 .glitch-line:hover .overlay{clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}
.hero-sub{font-family:var(--fb);font-size:17px;color:var(--muted);line-height:1.75;max-width:460px;margin-bottom:36px;animation:fadeUp .6s .18s ease both}
.hero-actions{display:flex;align-items:center;gap:14px;margin-bottom:44px;flex-wrap:wrap;animation:fadeUp .6s .26s ease both}
.hero-stats{display:flex;gap:0;animation:fadeUp .6s .34s ease both}
.hst{padding:0 28px;display:flex;flex-direction:column;gap:4px}
.hst:not(:last-child){border-right:1px solid rgba(255,255,255,0.10)}
.hst:first-child{padding-left:0}
.hst-n{font-family:var(--fh);font-size:clamp(22px,2.4vw,32px);font-weight:400;letter-spacing:1px;line-height:1;background:linear-gradient(90deg,#fff,rgba(255,255,255,0.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hst-l{font-family:var(--fb);font-size:11px;color:var(--muted);letter-spacing:.3px}
/* HERO GAMES — card right + avatar left on hover */
.hero-games{position:relative;width:480px;flex-shrink:0;margin-left:auto;animation:fadeUp .6s .2s ease both}
.hero-games-title{font-family:var(--fm);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:16px;display:flex;align-items:center;gap:8px;width:100%}
.hero-games-title::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.08)}
.hero-games-area{display:flex;align-items:center;gap:20px;position:relative;justify-content:flex-end}

/* Avatar list — arc around left side of cards */
.hero-game-avatars{
  position:absolute;top:0;left:0;
  width:100%;height:100%;
  pointer-events:none;z-index:5;
  opacity:0;
  transition:opacity .3s ease;
}
.hero-fan-layout:hover .hero-game-avatars{opacity:1}
.hero-game-avatar{
  position:absolute;
  width:48px;height:48px;border-radius:50%;overflow:hidden;
  border:2px solid rgba(255,255,255,0.12);cursor:pointer;
  transition:border-color .3s,box-shadow .3s,opacity .4s ease,transform .4s ease;
  background:rgba(10,5,20,0.95);
  pointer-events:auto;
  margin-left:-24px;margin-top:-24px;
  box-shadow:0 4px 20px rgba(0,0,0,0.4);
  opacity:0;transform:scale(0.5);
}
.hero-fan-layout:hover .hero-game-avatar{opacity:1;transform:scale(1)}
.hero-game-avatar:hover{border-color:var(--purple);box-shadow:0 0 16px rgba(146,16,246,0.4)}
.hero-game-avatar.active{border-color:var(--purple);box-shadow:0 0 20px rgba(146,16,246,0.5)}
.hero-game-avatar img{width:100%;height:100%;object-fit:cover}
.hero-game-avatar-placeholder{
  width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  font-size:18px;
}

/* Card — right side */
.hero-fan-layout{position:relative;display:flex;justify-content:flex-end;align-items:center;width:380px;height:380px;overflow:visible}
.hero-fan-card{
  width:250px;height:320px;
  border-radius:16px;padding:14px;
  display:flex;flex-direction:column;
  background:rgba(10,5,20,0.95);
  border:1px solid rgba(255,255,255,0.08);
  text-decoration:none;color:#fff;
  overflow:hidden;
  box-shadow:0 8px 32px rgba(0,0,0,0.35);
  border-color:rgba(146,16,246,0.5);
  box-shadow:0 16px 48px rgba(0,0,0,0.4),0 0 32px rgba(146,16,246,0.12);
}
.hero-fan-card.hgf-preview{
  border-color:rgba(146,16,246,0.7);
  box-shadow:0 16px 48px rgba(0,0,0,0.4),0 0 40px rgba(146,16,246,0.2);
}
.hgf-thumb{width:100%;flex:1;border-radius:10px;object-fit:cover;background:linear-gradient(135deg,rgba(146,16,246,0.25),rgba(97,4,151,0.15));margin-bottom:10px}
.hgf-thumb-placeholder{width:100%;flex:1;border-radius:10px;background:linear-gradient(135deg,rgba(146,16,246,0.2),rgba(97,4,151,0.12));display:flex;align-items:center;justify-content:center}
.hgf-bottom{display:flex;align-items:center;justify-content:space-between;gap:6px}
.hgf-info{flex:1;min-width:0}
.hgf-name{font-family:var(--fb);font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.hgf-meta{font-family:var(--fm);font-size:9px;color:var(--muted);display:flex;align-items:center;gap:4px;margin-top:2px}
.hgf-plays-dot{width:3px;height:3px;border-radius:50%;background:var(--purple)}
.hgf-badge{padding:3px 8px;border-radius:100px;font-family:var(--fm);font-size:8px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;background:rgba(146,16,246,0.2);border:1px solid rgba(146,16,246,0.35);color:var(--accent);flex-shrink:0}
.hg-loader{display:flex;align-items:center;justify-content:center;height:260px;gap:10px;color:var(--muted);font-family:var(--fb);font-size:13px}
.hg-spinner{width:16px;height:16px;border:2px solid rgba(146,16,246,0.2);border-top-color:var(--purple);border-radius:50%;animation:spin .7s linear infinite}

/* MARQUEE */
.marquee-strip{padding:20px 0;overflow:hidden;position:relative;background:rgba(146,16,246,0.08);border-top:1px solid rgba(146,16,246,0.18);border-bottom:1px solid rgba(146,16,246,0.18)}
.marquee-strip::before,.marquee-strip::after{content:'';position:absolute;top:0;bottom:0;width:100px;z-index:2;pointer-events:none}
.marquee-strip::before{left:0;background:linear-gradient(to right,var(--bg),transparent)}
.marquee-strip::after{right:0;background:linear-gradient(to left,var(--bg),transparent)}
.marquee-track{display:flex;animation:marqueeScroll 30s linear infinite;width:max-content}
.marquee-track:hover{animation-play-state:paused}
.marquee-item{display:inline-flex;align-items:center;gap:16px;padding:0 32px;font-family:var(--fh);font-size:20px;letter-spacing:2px;color:rgba(255,255,255,0.38);white-space:nowrap}
.marquee-item .dot{width:6px;height:6px;border-radius:50%;background:var(--purple);flex-shrink:0}

/* STICKY MASCOT — sticks inside ranked section, unsticks when scrolling past */
.rg-section{position:relative}
.rg-sticky-mascot{
  position:fixed;right:3%;bottom:15%;width:120px;z-index:50;
  pointer-events:none;display:flex;flex-direction:column;align-items:center;
  opacity:0;transform:translateY(20px);transition:opacity .4s ease,transform .4s ease;
}
.rg-sticky-mascot.visible{opacity:1;transform:translateY(0)}
.rg-sticky-mascot img{width:100%;height:auto;display:block;filter:drop-shadow(0 4px 16px rgba(146,16,246,0.35));animation:floatY 4s ease-in-out infinite}
.rg-mascot-bubble{
  position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
  min-width:140px;max-width:190px;padding:8px 12px;
  background:rgba(20,8,40,0.92);border:1px solid rgba(146,16,246,0.35);border-radius:12px;
  font-family:'DM Sans',sans-serif;font-size:11px;line-height:1.45;color:#e0d0ff;text-align:center;
  box-shadow:0 4px 18px rgba(0,0,0,0.45),0 0 10px rgba(146,16,246,0.15);
  opacity:0;transform:translateX(-50%) translateY(5px) scale(0.92);
  transition:opacity .3s ease,transform .3s ease;white-space:nowrap;z-index:20;
}
.rg-mascot-bubble.show{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}
.rg-mascot-bubble::after{
  content:'';position:absolute;bottom:-5px;left:50%;margin-left:-4px;
  width:8px;height:8px;background:rgba(20,8,40,0.92);
  border-right:1px solid rgba(146,16,246,0.35);border-bottom:1px solid rgba(146,16,246,0.35);
  transform:rotate(45deg);
}

/* TOP GAMES THIS WEEK */
.rg-section{padding:70px 6% 60px;position:relative;overflow:hidden}
.rg-section::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(146,16,246,0.4),transparent)}
.rg-kicker{font-family:var(--fm);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--purple);margin-bottom:10px}
.rg-heading{font-family:var(--fh);font-size:clamp(22px,3vw,40px);font-weight:400;line-height:1.15;letter-spacing:-0.01em;margin-bottom:8px}
.rg-sub{font-family:var(--fb);font-size:14px;color:var(--muted);margin-bottom:40px}
.rg-track{display:flex;gap:0;align-items:flex-end;overflow-x:auto;padding-bottom:12px;scrollbar-width:none}
.rg-track::-webkit-scrollbar{display:none}
.rg-item{position:relative;flex-shrink:0;cursor:pointer;transition:transform .32s cubic-bezier(.22,1,.36,1)}
.rg-item:hover{transform:scale(1.04) translateY(-6px);z-index:10}
.rg-rank{position:absolute;left:-10px;top:-18px;font-family:var(--fh);font-size:clamp(60px,7vw,100px);font-weight:400;line-height:1;color:transparent;-webkit-text-stroke:2px rgba(227,227,227,0.45);user-select:none;z-index:20;pointer-events:none;transition:color .3s,-webkit-text-stroke .3s}
.rg-item:hover .rg-rank{-webkit-text-stroke:2px rgba(146,16,246,0.85);text-shadow:0 0 40px rgba(146,16,246,0.3)}
.rg-card{width:210px;height:290px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);position:relative;transition:border-color .3s,box-shadow .3s}
.rg-item:hover .rg-card{border-color:rgba(146,16,246,0.5);box-shadow:0 16px 48px rgba(146,16,246,0.18),0 0 0 1px rgba(146,16,246,0.2)}
.rg-card-img{width:100%;height:65%;object-fit:cover;display:block;transition:transform .4s}
.rg-item:hover .rg-card-img{transform:scale(1.08)}
.rg-card-body{position:absolute;bottom:0;left:0;right:0;padding:10px 12px 12px;background:linear-gradient(to top,rgba(10,5,20,0.97) 0%,rgba(10,5,20,0.6) 60%,transparent 100%)}
.rg-card-name{font-family:var(--fb);font-size:12.5px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rg-card-plays{font-family:var(--fb);font-size:10px;color:var(--muted);display:flex;align-items:center;gap:4px}
.rg-card-badge{position:absolute;top:8px;right:8px;background:rgba(146,16,246,0.7);border:1px solid rgba(146,16,246,0.5);backdrop-filter:blur(8px);padding:3px 8px;border-radius:100px;font-family:var(--fb);font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#fff}
.rg-card-overlay{position:absolute;inset:0;background:rgba(146,16,246,0.12);opacity:0;transition:opacity .3s;display:flex;align-items:center;justify-content:center;border-radius:14px}
.rg-item:hover .rg-card-overlay{opacity:1}
.rg-play-btn{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;transform:scale(0);transition:transform .3s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 16px rgba(146,16,246,0.3)}
.rg-item:hover .rg-play-btn{transform:scale(1)}
@keyframes rgSlideIn{from{opacity:0;transform:translateY(30px) scale(0.92)}to{opacity:1;transform:translateY(0) scale(1)}}
.rg-item{animation:rgSlideIn .5s cubic-bezier(.22,1,.36,1) both}

/* FEATURED GAMES */
#featured{padding:100px 6%;position:relative;overflow:hidden}
#featured::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(146,16,246,0.4),transparent)}
.featured-head{max-width:1440px;margin:0 auto 56px;display:flex;align-items:flex-end;justify-content:space-between;gap:32px}
.featured-head-sub{font-family:var(--fb);font-size:15px;color:var(--muted);max-width:380px;line-height:1.75;text-align:right}
.game-grid{max-width:1440px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.game-cat-card{padding:32px 28px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);cursor:none;transition:background .25s,border-color .25s,transform .25s;position:relative;overflow:hidden}
.game-cat-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.04),transparent);background-size:200% 100%;animation:shimmerSweep 4s ease-in-out infinite;pointer-events:none}
.game-cat-card:hover{background:rgba(146,16,246,0.10);border-color:rgba(146,16,246,0.4);transform:translateY(-4px)}
.game-cat-icon{font-size:40px;margin-bottom:16px;display:block}
.game-cat-label{font-family:var(--fh);font-size:28px;letter-spacing:2px;color:#fff;margin-bottom:8px}
.game-cat-sub{font-family:var(--fb);font-size:13px;color:var(--muted)}
.game-cat-btn{margin-top:20px;display:inline-flex;align-items:center;gap:6px;font-family:var(--fb);font-size:12px;font-weight:700;color:var(--accent);letter-spacing:.5px}
.game-cat-btn svg{transition:transform .2s}
.game-cat-card:hover .game-cat-btn svg{transform:translateX(4px)}

/* HOW IT WORKS */
#how{padding:100px 6%;background:radial-gradient(ellipse 70% 50% at 50% 50%,rgba(146,16,246,0.07) 0%,transparent 70%)}
.how-inner{max-width:1440px;margin:0 auto}
.how-head{text-align:center;margin-bottom:64px}
.how-head .section-sub{margin:0 auto}
.how-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;position:relative}
.how-steps::before{content:'';position:absolute;top:52px;left:calc(16.6% + 40px);right:calc(16.6% + 40px);height:1px;background:linear-gradient(90deg,var(--purple),var(--purple3),var(--purple4));opacity:.35}
.how-step{display:flex;flex-direction:column;align-items:center;text-align:center;padding:40px 28px 36px;border-radius:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);position:relative;transition:border-color .25s,background .25s}
.how-step:hover{background:rgba(146,16,246,0.08);border-color:rgba(146,16,246,0.3)}
.how-num{font-family:var(--fm);font-size:10px;letter-spacing:3px;color:var(--accent);margin-bottom:16px}
.how-icon-wrap{width:80px;height:80px;border-radius:50%;background:rgba(146,16,246,0.12);border:1px solid rgba(146,16,246,0.25);display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:24px;animation:floatY 4s ease-in-out infinite}
.how-step:nth-child(2) .how-icon-wrap{animation-delay:.6s}
.how-step:nth-child(3) .how-icon-wrap{animation-delay:1.2s}
.how-title{font-family:var(--fh);font-size:26px;letter-spacing:2px;margin-bottom:10px}
.how-desc{font-family:var(--fb);font-size:14px;color:var(--muted);line-height:1.75}

/* LEADERBOARD */
#leaderboard-section{padding:100px 6%;overflow:hidden;position:relative}
#leaderboard-section::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(146,16,246,0.35),transparent)}
.lb-inner{max-width:1440px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.lb-left .section-sub{margin-bottom:20px}
.lb-tagline{font-family:var(--fm);font-size:12px;color:var(--accent);letter-spacing:1px;margin-top:16px}
.lb-board{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden}
.lb-header{padding:16px 22px;background:rgba(146,16,246,0.12);border-bottom:1px solid rgba(146,16,246,0.15);display:flex;align-items:center;gap:10px}
.lb-header-dot{width:8px;height:8px;border-radius:50%}
.lb-header-title{font-family:var(--fm);font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-left:4px}
.lb-row{display:flex;align-items:center;gap:14px;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,0.05);transition:background .2s}
.lb-row:last-child{border-bottom:none}
.lb-row:hover{background:rgba(146,16,246,0.06)}
.lb-pos{font-family:var(--fh);font-size:22px;letter-spacing:1px;width:32px;flex-shrink:0}
.lb-pos.gold{color:var(--gold)}
.lb-pos.silver{color:#c0c0c0}
.lb-pos.bronze{color:#cd7f32}
.lb-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--purple3));display:flex;align-items:center;justify-content:center;font-family:var(--fb);font-size:13px;font-weight:700;flex-shrink:0}
.lb-name{flex:1;font-family:var(--fb);font-size:14px;font-weight:600}
.lb-score{font-family:var(--fm);font-size:12px;color:var(--accent)}
.lb-bar-wrap{width:80px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden}
.lb-bar{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--purple),var(--accent))}

/* ═══════════════════════════════════════════════
   REWARDS CAROUSEL  (replaces old static grid)
═══════════════════════════════════════════════ */
#rewards{padding:100px 6%;background:radial-gradient(ellipse 80% 60% at 50% 100%,rgba(146,16,246,0.10) 0%,transparent 70%)}
.rewards-inner{max-width:1440px;margin:0 auto;text-align:center}
.rewards-inner .section-sub{margin:0 auto 48px}

.reward-tags-wrap{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin-bottom:64px}
.reward-tag{padding:12px 26px;border-radius:100px;background:rgba(146,16,246,0.10);border:1px solid rgba(146,16,246,0.24);font-family:var(--fb);font-size:14px;font-weight:600;color:#fff;cursor:none;transition:background .2s,transform .2s,border-color .2s}
.reward-tag:hover{background:rgba(146,16,246,0.22);border-color:rgba(146,16,246,0.5);transform:translateY(-3px)}
.reward-tag.rw-active{background:rgba(146,16,246,0.28);border-color:rgba(146,16,246,0.65);transform:translateY(-3px)}

/* Carousel stage */
.rwc-wrap{position:relative;width:100%;height:280px;margin-bottom:36px}
.rwc-track{position:relative;width:100%;height:100%}

.rwc-card{
  position:absolute;top:0;left:50%;
  width:300px;margin-left:-150px;
  height:256px;
  border-radius:20px;
  padding:34px 30px;
  display:flex;flex-direction:column;gap:12px;
  transition:all 0.55s cubic-bezier(.22,1,.36,1);
  will-change:transform,opacity;
  cursor:none;
}
.rwc-card[data-pos="center"]{
  transform:translateX(0) scale(1);
  opacity:1;z-index:10;
  background:rgba(146,16,246,0.14);
  border:1.5px solid rgba(146,16,246,0.50);
  box-shadow:0 0 60px rgba(146,16,246,0.18);
  cursor:default;
}
.rwc-card[data-pos="right1"]{transform:translateX(280px) scale(0.85);opacity:0.55;z-index:6;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)}
.rwc-card[data-pos="right2"]{transform:translateX(500px) scale(0.72);opacity:0.22;z-index:4;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)}
.rwc-card[data-pos="left1"]{transform:translateX(-280px) scale(0.85);opacity:0.55;z-index:6;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)}
.rwc-card[data-pos="left2"]{transform:translateX(-500px) scale(0.72);opacity:0.22;z-index:4;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)}
.rwc-card[data-pos="hiddenright"]{transform:translateX(800px) scale(0.6);opacity:0;z-index:1;pointer-events:none}
.rwc-card[data-pos="hiddenleft"]{transform:translateX(-800px) scale(0.6);opacity:0;z-index:1;pointer-events:none}

.rwc-card-icon{font-size:38px;line-height:1;display:block}
.rwc-card-title{font-family:var(--fh);font-size:28px;letter-spacing:2px;color:#fff;line-height:1.05}
.rwc-card-desc{font-family:var(--fb);font-size:13.5px;color:rgba(255,255,255,0.58);line-height:1.75;flex:1}
.rwc-card-bar{height:2px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden;margin-top:auto}
.rwc-card-progress{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--purple2),var(--accent));width:0%;transition:none}
.rwc-card-progress.running{width:100%;transition:width 3s linear}

/* Nav */
.rwc-nav{display:flex;align-items:center;justify-content:center;gap:16px}
.rwc-btn{width:44px;height:44px;border-radius:50%;border:1px solid rgba(146,16,246,0.35);background:rgba(7,4,15,0.90);display:flex;align-items:center;justify-content:center;cursor:none;transition:background .2s,border-color .2s,transform .2s;color:#fff;font-size:22px;font-weight:300;user-select:none;flex-shrink:0}
.rwc-btn:hover{background:rgba(146,16,246,0.25);border-color:rgba(146,16,246,0.65);transform:scale(1.06)}
.rwc-dots{display:flex;gap:8px;align-items:center}
.rwc-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.18);border:none;padding:0;cursor:pointer;transition:background .25s,transform .25s}
.rwc-dot.active{background:var(--purple);transform:scale(1.4)}

/* WHY PLAY */
#why{padding:100px 6%;position:relative}
#why::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(146,16,246,0.35),transparent)}
.why-inner{max-width:1440px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.why-points{display:flex;flex-direction:column;gap:14px;margin-top:32px}
.why-point{display:flex;align-items:center;gap:16px;padding:18px 22px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);transition:background .22s,border-color .22s,transform .22s}
.why-point:hover{background:rgba(146,16,246,0.08);border-color:rgba(146,16,246,0.28);transform:translateX(6px)}
.why-check{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--purple2),var(--purple));display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.why-text{font-family:var(--fb);font-size:15px;font-weight:500}
.why-visual{position:relative;display:flex;align-items:center;justify-content:center}
.why-orb{width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(146,16,246,0.18) 0%,rgba(97,4,151,0.08) 50%,transparent 70%);border:1px solid rgba(146,16,246,0.15);display:flex;align-items:center;justify-content:center;animation:pulseGlow 3s ease-in-out infinite}
.why-orb-inner{text-align:center}
.why-orb-emoji{font-size:72px;margin-bottom:12px;animation:floatY 3s ease-in-out infinite}
.why-orb-text{font-family:var(--fh);font-size:22px;letter-spacing:2px;color:rgba(255,255,255,0.7)}
/* REELS CAROUSEL */
.reels-wrap{width:100%;max-width:400px;height:520px;border-radius:20px;overflow:hidden;position:relative;border:1px solid rgba(255,255,255,0.10);background:#0a0514}
.reels-track{position:relative;width:100%;height:100%}
.reel-card{position:absolute;inset:0;transition:transform .6s cubic-bezier(.22,1,.36,1),opacity .6s;will-change:transform,opacity}
.reel-card video{width:100%;height:100%;object-fit:cover;display:block}
.reel-overlay{position:absolute;bottom:0;left:0;right:0;padding:40px 20px 24px;background:linear-gradient(transparent,rgba(0,0,0,0.85))}
.reel-overlay p{font-family:var(--fb);font-size:14px;font-weight:600;color:#fff}
.reel-overlay span{font-family:var(--fb);font-size:11px;color:var(--muted)}
.reel-nav{position:absolute;right:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:10}
.reel-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.35);transition:background .3s,height .3s;border:none;padding:0;cursor:pointer}
.reel-dot.active{background:var(--purple);height:18px;border-radius:3px}

/* TESTIMONIALS */
#testimonials{padding:140px 6% 100px;position:relative;overflow:hidden;background:radial-gradient(ellipse 70% 50% at 50% 50%,rgba(146,16,246,0.08) 0%,transparent 70%)}
#testimonials::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(146,16,246,0.35),transparent)}
.testimonials-inner{max-width:1440px;margin:0 auto}
.testimonials-head{text-align:center;margin-bottom:80px}
.testimonials-head .section-sub{margin:0 auto}
.tcarousel-wrap{position:relative;display:flex;align-items:center;justify-content:center;height:300px}
.tcarousel-track{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.tc-card{position:absolute;width:340px;border-radius:20px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.04);padding:28px 26px 24px;display:flex;flex-direction:column;gap:14px;cursor:pointer;transition:all 0.45s cubic-bezier(.22,1,.36,1);will-change:transform,opacity}
.tc-card[data-pos="center"]{transform:translateX(0) scale(1);z-index:10;opacity:1;background:rgba(146,16,246,0.13);border-color:rgba(146,16,246,0.45);box-shadow:0 0 48px rgba(146,16,246,0.18);cursor:default}
.tc-card[data-pos="right1"]{transform:translateX(300px) scale(0.88);z-index:6;opacity:0.65}
.tc-card[data-pos="right2"]{transform:translateX(540px) scale(0.76);z-index:4;opacity:0.32}
.tc-card[data-pos="left1"]{transform:translateX(-300px) scale(0.88);z-index:6;opacity:0.65}
.tc-card[data-pos="left2"]{transform:translateX(-540px) scale(0.76);z-index:4;opacity:0.32}
.tc-card[data-pos="hiddenleft"]{transform:translateX(-800px) scale(0.6);z-index:1;opacity:0;pointer-events:none}
.tc-card[data-pos="hiddenright"]{transform:translateX(800px) scale(0.6);z-index:1;opacity:0;pointer-events:none}
.tc-stars{display:flex;gap:3px}
.tc-star{color:var(--gold);font-size:14px;line-height:1}
.tc-quote{font-family:var(--fb);font-size:13.5px;line-height:1.78;color:rgba(255,255,255,0.82);font-style:italic;flex:1}
.tc-divider{height:1px;background:rgba(255,255,255,0.08)}
.tc-author{display:flex;align-items:center;gap:12px}
.tc-avatar{width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--fb);font-size:13px;font-weight:700;color:#fff}
.tc-info{flex:1}
.tc-name{font-family:var(--fb);font-size:14px;font-weight:700;color:#fff}
.tc-handle{font-family:var(--fm);font-size:10px;color:var(--muted);margin-top:2px}
.tc-badge{padding:3px 10px;border-radius:100px;font-family:var(--fm);font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:rgba(146,16,246,0.18);border:1px solid rgba(146,16,246,0.32);color:var(--accent);flex-shrink:0;white-space:nowrap}
.tc-nav{position:absolute;top:50%;z-index:20;width:46px;height:46px;border-radius:50%;border:1px solid rgba(146,16,246,0.35);background:rgba(7,4,15,0.90);display:flex;align-items:center;justify-content:center;cursor:none;transition:background .2s,border-color .2s,transform .2s;color:#fff;font-size:22px;font-weight:300;transform:translateY(-50%);user-select:none}
.tc-nav:hover{background:rgba(146,16,246,0.25);border-color:rgba(146,16,246,0.65);transform:translateY(-50%) scale(1.06)}
.tc-prev{left:calc(50% - 230px)}
.tc-next{right:calc(50% - 230px)}
.tc-dots{display:flex;justify-content:center;gap:8px;margin-top:44px}
.tc-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.18);cursor:pointer;transition:background .25s,transform .25s,width .25s;border:none;padding:0}
.tc-dot.active{background:var(--purple);transform:scale(1.4)}

/* DAILY PLAY */
#daily{padding:80px 6%;background:linear-gradient(135deg,rgba(146,16,246,0.10) 0%,rgba(97,4,151,0.06) 50%,rgba(124,58,237,0.10) 100%);border-top:1px solid rgba(146,16,246,0.15);border-bottom:1px solid rgba(146,16,246,0.15)}
.daily-inner{max-width:900px;margin:0 auto;text-align:center}
.daily-inner .section-h2{font-size:clamp(42px,6vw,80px)}
.daily-inner .section-sub{margin:0 auto 36px;max-width:600px}

/* COMMUNITY */
#community{padding:100px 6%}
.community-inner{max-width:1440px;margin:0 auto;text-align:center;margin-bottom:64px}
.community-inner .section-sub{margin:0 auto}
.stats-grid{max-width:1440px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat-card{padding:36px 28px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);text-align:center;transition:border-color .25s,background .25s}
.stat-card:hover{background:rgba(146,16,246,0.08);border-color:rgba(146,16,246,0.3)}
.stat-val{font-family:var(--fh);font-size:clamp(36px,4vw,56px);letter-spacing:2px;background:linear-gradient(90deg,var(--purple),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:8px}
.stat-lbl{font-family:var(--fb);font-size:13px;color:var(--muted);font-weight:500;letter-spacing:.3px}

/* FINAL CTA */
#cta-final{padding:0;text-align:center;position:relative;overflow:hidden;background:transparent;min-height:80vh;display:flex;flex-direction:column;justify-content:stretch}
#cta-final::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(146,16,246,0.4),transparent)}
.cta-final-h2{font-family:var(--fh);font-size:clamp(52px,8vw,120px);letter-spacing:3px;line-height:.95;margin-bottom:20px}
.cta-final-h2 span{display:block;background:linear-gradient(90deg,var(--purple),var(--accent),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.cta-final-sub{font-family:var(--fb);font-size:17px;color:var(--muted);max-width:440px;margin:0 auto 44px;line-height:1.75}
.cta-final-actions{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap}

/* STACKING — section bg at 0, fly at 1, content at 2 */
section > *, .marquee-strip > *, footer > *{position:relative;z-index:2}
section::before,section::after,.marquee-strip::before,.marquee-strip::after,footer::before,footer::after{z-index:auto}
.marquee-strip,footer{position:relative}

/* FOOTER */
.footer{border-top:1px solid rgba(255,255,255,0.07)}
.footer-main{padding:60px 6%;display:grid;grid-template-columns:1.4fr 1fr 1.6fr;gap:40px;max-width:1440px;margin:0 auto}
.footer-brand-name{font-family:var(--fh);font-size:32px;letter-spacing:4px;margin-bottom:8px}
.footer-tagline{font-family:var(--fm);font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.footer-desc{font-family:var(--fb);font-size:14px;color:var(--muted);line-height:1.75;max-width:360px;margin-bottom:28px}
.socials{display:flex;gap:10px}
.soc{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid var(--gb);display:grid;place-items:center;color:#fff;font-family:var(--fb);font-size:12px;font-weight:700;text-decoration:none;transition:background .2s;cursor:none}
.soc:hover{background:rgba(146,16,246,0.25)}
.footer-links-title{font-family:var(--fm);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:20px}
.footer-links{display:flex;flex-direction:column;gap:12px}
.footer-links a{font-family:var(--fb);font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s;cursor:none}
.footer-links a:hover{color:#fff}
.footer-contact{display:flex;flex-direction:column;gap:10px;margin-top:28px}
.footer-contact a{font-family:var(--fb);font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s}
.footer-contact a:hover{color:#fff}
.footer-bar{border-top:1px solid rgba(255,255,255,0.07);padding:18px 6%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-family:var(--fm);font-size:11px;color:rgba(255,255,255,0.3);max-width:1440px;margin:0 auto;letter-spacing:.5px}
.footer-bar a{color:rgba(255,255,255,0.3);text-decoration:none;transition:color .2s}
.footer-bar a:hover{color:#fff}

/* RESPONSIVE */
@media(max-width:900px){
  .hero-inner{flex-direction:column;gap:40px}
  .hero-games{width:100%;margin-left:0}
  .hero-games-area{justify-content:center}
  .hero-game-avatars{display:none}
  .hero-game-avatar{width:40px;height:40px}
  .lb-inner,.why-inner{grid-template-columns:1fr}
  .why-visual{display:none}
  .game-grid{grid-template-columns:repeat(2,1fr)}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .footer-main{grid-template-columns:1fr}
  .tc-card{width:280px}
  .tc-card[data-pos="right1"]{transform:translateX(220px) scale(0.88);opacity:0.55}
  .tc-card[data-pos="left1"]{transform:translateX(-220px) scale(0.88);opacity:0.55}
  .tc-card[data-pos="right2"]{transform:translateX(800px) scale(0.76);opacity:0}
  .tc-card[data-pos="left2"]{transform:translateX(-800px) scale(0.76);opacity:0}
  .tc-prev{left:calc(50% - 185px)}
  .tc-next{right:calc(50% - 185px)}
  .rwc-card{width:260px;margin-left:-130px}
  .rwc-card[data-pos="right1"]{transform:translateX(220px) scale(0.85);opacity:0.45}
  .rwc-card[data-pos="left1"]{transform:translateX(-220px) scale(0.85);opacity:0.45}
  .rwc-card[data-pos="right2"]{transform:translateX(800px) scale(0.72);opacity:0}
  .rwc-card[data-pos="left2"]{transform:translateX(-800px) scale(0.72);opacity:0}
  .featured-head{flex-direction:column;align-items:flex-start;gap:16px}
  .featured-head-sub{text-align:left;max-width:100%}
  #featured{padding:60px 5%}
  #how{padding:60px 5%}
  #leaderboard-section{padding:60px 5%}
  #rewards{padding:60px 5%}
  #why{padding:60px 5%}
  #testimonials{padding:80px 5% 60px}
  #daily{padding:50px 5%}
  #community{padding:60px 5%}
  .rg-section{padding:50px 5% 40px}
  .how-head{margin-bottom:40px}
  .testimonials-head{margin-bottom:50px}
  .lb-row{padding:12px 16px;gap:10px}
  .lb-bar-wrap{width:50px}
  .why-points{gap:10px;margin-top:24px}
  .why-point{padding:14px 16px}
  .reels-wrap{max-width:320px;height:420px}
}
@media(max-width:640px){
  #home{padding:100px 5% 50px;min-height:auto}
  .hero-h1{font-size:clamp(36px,10vw,56px);margin-bottom:20px}
  .hero-sub{font-size:15px;margin-bottom:24px}
  .hero-stats{gap:0}
  .hst{padding:0 16px}
  .hst-n{font-size:20px}
  .hst-l{font-size:10px}
  .hero-game-avatar{width:36px;height:36px}
  .hero-fan-card{width:200px;height:260px;padding:10px}
  .hero-fan-layout{width:260px;height:320px;justify-content:center}
  .game-grid{grid-template-columns:1fr}
  .game-cat-card{padding:24px 20px}
  .game-cat-label{font-size:22px}
  .how-steps{grid-template-columns:1fr}
  .how-steps::before{display:none}
  .how-step{padding:28px 20px 24px}
  .how-icon-wrap{width:64px;height:64px;font-size:26px}
  .how-title{font-size:20px}
  .how-desc{font-size:13px}
  .stats-grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .stat-card{padding:24px 16px}
  .stat-val{font-size:clamp(28px,6vw,40px)}
  .stat-lbl{font-size:11px}
  body{cursor:auto}
  .tc-card{width:260px;padding:22px 20px 20px}
  .tc-card[data-pos="right1"]{transform:translateX(190px) scale(0.85);opacity:0.4}
  .tc-card[data-pos="left1"]{transform:translateX(-190px) scale(0.85);opacity:0.4}
  .tc-quote{font-size:12.5px}
  .tc-prev{left:calc(50% - 170px)}
  .tc-next{right:calc(50% - 170px)}
  .rwc-wrap{height:260px}
  .rwc-card{width:240px;margin-left:-120px;height:240px;padding:28px 24px}
  .rwc-card[data-pos="right1"]{transform:translateX(190px) scale(0.82);opacity:0.35}
  .rwc-card[data-pos="left1"]{transform:translateX(-190px) scale(0.82);opacity:0.35}
  .rwc-card-title{font-size:22px}
  .rwc-card-desc{font-size:12px}
  .lb-inner{gap:40px}
  .lb-header{padding:12px 16px}
  .lb-pos{font-size:18px;width:24px}
  .lb-avatar{width:30px;height:30px;font-size:11px}
  .lb-name{font-size:13px}
  .lb-score{font-size:11px}
  .footer-main{padding:40px 5%;gap:32px}
  .footer-brand-name{font-size:24px}
  .footer-desc{font-size:13px}
  .footer-bar{padding:14px 5%;font-size:10px;flex-direction:column;text-align:center}
  .rg-card{width:170px;height:240px}
  .rg-rank{font-size:clamp(48px,8vw,72px)}
  .marquee-item{font-size:14px;padding:0 20px;gap:10px}
  .reels-wrap{max-width:280px;height:380px}
  .reel-overlay{padding:24px 16px 20px}
  .reel-overlay p{font-size:13px}
  .daily-inner .section-h2{font-size:clamp(32px,8vw,52px)}
  .daily-inner .section-sub{font-size:14px}
  .cta-final-sub{font-size:15px}
  #cta-final{min-height:50vh}
}
@media(max-width:380px){
  .hero-h1{font-size:32px}
  .hero-sub{font-size:14px}
  .hst{padding:0 12px}
  .hst-n{font-size:18px}
  .rg-card{width:150px;height:210px}
  .tc-card{width:230px}
  .tc-card[data-pos="right1"]{transform:translateX(170px) scale(0.82)}
  .tc-card[data-pos="left1"]{transform:translateX(-170px) scale(0.82)}
  .tc-prev{left:calc(50% - 155px)}
  .tc-next{right:calc(50% - 155px)}
  .rwc-card{width:210px;margin-left:-105px;height:220px;padding:20px 18px}
  .rwc-card[data-pos="right1"]{transform:translateX(170px)}
  .rwc-card[data-pos="left1"]{transform:translateX(-170px)}
  .rwc-card-title{font-size:18px}
  .rwc-wrap{height:230px}
  .game-cat-card{padding:20px 16px}
  .game-cat-icon{font-size:32px}
  .game-cat-label{font-size:18px}
  .how-step{padding:22px 16px 20px}
  .stat-card{padding:20px 12px}
  .reward-tag{padding:10px 18px;font-size:12px}
  .reward-tags-wrap{gap:8px;margin-bottom:40px}
}`;

/* ─── SVG ARROW ─── */
const Arr = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── HERO GAMES — Card right + avatars left ─── */
const HERO_FAN_MAX = 7;
const HERO_FAN_HALF = 3;
const HERO_FAN_POSITIONS = [
  { rot: 0, scale: 0.85, x: 0, y: -6.5, zIndex: 1 },
  { rot: 0, scale: 0.90, x: 0, y: -4.8, zIndex: 2 },
  { rot: 0, scale: 0.95, x: 0, y: -2.8, zIndex: 3 },
  { rot: 0, scale: 1.0,  x: 0, y: 0,    zIndex: 10 },
  { rot: 0, scale: 0.95, x: 0, y: 2.8,  zIndex: 3 },
  { rot: 0, scale: 0.90, x: 0, y: 4.8,  zIndex: 2 },
  { rot: 0, scale: 0.85, x: 0, y: 6.5,  zIndex: 1 },
];

function heroFanResponsiveMult(w) {
  if (w < 480) return 0.5;
  if (w < 640) return 0.65;
  if (w < 768) return 0.8;
  if (w < 1024) return 0.9;
  return 1;
}
function heroFanHeightMult(w) {
  let ideal;
  if (w < 480) ideal = 352;
  else if (w < 640) ideal = 416;
  else if (w < 768) ideal = 448;
  else if (w < 1024) ideal = 544;
  else ideal = 608;
  const avail = window.innerHeight * 0.7;
  return avail >= ideal ? 1 : avail / ideal;
}
function heroFanSlotCfg(total, slot) {
  if (total >= HERO_FAN_MAX) return HERO_FAN_POSITIONS[slot];
  const c = total >> 1;
  const d = total > 1 ? (slot - c) / c : 0;
  const a = Math.abs(d);
  return { rot: 0, scale: 1 - 0.15 * a, x: 0, y: d * 3, zIndex: 10 - Math.abs(slot - c) };
}

function HeroGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const containerRef = useRef(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef(null);
  const prevVisible = useRef(new Set());
  const hoverTimerRef = useRef(null);
  const hoverRef = useRef(false);
  const autoRef = useRef(null);

  useEffect(() => {
    fetch('/api/play/hero-games')
      .then(r => r.json())
      .then(d => { if (d.success) setGames(d.games || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = games.length;
  const needsNav = total > HERO_FAN_MAX;
  const visibleCount = needsNav ? HERO_FAN_MAX : total;

  const getVisibleMap = useCallback((ctr) => {
    const map = new Map();
    if (!needsNav) { games.forEach((_, i) => map.set(i, i)); return map; }
    for (let s = 0; s < HERO_FAN_MAX; s++) {
      map.set(((ctr + s - HERO_FAN_HALF) % total + total) % total, s);
    }
    return map;
  }, [total, needsNav, games]);

  const cycle = useCallback((dir) => {
    if (isAnimating.current || !needsNav) return;
    isAnimating.current = true;
    directionRef.current = dir;
    setCenter(p => dir === 'right' ? (p + 1) % total : (p - 1 + total) % total);
  }, [total, needsNav]);

  /* Auto-cycle every 3s, pause on hover */
  useEffect(() => {
    if (!needsNav || total < 2) return;
    const start = () => {
      clearInterval(autoRef.current);
      autoRef.current = setInterval(() => {
        if (!hoverRef.current && !isAnimating.current) cycle('right');
      }, 3000);
    };
    start();
    return () => clearInterval(autoRef.current);
  }, [needsNav, total, cycle]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !total) return;
    const cards = Array.from(el.querySelectorAll('.hero-fan-card'));
    if (!cards.length) return;

    const visMap = getVisibleMap(center);
    const prev = prevVisible.current;
    const dir = directionRef.current;
    const first = !hasEntered.current;
    const mult = heroFanResponsiveMult(window.innerWidth);
    const hMult = heroFanHeightMult(window.innerWidth);
    const cfg = (s) => heroFanSlotCfg(visibleCount, s);

    if (first) isAnimating.current = true;
    let done = 0;
    const onDone = () => { if (++done >= visMap.size) { isAnimating.current = false; if (first) hasEntered.current = true; } };

    cards.forEach((card, ci) => {
      const slot = visMap.get(ci);
      const was = prev.has(ci);
      if (slot !== undefined) {
        const base = cfg(slot);
        const tgt = { x: `${base.x * mult}rem`, y: `${base.y * hMult}rem`, rotation: base.rot, scale: base.scale, opacity: 1, zIndex: base.zIndex };
        if (first) {
          gsap.set(card, { x: 0, y: `${6 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...tgt, duration: 1.2, ease: 'elastic.out(1.05,.78)', delay: 0.2 + slot * 0.06, onComplete: onDone });
        } else if (!was) {
          const ex = dir === 'right' ? 20 : -20;
          gsap.set(card, { x: `${ex}rem`, y: `${base.y * hMult}rem`, rotation: dir === 'right' ? 20 : -20, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...tgt, duration: 0.6, ease: 'power2.out', onComplete: onDone });
        } else {
          gsap.to(card, { ...tgt, duration: 0.5, ease: 'power2.out', onComplete: onDone });
        }
      } else if (was) {
        const ex = dir === 'right' ? -20 : 20;
        gsap.to(card, { x: `${ex}rem`, opacity: 0, scale: 0.5, rotation: dir === 'right' ? -20 : 20, duration: 0.4, ease: 'power2.in', zIndex: 0 });
      } else if (first) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });
    prevVisible.current = new Set(visMap.keys());

    /* Hover */
    const entries = [];
    cards.forEach((c, i) => { const s = visMap.get(i); if (s !== undefined) entries.push({ el: c, slot: s, gameIdx: i }); });
    entries.sort((a, b) => a.slot - b.slot);
    let activeSlot = null;
    const centerSlot = entries.length >> 1;

    const updateHover = (hSlot) => {
      const m = heroFanResponsiveMult(window.innerWidth);
      const hm = heroFanHeightMult(window.innerWidth);
      entries.forEach(({ el, slot }) => {
        const base = cfg(slot);
        let tx = base.x * m, ty = base.y * hm, tr = base.rot, ts = base.scale, dl = 0;
        if (hSlot !== null) {
          const dist = Math.abs(slot - hSlot);
          dl = dist * 0.015;
          if (slot === hSlot) { ts *= 1.04; }
          else if (slot < hSlot) { ty -= 0.4 * hm; }
          else { ty += 0.4 * hm; }
        } else { dl = Math.abs(slot - centerSlot) * 0.02; }
        gsap.to(el, { x: `${tx}rem`, y: `${ty}rem`, rotation: tr, scale: ts, duration: 0.45, delay: dl, ease: 'power2.out', overwrite: 'auto' });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = entries.map(({ el, slot, gameIdx }) => {
      const h = () => {
        if (isAnimating.current) return;
        if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
        if (activeSlot !== slot) { activeSlot = slot; updateHover(slot); }
        setHoveredIdx(gameIdx);
      };
      el.addEventListener('mouseenter', h);
      return { el, h };
    });
    const onLeave = () => {
      if (isAnimating.current) return;
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => { activeSlot = null; updateHover(null); setHoveredIdx(null); }, 50);
    };
    el.addEventListener('mouseleave', onLeave);
    const onResize = () => { if (!isAnimating.current) updateHover(activeSlot); };
    window.addEventListener('resize', onResize);

    return () => {
      enterHandlers.forEach(({ el, h }) => el.removeEventListener('mouseenter', h));
      el.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [center, total, getVisibleMap, needsNav, visibleCount]);

  const COLORS = ['#9210f6','#610497','#7C3AED','#4F46E5','#9210f6','#610497'];
  const GAME_ICONS = [
    <SvgIcon name="puzzle" size={24} />, <SvgIcon name="dice" size={24} />,
    <SvgIcon name="trophy" size={24} />, <SvgIcon name="gift" size={24} />,
    <SvgIcon name="zap" size={24} />, <SvgIcon name="gamepad" size={24} />
  ];

  const chevron = (d) => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={d === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  );

  return (
    <div className="hero-games">
      <div className="hero-games-title"><SvgIcon name="flame" size={14} /> Top Games this month</div>
      <div className="hero-games-area">
        {/* Card stack + arc avatars */}
        <div className="hero-fan-layout" ref={containerRef}
          onMouseEnter={() => { hoverRef.current = true; clearInterval(autoRef.current); }}
          onMouseLeave={() => { hoverRef.current = false; if (needsNav && total >= 2) autoRef.current = setInterval(() => { if (!hoverRef.current && !isAnimating.current) cycle('right'); }, 3000); }}>
          {/* Arc avatars from top-right of card, curving left, to bottom */}
          <div className="hero-game-avatars">
            {!loading && games.map((game, i) => {
              const count = Math.min(games.length, HERO_FAN_MAX);
              const idx = i < count ? i : i % count;
              const total = Math.min(games.length, HERO_FAN_MAX);
              const startAngle = 38;
              const endAngle = -142;
              const angleDeg = startAngle + (total > 1 ? (idx / (total - 1)) * (endAngle - startAngle) : 0);
              const rad = (angleDeg * Math.PI) / 180;
              const radius = 210;
              const cx = 255;
              const cy = 190;
              const x = cx + Math.sin(rad) * radius - 24;
              const y = cy - Math.cos(rad) * radius - 24;
              const delay = idx * 0.08;
              return (
                <div key={game.id}
                  className={`hero-game-avatar${hoveredIdx === i ? ' active' : ''}`}
                  style={{ left: `${x}px`, top: `${y}px`, transitionDelay: `${delay}s`, transitionDuration: '0.4s' }}>
                  {game.game_logo_url || game.bg_image_url ? (
                    <img src={game.game_logo_url || game.bg_image_url} alt={game.name} />
                  ) : (
                    <div className="hero-game-avatar-placeholder" style={{ background: `linear-gradient(135deg,${COLORS[i % COLORS.length]}44,${COLORS[(i+2)%COLORS.length]}22)` }}>
                      {GAME_ICONS[i % GAME_ICONS.length]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        {loading && <div className="hg-loader"><div className="hg-spinner" />Loading…</div>}
        {!loading && games.length > 0 && (() => {
          const game = games[center] || games[0];
          return game.slug ? (
            <a key={game.id} href={`/play/${game.slug}/${game.client_slug}`} target="_blank" rel="noopener noreferrer"
              className="hero-fan-card hgf-front">
              <div className="relative w-full h-full overflow-hidden">
                {game.game_logo_url || game.bg_image_url ? (
                  <img className="hgf-thumb" src={game.game_logo_url || game.bg_image_url} alt={game.name} loading="lazy" />
                ) : (
                  <div className="hgf-thumb-placeholder" style={{ background: `linear-gradient(135deg,${COLORS[center % COLORS.length]}33,${COLORS[(center+2)%COLORS.length]}18)` }}>
                    {GAME_ICONS[center % GAME_ICONS.length]}
                  </div>
                )}
                <div className="hgf-bottom">
                  <div className="hgf-info">
                    <span className="hgf-name">{game.name}</span>
                    <div className="hgf-meta"><div className="hgf-plays-dot" />{(game.play_count || 0).toLocaleString()} plays</div>
                  </div>
                  <span className="hgf-badge">{game.category || 'Quiz'}</span>
                </div>
              </div>
            </a>
          ) : (
            <div key={game.id} className="hero-fan-card hgf-front">
              <div className="relative w-full h-full overflow-hidden">
                {game.game_logo_url || game.bg_image_url ? (
                  <img className="hgf-thumb" src={game.game_logo_url || game.bg_image_url} alt={game.name} loading="lazy" />
                ) : (
                  <div className="hgf-thumb-placeholder" style={{ background: `linear-gradient(135deg,${COLORS[center % COLORS.length]}33,${COLORS[(center+2)%COLORS.length]}18)` }}>
                    {GAME_ICONS[center % GAME_ICONS.length]}
                  </div>
                )}
                <div className="hgf-bottom">
                  <div className="hgf-info">
                    <span className="hgf-name">{game.name}</span>
                    <div className="hgf-meta"><div className="hgf-plays-dot" />{(game.play_count || 0).toLocaleString()} plays</div>
                  </div>
                  <span className="hgf-badge">{game.category || 'Quiz'}</span>
                </div>
              </div>
            </div>
          );
        })()}
        {!loading && total === 0 && (
          <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontFamily:'var(--fb)', fontSize:13 }}>
            Games loading soon — check back shortly!
          </div>
        )}
      </div>
      </div>
      {!loading && needsNav && (
        <div className="hero-fan-nav">
          <button className="hero-fan-arrow" onClick={() => cycle('left')} aria-label="Previous">{chevron('left')}</button>
          <div className="hero-fan-dots">
            {games.map((_, i) => <span key={i} className={`hero-fan-dot${i === center ? ' active' : ''}`} />)}
          </div>
          <button className="hero-fan-arrow" onClick={() => cycle('right')} aria-label="Next">{chevron('right')}</button>
        </div>
      )}
    </div>
  );
}

/* ─── MARQUEE ─── */
function MarqueeStrip() {
  const items = [...MARQUEE_TEXTS, ...MARQUEE_TEXTS];
  return (
    <div className="marquee-strip">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i} className="marquee-item">
            <span className="dot" />{t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── TOP GAMES THIS WEEK (from Business page) ─── */
function RankedGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgIdx, setMsgIdx] = useState(0);
  const [bubbleShow, setBubbleShow] = useState(false);

  const MASCOT_MSGS = [
    'Check out this week\'s hottest games!',
    'Play now and climb the ranks!',
    'Top players win big rewards!',
    'Tap a game to start playing!',
    'New games added every week!',
  ];

  useEffect(() => {
    fetch('/api/play/hero-games')
      .then(r => r.json())
      .then(d => { if (d.success) setGames(d.games || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sectionRef = useRef(null);
  const [mascotVisible, setMascotVisible] = useState(false);

  useEffect(() => {
    let idx = 0;
    const showMsg = () => {
      setMsgIdx(idx % MASCOT_MSGS.length);
      setBubbleShow(true);
      setTimeout(() => setBubbleShow(false), 3200);
      idx++;
    };
    const t1 = setTimeout(showMsg, 1200);
    const timer = setInterval(showMsg, 7000);
    return () => { clearTimeout(t1); clearInterval(timer); };
  }, []);

  useEffect(() => {
    const heroEl = document.getElementById('home');

    const sectionObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setMascotVisible(true);
    }, { threshold: 0.05 });

    const heroObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setMascotVisible(false);
    }, { threshold: 0.1 });

    if (sectionRef.current) sectionObs.observe(sectionRef.current);
    if (heroEl) heroObs.observe(heroEl);

    return () => { sectionObs.disconnect(); heroObs.disconnect(); };
  }, [loading]);

  const COLORS = ['#9210f6','#610497','#7C3AED','#4F46E5','#9210f6','#610497','#7C3AED','#4F46E5','#9210f6','#610497'];

  return (
    <>
      <div className={`rg-sticky-mascot${mascotVisible ? ' visible' : ''}`}>
        <div className={`rg-mascot-bubble${bubbleShow ? ' show' : ''}`}>{MASCOT_MSGS[msgIdx]}</div>
        <img src="/mascot.png.png" alt="Mascot" />
      </div>
      {loading || games.length === 0 ? null : (
    <section className="rg-section" ref={sectionRef}>
      <p className="rg-kicker">Trending Now</p>
      <h2 className="rg-heading">Top Games This Week</h2>
      <p className="rg-sub">Play brand games from our partners — live & free</p>

      <div className="rg-track">
        {games.map((game, i) => (
          <div
            key={game.id}
            className="rg-item"
            style={{ animationDelay: `${i * 60}ms`, marginLeft: i === 0 ? 0 : i < 3 ? 36 : 24, marginTop: 28 }}
            onClick={() => window.open(`/play/${game.slug}/${game.client_slug}`, '_blank')}
          >
            <span className="rg-rank">{i + 1}</span>

            <div className="rg-card">
              {game.game_logo_url || game.bg_image_url ? (
                <img className="rg-card-img" src={game.game_logo_url || game.bg_image_url} alt={game.name} loading="lazy" />
              ) : (
                <div className="rg-card-img" style={{
                  background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}44, ${COLORS[(i+2) % COLORS.length]}22)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40
                }}>
                  🎮
                </div>
              )}
              <span className="rg-card-badge">{game.category || 'Quiz'}</span>
              <div className="rg-card-body">
                <div className="rg-card-name">{game.name}</div>
                <div className="rg-card-plays">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  {(game.play_count || 0).toLocaleString()} plays
                </div>
              </div>
              <div className="rg-card-overlay">
                <div className="rg-play-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#9210f6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
      )}
    </>
  );
}

/* ─── REWARDS PROGRESS BAR — remounts per card to restart animation ─── */
function RewardProgressBar() {
  const ref = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (ref.current) ref.current.classList.add('running');
      })
    );
    return () => cancelAnimationFrame(id);
  }, []);
  return <div ref={ref} className="rwc-card-progress" />;
}

/* ─── REWARDS CAROUSEL ─── */
function RewardsCarousel() {
  const N = REWARD_CARDS_DATA.length;
  const [current, setCurrent] = useState(0);
  const [progKey, setProgKey] = useState(0);
  const autoRef = useRef(null);

  const getPos = useCallback((i) => {
    const diff = ((i - current) % N + N) % N;
    const nd   = diff > N / 2 ? diff - N : diff;
    if (nd === 0)  return 'center';
    if (nd === 1)  return 'right1';
    if (nd === 2)  return 'right2';
    if (nd === -1) return 'left1';
    if (nd === -2) return 'left2';
    return nd > 0 ? 'hiddenright' : 'hiddenleft';
  }, [current, N]);

  const goTo = useCallback((idx) => {
    setCurrent(((idx % N) + N) % N);
    setProgKey(k => k + 1);
  }, [N]);

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setCurrent(c => { setProgKey(k => k + 1); return (c + 1) % N; });
    }, 3000);
  }, [N]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  useEffect(() => { startAuto(); return () => stopAuto(); }, [startAuto, stopAuto]);

  return (
    <div onMouseEnter={stopAuto} onMouseLeave={startAuto}>
      {/* Tags — active one tracks current card */}
      <div className="reward-tags-wrap">
        {REWARD_TAGS.map((tag, i) => (
          <span
            key={tag}
            className={`reward-tag${i === current ? ' rw-active' : ''}`}
            onClick={() => goTo(i)}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Carousel */}
      <div className="rwc-wrap">
        <div className="rwc-track">
          {REWARD_CARDS_DATA.map((card, i) => {
            const pos      = getPos(i);
            const isCenter = pos === 'center';
            return (
              <div
                key={i}
                className="rwc-card"
                data-pos={pos}
                onClick={() => !isCenter && goTo(i)}
                style={{ cursor: isCenter ? 'default' : 'none' }}
              >
                <span className="rwc-card-icon">{card.icon}</span>
                <div className="rwc-card-title">{card.title}</div>
                <div className="rwc-card-desc">{card.desc}</div>
                <div className="rwc-card-bar">
                  {isCenter && <RewardProgressBar key={progKey} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav dots + arrows */}
      <div className="rwc-nav">
        <button className="rwc-btn" onClick={() => goTo(current - 1)}>‹</button>
        <div className="rwc-dots">
          {REWARD_CARDS_DATA.map((_, i) => (
            <button key={i} className={`rwc-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>
        <button className="rwc-btn" onClick={() => goTo(current + 1)}>›</button>
      </div>
    </div>
  );
}

/* ─── REELS CAROUSEL ─── */
const REELS = [
  { url: 'https://assets.mixkit.co/videos/48862/48862-720.mp4', label: 'Quick reflexes, big rewards', tag: '#Gaming' },
  { url: 'https://assets.mixkit.co/videos/48864/48864-720.mp4', label: 'Spin to win every day', tag: '#Rewards' },
  { url: 'https://assets.mixkit.co/videos/48860/48860-720.mp4', label: 'Climb the leaderboard', tag: '#Compete' },
];

function ReelsCarousel() {
  const [current, setCurrent] = useState(0);
  const autoRef = useRef(null);

  useEffect(() => {
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % REELS.length), 7000);
    return () => clearInterval(autoRef.current);
  }, []);

  return (
    <div className="reels-wrap">
      <div className="reels-track">
        {REELS.map((reel, i) => {
          const diff = (i - current + REELS.length) % REELS.length;
          const isCenter = diff === 0;
          const isUp = diff === 1 || (diff === 0 && current === 0 && i === REELS.length - 1) ? false : diff > 1;
          const transform = isCenter ? 'translateY(0)' : `${isUp ? 'translateY(-100%)' : 'translateY(100%)'}`;
          return (
            <div
              key={i}
              className="reel-card"
              style={{
                transform,
                opacity: isCenter ? 1 : 0,
                pointerEvents: isCenter ? 'auto' : 'none',
              }}
            >
              {isCenter && (
                <video
                  autoPlay muted loop playsInline
                  src={reel.url || 'https://assets.mixkit.co/videos/48862/48862-720.mp4'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="reel-overlay">
                <p>{reel.label}</p>
                <span>{reel.tag}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="reel-nav">
        {REELS.map((_, i) => (
          <button key={i} className={`reel-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}

/* ─── TESTIMONIALS CAROUSEL ─── */
function TestimonialsCarousel({ onIndexChange }) {
  const N = TESTIMONIALS.length;
  const [current, setCurrent] = useState(0);
  const autoRef = useRef(null);

  useEffect(() => {
    if (onIndexChange) onIndexChange(current);
  }, [current, onIndexChange]);

  const getPos = useCallback((i) => {
    const diff = ((i - current) % N + N) % N;
    const nd   = diff > N / 2 ? diff - N : diff;
    if (nd === 0)  return 'center';
    if (nd === 1)  return 'right1';
    if (nd === 2)  return 'right2';
    if (nd === -1) return 'left1';
    if (nd === -2) return 'left2';
    return nd > 0 ? 'hiddenright' : 'hiddenleft';
  }, [current]);

  const goTo = useCallback((idx) => {
    setCurrent(((idx % N) + N) % N);
  }, [N]);

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % N), 4000);
  }, [N]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  useEffect(() => { startAuto(); return () => stopAuto(); }, [startAuto, stopAuto]);

  return (
    <div onMouseEnter={stopAuto} onMouseLeave={startAuto}>
      <div className="tcarousel-wrap">
        <button className="tc-nav tc-prev" onClick={() => goTo(current - 1)}>‹</button>
        <div className="tcarousel-track">
          {TESTIMONIALS.map((t, i) => {
            const pos      = getPos(i);
            const isCenter = pos === 'center';
            return (
              <div key={i} className="tc-card" data-pos={pos}
                onClick={() => !isCenter && goTo(i)}
                style={{ cursor: isCenter ? 'default' : 'none' }}>
                <div className="tc-stars">
                  {[...Array(5)].map((_, si) => <span key={si} className="tc-star"><SvgIcon name="starSolid" size={14} /></span>)}
                </div>
                <p className="tc-quote">"{t.quote}"</p>
                <div className="tc-divider" />
                <div className="tc-author">
                  <div className="tc-avatar" style={{ background: t.grad }}>{t.initials}</div>
                  <div className="tc-info">
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-handle">{t.handle}</div>
                  </div>
                  <span className="tc-badge">{t.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button className="tc-nav tc-next" onClick={() => goTo(current + 1)}>›</button>
      </div>
      <div className="tc-dots">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} className={`tc-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────── */

function AnimateBar({ pct, threshold = 0.3 }) {
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || done.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      done.current = true;
      obs.disconnect();
      el.style.transition = 'width 1.2s cubic-bezier(.22,1,.36,1)';
      el.style.width = `${pct}%`;
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct, threshold]);
  return <div className="lb-bar-wrap"><div className="lb-bar" ref={ref} style={{ width: 0 }} /></div>;
}

export default function PromoGamesHome() {
  const [leaderboardEntries] = useState(DUMMY_LEADERBOARD);
  const [leaderboardLoading] = useState(false);

  const testimonialIdxRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--scroll-pct', `${pct * 100}%`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── Glitch text entrance + scramble ─── */
  useEffect(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const texts = document.querySelectorAll('.glitch-line');

    texts.forEach((el, i) => {
      const isAccent = el.classList.contains('accent');
      if (!isAccent) {
        gsap.set(el, { backgroundSize: "0% 100%", scale: 0.95, opacity: 0.7 });
      } else {
        gsap.set(el, { scale: 0.95, opacity: 0.7 });
      }
      const tl = gsap.timeline({ delay: i * 0.2 });
      tl.to(el, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" });
      if (!isAccent) {
        tl.to(el, { backgroundSize: "100% 100%", duration: 2, ease: "elastic.out(1, 0.5)" }, "-=0.3");
      }
    });

    texts.forEach((el) => {
      const hoverText = el.getAttribute('data-hover');
      const overlay = el.querySelector('.overlay');
      let hoverInterval = null;

      el.addEventListener('mouseenter', () => {
        let iteration = 0;
        if (hoverInterval) clearInterval(hoverInterval);
        hoverInterval = setInterval(() => {
          const scrambled = hoverText.split('').map((letter, index) => {
            if (index < iteration) return hoverText[index];
            return letters[Math.floor(Math.random() * 26)];
          }).join('');
          overlay.textContent = scrambled;
          if (iteration >= hoverText.length) clearInterval(hoverInterval);
          iteration += 1 / 3;
        }, 30);
      });

      el.addEventListener('mouseleave', () => {
        if (hoverInterval) { clearInterval(hoverInterval); hoverInterval = null; }
        overlay.textContent = hoverText;
      });
    });
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="scroll-bar" />
      <MascotCursor />

      {/* ── NAV ── */}
      <PlayerNavbar />

      {/* ── HERO ── */}
      <section id="home">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow"><SvgIcon name="gamepad" size={14} /> Gaming That Rewards You</div>
            <h1 className="hero-h1">
              <span className="glitch-line" data-text="QUICK GAMES" data-hover="QUICK WINS">
                QUICK GAMES
                <span className="overlay">QUICK WINS</span>
              </span>
              <span className="glitch-line accent" data-text="REAL REWARDS" data-hover="REAL PRIZES">
                REAL REWARDS
                <span className="overlay">REAL PRIZES</span>
              </span>
            </h1>

            <p className="hero-sub">
              Play exciting quick games, climb the leaderboard, and unlock real-time rewards every day.
            </p>
            <div className="hero-actions">
              <a href="/arcade" className="btn-primary">Start Playing <Arr /></a>
            </div>
            <div className="hero-stats">
              {STATS.map(({ val, label }) => (
                <div className="hst" key={label}>
                  <CountUp as="span" className="hst-n" value={val} />
                  <span className="hst-l">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-mascot-wrap">
            <img src="/hero-mascot.png" alt="Mascot" className="hero-mascot-img" />
          </div>
        </div>
      </section>
      <MarqueeStrip />
      <RankedGames />

      {/* ── FEATURED GAMES ── */}
      <section id="featured">
        <div className="featured-head">
          <div>
            <p className="section-kicker">Game Categories</p>
            <h2 className="section-h2">Pick Your<br />Challenge</h2>
          </div>
          <p className="featured-head-sub">
            From reflex games to lucky spins, every game gives you a chance to rise on the leaderboard and win exciting gifts.
          </p>
        </div>
        <div className="game-grid">
          {GAME_CATEGORIES.map((g, i) => (
            <div key={g.label} className="game-cat-card" style={{ animationDelay:`${i * 70}ms` }}>
              <span className="game-cat-icon">{g.icon}</span>
              <div className="game-cat-label">{g.label}</div>
              <div className="game-cat-sub">Jump in and start playing — leaderboard spots are waiting.</div>
              <div className="game-cat-btn">Play Now <Arr size={13} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how">
        <div className="how-inner">
          <div className="how-head">
            <p className="section-kicker">How It Works</p>
            <h2 className="section-h2">Play. Score. Win.</h2>
            <p className="section-sub">Three simple steps stand between you and your next reward.</p>
          </div>
          <div className="how-steps">
            {HOW_STEPS.map(step => (
              <div key={step.num} className="how-step">
                <div className="how-num">{step.num}</div>
                <div className="how-icon-wrap">{step.icon}</div>
                <div className="how-title">{step.title}</div>
                <div className="how-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <section id="leaderboard-section">
        <div className="lb-inner">
          <div className="lb-left">
            <p className="section-kicker">Leaderboard</p>
            <h2 className="section-h2">Rise To<br />The Top</h2>
            <p className="section-sub lb-left-sub">
              Compete with players across the platform and secure your spot among the top scorers.
            </p>
            <p className="lb-tagline">The higher your score, the closer you get to exciting rewards.</p>
            <div style={{ marginTop:32 }}>
              <a href="/leaderboard" className="btn-primary">View Full Leaderboard <Arr /></a>
            </div>
          </div>
          <div className="lb-board">
            <div className="lb-header">
              <div className="lb-header-dot" style={{ background:'#ef4444' }} />
              <div className="lb-header-dot" style={{ background:'#f5c842' }} />
              <div className="lb-header-dot" style={{ background:'#22c55e' }} />
              <span className="lb-header-title">Top Scorers — this month</span>
            </div>
            {leaderboardLoading ? (
              <div className="hg-loader">
                <div className="hg-spinner" />Loading leaderboard…
              </div>
            ) : leaderboardEntries.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--fb)', fontSize: 14 }}>
                No scores yet — be the first to play!
              </div>
            ) : (
              leaderboardEntries.map((p, i) => {
                const initials = p.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                const colors = ['#9210f6','#610497','#7C3AED','#4F46E5','#9210f6','#610497','#7C3AED','#4F46E5'];
                const c1 = colors[i % colors.length];
                const c2 = colors[(i + 1) % colors.length];
                const scoreNum = p.score;
                const maxScore = leaderboardEntries[0]?.score || 1;
                const pct = maxScore > 0 ? Math.round((scoreNum / maxScore) * 100) : 0;
                return (
                  <div key={i} className="lb-row">
                    <span className={`lb-pos${i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : ''}`}>
                      {i + 1}
                    </span>
                    <div className="lb-avatar"
                      style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                      {initials}
                    </div>
                    <span className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.name}
                      {p.has_account && <span className="account-badge" style={{ fontSize: 10, padding: '2px 6px', borderRadius: '100px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', fontFamily: 'var(--fm)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><SvgIcon name="badgeCheck" size={10} /> Account</span>}
                    </span>
                    <CountUp as="span" className="lb-score" value={scoreNum.toLocaleString()} />
                    <AnimateBar pct={pct} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── REWARDS (carousel) ── */}
      <section id="rewards">
        <div className="rewards-inner">
          <p className="section-kicker">Rewards</p>
          <h2 className="section-h2">Every Play Feels<br />Rewarding</h2>
          <p className="section-sub">
            Play games and unlock exciting gifts, cashback, coupons, exclusive offers, and surprise rewards.
          </p>
          <RewardsCarousel />
        </div>
      </section>

      {/* ── WHY PLAY ── */}
      <section id="why">
        <div className="why-inner">
          <div>
            <h2 className="section-h2">Why Players<br />Love PromoGames</h2>
            <div className="why-points">
              {WHY_POINTS.map((pt, i) => (
                <div key={i} className="why-point">
                  <div className="why-check"><SvgIcon name="check" size={14} /></div>
                  <span className="why-text">{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="why-visual">
            <ReelsCarousel />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials">
        <div className="testimonials-inner">
          <div className="testimonials-head">
            <p className="section-kicker">Player Stories</p>
            <h2 className="section-h2">Real Players.<br />Real Wins.</h2>
            <p className="section-sub">
              Don't just take our word for it — hear from players who've already started winning.
            </p>
          </div>
          <TestimonialsCarousel onIndexChange={idx => { testimonialIdxRef.current = idx; }} />
        </div>
      </section>

      {/* ── DAILY PLAY ── */}
      <section id="daily">
        <div className="daily-inner">
          <p className="section-kicker">Daily Play</p>
          <h2 className="section-h2">A Treat You Can<br />Give Yourself</h2>
          <p className="section-sub">
            Take a quick break, play your favorite games, and make every moment more exciting with rewards waiting to be unlocked.
          </p>
          <a href="/arcade" className="btn-primary">Play Now <Arr /></a>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section id="community">
        <div className="community-inner">
          <p className="section-kicker">Community</p>
          <h2 className="section-h2" style={{ marginBottom:16 }}>Join The New Age<br />Of Reward Gaming</h2>
          <p className="section-sub" style={{ marginBottom:64 }}>
            Thousands of players are already competing, winning, and climbing the leaderboard every day.
          </p>
        </div>
        <div className="stats-grid">
          {STATS.map(({ val, label }) => (
            <div key={label} className="stat-card">
              <CountUp as="div" className="stat-val" value={val} />
              <div className="stat-lbl">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="cta-final">
        <ArkanoidGame />
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" id="contact">
        <div className="footer-main">
          <div>
            <p className="footer-tagline">Play Everyday. Win Everyday.</p>
            <img src="/favicon2.png" alt="Promogames" style={{ height: 48, width: 'auto', marginBottom: 12, borderRadius: 8 }} />
            <p className="footer-desc">
              Quick games, real rewards, and a leaderboard that keeps you coming back. Your reward journey starts here.
            </p>
            <div className="socials">
              {[
                { icon: "linkedin", href: "https://www.linkedin.com" },
                { icon: "instagram", href: "https://www.facebook.com/profile.php?id=61579982040453" },
                { icon: "twitter", href: "#" },
                { icon: "youtube", href: "#" },
                { icon: "instagram", href: "#" }
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="soc"><SvgIcon name={s.icon} size={18} /></a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-links-title">Quick Links</div>
            <div className="footer-links">
              {FOOTER_NAV.map(([label, href]) => (
                <a key={label} href={href}>{label}</a>
              ))}
              <a href="/company">Company</a>
            </div>
          </div>
          <div>
            <div className="footer-links-title">Get in Touch</div>
            <div className="footer-contact">
              <a href="tel:+916366870248" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><SvgIcon name="phone" size={16} /> +91 6366 870 248</a>
              <a href="mailto:offers.promogames@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><SvgIcon name="mail" size={16} /> offers.promogames@gmail.com</a>
            </div>
          </div>

        </div>
        <div className="footer-bar" style={{ width:'100%' }}>
          <p>© 2026 Promogames. Fun Games. Exciting Gifts.</p>
          <div style={{ display:'flex', gap:8 }}>
            <a href="#">Terms of Use</a><span>|</span><a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>


    </>
  );
}
