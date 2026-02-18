import React, { createContext, useState, useEffect, useRef } from 'react';
import ChessEngine from '../logic/chessEngine';

// Create context
export const GameContext = createContext();

/**
 * Provider component for the chess game context
 * Manages global state for the chess application
 */
export const GameProvider = ({ children }) => {
  // Create chess engine instance
  const chessEngineRef = useRef(new ChessEngine());
  const chessEngine = chessEngineRef.current;
  
  // Game state
  const [fen, setFen] = useState(chessEngine.getFen());
  const [gameState, setGameState] = useState(chessEngine.getGameState());
  const [playerColor, setPlayerColor] = useState('w'); // Default player as white
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('w');
  const [threatShieldData, setThreatShieldData] = useState({});
  
  // AI settings
  const [searchDepth, setSearchDepth] = useState(3);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState([
    'Control center',
    'Castle early',
    'Develop knights before bishops'
  ]);
  const [strategyOrder, setStrategyOrder] = useState([
    'Control center',
    'Castle early',
    'Develop knights before bishops'
  ]);
  
  // AI thinking timeout ref
  const aiTimeoutRef = useRef(null);
  
  // Apply game state changes from the engine
  const updateGameState = () => {
    const newState = chessEngine.getGameState();
    setFen(chessEngine.getFen());
    setGameState(newState);
    setCurrentTurn(newState.turn);
    setIsGameOver(chessEngine.isGameOver());
    
    // Calculate threat/shield data for all squares
    setThreatShieldData(chessEngine.calculateAllThreatShields());
  };
  
  // Handle player move
  const makeMove = (move) => {
    // Prevent moves during AI thinking or if game is over
    if (isAiThinking || isGameOver || currentTurn !== playerColor) {
      return null;
    }
    
    const result = chessEngine.makeMove(move);
    
    if (result) {
      setLastMove(result);
      updateGameState();
      
      // Schedule AI move if it's AI's turn and game is not over
      if (!chessEngine.isGameOver() && chessEngine.game.turn() === chessEngine.aiColor) {
        scheduleAiMove();
      }
    }
    
    return result;
  };
  
  // Schedule AI move with a small delay for better UX
  const scheduleAiMove = () => {
    setIsAiThinking(true);
    
    // Clear any existing timeout
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    
    // Schedule AI move after a short delay
    aiTimeoutRef.current = setTimeout(() => {
      const aiMove = chessEngine.makeAiMove();
      
      if (aiMove) {
        setLastMove(aiMove);
        updateGameState();
      }
      
      setIsAiThinking(false);
    }, 500); // 500ms delay for better UX
  };
  
  // Reset game
  const resetGame = () => {
    chessEngine.resetGame();
    setSelectedSquare(null);
    setLastMove(null);
    updateGameState();
    
    // If player is black, AI (white) should make first move
    if (playerColor === 'b' && !isGameOver) {
      scheduleAiMove();
    }
  };
  
  // Update player color
  const handleSetPlayerColor = (color) => {
    setPlayerColor(color);
    chessEngine.setPlayerColor(color);
  };
  
  // Update search depth
  const handleSetSearchDepth = (depth) => {
    setSearchDepth(depth);
    chessEngine.setSearchDepth(depth);
  };
  
  // Update selected strategies
  useEffect(() => {
    chessEngine.setSelectedStrategies(selectedStrategies);
  }, [selectedStrategies]);
  
  // Update strategy order
  useEffect(() => {
    chessEngine.setStrategyOrder(strategyOrder);
  }, [strategyOrder]);
  
  // Get piece at a specific square
  const getPiece = (square) => {
    return chessEngine.getPiece(square);
  };
  
  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);
  
  // Make first AI move if player is black
  useEffect(() => {
    if (playerColor === 'b' && currentTurn === 'w' && !isGameOver && gameState.moveCount === 0) {
      scheduleAiMove();
    }
  }, [playerColor, currentTurn, isGameOver, gameState.moveCount]);
  
  return (
    <GameContext.Provider
      value={{
        fen,
        gameState,
        playerColor,
        setPlayerColor: handleSetPlayerColor,
        selectedSquare,
        setSelectedSquare,
        lastMove,
        isGameOver,
        currentTurn,
        threatShieldData,
        makeMove,
        resetGame,
        getPiece,
        searchDepth,
        setSearchDepth: handleSetSearchDepth,
        isAiThinking,
        selectedStrategies,
        setSelectedStrategies,
        strategyOrder,
        setStrategyOrder
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
