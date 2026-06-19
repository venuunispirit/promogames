import React from 'react';

const HintModal = ({ isOpen, onClose, hint, onConfirm }) => {
  if (!isOpen) return null;

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
      <div style={{
        maxWidth: '340px',
        width: '100%',
        padding: '32px 24px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#1a1a2e' }}>Need a Hint?</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
          Reveal the clue for the selected word.
        </p>

        {hint ? (
          <div style={{
            background: '#f3e8ff',
            border: '1px solid #c084fc',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#5b21b6',
          }}>
            {hint}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={onConfirm}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(124, 58, 237, 0.4)',
              }}
            >
              Reveal Hint
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#999',
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
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(124, 58, 237, 0.4)',
            }}
          >
            Got it!
          </button>
        )}
      </div>
    </div>
  );
};

export default HintModal;
