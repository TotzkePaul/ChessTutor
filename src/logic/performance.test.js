import ChessEngine from './chessEngine';

/**
 * Performance test suite for the chess engine
 */
describe('ChessEngine Performance Tests', () => {
  test('depth 1 should be fast (< 100ms)', () => {
    const engine = new ChessEngine();
    engine.setSearchDepth(1);
    engine.setPlayerColor('b'); // Set player as black, so AI (white) can move first
    
    const startTime = performance.now();
    const move = engine.getBestMove();
    const endTime = performance.now();
    const time = endTime - startTime;
    
    console.log(`Depth 1: ${time.toFixed(2)}ms, ${engine.positionsEvaluated} positions`);
    
    expect(move).toBeTruthy();
    expect(time).toBeLessThan(100);
  });
  
  test('depth 2 should be reasonable (< 500ms)', () => {
    const engine = new ChessEngine();
    engine.setSearchDepth(2);
    engine.setPlayerColor('b'); // Set player as black, so AI (white) can move first
    
    const startTime = performance.now();
    const move = engine.getBestMove();
    const endTime = performance.now();
    const time = endTime - startTime;
    
    console.log(`Depth 2: ${time.toFixed(2)}ms, ${engine.positionsEvaluated} positions`);
    
    expect(move).toBeTruthy();
    expect(time).toBeLessThan(500);
  });
  
  test('depth 3 should complete in reasonable time (< 5000ms)', () => {
    const engine = new ChessEngine();
    engine.setSearchDepth(3);
    engine.setPlayerColor('b'); // Set player as black, so AI (white) can move first
    
    const startTime = performance.now();
    const move = engine.getBestMove();
    const endTime = performance.now();
    const time = endTime - startTime;
    
    console.log(`Depth 3: ${time.toFixed(2)}ms, ${engine.positionsEvaluated} positions`);
    
    expect(move).toBeTruthy();
    expect(time).toBeLessThan(5000); // Should be much faster with optimizations
  });
  
  test('transposition table should cache positions', () => {
    const engine = new ChessEngine();
    engine.setSearchDepth(2);
    engine.setPlayerColor('b');
    
    // First search
    engine.getBestMove();
    const tableSize = engine.transpositionTable.size;
    
    console.log(`Transposition table size after depth 2 search: ${tableSize}`);
    
    expect(tableSize).toBeGreaterThan(0);
  });
  
  test('mid-game position with depth 3 should be efficient', () => {
    const engine = new ChessEngine();
    engine.setSearchDepth(3);
    engine.setPlayerColor('w'); // Player is white
    
    // Set up a mid-game position (player makes white moves, AI makes black moves)
    engine.makeMove({ from: 'e2', to: 'e4' });
    engine.makeMove({ from: 'e7', to: 'e5' });
    engine.makeMove({ from: 'g1', to: 'f3' });
    engine.makeMove({ from: 'b8', to: 'c6' });
    engine.makeMove({ from: 'f1', to: 'c4' });
    engine.makeMove({ from: 'g8', to: 'f6' });
    // Now it's white's turn, but AI is black, so we need to make white's move first
    engine.makeMove({ from: 'd2', to: 'd3' });
    
    // Now it's black's (AI's) turn
    const startTime = performance.now();
    const move = engine.getBestMove();
    const endTime = performance.now();
    const time = endTime - startTime;
    
    console.log(`Mid-game depth 3: ${time.toFixed(2)}ms, ${engine.positionsEvaluated} positions`);
    
    expect(move).toBeTruthy();
    // Mid-game positions have more legal moves, so they take longer
    // With our optimizations, it should still complete in a reasonable time
    expect(time).toBeLessThan(15000); // Allow up to 15 seconds for complex mid-game positions
  });
});

