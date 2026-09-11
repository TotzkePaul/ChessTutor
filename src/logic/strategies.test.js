import ChessEngine from './chessEngine';
import { STRATEGIES } from './strategies';

const score = (fen, name) => {
  const engine = new ChessEngine();
  engine.game.load(fen);
  return engine.getStrategyScore(name);
};

test('hanging pieces are penalized and a defender removes the penalty', () => {
  const exposed = score('4k3/8/8/8/3q4/8/3R4/7K w - - 0 1', 'Protect hanging pieces');
  const defended = score('4k3/8/8/8/3q4/8/3R4/3R3K w - - 0 1', 'Protect hanging pieces');
  expect(defended).toBeGreaterThan(exposed);
});

test.each([
  ['Develop all minor pieces', '4k3/8/8/8/8/2N5/8/4K3 w - - 0 1'],
  ['Put rooks on open files', '4k3/8/8/8/8/8/8/R3K3 w - - 0 1'],
  ['Keep the bishop pair', '4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1'],
  ['Advance passed pawns', '4k3/8/3P4/8/8/8/8/4K3 w - - 0 1'],
])('%s rewards White for the relevant positional feature', (name, fen) => {
  expect(score(fen, name)).toBeGreaterThan(0);
});

test('connected pawns score better than isolated pawns', () => {
  expect(score('4k3/8/8/8/8/8/2PP4/4K3 w - - 0 1', 'Keep pawns connected'))
    .toBeGreaterThan(score('4k3/8/8/8/8/8/P2P4/4K3 w - - 0 1', 'Keep pawns connected'));
});

test('low-priority strategies retain positive influence with all hints selected', () => {
  const engine = new ChessEngine();
  engine.game.load('4k3/8/8/8/8/8/P2P4/4K3 w - - 0 1');
  engine.setPlayerColor('b');
  engine.setStrategyOrder(STRATEGIES.map(item => item.name));
  const baseline = engine.evaluatePosition();
  engine.setSelectedStrategies(['Keep pawns connected']);
  expect(engine.evaluatePosition()).toBeLessThan(baseline);
});
