import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/Board.css';

/**
 * Component for selecting and ordering AI strategies
 * Uses react-beautiful-dnd for drag and drop functionality
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
    setSelectedStrategies(Array.from(selections));
    
    // Update strategy order to include only selected items and maintain order
    const newOrder = strategyOrder.filter(strategy => selections.has(strategy));
    const newSelections = Array.from(selections).filter(strategy => !newOrder.includes(strategy));
    
    setStrategyOrder([...newOrder, ...newSelections]);
  }, [selections, setSelectedStrategies, setStrategyOrder]);
  
  // Handle strategy checkbox toggle
  const handleStrategyToggle = (strategy) => {
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
  
  // Handle drag end event from react-beautiful-dnd
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(strategyOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setStrategyOrder(items);
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
                disabled={isAiThinking}
              />
              {strategy}
            </label>
          </div>
        ))}
      </div>
      
      {/* Strategy ordering (only shown if at least one strategy selected) */}
      {strategyOrder.length > 0 && (
        <div className="strategy-ordering">
          <h4>Strategy Priority (Drag to reorder)</h4>
          <p className="hint-text">Higher items have priority when evaluating equal positions</p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="strategy-list">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="strategy-list"
                >
                  {strategyOrder.filter(s => selections.has(s)).map((strategy, index) => (
                    <Draggable 
                      key={strategy} 
                      draggableId={strategy} 
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
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
};

export default StrategySelector;
