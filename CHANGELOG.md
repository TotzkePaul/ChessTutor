# Changelog

## [Unreleased] - 2026-02-18

### Fixed
- **Critical**: Fixed infinite render loop in `StrategySelector` component caused by improper `useEffect` dependencies
  - Changed `setStrategyOrder` call to use functional update to avoid dependency on `strategyOrder`
  - Removed `strategyOrder` from dependency array to prevent infinite updates
  - All StrategySelector tests now pass without warnings

- **Critical**: Fixed incorrect threat/shield calculation for empty squares in chess engine
  - Modified `getControllingMoves()` to properly detect piece attacks vs. simple moves
  - Empty squares now correctly report only actual attacks (captures), not pawn advances
  - Example: After Nf3 ...Nf6, square e5 correctly shows 0 black threats (black knight can't reach e5)
  - All chess engine tests now pass

- **Critical**: Fixed react-beautiful-dnd invariant error in development
  - Disabled React.StrictMode due to incompatibility with react-beautiful-dnd library
  - react-beautiful-dnd doesn't support React 18's double-mounting behavior in StrictMode
  - App now runs without console errors in development
  - Note: Consider migrating to @hello-pangea/dnd (React 18 compatible fork) in future

### Improved
- Commented out console.time/console.log performance logging in production code
  - Can be re-enabled for debugging by uncommenting
  - Cleaner console output in production builds
  
- Enhanced code documentation and comments
- Added detailed comments explaining react-beautiful-dnd/React 18 compatibility issue

### Test Results
- ✅ All 7 tests passing
  - 4 tests in `chessEngine.test.js` 
  - 2 tests in `StrategySelector.test.js`
  - 1 test in `App.test.js`
- ✅ Production build successful
- ✅ Build size: 90.12 kB (gzipped)

### Technical Details

#### StrategySelector Fix
**Before**: `useEffect` had `strategyOrder` in dependency array, causing infinite loop
```javascript
useEffect(() => {
  setSelectedStrategies(Array.from(selections));
  const newOrder = strategyOrder.filter(...);
  setStrategyOrder([...newOrder, ...newSelections]);
}, [selections, setSelectedStrategies, setStrategyOrder, strategyOrder]); // ❌ strategyOrder causes loop
```

**After**: Using functional update form
```javascript
useEffect(() => {
  const selectionsArray = Array.from(selections);
  setSelectedStrategies(selectionsArray);
  setStrategyOrder(prevOrder => { // ✅ Uses previous value
    const newOrder = prevOrder.filter(...);
    return [...newOrder, ...newSelections];
  });
}, [selections, setSelectedStrategies, setStrategyOrder]); // ✅ No strategyOrder dependency
```

#### Chess Engine Fix
**Issue**: Pawn moves were counted as "attacks" on empty squares
- A pawn moving from e7 to e5 is NOT an attack on e5
- A pawn on e7 attacks d6 and f6 (diagonally), not e5

**Solution**: Place dummy opponent piece on empty squares to detect true attacks
```javascript
getControllingMoves(color, targetSquare) {
  const temp = this.createTempGameForColor(color);
  const pieceOnSquare = temp.get(targetSquare);
  
  // If square is empty, put a dummy opponent piece to detect attacks only
  if (!pieceOnSquare) {
    const opponentColor = color === 'w' ? 'b' : 'w';
    temp.put({ type: 'q', color: opponentColor }, targetSquare);
  }
  
  const moves = temp.moves({ verbose: true });
  return moves.filter(m => m.to === targetSquare)...
}
```

This ensures only true attacking moves (captures) are counted, not normal pawn advances.
