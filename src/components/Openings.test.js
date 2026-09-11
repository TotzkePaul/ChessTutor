import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Chess } from 'chess.js';
import { OPENINGS } from '../logic/openings';
import { GameProvider } from '../context/GameContext';
import { useChessGame } from '../hooks/useChessGame';
import AiControls from './AiControls';

test.each(OPENINGS)('$name contains legal opening moves', opening => {
  const game = new Chess();
  for (const move of opening.moves) expect(game.move(move)).toBeTruthy();
  expect(game.history()).toEqual(opening.moves);
  expect(game.isGameOver()).toBe(false);
});

function Position() {
  const { gameState, currentTurn, isAiThinking } = useChessGame();
  return <output>{gameState.moveCount}:{currentTurn}:{String(isAiThinking)}</output>;
}

test('opening selection applies on New game, resets history, and schedules the correct side', () => {
  jest.useFakeTimers();
  const view = render(<GameProvider><AiControls /><Position /></GameProvider>);
  fireEvent.change(screen.getByLabelText('Opening'), { target: { value: 'italian' } });
  expect(screen.getByText('0:w:false')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'New game' }));
  expect(screen.getByText('6:w:false')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Opening'), { target: { value: 'standard' } });
  fireEvent.click(screen.getByRole('button', { name: 'New game' }));
  expect(screen.getByText('0:w:false')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Opening'), { target: { value: 'queens-gambit' } });
  fireEvent.click(screen.getByRole('button', { name: 'New game' }));
  expect(screen.getByText('3:b:true')).toBeInTheDocument();
  view.unmount();
  jest.useRealTimers();
});
