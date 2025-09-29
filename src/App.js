import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Common/Header';
import CategoryTabs from './components/Grid/CategoryTabs';
import SoundGrid from './components/Grid/SoundGrid';
import NavigationPanel from './components/Navigation/NavigationPanel';
import EditModal from './components/Modals/EditModal';
import SettingsModal from './components/Modals/SettingsModal';
import ToastNotification from './components/Common/ToastNotification';
import EditModeBanner from './components/Common/EditModeBanner';
import StatusInfo from './components/Common/StatusInfo';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAudio } from './hooks/useAudio';
import { CATEGORIES, DEFAULT_GRID_DATA } from './utils/constants';
import './styles/grid.css';
import './styles/modal.css';

function App() {
  // State management
  const [activeCategory, setActiveCategory] = useState('basic');
  const [selectedButton, setSelectedButton] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [hoverProgress, setHoverProgress] = useState(0);
  const [swappingButtons, setSwappingButtons] = useState({ from: null, to: null, isSwapping: false });

  // Persistent storage
  const [gridData, setGridData] = useLocalStorage('voiceBoard_gridData', DEFAULT_GRID_DATA);
  const [customCategoryNames, setCustomCategoryNames] = useLocalStorage('voiceBoard_categoryNames', {});
  const [settings, setSettings] = useLocalStorage('voiceBoard_settings', {
    apiKey: '',
    voiceId: 'NNl6r8mD7vthiJatiJt1',
    audioQuality: 'high',
    gridSize: 6,
    hoverDuration: 2000,
    volume: 0.8,
    hoverActivation: false
  });
  const [categoryCustomizations, setCategoryCustomizations] = useLocalStorage('voiceBoard_categoryCustomizations', {
    basic: {
      color: 'linear-gradient(135deg, #9c27b0 0%, #b244c3 20%)',
      buttonGradient: 'linear-gradient(135deg, #9c27b0 0%, #b244c3 100%)',
      fontSize: '16px'
    },
    emotions: {
      color: 'linear-gradient(135deg, #f093fb 0%, #f4a6fc 20%)',
      buttonGradient: 'linear-gradient(135deg, #f093fb 0%, #f4a6fc 100%)',
      fontSize: '16px',
      fontColor: '#666666'
    },
    needs: {
      color: 'linear-gradient(135deg, #ff6b6b 0%, #ff8a8a 20%)',
      buttonGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8a8a 100%)',
      fontSize: '16px'
    },
    responses: {
      color: 'linear-gradient(135deg, #ff9500 0%, #ffaa33 20%)',
      buttonGradient: 'linear-gradient(135deg, #ff9500 0%, #ffaa33 100%)',
      fontSize: '16px'
    },
    fun: {
      color: 'linear-gradient(135deg, #ffd93d 0%, #ffdf66 20%)',
      buttonGradient: 'linear-gradient(135deg, #ffd93d 0%, #ffdf66 100%)',
      fontSize: '16px',
      fontColor: '#000000'
    }
  });

  // Migration: Fix old voice IDs
  useEffect(() => {
    if (settings.voiceId === 'rachel' || settings.voiceId === 'default' || settings.voiceId === 'pNInz6obpgDQGcFmaJgB') {
      setSettings(prev => ({ ...prev, voiceId: 'NNl6r8mD7vthiJatiJt1' }));
    }
  }, [settings.voiceId, setSettings]);

  // Migration: Add localStorage field to existing buttons
  useEffect(() => {
    let needsUpdate = false;
    const updatedGridData = { ...gridData };

    Object.keys(updatedGridData).forEach(categoryId => {
      if (Array.isArray(updatedGridData[categoryId])) {
        updatedGridData[categoryId] = updatedGridData[categoryId].map(button => {
          if (button && button.localStorage === undefined) {
            needsUpdate = true;
            return {
              ...button,
              localStorage: button.type === 'speech' ? false : true
            };
          }
          return button;
        });
      }
    });

    if (needsUpdate) {
      console.log('🔄 Migrating button data to include localStorage field');
      setGridData(updatedGridData);
    }
  }, [gridData, setGridData]);

  // Detect mobile devices and disable hover activation
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  };

  // Effective hover activation setting (disabled on mobile)
  const effectiveHoverActivation = settings.hoverActivation && !isMobileDevice();

  // Audio management
  const {
    playButtonAudio,
    clearCache
  } = useAudio(settings);

  // Clear cache when voice changes to force regeneration with new voice
  useEffect(() => {
    const previousVoiceId = localStorage.getItem('voiceBoard_previousVoiceId');
    if (previousVoiceId && previousVoiceId !== settings.voiceId) {
      clearCache().catch(console.error);
    }
    localStorage.setItem('voiceBoard_previousVoiceId', settings.voiceId);
  }, [settings.voiceId, clearCache]);

  // Toast notification function
  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Grid management
  const currentCategoryData = useMemo(() => gridData[activeCategory] || [], [gridData, activeCategory]);

  // Create categories with custom names
  const categoriesWithCustomNames = CATEGORIES.map(category => ({
    ...category,
    name: customCategoryNames[category.id] || category.name
  }));

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSelectedButton(0);
    // Don't exit edit mode when switching categories
    // setEditMode(false);
    // Audio continues playing when changing categories - only stops when activating new buttons
  };


  const handleButtonClick = (buttonIndex) => {
    if (editMode) {
      setSelectedButton(buttonIndex);
    } else {
      // Play audio for the button
      const buttonData = currentCategoryData[buttonIndex];
      if (buttonData) {
        playButtonAudio(buttonData, activeCategory, false); // isTest = false for regular button clicks
      }
    }
  };

  const handleButtonRightClick = (buttonIndex) => {
    if (editMode) {
      setSelectedButton(buttonIndex);
      setShowEditModal(true);
    }
  };

  // Button swapping functionality
  const swapButtons = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    // Start swap animation
    setSwappingButtons({ from: fromIndex, to: toIndex, isSwapping: true });

    // Perform the actual swap after a short delay to allow animation to start
    setTimeout(() => {
      const newGridData = { ...gridData };
      const categoryData = [...newGridData[activeCategory]];

      // Swap the buttons
      [categoryData[fromIndex], categoryData[toIndex]] = [categoryData[toIndex], categoryData[fromIndex]];

      newGridData[activeCategory] = categoryData;
      setGridData(newGridData);

      showToast('↔️ Swapped buttons');

      // End swap animation after completion
      setTimeout(() => {
        setSwappingButtons({ from: null, to: null, isSwapping: false });
      }, 300);
    }, 100);
  }, [gridData, activeCategory, setGridData, showToast]);

  // Handle category name changes
  const handleCategoryNameChange = useCallback((categoryId, newName) => {
    setCustomCategoryNames(prev => ({
      ...prev,
      [categoryId]: newName
    }));
    showToast(`📝 Category renamed to "${newName}"`);
  }, [setCustomCategoryNames, showToast]);

  const moveSelection = useCallback((direction) => {
    const totalButtons = settings.gridSize * settings.gridSize;
    const cols = settings.gridSize;
    let newIndex = selectedButton;

    switch (direction) {
      case 'up':
        if (selectedButton >= cols) {
          newIndex = selectedButton - cols;
        }
        break;
      case 'down':
        if (selectedButton < totalButtons - cols) {
          newIndex = selectedButton + cols;
        }
        break;
      case 'left':
        if (selectedButton % cols !== 0) {
          newIndex = selectedButton - 1;
        }
        break;
      case 'right':
        if ((selectedButton + 1) % cols !== 0 && selectedButton < totalButtons - 1) {
          newIndex = selectedButton + 1;
        }
        break;
      default:
        return;
    }

    setSelectedButton(newIndex);
  }, [selectedButton, settings.gridSize]);

  const moveButton = useCallback((direction) => {
    const totalButtons = settings.gridSize * settings.gridSize;
    const cols = settings.gridSize;
    let targetIndex = selectedButton;

    switch (direction) {
      case 'up':
        targetIndex = selectedButton - cols;
        break;
      case 'down':
        targetIndex = selectedButton + cols;
        break;
      case 'left':
        targetIndex = selectedButton - 1;
        break;
      case 'right':
        targetIndex = selectedButton + 1;
        break;
      default:
        return;
    }

    // Check boundaries
    const isValidMove =
      targetIndex >= 0 &&
      targetIndex < totalButtons &&
      (direction !== 'left' || selectedButton % cols !== 0) &&
      (direction !== 'right' || (selectedButton + 1) % cols !== 0);

    if (isValidMove) {
      swapButtons(selectedButton, targetIndex);
      setSelectedButton(targetIndex);
    } else {
      showToast('⚠️ Can\'t move there');
    }
  }, [selectedButton, settings.gridSize, swapButtons, showToast]);

  // Arrow key navigation
  const navigate = useCallback((direction) => {
    if (editMode) {
      moveButton(direction);
    } else {
      moveSelection(direction);
    }
  }, [editMode, moveButton, moveSelection]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    const newEditMode = !editMode;
    setEditMode(newEditMode);

    if (newEditMode) {
      showToast('✏️ Edit Mode ON - Use arrows to move buttons!');
    } else {
      showToast('👁️ Normal Mode - Click or hover to play');
    }
  }, [editMode, showToast]);

  const handleEditButton = useCallback(() => {
    if (selectedButton !== null) {
      setShowEditModal(true);
    }
  }, [selectedButton]);

  const handleClearButton = () => {
    if (selectedButton !== null) {
      const newGridData = { ...gridData };
      // Reset button to default empty state
      newGridData[activeCategory][selectedButton] = {
        id: selectedButton + 1,
        label: `Button ${selectedButton + 1}`,
        type: 'speech',
        content: 'Empty button',
        audioTag: '',
        emoji: '🔘'
      };
      setGridData(newGridData);
      showToast('🗑️ Button cleared');
    }
  };

  const handleSaveButton = (updatedData) => {
    const newGridData = { ...gridData };
    newGridData[activeCategory][selectedButton] = updatedData;
    setGridData(newGridData);
    setShowEditModal(false);
  };

  // Color customization handlers
  const handleCategoryColorChange = (categoryId, colors) => {
    const newCustomizations = { ...categoryCustomizations };
    if (!newCustomizations[categoryId]) {
      newCustomizations[categoryId] = {};
    }
    newCustomizations[categoryId] = {
      ...newCustomizations[categoryId],
      ...colors
    };
    setCategoryCustomizations(newCustomizations);
  };

  const handleFontColorChange = (categoryId, fontColor) => {
    const newCustomizations = { ...categoryCustomizations };
    if (!newCustomizations[categoryId]) {
      newCustomizations[categoryId] = {};
    }
    newCustomizations[categoryId].fontColor = fontColor;
    setCategoryCustomizations(newCustomizations);
  };

  const handleFontSizeChange = (categoryId, fontSize) => {
    const newCustomizations = { ...categoryCustomizations };
    if (!newCustomizations[categoryId]) {
      newCustomizations[categoryId] = {};
    }
    newCustomizations[categoryId].fontSize = fontSize;
    setCategoryCustomizations(newCustomizations);
  };

  // Get current category customizations
  const getCurrentCategoryCustomization = (categoryId) => {
    return categoryCustomizations[categoryId] || {};
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if modal is open
      if (showEditModal || showSettingsModal) return;

      // Ignore if user is typing in an input or textarea
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          navigate('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigate('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigate('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigate('right');
          break;
        case 'e':
        case 'E':
          event.preventDefault();
          toggleEditMode();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (editMode) {
            handleEditButton();
          } else {
            // Play selected button
            const buttonData = currentCategoryData[selectedButton];
            if (buttonData) {
              playButtonAudio(buttonData, activeCategory);
            }
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showEditModal, showSettingsModal, navigate, toggleEditMode, editMode, handleEditButton, currentCategoryData, selectedButton, playButtonAudio, activeCategory]);

  return (
    <div className="app">
      <EditModeBanner isVisible={editMode} />

      <div className="container">
        <Header onSettingsClick={() => setShowSettingsModal(true)} />

        <CategoryTabs
          categories={categoriesWithCustomNames}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onCategoryNameChange={handleCategoryNameChange}
          categoryCustomizations={categoryCustomizations}
          hoverActivation={effectiveHoverActivation}
        />

        <div className={`main-board${editMode ? ' edit-mode' : ''}`}>
          <SoundGrid
            gridData={currentCategoryData}
            gridSize={settings.gridSize}
            selectedButton={selectedButton}
            editMode={editMode}
            onButtonClick={handleButtonClick}
            onButtonRightClick={handleButtonRightClick}
            hoverDuration={settings.hoverDuration}
            category={activeCategory}
            onHoverProgress={setHoverProgress}
            swappingButtons={swappingButtons}
            categoryCustomizations={categoryCustomizations}
            hoverActivation={effectiveHoverActivation}
          />

          <NavigationPanel
            editMode={editMode}
            selectedButton={selectedButton}
            onToggleEdit={toggleEditMode}
            onEditButton={handleEditButton}
            onClearButton={handleClearButton}
            onMoveButton={navigate}
            activeCategory={activeCategory}
            onCategoryColorChange={handleCategoryColorChange}
            onFontColorChange={handleFontColorChange}
            onFontSizeChange={handleFontSizeChange}
            currentCategoryColors={getCurrentCategoryCustomization(activeCategory)}
            currentFontColor={getCurrentCategoryCustomization(activeCategory).fontColor}
            currentFontSize={getCurrentCategoryCustomization(activeCategory).fontSize}
            hoverActivation={effectiveHoverActivation}
          />
        </div>
      </div>

      <StatusInfo
        editMode={editMode}
        selectedButton={selectedButton}
        hoverProgress={hoverProgress}
      />

      {/* <Instructions /> */}

      <ToastNotification
        message={toast.message}
        isVisible={toast.visible}
        onHide={hideToast}
      />

      {showEditModal && (
        <EditModal
          buttonData={currentCategoryData[selectedButton]}
          onSave={handleSaveButton}
          onClose={() => setShowEditModal(false)}
          settings={settings}
          onPlayButtonAudio={playButtonAudio}
          activeCategory={activeCategory}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

export default App;