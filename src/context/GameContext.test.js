import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GameProvider } from './GameContext';
import { useChessGame } from '../hooks/useChessGame';
import { createChessWorker } from '../workers/workerFactory';

function Controls() {
  const game = useChessGame();
  return <>
    <button onClick={() => game.makeMove({ from: 'e2', to: 'e4' })}>Move</button>
    <button onClick={game.resetGame}>Reset</button>
    <button onClick={() => { game.setPlayerColor('b'); game.resetGame(); }}>Black</button>
    <output>{game.gameState.moveCount}:{game.currentTurn}:{String(game.isAiThinking)}</output>
  </>;
}

test('reset ignores stale worker replies and black starts exactly one search', () => {
  jest.useFakeTimers();
  const workers = [];
  createChessWorker.mockImplementation(() => {
    const worker = { terminate: jest.fn(), postMessage: jest.fn() };
    workers.push(worker);
    return worker;
  });
  const view = render(<GameProvider><Controls /></GameProvider>);
  fireEvent.click(screen.getByText('Move'));
  act(() => jest.advanceTimersByTime(25));
  const old = workers[0];
  const id = old.postMessage.mock.calls[0][0].id;
  fireEvent.click(screen.getByText('Reset'));
  act(() => old.onmessage({ data: { id, type: 'BEST_MOVE', move: { from: 'e7', to: 'e5' } } }));
  expect(screen.getByText('0:w:false')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Black'));
  act(() => jest.advanceTimersByTime(25));
  const latest = workers[workers.length - 1];
  expect(latest.postMessage).toHaveBeenCalledTimes(1);
  const request = latest.postMessage.mock.calls[0][0];
  expect(request.payload.playerColor).toBe('b');
  act(() => latest.onmessage({ data: { id: request.id, type: 'BEST_MOVE', move: { from: 'e2', to: 'e4' } } }));
  expect(screen.getByText('1:b:false')).toBeInTheDocument();
  view.unmount();
  createChessWorker.mockReset();
  jest.useRealTimers();
});
