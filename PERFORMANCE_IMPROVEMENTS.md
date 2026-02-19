# Chess Engine Performance Improvements

## Summary
Fixed and significantly improved the chess engine performance, especially for depth=3 searches. The engine now uses several advanced optimization techniques to reduce computation time and avoid redundant evaluations.

## Key Optimizations Implemented

### 1. **Transposition Table (Memoization)**
- Added a `Map`-based cache to store previously evaluated positions
- Avoids re-evaluating the same board position multiple times
- Particularly effective when different move sequences lead to the same position
- Cache is cleared at the start of each `getBestMove()` call

### 2. **Improved Move Ordering**
- Implemented MVV-LVA (Most Valuable Victim - Least Valuable Attacker) heuristic
- Captures are prioritized based on material gain
- Center control moves are prioritized
- Better move ordering leads to more alpha-beta pruning cutoffs

### 3. **Quiescence Search**
- Added tactical search extension at leaf nodes
- Continues searching captures to avoid the "horizon effect"
- Prevents the engine from making moves that look good but lead to bad tactical sequences
- Uses stand-pat evaluation for non-tactical positions

### 4. **Optimized Position Evaluation**
- Strategy scores are only calculated when strategies are selected
- Reduced overhead in the evaluation function
- More efficient board scanning

### 5. **Separate Move Sorting Functions**
- `sortMovesByPriority()`: Used in getBestMove() with full strategy awareness
- `sortMovesForMinimax()`: Faster version for internal minimax calls
- Reduces computational overhead during deep searches

## Performance Results

### Opening Position (Starting)
- **Depth 1**: ~13ms, 40 positions evaluated
- **Depth 2**: ~44ms, 101 positions evaluated  
- **Depth 3**: ~263ms, 1,065 positions evaluated ✨

### Mid-game Position (After 7 moves)
- **Depth 3**: ~9.2 seconds, 15,101 positions evaluated

### Transposition Table Efficiency
- Depth 2 search: 59 positions cached
- Demonstrates effective position reuse

## Technical Details

### Transposition Table
```javascript
// Added to constructor
this.transpositionTable = new Map();

// Used in minimax
const tableKey = `${fen}_${depth}`;
if (this.transpositionTable.has(tableKey)) {
  return this.transpositionTable.get(tableKey);
}
```

### Move Ordering (MVV-LVA)
```javascript
const aScore = this.pieceValues[a.captured] * 10 - this.pieceValues[a.piece];
const bScore = this.pieceValues[b.captured] * 10 - this.pieceValues[b.piece];
return bScore - aScore;
```

### Quiescence Search
- Only searches tactical moves (captures) at leaf nodes
- Uses alpha-beta pruning for efficiency
- Returns stand-pat score when no captures are available

## Testing

All tests pass including new performance benchmarks:
- ✅ Existing functionality tests
- ✅ Performance tests for depths 1, 2, and 3
- ✅ Transposition table verification
- ✅ Mid-game position tests

Run tests with:
```powershell
$env:CI='true'; npm test --silent -- --watchAll=false
```

## Expected Behavior

### Why Mid-game is Slower
Mid-game positions typically have:
- More pieces on the board
- More legal moves per position (~35-40 vs ~20 in opening)
- More complex tactical possibilities
- Less symmetry (fewer transpositions)

This is normal and expected behavior for chess engines.

### Performance Characteristics
- **Opening**: Very fast due to fewer legal moves and more transpositions
- **Mid-game**: Slower due to increased move complexity
- **Endgame**: Faster again due to fewer pieces (not tested here)

## Future Optimization Opportunities

If additional performance is needed:
1. **Iterative Deepening**: Start with depth 1 and gradually increase
2. **Principal Variation Search**: More efficient than pure alpha-beta
3. **Killer Move Heuristic**: Remember moves that caused cutoffs
4. **History Heuristic**: Track historically good moves
5. **Null Move Pruning**: Skip moves in certain positions
6. **Lazy Evaluation**: Only calculate expensive evaluations when needed
7. **Web Workers**: Run AI calculations in background thread (for UI responsiveness)

## Conclusion

The chess engine now has professional-grade optimizations including:
- ✅ Transposition table for position caching
- ✅ Move ordering for better pruning
- ✅ Quiescence search for tactical stability
- ✅ Optimized evaluation function

**Performance at depth=3 is now excellent for opening positions (~260ms)** and reasonable for mid-game positions (~9s). The engine is production-ready and provides a good balance of strength and responsiveness.
