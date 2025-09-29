# Voice Command Board

A React-based assistive communication tool that uses ElevenLabs AI to generate speech, sound effects, and music through an intuitive grid interface. Designed for users with motor limitations who need enhanced communication support.

## 🎯 Features

### Core Functionality
- **Adaptive Grid Layout**: Customizable grid size (3x3 to 6x6) with responsive design
- **5 Categories**: Basic needs, emotions, responses, requests, and fun interactions
- **Hover Activation**: Optional eye gaze simulation with configurable hover duration
- **Advanced Edit Mode**: Button repositioning, single-click editing, and comprehensive customization
- **Mobile Optimized**: Dedicated layouts for iPhone and iPad in both portrait and landscape

### ElevenLabs AI Integration
- **Text-to-Speech**: Emotional audio tags ([laughing], [excited], [sighing], etc.)
- **Sound Effects**: Generate 0.5-30 second custom audio clips
- **Music Composition**: Create songs up to 3 minutes with custom prompts
- **Local Storage**: Client-side audio caching for offline playback

### Accessibility Features
- **Dark Theme**: Eye-strain reduction with soft colored categories
- **Fully Responsive**: Optimized layouts for desktop, tablet, and mobile devices
- **Motor Accessibility**: Optional hover-based activation for limited mobility
- **Visual Feedback**: Progress indicators and clear button states
- **Touch-Friendly**: 44px minimum touch targets on mobile devices
- **Category Customization**: Custom colors, fonts, and button styling per category

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- ElevenLabs API key ([Get one here](https://elevenlabs.io/))

### Installation

1. **Clone or download the project**
   ```bash
   cd voice-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates a `build` folder with optimized files ready for deployment.

## ⚙️ Configuration

### ElevenLabs API Setup

1. **Get API Key**
   - Sign up at [ElevenLabs](https://elevenlabs.io/)
   - Go to your profile settings
   - Copy your API key

2. **Configure in App**
   - Click the settings gear icon in the top-right
   - Paste your API key in the "API Key" field
   - Select your preferred voice and audio quality
   - Save settings

### Grid Customization

1. **Enter Edit Mode**
   - Click the "Edit" button in the navigation panel
   - Select buttons by clicking on them

2. **Edit Button Content**
   - Select a button and click "Configure"
   - Choose button type (Speech, Sound Effect, Music)
   - Enter content and customize settings

3. **Move Buttons**
   - Use arrow buttons to rearrange selected buttons
   - Drag-and-drop functionality coming soon

## 🎵 Button Types

### Speech Buttons
- Convert text to speech with emotional audio tags
- Supported tags: [laughing], [excited], [sighing], [calmly], [yelling], etc.
- Example: `[excited] I am so happy to see you!`

### Sound Effect Buttons
- Generate custom sound effects from text prompts
- Duration: 0.5 - 30 seconds
- Loop option available
- Examples: "birds chirping", "rain falling", "doorbell ringing"

### Music Buttons
- Create custom music from text descriptions
- Duration: 10 seconds - 3 minutes
- Instrumental or vocal options
- Examples: "happy birthday song", "relaxing piano melody"

## 🎨 Categories

### Basic (Purple/Blue)
Essential communication needs like help, thank you, yes/no, water, food, etc.

### Emotions (Pink/Red)
Emotional expressions including happy, sad, excited, worried, angry, etc.

### Needs (Blue/Cyan)
Physical and comfort requirements like more light, blanket, bathroom, etc.

### Responses (Green/Teal)
Common responses and acknowledgments like OK, maybe, I don't know, etc.

### Fun (Orange/Yellow)
Entertainment and playful interactions including jokes, songs, games, etc.

## 📱 Usage Tips

### For Users with Limited Mobility
- **Hover Activation**: Enable/disable in settings - automatically disabled on mobile
- **Hover Duration**: Adjust activation time (500ms - 5000ms)
- **Eye Gaze Simulation**: Hover over buttons to activate automatically
- **Adaptive Button Sizes**: Grid scales appropriately for device and screen size
- **Visual Feedback**: Progress bar shows activation progress
- **Single-Click Editing**: Click active category tabs to rename them

### For Caregivers
- **Edit Mode**: Customize buttons for specific needs
- **Categories**: Organize content by communication type
- **Volume Control**: Adjust audio levels in settings
- **Category Customization**: Change colors, fonts, and styling per category
- **Backup**: Settings and audio stored locally in browser
- **Data Management**: Export/import settings and configurations

### Mobile & Tablet Experience
- **iPhone Portrait**: 3x5 grid with right-side edit panel
- **iPhone Landscape**: 5x5 grid with compact navigation
- **iPad Support**: Optimized layouts for both orientations
- **Auto-Detection**: Hover activation automatically disabled on touch devices
- **Touch Targets**: All buttons meet 44px minimum size for accessibility

### Troubleshooting

**Audio not playing?**
- Check API key is entered correctly
- Verify internet connection
- Check browser audio permissions

**Buttons not responding?**
- Disable edit mode for normal operation
- Check hover duration settings
- Ensure JavaScript is enabled

**Performance issues?**
- Clear audio cache in browser settings
- Reduce grid size in settings
- Close other browser tabs

## 🔒 Privacy & Storage

- **Local Storage**: All settings and audio files stored locally
- **No Backend**: Pure frontend application, no server required
- **API Calls**: Only made to ElevenLabs for audio generation
- **Offline Playback**: Cached audio works without internet

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   ├── Grid/          # Grid components
│   ├── Modals/        # Settings and edit modals
│   ├── Navigation/    # Navigation panel
│   └── Common/        # Shared components
├── services/          # ElevenLabs and storage services
├── hooks/             # Custom React hooks
├── utils/             # Constants and helpers
└── styles/            # CSS files
```

### Available Scripts

- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Key Dependencies

- **React** - UI framework
- **axios** - HTTP client for API calls
- **lucide-react** - Icons
- **@emotion/react** - CSS-in-JS styling

## 🤝 Contributing

This project was created as an assistive technology tool. Contributions that improve accessibility, add new features, or fix bugs are welcome.

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For technical support or feature requests, please create an issue in the project repository.

---

**Made with ❤️ for improving communication accessibility**