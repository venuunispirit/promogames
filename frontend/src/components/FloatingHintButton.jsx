import React from 'react';

const FloatingHintButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
        border: 'none',
        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        zIndex: 1000,
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      💡
    </button>
  );
};

export default FloatingHintButton;
