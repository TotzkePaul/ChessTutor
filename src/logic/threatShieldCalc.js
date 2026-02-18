import ChessEngine from './chessEngine';

/**
 * Threat Shield Calculator
 * Calculates threat and shield counters for each square on the chessboard
 */
class ThreatShieldCalculator {
  constructor(chessEngine) {
    this.chessEngine = chessEngine || new ChessEngine();
    this.threatShieldMap = {}; // Cached map of squares to threat/shield counts
  }

  /**
   * Calculate threat and shield counters for all squares
   * @returns {Object} Map of squares to threat/shield counts
   */
  calculateAll() {
    this.threatShieldMap = this.chessEngine.calculateAllThreatShields();
    return this.threatShieldMap;
  }

  /**
   * Get threat and shield counts for a specific square
   * @param {string} square - Chess square (e.g., 'e4')
   * @returns {Object} Threat and shield counts
   */
  getForSquare(square) {
    return this.chessEngine.getThreatShieldCount(square);
  }

  /**
   * Update threat and shield counters after a move
   * This is more efficient than recalculating for all squares
   * @param {Object} move - The move that was made
   * @returns {Object} Updated map of squares to threat/shield counts
   */
  update(move) {
    // For now, just recalculate all - optimization can be added later
    return this.calculateAll();
  }

  /**
   * Get all squares that are under threat
   * @returns {Array} Array of squares under threat
   */
  getThreatenedSquares() {
    return Object.entries(this.threatShieldMap)
      .filter(([_, value]) => value.threats > 0)
      .map(([square, _]) => square);
  }

  /**
   * Get all squares that are protected
   * @returns {Array} Array of protected squares
   */
  getProtectedSquares() {
    return Object.entries(this.threatShieldMap)
      .filter(([_, value]) => value.shields > 0)
      .map(([square, _]) => square);
  }

  /**
   * Get squares with high threat (more threats than shields)
   * @returns {Array} Array of highly threatened squares
   */
  getHighThreatSquares() {
    return Object.entries(this.threatShieldMap)
      .filter(([_, value]) => value.threats > value.shields)
      .map(([square, _]) => square);
  }

  /**
   * Get squares with high protection (more shields than threats)
   * @returns {Array} Array of highly protected squares
   */
  getHighProtectionSquares() {
    return Object.entries(this.threatShieldMap)
      .filter(([_, value]) => value.shields > value.threats)
      .map(([square, _]) => square);
  }
}

export default ThreatShieldCalculator;
