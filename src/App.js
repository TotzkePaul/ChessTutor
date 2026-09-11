import React from 'react';
import OfflineStatus from './components/OfflineStatus';
import './App.css';
import './styles/Board.css';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';
import AiControls from './components/AiControls';
import StrategySelector from './components/StrategySelector';
import GameProvider from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <div className="app">
        <header className="app-header">
          <h1>Chess AI Tutor</h1>
          <OfflineStatus />
        </header>
        
        <main className="app-content">
          <div className="game-area">
            <div className="board-section">
              <Board />
            </div>
            
            <div className="game-info">
              <div className="ai-controls-section">
                <AiControls />
              </div>
              <div className="move-history-section">
                <MoveHistory />
              </div>
            </div>
          </div>
          
          <div className="strategy-section">
            <StrategySelector />
          </div>
        </main>
        
        <footer className="app-footer">
          <p>
            Learn the board. See the threats. Find your next move.
          </p>
        </footer>
      </div>
    </GameProvider>
  );
}

export default App;
