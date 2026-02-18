import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

/**
 * Custom hook that provides access to the chess game context
 * Makes it easy for components to interact with the game state
 * @returns {Object} The chess game context
 */
export const useChessGame = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useChessGame must be used within a GameProvider');
  }
  
  return context;
};

export default useChessGame;
