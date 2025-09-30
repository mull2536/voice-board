import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { emojiLibrary, getEmojiKeywords } from '../../utils/emojiLibrary';

const EditModal = ({ buttonData, onSave, onClose, settings, onPlayButtonAudio, activeCategory }) => {
  // Create a consistent button ID for both testing and saving
  const buttonId = buttonData?.id || Date.now();

  const [formData, setFormData] = useState(() => {
    // Keep original content with all tags for display in textarea
    const originalContent = buttonData?.content || buttonData?.label || '';

    return {
      label: originalContent, // Show original content with all tags in textarea
      type: buttonData?.type || 'speech',
      content: originalContent, // Keep original content with all tags
      audioTag: '', // No default audio tag
      emoji: buttonData?.emoji || '',
      duration: buttonData?.duration !== undefined ? buttonData.duration : (buttonData?.type === 'music' ? 30 : buttonData?.type === 'sound_effect' ? 0 : undefined),
      loop: buttonData?.loop || false,
      forceInstrumental: buttonData?.forceInstrumental || false,
      localStorage: buttonData?.localStorage !== undefined ? buttonData.localStorage : (buttonData?.type === 'speech' ? false : true)
    };
  });

  const [charCount, setCharCount] = useState(0);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('all');
  const [emojiSearchTerm, setEmojiSearchTerm] = useState('');
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [selectedEmotionTags, setSelectedEmotionTags] = useState(() => {
    // Parse existing tags from content
    const content = buttonData?.content || '';
    const tagMatches = content.match(/\[([^\]]+)\]/g) || [];
    const tags = tagMatches.map(match => match.replace(/[[\]]/g, ''));
    return new Set(tags);
  });
  const [customEmotionTag, setCustomEmotionTag] = useState('');
  const [customTags, setCustomTags] = useState(() => {
    const saved = localStorage.getItem('voiceBoard_customEmotionTags');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCustomEmotion, setShowCustomEmotion] = useState(false);
  const [lastGeneratedAudio, setLastGeneratedAudio] = useState(null); // Cache generated audio

  // Clear cached audio when button changes
  useEffect(() => {
    setLastGeneratedAudio(null);
  }, [buttonData?.id]);
  const [musicTimer, setMusicTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [textareaRef, setTextareaRef] = useState(null);

  const { testTTS, saveButtonAudio, savePreGeneratedAudio, playButtonAudio, isLoading: audioLoading } = useAudio(settings);

  const baseEmotionTags = [
    { id: 'laughing', label: 'laughing' },
    { id: 'excited', label: 'excited' },
    { id: 'sighing', label: 'sighing' },
    { id: 'calmly', label: 'calmly' },
    { id: 'yelling', label: 'yelling' },
    { id: 'whispering', label: 'whispering' },
    { id: 'crying', label: 'crying' },
    { id: 'nervously', label: 'nervously' },
    { id: 'laughing loud', label: 'laughing loud' },
    { id: 'screaming', label: 'screaming' },
    { id: 'singing', label: 'singing' },
    { id: 'cheerful', label: 'cheerful' },
    { id: 'angry', label: 'angry' },
    { id: 'coughing', label: 'coughing' }
  ];

  // Combine base tags with custom tags, ensuring no duplicates
  const emotionTags = [
    ...baseEmotionTags,
    ...customTags
      .filter(tag => !baseEmotionTags.some(baseTag => baseTag.id === tag))
      .map(tag => ({ id: tag, label: tag }))
  ];

  useEffect(() => {
    setCharCount(formData.label.length);
  }, [formData.label]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the modal content
      if (event.target.classList.contains('modal-overlay')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Timer functions
  const startTimer = useCallback(() => {
    setMusicTimer(0);
    const interval = setInterval(() => {
      setMusicTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setMusicTimer(0);
  }, [timerInterval]);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Start/stop timer based on audio loading state for music
  useEffect(() => {
    if (audioLoading && formData.type === 'music' && musicTimer === 0) {
      startTimer();
    } else if (!audioLoading && musicTimer > 0) {
      stopTimer();
    }
  }, [audioLoading, formData.type, musicTimer, startTimer, stopTimer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Handle button type change
    if (field === 'type') {
      if (value !== 'speech') {
        // Clear emotion tags for non-speech types
        setSelectedEmotionTags(new Set());
        setShowCustomEmotion(false);
        setCustomEmotionTag('');
      }

      setFormData(prev => {
        const updateData = { ...prev, type: value };
        // Set duration defaults based on type
        if (value === 'music') {
          updateData.duration = 30;
        } else if (value === 'sound_effect') {
          updateData.duration = 0; // None - let model decide
        }
        // Set localStorage defaults based on type
        updateData.localStorage = value === 'speech' ? false : true;
        return updateData;
      });
      return;
    }

    // For label changes, just update directly - no automatic tag manipulation
    if (field === 'label') {
      setFormData(prev => ({
        ...prev,
        label: value,
        content: value
      }));
    }
  };

  const handlePlayExample = async () => {
    if (audioLoading || !settings.apiKey) return;

    try {
      if (formData.type === 'speech') {
        const finalTag = showCustomEmotion && customEmotionTag.trim()
          ? `[${customEmotionTag.trim()}]`
          : Array.from(selectedEmotionTags).map(tag => `[${tag}]`).join(' ');
        const textWithTag = `${finalTag} ${formData.label}`;
        await testTTS(textWithTag, finalTag, settings.voiceId);
      } else {
        // For sound effects and music, use playButtonAudio with test flag
        const cleanLabel = formData.label.replace(/^(\[[^\]]*\]\s*)+/, '');
        const buttonDataForTest = {
          ...buttonData,
          type: formData.type,
          content: cleanLabel,
          label: cleanLabel,
          audioTag: '',
          id: buttonId,
          duration: formData.duration || (formData.type === 'music' ? 30 : 5),
          forceInstrumental: formData.forceInstrumental
        };

        // Use playButtonAudio for proper loading states and visual timer
        const audioBlob = await playButtonAudio(buttonDataForTest, 'test', true); // isTest = true

        // Cache the audio blob for comparison (audio is already saved to IndexedDB by playButtonAudio)
        if (audioBlob) {
          setLastGeneratedAudio({ buttonData: buttonDataForTest, audioBlob });
        }
      }
    } catch (error) {
      console.error('Error playing example:', error);
    }
  };

  const handleSave = async () => {

    // Extract clean label without tags for display
    const cleanLabel = formData.label.replace(/\[[^\]]*\]/g, '').trim();

    const updatedData = {
      ...buttonData,
      label: cleanLabel || formData.label, // Use clean label or original if no tags
      type: formData.type,
      content: formData.label, // Store the full content with tags
      audioTag: Array.from(selectedEmotionTags).join(', '), // Store selected tags
      emoji: formData.emoji,
      duration: formData.duration,
      loop: formData.loop,
      forceInstrumental: formData.forceInstrumental,
      localStorage: formData.localStorage,
      id: buttonId
    };

    // Save the audio file (should be instant if pre-saved during test)
    try {
      const saveStartTime = performance.now();

      // Save audio based on localStorage setting
      if (updatedData.localStorage) {
        if (updatedData.type === 'speech') {
          if (lastGeneratedAudio && lastGeneratedAudio.audioBlob) {
            await savePreGeneratedAudio(updatedData, lastGeneratedAudio.audioBlob);
          } else {
            await saveButtonAudio(updatedData);
          }
        } else {
          // For music/sound effects with localStorage on, use cached audio if available
          if (lastGeneratedAudio && lastGeneratedAudio.audioBlob) {
            await savePreGeneratedAudio(updatedData, lastGeneratedAudio.audioBlob);
          } else {
            await saveButtonAudio(updatedData);
          }
        }
      } else {
        // Don't save to storage, audio will be generated fresh each playback
      }

      const totalTime = performance.now() - saveStartTime;
    } catch (error) {
      console.error('Failed to save audio:', error);
    }

    onSave(updatedData);
  };

  const addToRecentEmojis = (emoji) => {
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      const newRecent = [emoji, ...filtered].slice(0, 10);
      return newRecent;
    });
  };

  const handleEmojiSelect = (emoji) => {
    handleInputChange('emoji', emoji);
    addToRecentEmojis(emoji);
  };

  const insertTagAtCursor = (tag) => {
    const textarea = textareaRef;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.label;
    const tagText = `[${tag}]`;

    const newText = currentText.substring(0, start) + tagText + currentText.substring(end);

    setFormData(prev => ({
      ...prev,
      label: newText,
      content: newText
    }));

    // Set cursor position after the inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagText.length, start + tagText.length);
    }, 0);
  };

  const removeTagFromText = (tag) => {
    const tagRegex = new RegExp(`\\[${tag}\\]\\s*`, 'g');
    const newText = formData.label.replace(tagRegex, '');

    setFormData(prev => ({
      ...prev,
      label: newText,
      content: newText
    }));
  };

  const handleEmotionTagClick = (tag) => {
    if (tag === 'custom') {
      setShowCustomEmotion(true);
    } else {
      const newTags = new Set(selectedEmotionTags);
      if (newTags.has(tag)) {
        // Remove tag
        newTags.delete(tag);
        removeTagFromText(tag);
      } else {
        // Add tag at cursor position
        newTags.add(tag);
        insertTagAtCursor(tag);
      }
      setSelectedEmotionTags(newTags);
    }
  };

  const handleSaveCustomTag = () => {
    const tagToSave = customEmotionTag.trim().toLowerCase();
    const isDuplicate = customTags.includes(tagToSave) || baseEmotionTags.some(tag => tag.id.toLowerCase() === tagToSave);

    if (tagToSave && !isDuplicate) {
      const newCustomTags = [...customTags, tagToSave];
      setCustomTags(newCustomTags);
      localStorage.setItem('voiceBoard_customEmotionTags', JSON.stringify(newCustomTags));

      // Add the new tag to selected tags
      const newSelectedTags = new Set(selectedEmotionTags);
      newSelectedTags.add(tagToSave);
      setSelectedEmotionTags(newSelectedTags);

      // Update content
      const cleanText = formData.label.replace(/^(\[[^\]]*\]\s*)+/, '');
      const tagsArray = Array.from(newSelectedTags);
      const tagsString = tagsArray.map(tag => `[${tag}]`).join(' ');
      setFormData(prev => ({
        ...prev,
        content: `${tagsString} ${cleanText}`
      }));

      // Clear the input and hide custom section
      setCustomEmotionTag('');
      setShowCustomEmotion(false);
    } else if (isDuplicate) {
      // Show a brief feedback that it's a duplicate
      setCustomEmotionTag('');
      alert('This emotion tag already exists!');
    }
  };

  const handleDeleteSelectedCustomTags = () => {
    // Get selected custom tags (only custom ones, not base emotion tags)
    const selectedCustomTags = Array.from(selectedEmotionTags).filter(tag =>
      customTags.includes(tag)
    );

    if (selectedCustomTags.length > 0) {
      // Remove selected custom tags from the customTags array
      const newCustomTags = customTags.filter(tag => !selectedCustomTags.includes(tag));
      setCustomTags(newCustomTags);
      localStorage.setItem('voiceBoard_customEmotionTags', JSON.stringify(newCustomTags));

      // Remove from selected tags
      setSelectedEmotionTags(prev => {
        const newSet = new Set(prev);
        selectedCustomTags.forEach(tag => newSet.delete(tag));
        return newSet;
      });

      // Update content by removing the deleted tags
      const remainingTags = Array.from(selectedEmotionTags).filter(tag => !selectedCustomTags.includes(tag));
      const tagsString = remainingTags.map(tag => `[${tag}]`).join(' ');
      const cleanText = formData.label.replace(/^(\[[^\]]*\]\s*)+/, '');
      const newContent = tagsString ? `${tagsString} ${cleanText}`.trim() : cleanText;

      setFormData(prev => ({
        ...prev,
        content: newContent
      }));
    }
  };

  const getFilteredEmojis = () => {
    let emojis = emojiLibrary[activeEmojiCategory] || emojiLibrary.all;

    if (emojiSearchTerm) {
      const searchTerm = emojiSearchTerm.toLowerCase();
      emojis = emojiLibrary.all.filter(emoji => {
        const keywords = getEmojiKeywords(emoji);
        return keywords.some(keyword => keyword.includes(searchTerm));
      });
    }

    return emojis;
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-modal" style={{ maxWidth: '750px', width: '95vw', maxHeight: '90vh', overflowY: 'auto', border: '6px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '25px' }}>
        <div className="modal-header">✏️ Edit Button</div>

        {/* Three-column layout: Icon, Text Message, Preview */}
        <div className="three-column-layout" style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start' }}>
          <div className="icon-section" style={{ flex: '0 0 80px' }}>
            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Icon</label>
            <input
              type="text"
              value={formData.emoji}
              onChange={(e) => handleInputChange('emoji', e.target.value)}
              placeholder=""
              style={{
                textAlign: 'center',
                fontSize: '28px',
                padding: '10px',
                width: '100%',
                height: '60px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px',
                color: 'white'
              }}
              maxLength="4"
            />
            <div style={{ marginTop: '5px' }}>
              <button
                type="button"
                onClick={() => handleInputChange('emoji', '')}
                style={{
                  width: '100%',
                  padding: '5px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Clear Icon
              </button>
            </div>
          </div>

          <div className="text-section" style={{ flex: 1 }}>
            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              {formData.type === 'speech' ? 'Text Message' : 'Sound Description'}
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                ref={setTextareaRef}
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                onKeyDown={(e) => {
                  // Let all standard Windows text navigation work normally
                  // This includes: Home, End, Ctrl+Home, Ctrl+End, Ctrl+A, Ctrl+C, Ctrl+V, etc.
                  // Don't prevent any default behavior - let browser handle all text navigation
                }}
                placeholder={
                  formData.type === 'speech'
                    ? "Type your message and use emotion tags (e.g., 'Can you help me please?')"
                    : "Describe your sound (e.g., 'rain falling on leaves')"
                }
                maxLength="200"
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '12px',
                  paddingRight: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  color: 'white',
                  fontSize: '16px',
                  resize: 'none',
                  fontFamily: 'inherit',
                  userSelect: 'text', // Ensure text selection is enabled
                  outline: 'none',
                  WebkitUserSelect: 'text', // Safari support
                  MozUserSelect: 'text', // Firefox support
                  msUserSelect: 'text', // IE/Edge support
                  caretColor: 'white', // Visible cursor
                  direction: 'ltr', // Ensure left-to-right text direction
                  unicodeBidi: 'normal' // Standard text behavior
                }}
              />
              <span
                className="char-count"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#667eea',
                  fontSize: '12px'
                }}
              >
                {charCount}/200
              </span>
            </div>
          </div>

          {/* Button Preview */}
          <div className="preview-section" style={{ flex: '0 0 100px' }}>
            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Preview</label>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '8px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>{formData.emoji || ''}</span>
              <span style={{
                fontSize: '11px',
                lineHeight: '1.3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {formData.label ? formData.label.replace(/\[[^\]]*\]/g, '') || 'Your message' : 'Your message'}
              </span>
            </div>
          </div>
        </div>

        {/* Recently Used Emojis */}
        {recentEmojis.length > 0 && (
          <div style={{
            marginBottom: '10px',
            padding: '8px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '8px'
          }}>
            <label style={{ color: '#aaa', fontSize: '11px', display: 'block', marginBottom: '5px' }}>Recently Used:</label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {recentEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className="emoji-btn"
                  onClick={() => handleEmojiSelect(emoji)}
                  style={{
                    background: 'rgba(102, 126, 234, 0.2)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                  title={`Recently used: ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Library with Search */}
        <div className="emoji-library" style={{
          marginBottom: '15px',
          padding: '8px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ color: '#aaa', fontSize: '12px' }}>Icon Library:</label>
            <div style={{ position: 'relative' }}>
              <input
                className="emoji-search"
                type="text"
                value={emojiSearchTerm}
                onChange={(e) => setEmojiSearchTerm(e.target.value)}
                placeholder="Search (try: happy, heart, food)"
                style={{
                  padding: '5px 10px',
                  paddingRight: '25px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  color: 'white',
                  fontSize: '12px',
                  width: '200px'
                }}
              />
              <button
                type="button"
                onClick={() => setEmojiSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px 5px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Emoji Categories */}
          <div className="emoji-category-buttons" style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'smileys', label: '😊 Faces' },
              { id: 'gestures', label: '👋 Gestures' },
              { id: 'symbols', label: '❤️ Symbols' },
              { id: 'activities', label: '⚽ Activities' },
              { id: 'objects', label: '📱 Objects' },
              { id: 'food', label: '🍕 Food' },
              { id: 'nature', label: '🌸 Nature' },
              { id: 'travel', label: '✈️ Travel' }
            ].map(category => (
              <button
                key={category.id}
                type="button"
                className={`emoji-cat-btn ${activeEmojiCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveEmojiCategory(category.id)}
                style={{
                  padding: '5px 8px',
                  background: activeEmojiCategory === category.id ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                {category.label} ({activeEmojiCategory === category.id ? filteredEmojis.length : (emojiLibrary[category.id] || []).length})
              </button>
            ))}
          </div>

          {/* Scrollable Emoji Grid */}
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '6px',
            padding: '6px'
          }}>
            <div className="emoji-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px' }}>
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className="emoji-btn"
                  onClick={() => handleEmojiSelect(emoji)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '5px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {filteredEmojis.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#aaa',
                padding: '20px'
              }}>
                {emojiSearchTerm ? `No emojis found for "${emojiSearchTerm}"` : 'No emojis in this category'}
              </div>
            )}
          </div>

          <div style={{
            marginTop: '5px',
            fontSize: '10px',
            color: '#667eea',
            textAlign: 'center'
          }}>
            💡 Search by keywords: happy, sad, food, heart, hand, face, etc.
          </div>
        </div>

        {/* Music Generation Progress - Under Emoji Library */}
        {(audioLoading || (formData.type === 'music' && musicTimer > 0)) && formData.type === 'music' && (
          <div style={{
            margin: '15px 0',
            padding: '12px',
            background: 'rgba(102, 126, 234, 0.15)',
            borderRadius: '8px',
            border: '2px solid rgba(102, 126, 234, 0.4)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ color: '#667eea', fontSize: '15px', fontWeight: 'bold' }}>
                🎵 Generating {formData.duration}s music...
              </span>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                {musicTimer}s
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((musicTimer / 60) * 100, 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '4px',
                transition: 'width 0.5s ease',
                boxShadow: '0 0 8px rgba(102, 126, 234, 0.5)'
              }} />
            </div>
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#bbb',
              textAlign: 'center'
            }}>
              ⏱️ Please wait, this typically takes 30-90 seconds
            </div>
          </div>
        )}

        {/* Button Type */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            {/* Type Section */}
            <div style={{ flex: '1' }}>
              <label style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Type:</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="speech" style={{ background: '#2a2a3a', color: 'white' }}>💬 Speech</option>
                <option value="sound_effect" style={{ background: '#2a2a3a', color: 'white' }}>🔊 Sound Effect</option>
                <option value="music" style={{ background: '#2a2a3a', color: 'white' }}>🎵 Music</option>
              </select>
            </div>

            {/* Local Storage Section */}
            <div style={{ minWidth: '120px' }}>
              <label style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>
                Local Storage:
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: formData.localStorage ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)',
                padding: '8px 12px',
                borderRadius: '5px',
                border: `1px solid ${formData.localStorage ? 'rgba(0,255,0,0.4)' : 'rgba(255,255,255,0.2)'}`,
                transition: 'all 0.3s ease',
                height: '34px', // Match select height
                boxSizing: 'border-box'
              }}>
                <input
                  type="checkbox"
                  checked={formData.localStorage}
                  onChange={(e) => handleInputChange('localStorage', e.target.checked)}
                  style={{
                    marginRight: '6px',
                    transform: 'scale(1.2)'
                  }}
                />
                <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
                  {formData.localStorage ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>
          </div>

          {/* Tip for speech */}
          {formData.type === 'speech' && (
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#888',
              fontStyle: 'italic',
              background: 'rgba(255,255,255,0.05)',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              💡 Tip: Leave local storage off for continued variety in speech generation
            </div>
          )}
        </div>

        {/* Music Duration and Instrumental Toggle (for music only) */}
        {formData.type === 'music' && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              {/* Music Duration Section */}
              <div style={{ flex: '1' }}>
                <label style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Music Duration:</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value={10} style={{ background: '#2a2a3a', color: 'white' }}>🎵 10 seconds</option>
                  <option value={30} style={{ background: '#2a2a3a', color: 'white' }}>🎵 30 seconds</option>
                  <option value={60} style={{ background: '#2a2a3a', color: 'white' }}>🎵 1 minute</option>
                  <option value={90} style={{ background: '#2a2a3a', color: 'white' }}>🎵 1 minute 30 seconds</option>
                  <option value={120} style={{ background: '#2a2a3a', color: 'white' }}>🎵 2 minutes</option>
                  <option value={180} style={{ background: '#2a2a3a', color: 'white' }}>🎵 3 minutes</option>
                </select>
              </div>

              {/* Instrumental Toggle Section */}
              <div style={{ minWidth: '120px' }}>
                <label style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>
                  Instrumental Only:
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: formData.forceInstrumental ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  border: `1px solid ${formData.forceInstrumental ? 'rgba(0,255,0,0.4)' : 'rgba(255,255,255,0.2)'}`,
                  transition: 'all 0.3s ease',
                  height: '34px', // Match select height
                  boxSizing: 'border-box'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.forceInstrumental}
                    onChange={(e) => handleInputChange('forceInstrumental', e.target.checked)}
                    style={{
                      marginRight: '6px',
                      transform: 'scale(1.2)'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
                    {formData.forceInstrumental ? 'ON' : 'OFF'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SFX Duration and Loop Toggle (for sound_effect only) */}
        {formData.type === 'sound_effect' && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              {/* SFX Duration Section */}
              <div style={{ flex: '1' }}>
                <label style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px', display: 'block' }}>SFX Duration:</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value={0} style={{ background: '#2a2a3a', color: 'white' }}>🔊 Let the model decide</option>
                  <option value={1} style={{ background: '#2a2a3a', color: 'white' }}>🔊 1 second</option>
                  <option value={2} style={{ background: '#2a2a3a', color: 'white' }}>🔊 2 seconds</option>
                  <option value={5} style={{ background: '#2a2a3a', color: 'white' }}>🔊 5 seconds</option>
                  <option value={10} style={{ background: '#2a2a3a', color: 'white' }}>🔊 10 seconds</option>
                  <option value={20} style={{ background: '#2a2a3a', color: 'white' }}>🔊 20 seconds</option>
                  <option value={30} style={{ background: '#2a2a3a', color: 'white' }}>🔊 30 seconds</option>
                </select>
              </div>

              {/* Loop Toggle Section */}
              <div style={{ minWidth: '120px' }}>
                <label style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px', display: 'block', textAlign: 'center' }}>
                  Loop:
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: formData.loop ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  border: `1px solid ${formData.loop ? 'rgba(0,255,0,0.4)' : 'rgba(255,255,255,0.2)'}`,
                  transition: 'all 0.3s ease',
                  height: '34px', // Match select height
                  boxSizing: 'border-box'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.loop}
                    onChange={(e) => handleInputChange('loop', e.target.checked)}
                    style={{
                      marginRight: '6px',
                      transform: 'scale(1.2)'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
                    {formData.loop ? 'ON' : 'OFF'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Tags (for speech) */}
        {formData.type === 'speech' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#aaa', fontSize: '14px' }}>Emotion Tags (for speech):</label>
            <div className="emotion-tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
              {emotionTags.map((tag, index) => (
                <span
                  key={`${tag.id}-${index}`}
                  className={`emotion-tag ${selectedEmotionTags.has(tag.id) ? 'active' : ''}`}
                  onClick={() => handleEmotionTagClick(tag.id)}
                  style={{
                    padding: '5px 10px',
                    background: selectedEmotionTags.has(tag.id) ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '15px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  {tag.label}
                </span>
              ))}
              <span
                className={`emotion-tag ${showCustomEmotion ? 'active' : ''}`}
                onClick={() => handleEmotionTagClick('custom')}
                style={{
                  padding: '5px 10px',
                  background: showCustomEmotion ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  border: '1px dashed rgba(255, 255, 255, 0.4)',
                  borderRadius: '15px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                ✏️ custom
              </span>

              {/* Delete button for custom tags - always visible when custom tags exist and are selected */}
              {customTags.length > 0 && Array.from(selectedEmotionTags).some(tag => customTags.includes(tag)) && (
                <span
                  onClick={handleDeleteSelectedCustomTags}
                  style={{
                    padding: '5px 10px',
                    background: 'linear-gradient(135deg, #ff6b6b, #ff8a8a)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '15px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                  title="Delete selected custom tags"
                >
                  🗑️ delete
                </span>
              )}
            </div>

            {showCustomEmotion && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={customEmotionTag}
                    onChange={(e) => {
                      setCustomEmotionTag(e.target.value);
                      // Update content with custom emotion tag
                      const cleanText = formData.label.replace(/^(\[[^\]]*\]\s*)+/, '');
                      setFormData(prev => ({
                        ...prev,
                        content: `[${e.target.value.trim() || 'calmly'}] ${cleanText}`
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveCustomTag();
                      }
                    }}
                    placeholder="Enter emotion word (e.g., cheerful, nervous, sarcastic)"
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px',
                      color: 'white',
                      fontSize: '13px'
                    }}
                    maxLength="30"
                  />
                  <button
                    onClick={handleSaveCustomTag}
                    disabled={!customEmotionTag.trim()}
                    style={{
                      padding: '8px 16px',
                      background: customEmotionTag.trim() ? 'linear-gradient(135deg, #43e97b, #38f9d7)' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: customEmotionTag.trim() ? 'pointer' : 'not-allowed',
                      opacity: customEmotionTag.trim() ? 1 : 0.5,
                      transition: 'all 0.2s',
                      marginRight: '8px'
                    }}
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={handleDeleteSelectedCustomTags}
                    disabled={!Array.from(selectedEmotionTags).some(tag => customTags.includes(tag))}
                    style={{
                      padding: '8px 16px',
                      background: Array.from(selectedEmotionTags).some(tag => customTags.includes(tag)) ? 'linear-gradient(135deg, #ff6b6b, #ff8a8a)' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: Array.from(selectedEmotionTags).some(tag => customTags.includes(tag)) ? 'pointer' : 'not-allowed',
                      opacity: Array.from(selectedEmotionTags).some(tag => customTags.includes(tag)) ? 1 : 0.5,
                      transition: 'all 0.2s'
                    }}
                    title="Delete selected custom tags"
                  >
                    🗑️ Delete
                  </button>
                </div>
                <p style={{
                  color: '#667eea',
                  fontSize: '11px',
                  marginTop: '0px',
                  lineHeight: '1.4'
                }}>
                  💡 Just type the word - brackets will be added automatically<br />
                  Examples: cheerful, nervous, sarcastic, confused, curious, annoyed, grateful, hopeful
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button
            onClick={handlePlayExample}
            disabled={audioLoading || !settings.apiKey}
            style={{
              flex: 1,
              padding: '10px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: audioLoading ? 'not-allowed' : 'pointer',
              opacity: audioLoading ? 0.7 : 1
            }}
          >
            <Sparkles size={16} style={{ marginRight: '6px' }} />
            {audioLoading ? (
              formData.type === 'music'
                ? `Generating music... ${musicTimer}s`
                : 'Generating...'
            ) : 'Generate'}
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '10px',
              background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            💾 Save
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ❌ Cancel
          </button>

        </div>

        <div style={{
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            color: '#aaa',
            fontSize: '11px',
            textAlign: 'center',
            margin: 0
          }}>
            💡 Tips: Write complete sentences for natural speech • Up to 200 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditModal;