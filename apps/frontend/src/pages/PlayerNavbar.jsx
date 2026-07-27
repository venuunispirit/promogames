import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AvatarDisplay } from './AvatarData';
import { Home, Gamepad2, Gift, LogOut, Sparkles, User, Trophy } from 'lucide-react';

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
  .pn-nav{pointer-events:all;width:62%;max-width:700px;min-width:580px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:0 20px;padding:11px 20px 11px 18px;border-radius:100px;background:rgba(7,4,15,0.88);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(146,16,246,0.22);box-shadow:0 8px 48px rgba(0,0,0,0.60);position:relative}
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
  .pn-ham{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;border-radius:8px;transition:background .2s}
  .pn-ham:active{background:rgba(255,255,255,0.08)}
  .pn-ham span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .3s cubic-bezier(.4,0,.2,1)}
  .pn-ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .pn-ham.open span:nth-child(2){opacity:0}
  .pn-ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .pn-mob-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(7,4,15,0.97);backdrop-filter:blur(20px);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;opacity:0;transform:translateY(-20px);pointer-events:none;transition:opacity .3s ease,transform .3s ease}
  .pn-mob-overlay.open{opacity:1;transform:translateY(0);pointer-events:auto}
  .pn-mob-links{display:flex;flex-direction:column;gap:14px;width:100%;max-width:300px}
  .pn-mob-link{display:flex;align-items:center;gap:16px;padding:18px 24px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);text-decoration:none;color:rgba(255,255,255,0.85);font-family:'DM Sans',sans-serif;font-size:17px;font-weight:600;letter-spacing:1px;transition:all .25s cubic-bezier(.22,1,.36,1);opacity:0;transform:translateY(16px);position:relative;overflow:hidden}
  .pn-mob-link::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(146,16,246,0.08),transparent 60%);opacity:0;transition:opacity .25s}
  .pn-mob-link:active::after{opacity:1}
  .pn-mob-overlay.open .pn-mob-link{opacity:1;transform:translateY(0)}
  .pn-mob-overlay.open .pn-mob-link:nth-child(1){transition-delay:.06s}
  .pn-mob-overlay.open .pn-mob-link:nth-child(2){transition-delay:.12s}
  .pn-mob-overlay.open .pn-mob-link:nth-child(3){transition-delay:.18s}
  .pn-mob-link:active{background:rgba(146,16,246,0.12);border-color:rgba(146,16,246,0.3);transform:scale(0.97)!important}
  .pn-mob-link-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .25s}
  .pn-mob-link:nth-child(1) .pn-mob-link-icon{background:linear-gradient(135deg,rgba(146,16,246,0.25),rgba(97,4,151,0.2));border:1px solid rgba(146,16,246,0.3)}
  .pn-mob-link:nth-child(2) .pn-mob-link-icon{background:linear-gradient(135deg,rgba(245,200,66,0.2),rgba(245,200,66,0.1));border:1px solid rgba(245,200,66,0.25)}
  .pn-mob-link:nth-child(3) .pn-mob-link-icon{background:linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.1));border:1px solid rgba(34,197,94,0.25)}
  .pn-mob-link:nth-child(1) .pn-mob-link-icon svg{color:#c084ff}
  .pn-mob-link:nth-child(2) .pn-mob-link-icon svg{color:#f5c842}
  .pn-mob-link:nth-child(3) .pn-mob-link-icon svg{color:#22c55e}
  .pn-mob-cta-wrap{margin-top:20px;width:100%;max-width:300px;opacity:0;transform:translateY(16px)}
  .pn-mob-overlay.open .pn-mob-cta-wrap{opacity:1;transform:translateY(0);transition-delay:.24s}
  .pn-mob-cta{display:flex;align-items:center;justify-content:center;width:100%;padding:16px;border-radius:16px;background:linear-gradient(135deg,#610497,#9210f6)!important;color:#fff!important;font-family:'DM Sans',sans-serif;font-size:16px!important;font-weight:700!important;letter-spacing:1px!important;text-decoration:none;border:none;cursor:pointer;box-shadow:0 8px 32px rgba(146,16,246,0.35);transition:all .25s}
  .pn-mob-cta:active{transform:scale(0.97)!important;box-shadow:0 4px 16px rgba(146,16,246,0.3)!important}
  .pn-mob-avatar{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:16px}
  .pn-mob-name{font-family:'DM Sans',sans-serif;font-size:16px;font-weight:700;color:#fff;letter-spacing:0}
  /* Hanging wire */
  .pn-wire-wrap{position:absolute;top:100%;left:50%;transform:translateX(-50%);width:2px;display:flex;flex-direction:column;align-items:center;pointer-events:none;z-index:1001}
  .pn-wire{width:2px;background:linear-gradient(180deg,rgba(146,16,246,0.6),rgba(146,16,246,0.15));border-radius:1px;transition:height .4s cubic-bezier(.22,1,.36,1)}
  .pn-wire-handle{
    width:28px;height:28px;border-radius:50%;
    background:linear-gradient(135deg,#9210f6,#610497);
    border:2px solid rgba(255,255,255,0.25);
    box-shadow:0 4px 20px rgba(146,16,246,0.5),0 0 12px rgba(146,16,246,0.3);
    cursor:grab;pointer-events:all;
    display:flex;align-items:center;justify-content:center;
    transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s;
    margin-top:-1px;
    animation:wireDangle 3s ease-in-out infinite;
  }
  .pn-wire-handle:active{cursor:grabbing;transform:scale(1.15);box-shadow:0 6px 28px rgba(146,16,246,0.7),0 0 20px rgba(146,16,246,0.4)}
  .pn-wire-handle svg{width:14px;height:14px;color:#fff}
  @keyframes wireDangle{0%,100%{transform:translateX(0) rotate(0deg)}25%{transform:translateX(2px) rotate(2deg)}75%{transform:translateX(-2px) rotate(-2deg)}}
  .pn-wire-mascot{
    margin-top:8px;width:70px;position:relative;
    animation:mascotBounce 3s ease-in-out infinite;
    filter:drop-shadow(0 4px 16px rgba(146,16,246,0.35));
    transition:opacity .15s;
  }
  .pn-wire-mascot{transition:opacity .3s ease,visibility .3s ease}
  .pn-wire-mascot.hidden{opacity:0;visibility:hidden;pointer-events:none}
  .pn-wire-mascot img{width:100%;height:auto;display:block}
  .pn-mascot-bubble{
    position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);
    min-width:160px;max-width:200px;padding:10px 14px;
    background:rgba(20,8,40,0.95);border:1px solid rgba(146,16,246,0.4);border-radius:14px;
    font-family:'DM Sans',sans-serif;font-size:11px;line-height:1.5;color:#e0d0ff;text-align:center;
    box-shadow:0 6px 24px rgba(0,0,0,0.5),0 0 12px rgba(146,16,246,0.2);
    opacity:0;transform:translateX(-50%) translateY(6px) scale(0.9);
    transition:opacity .3s ease,transform .3s ease;pointer-events:none;white-space:nowrap;z-index:20;
  }
  .pn-mascot-bubble.show{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}
  .pn-mascot-bubble::after{
    content:'';position:absolute;bottom:-6px;left:50%;margin-left:-5px;
    width:10px;height:10px;background:rgba(20,8,40,0.95);
    border-right:1px solid rgba(146,16,246,0.4);border-bottom:1px solid rgba(146,16,246,0.4);
    transform:rotate(45deg);
  }
  @keyframes mascotBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .pn-logo-desktop{display:block}
  .pn-logo-mobile{display:none}
  @media(max-width:1100px){.pn-nav{width:78%}}
  @media(max-width:900px){
    .pn-links,.pn-cta,.pn-wire-wrap{display:none}
    .pn-ham{display:flex}
    .pn-wrap{padding:12px 20px;display:block}
    .pn-nav{width:100%;max-width:100%;min-width:unset;padding:10px 20px;border-radius:18px}
    .pn-logo-desktop{display:none}
    .pn-logo-mobile{display:block}
  }
  @media(max-width:640px){
    .pn-wrap{padding:10px 12px}
    .pn-nav{padding:8px 14px;border-radius:14px}
    .pn-logo img{height:48px}
  }
  @media(min-width:901px){.pn-mob-overlay{display:none!important}}
`;

export default function PlayerNavbar() {
  const [player, setPlayer] = useState(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mascotGlitch, setMascotGlitch] = useState('visible');
  const [bubbleText, setBubbleText] = useState('');
  const [bubbleShow, setBubbleShow] = useState(false);
  const ddRef = useRef(null);
  const wireRef = useRef(null);
  const [wireDragging, setWireDragging] = useState(false);
  const wireStartY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  /* Mascot popup messages */
  const MASCOT_MSGS = [
    'Pull the trigger to play a quick game!',
    'Drag me down to start!',
    'Ready to play? Pull down!',
    'Spin the wheel of rewards!',
    'Try your luck today!',
  ];
  useEffect(() => {
    let idx = 0;
    const show = () => {
      setBubbleText(MASCOT_MSGS[idx % MASCOT_MSGS.length]);
      setBubbleShow(true);
      setTimeout(() => setBubbleShow(false), 3500);
      idx++;
    };
    const t1 = setTimeout(show, 1500);
    const timer = setInterval(show, 8000);
    return () => { clearTimeout(t1); clearInterval(timer); };
  }, []);

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

  /* Listen for mascot-switch events (auto 5s cycle) */
  useEffect(() => {
    const handler = (e) => {
      const { phase } = e.detail;
      if (phase === 'glitch-in') {
        setMascotGlitch('visible');
      } else if (phase === 'glitch-out') {
        setMascotGlitch('hidden');
      }
    };
    window.addEventListener('mascot-switch', handler);
    return () => window.removeEventListener('mascot-switch', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [open]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* Wire drag handlers */
  const onWireDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWireDragging(true);
    wireStartY.current = e.clientY || e.touches?.[0]?.clientY || 0;
  };
  useEffect(() => {
    if (!wireDragging) return;
    const onMove = (e) => {
      const y = e.clientY || e.touches?.[0]?.clientY || 0;
      const dy = y - wireStartY.current;
      if (dy > 120) {
        setWireDragging(false);
        const el = document.getElementById('cta-final');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    const onUp = () => setWireDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [wireDragging]);

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
            <div style={{ position: 'relative' }}>
              <a href="/login" className="pn-cta">Login</a>
              <div className="pn-wire-wrap" ref={wireRef}>
                <div className="pn-wire" style={{ height: wireDragging ? 80 : 40, transition: wireDragging ? 'none' : 'height .4s cubic-bezier(.22,1,.36,1)' }} />
                <div
                  className="pn-wire-handle"
                  onMouseDown={onWireDown}
                  onTouchStart={onWireDown}
                  style={wireDragging ? { animation: 'none', transform: 'scale(1.15)' } : {}}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <div className={`pn-wire-mascot${mascotGlitch === 'visible' ? '' : ' hidden'}`}>
                  <div className={`pn-mascot-bubble${bubbleShow ? ' show' : ''}`}>{bubbleText}</div>
                  <img src="/mascotques.png" alt="Mascot" />
                </div>
              </div>
            </div>
          )}

          <button className={`pn-ham${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </nav>
      </div>

      <div className={`pn-mob-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
        {isAuth && (
          <div className="pn-mob-avatar" onClick={e => e.stopPropagation()}>
            <AvatarDisplay avatarId={player.avatar_id} size={56} style={{ border: '3px solid rgba(146,16,246,0.3)' }} />
            <span className="pn-mob-name">{player.name}</span>
          </div>
        )}
        <div className="pn-mob-links">
          <a className="pn-mob-link" href="/arcade" onClick={() => setMenuOpen(false)}>
            <span className="pn-mob-link-icon"><Gamepad2 size={20} /></span>
            Play
          </a>
          <a className="pn-mob-link" href="/leaderboard" onClick={() => setMenuOpen(false)}>
            <span className="pn-mob-link-icon"><Trophy size={20} /></span>
            Leaderboard
          </a>
          {isAuth && (
            <a className="pn-mob-link" href="/player/dashboard" onClick={() => setMenuOpen(false)}>
              <span className="pn-mob-link-icon"><Home size={20} /></span>
              Dashboard
            </a>
          )}
        </div>
        <div className="pn-mob-cta-wrap">
          {isAuth ? (
            <button className="pn-mob-cta" onClick={() => { setMenuOpen(false); navigate('/player/dashboard'); }}>
              Go to Dashboard
            </button>
          ) : (
            <a href="/login" className="pn-mob-cta">Login</a>
          )}
        </div>
      </div>
    </>
  );
}
