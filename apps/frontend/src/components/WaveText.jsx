import React, { useMemo, useState } from 'react';

export default function WaveText({
  text,
  className = '',
  fontSize = '3rem',
}) {
  const [hovered, setHovered] = useState(false);
  const chars = useMemo(() => [...text], [text]);

  return (
    <span
      className={`inline-block relative cursor-pointer select-none ${className}`}
      style={{
        fontSize,
        fontFamily: "'Bebas Neue', sans-serif",
        fontWeight: 400,
        letterSpacing: '3px',
        color: '#fff',
        lineHeight: 1,
        verticalAlign: 'bottom',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transitionDelay: `${i * 30}ms`,
            transform: hovered ? 'translateY(-0.3em) scale(1.2)' : 'translateY(0) scale(1)',
            willChange: 'transform',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
