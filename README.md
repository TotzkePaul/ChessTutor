# Chess AI Tutor

A React-based chess application featuring an AI opponent with adjustable strategies, threat and shield counters for squares, and detailed position analysis.

## Offline play

The production app is built in `build/`. On Windows, double-click **Start Chess Tutor.cmd** to launch it, or run `npm run offline` and open [Chess Tutor](http://127.0.0.1:3000). Node.js must be installed; playing requires no internet connection, account, API key, or external chess engine.

To rebuild after changing the source, run `npm run build`. A fresh checkout needs `npm ci` once while online before building. The offline launcher itself uses only Node's built-in libraries.

Wait for **Ready for offline play** on the first visit. The browser then caches the app and AI worker, so it can reload at the same address even with the local server stopped. Clearing browser storage removes this cache; launch the local server again to restore it. Games currently restart on page reload. After rebuilding, close all app tabs and reopen to activate an updated cached version.

## Square counters and AI speed

- Every square displays a **sword** (enemy attacks) and **shield** (friendly defenders), including zeros. Occupied squares use the occupying piece's color; empty squares use your chosen color.
- Counts represent geometric attacks, including pinned pieces. Pawn forward moves and castling are not attacks; sliding pieces stop at the first blocker. These counts describe control, not a guarantee that a capture is legal or safe.
- AI search runs in a local background worker and uses iterative deepening. Levels 1–5 have approximate search budgets of 150, 350, 800, 1,400, and 2,000 ms. The selected depth is a maximum: when time expires, the AI uses the last fully searched depth. Device speed and browser scheduling can add overhead.
- Click a piece and its destination to move. Pawn promotion offers Queen, Rook, Bishop, or Knight. Choosing Black rotates the board and lets the AI open as White.

## Features

- Interactive chessboard with click-to-move functionality
- AI opponent with configurable difficulty (search depth)
- Threat and shield counters for each square. A shield is how many defenders there are.
- Selectable AI strategies via checkboxes
- Drag-and-drop interface to reorder AI strategies
- Move history display with algebraic notation
- Detailed game state information

## Chess AI Strategies

The AI considers the following basic chess strategies:

1. **Control center** - Prioritizes controlling the central squares (d4, e4, d5, e5)
2. **Develop knights before bishops** - Follows the chess principle of developing knights before bishops
3. **Castle early** - Prioritizes castling for king safety
4. **Avoid moving the same piece twice** - Avoids moving the same piece multiple times in the opening
5. **Connect your rooks** - Works to connect rooks by moving pieces out of the back rank
6. **Don't bring your queen out too early** - Avoids early queen development
7. **Don't trade without a purpose** - Avoids unnecessary piece trades

## Technical Details

This application uses:
- React for the UI
- chess.js for chess rules and move validation
- React Context API for state management
- react-beautiful-dnd for drag-and-drop strategy ordering
- CSS Grid for the chessboard layout

## Getting Started

### Prerequisites

- Node.js (tested with v20)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/TotzkePaul/chess-ai-react-app.git
cd chess-ai-tutor
```

2. Install dependencies:
```
npm install
```
or
```
yarn install
```

3. Start the development server:
```
npm start
```
or
```
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Select your color (white or black) using the buttons in the Play panel at the top right
2. Adjust the AI search depth using the slider (higher values make the AI stronger but slower)
3. Select chess strategies using the checkboxes to influence the AI's decision-making
4. Drag and drop strategies to set their priority when the AI evaluates equal positions
5. Make your move by clicking on a piece and then clicking on a destination square
6. Read the sword/shield badges on any square, or hover for the full labels. See the counter definitions above.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
