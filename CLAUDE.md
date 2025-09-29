# Voice Command Board

## Project Description

A React-based voice command board application designed to assist users with communication needs through an intuitive grid interface. The application integrates with ElevenLabs API v3 to provide text-to-speech with emotional audio tags, sound effects generation, and music composition.

## Key Features

### Core Functionality
- **6x6 Grid Layout**: Customizable grid (4x4 to 6x6) with colored category-based buttons
- **5 Categories**: Basic needs, emotions, responses, requests, and fun interactions
- **Hover-to-Activate**: Eye gaze simulation with configurable hover duration
- **Edit Mode**: Drag-and-drop button repositioning and comprehensive editing modal

### ElevenLabs Integration
- **Text-to-Speech**: Emotional audio tags ([laughing], [excited], [sighing], [calmly], [yelling])
- **Sound Effects**: Generate 0.5-30 second audio clips with loop options
- **Music Composition**: Custom song generation with configurable duration
- **Local Audio Storage**: Client-side caching for offline playback

### User Interface
- **Dark Theme**: Eye-strain reduction with soft colored grid categories
- **Responsive Design**: Desktop, tablet, and mobile optimization
- **Accessibility**: Hover-based activation for motor accessibility
- **Settings Panel**: API key management, voice selection, audio quality, grid size

### Technical Stack
- **Frontend Only**: Pure React application, no backend required
- **Local Storage**: Browser-based persistence for configurations and audio files
- **ElevenLabs MCP**: Integration with ElevenLabs Model Context Protocol

## API Endpoints Used

1. **Text-to-Speech**: ElevenLabs TTS with emotional audio tags
2. **Sound Effects**: `/text-to-sound-effects/convert` - Generate custom sound effects
3. **Music**: `/music/compose` - Create custom musical compositions

## Project Structure

```
src/
├── components/
│   ├── Grid/
│   │   ├── SoundGrid.jsx
│   │   ├── GridButton.jsx
│   │   └── CategoryTabs.jsx
│   ├── Modals/
│   │   ├── EditModal.jsx
│   │   └── SettingsModal.jsx
│   ├── Navigation/
│   │   └── NavigationPanel.jsx
│   └── Common/
│       ├── Header.jsx
│       └── LoadingSpinner.jsx
├── services/
│   ├── elevenlabs.js
│   ├── audioStorage.js
│   └── localStorage.js
├── hooks/
│   ├── useHover.js
│   ├── useAudio.js
│   └── useLocalStorage.js
├── utils/
│   ├── constants.js
│   └── helpers.js
└── styles/
    ├── globals.css
    ├── grid.css
    └── modal.css
```

## Configuration

### Required Settings
- **API Key**: ElevenLabs API key for service access
- **Voice Selection**: Choose from available ElevenLabs voices
- **Audio Quality**: Configure output quality settings
- **Grid Size**: Select between 4x4, 5x5, or 6x6 grid layouts
- **Hover Duration**: Set activation delay for hover functionality

### Default Categories
1. **Basic** (Purple/Blue gradients): Essential communication needs
2. **Emotions** (Pink/Red gradients): Emotional expressions
3. **Needs** (Blue/Cyan gradients): Physical and comfort requirements
4. **Responses** (Green/Teal gradients): Common responses and acknowledgments
5. **Fun** (Orange/Yellow gradients): Entertainment and playful interactions

## Development Goals

1. **Accessibility First**: Designed for users with motor limitations
2. **Emotional Communication**: Enhanced expression through audio tags
3. **Caregiver Bonding**: Strengthen relationships through empathetic communication
4. **Simple Maintenance**: Frontend-only architecture for easy deployment
5. **Offline Capability**: Local audio storage for reliable access

## Future Enhancements

- Voice recognition for hands-free operation
- Custom audio tag creation
- Multi-language support
- Cloud sync for cross-device configurations
- Advanced gesture controls

---

*This application serves as an assistive technology tool to improve communication accessibility and strengthen caregiver relationships through enhanced audio interaction.*