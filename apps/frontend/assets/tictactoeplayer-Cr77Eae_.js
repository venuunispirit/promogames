import{r as h,j as e}from"./react-vendor-gyK15t0p.js";import{a as tt}from"./index-B2qSlCu9.js";function O(r){if(r)try{new Audio(r).play().catch(()=>{})}catch{}}function z(r,i){const s=r.length,c=[];for(let n=0;n<s;n++)for(let o=0;o<=s-i;o++){const t=[];for(let l=0;l<i;l++)t.push([n,o+l]);c.push(t)}for(let n=0;n<s;n++)for(let o=0;o<=s-i;o++){const t=[];for(let l=0;l<i;l++)t.push([o+l,n]);c.push(t)}for(let n=0;n<=s-i;n++)for(let o=0;o<=s-i;o++){const t=[],l=[];for(let d=0;d<i;d++)t.push([n+d,o+d]),l.push([n+d,o+i-1-d]);c.push(t,l)}for(const n of c){const o=r[n[0][0]][n[0][1]];if(o&&n.every(([t,l])=>r[t][l]===o))return{winner:o,cells:n}}return null}function V(r){return r.every(i=>i.every(s=>s!==null))}function rt(r){const i=[];for(let s=0;s<r.length;s++)for(let c=0;c<r[s].length;c++)r[s][c]||i.push([s,c]);return i}function D(r,i,s,c,n,o){const t=z(r,o);if(t)return t.winner===n?10-i:i-10;if(V(r))return 0;const l=rt(r);if(s){let d=-1/0;for(const[b,p]of l)r[b][p]=n,d=Math.max(d,D(r,i+1,!1,c,n,o)),r[b][p]=null;return d}else{let d=1/0;for(const[b,p]of l)r[b][p]=c,d=Math.min(d,D(r,i+1,!0,c,n,o)),r[b][p]=null;return d}}function et(r,i,s,c,n){r[i][s]=c;const o=z(r,n);return r[i][s]=null,o?100:0}function _t(r,i,s,c,n){const o=rt(r);if(o.length===0)return null;if(i==="easy"||i==="medium"&&Math.random()<.4)return o[Math.floor(Math.random()*o.length)];if(r.length>3){let b=-1/0,p=o[0];for(const[_,w]of o){const N=et(r,_,w,c,n)*3+et(r,_,w,s,n)*2+Math.random()*.1;N>b&&(b=N,p=[_,w])}return p}const t=r.map(b=>[...b]);let l=-1/0,d=o[0];for(const[b,p]of o){t[b][p]=c;const _=D(t,0,!1,s,c,n);t[b][p]=null,_>l&&(l=_,d=[b,p])}return d}const H=`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .ttt-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Poppins', sans-serif;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
  }
  
  .ttt-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at center, rgba(115, 199, 246, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(217, 192, 70, 0.08) 0%, transparent 40%);
    pointer-events: none;
    z-index: 1;
  }
  
  .ttt-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(36, 0, 61, 0.4);
    pointer-events: none;
    z-index: 0;
  }
  
  .ttt-game-container {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 32px;
    padding: 32px 24px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3), 
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.08);
    position: relative;
    z-index: 2;
    max-width: 420px;
    width: 100%;
  }
  
  .ttt-logo {
    height: 156px;
    object-fit: contain;
    margin-bottom: 24px;
    border-radius: 12px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  
  .ttt-heading {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .ttt-heading h1 {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 6px 0;
    letter-spacing: -0.5px;
  }
  
  .ttt-heading p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }
  
  .ttt-scores {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .ttt-score-card {
    flex: 1;
    padding: 16px 12px;
    border-radius: 16px;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .ttt-score-card:hover {
    transform: translateY(-2px);
  }
  
  .ttt-score-card.x-card {
    background: #73C7F6;
    box-shadow: 0 8px 24px rgba(115, 199, 246, 0.3);
  }
  
  .ttt-score-card.o-card {
    background: #D9C046;
    box-shadow: 0 8px 24px rgba(217, 192, 70, 0.3);
  }
  
  .ttt-score-number {
    font-size: 36px;
    font-weight: 900;
    color: #1a1a1a;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .ttt-score-label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(26, 26, 26, 0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .ttt-status {
    text-align: center;
    margin-bottom: 24px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ttt-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    animation: ttt-pulse 2s ease-in-out infinite;
    transition: all 0.3s ease;
  }
  
  .ttt-status-badge.turn-x {
    background: linear-gradient(135deg, #73C7F6, #5ab8e8);
    box-shadow: 0 4px 20px rgba(115, 199, 246, 0.4);
  }
  
  .ttt-status-badge.turn-o {
    background: linear-gradient(135deg, #D9C046, #c4ad3a);
    box-shadow: 0 4px 20px rgba(217, 192, 70, 0.4);
    color: #1a1a1a;
  }
  
  .ttt-status-badge.win {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.5);
    animation: ttt-glow 1.5s ease-in-out infinite;
  }
  
  .ttt-status-badge.lose {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
  }
  
  .ttt-status-badge.draw {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    box-shadow: 0 4px 20px rgba(107, 114, 128, 0.4);
  }
  
  .ttt-status-badge.thinking {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  }
  
  @keyframes ttt-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  @keyframes ttt-glow {
    0%, 100% { box-shadow: 0 4px 20px rgba(34, 197, 94, 0.5); }
    50% { box-shadow: 0 4px 30px rgba(34, 197, 94, 0.8); }
  }
  
  .ttt-board {
    display: grid;
    gap: 10px;
    margin: 0 auto 24px;
    width: fit-content;
  }
  
  .ttt-cell {
    width: 100px;
    height: 100px;
    background: linear-gradient(145deg, #ffffff 0%, #f0f0f5 100%);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    font-weight: 900;
    font-family: 'Poppins', sans-serif;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
  }
  
  .ttt-cell::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%);
    pointer-events: none;
    border-radius: 14px 14px 0 0;
  }
  
  .ttt-cell:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
    filter: brightness(1.15);
  }
  
  .ttt-cell:disabled {
    cursor: default;
  }
  
  .ttt-cell.win-cell {
    animation: ttt-cell-win 0.6s ease-in-out infinite alternate;
  }
  
  .ttt-cell.win-cell.x-win {
    box-shadow: 0 0 30px rgba(115, 199, 246, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3);
    background: rgba(115, 199, 246, 0.2);
  }
  
  .ttt-cell.win-cell.o-win {
    box-shadow: 0 0 30px rgba(217, 192, 70, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3);
    background: rgba(217, 192, 70, 0.2);
  }
  
  @keyframes ttt-cell-win {
    from { transform: scale(1); }
    to { transform: scale(1.05); }
  }
  
  .ttt-x {
    color: #73C7F6;
    text-shadow: 0 0 20px rgba(115, 199, 246, 0.5);
    animation: ttt-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .ttt-o {
    color: #D9C046;
    text-shadow: 0 0 20px rgba(217, 192, 70, 0.5);
    animation: ttt-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes ttt-pop {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .ttt-banner {
    padding: 16px 32px;
    border-radius: 16px;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    animation: ttt-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 20px;
  }
  
  .ttt-banner.win-banner {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
  }
  
  .ttt-banner.lose-banner {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
  }
  
  .ttt-banner.draw-banner {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    box-shadow: 0 8px 24px rgba(107, 114, 128, 0.4);
  }
  
  .ttt-banner.turn-banner {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  }
  
  @keyframes ttt-slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .ttt-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  
  .ttt-btn {
    padding: 14px 32px;
    border-radius: 50px;
    border: none;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .ttt-btn:hover {
    transform: translateY(-2px);
  }
  
  .ttt-btn.primary {
    background: linear-gradient(135deg, #73C7F6, #5ab8e8);
    color: #1a1a1a;
    box-shadow: 0 6px 20px rgba(115, 199, 246, 0.4);
  }
  
  .ttt-btn.primary:hover {
    box-shadow: 0 8px 28px rgba(115, 199, 246, 0.6);
  }
  
  .ttt-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  
  .ttt-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .ttt-btn.start {
    background: linear-gradient(135deg, #D9C046, #c4ad3a);
    color: #1a1a1a;
    box-shadow: 0 6px 20px rgba(217, 192, 70, 0.4);
    padding: 16px 48px;
    font-size: 17px;
  }
  
  .ttt-btn.start:hover {
    box-shadow: 0 8px 28px rgba(217, 192, 70, 0.6);
  }
  
  .ttt-option-group {
    margin-bottom: 20px;
  }
  
  .ttt-option-label {
    display: block;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  
  .ttt-option-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .ttt-option-card {
    height: 70px;
    border-radius: 16px;
    background: #fff;
    border: 2px solid rgba(255, 255, 255, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  .ttt-option-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%);
    pointer-events: none;
    border-radius: 14px;
  }
  
  .ttt-option-card:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
  }
  
  .ttt-option-card.selected {
    transform: scale(1.05);
    box-shadow: 0 0 24px var(--card-glow);
    border-color: var(--card-accent);
  }
  
  .ttt-option-card.selected::after {
    content: '\\2713';
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 12px;
    font-weight: 900;
    color: #fff;
    background: var(--card-accent);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ttt-check-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes ttt-check-pop {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }
  
  .ttt-option-card.board-selected {
    border-color: #73C7F6;
    background: #fff;
    --card-glow: rgba(115, 199, 246, 0.5);
    --card-accent: #73C7F6;
  }
  
  .ttt-option-card.diff-easy.selected {
    border-color: #22c55e;
    background: #fff;
    --card-glow: rgba(34, 197, 94, 0.5);
    --card-accent: #22c55e;
  }
  
  .ttt-option-card.diff-medium.selected {
    border-color: #D9C046;
    background: #fff;
    --card-glow: rgba(217, 192, 70, 0.5);
    --card-accent: #D9C046;
  }
  
  .ttt-option-card.diff-hard.selected {
    border-color: #ef4444;
    background: #fff;
    --card-glow: rgba(239, 68, 68, 0.5);
    --card-accent: #ef4444;
  }
  
  .ttt-option-value {
    font-size: 18px;
    font-weight: 800;
    color: #1a1a2e;
    line-height: 1;
    margin-bottom: 2px;
  }
  
  .ttt-option-sublabel {
    font-size: 9px;
    font-weight: 600;
    color: rgba(26, 26, 46, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .ttt-error {
    text-align: center;
    padding: 40px;
  }
  
  .ttt-error-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }
  
  .ttt-error h2 {
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 8px 0;
  }
  
  .ttt-error p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin: 0;
  }
  
  .ttt-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    animation: ttt-fade-in 0.3s ease;
  }
  
  @keyframes ttt-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .ttt-popup-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 28px;
    padding: 40px 32px;
    max-width: 360px;
    width: 100%;
    text-align: center;
    box-shadow: 
      0 25px 80px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 -1px 0 rgba(255, 255, 255, 0.05),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.12);
    animation: ttt-popup-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes ttt-popup-pop {
    0% { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .ttt-popup-emoji {
    font-size: 72px;
    margin-bottom: 16px;
    animation: ttt-bounce 1s ease-in-out infinite;
  }
  
  @keyframes ttt-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  
  .ttt-popup-title {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    text-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
  }
  
  .ttt-popup-win .ttt-popup-title {
    background: linear-gradient(135deg, #22c55e, #4ade80);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .ttt-popup-lose .ttt-popup-title {
    color: #ef4444;
  }
  
  .ttt-popup-sub {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
  
  .ttt-popup-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 28px;
  }
  
  @media (max-width: 480px) {
    .ttt-container {
      padding: 16px 12px;
    }
    
    .ttt-game-container {
      padding: 24px 16px;
      border-radius: 24px;
    }
    
    .ttt-logo {
      height: 120px;
      margin-bottom: 16px;
    }
    
    .ttt-heading h1 {
      font-size: 20px;
    }
    
    .ttt-heading p {
      font-size: 12px;
    }
    
    .ttt-scores {
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .ttt-score-card {
      padding: 12px 10px;
    }
    
    .ttt-score-number {
      font-size: 28px;
    }
    
    .ttt-score-label {
      font-size: 10px;
    }
    
    .ttt-status {
      margin-bottom: 16px;
    }
    
    .ttt-status-badge {
      padding: 10px 20px;
      font-size: 13px;
    }
    
    .ttt-cell {
      width: 70px;
      height: 70px;
      font-size: 32px;
      border-radius: 12px;
    }
    
    .ttt-board {
      gap: 8px;
      margin: 0 auto 16px;
    }
    
    .ttt-btn {
      padding: 12px 24px;
      font-size: 13px;
    }
    
    .ttt-btn.start {
      padding: 13px 32px;
      font-size: 14px;
    }
    
    .ttt-option-group {
      margin-bottom: 16px;
    }
    
    .ttt-option-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    
    .ttt-option-card {
      height: 60px;
      border-radius: 12px;
    }
    
    .ttt-option-value {
      font-size: 15px;
    }
    
    .ttt-option-sublabel {
      font-size: 8px;
    }
    
    .ttt-popup-card {
      padding: 28px 20px;
      margin: 12px;
    }
    
    .ttt-popup-emoji {
      font-size: 52px;
      margin-bottom: 12px;
    }
    
    .ttt-popup-title {
      font-size: 22px;
    }
    
    .ttt-popup-sub {
      font-size: 12px;
    }
    
    .ttt-popup-actions {
      margin-top: 20px;
    }
  }
  
  @media (max-width: 360px) {
    .ttt-game-container {
      padding: 20px 14px;
      border-radius: 20px;
    }
    
    .ttt-logo {
      height: 105px;
      margin-bottom: 14px;
    }
    
    .ttt-heading h1 {
      font-size: 18px;
    }
    
    .ttt-cell {
      width: 60px;
      height: 60px;
      font-size: 28px;
    }
    
    .ttt-board {
      gap: 6px;
      margin: 0 auto 14px;
    }
    
    .ttt-option-grid {
      gap: 6px;
    }
    
    .ttt-option-card {
      height: 54px;
    }
  }
`;function zt({gameData:r,sessionToken:i,sessionId:s,onSessionStart:c,onComplete:n,onLose:o}){const t=(r==null?void 0:r.settings)||{};console.log("[GAME] board_selection:",t.enable_board_selection,"level_selection:",t.enable_level_selection);const l=parseInt(t.board_size)||3,d=t.difficulty||"easy",b=(r==null?void 0:r.soundMap)||{},[p,_]=h.useState(l),[w,N]=h.useState(d),[Y,at]=h.useState(!1),[S,C]=h.useState(()=>Array.from({length:l},()=>Array(l).fill(null))),[B,k]=h.useState("player"),[f,I]=h.useState(null),[ot,W]=h.useState([]),[J,nt]=h.useState(i),[it,st]=h.useState(!1),[q,lt]=h.useState(null),[ct,T]=h.useState(0),[wt,R]=h.useState({x:0,o:0}),v=h.useRef({score:0,result:null}),M=a=>{if(!a)return null;const x=parseInt(a);return isNaN(x)?a:b[x]||null},K=Y?p:l,Q=Y?w:d,$=K,pt=async a=>{try{const x=await tt.post("/play/session/complete",{session_token:J,score:a,player_data:{game_result:v.current.result,board_size:K,difficulty:Q}});n&&n({...x.data,redirect_url:r.redirect_url})}catch{n&&n({redirect_url:r.redirect_url})}},P=(a,x,u)=>{I(a),W(x||[]),v.current={score:u,result:a},a==="win"?(R(g=>({...g,x:g.x+1})),O(M(t.win_sound_id))):a==="lose"&&(R(g=>({...g,o:g.o+1})),O(M(t.lose_sound_id)))},dt=async(a,x)=>{if(B!=="player"||f||S[a][x])return;let u=J;if(!u)try{const m=JSON.parse(localStorage.getItem("playerUser")||"{}"),j=new URLSearchParams(window.location.search).get("source")==="direct"?"direct":"link",y=await tt.post("/play/session/start",{game_id:r.id,player_data:{},source_type:j,promo_player_id:m.id||null});if(!y.data.success){if(y.data.already_played||y.data.message&&y.data.message.toLowerCase().includes("already played")){st(!0);return}throw new Error(y.data.message)}u=y.data.session_token,nt(u),c&&c(u,y.data.session_id)}catch(m){lt(m.message||"Could not start game");return}const g=S.map(m=>[...m]);g[a][x]="X",C(g),k("ai"),T(m=>m+1),O(M(t.sound_correct_id));const L=z(g,$);if(L){setTimeout(()=>P("win",L.cells,1),3e3);return}if(V(g)){setTimeout(()=>P("draw",[],0),3e3);return}const yt=g;setTimeout(()=>{const m=yt.map(X=>[...X]),j=_t(m,Q,"X","O",$);if(!j){k("player");return}m[j[0]][j[1]]="O",C(m),T(X=>X+1),O(M(t.sound_wrong_id));const y=z(m,$);if(y){k("ai"),setTimeout(()=>P("lose",y.cells,0),3e3);return}if(V(m)){setTimeout(()=>P("draw",[],0),3e3);return}k("player")},600)},xt=()=>{C(Array.from({length:p},()=>Array(p).fill(null))),at(!0),I(null),W([]),k("player"),T(a=>a+1),R({x:0,o:0}),v.current={score:0,result:null}},gt=()=>pt(v.current.score),bt=()=>{const a=Array.from({length:p},()=>Array(p).fill(null));C(a),I(null),W([]),k("player"),T(x=>x+1),v.current={score:0,result:null}},F=(t==null?void 0:t.board_cell_color)||"#ffffff",ut=(t==null?void 0:t.heading_1_color)||"#ffffff",ft=(t==null?void 0:t.heading_2_color)||"rgba(255,255,255,0.6)",mt=t!=null&&t.font_family?`'${t.font_family}', sans-serif`:"'Poppins', sans-serif",E=t!=null&&t.bg_image_url?{backgroundImage:`url(${t.bg_image_url})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"}:{background:(t==null?void 0:t.bg_color)||"#24003D"},G=`.ttt-cell { background: linear-gradient(145deg, ${F} 0%, ${F}dd 100%) !important; border: 1px solid rgba(0, 0, 0, 0.06) !important; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08) !important; } .ttt-cell:hover:not(:disabled) { background: linear-gradient(145deg, ${F} 0%, ${F}ee 100%) !important; filter: brightness(1.05); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1) !important; }`;if(it)return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:H}),e.jsx("style",{children:G}),e.jsx("div",{className:"ttt-container",style:E,children:e.jsx("div",{className:"ttt-game-container",children:e.jsxs("div",{className:"ttt-error",children:[e.jsx("div",{className:"ttt-error-icon",children:"❌"}),e.jsx("h2",{children:"Already Played!"}),e.jsx("p",{children:"You've already completed this game."})]})})})]});if(q)return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:H}),e.jsx("style",{children:G}),e.jsx("div",{className:"ttt-container",style:E,children:e.jsx("div",{className:"ttt-game-container",children:e.jsxs("div",{className:"ttt-error",children:[e.jsx("div",{className:"ttt-error-icon",children:"❌"}),e.jsx("h2",{children:"Error"}),e.jsx("p",{children:q})]})})})]});const U=(a,x)=>ot.some(([u,g])=>u===a&&g===x),ht=Math.min(380,window.innerWidth-64),A=Math.floor((ht-(p-1)*10)/p),Z=(()=>{if(f==="win")return{text:t.custom_win_msg||"You Win!",className:"win"};if(f==="lose")return{text:"Player O Wins!",className:"lose"};if(f==="draw")return{text:"Draw Game",className:"draw"};if(B==="ai"){const a=z(S,$);return a&&a.winner==="O"?{text:"Player O Wins!",className:"lose"}:{text:"Thinking...",className:"thinking"}}return{text:"Your Turn (X)",className:"turn-x"}})();return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:H}),e.jsx("style",{children:G}),e.jsx("div",{className:"ttt-container",style:{...E,fontFamily:mt},children:e.jsxs("div",{className:"ttt-game-container",children:[t.game_logo_url&&e.jsx("img",{src:t.game_logo_url,alt:"Game logo",className:"ttt-logo"}),(t.heading_1||t.heading_2||t.heading_3||t.description_text)&&e.jsxs("div",{className:"ttt-heading",children:[t.heading_1&&e.jsx("h1",{style:{color:ut},children:t.heading_1}),t.heading_2&&e.jsx("p",{style:{color:ft},children:t.heading_2}),t.heading_3&&e.jsx("p",{style:{color:t.heading_3_color||"rgba(255,255,255,0.4)",fontSize:13,margin:"2px 0 0"},children:t.heading_3}),t.description_text&&e.jsx("p",{style:{color:t.description_color||"rgba(255,255,255,0.45)",fontSize:14,margin:"8px 0 0",lineHeight:1.5},children:t.description_text})]}),Y?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"ttt-status",children:e.jsx("div",{className:`ttt-status-badge ${Z.className}`,children:Z.text})}),e.jsx("div",{className:"ttt-board",style:{gridTemplateColumns:`repeat(${p}, ${A}px)`},children:S.map((a,x)=>a.map((u,g)=>e.jsx("button",{onClick:()=>dt(x,g),disabled:!!f||B!=="player"||!!u,className:`ttt-cell ${U(x,g)?"win-cell":""} ${U(x,g)&&f==="win"?"x-win":""} ${U(x,g)&&f==="lose"?"o-win":""}`,style:{width:A,height:A,fontSize:Math.max(20,A*.4)},children:u&&e.jsx("span",{className:u==="X"?"ttt-x":"ttt-o",children:u==="O"&&t.o_image_url?e.jsx("img",{src:t.o_image_url,alt:"O",style:{width:"65%",height:"65%",objectFit:"contain"}}):u})},`${x}-${g}`)))},ct)]}):e.jsxs("div",{style:{padding:"20px 0"},children:[(t.enable_board_selection==1||t.enable_board_selection===!0||t.enable_board_selection===void 0)&&e.jsxs("div",{className:"ttt-option-group",children:[e.jsx("label",{className:"ttt-option-label",children:"Board Size"}),e.jsx("div",{className:"ttt-option-grid",children:[3,4,5].map(a=>e.jsxs("div",{className:`ttt-option-card ${p===a?"board-selected selected":""}`,onClick:()=>_(a),children:[e.jsxs("span",{className:"ttt-option-value",children:[a,"×",a]}),e.jsx("span",{className:"ttt-option-sublabel",children:"grid"})]},a))})]}),(t.enable_level_selection==1||t.enable_level_selection===!0||t.enable_level_selection===void 0)&&e.jsxs("div",{className:"ttt-option-group",children:[e.jsx("label",{className:"ttt-option-label",children:"Difficulty"}),e.jsx("div",{className:"ttt-option-grid",children:[{value:"easy",label:"Easy",color:"diff-easy"},{value:"medium",label:"Medium",color:"diff-medium"},{value:"hard",label:"Hard",color:"diff-hard"}].map(a=>e.jsxs("div",{className:`ttt-option-card ${a.color} ${w===a.value?"selected":""}`,onClick:()=>N(a.value),children:[e.jsx("span",{className:"ttt-option-value",children:a.label}),e.jsx("span",{className:"ttt-option-sublabel",children:"mode"})]},a.value))})]}),e.jsx("div",{style:{textAlign:"center",marginTop:"24px"},children:e.jsx("button",{onClick:xt,className:"ttt-btn start",style:{color:t.start_button_text_color||"#1a1a1a",background:t.start_button_bg_color||"linear-gradient(135deg, #D9C046, #c4ad3a)",boxShadow:t.start_button_bg_color?`0 6px 20px ${t.start_button_bg_color}66`:"0 6px 20px rgba(217, 192, 70, 0.4)"},children:t.start_button_text||"Start Game"})})]})]})}),f&&e.jsx("div",{className:"ttt-popup-overlay",children:e.jsxs("div",{className:"ttt-popup-card",children:[f==="win"?e.jsxs("div",{className:"ttt-popup-win",children:[e.jsx("div",{className:"ttt-popup-emoji",children:"🎉"}),e.jsx("div",{className:"ttt-popup-title",children:t.custom_win_msg||"YOU WIN!"})]}):e.jsxs("div",{className:"ttt-popup-lose",children:[e.jsx("div",{className:"ttt-popup-emoji",children:"😔"}),e.jsx("div",{className:"ttt-popup-title",children:"Better Luck Next Time!"}),e.jsx("div",{className:"ttt-popup-sub",children:f==="draw"?"The game ended in a draw.":"Player O outsmarted you this round."})]}),e.jsxs("div",{className:"ttt-popup-actions",children:[f==="draw"&&e.jsx("button",{onClick:bt,className:"ttt-btn secondary",style:{color:t.try_again_text_color||"#ffffff",background:t.try_again_bg_color||"rgba(255, 255, 255, 0.1)",border:t.try_again_bg_color?"none":"1px solid rgba(255, 255, 255, 0.15)"},children:t.try_again_btn_text||"Try Again"}),f==="win"&&e.jsx("button",{onClick:gt,className:"ttt-btn primary",style:{color:t.continue_btn_text_color||"#1a1a1a",background:t.continue_btn_bg_color||"linear-gradient(135deg, #73C7F6, #5ab8e8)",boxShadow:t.continue_btn_bg_color?`0 6px 20px ${t.continue_btn_bg_color}66`:"0 6px 20px rgba(115, 199, 246, 0.4)"},children:t.continue_btn_text||"Continue"}),f==="lose"&&e.jsx("button",{onClick:o,className:"ttt-btn primary",style:{color:t.continue_btn_text_color||"#1a1a1a",background:t.continue_btn_bg_color||"linear-gradient(135deg, #73C7F6, #5ab8e8)",boxShadow:t.continue_btn_bg_color?`0 6px 20px ${t.continue_btn_bg_color}66`:"0 6px 20px rgba(115, 199, 246, 0.4)"},children:t.continue_btn_text||"Continue"})]})]})})]})}export{zt as default};
