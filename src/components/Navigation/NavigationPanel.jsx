import React from 'react';
import {
  Edit3,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  Trash2
} from 'lucide-react';
import ColorCustomization from './ColorCustomization';

const NavigationPanel = ({
  editMode,
  selectedButton,
  onToggleEdit,
  onEditButton,
  onClearButton,
  onMoveButton,
  activeCategory,
  onCategoryColorChange,
  onFontColorChange,
  onFontSizeChange,
  currentCategoryColors,
  currentFontColor,
  currentFontSize,
  hoverActivation = false
}) => {
  return (
    <div className={`navigation-panel${editMode ? ' edit-mode' : ''}`}>
      {/* Edit Mode Toggle */}
      <button
        className={`nav-button ${editMode ? 'active edit-mode' : ''}`}
        onClick={onToggleEdit}
        onMouseEnter={hoverActivation ? onToggleEdit : undefined}
        title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      >
        {editMode ? <X size={20} /> : <Edit3 size={20} />}
        <span>{editMode ? 'Exit' : 'Edit'}</span>
      </button>

      {/* Edit Selected Button */}
      {editMode && (
        <button
          className={`nav-button edit-mode ${selectedButton !== null ? '' : 'disabled'}`}
          onClick={onEditButton}
          disabled={selectedButton === null}
          title="Edit Selected Button"
        >
          <Save size={20} />
          <span>Configure</span>
        </button>
      )}

      {/* Clear Selected Button */}
      {editMode && (
        <button
          className={`nav-button edit-mode ${selectedButton !== null ? '' : 'disabled'}`}
          onClick={onClearButton}
          disabled={selectedButton === null}
          title="Clear Selected Button Content"
        >
          <Trash2 size={20} />
          <span>Clear</span>
        </button>
      )}

      {/* Movement Controls */}
      {editMode && selectedButton !== null && (
        <div className="movement-controls edit-mode">
          <div className="movement-label">Move Button:</div>
          <div className="movement-grid">
            <button className="move-btn edit-mode" onClick={() => onMoveButton('up')} title="Move Up">
              <ArrowUp size={16} />
            </button>
            <div className="movement-row">
              <button className="move-btn edit-mode" onClick={() => onMoveButton('left')} title="Move Left">
                <ArrowLeft size={16} />
              </button>
              <button className="move-btn edit-mode" onClick={() => onMoveButton('right')} title="Move Right">
                <ArrowRight size={16} />
              </button>
            </div>
            <button className="move-btn edit-mode" onClick={() => onMoveButton('down')} title="Move Down">
              <ArrowDown size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Color Customization */}
      {editMode && (
        <ColorCustomization
          activeCategory={activeCategory}
          onCategoryColorChange={onCategoryColorChange}
          onFontColorChange={onFontColorChange}
          onFontSizeChange={onFontSizeChange}
          currentCategoryColors={currentCategoryColors}
          currentFontColor={currentFontColor}
          currentFontSize={currentFontSize}
        />
      )}
    </div>
  );
};

export default NavigationPanel;