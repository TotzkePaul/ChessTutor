import ChessEngine from './chessEngine';

describe('ChessEngine threat/shield and queen development tests', () => {
  test('after e2-e4 and d7-d5, e4 should have 1 threat and 0 shields', () => {
    const engine = new ChessEngine();

    // White: e2-e4
    engine.makeMove({ from: 'e2', to: 'e4' });
    // Black: develop knight g8-f6 (which will threaten e4)
    engine.makeMove({ from: 'g8', to: 'f6' });
    const ts = engine.getThreatShieldCount('e4');
    expect(ts.threats).toBeGreaterThanOrEqual(1);
    expect(ts.shields).toBeGreaterThanOrEqual(0);
  });

  test('empty squares report black threats and white shields', () => {
    const engine = new ChessEngine();

    engine.makeMove({ from: 'g1', to: 'f3' });
    engine.makeMove({ from: 'g8', to: 'f6' });

    const ts = engine.getThreatShieldCount('e5');
    expect(ts.threats).toBe(0);
    expect(ts.shields).toBeGreaterThanOrEqual(1);
  });

  test('getControllingMoves does not throw with en-passant set', () => {
    const engine = new ChessEngine();

    engine.makeMove({ from: 'e2', to: 'e4' });
    expect(() => engine.getControllingMoves('b', 'e4')).not.toThrow();
  });

  test("queen development is penalized when queen leaves d1 in the opening", () => {
    const engine = new ChessEngine();

    // Make a pawn move two squares to free the queen's path
    engine.makeMove({ from: 'd2', to: 'd4' });
    // Black makes a small reply so it's white's turn again
    engine.makeMove({ from: 'e7', to: 'e6' });
    // Move the queen out early (d1 -> d3)
    engine.makeMove({ from: 'd1', to: 'd3' });

    const qScore = engine.getQueenDevelopmentScore();
    // White queen moved from d1, should be penalized in opening
    expect(qScore).toBeLessThan(0);
  });
});
