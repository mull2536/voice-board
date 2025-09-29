import React, { useState, useRef, useEffect } from 'react';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange, onCategoryNameChange, categoryCustomizations, hoverActivation = false }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef(null);

  // Get custom styling for a category
  const getCategoryStyle = (category) => {
    const customizations = categoryCustomizations?.[category.id] || {};
    const backgroundColor = customizations.color || category.color;
    const color = customizations.fontColor || '#ffffff';
    const fontSize = customizations.fontSize || '12px';

    return {
      background: backgroundColor,
      color: color,
      fontSize: fontSize,
      position: 'relative',
      cursor: editingCategory === category.id ? 'text' : 'pointer'
    };
  };

  useEffect(() => {
    if (editingCategory && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCategory]);

  const handleDoubleClick = (category, e) => {
    e.stopPropagation();
    setEditingCategory(category.id);
    setEditingName(category.name);
  };

  const handleSingleClick = (category, e) => {
    // If it's the active category, switch to edit mode
    if (activeCategory === category.id) {
      e.stopPropagation();
      setEditingCategory(category.id);
      setEditingName(category.name);
    } else {
      // Otherwise, just change category
      onCategoryChange(category.id);
    }
  };

  const handleMouseEnter = (category) => {
    if (hoverActivation && activeCategory !== category.id) {
      onCategoryChange(category.id);
    }
  };

  const handleInputChange = (e) => {
    setEditingName(e.target.value);
  };

  const handleSave = (categoryId) => {
    const trimmedName = editingName.trim();
    if (trimmedName && trimmedName !== categories.find(c => c.id === categoryId)?.name) {
      onCategoryNameChange?.(categoryId, trimmedName);
    }
    setEditingCategory(null);
    setEditingName('');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditingName('');
  };

  const handleKeyDown = (e, categoryId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(categoryId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleInputBlur = (categoryId) => {
    handleSave(categoryId);
  };

  return (
    <div className="category-tabs">
      {categories.map(category => (
        <div
          key={category.id}
          className={`category-tab cat-${category.id} ${
            activeCategory === category.id ? 'active' : ''
          }`}
          onClick={(e) => handleSingleClick(category, e)}
          onDoubleClick={(e) => handleDoubleClick(category, e)}
          onMouseEnter={() => handleMouseEnter(category)}
          style={getCategoryStyle(category)}
        >
          {editingCategory === category.id ? (
            <input
              ref={inputRef}
              type="text"
              value={editingName}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur(category.id)}
              onKeyDown={(e) => handleKeyDown(e, category.id)}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                color: '#333',
                width: '100%',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
              maxLength="20"
            />
          ) : (
            category.name
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryTabs;