import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '../context/GameContext';
import StrategySelector from './StrategySelector';

// Regression test for react-beautiful-dnd droppable invariant when toggling strategies
test("toggling 'Don't bring your queen out too early' doesn't crash DragDrop", () => {
  render(
    <GameProvider>
      <StrategySelector />
    </GameProvider>
  );

  const label = "Don't bring your queen out too early";
  const checkbox = screen.getByLabelText(label);
  expect(checkbox).toBeInTheDocument();

  // Toggle the checkbox on and off
  fireEvent.click(checkbox);
  fireEvent.click(checkbox);

  // If no exception was thrown by react-beautiful-dnd, the test passes
  expect(true).toBe(true);
});

test('droppable list stays mounted when all strategies are deselected', () => {
  render(
    <GameProvider>
      <StrategySelector />
    </GameProvider>
  );

  const checkboxes = screen.getAllByRole('checkbox');
  checkboxes.forEach(box => {
    if (box.checked) {
      fireEvent.click(box);
    }
  });

  expect(screen.getByText('No strategies selected')).toBeInTheDocument();
  expect(document.querySelector('.strategy-list')).toBeInTheDocument();
});
