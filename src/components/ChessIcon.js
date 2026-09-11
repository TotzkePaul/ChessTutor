import React from 'react';

export default function ChessIcon({ kind, className = '' }) {
  return (
    <svg className={`chess-icon ${className}`} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      {kind === 'attack' ? <>
        <path d="m14 3 7-1-1 7-10 10-5-5Z" />
        <path d="m5 12 7 7M8 17l-5 5M2 19l3 3M10 14l7-7" />
      </> : kind === 'play' ?
        <path d="m8 4 12 8-12 8Z" fill="currentColor" stroke="none" /> :
        <path d="M12 2 21 6v6c0 5-6 9-9 10-3-1-9-5-9-10V6Z M12 6v11" />}
    </svg>
  );
}
