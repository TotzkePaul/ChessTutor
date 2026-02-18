import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/Board.css';

/**
 * Component for selecting and ordering AI strategies
 * Uses react-beautiful-dnd for drag and drop functionality
 * 
 * Note: react-beautiful-dnd has issues with React 18 StrictMode due to double-mounting.
 * If you see "Cannot find droppable entry" errors in development, they're expected
 * and won't occur in production builds.
 */
const StrategySelector = () => {
  const { 
    selectedStrategies, 
    setSelectedStrategies, 
    strategyOrder, 
    setStrategyOrder,
    isAiThinking
  } = useChessGame();
  // Define available strategies
  const availableStrategies = [
    'Control center',
    'Develop knights before bishops',
    'Castle early',
    'Avoid moving the same piece twice',
    'Connect your rooks',
    "Don't bring your queen out too early",
    "Don't trade without a purpose"
  ];
  
  // Initialize local state to track selections
  const [selections, setSelections] = useState(new Set(selectedStrategies));
  
  // Update ordered strategies when selections change
  useEffect(() => {
    // Update the parent component with the selected strategies
    const selectionsArray = Array.from(selections);
    setSelectedStrategies(selectionsArray);
    
    // Update strategy order to include only selected items and maintain order
    setStrategyOrder(prevOrder => {
      const newOrder = prevOrder.filter(strategy => selections.has(strategy));
      const newSelections = selectionsArray.filter(strategy => !newOrder.includes(strategy));
      return [...newOrder, ...newSelections];
    });
  }, [selections, setSelectedStrategies, setStrategyOrder]);
  
  // Handle strategy checkbox toggle
  const handleStrategyToggle = (strategy) => {
    if (isDragging) return;

    setSelections(prev => {
      const newSelections = new Set(prev);
      if (newSelections.has(strategy)) {
        newSelections.delete(strategy);
      } else {
        newSelections.add(strategy);
      }
      return newSelections;
    });
  };
  
  // Track whether a drag is in progress to avoid changing the list while dragging
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag end event from react-beautiful-dnd
  const handleDragEnd = (result) => {
    // Always clear dragging state
    setIsDragging(false);

    if (!result || !result.destination) return;

    const selectedItems = strategyOrder.filter(strategy => selections.has(strategy));
    const unselectedItems = strategyOrder.filter(strategy => !selections.has(strategy));

    const items = Array.from(selectedItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setStrategyOrder([...items, ...unselectedItems]);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  return (
    <div className="strategy-selector">
      <h3>Basic Strategy Hints</h3>
      
      {/* Strategy checkboxes */}
      <div className="strategy-checkboxes">
        {availableStrategies.map((strategy) => (
          <div key={strategy} className="strategy-checkbox">
            <label>
              <input
                type="checkbox"
                checked={selections.has(strategy)}
                onChange={() => handleStrategyToggle(strategy)}
                disabled={isAiThinking || isDragging}
              />
              {strategy}
            </label>
          </div>
        ))}
      </div>
      
      {/* Strategy ordering - keep DragDropContext/Droppable mounted to avoid
          react-beautiful-dnd invariant errors when the list temporarily
          becomes empty during updates (e.g., toggling checkboxes). */}
      <div className="strategy-ordering">
        <h4>Strategy Priority (Drag to reorder)</h4>
        <p className="hint-text">Higher items have priority when evaluating equal positions</p>

  <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <Droppable droppableId="strategy-list">
            {(provided) => {
              const items = strategyOrder.filter(s => selections.has(s));
              return (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="strategy-list"
                >
                  {items.length === 0 ? (
                    <li className="strategy-item empty">No strategies selected</li>
                  ) : (
                    items.map((strategy, index) => {
                      // Sanitize draggable id so it doesn't contain problematic characters
                      const safeId = strategy.replace(/[^a-zA-Z0-9_-]/g, '_');
                      return (
                        <Draggable
                          key={strategy}
                          draggableId={`strategy-${safeId}`}
                          index={index}
                          isDragDisabled={isAiThinking}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="strategy-item"
                            >
                              <span className="strategy-priority">{index + 1}</span>
                              <span className="strategy-name">{strategy}</span>
                            </li>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </ul>
              );
            }}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default StrategySelector;
