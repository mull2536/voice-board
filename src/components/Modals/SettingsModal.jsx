import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Search, Download, Upload } from 'lucide-react';
import { GRID_SIZES, AUDIO_QUALITIES } from '../../utils/constants';
import { useAudio } from '../../hooks/useAudio';
import BackupService from '../../services/backupService';

const SettingsModal = ({ settings, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    hoverActivation: false, // Default value (off)
    ...settings
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceSearch, setVoiceSearch] = useState('');
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef(null);
  const backupService = useRef(new BackupService());

  const { getVoices, searchVoices } = useAudio(formData);

  // Load voices - show defaults immediately, then try to load from API if key is available
  useEffect(() => {
    const defaultVoices = [
      { voice_id: 'NNl6r8mD7vthiJatiJt1', name: 'Bradford' },
      { voice_id: 'Z3R5wn05IrDiVCyEkUrK', name: 'Arabella' }
    ];

    // Always show default voices first
    setVoices(defaultVoices);

    const loadVoices = async () => {
      if (formData.apiKey) {
        try {
          const voiceList = await getVoices();
          setVoices(voiceList);
        } catch (error) {
          console.error('Failed to load voices:', error);
          // Keep default voices on error
          setVoices(defaultVoices);
        }
      }
    };

    loadVoices();
  }, [formData.apiKey, getVoices]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showVoiceDropdown && !event.target.closest('.voice-selector')) {
        setShowVoiceDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showVoiceDropdown]);

  // Filter voices based on search - use API search if available
  const [filteredVoices, setFilteredVoices] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!voiceSearch) {
        setFilteredVoices(voices);
        return;
      }

      setIsSearching(true);
      try {
        // Use API search if we have voices loaded (API key available)
        if (voices.length > 0 && formData.apiKey) {
          const searchResults = await searchVoices(voiceSearch);
          setFilteredVoices(searchResults);
        } else {
          // Fallback to local filtering
          const filtered = voices.filter(voice =>
            voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
            voice.voice_id.toLowerCase().includes(voiceSearch.toLowerCase())
          );
          setFilteredVoices(filtered);
        }
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to local filtering
        const filtered = voices.filter(voice =>
          voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
          voice.voice_id.toLowerCase().includes(voiceSearch.toLowerCase())
        );
        setFilteredVoices(filtered);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [voiceSearch, voices, searchVoices, formData.apiKey]);

  // Initialize filtered voices when voices change
  useEffect(() => {
    if (!voiceSearch) {
      setFilteredVoices(voices);
    }
  }, [voices, voiceSearch]);

  const handleVoiceSelect = (voiceId) => {
    handleInputChange('voiceId', voiceId);
    setShowVoiceDropdown(false);
    setVoiceSearch('');
  };

  const handleCustomVoiceAdd = () => {
    if (customVoiceId.trim()) {
      handleInputChange('voiceId', customVoiceId.trim());
      setCustomVoiceId('');
      setShowVoiceDropdown(false);
    }
  };

  const getCurrentVoiceName = () => {
    const currentVoice = voices.find(v => v.voice_id === formData.voiceId);
    if (currentVoice) {
      return currentVoice.name;
    }

    // Fallback to default voice names for known voice IDs
    const defaultVoiceNames = {
      'NNl6r8mD7vthiJatiJt1': 'Bradford',
      'Z3R5wn05IrDiVCyEkUrK': 'Arabella'
    };

    return defaultVoiceNames[formData.voiceId] || formData.voiceId;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      apiKey: '',
      voiceId: 'NNl6r8mD7vthiJatiJt1',
      audioQuality: 'high',
      gridSize: 6,
      hoverDuration: 2000,
      volume: 0.8
    };

    // Clear all voiceboard localStorage data
    localStorage.removeItem('voiceBoard_settings');
    localStorage.removeItem('voiceBoard_gridData');
    localStorage.removeItem('voiceBoard_categoryNames');
    localStorage.removeItem('voiceBoard_categoryCustomizations');
    localStorage.removeItem('voiceBoard_customColors');
    localStorage.removeItem('voiceBoard_customEmotionTags');
    localStorage.removeItem('voiceBoard_previousVoiceId');

    setFormData(defaultSettings);
    onSave(defaultSettings);

    // Reload the page to reset all state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setImportStatus('');

    try {
      const result = await backupService.current.exportAllData();
      setImportStatus(`✅ Export successful! Downloaded ${result.fileName} (${result.size}, ${result.audioCount} audio files)`);
    } catch (error) {
      setImportStatus(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('');

    try {
      const result = await backupService.current.importData(file, { replaceExisting: true });
      setImportStatus(`✅ Import successful! Restored ${result.audioCount} audio files from ${result.manifest.exportDate.split('T')[0]}`);

      // Refresh page after successful import to reload all data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      setImportStatus(`❌ Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
      // Clear file input
      event.target.value = '';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content settings-modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-section">
            <h3>ElevenLabs Configuration</h3>

            <div className="form-group">
              <label>API Key:</label>
              <div className="api-key-input">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your ElevenLabs API key..."
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <small>Get your API key from the ElevenLabs dashboard</small>
            </div>

            <div className="form-group">
              <label>Voice:</label>
              <div className="voice-selector" style={{ position: 'relative' }}>
                <div
                  onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                  style={{
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{getCurrentVoiceName()}</span>
                  <span style={{ transform: showVoiceDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
                </div>

                {showVoiceDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#2a2a3a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {/* Search box */}
                    <div style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input
                          type="text"
                          placeholder="Search voices..."
                          value={voiceSearch}
                          onChange={(e) => setVoiceSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 8px 8px 35px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '3px',
                            color: 'white',
                            fontSize: '14px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isSearching && (
                          <div style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#667eea',
                            fontSize: '12px'
                          }}>
                            Searching...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Custom voice input */}
                    <div style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Enter custom voice ID..."
                          value={customVoiceId}
                          onChange={(e) => setCustomVoiceId(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '3px',
                            color: 'white',
                            fontSize: '12px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCustomVoiceAdd(); }}
                          style={{
                            padding: '6px 12px',
                            background: '#667eea',
                            border: 'none',
                            borderRadius: '3px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Add
                        </button>
                      </div>
                      <small style={{ color: '#aaa', fontSize: '10px' }}>Add your own custom voice ID</small>
                    </div>

                    {/* Voice list */}
                    {filteredVoices.length > 0 ? (
                      filteredVoices.map((voice) => (
                        <div
                          key={voice.voice_id}
                          onClick={() => handleVoiceSelect(voice.voice_id)}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: formData.voiceId === voice.voice_id ? 'rgba(102, 126, 234, 0.2)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (formData.voiceId !== voice.voice_id) {
                              e.target.style.background = 'rgba(255,255,255,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (formData.voiceId !== voice.voice_id) {
                              e.target.style.background = 'transparent';
                            }
                          }}
                        >
                          <div style={{ color: 'white', fontSize: '14px' }}>{voice.name}</div>
                          <div style={{ color: '#aaa', fontSize: '11px' }}>
                            {voice.voice_id}
                            {voice.category && <span style={{ marginLeft: '8px', color: '#667eea' }}>• {voice.category}</span>}
                          </div>
                          {voice.description && (
                            <div style={{ color: '#999', fontSize: '10px', marginTop: '2px', lineHeight: 1.3 }}>
                              {voice.description.length > 60 ? voice.description.substring(0, 60) + '...' : voice.description}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
                        {voiceSearch ? 'No voices found' : 'Enter API key to load voices'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <small>Select a voice or add your custom voice ID</small>
            </div>

            <div className="form-group">
              <label>Audio Quality:</label>
              <select
                value={formData.audioQuality}
                onChange={(e) => handleInputChange('audioQuality', e.target.value)}
              >
                {AUDIO_QUALITIES.map(quality => (
                  <option key={quality.value} value={quality.value}>
                    {quality.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Interface Settings</h3>

            <div className="form-group">
              <label>Grid Size:</label>
              <select
                value={formData.gridSize}
                onChange={(e) => handleInputChange('gridSize', parseInt(e.target.value))}
              >
                {GRID_SIZES.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hover Duration (ms):</label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={formData.hoverDuration}
                onChange={(e) => handleInputChange('hoverDuration', parseInt(e.target.value))}
              />
              <div className="range-value">{formData.hoverDuration}ms</div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.hoverActivation}
                  onChange={(e) => handleInputChange('hoverActivation', e.target.checked)}
                />
                Enable Hover Activation
              </label>
              <small>Activate tabs and edit mode by hovering instead of clicking. Automatically disabled on mobile devices.</small>
            </div>

            <div className="form-group">
              <label>Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.volume}
                onChange={(e) => handleInputChange('volume', parseFloat(e.target.value))}
              />
              <div className="range-value">{Math.round(formData.volume * 100)}%</div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Data Management</h3>

            <div className="backup-controls">
              <button
                className="export-btn"
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  padding: '10px 16px',
                  background: '#667eea',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  opacity: isExporting ? 0.6 : 1
                }}
              >
                <Download size={16} />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>

              <button
                className="import-btn"
                onClick={handleImportClick}
                disabled={isImporting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  padding: '10px 16px',
                  background: '#34d399',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: isImporting ? 'not-allowed' : 'pointer',
                  opacity: isImporting ? 0.6 : 1
                }}
              >
                <Upload size={16} />
                {isImporting ? 'Importing...' : 'Import Data'}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleImport}
                style={{ display: 'none' }}
              />

              {importStatus && (
                <div
                  className="import-status"
                  style={{
                    padding: '8px',
                    background: importStatus.startsWith('✅') ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${importStatus.startsWith('✅') ? '#34d399' : '#ef4444'}`,
                    borderRadius: '5px',
                    fontSize: '12px',
                    marginBottom: '10px',
                    color: importStatus.startsWith('✅') ? '#34d399' : '#ef4444'
                  }}
                >
                  {importStatus}
                </div>
              )}

              <small style={{ color: '#aaa', display: 'block', marginBottom: '15px' }}>
                Export creates a backup of all your settings, buttons, and audio files.
                Import will replace all current data.
              </small>
            </div>

            <button className="reset-btn" onClick={handleReset}>
              Reset to Defaults
            </button>

            <div className="warning-text">
              <small>
                Warning: Resetting will clear all your settings including API key.
              </small>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;