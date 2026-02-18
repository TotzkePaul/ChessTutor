import React from 'react';
import Tooltip from './Tooltip';
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
  threatShieldData, // Object with { threats: number, shields: number }
  onClick // Handler for clicking on this square
}) => {
  const squareClass = `
    square 
    ${isDark ? 'square-dark' : 'square-light'} 
    ${isSelected ? 'square-selected' : ''}
    ${isLastMove ? 'square-last-move' : ''}
  `;
  
  // Get piece Unicode character or image path
  const getPieceDisplay = () => {
    if (!piece) return null;
    
    const pieceSymbols = {
      k: { w: '♔', b: '♚' },
      q: { w: '♕', b: '♛' },
      r: { w: '♖', b: '♜' },
      b: { w: '♗', b: '♝' },
      n: { w: '♘', b: '♞' },
      p: { w: '♙', b: '♟' }
    };
    
    return pieceSymbols[piece.type][piece.color];
  };
  
  // Format tooltip content
  const tooltipContent = threatShieldData ? (
    <div className="square-info">
      <div className="threat-counter">Threats: {threatShieldData.threats}</div>
      <div className="shield-counter">Shields: {threatShieldData.shields}</div>
    </div>
  ) : null;
  
  return (
    <Tooltip content={tooltipContent}>
      <div 
        className={squareClass}
        onClick={() => onClick(square)}
        data-square={square}
      >
        <div className="piece">{getPieceDisplay()}</div>
      </div>
    </Tooltip>
  );
};

export default Square;
