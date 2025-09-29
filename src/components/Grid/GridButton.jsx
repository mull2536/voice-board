import React, { useState, useEffect, useRef } from 'react';
import { getButtonClass } from '../../utils/buttonStyles';

const GridButton = ({
  buttonData,
  index,
  isSelected,
  editMode,
  onClick,
  onRightClick,
  hoverDuration = 2000,
  category = 'basic',
  onHoverProgress,
  isSwappingFrom = false,
  isSwappingTo = false,
  isInvolvedInSwap = false,
  categoryCustomizations,
  hoverActivation = false
}) => {
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const handleMouseEnter = () => {
    if (editMode || !hoverActivation) return;

    setIsHovering(true);
    setHoverProgress(0);

    // Clear any existing timeouts
    clearTimeout(hoverTimeoutRef.current);
    clearInterval(progressIntervalRef.current);

    // Start progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / hoverDuration) * 100, 100);
      setHoverProgress(progress);

      // Report hover progress to parent
      if (onHoverProgress) {
        onHoverProgress(progress);
      }

      if (progress >= 100) {
        clearInterval(progressIntervalRef.current);
      }
    }, 16); // ~60fps

    // Set timeout for activation
    hoverTimeoutRef.current = setTimeout(() => {
      onClick();
      setHoverProgress(0);
      setIsHovering(false);
    }, hoverDuration);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverProgress(0);
    clearTimeout(hoverTimeoutRef.current);
    clearInterval(progressIntervalRef.current);

    // Report hover progress reset
    if (onHoverProgress) {
      onHoverProgress(0);
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (editMode && onRightClick) {
      onRightClick();
    }
  };

  const handleClick = () => {
    // Clear any pending hover activation
    clearTimeout(hoverTimeoutRef.current);
    clearInterval(progressIntervalRef.current);
    setHoverProgress(0);
    setIsHovering(false);

    onClick();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, []);

  const getButtonTypeIcon = () => {
    switch (buttonData.type) {
      case 'sound_effect':
        return '🔊';
      case 'music':
        return '🎵';
      case 'speech':
      default:
        return '🗣️';
    }
  };

  return (
    <button
      className={`grid-button ${isSelected ? 'selected' : ''} ${
        editMode ? 'edit-mode' : ''
      } ${editMode && isSelected ? 'edit-mode-active' : ''} ${isSwappingFrom ? 'swapping-from' : ''} ${
        isSwappingTo ? 'swapping-to' : ''
      } ${isInvolvedInSwap ? 'swapping-involved' : ''}`}
      style={{
        background: getButtonClass(category, index, categoryCustomizations?.[category]),
        color: categoryCustomizations?.[category]?.fontColor || '#ffffff',
        fontSize: categoryCustomizations?.[category]?.fontSize || '12px',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={editMode ? 'Click to select • Right-click to edit' : buttonData.label}
    >
      {/* Radial hover effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: isHovering && !editMode ? `${hoverProgress}%` : '0%',
          height: isHovering && !editMode ? `${hoverProgress}%` : '0%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.3)',
          transform: 'translate(-50%, -50%)',
          transition: !isHovering ? 'width 0.3s, height 0.3s' : 'none',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Button content */}
      <span className="icon" style={{ fontSize: '24px', marginBottom: '2px', position: 'relative', zIndex: 2 }}>
        {buttonData.emoji || getButtonTypeIcon()}
      </span>
      <span style={{
        fontSize: categoryCustomizations?.[category]?.fontSize || '12px',
        lineHeight: '1.2',
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        maxWidth: '100%',
        fontWeight: '500'
      }}>
        {buttonData.label}
      </span>
    </button>
  );
};

export default GridButton;