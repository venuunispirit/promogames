import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── FLOATING SHAPES DATA ────────────────────────── */
const SHAPES = [
  { type: "circle", color: "#79fee7", size: 60, x: "10%", y: "20%", delay: 0 },
  { type: "diamond", color: "#ffc3d6", size: 40, x: "85%", y: "15%", delay: 0.2 },
  { type: "star", color: "#fee960", size: 50, x: "75%", y: "70%", delay: 0.4 },
  { type: "triangle", color: "#eac2fb", size: 45, x: "15%", y: "75%", delay: 0.6 },
  { type: "circle", color: "#fee960", size: 30, x: "90%", y: "45%", delay: 0.8 },
  { type: "diamond", color: "#79fee7", size: 35, x: "5%", y: "50%", delay: 1.0 },
  { type: "star", color: "#ffc3d6", size: 25, x: "50%", y: "10%", delay: 1.2 },
  { type: "circle", color: "#eac2fb", size: 20, x: "60%", y: "85%", delay: 1.4 },
];

/* ─── STATS DATA ──────────────────────────────────── */
const STATS = [
  { value: "10M+", label: "Players Worldwide", icon: "🎮" },
  { value: "500+", label: "Games Created", icon: "🎯" },
  { value: "50+", label: "Business Partners", icon: "🤝" },
  { value: "24/7", label: "Always Playing", icon: "⚡" },
];

/* ─── TEAM DATA ───────────────────────────────────── */
const TEAM = [
  { name: "Arjun Mehta", role: "Founder & CEO", emoji: "🚀" },
  { name: "Priya Sharma", role: "Head of Product", emoji: "💡" },
  { name: "Rahul Kumar", role: "Lead Developer", emoji: "⚡" },
  { name: "Sneha Patel", role: "Design Lead", emoji: "🎨" },
];

/* ─── VALUES DATA ─────────────────────────────────── */
const VALUES = [
  { title: "Play First", desc: "We believe play is the best way to engage, learn, and connect. Every feature we build starts with fun.", icon: "🎮" },
  { title: "Reward Joy", desc: "Real rewards for real engagement. We make every interaction worthwhile for players and businesses alike.", icon: "🎁" },
  { title: "Build Together", desc: "Our platform empowers businesses to create custom games that their audiences love.", icon: "🏗️" },
  { title: "Stay Curious", desc: "We experiment, iterate, and innovate. The best ideas come from asking 'what if?'", icon: "🔍" },
];

/* ─── FLOATING SHAPE COMPONENT ────────────────────── */
function FloatingShape({ type, color, size, x, y, delay }) {
  const shapeRef = useRef(null);

  useEffect(() => {
    const el = shapeRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, scale: 0 });

    gsap.to(el, {
      opacity: 0.15,
      scale: 1,
      duration: 1.2,
      delay,
      ease: "elastic.out(1, 0.5)",
    });

    gsap.to(el, {
      y: `${Math.random() * 40 - 20}`,
      x: `${Math.random() * 30 - 15}`,
      rotation: Math.random() * 360,
      duration: 6 + Math.random() * 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay + 0.5,
    });
  }, [delay]);

  const shapeStyle = {
    position: "absolute",
    left: x,
    top: y,
    width: size,
    height: size,
    pointerEvents: "none",
    zIndex: 0,
  };

  if (type === "circle") {
    return (
      <div ref={shapeRef} style={{ ...shapeStyle, borderRadius: "50%", backgroundColor: color }} />
    );
  }
  if (type === "diamond") {
    return (
      <div
        ref={shapeRef}
        style={{
          ...shapeStyle,
          backgroundColor: color,
          transform: "rotate(45deg)",
          borderRadius: "4px",
        }}
      />
    );
  }
  if (type === "star") {
    return (
      <div ref={shapeRef} style={{ ...shapeStyle, fontSize: size, lineHeight: 1, color }}>
        ★
      </div>
    );
  }
  if (type === "triangle") {
    return (
      <div
        ref={shapeRef}
        style={{
          ...shapeStyle,
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          backgroundColor: "transparent",
        }}
      />
    );
  }
  return null;
}

/* ─── BOUNCING BALL COMPONENT ─────────────────────── */
function BouncingBall({ color = "#79fee7", size = 28 }) {
  const ballRef = useRef(null);

  useEffect(() => {
    const el = ballRef.current;
    if (!el) return;

    gsap.set(el, { y: -200, opacity: 0 });

    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "bounce.out",
    });

    gsap.to(el, {
      y: -15,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div
      ref={ballRef}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}cc)`,
        boxShadow: `0 ${size / 3}px ${size / 2}px ${color}66`,
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
      }}
    />
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────── */
export default function CompanyProfilePage() {
  const [activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef([]);
  const ballContainerRef = useRef(null);

  const sectionColors = ["#79fee7", "#eac2fb", "#fee960", "#ffc3d6", "#79fee7"];

  /* Scroll-based section detection */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const idx = Math.min(Math.floor(scrollY / vh), sectionColors.length - 1);
      setActiveSection(idx);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Animate sections on scroll */
  useEffect(() => {
    sectionsRef.current.forEach((section, i) => {
      if (!section) return;

      const title = section.querySelector(".cp-title");
      const text = section.querySelector(".cp-text");
      const cards = section.querySelectorAll(".cp-card");
      const button = section.querySelector(".cp-btn");

      gsap.set([title, text, button].filter(Boolean), { opacity: 0, y: 60 });
      gsap.set(cards, { opacity: 0, y: 40, scale: 0.9 });

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          gsap.to(title, { opacity: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.75)", delay: 0.1 });
          if (text) gsap.to(text, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.3 });
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.7)",
            stagger: 0.12,
            delay: 0.5,
          });
          if (button) gsap.to(button, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.8 });
        },
        onLeaveBack: () => {
          gsap.set([title, text, button].filter(Boolean), { opacity: 0, y: 60 });
          gsap.set(cards, { opacity: 0, y: 40, scale: 0.9 });
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  const scrollToSection = (idx) => {
    sectionsRef.current[idx]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow-x: hidden; background: #0a0a0a; }
        .cp-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 60px 20px;
        }
        .cp-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          transition: background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cp-content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          width: 100%;
          text-align: center;
        }
        .cp-title {
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 800;
          color: #0a0a0a;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }
        .cp-text {
          font-family: 'Inter', sans-serif;
          font-size: clamp(16px, 2vw, 20px);
          color: rgba(10,10,10,0.75);
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }
        .cp-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: #0a0a0a;
          color: #fff;
          border: none;
          border-radius: 60px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-btn:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .cp-btn-arrow {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-btn:hover .cp-btn-arrow {
          transform: translateX(4px);
        }
        .cp-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }
        .cp-card {
          background: rgba(10,10,10,0.08);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
        }
        .cp-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .cp-card-icon {
          font-size: 40px;
          margin-bottom: 12px;
          display: block;
        }
        .cp-card-value {
          font-family: 'Inter', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #0a0a0a;
          margin-bottom: 4px;
        }
        .cp-card-label {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(10,10,10,0.6);
          font-weight: 500;
        }
        .cp-team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }
        .cp-team-card {
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 36px 24px;
          text-align: center;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-team-card:hover {
          transform: translateY(-6px) rotate(-1deg);
        }
        .cp-team-emoji {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-team-card:hover .cp-team-emoji {
          transform: scale(1.2) rotate(10deg);
        }
        .cp-team-name {
          font-family: 'Inter', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 4px;
        }
        .cp-team-role {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(10,10,10,0.6);
          font-weight: 500;
        }
        .cp-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }
        .cp-value-card {
          background: rgba(10,10,10,0.06);
          border-radius: 20px;
          padding: 32px 28px;
          text-align: left;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.3s ease;
        }
        .cp-value-card:hover {
          transform: translateY(-4px);
          background: rgba(10,10,10,0.1);
        }
        .cp-value-icon {
          font-size: 32px;
          margin-bottom: 16px;
          display: block;
        }
        .cp-value-title {
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 8px;
        }
        .cp-value-desc {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(10,10,10,0.65);
          line-height: 1.7;
        }
        .cp-contact-box {
          background: rgba(10,10,10,0.08);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 500px;
          margin: 48px auto 0;
        }
        .cp-contact-title {
          font-family: 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 20px;
        }
        .cp-contact-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: rgba(10,10,10,0.06);
          border-radius: 14px;
          margin-bottom: 12px;
          text-decoration: none;
          color: #0a0a0a;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 500;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.3s ease;
        }
        .cp-contact-link:hover {
          transform: translateX(6px);
          background: rgba(10,10,10,0.12);
        }
        .cp-ball-container {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 100;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-ball-container:hover {
          transform: scale(1.2);
        }
        .cp-nav-dots {
          position: fixed;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 100;
        }
        .cp-nav-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(10,10,10,0.2);
          border: 2px solid rgba(10,10,10,0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-nav-dot.active {
          background: #0a0a0a;
          transform: scale(1.3);
          border-color: #0a0a0a;
        }
        .cp-nav-dot:hover {
          transform: scale(1.2);
          background: rgba(10,10,10,0.4);
        }
        .cp-hero-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(10,10,10,0.5);
          margin-bottom: 16px;
        }
        .cp-hero-tagline {
          font-family: 'Inter', sans-serif;
          font-size: clamp(14px, 1.5vw, 16px);
          color: rgba(10,10,10,0.55);
          margin-top: 24px;
          font-style: italic;
        }
        @media(max-width:768px) {
          .cp-nav-dots { display: none; }
          .cp-ball-container { bottom: 20px; right: 20px; }
          .cp-stats-grid, .cp-team-grid, .cp-values-grid {
            grid-template-columns: 1fr 1fr;
          }
          .cp-contact-box { padding: 32px 24px; }
        }
        @media(max-width:480px) {
          .cp-stats-grid, .cp-team-grid, .cp-values-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Navigation dots */}
      <div className="cp-nav-dots">
        {sectionColors.map((color, i) => (
          <div
            key={i}
            className={`cp-nav-dot${activeSection === i ? " active" : ""}`}
            style={activeSection === i ? { background: "#0a0a0a", borderColor: "#0a0a0a" } : {}}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </div>

      {/* Floating ball */}
      <div className="cp-ball-container" onClick={() => scrollToSection(Math.min(activeSection + 1, sectionColors.length - 1))}>
        <BouncingBall color={sectionColors[activeSection]} size={28} />
      </div>

      {/* ── SECTION 0: INTRO ── */}
      <section
        className="cp-section"
        ref={(el) => (sectionsRef.current[0] = el)}
        style={{ background: sectionColors[0] }}
      >
        <div className="cp-bg" style={{ backgroundColor: sectionColors[0] }}>
          {SHAPES.slice(0, 4).map((s, i) => (
            <FloatingShape key={i} {...s} />
          ))}
        </div>
        <div className="cp-content">
          <div className="cp-hero-subtitle">PromoGames</div>
          <h1 className="cp-title">We let the world play</h1>
          <p className="cp-text">
            Play is how we learn, connect, and grow. That's why we're creating the ultimate platform
            where businesses and players come together through the power of games.
          </p>
          <button className="cp-btn" onClick={() => scrollToSection(1)}>
            Let's roll! <span className="cp-btn-arrow">→</span>
          </button>
          <p className="cp-hero-tagline">Play Everyday. Win Everyday.</p>
        </div>
      </section>

      {/* ── SECTION 1: STATS ── */}
      <section
        className="cp-section"
        ref={(el) => (sectionsRef.current[1] = el)}
        style={{ background: sectionColors[1] }}
      >
        <div className="cp-bg" style={{ backgroundColor: sectionColors[1] }}>
          {SHAPES.slice(2, 6).map((s, i) => (
            <FloatingShape key={i} {...s} color={sectionColors[1]} />
          ))}
        </div>
        <div className="cp-content">
          <h1 className="cp-title">We're just getting started</h1>
          <p className="cp-text">
            Our platform offers instant play to millions. But our job isn't finished.
          </p>
          <div className="cp-stats-grid">
            {STATS.map((stat, i) => (
              <div className="cp-card" key={i}>
                <span className="cp-card-icon">{stat.icon}</span>
                <div className="cp-card-value">{stat.value}</div>
                <div className="cp-card-label">{stat.label}</div>
              </div>
            ))}
          </div>
          <br />
          <button className="cp-btn" onClick={() => scrollToSection(2)}>
            So... what's next? <span className="cp-btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── SECTION 2: VALUES ── */}
      <section
        className="cp-section"
        ref={(el) => (sectionsRef.current[2] = el)}
        style={{ background: sectionColors[2] }}
      >
        <div className="cp-bg" style={{ backgroundColor: sectionColors[2] }}>
          {SHAPES.slice(4, 8).map((s, i) => (
            <FloatingShape key={i} {...s} color={sectionColors[2]} />
          ))}
        </div>
        <div className="cp-content">
          <h1 className="cp-title">What we believe in</h1>
          <p className="cp-text">
            Every game we create, every reward we deliver, every partnership we build —
            it all starts with these core values.
          </p>
          <div className="cp-values-grid">
            {VALUES.map((v, i) => (
              <div className="cp-value-card" key={i}>
                <span className="cp-value-icon">{v.icon}</span>
                <div className="cp-value-title">{v.title}</div>
                <div className="cp-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
          <br />
          <button className="cp-btn" onClick={() => scrollToSection(3)}>
            Nice... <span className="cp-btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── SECTION 3: TEAM ── */}
      <section
        className="cp-section"
        ref={(el) => (sectionsRef.current[3] = el)}
        style={{ background: sectionColors[3] }}
      >
        <div className="cp-bg" style={{ backgroundColor: sectionColors[3] }}>
          {SHAPES.slice(0, 4).map((s, i) => (
            <FloatingShape key={i} {...s} color={sectionColors[3]} />
          ))}
        </div>
        <div className="cp-content">
          <h1 className="cp-title">The team behind the play</h1>
          <p className="cp-text">
            We're a team of makers, techies, adventurers — and some gamers too.
            Kids of all ages who love what we do.
          </p>
          <div className="cp-team-grid">
            {TEAM.map((member, i) => (
              <div className="cp-team-card" key={i}>
                <span className="cp-team-emoji">{member.emoji}</span>
                <div className="cp-team-name">{member.name}</div>
                <div className="cp-team-role">{member.role}</div>
              </div>
            ))}
          </div>
          <br />
          <button className="cp-btn" onClick={() => scrollToSection(4)}>
            Ready? <span className="cp-btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── SECTION 4: CONTACT ── */}
      <section
        className="cp-section"
        ref={(el) => (sectionsRef.current[4] = el)}
        style={{ background: sectionColors[4] }}
      >
        <div className="cp-bg" style={{ backgroundColor: sectionColors[4] }}>
          {SHAPES.slice(2, 6).map((s, i) => (
            <FloatingShape key={i} {...s} color={sectionColors[4]} />
          ))}
        </div>
        <div className="cp-content">
          <h1 className="cp-title">We'd love to hear from you</h1>
          <p className="cp-text">
            Whether you're a business looking to engage your audience or a player ready for fun — let's talk.
          </p>
          <div className="cp-contact-box">
            <div className="cp-contact-title">Get in touch</div>
            <a href="tel:+916366870248" className="cp-contact-link">
              📞 +91 6366 870 248
            </a>
            <a href="mailto:offers.promogames@gmail.com" className="cp-contact-link">
              ✉️ offers.promogames@gmail.com
            </a>
            <a href="/business" className="cp-contact-link">
              🏢 Partner with us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
