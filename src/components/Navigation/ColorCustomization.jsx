import React, { useState } from 'react';

const ColorCustomization = ({
  activeCategory,
  onCategoryColorChange,
  onFontColorChange,
  onFontSizeChange,
  currentCategoryColors,
  currentFontColor,
  currentFontSize
}) => {
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#667eea');

  // Load saved custom colors from localStorage
  const [savedCustomColors, setSavedCustomColors] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceBoard_customColors');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Base colors for quick selection - 4 rows x 2 columns (8 colors)
  const baseColors = [
    { name: 'Purple', color: '#9c27b0' },
    { name: 'Pink', color: '#f093fb' },
    { name: 'Red', color: '#ff6b6b' },
    { name: 'Orange', color: '#ff9500' },
    { name: 'Yellow', color: '#ffd93d' },
    { name: 'Green', color: '#43e97b' },
    { name: 'Blue', color: '#4facfe' },
    { name: 'Cyan', color: '#17a2b8' }
  ];

  // Font colors
  const fontColors = [
    { name: 'White', color: '#ffffff' },
    { name: 'Black', color: '#000000' },
    { name: 'Gray', color: '#666666' },
    { name: 'Light Gray', color: '#cccccc' }
  ];

  // Font sizes
  const fontSizes = [
    { name: 'Small', size: '12px' },
    { name: 'Medium', size: '16px' },
    { name: 'Large', size: '20px' }
  ];

  const generateShades = (baseColor) => {
    // Create gradient shades for the selected base color
    const lighterColor = adjustBrightness(baseColor, 20);
    return {
      color: `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 20%)`,
      buttonGradient: `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 100%)`
    };
  };

  const adjustBrightness = (hex, percent) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Adjust brightness
    const newR = Math.min(255, Math.max(0, r + (r * percent / 100)));
    const newG = Math.min(255, Math.max(0, g + (g * percent / 100)));
    const newB = Math.min(255, Math.max(0, b + (b * percent / 100)));

    // Convert back to hex
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  };

  const handleColorSelect = (baseColor) => {
    const shades = generateShades(baseColor);
    onCategoryColorChange(activeCategory, shades);
  };

  const handleCustomColorSelect = () => {
    const shades = generateShades(customColor);
    onCategoryColorChange(activeCategory, shades);

    // Save the custom color to localStorage if it's not already saved
    if (!savedCustomColors.includes(customColor)) {
      const updatedColors = [...savedCustomColors, customColor].slice(-2); // Keep only last 2 custom colors
      setSavedCustomColors(updatedColors);
      localStorage.setItem('voiceBoard_customColors', JSON.stringify(updatedColors));
    }

    setShowCustomColorPicker(false);
  };

  const toggleCustomColorPicker = () => {
    setShowCustomColorPicker(!showCustomColorPicker);
  };

  return (
    <div style={{
      marginTop: '15px',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        color: '#aaa',
        fontSize: '12px',
        marginBottom: '8px',
        fontWeight: 'bold'
      }}>
        Customize Category
      </div>

      {/* Color Selection */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          color: '#ccc',
          fontSize: '11px',
          marginBottom: '6px'
        }}>
          Background Colors
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4px',
          marginBottom: '8px'
        }}>
          {baseColors.map((colorOption) => (
            <button
              key={colorOption.name}
              onClick={() => handleColorSelect(colorOption.color)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: colorOption.color,
                cursor: 'pointer',
                transition: 'transform 0.1s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              title={colorOption.name}
            />
          ))}
        </div>

        {/* Custom Colors Row (5th row) */}
        <div>
          <div style={{
            color: '#aaa',
            fontSize: '10px',
            marginBottom: '4px'
          }}>
            Custom Colors
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px'
          }}>
            {/* Saved custom colors - show up to 2 */}
            {savedCustomColors.slice(0, 2).map((color, index) => (
              <button
                key={`custom-${index}`}
                onClick={() => handleColorSelect(color)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: color,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                title={`Custom: ${color}`}
              />
            ))}

            {/* Fill remaining slots with empty buttons and add custom color picker */}
            {Array.from({ length: 2 - savedCustomColors.length }, (_, index) => {
              const isLastSlot = index === 1 - savedCustomColors.length;
              return (
                <button
                  key={`empty-${index}`}
                  onClick={isLastSlot ? toggleCustomColorPicker : undefined}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: isLastSlot ? '2px dashed rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isLastSlot && showCustomColorPicker ? customColor : 'transparent',
                    cursor: isLastSlot ? 'pointer' : 'default',
                    transition: 'all 0.1s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#fff',
                    opacity: isLastSlot ? 1 : 0.3
                  }}
                  onMouseEnter={(e) => {
                    if (isLastSlot) e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (isLastSlot) e.target.style.transform = 'scale(1)';
                  }}
                  title={isLastSlot ? "Add Custom Color" : "Empty"}
                >
                  {isLastSlot ? (showCustomColorPicker ? '✓' : '+') : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Color Picker */}
        {showCustomColorPicker && (
          <div style={{
            marginTop: '8px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              color: '#ccc',
              fontSize: '11px',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Choose Custom Color
            </div>

            {/* HTML5 Color Picker */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{
                  width: '60px',
                  height: '60px',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: 'transparent'
                }}
              />

              {/* Hex Input */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#667eea"
                  style={{
                    width: '70px',
                    padding: '3px 6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '3px',
                    color: '#fff',
                    fontSize: '10px',
                    textAlign: 'center'
                  }}
                />
                <button
                  onClick={handleCustomColorSelect}
                  style={{
                    padding: '3px 12px',
                    background: 'rgba(67, 233, 123, 0.8)',
                    border: '1px solid rgba(67, 233, 123, 0.5)',
                    borderRadius: '3px',
                    color: '#fff',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Font Color */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          color: '#ccc',
          fontSize: '11px',
          marginBottom: '6px'
        }}>
          Font Color
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4px'
        }}>
          {fontColors.map((fontColor) => (
            <button
              key={fontColor.name}
              onClick={() => onFontColorChange(activeCategory, fontColor.color)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: fontColor.color,
                cursor: 'pointer',
                transition: 'transform 0.1s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              title={fontColor.name}
            />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div style={{
          color: '#ccc',
          fontSize: '11px',
          marginBottom: '6px'
        }}>
          Font Size
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {fontSizes.map((fontSize) => (
            <button
              key={fontSize.name}
              onClick={() => onFontSizeChange(activeCategory, fontSize.size)}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: currentFontSize === fontSize.size ?
                  'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: '#ccc',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'background 0.1s ease'
              }}
              onMouseEnter={(e) => {
                if (currentFontSize !== fontSize.size) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentFontSize !== fontSize.size) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              {fontSize.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorCustomization;