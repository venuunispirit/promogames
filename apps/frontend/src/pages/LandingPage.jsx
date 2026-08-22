import { useState, useEffect, useRef, useCallback } from "react";
import CountUp from "../components/CountUp";
import PlayerNavbar from "../components/PlayerNavbar";
import ArkanoidGame from "../components/ArkanoidGame";
import MascotCursor from "../components/MascotCursor";
/* Landing page styles live in a real stylesheet (not an inline <style> tag)
   so the browser fetches/parses them in parallel with the JS bundle instead
   of blocking on React injecting ~30 KB of CSS on mount. */
import "./LandingPage.css";

/* gsap is only used for the hero-card fan-in / shuffle and the glitch text
   entrance. It's imported lazily so the ~116 KB gsap chunk is not part of the
   initial critical-path bundle (it was the 3rd largest script on first load). */
let gsapPromise;
const getGsap = () => (gsapPromise ||= import('gsap').then(m => m.default));

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
  { name: "Arjun K.",      score: 48200 },
  { name: "Priya S.",      score: 44750 },
  { name: "Rohit V.",      score: 41100 },
  { name: "Meera S.",      score: 38600 },
  { name: "Kiran P.",      score: 35900 },
  { name: "Divya R.",      score: 32400 },
  { name: "Aman S.",       score: 29800 },
  { name: "Neha G.",       score: 27100 },
  { name: "Rajesh M.",     score: 24500 },
  { name: "Sneha T.",      score: 21800 },
];

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

    /* gsap is lazy-loaded (see getGsap) so it stays out of the initial bundle. */
    let cancelled = false;
    let cleanup = () => {};
    getGsap().then(g => {
      if (cancelled) return;

      cards.forEach((card, ci) => {
        const slot = visMap.get(ci);
        const was = prev.has(ci);
        if (slot !== undefined) {
          const base = cfg(slot);
          const tgt = { x: `${base.x * mult}rem`, y: `${base.y * hMult}rem`, rotation: base.rot, scale: base.scale, opacity: 1, zIndex: base.zIndex };
          if (first) {
            g.set(card, { x: 0, y: `${6 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
            g.to(card, { ...tgt, duration: 1.2, ease: 'elastic.out(1.05,.78)', delay: 0.2 + slot * 0.06, onComplete: onDone });
          } else if (!was) {
            const ex = dir === 'right' ? 20 : -20;
            g.set(card, { x: `${ex}rem`, y: `${base.y * hMult}rem`, rotation: dir === 'right' ? 20 : -20, scale: 0.5, opacity: 0 });
            g.to(card, { ...tgt, duration: 0.6, ease: 'power2.out', onComplete: onDone });
          } else {
            g.to(card, { ...tgt, duration: 0.5, ease: 'power2.out', onComplete: onDone });
          }
        } else if (was) {
          const ex = dir === 'right' ? -20 : 20;
          g.to(card, { x: `${ex}rem`, opacity: 0, scale: 0.5, rotation: dir === 'right' ? -20 : 20, duration: 0.4, ease: 'power2.in', zIndex: 0 });
        } else if (first) {
          g.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
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
          g.to(el, { x: `${tx}rem`, y: `${ty}rem`, rotation: tr, scale: ts, duration: 0.45, delay: dl, ease: 'power2.out', overwrite: 'auto' });
          g.set(el, { zIndex: base.zIndex });
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
      let resizeTimer = null;
      let lastW = window.innerWidth;
      const onResize = () => {
        const newW = window.innerWidth;
        if (Math.abs(newW - lastW) < 20) return;
        lastW = newW;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (!isAnimating.current) updateHover(activeSlot); }, 200);
      };
      window.addEventListener('resize', onResize);

      cleanup = () => {
        enterHandlers.forEach(({ el, h }) => el.removeEventListener('mouseenter', h));
        el.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('resize', onResize);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
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
  const [inView, setInView] = useState(false);

  /* The ranked section is far below the fold — don't rotate the mascot
     messages (or re-render the bubble) until the user actually scrolls there. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading]);

  useEffect(() => {
    if (!inView) return;
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
  }, [inView]);

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
        <img src="/mascot-b.webp" alt="Mascot" />
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
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);

  /* Only auto-advance while on screen — the re-render + card transitions of a
     below-the-fold carousel burned main-thread time during load and idle. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
    if (!inView) return;
    autoRef.current = setInterval(() => {
      setCurrent(c => { setProgKey(k => k + 1); return (c + 1) % N; });
    }, 3000);
  }, [N, inView]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  useEffect(() => {
    if (inView) { startAuto(); return () => stopAuto(); }
  }, [inView, startAuto, stopAuto]);

  return (
    <div ref={wrapRef} onMouseEnter={stopAuto} onMouseLeave={startAuto}>
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
            <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} className={`rwc-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
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
  const [inView, setInView] = useState(false);
  const autoRef = useRef(null);
  const wrapRef = useRef(null);

  /* Only advance while the reel is visible (same visibility gating used for
     the videos themselves). */
  useEffect(() => {
    if (!inView) return;
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % REELS.length), 7000);
    return () => clearInterval(autoRef.current);
  }, [inView]);

  // Only mount the (autoplaying, several-MB) videos once the reel is actually
  // visible — prevents downloading ~5 MB of video before the user scrolls there.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { rootMargin: '300px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="reels-wrap" ref={wrapRef}>
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
              {isCenter && inView && (
                <video
                  autoPlay muted loop playsInline preload="none"
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
          <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} className={`reel-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
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
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);

  /* Only auto-advance while on screen. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
    if (!inView) return;
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % N), 4000);
  }, [N, inView]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  useEffect(() => {
    if (inView) { startAuto(); return () => stopAuto(); }
  }, [inView, startAuto, stopAuto]);

  return (
    <div ref={wrapRef} onMouseEnter={stopAuto} onMouseLeave={startAuto}>
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
          <button key={i} type="button" aria-label={`Go to testimonial ${i + 1}`} className={`tc-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
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
    // rAF-batched so we never read layout more than once per frame
    let ticking = false
    const update = () => {
      ticking = false
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--scroll-pct', `${pct * 100}%`);
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update) }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── Glitch text entrance + scramble ─── */
  useEffect(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const texts = document.querySelectorAll('.glitch-line');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hover scramble is attached in BOTH modes (it previously never ran for
    // non-reduced-motion users because of an early return).
    const attachHover = () => {
      texts.forEach((el) => {
        const hoverText = el.getAttribute('data-hover');
        if (!hoverText) return
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
    };

    /* The gsap entrance is purely decorative — start it only after the page's
       `load` event AND idle time, so the ~116 KB gsap chunk stays out of the
       initial critical path and never delays the LCP candidate. Skipped
       entirely for users who prefer reduced motion. */
    if (!reduceMotion) {
      let cancelled = false;
      const run = () => {
        if (cancelled) return;
        getGsap().then(g => {
          if (cancelled) return;
          texts.forEach((el, i) => {
            const isAccent = el.classList.contains('accent');
            if (!isAccent) {
              g.set(el, { backgroundSize: "0% 100%", scale: 0.95, opacity: 0.7 });
            } else {
              g.set(el, { scale: 0.95, opacity: 0.7 });
            }
            const tl = g.timeline({ delay: i * 0.2 });
            tl.to(el, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });
            if (!isAccent) {
              tl.to(el, { backgroundSize: "100% 100%", duration: 1.4, ease: "power2.out" }, "-=0.3");
            }
          });
        });
      };
      const kick = () => {
        if (cancelled) return;
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(run, { timeout: 2000 });
        } else {
          setTimeout(run, 400);
        }
      };
      attachHover();
      if (document.readyState === 'complete') kick();
      else { window.addEventListener('load', kick, { once: true }); }
      return () => { cancelled = true; window.removeEventListener('load', kick); };
    }

    attachHover();
  }, []);

  return (
    <>
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
            <img src="/hero-mascot.webp" alt="Mascot" width="640" height="640" className="hero-mascot-img" fetchPriority="high" decoding="async" />
          </div>
        </div>
      </section>
      <div className="hero-mascot-mobile">
        {/* Mobile hero duplicate — same URL as the desktop copy so the browser
            fetches it once; must be eager because it IS the mobile LCP. */}
        <img src="/hero-mascot.webp" alt="Mascot" width="640" height="640" fetchPriority="high" decoding="async"
          srcSet="/hero-mascot-384.webp 384w, /hero-mascot.webp 640w"
          sizes="(max-width: 640px) 55vw, 0px" />
      </div>
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
                    <span className="lb-name">{p.name}</span>
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

      {/* ── MOBILE CTA BUTTONS ── */}
      <div className="mobile-cta-buttons">
        <a href="/arcade" className="btn-primary">Play Now <Arr /></a>
        <a href="/leaderboard" className="btn-ghost">Start Winning <Arr /></a>
      </div>

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
                { icon: "linkedin", href: "https://www.linkedin.com", label: "PromoGames on LinkedIn" },
                { icon: "instagram", href: "https://www.facebook.com/profile.php?id=61579982040453", label: "PromoGames on Facebook" },
                { icon: "twitter", href: "#", label: "PromoGames on X (Twitter)" },
                { icon: "youtube", href: "#", label: "PromoGames on YouTube" },
                { icon: "instagram", href: "#", label: "PromoGames on Instagram" }
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="soc" aria-label={s.label}><SvgIcon name={s.icon} size={18} /></a>
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
              <a href="mailto:play@promogames.in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><SvgIcon name="mail" size={16} /> play@promogames.in</a>
            </div>
          </div>

        </div>
        <div className="footer-bar" style={{ width:'100%' }}>
          <p>© 2026 Promogames. Fun Games. Exciting Gifts.</p>
          <div style={{ display:'flex', gap:8 }}>
            <a href="/terms">Terms & Conditions</a><span>|</span><a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </footer>


    </>
  );
}
