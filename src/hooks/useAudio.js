import { useState, useRef, useCallback, useEffect } from 'react';
import ElevenLabsService from '../services/elevenlabs';
import AudioStorageService from '../services/audioStorage';

/**
 * Custom hook for managing audio generation and playback
 */
export function useAudio(settings) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicProgress] = useState({ percent: 0, loaded: 0, total: 0 });

  const elevenLabsService = useRef(null);
  const currentAudio = useRef(null);
  const audioStorage = useRef(null);

  // Initialize services
  useEffect(() => {
    if (settings?.apiKey) {
      elevenLabsService.current = new ElevenLabsService(settings.apiKey);
    }
    if (!audioStorage.current) {
      audioStorage.current = new AudioStorageService();
      audioStorage.current.init().catch(console.error);
    }
  }, [settings?.apiKey]);

  // Helper functions for file operations

  const saveAudioFile = async (buttonId, audioBlob, metadata = {}) => {
    try {
      if (!audioStorage.current) {
        console.error('Audio storage not initialized');
        return false;
      }

      const audioId = AudioStorageService.generateAudioId(buttonId);
      await audioStorage.current.storeAudio(audioId, audioBlob, {
        ...metadata,
        buttonId: buttonId
      });

      return true;
    } catch (error) {
      console.error('Error saving audio file:', error);
      return false;
    }
  };

  const audioFileExists = async (buttonId) => {
    try {
      if (!audioStorage.current) {
        return false;
      }

      const audioId = AudioStorageService.generateAudioId(buttonId);
      const audioData = await audioStorage.current.getAudio(audioId);
      return audioData !== null;
    } catch {
      return false;
    }
  };

  /**
   * Play audio from a button configuration - FILE STORAGE VERSION
   */
  const playButtonAudio = useCallback(async (buttonData, categoryId, isTest = false) => {
    if (!buttonData || !settings?.apiKey) return;

    // If already loading, stop current operation first
    if (isLoading) {
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current = null;
        setIsPlaying(false);
      }
      setIsLoading(false);
    }

    setIsLoading(true);
    setError(null);
    let generatedAudioBlob = null;

    try {
      const buttonId = buttonData.id;

      // Backward compatibility: if localStorage field is missing, assume default behavior
      const hasLocalStorage = buttonData.localStorage !== undefined ?
        buttonData.localStorage :
        (buttonData.type === 'speech' ? false : true);

      if (isTest || !hasLocalStorage) {
        // TEST OR NO LOCAL STORAGE: Always generate fresh audio, don't store

        // Show specific loading message for music
        if (buttonData.type === 'music') {
        }

        const audioBlob = await generateAudio(buttonData);
        generatedAudioBlob = audioBlob; // Store for return

        const audioUrl = URL.createObjectURL(audioBlob);
        await playAudioFromUrl(audioUrl, settings.volume || 0.8);
        setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
      } else {
        // BUTTON CLICK WITH LOCAL STORAGE: Try to play stored file, generate if not exists
        const fileExists = await audioFileExists(buttonId);

        if (fileExists) {
          const audioId = AudioStorageService.generateAudioId(buttonId);
          const audioData = await audioStorage.current.getAudio(audioId);
          if (audioData && audioData.blob) {
            const audioUrl = AudioStorageService.createAudioUrl(audioData.blob);
            await playAudioFromUrl(audioUrl, settings.volume || 0.8);
            setTimeout(() => AudioStorageService.revokeAudioUrl(audioUrl), 1000);
          }
        } else {

          // Show specific loading message for music
          if (buttonData.type === 'music') {
            }

            const audioBlob = await generateAudio(buttonData);
  
          const audioUrl = URL.createObjectURL(audioBlob);
            await playAudioFromUrl(audioUrl, settings.volume || 0.8);
          setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);

          // Auto-save the generated audio for future use
          await saveAudioFile(buttonId, audioBlob, {
            type: buttonData.type,
            label: buttonData.label || buttonData.content,
            content: buttonData.content
          });
        }
      }

      // Return the generated blob if this was a test
      return isTest ? generatedAudioBlob : null;

    } catch (err) {
      console.error('❌ Audio playback error:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [settings?.apiKey, settings?.volume, isLoading]);

  /**
   * Save audio to file for a button
   */
  const saveButtonAudio = useCallback(async (buttonData) => {
    if (!buttonData || !settings?.apiKey) return false;

    // Backward compatibility: if localStorage field is missing, assume default behavior
    const hasLocalStorage = buttonData.localStorage !== undefined ?
      buttonData.localStorage :
      (buttonData.type === 'speech' ? false : true);

    // Only save audio files when localStorage is enabled
    if (!hasLocalStorage) {
      return true; // Return true since this is expected behavior
    }

    try {
      const audioBlob = await generateAudio(buttonData);
      const saved = await saveAudioFile(buttonData.id, audioBlob, {
        type: buttonData.type,
        label: buttonData.label || buttonData.content,
        content: buttonData.content,
        audioTag: buttonData.audioTag || ''
      });
      if (saved) {
      }
      return saved;
    } catch (err) {
      console.error('Error saving audio:', err);
      return false;
    }
  }, [settings?.apiKey]);

  /**
   * Save pre-generated audio blob directly (without regenerating)
   */
  const savePreGeneratedAudio = useCallback(async (buttonData, audioBlob) => {
    if (!buttonData || !audioBlob) return false;

    // Backward compatibility: if localStorage field is missing, assume default behavior
    const hasLocalStorage = buttonData.localStorage !== undefined ?
      buttonData.localStorage :
      (buttonData.type === 'speech' ? false : true);

    // Only save audio files when localStorage is enabled
    if (!hasLocalStorage) {
      return true;
    }

    try {
      const saved = await saveAudioFile(buttonData.id, audioBlob, {
        type: buttonData.type,
        label: buttonData.label || buttonData.content,
        content: buttonData.content,
        audioTag: buttonData.audioTag || ''
      });
      if (saved) {
      }
      return saved;
    } catch (err) {
      console.error('Error saving pre-generated audio:', err);
      return false;
    }
  }, []);

  /**
   * Generate audio based on button type
   */
  const generateAudio = useCallback(async (buttonData) => {
    if (!elevenLabsService.current) {
      throw new Error('ElevenLabs service not initialized');
    }


    try {
      let audioBlob;
      switch (buttonData.type) {
        case 'speech':
          audioBlob = await generateSpeech(buttonData);
          break;
        case 'sound_effect':
          audioBlob = await generateSoundEffect(buttonData);
          break;
        case 'music':
          audioBlob = await generateMusic(buttonData);
          break;
        default:
          throw new Error(`Unknown button type: ${buttonData.type}`);
      }

      return audioBlob;
    } catch (error) {
      console.error(`❌ ${buttonData.type} generation failed:`, error);
      throw error;
    }
  }, []);

  /**
   * Generate speech with audio tags
   */
  const generateSpeech = useCallback(async (buttonData) => {
    const processedText = ElevenLabsService.processTextWithAudioTags(
      buttonData.content,
      buttonData.audioTag
    );

    const voiceId = settings.voiceId || 'pNInz6obpgDQGcFmaJgB';

    const audioBlob = await elevenLabsService.current.textToSpeech(
      processedText,
      voiceId,
      {
        outputFormat: getAudioFormat(settings.audioQuality)
      }
    );
    return audioBlob;
  }, [settings?.voiceId, settings?.audioQuality]);

  /**
   * Generate sound effect
   */
  const generateSoundEffect = useCallback(async (buttonData) => {

    const options = {
      loop: buttonData.loop || false
    };

    // Only add duration if it's set and > 0
    // If duration is 0 (None), don't pass it - let the model decide
    if (buttonData.duration && buttonData.duration > 0) {
      options.duration = buttonData.duration;
    }
    // If duration is 0 or undefined, don't pass duration parameter at all

    const audioBlob = await elevenLabsService.current.generateSoundEffect(
      buttonData.content,
      options
    );
    return audioBlob;
  }, []);

  /**
   * Generate music
   */
  const generateMusic = useCallback(async (buttonData) => {

    const audioBlob = await elevenLabsService.current.generateMusic(
      buttonData.content,
      {
        duration: buttonData.duration || 30,
        forceInstrumental: buttonData.forceInstrumental || false
      }
    );
    return audioBlob;
  }, []);

  /**
   * Play audio from URL - WITH INTERRUPTION HANDLING
   */
  const playAudioFromUrl = useCallback((audioUrl, volume = 0.8) => {
    return new Promise((resolve, reject) => {
      try {
        // Stop current audio if playing
        if (currentAudio.current) {
          currentAudio.current.pause();
          currentAudio.current = null;
        }

        const audio = new Audio(audioUrl);
        audio.volume = volume;
        currentAudio.current = audio;

        audio.onended = () => {
          // Only update state if this audio is still the current one
          if (currentAudio.current === audio) {
            setIsPlaying(false);
            currentAudio.current = null;
          }
          resolve();
        };

        audio.onerror = (err) => {
          // Only update state if this audio is still the current one
          if (currentAudio.current === audio) {
            setIsPlaying(false);
            currentAudio.current = null;
          }
          reject(new Error('Audio playback failed'));
        };

        audio.onloadstart = () => {
          // Only update state if this audio is still the current one
          if (currentAudio.current === audio) {
            setIsPlaying(true);
          }
        };

        audio.play();
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  /**
   * Stop current audio playback
   */
  const stopAudio = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
      setIsPlaying(false);
    }
    // Always reset loading state when stopping audio
    setIsLoading(false);
  }, []);

  /**
   * Test TTS with example text
   */
  const testTTS = useCallback(async (text, audioTag, voiceId) => {
    if (!settings?.apiKey) {
      throw new Error('API key not configured');
    }

    setIsLoading(true);
    setError(null);

    try {
      const processedText = ElevenLabsService.processTextWithAudioTags(text, audioTag);
      const finalVoiceId = voiceId || settings.voiceId || 'pNInz6obpgDQGcFmaJgB';

      const audioBlob = await elevenLabsService.current.textToSpeech(
        processedText,
        finalVoiceId
      );

      const audioUrl = URL.createObjectURL(audioBlob);
      await playAudioFromUrl(audioUrl, settings.volume || 0.8);
      // Clean up temporary URL after playing
      setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
    } catch (err) {
      console.error('TTS test error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [settings, playAudioFromUrl]);

  /**
   * Get available voices
   */
  const getVoices = useCallback(async () => {
    if (!elevenLabsService.current) {
      return [];
    }

    try {
      return await elevenLabsService.current.getVoices();
    } catch (err) {
      console.error('Failed to get voices:', err);
      return [];
    }
  }, []);

  /**
   * Search voices by query
   */
  const searchVoices = useCallback(async (query, options = {}) => {
    if (!elevenLabsService.current) {
      return [];
    }

    try {
      return await elevenLabsService.current.searchVoices(query, options);
    } catch (err) {
      console.error('Failed to search voices:', err);
      return [];
    }
  }, []);

  /**
   * Get voice details by ID
   */
  const getVoiceById = useCallback(async (voiceId) => {
    if (!elevenLabsService.current) {
      return null;
    }

    try {
      return await elevenLabsService.current.getVoiceById(voiceId);
    } catch (err) {
      console.error('Failed to get voice by ID:', err);
      return null;
    }
  }, []);

  /**
   * Clear audio cache and remove any speech files that shouldn't be stored
   */
  const clearCache = useCallback(async () => {
    try {
      if (audioStorage.current) {
        // Remove any speech audio files that shouldn't be stored
        await audioStorage.current.cleanupSpeechFiles();
      }
    } catch (err) {
      console.error('Failed to clear cache:', err);
      throw err;
    }
  }, []);

  return {
    playButtonAudio,
    saveButtonAudio,
    savePreGeneratedAudio,
    generateAudio, // Export generateAudio for direct use
    testTTS,
    stopAudio,
    getVoices,
    searchVoices,
    getVoiceById,
    clearCache,
    isLoading,
    isPlaying,
    musicProgress,
    error
  };
}

/**
 * Helper function to get audio format based on quality setting
 */
function getAudioFormat(quality) {
  switch (quality) {
    case 'low':
      return 'mp3_22050_32';
    case 'medium':
      return 'mp3_44100_64';
    case 'high':
      return 'mp3_44100_128';
    case 'highest':
      return 'mp3_44100_192';
    default:
      return 'mp3_44100_128';
  }
}