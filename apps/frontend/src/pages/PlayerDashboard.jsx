import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import GameModal from '../components/GameModal'

// ── Helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken')
}

// ── Redesign Styles ──────────────────────────────────────────────────────────
const DASHBOARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  :root {
    --glass-bg: rgba(255, 255, 255, 0.06);
    --glass-border: rgba(255, 255, 255, 0.1);
    --neon-purple: #a855f7;
    --neon-glow: 0 8px 32px rgba(139, 92, 246, 0.25);
    --deep-bg: #0f0720;
  }

  body {
    background: var(--deep-bg);
    font-family: 'Outfit', sans-serif;
    color: #fff;
    margin: 0;
    overflow-x: hidden;
  }

  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    box-shadow: var(--neon-glow);
  }

  .neon-text {
    color: var(--neon-purple);
    text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
  }

  .btn-premium {
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: #fff;
    border: none;
    border-radius: 16px;
    padding: 12px 24px;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-premium:active {
    transform: scale(0.95);
  }

  /* Capsule Nav Styles */
  .capsule-nav-container {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: 400px;
    height: 72px;
    background: rgba(15, 7, 32, 0.3);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 10px;
    z-index: 2000;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.15);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    font-size: 10px;
    font-weight: 700;
    flex: 1;
    cursor: pointer;
    position: relative;
  }

  .nav-item.active {
    color: #fff;
  }

  .nav-item.active .nav-icon {
    color: var(--neon-purple);
    transform: translateY(-4px);
    filter: drop-shadow(0 0 8px var(--neon-purple));
  }

  .nav-item.active span {
    color: #fff;
    text-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
  }

  .nav-item:not(.active):hover .nav-icon {
    color: rgba(255, 255, 255, 0.8);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 0 20px 24px;
  }

  @media (min-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }

  @media (min-width: 1024px) {
    .btn-desktop-auto {
      width: auto !important;
      min-width: 200px;
      margin: 24px auto 0 !important;
      padding: 12px 32px !important;
    }
  }

  .challenges-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  @media (min-width: 1024px) {
    .challenges-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 0 20px 24px;
    }
    .challenges-grid > div {
      margin: 0 !important;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
  .animate-rotate { animation: rotate-slow 20s linear infinite; }

  /* Premium Game Card Styles */
  .game-card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 40px;
  }

  @media (min-width: 768px) {
    .game-card-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
  }

  .premium-game-card {
    width: 100%;
    aspect-ratio: 280 / 420;
    height: auto;
    background: rgba(15, 7, 32, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .premium-game-card {
      width: 280px;
      height: 420px;
      aspect-ratio: auto;
      border-radius: 24px;
    }
  }

  .premium-game-card:hover {
    transform: translateY(-8px);
    border-color: #a855f7;
    box-shadow: 0 15px 45px rgba(139, 92, 246, 0.3), 0 0 20px rgba(168, 85, 247, 0.2);
  }

  .premium-game-card .image-container {
    height: 65%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .premium-game-card .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .premium-game-card:hover .game-image {
    transform: scale(1.08);
  }

  .premium-game-card .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 20%, rgba(15, 7, 32, 0.95) 100%);
  }

  .premium-game-card .reward-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(34, 197, 94, 0.9);
    color: #fff;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 800;
    backdrop-filter: blur(4px);
    z-index: 2;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  @media (min-width: 768px) {
    .premium-game-card .reward-badge {
      top: 16px;
      right: 16px;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  .premium-game-card .category-pill {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(168, 85, 247, 0.8);
    color: #fff;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 2;
    backdrop-filter: blur(4px);
  }

  @media (min-width: 768px) {
    .premium-game-card .category-pill {
      top: 16px;
      left: 16px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 10px;
      letter-spacing: 1px;
    }
  }

  .premium-game-card .content {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    z-index: 2;
  }

  @media (min-width: 768px) {
    .premium-game-card .content {
      padding: 20px;
    }
  }

  .premium-game-card .game-title {
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 4px;
    line-height: 1.2;
    background: linear-gradient(to right, #fff, rgba(255,255,255,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (min-width: 768px) {
    .premium-game-card .game-title {
      font-size: 20px;
      margin-bottom: 8px;
    }
  }

  .premium-game-card .metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 9px;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
  }

  @media (min-width: 768px) {
    .premium-game-card .metadata {
      gap: 12px;
      font-size: 11px;
    }
  }

  .premium-game-card .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .premium-game-card .card-index-number {
    position: absolute;
    bottom: -15px;
    right: -5px;
    font-size: 100px;
    font-weight: 900;
    line-height: 1;
    color: rgba(255, 255, 255, 0.05);
    z-index: 1;
    pointer-events: none;
    font-family: 'Outfit', sans-serif;
    transition: all 0.4s ease;
  }

  .premium-game-card:hover .card-index-number {
    color: rgba(168, 85, 247, 0.15);
    transform: scale(1.1) translateX(-10px);
  }

  /* Hide scrollbar for carousels */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ── Components ─────────────────────────────────────────────────────────────

function ErrorUI({ message, onRetry }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0720', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 64 }}>⚠️</div>
      <div style={{ maxWidth: 300 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Data Loading Failed</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{message}</div>
      </div>
      <button className="btn-premium" onClick={onRetry} style={{ minWidth: 160 }}>
        🔄 Try Again
      </button>
    </div>
  )
}

function Header({ name }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 20px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1500, 
      background: 'rgba(15, 7, 32, 0.4)', 
      backdropFilter: 'blur(12px)', 
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
    }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>Hi, {name.split(' ')[0]} 👋</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Welcome Back</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="glass-card" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--glass-bg)', fontSize: 18, borderRadius: '12px' }}>🔔</button>
        <button className="glass-card" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--glass-bg)', fontSize: 18, borderRadius: '12px' }}>🎁</button>
      </div>
    </div>
  )
}

function WalletHero({ balance, city, onPlayMore }) {
  const ppMax = 2000;
  const ppPct = Math.min((balance / ppMax) * 100, 100);
  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const dash = (ppPct / 100) * circ;

  return (
    <div className="glass-card" style={{ margin: '0 20px 24px', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -20, fontSize: 100, opacity: 0.05 }} className="animate-float">💎</div>
      <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, background: 'rgba(168, 85, 247, 0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={65} cy={65} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={8} />
            <circle cx={65} cy={65} r={radius} fill="none" stroke="url(#wallet-grad)" strokeWidth={8} strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            <defs>
              <linearGradient id="wallet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{balance}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>PC</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon-purple)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Balance</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Promo Coins</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📍</span> {city || 'Bangalore'}
          </div>
          
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 6, fontWeight: 600 }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Level 5 Explorer</span>
              <span className="neon-text">{Math.round(ppPct)}% to LVL 6</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: `${ppPct}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: 10, boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)' }} />
            </div>
          </div>
        </div>
      </div>

      <button className="btn-premium btn-desktop-auto" style={{ width: '100%', marginTop: 24, fontSize: 14 }} onClick={onPlayMore}>
        🕹️ Play & Earn More
      </button>
      </div>
      )
      }

function QuickStat({ icon, label, value }) {
  return (
    <div className="glass-card" style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 1 }}>{value}</div>
      </div>
      <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 32, opacity: 0.03 }}>{icon}</div>
    </div>
  )
}

function DailyStreak({ days }) {
  return (
    <div className="glass-card" style={{ margin: '0 20px 16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 32, filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.5))', opacity: 0.5 }} className="animate-float">🔥</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Daily Streak</div>
          <div style={{ fontSize: 12, color: 'var(--neon-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Coming soon...</div>
        </div>
      </div>
      <div style={{ textAlign: 'right', opacity: 0.3 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>0 Days</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WeeklyChallenge({ progress, total, reward }) {
  return (
    <div className="glass-card" style={{ margin: '0 20px 24px', padding: '20px', opacity: 0.8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ fontSize: 24, filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))', opacity: 0.5 }}>🎯</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Weekly Challenge</div>
            <div style={{ fontSize: 12, color: 'var(--neon-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Coming soon...</div>
          </div>
        </div>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', position: 'relative', opacity: 0.3 }}>
        <div style={{ width: `0%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: 10 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
        <span>New challenges arriving weekly</span>
        <span>0/5 Done</span>
      </div>
    </div>
  )
}

function RecentActivity({ txs, onBrowseGames }) {
  return (
    <div className="glass-card" style={{ margin: '0 20px 24px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Recent Activity</h3>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon-purple)', textTransform: 'uppercase' }}>History</span>
      </div>
      {txs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 12, filter: 'grayscale(0.5) opacity(0.5)' }}>🎮</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Ready for your first win?</div>
          <button className="btn-premium" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid var(--neon-purple)', color: '#fff', width: '100%' }} onClick={onBrowseGames}>Browse Games</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {txs.slice(0, 3).map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: tx.type === 'earn' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {tx.type === 'earn' ? '💰' : '🎁'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>{tx.note || (tx.game_name ? `Win: ${tx.game_name}` : 'Reward')}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{new Date(tx.created_at).toLocaleDateString(undefined, { month:'short', day:'numeric' })}</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: tx.type === 'earn' ? '#22c55e' : '#ef4444' }}>
                {tx.type === 'earn' ? '+' : '-'}{tx.points}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AchievementCard({ title, icon, unlocked }) {
  return (
    <div className="glass-card" style={{ 
      minWidth: 140, padding: '24px 16px', textAlign: 'center', 
      opacity: unlocked ? 1 : 0.4,
      filter: unlocked ? 'none' : 'grayscale(0.8) blur(0.5px)',
      border: unlocked ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--glass-border)',
      boxShadow: unlocked ? '0 0 24px rgba(168, 85, 247, 0.2)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ fontSize: 40, marginBottom: 14 }} className={unlocked ? "animate-float" : ""}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.3, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 9, color: unlocked ? 'var(--neon-purple)' : 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>{unlocked ? 'Collected' : 'Locked'}</div>
    </div>
  )
}

function RewardCard({ brand, title, cost, logo, onClaim }) {
  return (
    <div className="glass-card" style={{ minWidth: 220, padding: '18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 110, borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 44, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>{logo}</span>
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--neon-purple)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{brand}</div>
      <div style={{ fontSize: 15, fontWeight: 800, margin: '3px 0 14px', letterSpacing: -0.3 }}>{title}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12 }}>💎</span> {cost} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>PC</span>
        </div>
        <button onClick={onClaim} style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#fff', padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>Redeem</button>
      </div>
    </div>
  )
}

function BottomNav({ activeTab, onTabChange }) {
  const items = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    { 
      id: 'games', 
      label: 'Games', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
        </svg>
      )
    },
    { 
      id: 'rewards', 
      label: 'Rewards', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
  ];
  return (
    <div className="capsule-nav-container">
      {items.map(item => (
        <div 
          key={item.id} 
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`} 
          onClick={() => onTabChange(item.id)}
        >
          <div className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Game Card (For Games Tab) ─────────────────────────────────────────────
function RedesignGameCard({ game, onPlay, pcAmount, index }) {
  const hasLogo = Boolean(game.game_logo_url);
  const gameImg = game.game_logo_url || game.bg_image_url;

  return (
    <div className="premium-game-card" onClick={() => onPlay(game)}>
      <div className="card-index-number">{index + 1}</div>
      <div className="reward-badge">+{pcAmount} PC</div>
      <div className="category-pill">{game.category || 'Arcade'}</div>

      <div className={`image-container${hasLogo ? ' logo-container' : ''}`}>
        {gameImg ? (
          <img src={gameImg} alt={game.name} className={`game-image${hasLogo ? ' logo-image' : ''}`} />
        ) : (
          <div className="card-overlay" />
        )}
      </div>

      <div className="content">
        <div className="game-title">{game.name}</div>
        <div className="metadata">
          <div className="meta-item"><span>💎</span> +{pcAmount} PC</div>
          <div className="meta-item"><span>🎮</span> {game.category?.toUpperCase() || 'ARCADE'}</div>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export default function PlayerDashboard() {
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [txs, setTxs] = useState([])
  const [games, setGames] = useState({ promogames: [], branded: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [activeGame, setActiveGame] = useState(null)

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = DASHBOARD_STYLES;
    document.head.appendChild(styleEl);
    
    const stored = localStorage.getItem('playerUser') || sessionStorage.getItem('playerUser')
    if (!stored) { navigate('/login'); return }
    
    try {
      const initialPlayer = JSON.parse(stored)
      setPlayer(initialPlayer)
      if (initialPlayer) {
        loadData()
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e)
      navigate('/login')
    }

    return () => {
      document.head.removeChild(styleEl);
    }
  }, [])

  const loadData = async () => {
    setError(null)
    setLoading(true)
    console.log('DEBUG: Starting loadData...');
    try {
      // Try individual requests instead of Promise.all to isolate the failure
      console.log('DEBUG: Fetching /pauth/me...');
      const meRes = await api.get('/pauth/me').catch(e => { console.error('ME FAILED:', e.response?.status, e.response?.data); throw e; });
      console.log('DEBUG: /pauth/me success');
      setPlayer(meRes.data.player);

      console.log('DEBUG: Fetching /pauth/transactions...');
      const txRes = await api.get('/pauth/transactions').catch(e => { console.error('TX FAILED:', e.response?.status, e.response?.data); throw e; });
      console.log('DEBUG: /pauth/transactions success');
      setTxs(txRes.data.transactions || []);

      console.log('DEBUG: Fetching /play/dashboard-games...');
      const gamesRes = await api.get('/play/dashboard-games').catch(e => { console.error('GAMES FAILED:', e.response?.status, e.response?.data); throw e; });
      console.log('DEBUG: /play/dashboard-games success');
      setGames(gamesRes.data.games || { promogames: [], branded: [] });

    } catch (err) {
      console.error('FATAL loadData Error:', err);
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
      
      if (status === 401 || status === 403) {
        console.warn('Redirecting to login due to auth error');
        return; // api.js will handle redirect
      }
      
      setError(`Error ${status || ''}: ${errorMsg}`);
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('playerToken')
    localStorage.removeItem('playerUser')
    sessionStorage.removeItem('playerToken')
    sessionStorage.removeItem('playerUser')
    navigate('/login')
  }

  const playUpdate = (game) => {
    setActiveGame(game)
  }

  const handleCloseGame = () => {
    setActiveGame(null)
    loadData()
  }

  const handleSwitchGame = (game) => {
    setActiveGame(game)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0720', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div className="animate-pulse-glow" style={{ fontSize: 56 }}>💎</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon-purple)', textTransform: 'uppercase', letterSpacing: 2 }}>Loading Engine...</div>
    </div>
  )

  if (error) return <ErrorUI message={error} onRetry={loadData} />

  if (!player) return null

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 110, position: 'relative' }}>
      {/* Background Effects */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% -20%, #2e1065, #0f0720)', zIndex: -1 }} />
      <div style={{ position: 'fixed', top: '5%', right: '-10%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1), transparent 70%)', zIndex: -1 }} className="animate-pulse-glow" />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08), transparent 70%)', zIndex: -1 }} className="animate-pulse-glow" />
      
      {/* Animated Network/Grid (Subtle) */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.1, pointerEvents: 'none', zIndex: -1, background: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <Header name={player.name} />

      {activeTab === 'home' && (
        <div className="fade-in">
          <WalletHero balance={player.pc_balance} city={player.city} onPlayMore={() => setActiveTab('games')} />

          <div className="stats-grid">
            <QuickStat icon="💎" label="Total PC" value={player.pc_balance.toLocaleString()} />
            <QuickStat icon="🎮" label="Games" value={txs.filter(t => t.type === 'earn' && t.game_id).length} />
            <QuickStat icon="🎁" label="Redeemed" value={txs.filter(t => t.type === 'spend').length} />
            <QuickStat icon="🏆" label="Rank" value="Silver" />
          </div>

          <div className="challenges-grid">
            <DailyStreak days={3} />
            <WeeklyChallenge progress={2} total={5} reward={200} />
            <RecentActivity txs={txs} onBrowseGames={() => setActiveTab('games')} />
          </div>

          {/* Achievements Section */}
          <div style={{ margin: '0 0 24px' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 20px 16px' }}>Achievements</h3>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 20px 10px' }}>
              <AchievementCard title="Welcome Aboard" icon="🚀" unlocked={true} />
              <AchievementCard title="First Play" icon="🎯" unlocked={true} />
              <AchievementCard title="Coin Collector" icon="💰" unlocked={false} />
              <AchievementCard title="Master Player" icon="👑" unlocked={false} />
              <AchievementCard title="Social Butterfly" icon="🤝" unlocked={false} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'games' && (
        <div className="fade-in" style={{ padding: '0 20px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Play & Earn</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24, fontWeight: 500 }}>Choose a challenge and stack those coins</p>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: 'var(--neon-purple)', borderRadius: 4 }} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Branded Challenges</h3>
            </div>
            {games.branded.length === 0 ? (
              <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Coming soon...</div>
            ) : (
              <div className="game-card-grid">
                {games.branded.map((g, i) => <RedesignGameCard key={g.id} game={g} onPlay={playUpdate} pcAmount={50} index={i} />)}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: 'var(--neon-purple)', borderRadius: 4 }} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Quick Games</h3>
            </div>
            <div className="game-card-grid">
              {games.promogames.map((g, i) => <RedesignGameCard key={g.id} game={g} onPlay={playUpdate} pcAmount={10} index={i} />)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="fade-in" style={{ padding: '0 20px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Redeem Rewards</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24, fontWeight: 500 }}>Turn your PC into real-world value</p>
          
          <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(168, 85, 247, 0.03)' }}>
            <div style={{ fontSize: 64, marginBottom: 24 }} className="animate-float">🎁</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Rewards Store</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 32px' }}>
              We're currently stocking up on exciting vouchers and gifts. Stay tuned!
            </p>
            <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '100px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--neon-purple)', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
              Coming Soon
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="fade-in" style={{ padding: '0 20px' }}>
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, border: '4px solid rgba(255,255,255,0.1)' }}>
              {player.name[0]}
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{player.name}</h2>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Level 5 Challenger</div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{player.pc_balance}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Available PC</div>
              </div>
              <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>#42</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Global Rank</div>
              </div>
            </div>
          </div>

          <button className="btn-premium btn-desktop-auto" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ef4444' }} onClick={handleLogout}>
            Logout Account
          </button>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeGame && (
        <GameModal
          game={activeGame}
          allGames={[...(games.branded || []), ...(games.promogames || [])]}
          onClose={handleCloseGame}
          onSwitch={handleSwitchGame}
          isLoggedIn={!!(localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken'))}
        />
      )}
    </div>
  )
}
