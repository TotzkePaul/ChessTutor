import React, { useState, useEffect } from 'react';
import Square from './Square';
import ChessIcon from './ChessIcon';
import PieceIcon from './PieceIcon';
import { useChessGame } from '../hooks/useChessGame';
import '../styles/Board.css';

/**
 * Chessboard component to display the game board
 * Uses Square components to render individual squares
 */
const Board = () => {
  const {    
    makeMove, 
    selectedSquare, 
    setSelectedSquare, 
    getPiece, 
    getThreatShieldCount,
    lastMove,
    currentTurn,
    playerColor,
    isGameOver,
    gameState
  } = useChessGame();

  const [promotionMove, setPromotionMove] = useState(null);

  // Local state for board dimensions
  const [boardSize, setBoardSize] = useState({ width: 560, height: 560 });

  // Update board dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      // Keep the board square and responsive
      const container = document.querySelector('.board-container');
      if (container) {
        const width = Math.min(
          container.clientWidth,
          window.innerHeight * 0.8
        );
        setBoardSize({ width, height: width });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle square click for piece selection and movement
  const handleSquareClick = (square) => {
    if (isGameOver || currentTurn !== playerColor) return;
    
    const piece = getPiece(square);
    
    // If a square is already selected
    if (selectedSquare) {
      // If clicking on a different square - try to move
      if (selectedSquare !== square) {
        // Attempt to make the move
        const moving = getPiece(selectedSquare);
        if (moving?.type === 'p' && ['1', '8'].includes(square[1])) {
          setPromotionMove({ from: selectedSquare, to: square });
        } else {
          makeMove({ from: selectedSquare, to: square });
        }

        // Clear selection regardless of move success
        setSelectedSquare(null);
      } else {
        // Clicking on the same square deselects it
        setSelectedSquare(null);
      }
    } else if (piece && piece.color === playerColor) {
      // Select this square if it contains the player's piece
      setSelectedSquare(square);
    }
  };

  // Render the chessboard
  const renderBoard = () => {
    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    if (playerColor === 'b') { files.reverse(); ranks.reverse(); }

    // Create all 64 squares
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = files[file] + ranks[rank];
        const isDark = (file + rank) % 2 === 1;
        const piece = getPiece(square);
        const isSelected = selectedSquare === square;
        
        // Check if this square was part of the last move
        const isLastMove = lastMove && 
          (lastMove.from === square || lastMove.to === square);

        board.push(
          <Square
            key={square}
            square={square}
            piece={piece}
            isDark={isDark}
            isSelected={isSelected}
            isLastMove={isLastMove}
            getThreatShieldData={getThreatShieldCount}
            onClick={handleSquareClick}
          />
        );
      }
    }

    return board;
  };

  const blackCaptured = gameState.history
    .filter((move) => move.color === 'w' && move.captured)
    .map((move) => ({ pieceType: move.captured, pieceColor: 'b' }));

  const whiteCaptured = gameState.history
    .filter((move) => move.color === 'b' && move.captured)
    .map((move) => ({ pieceType: move.captured, pieceColor: 'w' }));

  const renderCapturedPieces = (capturedPieces) => {
    if (capturedPieces.length === 0) {
      return <span className="captured-empty">None</span>;
    }

    return capturedPieces.map((piece, index) => (
      <span className="captured-piece" key={`${piece.pieceType}-${piece.pieceColor}-${index}`}>
        <PieceIcon pieceType={piece.pieceType} pieceColor={piece.pieceColor} />
      </span>
    ));
  };

  return (
    <div className="board-container">
      <div 
        className="board"
        style={{
          width: `${boardSize.width}px`,
          height: `${boardSize.height}px`,
          gridTemplateColumns: 'repeat(8, 1fr)',
        }}
      >
        {renderBoard()}
      </div>
      <div className="captured-strip" aria-label="Captured pieces">
        <div className="captured-row">
          <span className="captured-label">Black captured</span>
          <span className="captured-list">{renderCapturedPieces(blackCaptured)}</span>
        </div>
        <div className="captured-row">
          <span className="captured-label">White captured</span>
          <span className="captured-list">{renderCapturedPieces(whiteCaptured)}</span>
        </div>
      </div>
      
      
      <p className="counter-legend"><span className="legend-icons"><span><ChessIcon kind="attack" /> Attacks</span><span><ChessIcon kind="defend" /> Defenders</span></span>
        Occupied squares use the piece’s color; empty squares use your color.
        Counts show attacks, including pinned pieces, not legal moves.</p>
      {promotionMove && (
        <div role="dialog" aria-label="Choose promotion piece">
          <p>Promote pawn to:</p>
          {['q', 'r', 'b', 'n'].map((promotion, index) => (
            <button key={promotion} onClick={() => {
              makeMove({ ...promotionMove, promotion });
              setPromotionMove(null);
            }}>{['Queen', 'Rook', 'Bishop', 'Knight'][index]}</button>
          ))}
          <button onClick={() => setPromotionMove(null)}>Cancel</button>
        </div>
      )}
      {/* Game status message */}
      {isGameOver && (
        <div className="game-status">
          {gameState.isCheckmate ? (
            <span>Checkmate! {gameState.turn === 'w' ? 'Black' : 'White'} wins</span>
          ) : gameState.isDraw ? (
            <span>Game drawn</span>
          ) : (
            <span>Game over</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Board;
