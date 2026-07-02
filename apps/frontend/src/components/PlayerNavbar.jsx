import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AvatarDisplay } from './AvatarData';
import { Home, Gamepad2, Gift, LogOut, Sparkles, User } from 'lucide-react';

const PUBLIC_LINKS = [
  { label: 'Play', href: '/arcade' },
  { label: 'Leaderboard', href: '/leaderboard' },
];

const DROPDOWN_ITEMS = [
  { label: 'Dashboard',       icon: Home, href: '/player/dashboard' },
  { label: 'Rewards',         icon: Gift, href: '/player/rewards' },
  { divider: true },
  { label: 'Profile',         icon: User, href: '/player/profile' },
  { label: 'Logout',          icon: LogOut, action: 'logout' },
];

const CSS = `
  .pn-wrap{position:fixed;top:0;left:0;right:0;z-index:1000;padding:18px 0;pointer-events:none;display:flex;justify-content:center}
  .pn-nav{pointer-events:all;width:62%;max-width:700px;min-width:580px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:0 20px;padding:11px 20px 11px 18px;border-radius:100px;background:rgba(7,4,15,0.88);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(146,16,246,0.22);box-shadow:0 8px 48px rgba(0,0,0,0.60)}
  .pn-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
  .pn-logo img{width:auto;height:60px;border-radius:9px;flex-shrink:0}
  .pn-links{list-style:none;display:flex;gap:26px;align-items:center;justify-content:center;margin:0;padding:0}
  .pn-links a{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:rgba(255,255,255,0.52);text-decoration:none;position:relative;transition:color .22s}
  .pn-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:linear-gradient(90deg,#9210f6,#7C3AED);transition:width .25s}
  .pn-links a:hover{color:#fff}
  .pn-links a:hover::after{width:100%}
  .pn-links a.active{color:#fff}
  .pn-links a.active::after{width:100%}
  .pn-cta{position:relative;overflow:hidden;display:inline-flex;align-items:center;height:38px;padding:0 22px;border-radius:100px;border:none;background:linear-gradient(90deg,#610497,#9210f6);text-decoration:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;color:#fff;transition:opacity .2s;white-space:nowrap}
  .pn-cta:hover{opacity:.85}
  .pn-avatar-wrap{position:relative;justify-self:end}
  .pn-avatar-btn{width:38px;height:38px;border-radius:50%;border:2px solid rgba(146,16,246,0.4);background:linear-gradient(135deg,#6366f1,#a855f7);cursor:pointer;padding:0;transition:all .25s;overflow:hidden;flex-shrink:0}
  .pn-avatar-btn:hover{border-color:#9210f6;box-shadow:0 0 20px rgba(146,16,246,0.5)}
  .pn-dropdown{position:absolute;top:calc(100% + 10px);right:0;width:230px;background:rgba(7,4,15,0.92);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(146,16,246,0.22);border-radius:16px;padding:8px;box-shadow:0 12px 48px rgba(0,0,0,0.6),0 0 0 0.5px rgba(146,16,246,0.08) inset;opacity:0;transform:translateY(-8px) scale(0.96);pointer-events:none;transition:all .2s ease}
  .pn-dropdown.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
  .pn-dd-header{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:4px}
  .pn-dd-name{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#fff}
  .pn-dd-email{font-family:'DM Sans',sans-serif;font-size:11px;color:rgba(255,255,255,0.4)}
  .pn-dd-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;color:rgba(255,255,255,0.65);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;text-decoration:none;border:none;background:none;width:100%;text-align:left}
  .pn-dd-item:hover{background:rgba(146,16,246,0.12);color:#fff}
  .pn-dd-item.active{color:#c040ff}
  .pn-dd-icon{width:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .pn-dd-divider{height:1px;background:rgba(255,255,255,0.06);margin:4px 12px}
  .pn-ham{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px}
  .pn-ham span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .3s}
  .pn-ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .pn-ham.open span:nth-child(2){opacity:0}
  .pn-ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .pn-mob-overlay{display:none;position:fixed;inset:0;top:74px;background:rgba(7,4,15,0.97);backdrop-filter:blur(20px);z-index:999;flex-direction:column;align-items:center;justify-content:center;gap:30px}
  .pn-mob-overlay.open{display:flex}
  .pn-mob-overlay a,.pn-mob-overlay button{font-family:'DM Sans',sans-serif;font-size:26px;color:#fff;text-decoration:none;opacity:.80;transition:opacity .2s;letter-spacing:2px;background:none;border:none;cursor:pointer}
  .pn-mob-overlay a:hover,.pn-mob-overlay button:hover{opacity:1}
  .pn-mob-cta{margin-top:8px;padding:14px 40px;border-radius:100px;background:linear-gradient(90deg,#610497,#9210f6)!important;color:#fff!important;font-size:17px!important;font-weight:700!important;letter-spacing:0!important}
  .pn-mob-avatar{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:16px}
  .pn-mob-name{font-family:'DM Sans',sans-serif;font-size:16px;font-weight:700;color:#fff;letter-spacing:0}
  .pn-logo-desktop{display:block}
  .pn-logo-mobile{display:none}
  @media(max-width:1100px){.pn-nav{width:78%}}
  @media(max-width:900px){
    .pn-links,.pn-cta{display:none}
    .pn-ham{display:flex}
    .pn-wrap{padding:12px 20px;display:block}
    .pn-nav{width:100%;max-width:100%;min-width:unset;padding:10px 20px;border-radius:18px}
    .pn-logo-desktop{display:none}
    .pn-logo-mobile{display:block}
  }
  @media(min-width:901px){.pn-mob-overlay{display:none!important}}
`;

export default function PlayerNavbar() {
  const [player, setPlayer] = useState(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ddRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const readPlayer = () => {
      const stored = localStorage.getItem('playerUser') || sessionStorage.getItem('playerUser');
      if (stored) {
        try { setPlayer(JSON.parse(stored)); } catch {}
      }
    };
    readPlayer();
    window.addEventListener('player-updated', readPlayer);
    return () => window.removeEventListener('player-updated', readPlayer);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [open]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (href) => location.pathname === href;

  const handleClick = (item) => {
    if (item.action === 'logout') {
      localStorage.removeItem('playerToken');
      localStorage.removeItem('playerUser');
      sessionStorage.removeItem('playerToken');
      sessionStorage.removeItem('playerUser');
      setPlayer(null);
      navigate('/');
    } else {
      navigate(item.href);
    }
    setOpen(false);
  };

  const isAuth = !!player;
  const visibleDropdown = DROPDOWN_ITEMS.filter(item => {
    if (item.divider) return true;
    return location.pathname !== item.href;
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="pn-wrap">
        <nav className="pn-nav">
          <a href="/" className="pn-logo">
            <img src="/favicon2.png" alt="Promogames" className="pn-logo-desktop" />
            <img src="/favicon.png" alt="Promogames" className="pn-logo-mobile" />
          </a>

          <ul className="pn-links">
            {PUBLIC_LINKS.map(n => (
              <li key={n.href}>
                <a href={n.href} className={location.pathname === n.href ? 'active' : ''}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          {isAuth ? (
              <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{lineHeight:1.2}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:'#fff',whiteSpace:'nowrap',textAlign:'right',display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>Hi, {player.name?.split(' ')[0]} <Sparkles size={14} color="#c084fc" /></div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:'rgba(255,255,255,0.45)',fontWeight:500,whiteSpace:'nowrap',marginTop:1,textAlign:'right'}}>Welcome back</div>
              </div>
              <div className="pn-avatar-wrap" ref={ddRef}>
              <button className="pn-avatar-btn" onClick={() => setOpen(!open)} title="Account menu">
                <AvatarDisplay avatarId={player.avatar_id} size={34} style={{ border: 'none', background: 'transparent' }} />
              </button>
              <div className={`pn-dropdown${open ? ' open' : ''}`}>
                <div className="pn-dd-header">
                  <AvatarDisplay avatarId={player.avatar_id} size={32} style={{ border: 'none' }} />
                  <div>
                    <div className="pn-dd-name">{player.name}</div>
                    <div className="pn-dd-email">{player.email}</div>
                  </div>
                </div>
                {visibleDropdown.map((item, i) => item.divider ? (
                  <div key={i} className="pn-dd-divider" />
                ) : (
                  <button
                    key={i}
                    className={`pn-dd-item${isActive(item.href) ? ' active' : ''}`}
                    onClick={() => handleClick(item)}
                  >
                    <span className="pn-dd-icon"><item.icon size={16} /></span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            </div>
          ) : (
            <a href="/login" className="pn-cta">Signup &amp; Play</a>
          )}

          <button className={`pn-ham${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </nav>
      </div>

      <div className={`pn-mob-overlay${menuOpen ? ' open' : ''}`}>
        {isAuth && (
          <div className="pn-mob-avatar">
            <AvatarDisplay avatarId={player.avatar_id} size={56} style={{ border: '3px solid rgba(146,16,246,0.3)' }} />
            <span className="pn-mob-name">{player.name}</span>
          </div>
        )}
        {PUBLIC_LINKS.map(n => (
          <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>
        ))}
        {isAuth ? (
          <button className="pn-mob-cta" onClick={() => { setMenuOpen(false); navigate('/player/dashboard'); }}>
            Dashboard
          </button>
        ) : (
          <a href="/login" className="pn-mob-cta">Signup &amp; Play</a>
        )}
      </div>
    </>
  );
}
