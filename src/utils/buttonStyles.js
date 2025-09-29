// Generate shades from a base color
export const generateColorShades = (baseColor, shadeCount = 6) => {
  const shades = [];
  for (let i = 0; i < shadeCount; i++) {
    const lightness = 10 + (i * 15); // Create variety in shades
    const shade = adjustColorBrightness(baseColor, lightness);
    shades.push(`linear-gradient(135deg, ${baseColor}, ${shade})`);
  }
  return shades;
};

// Adjust color brightness
export const adjustColorBrightness = (hex, percent) => {
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

// Button styling classes matching the mockup exactly
export const getButtonClass = (category, index, customColors = null) => {
  const styles = {
    basic: [
      'linear-gradient(135deg, #667eea, #5a6fd8)',
      'linear-gradient(135deg, #764ba2, #6a4196)',
      'linear-gradient(135deg, #7c3aed, #6d28d9)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #a78bfa, #9333ea)',
      'linear-gradient(135deg, #c084fc, #a855f7)'
    ],
    emotions: [
      'linear-gradient(135deg, #f093fb, #ec4899)',
      'linear-gradient(135deg, #f5576c, #ef4444)',
      'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      'linear-gradient(135deg, #fd79a8, #e84393)',
      'linear-gradient(135deg, #fdcbf1, #e056fd)',
      'linear-gradient(135deg, #ffc0cb, #ffb6c1)'
    ],
    needs: [
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #5eb3fa, #2e86de)',
      'linear-gradient(135deg, #48dbfb, #0abde3)',
      'linear-gradient(135deg, #00d2ff, #3a7bd5)',
      'linear-gradient(135deg, #667eea, #5f72bd)',
      'linear-gradient(135deg, #4481eb, #04befe)'
    ],
    responses: [
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #50c878, #00b894)',
      'linear-gradient(135deg, #55efc4, #00b894)',
      'linear-gradient(135deg, #6ab04c, #badc58)',
      'linear-gradient(135deg, #20bf6b, #26de81)',
      'linear-gradient(135deg, #00d775, #00c851)'
    ],
    fun: [
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #f39c12, #f1c40f)',
      'linear-gradient(135deg, #ff9ff3, #feca57)',
      'linear-gradient(135deg, #ff6b9d, #feca57)',
      'linear-gradient(135deg, #ffa502, #ff7675)',
      'linear-gradient(135deg, #fab1a0, #e17055)'
    ]
  };

  // Use custom colors if provided
  if (customColors && customColors.buttonGradient) {
    // Extract base color from buttonGradient for generating shades
    const baseColorMatch = customColors.buttonGradient.match(/#[0-9a-fA-F]{6}/);
    if (baseColorMatch) {
      const baseColor = baseColorMatch[0];
      const customShades = generateColorShades(baseColor, 6);
      const styleIndex = index % customShades.length;
      return customShades[styleIndex];
    }
  }

  const categoryStyles = styles[category] || styles.basic;
  const styleIndex = index % categoryStyles.length;
  return categoryStyles[styleIndex];
};

// Get category gradient for tabs
export const getCategoryGradient = (category) => {
  const gradients = {
    basic: 'linear-gradient(135deg, #667eea 0%, #764ba2 20%)',
    emotions: 'linear-gradient(135deg, #f093fb 0%, #f5576c 20%)',
    needs: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 20%)',
    responses: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 20%)',
    fun: 'linear-gradient(135deg, #fa709a 0%, #fee140 20%)'
  };

  return gradients[category] || gradients.basic;
};