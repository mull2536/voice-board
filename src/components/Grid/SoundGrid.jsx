import React from 'react';
import GridButton from './GridButton';

const SoundGrid = ({
  gridData,
  gridSize,
  selectedButton,
  editMode,
  onButtonClick,
  onButtonRightClick,
  hoverDuration,
  category,
  onHoverProgress,
  swappingButtons,
  categoryCustomizations,
  hoverActivation = false
}) => {
  // Ensure we have the right number of buttons for the grid
  const totalButtons = gridSize * gridSize;
  const buttons = Array.from({ length: totalButtons }, (_, index) =>
    gridData[index] || {
      id: index + 1,
      label: `Button ${index + 1}`,
      type: 'speech',
      content: '[calmly] Empty button',
      audioTag: 'calmly',
      emoji: '🔘'
    }
  );

  return (
    <div
      className={`sound-grid${editMode ? ' edit-mode' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {buttons.map((buttonData, index) => {
        const isSwappingFrom = swappingButtons?.from === index && swappingButtons?.isSwapping;
        const isSwappingTo = swappingButtons?.to === index && swappingButtons?.isSwapping;
        const isInvolvedInSwap = isSwappingFrom || isSwappingTo;

        return (
          <GridButton
            key={`${buttonData.id}-${index}`}
            buttonData={buttonData}
            index={index}
            isSelected={selectedButton === index}
            editMode={editMode}
            onClick={() => onButtonClick(index)}
            onRightClick={() => onButtonRightClick && onButtonRightClick(index)}
            hoverDuration={hoverDuration}
            category={category}
            onHoverProgress={onHoverProgress}
            isSwappingFrom={isSwappingFrom}
            isSwappingTo={isSwappingTo}
            isInvolvedInSwap={isInvolvedInSwap}
            categoryCustomizations={categoryCustomizations}
            hoverActivation={hoverActivation}
          />
        );
      })}
    </div>
  );
};

export default SoundGrid;