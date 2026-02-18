import React, { useState } from 'react';
import '../styles/Board.css'; // Will contain tooltip styles

/**
 * Generic Tooltip component to display additional information on hover
 * Used primarily to show threat/shield counters for chess squares
 */
const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Show tooltip and set its position
  const showTooltip = (e) => {
    setIsVisible(true);
    // Position tooltip near the mouse, but slightly offset
    setPosition({
      x: e.clientX + 10,
      y: e.clientY + 10
    });
  };

  // Hide tooltip
  const hideTooltip = () => {
    setIsVisible(false);
  };

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={showTooltip}
      onMouseMove={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div 
          className="tooltip"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
