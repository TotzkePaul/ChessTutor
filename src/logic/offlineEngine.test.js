import ChessEngine from './chessEngine';

test('friendly occupied squares have defenders and blocked rays stop', () => {
  const engine = new ChessEngine();
  expect(engine.getThreatShieldCount('d2')).toEqual({ threats: 0, shields: 4 });
  expect(engine.getControllingMoves('w', 'd4')).toEqual([]);
  expect(Object.keys(engine.calculateAllThreatShields())).toHaveLength(64);
});

test('pawn attacks are diagonals and empty squares follow player color', () => {
  const engine = new ChessEngine();
  engine.game.load('4k3/8/8/8/4P3/8/8/4K3 w - - 0 1');
  expect(engine.getThreatShieldCount('e5')).toEqual({ threats: 0, shields: 0 });
  expect(engine.getThreatShieldCount('d5')).toEqual({ threats: 0, shields: 1 });
  engine.setPlayerColor('b');
  expect(engine.getThreatShieldCount('d5')).toEqual({ threats: 1, shields: 0 });
});

test.each(['w', 'b'])('AI captures a free queen as %s without changing the position', color => {
  const engine = new ChessEngine();
  engine.game.load(color === 'w' ? '4k3/8/8/8/8/8/q7/R3K3 w - - 0 1' : 'r3k3/Q7/8/8/8/8/8/4K3 b - - 0 1');
  engine.setPlayerColor(color === 'w' ? 'b' : 'w');
  engine.setSearchDepth(2);
  const fen = engine.getFen();
  expect(engine.getBestMove({ timeLimitMs: 2000 }).captured).toBe('q');
  expect(engine.getFen()).toBe(fen);
  expect(engine.game.history()).toEqual([]);
});

test('timeout returns a legal move and fully unwinds search', () => {
  const engine = new ChessEngine();
  engine.setPlayerColor('b');
  engine.setSearchDepth(5);
  const fen = engine.getFen();
  const move = engine.getBestMove({ timeLimitMs: 25 });
  expect(engine.getLegalMoves().map(m => m.san)).toContain(move.san);
  expect(engine.getFen()).toBe(fen);
  expect(engine.game.history()).toEqual([]);
  expect(engine.searchTimeMs).toBeLessThan(500);
});

test('default strategies complete within the search budget', () => {
  const engine = new ChessEngine();
  engine.makeMove('e4');
  engine.setSelectedStrategies(['Control center', 'Castle early', 'Develop knights before bishops']);
  engine.setStrategyOrder(engine.selectedStrategies);
  const move = engine.getBestMove();
  console.log(`Default strategies: ${engine.searchTimeMs.toFixed(0)}ms, depth ${engine.completedDepth}`);
  expect(move).toBeTruthy();
  expect(engine.searchTimeMs).toBeLessThan(1200);
});
