export const STRATEGIES = [
  { name: 'Control center', hint: 'Use pawns and pieces to influence the four central squares.' },
  { name: 'Develop knights before bishops', hint: 'Bring knights toward the center early in the opening.' },
  { name: 'Castle early', hint: 'Move your king to safety and bring a rook into play.' },
  { name: 'Avoid moving the same piece twice', hint: 'Develop the rest of your army before moving one piece repeatedly.' },
  { name: 'Connect your rooks', hint: 'Clear the back rank so your rooks can support each other.' },
  { name: "Don't bring your queen out too early", hint: 'Avoid losing time when your opponent attacks an exposed queen.' },
  { name: "Don't trade without a purpose", hint: 'Consider whether a trade helps your position before exchanging pieces.' },
  { name: 'Protect hanging pieces', hint: 'Defend or move pieces that are attacked and have no defenders.' },
  { name: 'Develop all minor pieces', hint: 'Bring both knights and bishops off their starting squares.' },
  { name: 'Put rooks on open files', hint: 'Use files without pawns; files without your own pawns are useful too.' },
  { name: 'Keep the bishop pair', hint: 'Two bishops can work together to cover both light and dark squares.' },
  { name: 'Keep pawns connected', hint: 'Avoid isolated and doubled pawns when possible.' },
  { name: 'Advance passed pawns', hint: 'Push pawns with no enemy pawn ahead on their file or either neighboring file.' },
];

// All scores favor White; ChessEngine converts once to the AI's perspective.
export function additionalStrategyScore(game, strategy, values) {
  const pieces = game.board().flat().filter(Boolean);
  const sign = piece => piece.color === 'w' ? 1 : -1;
  const pawns = pieces.filter(piece => piece.type === 'p');
  switch (strategy) {
    case 'Protect hanging pieces':
      return pieces.reduce((score, piece) => {
        if (piece.type === 'k') return score;
        const enemy = piece.color === 'w' ? 'b' : 'w';
        const hanging = game.attackers(piece.square, enemy).length > 0 &&
          game.attackers(piece.square, piece.color).length === 0;
        return score - (hanging ? sign(piece) * values[piece.type] * 0.2 : 0);
      }, 0);
    case 'Develop all minor pieces':
      return pieces.reduce((score, piece) => {
        if (!['n', 'b'].includes(piece.type)) return score;
        const home = piece.color === 'w' ? '1' : '8';
        return score + (piece.square[1] !== home ? sign(piece) * 20 : 0);
      }, 0);
    case 'Put rooks on open files':
      return pieces.filter(piece => piece.type === 'r').reduce((score, rook) => {
        const onFile = pawns.filter(pawn => pawn.square[0] === rook.square[0]);
        const bonus = onFile.length === 0 ? 25 : onFile.every(pawn => pawn.color !== rook.color) ? 12 : 0;
        return score + sign(rook) * bonus;
      }, 0);
    case 'Keep the bishop pair':
      return ['w', 'b'].reduce((score, color) => {
        const bishops = pieces.filter(piece => piece.type === 'b' && piece.color === color);
        const squareColors = new Set(bishops.map(piece => (piece.square.charCodeAt(0) + Number(piece.square[1])) % 2));
        return score + (squareColors.size === 2 ? (color === 'w' ? 35 : -35) : 0);
      }, 0);
    case 'Keep pawns connected':
      return pawns.reduce((score, pawn) => {
        const friendly = pawns.filter(other => other.color === pawn.color);
        const file = pawn.square.charCodeAt(0);
        const isolated = !friendly.some(other => Math.abs(other.square.charCodeAt(0) - file) === 1);
        const doubled = friendly.filter(other => other.square[0] === pawn.square[0]).length > 1;
        return score - sign(pawn) * ((isolated ? 12 : 0) + (doubled ? 8 : 0));
      }, 0);
    case 'Advance passed pawns':
      return pawns.reduce((score, pawn) => {
        const rank = Number(pawn.square[1]);
        const blocked = pawns.some(other => other.color !== pawn.color &&
          Math.abs(other.square.charCodeAt(0) - pawn.square.charCodeAt(0)) <= 1 &&
          (pawn.color === 'w' ? Number(other.square[1]) > rank : Number(other.square[1]) < rank));
        const advance = pawn.color === 'w' ? rank - 2 : 7 - rank;
        return score + (blocked ? 0 : sign(pawn) * (10 + advance * advance * 4));
      }, 0);
    default:
      return 0;
  }
}
