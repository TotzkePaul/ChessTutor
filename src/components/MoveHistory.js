import React, { useRef, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import '../styles/Board.css';

/**
 * Component for displaying the history of moves in the game
 * Shows moves in algebraic notation with move numbers
 */
const MoveHistory = () => {
  const { gameState } = useChessGame();
  const historyRef = useRef(null);
  
  // Auto-scroll to the bottom when new moves are added
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [gameState.history]);
  
  // Format moves in pairs (white and black)
  const formatMoveHistory = () => {
    const { history } = gameState;
    const formattedHistory = [];
    
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = history[i]?.san || '';
      const blackMove = history[i + 1]?.san || '';
      
      formattedHistory.push({
        moveNumber,
        whiteMove,
        blackMove
      });
    }
    
    return formattedHistory;
  };
  
  const formattedHistory = formatMoveHistory();
  
  return (
    <div className="move-history">
      <h3>Move History</h3>
      
      <div className="history-container" ref={historyRef}>
        {formattedHistory.length === 0 ? (
          <div className="empty-history">No moves yet</div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {formattedHistory.map(({ moveNumber, whiteMove, blackMove }) => (
                <tr key={moveNumber}>
                  <td className="move-number">{moveNumber}.</td>
                  <td className="white-move">{whiteMove}</td>
                  <td className="black-move">{blackMove}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Game result */}
      {gameState.isCheckmate && (
        <div className="game-result checkmate">
          Checkmate: {gameState.turn === 'w' ? 'Black' : 'White'} wins
        </div>
      )}
      
      {gameState.isStalemate && (
        <div className="game-result stalemate">
          Stalemate: Game drawn
        </div>
      )}
      
      {gameState.isInsufficientMaterial && (
        <div className="game-result draw">
          Insufficient material: Game drawn
        </div>
      )}
      
      {gameState.isThreefoldRepetition && (
        <div className="game-result draw">
          Threefold repetition: Game drawn
        </div>
      )}
    </div>
  );
};

export default MoveHistory;
