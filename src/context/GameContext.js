import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ChessEngine from '../logic/chessEngine';
import { createChessWorker } from '../workers/workerFactory';
import { OPENINGS } from '../logic/openings';

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
  // AI settings
  const [searchDepth, setSearchDepth] = useState(3);
  const [openingId, setOpeningId] = useState('standard');
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
  const workerRef = useRef(null);
  const workerRequestIdRef = useRef(0);
  const useWorkerRef = useRef(true);

  useEffect(() => {
    const worker = createChessWorker();

    if (!worker) {
      useWorkerRef.current = false;
      return undefined;
    }

    workerRef.current = worker;
    useWorkerRef.current = true;

    return () => {
      workerRef.current?.terminate();
      // Invalidate any queued reply from the terminated worker.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      workerRequestIdRef.current++;
      workerRef.current = null;
    };
  }, []);
  
  // Apply game state changes from the engine
  const updateGameState = useCallback(() => {
    const newState = chessEngine.getGameState();
    setFen(chessEngine.getFen());
    setGameState(newState);
    setCurrentTurn(newState.turn);
    setIsGameOver(chessEngine.isGameOver());
  }, [chessEngine]);
  
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
  
  const applyAiMove = useCallback((move) => {
    if (!move) {
      setIsAiThinking(false);
      return;
    }

    const aiMove = chessEngine.makeMove(move);

    if (aiMove) {
      setLastMove(aiMove);
      updateGameState();
    }

    setIsAiThinking(false);
  }, [chessEngine, updateGameState]);

  const runAiMoveOnMainThread = useCallback(() => {
    const aiMove = chessEngine.makeAiMove();

    if (aiMove) {
      setLastMove(aiMove);
      updateGameState();
    }

    setIsAiThinking(false);
  }, [chessEngine, updateGameState]);

  // Schedule AI move with a small delay for better UX
  const scheduleAiMove = useCallback(() => {
    if (chessEngine.isGameOver() || chessEngine.game.turn() !== chessEngine.aiColor) return;
    const scheduledId = ++workerRequestIdRef.current;
    setIsAiThinking(true);

    // Clear any existing timeout
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }

    // Schedule AI move after a short delay
    aiTimeoutRef.current = setTimeout(() => {
      const requestId = scheduledId;

      if (useWorkerRef.current && workerRef.current) {
        workerRef.current.onmessage = (event) => {
          const { id, type, move } = event.data || {};

          if (id !== requestId || id !== workerRequestIdRef.current) {
            return;
          }

          if (type === 'BEST_MOVE') {
            applyAiMove(move);
            return;
          }

          useWorkerRef.current = false;
          runAiMoveOnMainThread();
        };

        workerRef.current.onerror = () => {
          if (requestId !== workerRequestIdRef.current) return;
          useWorkerRef.current = false;
          runAiMoveOnMainThread();
        };

        workerRef.current.postMessage({
          id: requestId,
          type: 'GET_BEST_MOVE',
          payload: {
            fen: chessEngine.getFen(),
            history: chessEngine.history,
            moveCount: chessEngine.moveCount,
            playerColor: chessEngine.playerColor,
            searchDepth,
            selectedStrategies,
            strategyOrder
          }
        });
      } else {
        runAiMoveOnMainThread();
      }
    }, 20);
  }, [
    applyAiMove,
    chessEngine,
    runAiMoveOnMainThread,
    searchDepth,
    selectedStrategies,
    strategyOrder
  ]);
  
  // Reset game
  const resetGame = () => {
    workerRequestIdRef.current++;
    clearTimeout(aiTimeoutRef.current);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = createChessWorker();
    }
    setIsAiThinking(false);
    chessEngine.resetGame();
    const opening = OPENINGS.find(item => item.id === openingId) || OPENINGS[0];
    let openingMove = null;
    for (const move of opening.moves) openingMove = chessEngine.makeMove(move);
    setSelectedSquare(null);
    setLastMove(openingMove);
    updateGameState();
    
    // Continue from the opening with whichever side is next to move.
    if (chessEngine.game.turn() === chessEngine.aiColor) {
      scheduleAiMove();
    }
  };
  
  // Update player color
  const handleSetPlayerColor = (color) => {
    setPlayerColor(color);
    setSelectedSquare(null);
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
  }, [selectedStrategies, chessEngine]);
  
  // Update strategy order
  useEffect(() => {
    chessEngine.setStrategyOrder(strategyOrder);
  }, [strategyOrder, chessEngine]);
  
  // Get piece at a specific square
  const getPiece = (square) => {
    return chessEngine.getPiece(square);
  };

  const threatShieldMap = useMemo(() => chessEngine.calculateAllThreatShields(),
    // The mutable engine changes when the position or player perspective changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chessEngine, fen, playerColor]);
  const getThreatShieldCount = useCallback(square => threatShieldMap[square], [threatShieldMap]);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);
  
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
        makeMove,
        resetGame,
        openingId,
        setOpeningId,
        getPiece,
        getThreatShieldCount,
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
