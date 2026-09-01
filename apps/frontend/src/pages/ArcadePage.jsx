import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import GameModal from '../components/GameModal'
import PlayerNavbar from '../components/PlayerNavbar'
import MascotBubble from '../components/MascotBubble'
import MascotCursor from '../components/MascotCursor'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a14;
  --bg2:#111122;
  --purple:#9210f6;
  --purple2:#610497;
  --purple3:#7C3AED;
  --accent:#c040ff;
  --gold:#f5c842;
  --muted:rgba(255,255,255,0.52);
  --fb:'DM Sans',sans-serif;
  --fh:'Bebas Neue',sans-serif;
  --fm:'Space Mono',monospace;
}
html{scroll-behavior:smooth}
body{font-family:var(--fb);background:var(--bg);color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(146,16,246,0.3);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:rgba(146,16,246,0.5)}

/* ── Scroll Progress Bar ── */
.arc-scroll-bar{position:fixed;top:0;left:0;height:3px;z-index:9999;background:linear-gradient(90deg,var(--purple),var(--accent));width:var(--scroll-pct,0%);transition:width .05s linear;box-shadow:0 0 12px var(--purple)}

/* ── Layout ── */
.arc-page{min-height:100vh;background:var(--bg)}
.arc-content{padding-top:90px;padding-bottom:60px}

/* ── Search Bar (top) ── */
.arc-search-section{max-width:600px;margin:0 auto;padding:20px 40px 10px;display:flex;align-items:center;justify-content:center}
.arc-search-wrap{position:relative;flex:1;max-width:480px}
.arc-search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
.arc-search-input{width:100%;padding:12px 44px 12px 44px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);font-family:var(--fb);font-size:15px;color:#fff;outline:none;transition:all .25s}
.arc-search-input::placeholder{color:rgba(255,255,255,0.3)}
.arc-search-input:focus{border-color:rgba(146,16,246,0.6);box-shadow:0 0 0 3px rgba(146,16,246,0.12);background:rgba(255,255,255,0.08)}
.arc-search-clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;border:none;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:11px;cursor:pointer;display:grid;place-items:center;transition:all .15s}
.arc-search-clear:hover{background:rgba(146,16,246,0.3);color:#fff}

/* ── Filter Chips (Prime Video compact tabs) ── */
.arc-chips{display:flex;gap:6px;overflow-x:auto;flex-wrap:nowrap;padding:4px 0 8px;-ms-overflow-style:none;scrollbar-width:none;scroll-snap-type:x proximity}
.arc-chips::-webkit-scrollbar{display:none}
.arc-chip{padding:7px 20px;border-radius:100px;font-family:var(--fb);font-size:12px;font-weight:600;letter-spacing:.3px;text-transform:capitalize;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.55);cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;scroll-snap-align:start}
.arc-chip:hover{color:#fff;border-color:rgba(146,16,246,0.5);background:rgba(255,255,255,0.08)}
.arc-chip.active{background:linear-gradient(135deg,var(--purple2),var(--purple));border-color:transparent;color:#fff;box-shadow:0 4px 16px rgba(146,16,246,0.3)}

/* ── Section Row (Prime Video style) ── */
.arc-row{margin-bottom:36px;position:relative}
.arc-row-head{display:flex;align-items:center;justify-content:space-between;padding:0 40px;margin-bottom:14px}
.arc-row-title{font-family:var(--fh);font-size:clamp(22px,2.2vw,30px);font-weight:400;letter-spacing:3px;color:#fff;text-transform:uppercase}
.arc-row-seeall{font-family:var(--fb);font-size:13px;font-weight:600;color:var(--accent);text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:all .2s;opacity:.8}
.arc-row-seeall:hover{opacity:1;gap:8px}

/* ── Scroll Track ── */
.arc-track-wrap{position:relative}
.arc-track{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:8px 40px 16px;scroll-behavior:smooth;-ms-overflow-style:none;scrollbar-width:none}
.arc-track::-webkit-scrollbar{display:none}
.arc-arrow{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(10,10,20,0.85);border:1px solid rgba(255,255,255,0.12);color:#fff;display:grid;place-items:center;cursor:pointer;z-index:10;transition:all .2s;backdrop-filter:blur(8px);opacity:0}
.arc-track-wrap:hover .arc-arrow{opacity:1}
.arc-arrow:hover{background:rgba(146,16,246,0.4);border-color:rgba(146,16,246,0.6);transform:translateY(-50%) scale(1.08)}
.arc-arrow.left{left:8px}
.arc-arrow.right{right:8px}
.arc-arrow svg{width:18px;height:18px}

/* ── Top 10 Row (Prime Video style with big numbers) ── */
.arc-top10-track{display:flex;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;padding:10px 40px 20px;scroll-behavior:smooth;-ms-overflow-style:none;scrollbar-width:none;align-items:flex-end}
.arc-top10-track::-webkit-scrollbar{display:none}
.arc-top10-item{flex:0 0 auto;display:flex;align-items:flex-end;scroll-snap-align:start;position:relative;margin-right:12px}
.arc-top10-num{font-family:var(--fh);font-size:clamp(120px,14vw,220px);font-weight:400;line-height:.82;color:transparent;-webkit-text-stroke:3px rgba(255,255,255,0.35);margin-right:-40px;position:relative;z-index:1;user-select:none;transition:all .3s;text-shadow:0 0 40px rgba(146,16,246,0.15)}
.arc-top10-item:hover .arc-top10-num{-webkit-text-stroke-color:rgba(146,16,246,0.6)}
.arc-top10-card{flex:0 0 auto;width:clamp(240px,20vw,320px);border-radius:14px;overflow:hidden;cursor:pointer;position:relative;transition:all .3s cubic-bezier(.22,1,.36,1);scroll-snap-align:start;border:2px solid transparent}
.arc-top10-card:hover{transform:scale(1.05) translateY(-4px);border-color:rgba(146,16,246,0.5);box-shadow:0 12px 40px rgba(146,16,246,0.25),0 4px 20px rgba(0,0,0,0.5);z-index:5}
.arc-top10-thumb{width:100%;aspect-ratio:3/2;overflow:hidden;background:linear-gradient(150deg,rgba(146,16,246,0.3),rgba(97,4,151,0.15))}
.arc-top10-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.arc-top10-card:hover .arc-top10-thumb img{transform:scale(1.08)}
.arc-top10-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;background:linear-gradient(150deg,rgba(146,16,246,0.35),rgba(97,4,151,0.18))}
.arc-top10-info{position:absolute;bottom:0;left:0;right:0;padding:12px;background:linear-gradient(to top,rgba(0,0,0,0.9) 0%,transparent 100%)}
.arc-top10-name{font-family:var(--fb);font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.arc-top10-badge{position:absolute;top:8px;right:8px;padding:3px 10px;border-radius:6px;font-family:var(--fm);font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;background:rgba(146,16,246,0.85);color:#fff;backdrop-filter:blur(4px)}
.arc-top10-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);opacity:0;transition:opacity .2s}
.arc-top10-card:hover .arc-top10-play{opacity:1}
.arc-top10-play-btn{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.95);display:grid;place-items:center;box-shadow:0 6px 24px rgba(0,0,0,0.5);transform:scale(0.6);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.arc-top10-card:hover .arc-top10-play-btn{transform:scale(1)}

/* ── Standard Row Card (landscape) ── */
.arc-card{flex:0 0 auto;width:clamp(240px,20vw,320px);min-width:0;border-radius:12px;overflow:hidden;cursor:pointer;background:var(--bg2);border:1px solid rgba(255,255,255,0.06);scroll-snap-align:start;transition:all .3s cubic-bezier(.22,1,.36,1);position:relative}
.arc-card:hover{transform:scale(1.04) translateY(-6px);border-color:rgba(146,16,246,0.45);box-shadow:0 16px 48px rgba(146,16,246,0.2),0 8px 24px rgba(0,0,0,0.5);z-index:5}
.arc-card-thumb{width:100%;aspect-ratio:16/9;overflow:hidden;position:relative;background:linear-gradient(150deg,rgba(146,16,246,0.25),rgba(97,4,151,0.12))}
.arc-card-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.arc-card:hover .arc-card-thumb img{transform:scale(1.07)}
.arc-card-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;background:linear-gradient(150deg,rgba(146,16,246,0.3),rgba(97,4,151,0.15))}
.arc-card-badge{position:absolute;top:8px;right:8px;padding:3px 10px;border-radius:6px;font-family:var(--fm);font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;backdrop-filter:blur(6px);z-index:2}
.badge-trending{background:rgba(239,68,68,0.85);color:#fff}
.badge-new{background:rgba(34,197,94,0.85);color:#fff}
.badge-top{background:rgba(245,200,66,0.85);color:#000}
.badge-popular{background:rgba(59,130,246,0.85);color:#fff}
.badge-classic{background:rgba(168,85,247,0.85);color:#fff}
.arc-card-shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,10,16,0.85) 0%,rgba(8,10,16,0.2) 50%,transparent 100%)}
.arc-card-info{padding:8px 10px 6px}
.arc-card-name{font-family:var(--fb);font-size:12px;font-weight:700;color:#fff;margin-bottom:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.arc-card-meta{font-size:10px;color:rgba(255,255,255,0.5);display:flex;align-items:center;gap:4px}
.arc-card-cat{font-family:var(--fm);font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:2px 8px;border-radius:100px;background:rgba(146,16,246,0.2);border:1px solid rgba(146,16,246,0.3);color:#c084fc}
.arc-card-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);opacity:0;transition:opacity .2s;z-index:3}
.arc-card:hover .arc-card-play{opacity:1}
.arc-card-play-btn{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.95);display:grid;place-items:center;box-shadow:0 6px 24px rgba(0,0,0,0.5);transform:scale(0.5);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.arc-card:hover .arc-card-play-btn{transform:scale(1)}

/* ── Vertical Card (portrait) ── */
.arc-card-vertical{flex:0 0 auto;width:clamp(160px,14vw,200px);min-width:0;border-radius:12px;overflow:hidden;cursor:pointer;background:var(--bg2);border:1px solid rgba(255,255,255,0.06);scroll-snap-align:start;transition:all .3s cubic-bezier(.22,1,.36,1);position:relative}
.arc-card-vertical:hover{transform:scale(1.04) translateY(-6px);border-color:rgba(146,16,246,0.45);box-shadow:0 16px 48px rgba(146,16,246,0.2),0 8px 24px rgba(0,0,0,0.5);z-index:5}
.arc-card-vertical .arc-card-thumb{aspect-ratio:3/4;overflow:hidden;position:relative;background:linear-gradient(150deg,rgba(146,16,246,0.25),rgba(97,4,151,0.12))}
.arc-card-vertical .arc-card-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.arc-card-vertical:hover .arc-card-thumb img{transform:scale(1.07)}
.arc-card-vertical .arc-card-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;background:linear-gradient(150deg,rgba(146,16,246,0.3),rgba(97,4,151,0.15))}
.arc-card-vertical .arc-card-badge{position:absolute;top:8px;right:8px;padding:3px 10px;border-radius:6px;font-family:var(--fm);font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;backdrop-filter:blur(6px);z-index:2}
.arc-card-vertical .arc-card-info{padding:10px 10px 8px}
.arc-card-vertical .arc-card-name{font-family:var(--fb);font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.arc-card-vertical .arc-card-meta{font-size:10px;color:rgba(255,255,255,0.5);display:flex;align-items:center;gap:4px}
.arc-card-vertical .arc-card-shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,10,16,0.85) 0%,rgba(8,10,16,0.2) 50%,transparent 100%)}
.arc-card-vertical .arc-card-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);opacity:0;transition:opacity .2s;z-index:3}
.arc-card-vertical:hover .arc-card-play{opacity:1}
.arc-card-vertical .arc-card-play-btn{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.95);display:grid;place-items:center;box-shadow:0 6px 24px rgba(0,0,0,0.5);transform:scale(0.5);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.arc-card-vertical:hover .arc-card-play-btn{transform:scale(1)}

/* ── Featured Hero Banner ── */
.arc-hero{position:relative;max-width:1400px;margin:0 auto 36px;padding:0 40px}
.arc-hero-card{position:relative;border-radius:20px;overflow:hidden;cursor:pointer;aspect-ratio:21/9;max-height:420px;background:linear-gradient(150deg,rgba(146,16,246,0.3),rgba(97,4,151,0.15))}
.arc-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 6s}
.arc-hero-card:hover .arc-hero-bg{transform:scale(1.03)}
.arc-hero-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:72px;background:linear-gradient(150deg,rgba(146,16,246,0.35),rgba(97,4,151,0.18))}
.arc-hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(10,10,20,0.92) 0%,rgba(10,10,20,0.6) 40%,rgba(10,10,20,0.1) 70%,transparent 100%)}
.arc-hero-content{position:absolute;bottom:40px;left:40px;right:40%;z-index:2}
.arc-hero-badge{display:inline-block;padding:4px 14px;border-radius:6px;font-family:var(--fm);font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:rgba(146,16,246,0.85);color:#fff;margin-bottom:12px}
.arc-hero-name{font-family:var(--fh);font-size:clamp(32px,4vw,52px);font-weight:400;letter-spacing:2px;color:#fff;line-height:1;margin-bottom:10px}
.arc-hero-desc{font-family:var(--fb);font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:20px;max-width:440px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.arc-hero-play{display:inline-flex;align-items:center;gap:10px;padding:12px 28px;border-radius:12px;background:linear-gradient(135deg,var(--purple),var(--purple2));border:none;color:#fff;font-family:var(--fb);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(146,16,246,0.35)}
.arc-hero-play:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(146,16,246,0.5)}
.arc-hero-play svg{width:16px;height:16px}

/* ── Loading & Empty ── */
.arc-loading{display:flex;align-items:center;justify-content:center;gap:12px;padding:160px 20px 80px;font-family:var(--fb);font-size:14px;color:var(--muted)}
.arc-spin{width:22px;height:22px;border-radius:50%;border:2.5px solid rgba(146,16,246,0.2);border-top-color:var(--purple);animation:arcSpin .7s linear infinite}
@keyframes arcSpin{to{transform:rotate(360deg)}}
.arc-empty{text-align:center;padding:100px 20px}
.arc-empty-ico{font-size:48px;margin-bottom:14px;opacity:.8}
.arc-empty-txt{font-family:var(--fb);font-size:15px;color:var(--muted);line-height:1.7}

/* ── Carousel Dots (mobile hero) ── */
.arc-dots{display:none;justify-content:center;gap:8px;margin-top:14px}
.arc-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.25);border:none;cursor:pointer;transition:all .25s}
.arc-dot.active{background:var(--purple);width:24px;border-radius:4px}

/* ────────────────────────────────────────────────
   RESPONSIVE — TABLET (≤ 1024px)
   ──────────────────────────────────────────────── */
@media(max-width:1024px){
  .arc-search-section{padding:16px 20px 8px}
  .arc-row-head{padding:0 20px}
  .arc-track,.arc-top10-track{padding:8px 20px 16px}
  .arc-hero{padding:0 20px;margin-bottom:28px}
  .arc-hero-content{right:30%}
}

/* ────────────────────────────────────────────────
   DESKTOP — All Games grid fills full width
   ──────────────────────────────────────────────── */
/* ── All Games flat grid ── */
#all-games{padding:0 40px !important;max-width:100% !important}
#all-games .arc-allgrid{display:grid !important;grid-template-columns:repeat(auto-fill,minmax(200px,1fr)) !important;gap:24px !important}
#all-games .arc-card{width:100% !important;flex:none !important;margin-right:0 !important;border-radius:12px !important;overflow:hidden !important;border:1px solid rgba(255,255,255,0.06) !important;transition:transform .3s cubic-bezier(.22,1,.36,1) !important}
#all-games .arc-card:hover{transform:translateY(-6px) scale(1.03) !important;border-color:rgba(146,16,246,0.5) !important;box-shadow:0 16px 48px rgba(146,16,246,0.2),0 8px 24px rgba(0,0,0,0.5) !important;z-index:5}
#all-games .arc-card-thumb{border-radius:12px 12px 0 0 !important;overflow:hidden !important}
#all-games .arc-card-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s !important}
#all-games .arc-card:hover .arc-card-thumb img{transform:scale(1.08) !important}
#all-games .arc-card-info{padding:10px 12px 8px !important}
#all-games .arc-card-name{font-size:14px !important;font-weight:700 !important}
#all-games .arc-card-play-btn{width:46px !important;height:46px !important}
.arc-search-grid .arc-card{width:100% !important;flex:none !important}

/* ────────────────────────────────────────────────
   RESPONSIVE — MOBILE (≤ 768px)
   Prime Video style: full-bleed hero, compact rows
   ──────────────────────────────────────────────── */
@media(max-width:768px){
  .arc-content{padding-top:76px;padding-bottom:40px}

  /* Search + chips: stack vertically, chips scroll horizontally */
  .arc-search-section{flex-direction:column;align-items:stretch;gap:8px;padding:12px 16px 4px}
  .arc-search-input{padding:10px 40px 10px 40px;font-size:14px;border-radius:10px}
  .arc-chips{gap:5px;padding:2px 0 6px}
  .arc-chip{padding:6px 14px;font-size:11px}

  /* Section rows: tighter padding, smaller titles */
  .arc-row{margin-bottom:50px !important}
  .arc-row-head{padding:0 16px;margin-bottom:10px}
  .arc-row-title{font-size:20px;letter-spacing:2px}
  .arc-row-seeall{font-size:12px}

  /* Scroll tracks: edge-to-edge, bigger gap for thumb-scroll feel */
  .arc-track{display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;padding:6px 16px 12px 16px !important;gap:16px !important;scroll-snap-type:none !important}
  .arc-top10-track{padding:6px 16px 12px;gap:0}

  /* Hide scroll arrows on mobile (swipe instead) */
  .arc-arrow{display:none}

  /* Cards: compact landscape for rows */
  .arc-card{width:170px !important;border-radius:10px;margin-right:14px !important;flex-shrink:0 !important}
  .arc-card-thumb{aspect-ratio:16/7}
  .arc-card-thumb{aspect-ratio:16/10}
  .arc-card-info{padding:8px 10px}
  .arc-card-name{font-size:12px;margin-bottom:2px}
  .arc-card-meta{font-size:10px}
  .arc-card-badge{top:6px;left:6px;padding:2px 7px;font-size:7px}
  .arc-card-fallback{font-size:28px}
  .arc-card-play-btn{width:36px;height:36px}

  /* Vertical cards: portrait for puzzle/board sections */
  .arc-card-vertical{width:140px !important;border-radius:10px;margin-right:14px !important;flex-shrink:0 !important}
  .arc-card-vertical .arc-card-thumb{aspect-ratio:3/4}
  .arc-card-vertical .arc-card-fallback{font-size:36px}
  .arc-card-vertical .arc-card-badge{top:6px;left:6px;padding:2px 7px;font-size:7px}
  .arc-card-vertical .arc-card-info{padding:6px 8px}
  .arc-card-vertical .arc-card-name{font-size:11px}
  .arc-card-vertical .arc-card-play-btn{width:36px;height:36px}

  /* ── Hero: full-bleed, taller, stacked layout ── */
  .arc-hero{padding:0;margin-bottom:28px}
  .arc-hero-card{border-radius:0;aspect-ratio:16/10;max-height:none}
  .arc-hero-overlay{background:linear-gradient(to top,rgba(10,10,20,0.95) 0%,rgba(10,10,20,0.5) 40%,rgba(10,10,20,0.15) 70%,transparent 100%)}
  .arc-hero-content{left:16px;right:16px;bottom:20px;top:auto}
  .arc-hero-badge{font-size:8px;padding:3px 10px;margin-bottom:8px}
  .arc-hero-name{font-size:26px;letter-spacing:1.5px;margin-bottom:6px}
  .arc-hero-desc{font-size:12px;line-height:1.5;margin-bottom:14px;max-width:100%;-webkit-line-clamp:2}
  .arc-hero-play{padding:10px 22px;font-size:13px;border-radius:10px;gap:8px}

  /* Show carousel dots under hero */
  .arc-dots{display:flex}

  /* Top 10: portrait cards with visible big numbers */
  .arc-top10-item{align-items:flex-end;margin-right:10px}
  .arc-top10-num{font-size:72px;margin-right:-14px;-webkit-text-stroke-width:2}
  .arc-top10-card{width:160px;border-radius:10px}
  .arc-top10-card:hover{transform:none;border-color:transparent;box-shadow:none}
  .arc-top10-thumb{aspect-ratio:3/4}
  .arc-top10-fallback{font-size:32px}
  .arc-top10-info{padding:8px}
  .arc-top10-name{font-size:11px}
  .arc-top10-badge{top:6px;right:6px;padding:2px 7px;font-size:7px}
  .arc-top10-play{opacity:1;background:rgba(0,0,0,0.2)}
  .arc-top10-play-btn{width:34px;height:34px;transform:scale(1)}

  /* All Games grid: 2 columns on mobile */
  #all-games{padding:0 12px !important;max-width:100% !important;margin-top:40px !important}
  #all-games .arc-allgrid{display:grid !important;grid-template-columns:repeat(2,1fr) !important;gap:12px !important}
  #all-games .arc-card{width:100% !important;margin-right:0 !important;border-radius:10px !important;overflow:hidden !important}
  #all-games .arc-card-thumb{aspect-ratio:4/3 !important;border-radius:10px 10px 0 0 !important}
  #all-games .arc-card-info{padding:6px 8px 4px !important}
  #all-games .arc-card-name{font-size:12px !important}
  #all-games .arc-card-play-btn{width:36px !important;height:36px !important}

  /* Search results grid: 2 columns */
  .arc-search-grid{display:grid !important;grid-template-columns:repeat(2,1fr) !important;gap:16px !important}
  .arc-search-grid .arc-card{width:100% !important;flex:none !important;border-radius:8px;margin-right:0 !important}
  .arc-search-grid .arc-card-thumb{aspect-ratio:4/3}
  .arc-search-grid .arc-card-info{padding:6px 8px}
  .arc-search-grid .arc-card-name{font-size:11px}
}

/* ────────────────────────────────────────────────
   RESPONSIVE — SMALL PHONE (≤ 420px)
   ──────────────────────────────────────────────── */
@media(max-width:420px){
  .arc-hero-name{font-size:22px}
  .arc-hero-desc{font-size:11px;-webkit-line-clamp:2;margin-bottom:12px}
  .arc-hero-play{padding:8px 18px;font-size:12px}

  .arc-top10-num{font-size:52px;margin-right:-8px;-webkit-text-stroke-width:1.5}
  .arc-top10-card{width:130px}
  .arc-top10-fallback{font-size:26px}

  .arc-card{width:calc(50% - 5px) !important}
  .arc-card-vertical{width:calc(50% - 5px) !important}
  .arc-row-head{padding:0 14px}
  .arc-row-title{font-size:18px;letter-spacing:1.5px}

  /* All Games small phone: 2 columns, tighter */
  #all-games{padding:0 8px !important;margin-top:30px !important}
  #all-games .arc-allgrid{gap:10px !important}
  #all-games .arc-card{border-radius:8px !important}
  #all-games .arc-card-thumb{aspect-ratio:1/1 !important;border-radius:8px 8px 0 0 !important}
  #all-games .arc-card-info{padding:4px 6px 3px !important}
  #all-games .arc-card-name{font-size:10px !important}

  .arc-chip{padding:5px 12px;font-size:10px;gap:4px}
}
`

/* ── Badge helpers ── */
const BADGES = ['TRENDING', 'NEW', 'TOP RATED', 'POPULAR', 'CLASSIC']
const BADGE_CLASSES = ['badge-trending', 'badge-new', 'badge-top', 'badge-popular', 'badge-classic']
function getBadge(idx) {
  const i = idx % BADGES.length
  return { text: BADGES[i], cls: BADGE_CLASSES[i] }
}

/* ── Category grouping for rows ── */
const CATEGORY_ROWS = {
  'Action & Arcade': ['snake', 'flappy', 'space', 'bounce', 'catch', 'arrowescape', 'carlaunch'],
  'Puzzle & Brain': ['2048', 'sudoku', 'minesweeper', 'hanoi', 'bejeweled', 'memory', 'tower'],
  'Classic Games': ['tetris', 'breakout', 'bowling', 'stack', 'bubbleshooter'],
  'Board & Strategy': ['chess', 'tictactoe', 'connect4', 'ludo', 'rps', 'snakeandladder'],
  'Skill & Speed': ['reaction', 'simon', 'whackamole', 'stressbuster', 'wordscramble', 'math', 'maze'],
}
const ROW_ORDER = ['Action & Arcade', 'Puzzle & Brain', 'Classic Games', 'Board & Strategy', 'Skill & Speed']

const FALLBACK_GAMES = [
  { id: 1, name: 'Snake', slug: 'snake', category: 'snake', game_type: 'promogames', play_count: 1240, thumbnail_url: null },
  { id: 2, name: 'Tetris', slug: 'tetris', category: 'tetris', game_type: 'promogames', play_count: 1180, thumbnail_url: null },
  { id: 3, name: '2048', slug: '2048', category: '2048', game_type: 'promogames', play_count: 980, thumbnail_url: null },
  { id: 4, name: 'Chess', slug: 'chess', category: 'chess', game_type: 'branded', play_count: 920, thumbnail_url: null },
  { id: 5, name: 'Flappy Bird', slug: 'flappy', category: 'flappy', game_type: 'promogames', play_count: 870, thumbnail_url: null },
  { id: 6, name: 'Minesweeper', slug: 'minesweeper', category: 'minesweeper', game_type: 'promogames', play_count: 810, thumbnail_url: null },
  { id: 7, name: 'Tic Tac Toe', slug: 'tictactoe', category: 'tictactoe', game_type: 'branded', play_count: 760, thumbnail_url: null },
  { id: 8, name: 'Breakout', slug: 'breakout', category: 'breakout', game_type: 'promogames', play_count: 720, thumbnail_url: null },
  { id: 9, name: 'Sudoku', slug: 'sudoku', category: 'sudoku', game_type: 'promogames', play_count: 680, thumbnail_url: null },
  { id: 10, name: 'Connect 4', slug: 'connect4', category: 'connect4', game_type: 'branded', play_count: 640, thumbnail_url: null },
  { id: 11, name: 'Memory Match', slug: 'memory', category: 'memory', game_type: 'promogames', play_count: 590, thumbnail_url: null },
  { id: 12, name: 'Bubble Shooter', slug: 'bubbleshooter', category: 'bubbleshooter', game_type: 'promogames', play_count: 550, thumbnail_url: null },
  { id: 13, name: 'Bowling', slug: 'bowling', category: 'bowling', game_type: 'promogames', play_count: 510, thumbnail_url: null },
  { id: 14, name: 'Simon', slug: 'simon', category: 'simon', game_type: 'promogames', play_count: 470, thumbnail_url: null },
  { id: 15, name: 'Reaction Test', slug: 'reaction', category: 'reaction', game_type: 'promogames', play_count: 430, thumbnail_url: null },
  { id: 16, name: 'Whack-a-Mole', slug: 'whackamole', category: 'whackamole', game_type: 'promogames', play_count: 400, thumbnail_url: null },
  { id: 17, name: 'Space Invaders', slug: 'space', category: 'space', game_type: 'promogames', play_count: 380, thumbnail_url: null },
  { id: 18, name: 'Tower of Hanoi', slug: 'hanoi', category: 'hanoi', game_type: 'promogames', play_count: 340, thumbnail_url: null },
  { id: 19, name: 'Word Scramble', slug: 'wordscramble', category: 'wordscramble', game_type: 'promogames', play_count: 310, thumbnail_url: null },
  { id: 20, name: 'Maze Runner', slug: 'maze', category: 'maze', game_type: 'promogames', play_count: 280, thumbnail_url: null },
]

function categorizeGame(game) {
  const cat = (game.category || '').toLowerCase()
  for (const [row, cats] of Object.entries(CATEGORY_ROWS)) {
    if (cats.includes(cat)) return row
  }
  return 'Skill & Speed'
}

/* ── Scroll arrow helper ── */
function ScrollArrow({ direction, onClick }) {
  return (
    <button className={`arc-arrow ${direction}`} onClick={onClick} aria-label={`Scroll ${direction}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'left'
          ? <><polyline points="15 18 9 12 15 6"/></>
          : <><polyline points="9 18 15 12 9 6"/></>}
      </svg>
    </button>
  )
}

function useScrollTrack() {
  const ref = useRef(null)
  const scroll = (dir) => {
    if (!ref.current) return
    const amount = ref.current.offsetWidth * 0.7
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }
  return { ref, scrollLeft: () => scroll('left'), scrollRight: () => scroll('right') }
}

/* ── Top 10 Card ── */
function Top10Card({ game, rank, onPlay }) {
  const thumb = game.thumbnail_url || game.game_logo_url || game.bg_image_url
  return (
    <div className="arc-top10-item">
      <span className="arc-top10-num">{rank}</span>
      <div className="arc-top10-card" onClick={() => onPlay(game)}>
        <div className="arc-top10-thumb">
          {thumb
            ? <img src={thumb} alt={game.name} loading="lazy" />
            : <div className="arc-top10-fallback">🎮</div>}
        </div>
        <div className="arc-top10-badge">{getBadge(rank).text}</div>
        <div className="arc-top10-info">
          <div className="arc-top10-name">{game.name}</div>
        </div>
        <div className="arc-top10-play">
          <div className="arc-top10-play-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#9210f6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Standard Row Card ── */
function RowCard({ game, idx, onPlay, style }) {
  const thumb = game.thumbnail_url || game.game_logo_url || game.bg_image_url
  const badge = getBadge(idx)
  return (
    <div className="arc-card" style={{...style, marginRight: 20, flexShrink: 0, minWidth: 0}} onClick={() => onPlay(game)}>
      <div className="arc-card-thumb">
        {thumb
          ? <img src={thumb} alt={game.name} loading="lazy" />
          : <div className="arc-card-fallback">🎮</div>}
        <div className="arc-card-shade" />
        <div className={`arc-card-badge ${badge.cls}`}>{badge.text}</div>
      </div>
      <div className="arc-card-info">
        <div className="arc-card-name">{game.name}</div>
        <div className="arc-card-meta">
          <span className="arc-card-cat">{game.category || 'Game'}</span>
        </div>
      </div>
      <div className="arc-card-play">
        <div className="arc-card-play-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9210f6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  )
}

/* ── Vertical Card (portrait) ── */
function VerticalCard({ game, idx, onPlay }) {
  const thumb = game.thumbnail_url || game.game_logo_url || game.bg_image_url
  const badge = getBadge(idx)
  return (
    <div className="arc-card-vertical" style={{marginRight: 20, flexShrink: 0, minWidth: 0}} onClick={() => onPlay(game)}>
      <div className="arc-card-thumb">
        {thumb
          ? <img src={thumb} alt={game.name} loading="lazy" />
          : <div className="arc-card-fallback">🎮</div>}
        <div className="arc-card-shade" />
        <div className={`arc-card-badge ${badge.cls}`}>{badge.text}</div>
      </div>
      <div className="arc-card-info">
        <div className="arc-card-name">{game.name}</div>
        <div className="arc-card-meta">
          <span className="arc-card-cat">{game.category || 'Game'}</span>
        </div>
      </div>
      <div className="arc-card-play">
        <div className="arc-card-play-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9210f6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  )
}

/* ── Scrollable Row ── */
function ScrollRow({ title, games, onPlay, seeAllLabel, cardType = 'horizontal' }) {
  const { ref, scrollLeft, scrollRight } = useScrollTrack()
  const CardComponent = cardType === 'vertical' ? VerticalCard : RowCard
  return (
    <div className="arc-row">
      <div className="arc-row-head">
        <h2 className="arc-row-title">{title}</h2>
        {seeAllLabel && <a href="#all-games" className="arc-row-seeall">{seeAllLabel} ▸</a>}
      </div>
      <div className="arc-track-wrap">
        <ScrollArrow direction="left" onClick={scrollLeft} />
        <div className="arc-track" ref={ref}>
          {games.map((g, i) => <CardComponent key={g.id} game={g} idx={i} onPlay={onPlay} />)}
        </div>
        <ScrollArrow direction="right" onClick={scrollRight} />
      </div>
    </div>
  )
}

/* ── Top 10 Row ── */
function Top10Row({ games, onPlay }) {
  const { ref, scrollLeft, scrollRight } = useScrollTrack()
  return (
    <div className="arc-row">
      <div className="arc-row-head">
        <h2 className="arc-row-title">🔥 Top 10 Games</h2>
        <a href="#all-games" className="arc-row-seeall">See All ▸</a>
      </div>
      <div className="arc-track-wrap">
        <ScrollArrow direction="left" onClick={scrollLeft} />
        <div className="arc-top10-track" ref={ref}>
          {games.slice(0, 10).map((g, i) => <Top10Card key={g.id} game={g} rank={i + 1} onPlay={onPlay} />)}
        </div>
        <ScrollArrow direction="right" onClick={scrollRight} />
      </div>
    </div>
  )
}


export default function ArcadePage() {
  const location = useLocation()
  const [games, setGames] = useState([])
  const [featured, setFeatured] = useState([])
  const [promogames, setPromogames] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [heroIndex, setHeroIndex] = useState(0)
  const [showWelcome, setShowWelcome] = useState(location.state?.welcomeBonus === true)

  useEffect(() => {
    if (location.state?.welcomeBonus) window.history.replaceState({}, document.title)
  }, [])

  useEffect(() => {
    fetch('/api/play/play-page-games')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.games && d.games.length > 0) {
          setGames(d.games || [])
          setFeatured(d.featured || [])
          setPromogames(d.promogames || [])
        } else {
          setGames(FALLBACK_GAMES)
          setFeatured(FALLBACK_GAMES.filter(g => g.game_type === 'branded'))
          setPromogames(FALLBACK_GAMES.filter(g => g.game_type === 'promogames'))
        }
      })
      .catch(() => {
        setGames(FALLBACK_GAMES)
        setFeatured(FALLBACK_GAMES.filter(g => g.game_type === 'branded'))
        setPromogames(FALLBACK_GAMES.filter(g => g.game_type === 'promogames'))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      document.documentElement.style.setProperty('--scroll-pct', `${pct}%`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Auto-rotate hero on mobile */
  const allGames = [...featured, ...promogames]
  useEffect(() => {
    if (allGames.length <= 1) return
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % Math.min(allGames.length, 5))
    }, 5000)
    return () => clearInterval(timer)
  }, [allGames.length])

  const handlePlay = useCallback((game) => setActiveGame(game), [])
  const handleSwitch = useCallback((game) => setActiveGame(game), [])
  const handleClose = useCallback(() => setActiveGame(null), [])

  /* filter by search */
  const searchFiltered = searchQuery.trim()
    ? allGames.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || (g.category || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : allGames

  /* filter by category chip */
  const categoryFiltered = activeCategory === 'all'
    ? searchFiltered
    : searchFiltered.filter(g => categorizeGame(g) === activeCategory)

  /* sort by play_count desc for top 10 */
  const top10 = [...allGames].sort((a, b) => (b.play_count || 0) - (a.play_count || 0)).slice(0, 10)

  /* group games by category row */
  const rowGames = {}
  for (const row of ROW_ORDER) rowGames[row] = []
  for (const g of allGames) {
    const row = categorizeGame(g)
    if (rowGames[row]) rowGames[row].push(g)
  }

  /* unique categories for chips */
  const categories = ['all', ...ROW_ORDER]

  /* hero games for carousel (up to 5) */
  const heroGames = allGames.slice(0, 5)
  const heroGame = heroGames[heroIndex] || heroGames[0] || null

  return (
    <>
      <style>{CSS}</style>
      <MascotBubble />
      <MascotCursor />
      <div className="arc-scroll-bar" />
      <PlayerNavbar />

      <div className="arc-page">
        <div className="arc-content">
          {loading ? (
            <div className="arc-loading"><div className="arc-spin" /> Loading games…</div>
          ) : (
            <>
              {/* ── Search Bar ── */}
              <div className="arc-search-section">
                <div className="arc-search-wrap">
                  <svg className="arc-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    className="arc-search-input"
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="arc-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                  )}
                </div>
                {/* Filter chips hidden — search only */}
              </div>

              {/* ── Search Results View ── */}
              {searchQuery.trim() || activeCategory !== 'all' ? (
                <div style={{ margin: '0 auto', padding: '20px 20px' }}>
                  <h2 className="arc-row-title" style={{ marginBottom: 20 }}>
                    {searchQuery.trim() ? `Results for "${searchQuery}"` : activeCategory}
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--muted)', marginLeft: 12, letterSpacing: 1 }}>
                      {categoryFiltered.length} games
                    </span>
                  </h2>
                  {categoryFiltered.length === 0 ? (
                    <div className="arc-empty">
                      <div className="arc-empty-ico">🔍</div>
                      <div className="arc-empty-txt">No games found — try a different search or filter</div>
                    </div>
                  ) : (
                    <div className="arc-search-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px 24px' }}>
                      {categoryFiltered.map((g, i) => (
                        <RowCard key={g.id} game={g} idx={i} onPlay={handlePlay} style={{ width: '100%', minWidth: 0 }} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* ── Hero Banner (carousel) ── */}
                  {heroGame && (
                    <div className="arc-hero">
                      <div className="arc-hero-card" onClick={() => handlePlay(heroGame)}>
                        {(heroGame.thumbnail_url || heroGame.game_logo_url || heroGame.bg_image_url)
                          ? <img className="arc-hero-bg" src={heroGame.thumbnail_url || heroGame.game_logo_url || heroGame.bg_image_url} alt={heroGame.name} loading="lazy" decoding="async" />
                          : <div className="arc-hero-fallback">🎮</div>}
                        <div className="arc-hero-overlay" />
                        <div className="arc-hero-content">
                          <div className="arc-hero-badge">★ Featured Game</div>
                          <h1 className="arc-hero-name">{heroGame.name}</h1>
                          <p className="arc-hero-desc">
                            {heroGame.description || `Play ${heroGame.name} — one of our most popular ${heroGame.category || 'games'}! Challenge yourself and climb the leaderboard.`}
                          </p>
                          <button className="arc-hero-play" onClick={(e) => { e.stopPropagation(); handlePlay(heroGame) }}>
                            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Play Now
                          </button>
                        </div>
                      </div>
                      {heroGames.length > 1 && (
                        <div className="arc-dots">
                          {heroGames.map((_, i) => (
                            <button
                              key={i}
                              className={`arc-dot ${i === heroIndex ? 'active' : ''}`}
                              onClick={() => setHeroIndex(i)}
                              aria-label={`Slide ${i + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Top 10 Row ── */}
                  {top10.length > 0 && <Top10Row games={top10} onPlay={handlePlay} />}

                  {/* ── Category Rows ── */}
                  {ROW_ORDER.map(row => (
                    rowGames[row].length > 0 && (
                      <ScrollRow
                        key={row}
                        title={row}
                        games={rowGames[row]}
                        onPlay={handlePlay}
                        seeAllLabel="See All"
                        cardType={(row === 'Puzzle & Brain' || row === 'Board & Strategy') ? 'vertical' : 'horizontal'}
                      />
                    )
                  ))}

                  {/* ── All Games section ── */}
                  <div id="all-games" style={{ margin: '40px auto 0', padding: '0 40px' }}>
                    <h2 className="arc-row-title" style={{ marginBottom: 24, textAlign: 'center' }}>
                      All Games
                      <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: 'var(--muted)', marginLeft: 12, letterSpacing: 1 }}>
                        {allGames.length} games
                      </span>
                    </h2>
                    <div className="arc-allgrid">
                      {allGames.map((g, i) => (
                        <RowCard key={g.id} game={g} idx={i} onPlay={handlePlay} style={{ width: '100%', minWidth: 0, margin: 0 }} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {activeGame && (
        <GameModal
          game={activeGame}
          allGames={searchQuery.trim() || activeCategory !== 'all' ? categoryFiltered : allGames}
          onClose={handleClose}
          onSwitch={handleSwitch}
          isLoggedIn={!!(localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken'))}
        />
      )}

      {showWelcome && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,2,12,0.85)', backdropFilter: 'blur(12px)',
          animation: 'gmFadeIn 0.2s ease both',
        }}>
          <div style={{
            background: 'linear-gradient(160deg, #0d0820, #12082a)',
            border: '1px solid rgba(146,16,246,0.3)',
            borderRadius: 24, padding: '48px 40px 36px',
            maxWidth: 420, width: '90%', textAlign: 'center',
            boxShadow: '0 0 60px rgba(146,16,246,0.15), 0 24px 80px rgba(0,0,0,0.5)',
            animation: 'gmSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', letterSpacing: 2, marginBottom: 8 }}>Welcome Aboard!</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 24 }}>
              You've earned a bonus of <strong style={{ color: '#f5c842' }}>100 Promo Coins!</strong> Play more and earn more!
            </p>
            <button onClick={() => setShowWelcome(false)} style={{
              width: '100%', padding: '14px 24px',
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
              color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
              background: 'linear-gradient(135deg, #9210f6, #610497)',
              boxShadow: '0 4px 20px rgba(146,16,246,0.35)',
              transition: 'all 0.2s ease',
            }}>Let's Play!</button>
          </div>
        </div>
      )}
    </>
  )
}