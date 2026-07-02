import { useState, useEffect, useRef, useCallback } from "react";
import CountUp from "../components/CountUp";
import PlayerNavbar from "../components/PlayerNavbar";
import WaveText from "../components/WaveText";
import ArkanoidGame from "../components/ArkanoidGame";

/* ─── DATA ─────────────────────────────────────────── */
const MARQUEE_TEXTS = [
  "Play Fast. Win Big.",
  "Every Game Is A Chance To Win.",
  "Compete. Score. Unlock Rewards.",
  "Turn Your Free Time Into Winning Time.",
  "Every Game Played Is A Treat You Give Yourself.",
];

const GAME_CATEGORIES = [
  { icon: "🎡", label: "Spin & Win",    color: "#9210f6" },
  { icon: "⚡", label: "Quick Reflex",  color: "#610497" },
  { icon: "🧩", label: "Puzzle Rush",   color: "#7C3AED" },
  { icon: "🏆", label: "Quiz Battle",   color: "#4F46E5" },
  { icon: "🍀", label: "Lucky Drop",    color: "#9210f6" },
  { icon: "👆", label: "Tap Challenge", color: "#610497" },
];

const HOW_STEPS = [
  { num: "01", icon: "🎮", title: "Choose A Game",  desc: "Jump into fun quick games anytime, anywhere." },
  { num: "02", icon: "⭐", title: "Earn Points",    desc: "Score higher and move up the leaderboard with every play." },
  { num: "03", icon: "🎁", title: "Unlock Rewards", desc: "Top players win exciting gifts, rewards, and exclusive surprises." },
];

const REWARD_TAGS = [
  "Real-Time Rewards", "monthly Winners", "Exclusive Gifts",
  "Bonus Unlocks", "Daily Surprises",
];

const REWARD_CARDS_DATA = [
  { icon: "⚡", title: "Real-Time Rewards", desc: "Earn points and redeem rewards instantly — no waiting, no delays." },
  { icon: "🏆", title: "monthly Winners",    desc: "Top scorers every week get exclusive prizes and surprises." },
  { icon: "🎁", title: "Exclusive Gifts",   desc: "Unlock curated gifts and offers only available to top players." },
  { icon: "🎰", title: "Daily Surprises",   desc: "Log in every day for bonus drops, mystery rewards, and more." },
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

.cursor-dot{position:fixed;top:0;left:0;pointer-events:none;z-index:99999;width:8px;height:8px;border-radius:50%;background:var(--accent);transform:translate(-50%,-50%);transition:width .2s,height .2s,opacity .2s;box-shadow:0 0 10px var(--accent)}
.cursor-ring{position:fixed;top:0;left:0;pointer-events:none;z-index:99998;width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(192,64,255,0.5);transform:translate(-50%,-50%);transition:width .3s cubic-bezier(.22,1,.36,1),height .3s cubic-bezier(.22,1,.36,1),opacity .3s}
body.cursor-hover .cursor-dot{width:14px;height:14px;background:#fff}
body.cursor-hover .cursor-ring{width:52px;height:52px;border-color:rgba(192,64,255,0.9)}
body:not(.cursor-visible) .cursor-dot,body:not(.cursor-visible) .cursor-ring{opacity:0}

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
@keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes rankPop{from{opacity:0;transform:scale(0.6) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}

/* HERO */
#home{width:100%;min-height:100svh;padding:120px 6% 70px;display:flex;align-items:center;position:relative;overflow:hidden;background:radial-gradient(ellipse 90% 60% at 50% -10%,rgba(146,16,246,0.22) 0%,transparent 65%),radial-gradient(ellipse 50% 40% at 85% 60%,rgba(97,4,151,0.14) 0%,transparent 60%),var(--bg)}
.hero-inner{width:100%;max-width:1440px;margin:0 auto;display:grid;grid-template-columns:1fr 480px;gap:60px;align-items:center}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 16px;border-radius:100px;background:rgba(146,16,246,0.12);border:1px solid rgba(146,16,246,0.30);font-family:var(--fm);font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--accent);margin-bottom:24px;animation:fadeUp .6s ease both}
.hero-h1{font-family:var(--fh);font-size:clamp(52px,7.5vw,110px);font-weight:400;letter-spacing:3px;line-height:1;margin-bottom:22px;animation:fadeUp .6s .1s ease both}
.hero-h1 .line-accent{display:block;background:linear-gradient(90deg,var(--purple),var(--accent),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;position:relative;animation:glitch 5s infinite}
.hero-h1 .line-accent::before,.hero-h1 .line-accent::after{content:attr(data-text);position:absolute;inset:0;background:linear-gradient(90deg,var(--purple),var(--accent),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;pointer-events:none}
.hero-h1 .line-accent::before{animation:glitchTop 5s infinite;clip-path:polygon(0 0,100% 0,100% 33%,0 33%)}
.hero-h1 .line-accent::after{animation:glitchBottom 5s infinite;clip-path:polygon(0 66%,100% 66%,100% 100%,0 100%)}
@keyframes glitch{0%,15%,35%,55%,100%{transform:translate(0)}3%{transform:translate(-3px,2px)}5%{transform:translate(3px,-1px)}7%{transform:translate(-2px,-2px)}9%{transform:translate(0)}38%{transform:translate(4px,-2px)}40%{transform:translate(-4px,1px)}42%{transform:translate(2px,2px)}44%,52%{transform:translate(0)}46%{transform:translate(-5px,3px)}48%{transform:translate(5px,-2px)}50%{transform:translate(-3px,1px)}}
@keyframes glitchTop{0%,15%,35%,55%,100%{transform:translate(0);clip-path:polygon(0 0,100% 0,100% 33%,0 33%)}3%{transform:translate(-5px,4px);clip-path:polygon(0 0,100% 0,100% 45%,0 45%)}5%{transform:translate(5px,-3px);clip-path:polygon(0 0,100% 0,100% 20%,0 20%)}7%,9%{transform:translate(0);clip-path:polygon(0 0,100% 0,100% 33%,0 33%)}38%{transform:translate(-6px,3px);clip-path:polygon(0 0,100% 0,100% 55%,0 55%)}40%{transform:translate(6px,-2px);clip-path:polygon(0 0,100% 0,100% 25%,0 25%)}42%,44%{transform:translate(0);clip-path:polygon(0 0,100% 0,100% 33%,0 33%)}46%{transform:translate(-4px,5px);clip-path:polygon(0 0,100% 0,100% 50%,0 50%)}48%{transform:translate(4px,-4px);clip-path:polygon(0 0,100% 0,100% 15%,0 15%)}50%,52%{transform:translate(0);clip-path:polygon(0 0,100% 0,100% 33%,0 33%)}}
@keyframes glitchBottom{0%,15%,35%,55%,100%{transform:translate(0);clip-path:polygon(0 66%,100% 66%,100% 100%,0 100%)}3%{transform:translate(4px,-3px);clip-path:polygon(0 55%,100% 55%,100% 100%,0 100%)}5%{transform:translate(-5px,2px);clip-path:polygon(0 75%,100% 75%,100% 100%,0 100%)}7%,9%{transform:translate(0);clip-path:polygon(0 66%,100% 66%,100% 100%,0 100%)}38%{transform:translate(5px,3px);clip-path:polygon(0 50%,100% 50%,100% 100%,0 100%)}40%{transform:translate(-5px,-3px);clip-path:polygon(0 80%,100% 80%,100% 100%,0 100%)}42%,44%{transform:translate(0);clip-path:polygon(0 66%,100% 66%,100% 100%,0 100%)}46%{transform:translate(3px,-4px);clip-path:polygon(0 58%,100% 58%,100% 100%,0 100%)}48%{transform:translate(-3px,4px);clip-path:polygon(0 72%,100% 72%,100% 100%,0 100%)}50%,52%{transform:translate(0);clip-path:polygon(0 66%,100% 66%,100% 100%,0 100%)}}
.hero-sub{font-family:var(--fb);font-size:17px;color:var(--muted);line-height:1.75;max-width:460px;margin-bottom:36px;animation:fadeUp .6s .18s ease both}
.hero-actions{display:flex;align-items:center;gap:14px;margin-bottom:44px;flex-wrap:wrap;animation:fadeUp .6s .26s ease both}
.hero-stats{display:flex;gap:0;animation:fadeUp .6s .34s ease both}
.hst{padding:0 28px;display:flex;flex-direction:column;gap:4px}
.hst:not(:last-child){border-right:1px solid rgba(255,255,255,0.10)}
.hst:first-child{padding-left:0}
.hst-n{font-family:var(--fh);font-size:clamp(22px,2.4vw,32px);font-weight:400;letter-spacing:1px;line-height:1;background:linear-gradient(90deg,#fff,rgba(255,255,255,0.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hst-l{font-family:var(--fb);font-size:11px;color:var(--muted);letter-spacing:.3px}
.hero-games{display:flex;flex-direction:column;gap:10px;animation:fadeUp .6s .2s ease both}
.hero-games-title{font-family:var(--fm);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;display:flex;align-items:center;gap:8px}
.hero-games-title::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.08)}
.hg-card{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);cursor:none;transition:background .22s,border-color .22s,transform .22s;text-decoration:none;color:#fff;position:relative;overflow:hidden}
.hg-card::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(146,16,246,0.06) 100%);opacity:0;transition:opacity .25s}
.hg-card:hover{background:rgba(255,255,255,0.07);border-color:rgba(146,16,246,0.35);transform:translateX(4px)}
.hg-card:hover::before{opacity:1}
.hg-rank{font-family:var(--fh);font-size:28px;letter-spacing:1px;color:rgba(255,255,255,0.15);width:36px;flex-shrink:0;line-height:1;animation:rankPop .5s cubic-bezier(.34,1.56,.64,1) both}
.hg-rank.top{color:var(--gold)}
.hg-thumb{width:52px;height:52px;border-radius:12px;object-fit:cover;flex-shrink:0;background:linear-gradient(135deg,rgba(146,16,246,0.3),rgba(97,4,151,0.2))}
.hg-thumb-placeholder{width:52px;height:52px;border-radius:12px;flex-shrink:0;background:linear-gradient(135deg,rgba(146,16,246,0.22),rgba(97,4,151,0.14));display:flex;align-items:center;justify-content:center;font-size:22px}
.hg-info{flex:1;min-width:0}
.hg-name{font-family:var(--fb);font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.hg-meta{font-family:var(--fm);font-size:10px;color:var(--muted);display:flex;align-items:center;gap:6px}
.hg-plays-dot{width:4px;height:4px;border-radius:50%;background:var(--purple)}
.hg-badge{padding:3px 10px;border-radius:100px;font-family:var(--fm);font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:rgba(146,16,246,0.18);border:1px solid rgba(146,16,246,0.32);color:var(--accent);flex-shrink:0}
.hg-arrow{color:var(--muted);font-size:16px;flex-shrink:0;transition:color .2s,transform .2s}
.hg-card:hover .hg-arrow{color:#fff;transform:translateX(3px)}
.hg-loader{display:flex;align-items:center;justify-content:center;padding:40px;gap:12px;color:var(--muted);font-family:var(--fb);font-size:13px}
.hg-spinner{width:18px;height:18px;border:2px solid rgba(146,16,246,0.2);border-top-color:var(--purple);border-radius:50%;animation:spin .7s linear infinite}

/* MARQUEE */
.marquee-strip{padding:20px 0;overflow:hidden;position:relative;background:rgba(146,16,246,0.08);border-top:1px solid rgba(146,16,246,0.18);border-bottom:1px solid rgba(146,16,246,0.18)}
.marquee-strip::before,.marquee-strip::after{content:'';position:absolute;top:0;bottom:0;width:100px;z-index:2;pointer-events:none}
.marquee-strip::before{left:0;background:linear-gradient(to right,var(--bg),transparent)}
.marquee-strip::after{right:0;background:linear-gradient(to left,var(--bg),transparent)}
.marquee-track{display:flex;animation:marqueeScroll 30s linear infinite;width:max-content}
.marquee-track:hover{animation-play-state:paused}
.marquee-item{display:inline-flex;align-items:center;gap:16px;padding:0 32px;font-family:var(--fh);font-size:20px;letter-spacing:2px;color:rgba(255,255,255,0.38);white-space:nowrap}
.marquee-item .dot{width:6px;height:6px;border-radius:50%;background:var(--purple);flex-shrink:0}

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
.footer-map{border-top:1px solid rgba(255,255,255,0.07);padding:40px 6%;max-width:1440px;margin:0 auto}
.footer-map iframe{width:100%;height:280px;border-radius:16px;border:none}
.footer-bar{border-top:1px solid rgba(255,255,255,0.07);padding:18px 6%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-family:var(--fm);font-size:11px;color:rgba(255,255,255,0.3);max-width:1440px;margin:0 auto;letter-spacing:.5px}
.footer-bar a{color:rgba(255,255,255,0.3);text-decoration:none;transition:color .2s}
.footer-bar a:hover{color:#fff}

/* RESPONSIVE */
@media(max-width:900px){
  .hero-inner{grid-template-columns:1fr;gap:40px}
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
}
@media(max-width:640px){
  .game-grid{grid-template-columns:1fr}
  .how-steps{grid-template-columns:1fr}
  .how-steps::before{display:none}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  body{cursor:auto}
  .cursor-dot,.cursor-ring{display:none}
  .tc-card{width:260px}
  .tc-card[data-pos="right1"]{transform:translateX(190px) scale(0.85);opacity:0.4}
  .tc-card[data-pos="left1"]{transform:translateX(-190px) scale(0.85);opacity:0.4}
  .tc-prev{left:calc(50% - 170px)}
  .tc-next{right:calc(50% - 170px)}
  .rwc-wrap{height:260px}
  .rwc-card{width:240px;margin-left:-120px;height:240px;padding:28px 24px}
  .rwc-card[data-pos="right1"]{transform:translateX(190px) scale(0.82);opacity:0.35}
  .rwc-card[data-pos="left1"]{transform:translateX(-190px) scale(0.82);opacity:0.35}
}
`;

/* ─── SVG ARROW ─── */
const Arr = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── HERO GAMES ─── */
function HeroGames() {
  const [games, setGames]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/play/hero-games')
      .then(r => r.json())
      .then(d => { if (d.success) setGames(d.games || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#9210f6','#610497','#7C3AED','#4F46E5','#9210f6','#610497'];
  const EMOJIS = ['🧩','🎡','🏆','🎁','⚡','🎮'];

  return (
    <div className="hero-games">
      <div className="hero-games-title">🔥 Top Games this month</div>
      {loading && (
        <div className="hg-loader">
          <div className="hg-spinner" />Loading top games…
        </div>
      )}
      {!loading && games.slice(0, 5).map((game, i) => (
        <a key={game.id} href={`/play/${game.slug}/${game.client_slug}`}
          target="_blank" rel="noopener noreferrer" className="hg-card"
          style={{ animationDelay: `${i * 80}ms` }}>
          <span className={`hg-rank${i === 0 ? ' top' : ''}`}>{i + 1}</span>
          {game.game_logo_url || game.bg_image_url ? (
            <img className="hg-thumb" src={game.game_logo_url || game.bg_image_url} alt={game.name} loading="lazy" />
          ) : (
            <div className="hg-thumb-placeholder"
              style={{ background: `linear-gradient(135deg,${COLORS[i % COLORS.length]}44,${COLORS[(i+2)%COLORS.length]}22)` }}>
              {EMOJIS[i % EMOJIS.length]}
            </div>
          )}
          <div className="hg-info">
            <div className="hg-name">{game.name}</div>
            <div className="hg-meta">
              <div className="hg-plays-dot" />
              {(game.play_count || 0).toLocaleString()} plays
            </div>
          </div>
          <span className="hg-badge">{game.category || 'Quiz'}</span>
          <span className="hg-arrow">›</span>
        </a>
      ))}
      {!loading && games.length === 0 && (
        <div style={{ padding:'32px 20px', textAlign:'center', color:'var(--muted)', fontFamily:'var(--fb)', fontSize:14 }}>
          Games loading soon — check back shortly!
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
                  {[...Array(5)].map((_, si) => <span key={si} className="tc-star">★</span>)}
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
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const flyRef = useRef(null);
  const mx = useRef(0); const my = useRef(0);
  const rx = useRef(0); const ry = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const move  = e => { mx.current = e.clientX; my.current = e.clientY; document.body.classList.add('cursor-visible'); };
    const enter = () => document.body.classList.add('cursor-hover');    const leave = () => document.body.classList.remove('cursor-hover');
    document.addEventListener('mousemove', move);
    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
    });
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.14;
      ry.current += (my.current - ry.current) * 0.14;
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${mx.current - 4}px,${my.current - 4}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx.current - 18}px,${ry.current - 18}px)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { document.removeEventListener('mousemove', move); cancelAnimationFrame(rafRef.current); };
  }, []);

  const flyModeRef = useRef('path');
  const testimonialIdxRef = useRef(0);

  useEffect(() => {
    const PATH = [
      { x: 0.50, y: -0.02 },
      { x: 0.45, y:  0.05 },
      { x: 0.05, y:  0.14 },
      { x: 0.92, y:  0.23 },
      { x: 0.45, y:  0.33 },
      { x: 0.05, y:  0.42 },
      { x: 0.45, y:  0.50 },
      { x: 0.50, y:  0.56 },
    ];
    const N = PATH.length;
    const END_Y = 0.55;

    function catmull(p, i, t) {
      const p0 = p[Math.max(i - 1, 0)];
      const p1 = p[i];
      const p2 = p[Math.min(i + 1, N - 1)];
      const p3 = p[Math.min(i + 2, N - 1)];
      const t2 = t * t, t3 = t2 * t;
      return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    }

    let floatPhase = 0;
    let floatRaf = null;

    const TESTIMONIAL_START = 0.54;
    const TESTIMONIAL_END = 0.65;

    const tick = () => {
      floatPhase += 0.018;
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--scroll-pct', `${pct * 100}%`);

      if (!flyRef.current) { floatRaf = requestAnimationFrame(tick); return; }

      const t = Math.min(Math.max(pct, 0), 1);

      if (t >= TESTIMONIAL_START && t <= TESTIMONIAL_END) {
        flyModeRef.current = 'testimonial';
      } else if (t > TESTIMONIAL_END) {
        flyModeRef.current = 'hidden';
      } else {
        flyModeRef.current = 'path';
      }

      const mode = flyModeRef.current;

      if (mode === 'path') {
        flyRef.current.style.opacity = '1';
        const segs = N - 1;
        const raw = (t / END_Y) * segs;
        const seg = Math.min(Math.floor(raw), segs - 1);
        const local = raw - seg;
        const ease = local * local * (3 - 2 * local);
        const pt = catmull(PATH, seg, ease);

        const vw = window.innerWidth;
        const sh = document.body.scrollHeight - window.innerHeight;
        const x = vw * pt.x;
        const y = sh * pt.y + 60;
        const floatY = Math.sin(floatPhase) * 8;
        const rot = floatPhase * 8;

        flyRef.current.style.transform = `translate3d(${x}px, ${y + floatY}px, 0) rotate(${rot}deg)`;
      } else if (mode === 'testimonial') {
        flyRef.current.style.opacity = '1';
        const testimonialsEl = document.getElementById('testimonials');
        if (testimonialsEl) {
          const rect = testimonialsEl.getBoundingClientRect();
          const cx = window.innerWidth * 0.50;
          const cy = rect.top + rect.height * 0.42 + testimonialIdxRef.current * 8;
          const floatY = Math.sin(floatPhase) * 8;
          const rot = floatPhase * 8;
          flyRef.current.style.transform = `translate3d(${cx}px, ${cy + floatY}px, 0) rotate(${rot}deg)`;
        }
      } else {
        flyRef.current.style.opacity = '0';
      }

      floatRaf = requestAnimationFrame(tick);
    };

    floatRaf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(floatRaf);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="scroll-bar" />
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
      <img ref={flyRef} src="/favicon.png" alt=""
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 1,
          width: 40, height: 40, objectFit: 'contain',
          pointerEvents: 'none', willChange: 'transform',
          filter: 'brightness(0) invert(1) drop-shadow(0 0 16px rgba(192,64,255,0.6)) drop-shadow(0 0 40px rgba(146,16,246,0.3))',
        }} />

      {/* ── NAV ── */}
      <PlayerNavbar />

      {/* ── HERO ── */}
      <section id="home">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">🎮 Gaming That Rewards You</div>
            <h1 className="hero-h1">
              <WaveText text="Quick Games." fontSize="clamp(52px,7.5vw,110px)" /><br />
              <span className="line-accent" data-text="Real Rewards.">Real Rewards.</span>
            </h1>
            <p className="hero-sub">
              Play exciting quick games, climb the leaderboard, and unlock real-time rewards every day.
            </p>
            <div className="hero-actions">
              <a href="/arcade" className="btn-primary">Start Playing <Arr /></a>
              <a href="/leaderboard" className="btn-ghost">Join The Leaderboard</a>
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
          <HeroGames />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <MarqueeStrip />

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
                      {p.has_account && <span className="account-badge" style={{ fontSize: 10, padding: '2px 6px', borderRadius: '100px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', fontFamily: 'var(--fm)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>✓ Account</span>}
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
                  <div className="why-check">✓</div>
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
              {[["in","https://www.linkedin.com"],["f","https://www.facebook.com/profile.php?id=61579982040453"],["𝕏","#"],["▶","#"],["📷","#"]].map(([s, href], i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="soc">{s}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-links-title">Quick Links</div>
            <div className="footer-links">
              {FOOTER_NAV.map(([label, href]) => (
                <a key={label} href={href}>{label}</a>
              ))}
            </div>
            <div className="footer-contact">
              <div className="footer-links-title" style={{ marginTop:24 }}>Get in Touch</div>
              <a href="tel:+916366870248">📞 +91 6366 870 248</a>
              <a href="mailto:offers.promogames@gmail.com">📧 offers.promogames@gmail.com</a>
            </div>
          </div>
          <div>
            <div className="footer-links-title">Our Office</div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15543.255684115567!2d77.548492!3d13.105036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae230b7c2c9c6f%3A0x9b6d0c5e5c5e5c5e!2sVidyaranyapura%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1712345678901!5m2!1sen!2sin"
              width="100%" height="260" style={{ borderRadius: 14, border: 'none' }}
              loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Office Address"
            />
            <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
              #14 AMS Layout, Near Jelly Machine<br />
              Vidyaranyapura, Bangalore
            </p>
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