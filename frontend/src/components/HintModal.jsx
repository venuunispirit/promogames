import React from 'react';

const HintModal = ({ isOpen, onClose, hint, cost, balance, onConfirm }) => {
  if (!isOpen) return null;

  const canAfford = balance >= cost;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      backdropFilter: 'blur(8px)',
    }}>
      <div className="glass-card" style={{
        maxWidth: '340px',
        width: '100%',
        padding: '32px 24px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Need a Hint?</h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>
          Get a hint for this word for <span style={{ color: 'var(--neon-purple)', fontWeight: 700 }}>{cost} PC</span>.
        </p>

        {hint ? (
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
          }}>
            {hint}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn-premium"
              onClick={onConfirm}
              disabled={!canAfford}
              style={{ width: '100%', opacity: canAfford ? 1 : 0.5 }}
            >
              {canAfford ? `Unlock Hint (${cost} PC)` : 'Not enough PC'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Maybe later
            </button>
          </div>
        )}

        {hint && (
          <button className="btn-premium" onClick={onClose} style={{ width: '100%' }}>
            Got it!
          </button>
        )}
      </div>
    </div>
  );
};

export default HintModal;
