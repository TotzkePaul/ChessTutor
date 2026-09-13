import React from 'react';

export default function ChessIcon({ kind, className = '' }) {
  return (
    <svg className={`chess-icon ${className}`} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      {kind === 'attack' ? <>
        <path fill="currentColor" d="m14.2 2.7 7.2-1.1-1 6.6-10 10.2-5.2-5.1 8.9-10.2Z" />
        <path d="m5 12.4 7 6.8M8 17.1l-5 4.9M2 19l3 2.9M10.3 13.8l6.9-6.9" />
      </> : kind === 'play' ?
        <path d="m8 4 12 8-12 8Z" fill="currentColor" stroke="none" /> :
        <>
          <path fill="currentColor" d="M12 2 21 6v6c0 5-6 9-9 10-3-1-9-5-9-10V6Z" />
          <path d="M12 6v11" />
        </>}
    </svg>
  );
}
