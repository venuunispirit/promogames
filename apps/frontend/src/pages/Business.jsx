import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import PlayerNavbar from "../components/PlayerNavbar";
import CountUp from "../components/CountUp";

gsap.registerPlugin(ScrollTrigger, CustomEase);

CustomEase.create("section", "0.83, 0, 0.17, 1");

const MODEL_URL = "/model/joystick.glb";

const MODEL_ORIENTATION_FIX = { x: Math.PI, y: Math.PI / 2, z: -Math.PI / 2 };

/* ── per-stage pose ──
   PDF page reference:
   pg-01 hero         — center, face-on, large
   pg-02 brandtext    — center, behind text, slightly smaller
   pg-03 stats        — center, face-on, large (stats slab below)
   pg-04 topdock      — back/top view (flipped), dock at top
   pg-05 ranked       — swung right, tilted
   pg-06 promotions   — swung left, tilted
   pg-07 promotions2  — same as 06
   pg-08 promotions3  — same as 06
   pg-09 promocards   — same as 06 (cards appear bottom right)
   pg-10 promomorph   — same as 09 (cards morph)
   pg-11 tagline      — upper left, large, tilted, partially cut
   pg-12 capabilities — left, tilted
   pg-13 footer       — right side, large, tilted, overlaps footer */
const STAGE_TRANSFORM = {
  hero:         { rx: 2.15,            ry: -.25,          rz: 2.25,    px: 0,      py: -0.05,  pz: 0,    scale: 1.15 },
  brandtext:    { rx: 0,               ry: 0,              rz: 0,    px: 0,      py: 0,      pz: -0.5, scale: 0.95 },
  stats:        { rx: 0,               ry: 0,              rz: 0,    px: 0,      py: 0.15,   pz: -0.3, scale: 1.1  },
  topdock:      { rx: -0.8,            ry: 0.1,            rz: 0,    px: 0,      py: 0.05,   pz: -0.2, scale: 1.05 },
  ranked:       { rx: 0.05,            ry: 0.6,            rz: 0.12, px: 1.0,    py: -0.1,   pz: 0,    scale: 1.1  },
  promotions:   { rx: 0.05,            ry: -0.6,           rz: -0.1, px: -0.95,  py: 0,      pz: 0,    scale: 1.15 },
  promocards:   { rx: 0.05,            ry: -0.6,           rz: -0.1, px: -0.95,  py: 0,      pz: 0,    scale: 1.15 },
  tagline:      { rx: 0.2,             ry: -0.4,           rz: -0.2, px: -0.55,  py: 0.3,    pz: 0,    scale: 1.25 },
  capabilities: { rx: 0.1,             ry: -0.5,           rz: -0.15,px: -0.85,  py: 0.1,    pz: 0,    scale: 1.15 },
  footer:       { rx: -0.15,           ry: 0.5,            rz: 0.15, px: 1.1,    py: -0.3,   pz: 0,    scale: 1.3  },
};

const STAGE_KEYS = Object.keys(STAGE_TRANSFORM);

/* ── z-layer: "behind" = z:1, "front" = z:5 ── */
const STAGE_LAYER = {
  hero: "front",
  brandtext: "front",
  stats: "behind",
  topdock: "front",
  ranked: "front",
  promotions: "front",
  promocards: "front",
  tagline: "front",
  capabilities: "front",
  footer: "front",
};

/* ── per-stage flex alignment inside the full-inset content layer ── */
const STAGE_ALIGN = {
  hero:         { display: "flex", alignItems: "center",      justifyContent: "center" },
  brandtext:    { display: "flex", alignItems: "center",      justifyContent: "center" },
  stats:        { display: "flex", alignItems: "center",      justifyContent: "center" },
  topdock:      { display: "flex", alignItems: "flex-start",  justifyContent: "center" },
  ranked:       { display: "flex", alignItems: "center",      justifyContent: "flex-end" },
  promotions:   { display: "flex", alignItems: "center",      justifyContent: "flex-start" },
  promocards:   { display: "flex", alignItems: "flex-end",    justifyContent: "flex-end" },
  tagline:      { display: "flex", alignItems: "flex-start",  justifyContent: "flex-start" },
  capabilities: { display: "flex", alignItems: "center",      justifyContent: "flex-start" },
  footer:       { display: "flex", alignItems: "flex-end",    justifyContent: "flex-end" },
};

/* ── DATA ── */
const STATS = [
  { val: "20+", label: "Games Played" },
  { val: "50+", label: "Leads Generated" },
  { val: "10+", label: "Campaigns Run" },
  { val: "10+", label: "Happy Clients" },
];
const TRUST = ["FMCG", "E-commerce", "D2C", "EdTech", "Events", "Media"];
const PROMO_CARDS = [
  { title: "Giveaways", emoji: "🎉", color: "linear-gradient(135deg,#7c3aed,#a855f7)" },
  { title: "Quizzes", emoji: "🧩", color: "linear-gradient(135deg,#6d28d9,#8b5cf6)" },
  { title: "Contests", emoji: "🏆", color: "linear-gradient(135deg,#7c3aed,#c084fc)" },
];
const INDUSTRY_CARDS = [
  { tag: "FMCG", name: "FMCG", sub: "Sampling That Sells", items: ["Instant-win coupons", "New-flavour quizzes", "Loyalty point drops", "Retailer contests"], photo: "linear-gradient(135deg,#4c1d95,#7c3aed)", emoji: "🛒" },
  { tag: "E-COMMERCE", name: "E-commerce", sub: "Convert Browsers into Buyers", items: ["Cart-abandonment games", "Flash-sale spin wheels", "Loyalty programme", "Checkout scratch cards"], photo: "linear-gradient(135deg,#5b21b6,#8b5cf6)", emoji: "📦" },
  { tag: "D2C", name: "D2C Brands", sub: "Build Community & Loyalty", items: ["Subscriber growth games", "UGC photo contests", "Referral quizzes", "Brand ambassador contests"], photo: "linear-gradient(135deg,#6d28d9,#a78bfa)", emoji: "💜" },
  { tag: "AGENCIES", name: "Agencies", sub: "Deliver Every Client Campaign", items: ["Multi-brand templates", "White-label leaderboards", "Engagement analytics", "Priority support"], photo: "linear-gradient(135deg,#4338ca,#6366f1)", emoji: "📊" },
  { tag: "EDTECH", name: "EdTech", sub: "Make Learning Addictive", items: ["Quiz-based revisions", "Streak leaderboards", "Course-launch contests", "Scholarship spins"], photo: "linear-gradient(135deg,#312e81,#4f46e5)", emoji: "🎓" },
];

const EXPERT_URL = "https://forms.gle/LUs2Q7cVS8tU8ra66";

/* ═══════════════ RANKED GAMES ═══════════════ */
function useRankedGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/play/hero-games")
      .then((r) => r.json())
      .then((d) => { if (d.success) setGames(d.games || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { games, loading };
}

/* ── stage contents ── */

/* pg-01 — no content, just joystick + CTA */
function HeroContent() { return null; }

/* pg-02 — giant text OVER the joystick (text in front) */
function BrandTextContent() {
  return (
    <div className="ss-panel ss-brand-panel">
      <h1 className="ss-giant solid">BRAND MARKETING</h1>
      <h1 className="ss-giant outline">GAMIFIED</h1>
    </div>
  );
}

/* pg-03 — stats slab at bottom, behind joystick */
function StatsContent() {
  return (
    <div className="ss-panel ss-stats-panel">
      <div className="ss-stats-slab">
        <div className="ss-stats-row">
          {STATS.map(({ val, label }) => (
            <div className="ss-stat" key={label}>
              <CountUp as="div" className="ss-stat-val" value={val} />
              <div className="ss-stat-lbl">{label}</div>
            </div>
          ))}
        </div>
        <div className="ss-trust-label">Trusted by brands across industries</div>
        <div className="ss-trust-logos">
          {TRUST.map((b) => <span key={b} className="ss-trust-chip">{b}</span>)}
        </div>
      </div>
    </div>
  );
}

function TopDockContent() { return null; }

/* pg-05 — trending panel LEFT, joystick RIGHT */
function RankedContent() {
  const { games, loading } = useRankedGames();
  const game = games[0];
  return (
    <div className="ss-panel ss-ranked-panel">
      <p className="ss-eyebrow">🔥 Trending Now</p>
      <h2 className="ss-h2">Top Games This Week</h2>
      <p className="ss-p">Play brand games from our partners — live &amp; free</p>
      {!loading && game && (
        <div className="ss-ranked-card">
          <span className="ss-ranked-tag">{game.category || "Quiz"}</span>
          <RankedImage src={game.game_logo_url || game.bg_image_url} alt={game.name} />
          <div className="ss-ranked-name">{game.name}</div>
          <div className="ss-ranked-plays">▶ {(game.play_count || 0).toLocaleString()} plays</div>
        </div>
      )}
      {!loading && !game && <div className="ss-ranked-empty">Check back soon for trending games.</div>}
    </div>
  );
}

function RankedImage({ src, alt }) {
  const [failed, setFailed] = useState(!src);
  if (failed) return <div className="ss-ranked-fallback">🎮</div>;
  return <img src={src} alt={alt} onError={() => setFailed(true)} />;
}

/* pg-06/07/08 — HUGE outlined text RIGHT side, joystick LEFT */
function PromotionsContent() {
  return (
    <div className="ss-panel ss-promo-panel">
      <h2 className="ss-outline-h2 ss-pl" data-line="0">PROMOTIONS</h2>
      <h2 className="ss-outline-h2 dim ss-pl" data-line="1">THAT FEELS LIKE</h2>
      <h2 className="ss-solid-h2 ss-pl" data-line="2">PLAYING</h2>
    </div>
  );
}

/* pg-09/10 — cards appear bottom right, then morph */
function PromoCardsContent() {
  return (
    <div className="ss-panel ss-promocards-panel">
      <div className="ss-promo-cards">
        {PROMO_CARDS.map((c, i) => (
          <div className="ss-promo-card" data-card={i} key={c.title} style={{ background: c.color }}>
            <span>{c.emoji}</span><p>{c.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* pg-11 — tagline RIGHT, joystick LEFT-UPPER */
function TaglineContent() {
  return (
    <div className="ss-panel ss-tagline-panel">
      <p className="ss-tagline-serif">
        The leading Brand Engagement Platform for<br /><span>Spin the Wheel</span>
      </p>
      <p className="ss-p">Brand Promotions that feel like play — and perform like your best campaign.</p>
      <a href={EXPERT_URL} className="ss-standalone-btn">Get a Trial Game</a>
    </div>
  );
}

/* pg-12 — coverflow cards */
function CapabilitiesContent() {
  const center = 2;
  return (
    <div className="ss-panel ss-cap-panel">
      <h2 className="ss-h2 solid ss-cap-h2">BUILT FOR EVERY INDUSTRY</h2>
      <div className="ss-fan">
        {INDUSTRY_CARDS.map((c, i) => {
          const o = i - center;
          return (
            <div className="ss-ind-card" key={c.name} data-off={o}>
              <span className="ss-ind-tag">{c.tag}</span>
              <h3 className="ss-ind-name">{c.name}</h3>
              <p className="ss-ind-sub">{c.sub}</p>
              <ul className="ss-ind-list">
                {c.items.map((it) => <li key={it}><i>✓</i>{it}</li>)}
              </ul>
              <button className="ss-ind-more" type="button">Learn More <b>→</b></button>
              <div className="ss-ind-photo" style={{ background: c.photo }}>
                <span>{c.emoji}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* pg-13 — footer with joystick overlapping from right */
function FooterContent() { return null; }

const STAGE_CONTENT = {
  hero: HeroContent, brandtext: BrandTextContent, stats: StatsContent,
  topdock: TopDockContent, ranked: RankedContent, promotions: PromotionsContent,
  promocards: PromoCardsContent, tagline: TaglineContent, capabilities: CapabilitiesContent,
  footer: FooterContent,
};

/* ── pg-13 footer ── */
function SocialIcon({ d, label }) {
  return (
    <a className="ss-soc" href="#" aria-label={label} onClick={(e) => e.preventDefault()}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={d} /></svg>
    </a>
  );
}
function BusinessFooter() {
  const icons = [
    { label: "LinkedIn", d: "M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v14H.2V8zm7.6 0h4.4v1.9h.06c.6-1.14 2.1-2.34 4.3-2.34 4.6 0 5.44 3 5.44 6.9V22h-4.6v-6.6c0-1.58-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.5V22H7.8V8z" },
    { label: "Facebook", d: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" },
    { label: "X", d: "M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.9-6.4L6.5 22H3.36l7.24-8.28L1.6 2h6.4l4.42 5.85L18.9 2zm-1.1 18.1h1.72L7.1 3.8H5.26L17.8 20.1z" },
    { label: "YouTube", d: "M23.5 6.2a3 3 0 0 0-2.12-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.53A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12c1.88.53 9.38.53 9.38.53s7.5 0 9.38-.53a3 3 0 0 0 2.12-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" },
    { label: "Instagram", d: "M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.6 2.15 15.2 2.15 12s.01-3.58.07-4.85C2.37 3.92 3.88 2.38 7.14 2.23 8.42 2.17 8.8 2.15 12 2.15zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" },
  ];
  return (
    <footer className="ss-footer">
      <p className="ss-footer-kicker">Play Everyday. Win Everyday.</p>
      <div className="ss-footer-grid">
        <div className="ss-footer-brand">
          <a className="ss-nav-logo big" href="/"><img src="/favicon.png" alt="" /><span>promogames</span></a>
          <p>Quick games, real rewards, and a leaderboard that keeps you coming back. Your reward journey starts here.</p>
          <div className="ss-soc-row">
            {icons.map((ic) => <SocialIcon key={ic.label} {...ic} />)}
          </div>
        </div>
        <div>
          <div className="ss-footer-title">Quick Links</div>
          <a href="/arcade">Play Now</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/business">Business</a>
          <a href="/login">Log In</a>
          <a href="/company">Company</a>
        </div>
        <div>
          <div className="ss-footer-title">Get in Touch</div>
          <a href="tel:+916366870248">📞 +91 6366 870 248</a>
          <a href="mailto:play@promogames.in">✉️ play@promogames.in</a>
        </div>
      </div>
      <div className="ss-footer-bar">
        <span>© 2026 Promogames. Fun Games. Exciting Gifts.</span>
        <span className="ss-footer-legal"><a href="#">Terms &amp; Conditions</a> | <a href="#">Privacy Policy</a></span>
      </div>
    </footer>
  );
}

/* ═══════════════════════ 3D MODEL ═══════════════════════ */
function ControllerModel({ onReady }) {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef();
  const innerRef = useRef();
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!innerRef.current || !groupRef.current) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 1.65;
    const baseScale = targetSize / maxDim;

    innerRef.current.position.set(-center.x, -center.y, -center.z);
    groupRef.current.scale.setScalar(baseScale);
    groupRef.current.userData.baseScale = baseScale;
    groupRef.current.rotation.set(MODEL_ORIENTATION_FIX.x, MODEL_ORIENTATION_FIX.y, MODEL_ORIENTATION_FIX.z);

    onReady(groupRef.current);
  }, [cloned, onReady]);

  return (
    <group ref={groupRef}>
      <primitive ref={innerRef} object={cloned} />
    </group>
  );
}
useGLTF.preload(MODEL_URL);

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#ffffff", "#3b1a6b", 0.7]} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} />
      <directionalLight position={[-5, 2, 4]} intensity={0.7} />
      <directionalLight position={[0, -4, -4]} intensity={0.5} color="#9210f6" />
      <pointLight position={[0, 3, -3]} intensity={0.7} color="#7C3AED" />
    </>
  );
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function ScrollStoryHero3D() {
  const rootRef = useRef(null);
  const pinRef = useRef(null);
  const dockRef = useRef(null);
  const ctaRef = useRef(null);
  const contentRefs = useRef({});
  const [modelGroup, setModelGroup] = useState(null);

  const setContentRef = useCallback((key) => (el) => { contentRefs.current[key] = el; }, []);
  const handleModelReady = useCallback((group) => setModelGroup(group), []);

  useEffect(() => {
    if (!modelGroup) return;
    const ctx = gsap.context(() => {
      Object.entries(contentRefs.current).forEach(([key, el]) => {
        if (!el) return;
        gsap.set(el, { opacity: key === "hero" ? 1 : 0, y: key === "hero" ? 0 : 24 });
        el.querySelectorAll?.(".ss-pl, .ss-promo-card").forEach((n) => gsap.set(n, { opacity: 0, y: 26 }));
      });
      gsap.set(dockRef.current, { opacity: 0, y: -20 });

      const base = modelGroup.userData.baseScale;
      const pose = (key) => {
        const t = STAGE_TRANSFORM[key];
        return {
          rotation: {
            x: MODEL_ORIENTATION_FIX.x + t.rx,
            y: MODEL_ORIENTATION_FIX.y + t.ry,
            z: MODEL_ORIENTATION_FIX.z + t.rz,
          },
          position: { x: t.px, y: t.py, z: t.pz },
          scale: base * t.scale,
        };
      };

      const p0 = pose("hero");
      gsap.set(modelGroup.rotation, p0.rotation);
      gsap.set(modelGroup.position, p0.position);
      gsap.set(modelGroup.scale, { x: p0.scale, y: p0.scale, z: p0.scale });

      const MOVE = 0.45, HOLD = 0.55;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (STAGE_KEYS.length + 0.3)}`,
          scrub: 0.6,
          pin: pinRef.current,
          anticipatePin: 1,
          snap: {
            snapTo: "labels",
            duration: { min: 0.25, max: 0.7 },
            delay: 0.04,
            ease: "power2.inOut",
          },
        },
      });

      STAGE_KEYS.forEach((key, i) => {
        const label = `s${i}`;
        if (i === 0) { tl.addLabel(label, 0); return; }
        const prevKey = STAGE_KEYS[i - 1];
        const start = (i - 1) + HOLD;
        const p = pose(key);

        tl.addLabel(label, start + MOVE);

        tl.to(modelGroup.rotation, { ...p.rotation, duration: MOVE, ease: "section" }, start);
        tl.to(modelGroup.position, { ...p.position, duration: MOVE, ease: "section" }, start);
        tl.to(modelGroup.scale, { x: p.scale, y: p.scale, z: p.scale, duration: MOVE, ease: "section" }, start);

        tl.to(contentRefs.current[prevKey], { opacity: 0, y: -26, duration: 0.3, ease: "power2.in" }, start);
        tl.fromTo(contentRefs.current[key],
          { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, start + MOVE * 0.45);

        /* CTA hides during brandtext (pg-02) */
        if (key === "brandtext") tl.to(ctaRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, start);
        if (prevKey === "brandtext") tl.to(ctaRef.current, { opacity: 1, duration: 0.25 }, start + 0.15);

        /* pg-04 dock */
        if (key === "topdock") tl.to(dockRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, start + 0.15);
        if (prevKey === "topdock") tl.to(dockRef.current, { opacity: 0, y: -20, duration: 0.3, ease: "power2.in" }, start);

        /* pg-06→08: headline lines stagger in */
        if (key === "promotions" && contentRefs.current.promotions) {
          contentRefs.current.promotions.querySelectorAll(".ss-pl").forEach((line, li) => {
            tl.fromTo(line, { opacity: 0, y: 34 },
              { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" },
              start + MOVE + 0.06 + li * 0.16);
          });
        }

        /* pg-09→10: cards pop in, then morph */
        if (key === "promocards" && contentRefs.current.promocards) {
          const cards = contentRefs.current.promocards.querySelectorAll(".ss-promo-card");
          cards.forEach((card, ci) => {
            tl.fromTo(card, { opacity: 0, y: 40, scale: 0.9 },
              { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(1.6)" },
              start + 0.08 + ci * 0.1);
          });
          cards.forEach((card, ci) => {
            if (ci === 0) return;
            tl.to(card, {
              scaleX: 0.18, borderRadius: 100, duration: 0.3, ease: "section",
            }, start + MOVE + 0.12);
            tl.to(card.querySelector("p"), { opacity: 0, duration: 0.2 }, start + MOVE + 0.12);
            tl.to(card.querySelector("span"), { opacity: 0, duration: 0.2 }, start + MOVE + 0.12);
          });
        }
      });
    }, rootRef);

    return () => ctx.revert();
  }, [modelGroup]);

  return (
    <section ref={rootRef} className="scroll-story-root">
      <style>{SCROLL_STORY_CSS}</style>

      <div ref={pinRef} className="ss-pin">
        <PlayerNavbar />

        {/* pg-04 — stats docked at top */}
        <div ref={dockRef} className="ss-dock">
          {STATS.map(({ val, label }) => (
            <div className="ss-dock-stat" key={label}>
              <span className="ss-dock-val">{val}</span>
              <span className="ss-dock-lbl">{label}</span>
            </div>
          ))}
        </div>

        <div className="ss-canvas-wrap">
          <Canvas camera={{ position: [0, 0, 6], fov: 32 }} dpr={[1, 2]}>
            <SceneLights />
            <Suspense fallback={null}>
              <ControllerModel onReady={handleModelReady} />
            </Suspense>
          </Canvas>
        </div>

        {/* persistent floating CTA pill */}
        <div ref={ctaRef} className="ss-cta-float">
          <div className="ss-cta-pill">
            <a href={EXPERT_URL} className="ss-book-btn">Get a Trial Game</a>
            <a href="/arcade" className="ss-ghost-btn">Explore Games</a>
          </div>
        </div>

        <div className="ss-content-behind">
          {STAGE_KEYS.filter((k) => STAGE_LAYER[k] === "behind").map((key) => {
            const Content = STAGE_CONTENT[key];
            return (
              <div
                key={key}
                ref={setContentRef(key)}
                className="ss-content-layer"
                style={{ position: "absolute", inset: 0, pointerEvents: "none", ...STAGE_ALIGN[key] }}
              >
                <Content />
              </div>
            );
          })}
        </div>

        <div className="ss-content-front">
          {STAGE_KEYS.filter((k) => STAGE_LAYER[k] === "front").map((key) => {
            const Content = STAGE_CONTENT[key];
            return (
              <div
                key={key}
                ref={setContentRef(key)}
                className="ss-content-layer"
                style={{ position: "absolute", inset: 0, pointerEvents: "none", ...STAGE_ALIGN[key] }}
              >
                <Content />
              </div>
            );
          })}
        </div>
      </div>

      <BusinessFooter />
    </section>
  );
}

/* ══════════════════════════════ CSS ══════════════════════════════ */
const SCROLL_STORY_CSS = `
.scroll-story-root{position:relative;width:100%;background:#0d0a1a}
.ss-pin{position:relative;width:100%;height:100svh;overflow:hidden;background:radial-gradient(ellipse 80% 70% at 50% 0%,rgba(146,16,246,0.18) 0%,transparent 70%)}

.ss-canvas-wrap{position:absolute;inset:0;z-index:4;pointer-events:none}
.ss-canvas-wrap canvas{pointer-events:none}

.ss-content-behind{position:absolute;inset:0;z-index:1;pointer-events:none}
.ss-content-front{position:absolute;inset:0;z-index:5;pointer-events:none}
.ss-content-layer{position:absolute;inset:0;display:flex;align-items:center;pointer-events:none}
.ss-panel{pointer-events:auto}

/* persistent CTA pill — bottom center */
.ss-cta-float{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);z-index:15;will-change:opacity}
.ss-cta-pill{display:flex;gap:10px;background:rgba(10,6,22,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:100px;padding:8px}
.ss-book-btn{display:inline-flex;align-items:center;height:44px;padding:0 24px;border-radius:100px;background:linear-gradient(90deg,var(--purple2),var(--purple));color:#fff;font-family:var(--fb);font-weight:700;font-size:13px;text-decoration:none}
.ss-ghost-btn{display:inline-flex;align-items:center;height:44px;padding:0 22px;border-radius:100px;border:1px solid rgba(255,255,255,0.16);color:#fff;font-family:var(--fb);font-weight:600;font-size:13px;text-decoration:none}

/* pg-02 — HUGE text filling the screen, over the joystick */
.ss-brand-panel{width:100%;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:0;pointer-events:none}
.ss-giant{font-family:var(--fh);font-size:clamp(60px,13vw,200px);line-height:0.92;letter-spacing:-0.02em;margin:0;text-align:center;width:100%;white-space:nowrap}
.ss-giant.solid{color:#fff;text-shadow:0 0 80px rgba(146,16,246,0.3)}
.ss-giant.outline{-webkit-text-stroke:3px rgba(255,255,255,0.65);color:transparent}

/* pg-03 — stats slab full-width at bottom, behind joystick */
.ss-stats-panel{width:100%;height:100%;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:0}
.ss-stats-slab{width:72%;max-width:900px;background:rgba(12,6,26,0.92);border:1px solid rgba(255,255,255,0.07);border-radius:28px;padding:28px 40px 24px;display:flex;flex-direction:column;align-items:center;margin-bottom:24px}
.ss-stats-row{display:flex;margin-bottom:16px;width:100%;justify-content:space-around}
.ss-stat{padding:0 24px;text-align:center;border-right:1px solid rgba(255,255,255,0.1)}
.ss-stat:last-child{border-right:none}
.ss-stat-val{font-family:var(--fh);font-size:clamp(24px,2.8vw,38px);color:#fff}
.ss-stat-lbl{font-family:var(--fb);font-size:11px;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;margin-top:3px}
.ss-trust-label{font-family:var(--fb);font-size:10.5px;color:rgba(255,255,255,0.38);letter-spacing:1.4px;text-transform:uppercase;margin-bottom:12px}
.ss-trust-logos{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.ss-trust-chip{padding:6px 16px;border-radius:100px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);font-family:var(--fb);font-size:11px;font-weight:600;color:rgba(255,255,255,0.55)}

/* pg-04 dock — full-width purple bar at top */
.ss-dock{position:absolute;top:80px;left:50%;transform:translateX(-50%);width:88%;max-width:1100px;display:flex;justify-content:space-around;background:linear-gradient(135deg,#2a0a54,#4c1d95 55%,#6d28d9);border:1px solid rgba(167,139,250,0.35);border-radius:100px;padding:22px 20px;z-index:20;box-shadow:0 20px 60px rgba(76,29,149,0.5);will-change:opacity,transform}
.ss-dock-stat{padding:0 28px;display:flex;flex-direction:column;align-items:center;border-right:1px solid rgba(255,255,255,0.14)}
.ss-dock-stat:last-child{border-right:none}
.ss-dock-val{font-family:var(--fh);font-size:24px;color:#c4b5fd}
.ss-dock-lbl{font-family:var(--fb);font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:.6px;text-transform:uppercase;margin-top:2px}

/* pg-05 ranked — panel LEFT */
.ss-ranked-panel{max-width:480px;margin-left:6%;background:rgba(10,6,22,0.85);border:1px solid rgba(255,255,255,0.07);border-radius:28px;padding:36px}
.ss-eyebrow{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--purple);margin-bottom:8px}
.ss-h2{font-family:var(--fh);font-size:clamp(22px,3vw,40px);font-weight:400;margin-bottom:8px;color:#fff}
.ss-h2.solid{color:#fff}
.ss-p{font-family:var(--fb);font-size:14px;color:var(--muted);margin-bottom:24px}
.ss-ranked-card{width:210px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:14px;position:relative}
.ss-ranked-card img{width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:10px;display:block}
.ss-ranked-fallback{width:100%;height:120px;border-radius:10px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;font-size:34px;background:rgba(146,16,246,0.12)}
.ss-ranked-tag{position:absolute;top:24px;right:24px;background:rgba(146,16,246,0.85);padding:3px 10px;border-radius:100px;font-family:var(--fb);font-size:9px;font-weight:700;text-transform:uppercase;color:#fff;z-index:2}
.ss-ranked-name{font-family:var(--fb);font-size:13px;font-weight:700;color:#fff;margin-bottom:4px}
.ss-ranked-plays{font-family:var(--fb);font-size:11px;color:var(--muted)}
.ss-ranked-empty{font-family:var(--fb);font-size:13px;color:var(--muted)}

/* pg-06→08 — HUGE text RIGHT side, joystick LEFT */
.ss-promo-panel{width:100%;height:100%;flex-direction:column;align-items:flex-end;justify-content:center;text-align:right;padding:0 5% 0 0}
.ss-outline-h2{font-family:var(--fh);font-size:clamp(48px,8vw,120px);font-weight:400;-webkit-text-stroke:2px rgba(255,255,255,0.6);color:transparent;line-height:1.0;margin:0}
.ss-outline-h2.dim{-webkit-text-stroke:2px rgba(255,255,255,0.3)}
.ss-solid-h2{font-family:var(--fh);font-size:clamp(48px,8vw,120px);font-weight:400;color:#fff;line-height:1.0;margin:0;text-shadow:0 0 40px rgba(146,16,246,0.4)}

/* pg-09/10 — promo cards bottom right */
.ss-promocards-panel{width:100%;height:100%;flex-direction:column;align-items:flex-end;justify-content:flex-end;padding:0 5% 8% 0}
.ss-promo-cards{display:flex;gap:18px}
.ss-promo-card{width:180px;height:200px;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-shadow:0 18px 44px rgba(0,0,0,0.45);will-change:transform}
.ss-promo-card span{font-size:36px}
.ss-promo-card p{font-family:var(--fb);font-size:13px;font-weight:700;color:#fff;margin:0}

/* pg-11 — tagline RIGHT, joystick LEFT-UPPER */
.ss-tagline-panel{width:50%;max-width:560px;margin-left:auto;margin-right:6%;display:flex;flex-direction:column;align-items:flex-start;text-align:left}
.ss-tagline-serif{font-family:var(--fh);font-size:clamp(22px,2.8vw,36px);font-weight:400;line-height:1.4;margin-bottom:14px;color:#fff}
.ss-tagline-serif span{color:#c084fc;font-style:italic;border-bottom:2px solid rgba(192,132,252,0.5);padding-bottom:2px}
.ss-tagline-panel .ss-p{text-align:left;color:rgba(255,255,255,0.7);margin-bottom:28px}
.ss-standalone-btn{display:inline-flex;align-items:center;height:52px;padding:0 36px;border-radius:14px;background:linear-gradient(90deg,var(--purple2),var(--purple));color:#fff;font-family:var(--fb);font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 8px 30px rgba(146,16,246,0.4)}

/* pg-12 — coverflow */
.ss-cap-panel{width:100%;height:100%;flex-direction:column;align-items:center;justify-content:center;padding:0 4%}
.ss-cap-h2{text-align:center;margin-bottom:26px;font-size:clamp(24px,3.4vw,46px)}
.ss-fan{display:flex;justify-content:center;align-items:center;perspective:1400px;position:relative;height:420px;width:100%}
.ss-ind-card{position:absolute;left:50%;top:50%;width:260px;height:380px;margin:-190px 0 0 -130px;background:linear-gradient(180deg,rgba(20,10,40,0.96),rgba(10,6,22,0.96));border:1px solid rgba(167,139,250,0.22);border-radius:20px;padding:18px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,0.5);transform-style:preserve-3d}
.ss-ind-card[data-off="0"]{transform:translateX(0) translateZ(60px);z-index:10}
.ss-ind-card[data-off="-1"]{transform:translateX(-58%) translateZ(-40px) rotateY(32deg);z-index:5;opacity:.92}
.ss-ind-card[data-off="1"]{transform:translateX(58%) translateZ(-40px) rotateY(-32deg);z-index:5;opacity:.92}
.ss-ind-card[data-off="-2"]{transform:translateX(-104%) translateZ(-120px) rotateY(42deg);z-index:1;opacity:.75}
.ss-ind-card[data-off="2"]{transform:translateX(104%) translateZ(-120px) rotateY(-42deg);z-index:1;opacity:.75}
.ss-ind-tag{align-self:flex-start;font-family:var(--fb);font-size:9px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#c4b5fd;border:1px solid rgba(167,139,250,0.45);border-radius:100px;padding:4px 10px;margin-bottom:12px}
.ss-ind-name{font-family:var(--fh);font-size:22px;color:#fff;margin:0 0 4px}
.ss-ind-sub{font-family:var(--fb);font-size:10.5px;color:rgba(255,255,255,0.55);margin:0 0 12px}
.ss-ind-list{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column;gap:8px}
.ss-ind-list li{display:flex;align-items:center;gap:8px;font-family:var(--fb);font-size:11px;color:rgba(255,255,255,0.85)}
.ss-ind-list li i{font-style:normal;width:16px;height:16px;border-radius:50%;background:rgba(146,16,246,0.25);color:#c4b5fd;font-size:9px;display:inline-flex;align-items:center;justify-content:center;flex:none}
.ss-ind-more{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);color:#fff;font-family:var(--fb);font-size:11px;font-weight:600;padding:8px 14px;border-radius:100px;cursor:pointer;margin-bottom:14px}
.ss-ind-more b{color:#c4b5fd}
.ss-ind-photo{flex:1;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:44px;min-height:70px}

/* pg-13 footer */
.ss-footer{position:relative;z-index:2;background:linear-gradient(180deg,#0d0a1a 0%,#120b24 60%,#160d2b 100%);padding:70px 6% 0}
.ss-footer-kicker{font-family:var(--fb);font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#a78bfa;margin:0 0 34px}
.ss-footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:40px;padding-bottom:46px}
.ss-footer-brand p{font-family:var(--fb);font-size:13px;color:rgba(255,255,255,0.55);line-height:1.7;max-width:340px;margin:16px 0 22px}
.ss-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none}
.ss-nav-logo img{width:24px;height:24px}
.ss-nav-logo span{font-family:var(--fb);font-weight:800;font-size:15px;color:#fff}
.ss-nav-logo.big img{width:28px;height:28px}
.ss-soc-row{display:flex;gap:10px}
.ss-soc{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);display:inline-flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.75)}
.ss-soc:hover{background:rgba(146,16,246,0.3);color:#fff}
.ss-footer-title{font-family:var(--fb);font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:18px}
.ss-footer-grid > div:not(.ss-footer-brand){display:flex;flex-direction:column;gap:12px}
.ss-footer-grid > div a{font-family:var(--fb);font-size:13.5px;color:rgba(255,255,255,0.72);text-decoration:none}
.ss-footer-grid > div a:hover{color:#fff}
.ss-footer-bar{display:flex;justify-content:space-between;align-items:center;gap:14px;border-top:1px solid rgba(255,255,255,0.08);padding:20px 0;font-family:var(--fb);font-size:12px;color:rgba(255,255,255,0.45)}
.ss-footer-legal a{color:rgba(255,255,255,0.55);text-decoration:none}
.ss-footer-legal a:hover{color:#fff}

@media(max-width:900px){
  .ss-giant{font-size:clamp(44px,11vw,120px);white-space:normal;line-height:1}
  .ss-ranked-panel{margin:0 5%}
  .ss-promo-panel,.ss-cap-panel{align-items:center;text-align:center;padding:0 5%}
  .ss-promo-panel .ss-pl{text-align:center}
  .ss-promo-cards{gap:10px}
  .ss-promo-card{width:100px;height:130px}
  .ss-tagline-panel{width:80%;margin:0 auto;text-align:center;align-items:center}
  .ss-tagline-panel .ss-p{text-align:center}
  .ss-fan{height:430px}
  .ss-ind-card[data-off="-2"],.ss-ind-card[data-off="2"]{display:none}
  .ss-ind-card[data-off="-1"]{transform:translateX(-72%) translateZ(-40px) rotateY(32deg) scale(.9)}
  .ss-ind-card[data-off="1"]{transform:translateX(72%) translateZ(-40px) rotateY(-32deg) scale(.9)}
  .ss-dock{width:94%;top:86px;padding:16px 10px}
  .ss-dock-stat{padding:0 16px}
  .ss-stats-slab{width:92%}
  .ss-footer-grid{grid-template-columns:1fr;gap:30px}
  .ss-footer-bar{flex-direction:column}
}
`;
