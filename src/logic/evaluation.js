/**
 * Evaluation
 * Provides board position evaluation according to selected strategies
 */

// Default piece values
const DEFAULT_PIECE_VALUES = {
  p: 100,  // pawn
  n: 320,  // knight
  b: 330,  // bishop
  r: 500,  // rook
  q: 900,  // queen
  k: 20000 // king
};

// Strategy weights
const DEFAULT_STRATEGY_WEIGHTS = {
  'Control center': 1.0,
  'Develop knights before bishops': 0.8,
  'Castle early': 0.9,
  'Avoid moving the same piece twice': 0.7,
  'Connect your rooks': 0.6,
  'Don\'t bring your queen out too early': 0.8,
  'Don\'t trade without a purpose': 0.5
};

/**
 * Get all available strategies
 * @returns {Array} List of strategy names
 */
export const getAvailableStrategies = () => [
  'Control center',
  'Develop knights before bishops',
  'Castle early',
  'Avoid moving the same piece twice',
  'Connect your rooks',
  'Don\'t bring your queen out too early',
  'Don\'t trade without a purpose'
];

/**
 * Calculate material balance
 * @param {Object} game - Chess.js game instance
 * @param {Object} pieceValues - Custom piece values (optional)
 * @returns {number} Material score (positive favors white)
 */
export const calculateMaterialBalance = (game, pieceValues = DEFAULT_PIECE_VALUES) => {
  let score = 0;
  // Loop through the board
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = String.fromCharCode(97 + j) + (8 - i);
      const piece = game.get(square);
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === 'w' ? value : -value;
      }
    }
  }
  return score;
};

/**
 * Strategy score calculators
 * Maps strategy names to their scoring functions
 */
export const strategyScorers = {
  'Control center': (chessEngine) => chessEngine.getCenterControlScore(),
  'Develop knights before bishops': (chessEngine) => chessEngine.getKnightDevelopmentScore(),
  'Castle early': (chessEngine) => chessEngine.getCastlingScore(),
  'Avoid moving the same piece twice': (chessEngine) => chessEngine.getAvoidRepeatedMovesScore(),
  'Connect your rooks': (chessEngine) => chessEngine.getConnectedRooksScore(),
  'Don\'t bring your queen out too early': (chessEngine) => chessEngine.getQueenDevelopmentScore(),
  'Don\'t trade without a purpose': (chessEngine) => chessEngine.getPurposefulTradeScore()
};

/**
 * Evaluate a board position using selected strategies
 * @param {Object} chessEngine - ChessEngine instance
 * @param {Array} selectedStrategies - Array of strategy names
 * @param {Array} strategyOrder - Array of strategy names in order of priority
 * @returns {number} Evaluation score from perspective of the current player
 */
export const evaluatePosition = (chessEngine, selectedStrategies = [], strategyOrder = []) => {
  // Set the strategies in the engine
  chessEngine.setSelectedStrategies(selectedStrategies);
  chessEngine.setStrategyOrder(strategyOrder);
  
  // Use the engine's evaluation function
  return chessEngine.evaluatePosition();
};

/**
 * Check if a move aligns with a specific strategy
 * @param {Object} move - Chess.js move object
 * @param {string} strategy - Strategy name
 * @param {Object} chessEngine - ChessEngine instance
 * @returns {boolean} True if the move aligns with the strategy
 */
export const moveAlignsWithStrategy = (move, strategy, chessEngine) => {
  const score = chessEngine.getMovePriorityScore(move, strategy);
  return score > 0;
};

/**
 * Get strategy explanation for a specific move
 * @param {Object} move - Chess.js move object
 * @param {Array} selectedStrategies - Array of strategy names
 * @param {Object} chessEngine - ChessEngine instance
 * @returns {Array} Array of strategy explanations that apply to this move
 */
export const getStrategyExplanations = (move, selectedStrategies, chessEngine) => {
  const explanations = [];
  
  selectedStrategies.forEach(strategy => {
    if (moveAlignsWithStrategy(move, strategy, chessEngine)) {
      switch (strategy) {
        case 'Control center':
          explanations.push('This move helps control the center of the board.');
          break;
        case 'Develop knights before bishops':
          if (move.piece === 'n' && chessEngine.moveCount < 10) {
            explanations.push('Developing knights before bishops is a good opening strategy.');
          }
          break;
        case 'Castle early':
          if (move.san === 'O-O' || move.san === 'O-O-O') {
            explanations.push('Castling early improves king safety and connects your rooks.');
          }
          break;
        case 'Connect your rooks':
          if ((move.piece === 'b' || move.piece === 'n' || move.piece === 'q') && 
              move.from.charAt(1) === (move.color === 'w' ? '1' : '8') && 
              move.to.charAt(1) !== (move.color === 'w' ? '1' : '8')) {
            explanations.push('This move helps connect your rooks by clearing the back rank.');
          }
          break;
        default:
          break;
      }
    }
  });
  
  return explanations;
};

export default {
  getAvailableStrategies,
  calculateMaterialBalance,
  evaluatePosition,
  moveAlignsWithStrategy,
  getStrategyExplanations,
  DEFAULT_PIECE_VALUES,
  DEFAULT_STRATEGY_WEIGHTS
};
