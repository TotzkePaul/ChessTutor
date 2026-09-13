import React from 'react';
import Tooltip from './Tooltip';
import ChessIcon from './ChessIcon';
import PieceIcon from './PieceIcon';
import '../styles/Board.css';

/**
 * Component representing a single square on the chess board
 * Displays piece if any, and shows threat/shield tooltips on hover
 */
const Square = ({ 
  square, // Square notation (e.g., 'e4')
  piece, // Piece object from chess.js { type: 'p', color: 'w' }
  isDark, // Whether this is a dark square
  isSelected, // Whether this square is currently selected
  isLastMove, // Whether this square was part of the last move
  getThreatShieldData, // Function returning { threats: number, shields: number }
  onClick // Handler for clicking on this square
}) => {
  const counts = getThreatShieldData(square);
  const squareClass = `
    square 
    ${isDark ? 'square-dark' : 'square-light'} 
    ${isSelected ? 'square-selected' : ''}
    ${isLastMove ? 'square-last-move' : ''}
  `;
  
  // Render piece SVG icon
  const getPieceDisplay = () => {
    if (!piece) return null;
    
    return <PieceIcon pieceType={piece.type} pieceColor={piece.color} />;
  };
  
  // Format tooltip content
  const renderTooltipContent = () => {
    const threatShieldData = getThreatShieldData ? getThreatShieldData(square) : null;

    if (!threatShieldData) {
      return null;
    }

    return (
      <div className="square-info">
        <div className="threat-counter">Attacks: {threatShieldData.threats}</div>
        <div className="shield-counter">Defenders: {threatShieldData.shields}</div>
      </div>
    );
  };
  
  return (
    <Tooltip content={renderTooltipContent}>
      <div 
        className={squareClass}
        onClick={() => onClick(square)}
        data-square={square}
        role="button"
        tabIndex={0}
        aria-label={`${square}, attacks ${counts.threats}, defenders ${counts.shields}`}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(square);
          }
        }}
      >
        <span className="square-coordinate">{square}</span>
        <span className="square-counters" aria-hidden="true">
          <span className={`threat-badge ${counts.threats === 0 ? "counter-zero" : ""}`}><ChessIcon kind="attack" />{counts.threats}</span>
          <span className={`shield-badge ${counts.shields === 0 ? "counter-zero" : ""}`}><ChessIcon kind="defend" />{counts.shields}</span>
        </span>
        <div className={`piece piece-${piece?.color || "empty"}`}>{getPieceDisplay()}</div>
      </div>
    </Tooltip>
  );
};

export default Square;
