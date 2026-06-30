import React, { useMemo, useState } from 'react';

export default function TextReveal({
  text,
  fontSize = '3rem',
  staggerDelay = 25,
  duration = 250,
  easing = 'ease-in-out',
  color = 'inherit',
  hoverColor = '#b2c73a',
  direction = 'up',
  className = '',
  style,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  const chars = useMemo(() => [...text], [text]);
  const sign = direction === 'up' ? 1 : -1;

  return (
    <span
      className={`inline-block relative no-underline font-extrabold uppercase tracking-tight overflow-hidden cursor-pointer select-none ${className}`.trim()}
      style={{
        fontSize,
        color: hovered ? hoverColor : color,
        transition: 'color 0.35s ease',
        padding: '0.15em 0.4em',
        lineHeight: 1,
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      aria-label={text}
    >
      <span
        className="inline-flex overflow-hidden relative"
        style={{ height: '1em' }}
        aria-hidden="true"
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block relative will-change-transform"
            style={{
              textShadow: `0 ${sign}em currentColor`,
              transition: `transform ${duration}ms ${easing}`,
              transitionDelay: `${i * staggerDelay}ms`,
              transform: hovered ? `translateY(${-sign}em)` : 'translateY(0)',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}
