import React from 'react';
import ChessIcon from './ChessIcon';
import { OPENINGS, openingLine } from '../logic/openings';
import { useChessGame } from '../hooks/useChessGame';
import '../styles/Board.css';

/**
 * Component providing controls for AI behavior
 * Allows adjusting search depth and other AI settings
 */
const AiControls = () => {
  const { 
    searchDepth, 
    setSearchDepth,
    playerColor,
    setPlayerColor,
    resetGame,
    openingId,
    setOpeningId,
    isAiThinking,
    gameState,
    isGameOver
  } = useChessGame();
  const opening = OPENINGS.find(item => item.id === openingId) || OPENINGS[0];

  // Handle search depth change
  const handleDepthChange = (e) => {
    const depth = parseInt(e.target.value, 10);
    setSearchDepth(depth);
  };

  // Handle player color change
  const handleColorChange = (color) => {
    setPlayerColor(color);
    resetGame(); // Reset game when changing sides
  };

  return (
    <div className="ai-controls">
      <h3 className="play-heading"><ChessIcon kind="play" /> Play <span>vs computer</span></h3>

      <div className="control-group">
        <label htmlFor="opening">Opening</label>
        <select id="opening" value={openingId} onChange={event => setOpeningId(event.target.value)}
          disabled={isAiThinking} aria-describedby="opening-help opening-line">
          {OPENINGS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <p className="opening-line" id="opening-line">{openingLine(opening) || 'Start from the initial position.'}</p>
        <p className="hint-text" id="opening-help">Choose an opening, then press New game to practice from that position.</p>
      </div>
      
      {/* Search depth control */}
      <div className="control-group">
        <label htmlFor="search-depth">Difficulty: {searchDepth} / 5</label>
        <div className="slider-container">
          <input
            type="range"
            id="search-depth"
            min="1"
            max="5"
            step="1"
            value={searchDepth}
            onChange={handleDepthChange}
            disabled={isAiThinking}
          />
          <div className="slider-labels">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
        <p className="hint-text">
          {searchDepth <= 2 ? 'Faster but weaker AI' : 
           searchDepth >= 4 ? 'Stronger but slower AI' : 
           'Balanced strength and speed'}
        </p>
      </div>
      
      {/* Player color selection */}
      <div className="control-group">
        <label>Play as:</label>
        <div className="color-selector">
          <button 
            className={`color-btn ${playerColor === 'w' ? 'selected' : ''}`}
            onClick={() => handleColorChange('w')}
            disabled={isAiThinking || (!isGameOver && gameState.moveCount > 0)}
          >
            White
          </button>
          <button 
            className={`color-btn ${playerColor === 'b' ? 'selected' : ''}`}
            onClick={() => handleColorChange('b')}
            disabled={isAiThinking || (!isGameOver && gameState.moveCount > 0)}
          >
            Black
          </button>
        </div>
      </div>
      
      {/* Reset game button */}
      <div className="control-group">
        <button 
          className="reset-btn"
          onClick={resetGame}
          disabled={isAiThinking}
        >
          <ChessIcon kind="play" /> New game
        </button>
      </div>
      
      {/* AI thinking indicator */}
      {isAiThinking && (
        <div className="thinking-indicator">
          AI is thinking...
        </div>
      )}
    </div>
  );
};

export default AiControls;
