// Short opening positions for offline practice. Replay moves to preserve history.
export const OPENINGS = [
  { id: 'standard', name: 'Standard game', moves: [] },
  { id: 'italian', name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'] },
  { id: 'ruy-lopez', name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'] },
  { id: 'scotch', name: 'Scotch Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4'] },
  { id: 'sicilian', name: 'Sicilian Defense', moves: ['e4', 'c5'] },
  { id: 'french', name: 'French Defense', moves: ['e4', 'e6', 'd4', 'd5'] },
  { id: 'caro-kann', name: 'Caro-Kann Defense', moves: ['e4', 'c6', 'd4', 'd5'] },
  { id: 'queens-gambit', name: "Queen's Gambit", moves: ['d4', 'd5', 'c4'] },
  { id: 'kings-indian', name: "King's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'] },
  { id: 'english', name: 'English Opening', moves: ['c4', 'e5'] },
];

export function openingLine(opening) {
  return opening.moves.map((move, index) => `${index % 2 === 0 ? `${index / 2 + 1}. ` : ''}${move}`).join(' ');
}
