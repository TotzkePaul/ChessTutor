/* eslint-disable no-restricted-globals */
import ChessEngine from '../logic/chessEngine';

const engine = new ChessEngine();

self.onmessage = (event) => {
  const { id, type, payload } = event.data || {};

  if (type !== 'GET_BEST_MOVE') {
    self.postMessage({
      id,
      type: 'ERROR',
      error: 'Unknown message type'
    });
    return;
  }

  try {
    const {
      fen,
      history,
      moveCount,
      playerColor,
      searchDepth,
      selectedStrategies,
      strategyOrder
    } = payload;

    // Replay the actual game to retain repetition history inside chess.js.
    engine.game.reset();
    for (const played of history || []) engine.game.move(played);
    if (engine.game.fen() !== fen) engine.game.load(fen);
    engine.history = history || [];
    engine.moveCount = typeof moveCount === 'number' ? moveCount : engine.history.length;
    engine.setPlayerColor(playerColor);
    engine.setSearchDepth(searchDepth);
    engine.setSelectedStrategies(selectedStrategies || []);
    engine.setStrategyOrder(strategyOrder || []);

    const move = engine.getBestMove();

    self.postMessage({
      id,
      type: 'BEST_MOVE',
      move
    });
  } catch (error) {
    self.postMessage({
      id,
      type: 'ERROR',
      error: error.message
    });
  }
};
