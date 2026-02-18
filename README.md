# Chess AI Tutor

A React-based chess application featuring an AI opponent with adjustable strategies, threat and shield counters for squares, and detailed position analysis.

## Features

- Interactive chessboard with drag-and-drop functionality
- AI opponent with configurable difficulty (search depth)
- Threat and shield counters for each square shown on hover
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

- Node.js (v14 or higher)
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

1. Select your color (white or black) using the buttons in the AI Controls section
2. Adjust the AI search depth using the slider (higher values make the AI stronger but slower)
3. Select chess strategies using the checkboxes to influence the AI's decision-making
4. Drag and drop strategies to set their priority when the AI evaluates equal positions
5. Make your move by clicking on a piece and then clicking on a destination square
6. Hover over any square to see its threat count (opponent pieces that can move there) and shield count (your pieces that can move there)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
