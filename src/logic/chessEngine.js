import { Chess } from 'chess.js';

/**
 * Chess Engine - Manages game state and AI logic
 * Uses chess.js library for game rules, validation, and state management
 */
class ChessEngine {
  constructor() {
    // Initialize the chess game
    this.game = new Chess();
    this.history = [];
    this.moveCount = 0;
    this.playerColor = 'w'; // Default player as white
    this.aiColor = 'b'; // Default AI as black
    this.searchDepth = 3; // Default search depth
    
    // Piece values for evaluation
    this.pieceValues = {
      p: 100,  // pawn
      n: 320,  // knight
      b: 330,  // bishop
      r: 500,  // rook
      q: 900,  // queen
      k: 20000 // king
    };
    
    // Strategy weights and settings
    this.selectedStrategies = [];
    this.strategyOrder = [];
    
    // Track piece moves for repeated moves strategy
    this.pieceMoveCount = {};
    
    // For performance tracking
    this.positionsEvaluated = 0;
  }

  /**
   * Get the current FEN notation of the board
   * @returns {string} FEN notation
   */
  getFen() {
    return this.game.fen();
  }

  /**
   * Get all legal moves for a specific square or all pieces
   * @param {string} square - Chess square (e.g., 'e4')
   * @returns {Array} Legal moves
   */
  getLegalMoves(square = null) {
    if (square) {
      return this.game.moves({ square, verbose: true });
    }
    return this.game.moves({ verbose: true });
  }

  /**
   * Make a move on the board
   * @param {Object} move - Move object (from, to, promotion)
   * @returns {Object|null} The move object if successful, null if illegal
   */
  makeMove(move) {
    try {
      const result = this.game.move(move);
      if (result) {
        this.moveCount++;
        this.history.push(result);
      }
      return result;
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }

  /**
   * Undo the last move
   * @returns {Object|null} The move that was undone, or null if no moves to undo
   */
  undoMove() {
    const move = this.game.undo();
    if (move) {
      this.moveCount--;
      this.history.pop();
    }
    return move;
  }

  /**
   * Reset the game to the starting position
   */
  resetGame() {
    this.game.reset();
    this.history = [];
    this.moveCount = 0;
  }

  /**
   * Check if the game is over (checkmate, stalemate, etc.)
   * @returns {boolean} True if game is over
   */
  isGameOver() {
    return this.game.isGameOver();
  }

  /**
   * Get the current game state
   * @returns {Object} Game state information
   */
  getGameState() {
    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      inCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isThreefoldRepetition: this.game.isThreefoldRepetition(),
      isInsufficientMaterial: this.game.isInsufficientMaterial(),
      halfMoveClock: this.game.halfMoves,
      fullMoveNumber: this.game.moveNumber,
      history: this.history,
      moveCount: this.moveCount,
    };
  }

  /**
   * Get the piece at a specific square
   * @param {string} square - Chess square (e.g., 'e4')
   * @returns {Object|null} Piece object or null if empty
   */
  getPiece(square) {
    return this.game.get(square);
  }

  /**
   * Set the AI search depth
   * @param {number} depth - Search depth
   */
  setSearchDepth(depth) {
    this.searchDepth = Math.max(1, Math.min(5, depth)); // Limit between 1-5
  }

  /**
   * Set player color
   * @param {string} color - 'w' for white, 'b' for black
   */
  setPlayerColor(color) {
    if (color === 'w' || color === 'b') {
      this.playerColor = color;
      this.aiColor = color === 'w' ? 'b' : 'w';
    }
  }
  
  /**
   * Set selected strategies for AI
   * @param {Array} strategies - Array of strategy names
   */
  setSelectedStrategies(strategies) {
    this.selectedStrategies = strategies;
  }
  
  /**
   * Set the order of strategies for tie-breaking
   * @param {Array} order - Array of strategy names in order of priority
   */
  setStrategyOrder(order) {
    this.strategyOrder = order;
  }
  
  /**
   * Evaluates the current board position
   * @returns {number} Score from perspective of current player (positive is good)
   */
  evaluatePosition() {
    // Game over conditions
    if (this.game.isCheckmate()) {
      return this.game.turn() === this.aiColor ? -10000 : 10000;
    }
    
    if (this.game.isDraw() || this.game.isStalemate() || 
        this.game.isThreefoldRepetition() || this.game.isInsufficientMaterial()) {
      return 0;
    }
    
    // Calculate material balance
    let score = this.getMaterialScore();
    
    // Apply strategies based on selection and priority
    this.strategyOrder.forEach((strategy, index) => {
      if (this.selectedStrategies.includes(strategy)) {
        const weight = 1 - (index * 0.1); // Higher priority = higher weight
        score += this.getStrategyScore(strategy) * weight;
      }
    });
    
    // Return score from perspective of current player
    return this.game.turn() === this.aiColor ? score : -score;
  }
  
  /**
   * Calculate material balance
   * @returns {number} Material score (positive favors white)
   */
  getMaterialScore() {
    let score = 0;
    // Loop through the board
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = this.game.get(square);
        if (piece) {
          const value = this.pieceValues[piece.type];
          score += piece.color === 'w' ? value : -value;
        }
      }
    }
    return score;
  }
  
  /**
   * Get score for a specific strategy
   * @param {string} strategy - Strategy name
   * @returns {number} Strategy score
   */
  getStrategyScore(strategy) {
    switch (strategy) {
      case 'Control center':
        return this.getCenterControlScore();
      case 'Castle early':
        return this.getCastlingScore();
      case 'Develop knights before bishops':
        return this.getKnightDevelopmentScore();
      case 'Avoid moving the same piece twice':
        return this.getAvoidRepeatedMovesScore();
      case 'Connect your rooks':
        return this.getConnectedRooksScore();
      case "Don't bring your queen out too early":
        return this.getQueenDevelopmentScore();
      case "Don't trade without a purpose":
        return this.getPurposefulTradeScore();
      default:
        return 0;
    }
  }
  
  /**
   * Calculate center control score
   * @returns {number} Center control score
   */
  getCenterControlScore() {
    const centralSquares = ['d4', 'e4', 'd5', 'e5'];
    let score = 0;
    
    centralSquares.forEach(square => {
      // Check if a piece controls this square
      const whiteMoves = this.getControllingMoves('w', square);
      const blackMoves = this.getControllingMoves('b', square);
      
      score += whiteMoves.length * 10;
      score -= blackMoves.length * 10;
      
      // Extra points for occupying the center
      const piece = this.game.get(square);
      if (piece) {
        score += piece.color === 'w' ? 20 : -20;
      }
    });
    
    return score;
  }
  
  /**
   * Get moves that control a specific square
   * @param {string} color - 'w' or 'b'
   * @param {string} targetSquare - Square to check control
   * @returns {Array} Moves that control the square
   */
  getControllingMoves(color, targetSquare) {
    const controllingMoves = [];
    
    // Check all squares for pieces that can move to or capture on targetSquare
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = this.game.get(square);
        
        if (piece && piece.color === color) {
          const moves = this.game.moves({ 
            square: square, 
            verbose: true 
          });
          
          const canControl = moves.some(move => move.to === targetSquare);
          if (canControl) {
            controllingMoves.push({ from: square, to: targetSquare });
          }
        }
      }
    }
    
    return controllingMoves;
  }
  
  /**
   * Calculate castling score
   * @returns {number} Castling score
   */
  getCastlingScore() {
    let score = 0;
    
    // Check white castling
    if (this.hasWhiteCastled()) {
      score += 50;
    } else if (this.canWhiteCastle()) {
      score += 20; // Bonus for maintaining the ability to castle
    }
    
    // Check black castling
    if (this.hasBlackCastled()) {
      score -= 50;
    } else if (this.canBlackCastle()) {
      score -= 20; // Bonus for maintaining the ability to castle
    }
    
    return score;
  }
  
  /**
   * Check if white has castled
   * @returns {boolean} True if white has castled
   */
  hasWhiteCastled() {
    return this.history.some(move => 
      move.color === 'w' && move.san === 'O-O' || move.san === 'O-O-O'
    );
  }
  
  /**
   * Check if black has castled
   * @returns {boolean} True if black has castled
   */
  hasBlackCastled() {
    return this.history.some(move => 
      move.color === 'b' && move.san === 'O-O' || move.san === 'O-O-O'
    );
  }
  
  /**
   * Check if white can castle
   * @returns {boolean} True if white can castle
   */
  canWhiteCastle() {
    // Look for castling rights in the FEN
    const castleRights = this.game.fen().split(' ')[2];
    return castleRights.includes('K') || castleRights.includes('Q');
  }
  
  /**
   * Check if black can castle
   * @returns {boolean} True if black can castle
   */
  canBlackCastle() {
    // Look for castling rights in the FEN
    const castleRights = this.game.fen().split(' ')[2];
    return castleRights.includes('k') || castleRights.includes('q');
  }
  
  /**
   * Calculate knight development score
   * @returns {number} Knight development score
   */
  getKnightDevelopmentScore() {
    let score = 0;
    
    // Define starting and developable positions
    const whiteKnightStart = ['b1', 'g1'];
    const blackKnightStart = ['b8', 'g8'];
    const whiteKnightDeveloped = ['c3', 'd2', 'e2', 'f3'];
    const blackKnightDeveloped = ['c6', 'd7', 'e7', 'f6'];
    
    // Check development of knights vs bishops in early game
    if (this.moveCount < 10) {
      // Count pieces moved from starting positions
      let whiteKnightsMoved = 0;
      let whiteBishopsMoved = 0;
      let blackKnightsMoved = 0;
      let blackBishopsMoved = 0;
      
      // Check white knights
      whiteKnightStart.forEach(square => {
        const piece = this.game.get(square);
        if (!piece || piece.type !== 'n') {
          whiteKnightsMoved++;
          
          // Extra points if knight is developed to a good square
          whiteKnightDeveloped.forEach(devSquare => {
            const devPiece = this.game.get(devSquare);
            if (devPiece && devPiece.type === 'n' && devPiece.color === 'w') {
              score += 15;
            }
          });
        }
      });
      
      // Check black knights
      blackKnightStart.forEach(square => {
        const piece = this.game.get(square);
        if (!piece || piece.type !== 'n') {
          blackKnightsMoved++;
          
          // Extra points if knight is developed to a good square
          blackKnightDeveloped.forEach(devSquare => {
            const devPiece = this.game.get(devSquare);
            if (devPiece && devPiece.type === 'n' && devPiece.color === 'b') {
              score -= 15;
            }
          });
        }
      });
      
      // Check white bishops (starting at c1 and f1)
      if (!this.game.get('c1') || this.game.get('c1').type !== 'b') whiteBishopsMoved++;
      if (!this.game.get('f1') || this.game.get('f1').type !== 'b') whiteBishopsMoved++;
      
      // Check black bishops (starting at c8 and f8)
      if (!this.game.get('c8') || this.game.get('c8').type !== 'b') blackBishopsMoved++;
      if (!this.game.get('f8') || this.game.get('f8').type !== 'b') blackBishopsMoved++;
      
      // Award points for developing knights before bishops
      if (whiteKnightsMoved > whiteBishopsMoved) score += 25;
      if (blackKnightsMoved > blackBishopsMoved) score -= 25;
    }
    
    return score;
  }
  
  /**
   * Calculate score for avoiding moving the same piece multiple times
   * @returns {number} Repeated moves penalty score
   */
  getAvoidRepeatedMovesScore() {
    let score = 0;
    
    // Only apply in the opening phase
    if (this.moveCount < 10) {
      // Group moves by piece and origin square to detect multiple moves of the same piece
      const whitePieceMoves = {};
      const blackPieceMoves = {};
      
      this.history.forEach(move => {
        if (!move.piece) return;
        
        // Create a unique ID for each piece based on its type and origin square
        const pieceId = `${move.piece}_${move.from}`;
        
        if (move.color === 'w') {
          whitePieceMoves[pieceId] = (whitePieceMoves[pieceId] || 0) + 1;
          
          // Penalize moving the same piece multiple times
          if (whitePieceMoves[pieceId] > 1) {
            score -= 20 * (whitePieceMoves[pieceId] - 1);
          }
        } else {
          blackPieceMoves[pieceId] = (blackPieceMoves[pieceId] || 0) + 1;
          
          // Penalize moving the same piece multiple times
          if (blackPieceMoves[pieceId] > 1) {
            score += 20 * (blackPieceMoves[pieceId] - 1);
          }
        }
      });
    }
    
    return score;
  }
  
  /**
   * Calculate score for connected rooks
   * @returns {number} Connected rooks score
   */
  getConnectedRooksScore() {
    let score = 0;
    
    // Check if white rooks are connected (no pieces between them on the back rank)
    const whiteBackRank = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];
    let whiteRookSquares = [];
    
    // Find white rook positions
    whiteBackRank.forEach(square => {
      const piece = this.game.get(square);
      if (piece && piece.type === 'r' && piece.color === 'w') {
        whiteRookSquares.push(square);
      }
    });
    
    // Check if there are two white rooks
    if (whiteRookSquares.length === 2) {
      // Sort by file (a-h)
      whiteRookSquares.sort();
      
      // Check if there are any pieces between the rooks
      let areWhiteRooksConnected = true;
      const [leftRook, rightRook] = whiteRookSquares;
      
      // Get files (as numbers 0-7)
      const leftFile = leftRook.charCodeAt(0) - 97;
      const rightFile = rightRook.charCodeAt(0) - 97;
      
      // Check squares between rooks
      for (let file = leftFile + 1; file < rightFile; file++) {
        const square = String.fromCharCode(97 + file) + '1';
        if (this.game.get(square)) {
          areWhiteRooksConnected = false;
          break;
        }
      }
      
      if (areWhiteRooksConnected) {
        score += 30;
      }
    }
    
    // Do the same check for black rooks
    const blackBackRank = ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'];
    let blackRookSquares = [];
    
    blackBackRank.forEach(square => {
      const piece = this.game.get(square);
      if (piece && piece.type === 'r' && piece.color === 'b') {
        blackRookSquares.push(square);
      }
    });
    
    if (blackRookSquares.length === 2) {
      blackRookSquares.sort();
      
      let areBlackRooksConnected = true;
      const [leftRook, rightRook] = blackRookSquares;
      
      const leftFile = leftRook.charCodeAt(0) - 97;
      const rightFile = rightRook.charCodeAt(0) - 97;
      
      for (let file = leftFile + 1; file < rightFile; file++) {
        const square = String.fromCharCode(97 + file) + '8';
        if (this.game.get(square)) {
          areBlackRooksConnected = false;
          break;
        }
      }
      
      if (areBlackRooksConnected) {
        score -= 30;
      }
    }
    
    return score;
  }
  
  /**
   * Calculate score for not bringing the queen out too early
   * @returns {number} Queen development score
   */
  getQueenDevelopmentScore() {
    let score = 0;
    
    // Only apply in the opening phase
    if (this.moveCount < 10) {
      // Check if white queen has moved from starting position
      const whiteQueen = this.game.get('d1');
      if (!whiteQueen || whiteQueen.type !== 'q') {
        score -= 40; // Penalize early queen development
      }
      
      // Check if black queen has moved from starting position
      const blackQueen = this.game.get('d8');
      if (!blackQueen || blackQueen.type !== 'q') {
        score += 40; // Penalize early queen development
      }
    }
    
    return score;
  }
  
  /**
   * Calculate score for purposeful trading
   * This is a simplified approximation as it's hard to fully evaluate "purpose"
   * @returns {number} Purposeful trade score
   */
  getPurposefulTradeScore() {
    // This strategy is complex to implement fully
    // We'll focus on a simplified approach: avoid equal trades in the opening,
    // prefer trades when ahead in material
    
    let score = 0;
    const materialDifference = this.getMaterialScore();
    
    // In opening, avoid equal trades
    if (this.moveCount < 10 && Math.abs(materialDifference) < 50) {
      // Look at the last few moves to detect recent captures
      const recentMoves = this.history.slice(-4);
      
      let whiteCaptured = false;
      let blackCaptured = false;
      
      recentMoves.forEach(move => {
        if (move.captured) {
          if (move.color === 'w') whiteCaptured = true;
          if (move.color === 'b') blackCaptured = true;
        }
      });
      
      // Penalize trades in the opening
      if (whiteCaptured && blackCaptured) {
        score -= 20;
      }
    } 
    // When ahead, trading is good
    else if (materialDifference > 200) { // White is ahead
      score += 25; // Encourage trades
    } 
    else if (materialDifference < -200) { // Black is ahead
      score -= 25; // Encourage trades for black
    }
    
    return score;
  }

  /**
   * Get the best move for the AI
   * @returns {Object} The best move
   */
  getBestMove() {
    console.time('AI move calculation');
    this.positionsEvaluated = 0;
    
    // If it's not the AI's turn, return null
    if (this.game.turn() !== this.aiColor) {
      return null;
    }
    
    // Get all legal moves
    let moves = this.game.moves({ verbose: true });
    
    // Sort moves based on selected strategies for better pruning
    moves = this.sortMovesByPriority(moves);
    
    let bestMove = null;
    let bestValue = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;
    
    // Iterate through all possible moves
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      
      // Make the move
      this.game.move(move);
      
      // Get evaluation from minimax
      const value = this.minimax(this.searchDepth - 1, alpha, beta, false);
      
      // Undo the move
      this.game.undo();
      
      // Update best move if better evaluation found
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, bestValue);
    }
    
    console.timeEnd('AI move calculation');
    console.log(`Positions evaluated: ${this.positionsEvaluated}`);
    
    return bestMove;
  }
  
  /**
   * Sort moves based on strategy priorities
   * @param {Array} moves - Available moves
   * @returns {Array} Sorted moves
   */
  sortMovesByPriority(moves) {
    // Prioritize certain moves for better alpha-beta pruning
    return moves.sort((a, b) => {
      // Prioritize captures, especially capturing high-value pieces with lower-value pieces
      if (a.captured && !b.captured) {
        return -1;
      } else if (!a.captured && b.captured) {
        return 1;
      } else if (a.captured && b.captured) {
        // Compare value difference of capturing piece vs captured piece
        const aValueDiff = this.pieceValues[a.captured] - this.pieceValues[a.piece];
        const bValueDiff = this.pieceValues[b.captured] - this.pieceValues[b.piece];
        return bValueDiff - aValueDiff;
      }
      
      // Prioritize certain moves based on selected strategies
      let aScore = 0;
      let bScore = 0;
      
      this.strategyOrder.forEach((strategy, index) => {
        if (this.selectedStrategies.includes(strategy)) {
          const weight = 1 - (index * 0.1);
          aScore += this.getMovePriorityScore(a, strategy) * weight;
          bScore += this.getMovePriorityScore(b, strategy) * weight;
        }
      });
      
      return bScore - aScore;
    });
  }
  
  /**
   * Score a move based on a specific strategy
   * @param {Object} move - Move to evaluate
   * @param {string} strategy - Strategy to apply
   * @returns {number} Priority score
   */
  getMovePriorityScore(move, strategy) {
    switch(strategy) {
      case 'Control center':
        const centralSquares = ['d4', 'e4', 'd5', 'e5'];
        return centralSquares.includes(move.to) ? 10 : 0;
        
      case 'Develop knights before bishops':
        if (this.moveCount < 10 && move.piece === 'n') {
          return 7;
        }
        return 0;
        
      case 'Castle early':
        return (move.san === 'O-O' || move.san === 'O-O-O') ? 15 : 0;
        
      case 'Connect your rooks':
        if (move.piece === 'b' || move.piece === 'n' || move.piece === 'q') {
          const rank = move.color === 'w' ? '1' : '8';
          if (move.from.charAt(1) === rank && move.to.charAt(1) !== rank) {
            return 5; // Moving pieces out of the back rank to connect rooks
          }
        }
        return 0;
        
      case "Don't bring your queen out too early":
        if (this.moveCount < 10 && move.piece === 'q') {
          return -15; // Discourage early queen moves
        }
        return 0;
        
      case "Don't trade without a purpose":
        const materialDifference = this.getMaterialScore();
        if (move.captured) {
          if (this.moveCount < 10 && Math.abs(materialDifference) < 50) {
            return -5; // Discourage early equal trades
          } else if ((move.color === 'w' && materialDifference > 200) || 
                    (move.color === 'b' && materialDifference < -200)) {
            return 10; // Encourage trades when ahead
          }
        }
        return 0;
        
      case "Avoid moving the same piece twice":
        // Create a unique ID for this piece
        const pieceId = `${move.piece}_${move.from}`;
        if (this.moveCount < 10 && this.pieceMoveCount[pieceId]) {
          return -10; // Discourage moving the same piece again
        }
        return 0;
        
      default:
        return 0;
    }
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   * @param {number} depth - Current depth
   * @param {number} alpha - Alpha value for pruning
   * @param {number} beta - Beta value for pruning
   * @param {boolean} isMaximizingPlayer - Whether current player is maximizing
   * @returns {number} Evaluation score
   */
  minimax(depth, alpha, beta, isMaximizingPlayer) {
    this.positionsEvaluated++;
    
    // Check terminal states
    if (depth === 0 || this.game.isGameOver()) {
      return this.evaluatePosition();
    }
    
    // Get all legal moves
    const moves = this.game.moves({ verbose: true });
    
    if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      
      for (let i = 0; i < moves.length; i++) {
        // Make the move
        this.game.move(moves[i]);
        
        // Recursive evaluation
        const evaluation = this.minimax(depth - 1, alpha, beta, false);
        
        // Undo the move
        this.game.undo();
        
        // Update max evaluation
        maxEval = Math.max(maxEval, evaluation);
        
        // Update alpha
        alpha = Math.max(alpha, evaluation);
        
        // Alpha-beta pruning
        if (beta <= alpha) {
          break;
        }
      }
      
      return maxEval;
    } else {
      let minEval = Infinity;
      
      for (let i = 0; i < moves.length; i++) {
        // Make the move
        this.game.move(moves[i]);
        
        // Recursive evaluation
        const evaluation = this.minimax(depth - 1, alpha, beta, true);
        
        // Undo the move
        this.game.undo();
        
        // Update min evaluation
        minEval = Math.min(minEval, evaluation);
        
        // Update beta
        beta = Math.min(beta, evaluation);
        
        // Alpha-beta pruning
        if (beta <= alpha) {
          break;
        }
      }
      
      return minEval;
    }
  }
  
  /**
   * Have the AI make a move
   * @returns {Object|null} The move object if successful, null otherwise
   */
  makeAiMove() {
    // Check if it's the AI's turn
    if (this.game.turn() !== this.aiColor) {
      return null;
    }
    
    // Get the best move using minimax
    const bestMove = this.getBestMove();
    
    // Make the move
    if (bestMove) {
      return this.makeMove(bestMove);
    }
    
    return null;
  }
  
  /**
   * Get threat and shield counts for a specific square
   * @param {string} square - Chess square (e.g., 'e4')
   * @returns {Object} Threat and shield counts
   */
  getThreatShieldCount(square) {
    const threats = this.getThreats(square);
    const shields = this.getShields(square);
    
    return { threats, shields };
  }
  
  /**
   * Get threats for a square
   * @param {string} square - Chess square (e.g., 'e4')
   * @returns {number} Number of threats
   */
  getThreats(square) {
    const currentTurn = this.game.turn();
    const opponentColor = currentTurn === 'w' ? 'b' : 'w';
    
    return this.getControllingMoves(opponentColor, square).length;
  }
  
  /**
   * Get shields for a square
   * @param {string} square - Chess square (e.g., 'e4')
   * @returns {number} Number of shields
   */
  getShields(square) {
    const currentTurn = this.game.turn();
    
    return this.getControllingMoves(currentTurn, square).length;
  }
  
  /**
   * Calculate threat and shield counts for all squares
   * @returns {Object} Map of square to threat/shield counts
   */
  calculateAllThreatShields() {
    const threatShieldMap = {};
    
    // Loop through all squares
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        threatShieldMap[square] = this.getThreatShieldCount(square);
      }
    }
    
    return threatShieldMap;
  }
}

export default ChessEngine;
