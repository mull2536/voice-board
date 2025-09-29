import axios from 'axios';

// ElevenLabs API configuration
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * ElevenLabs API service for TTS, sound effects, and music generation
 */
class ElevenLabsService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: ELEVENLABS_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Update API key for authenticated requests
   */
  updateApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Text-to-Speech with emotional audio tags
   * @param {string} text - Text to convert to speech
   * @param {string} voiceId - Voice ID to use
   * @param {Object} options - Additional options
   * @returns {Promise<Blob>} Audio blob
   */
  async textToSpeech(text, voiceId = 'pNInz6obpgDQGcFmaJgB', options = {}) {
    try {
      const {
        modelId = 'eleven_v3', // Use eleven_v3 model
        outputFormat = 'mp3_44100_128',
        voiceSettings = {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      } = options;

      const requestBody = {
        text: text,
        model_id: modelId,
        voice_settings: voiceSettings
      };

      // Add output_format if specified
      if (outputFormat) {
        requestBody.output_format = outputFormat;
      }

      console.log('TTS Request:', {
        url: `/text-to-speech/${voiceId}`,
        body: requestBody,
        headers: { 'xi-api-key': this.apiKey }
      });

      const response = await this.client.post(
        `/text-to-speech/${voiceId}`,
        requestBody,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('TTS Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Try to read error message if it's a blob
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          console.error('TTS Error Response Text:', errorText);
          throw new Error(`TTS API Error: ${errorText}`);
        } catch (blobError) {
          console.error('Could not read error blob:', blobError);
        }
      }

      throw new Error(`Text-to-Speech failed: ${error.message}`);
    }
  }

  /**
   * Generate sound effects from text prompt
   * @param {string} prompt - Description of the sound effect
   * @param {Object} options - Generation options
   * @returns {Promise<Blob>} Audio blob
   */
  async generateSoundEffect(prompt, options = {}) {
    try {
      const {
        duration = 5.0,
        loop = false,
        modelId = 'eleven_text_to_sound_v2'
      } = options;

      // Ensure duration is within bounds (0.5 - 30 seconds)
      const clampedDuration = Math.max(0.5, Math.min(30, duration));

      const response = await this.client.post(
        '/sound-generation',
        {
          text: prompt,
          duration_seconds: clampedDuration,
          loop: loop,
          model_id: modelId
        },
        {
          responseType: 'blob',
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Sound Effect Error:', error.response?.data || error.message);

      // If we have response data as a blob, try to read it as text to get the actual error
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          console.error('Sound Effect API Error Details:', errorText);
        } catch (e) {
          console.error('Could not read error blob:', e);
        }
      }

      throw new Error(`Sound effect generation failed: ${error.message}`);
    }
  }

  /**
   * Generate music from text prompt using streaming endpoint
   * @param {string} prompt - Description of the music
   * @param {Object} options - Generation options
   * @returns {Promise<Blob>} Audio blob
   */
  async generateMusicStream(prompt, options = {}) {
    try {
      const {
        duration = 30, // seconds
        forceInstrumental = false,
        modelId = 'music_v1',
        onProgress = null // Callback for progress updates
      } = options;

      // Convert seconds to milliseconds and ensure within bounds (10-300 seconds)
      const durationMs = Math.max(10000, Math.min(300000, duration * 1000));

      const requestBody = {
        prompt: prompt,
        music_length_ms: durationMs,
        force_instrumental: forceInstrumental,
        model_id: modelId
      };

      console.log('Music Streaming Request:', {
        url: '/music/stream',
        body: requestBody,
        headers: { 'xi-api-key': this.apiKey }
      });

      const response = await this.client.post(
        '/music/stream',
        requestBody,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          onDownloadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
            }
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Music Streaming Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Try to read error message if it's a blob
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          console.error('Music Streaming API Error Details:', errorText);
          throw new Error(`Music Streaming API Error: ${errorText}`);
        } catch (blobError) {
          console.error('Could not read error blob:', blobError);
        }
      }

      throw new Error(`Music streaming failed: ${error.message}`);
    }
  }

  /**
   * Generate music from text prompt (original endpoint)
   * @param {string} prompt - Description of the music
   * @param {Object} options - Generation options
   * @returns {Promise<Blob>} Audio blob
   */
  async generateMusic(prompt, options = {}) {
    try {
      const {
        duration = 30, // seconds
        forceInstrumental = false,
        modelId = 'music_v1'
      } = options;

      // Convert seconds to milliseconds and ensure within bounds (10-300 seconds)
      const durationMs = Math.max(10000, Math.min(300000, duration * 1000));

      const requestBody = {
        prompt: prompt,
        music_length_ms: durationMs,
        force_instrumental: forceInstrumental,
        model_id: modelId
      };

      console.log('Music Generation Request:', {
        url: '/music',
        body: requestBody,
        headers: { 'xi-api-key': this.apiKey }
      });

      const response = await this.client.post(
        '/music',
        requestBody,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Music Generation Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Try to read error message if it's a blob
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          console.error('Music Generation API Error Details:', errorText);
          throw new Error(`Music API Error: ${errorText}`);
        } catch (blobError) {
          console.error('Could not read error blob:', blobError);
        }
      }

      throw new Error(`Music generation failed: ${error.message}`);
    }
  }

  /**
   * Get all available voices
   * @returns {Promise<Array>} List of available voices
   */
  async getVoices() {
    try {
      const response = await this.client.get('/voices', {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      return response.data.voices || [];
    } catch (error) {
      console.error('Get Voices Error:', error.response?.data || error.message);
      // Return default voices if API call fails
      return [
        { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
        { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
        { voice_id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew' },
        { voice_id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde' },
        { voice_id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul' },
        { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
        { voice_id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave' }
      ];
    }
  }

  /**
   * Search voices by query
   * @param {string} query - Search query for voice names, descriptions, etc.
   * @param {Object} options - Search options
   * @returns {Promise<Array>} List of matching voices
   */
  async searchVoices(query, options = {}) {
    try {
      const {
        category = null, // 'premade', 'cloned', 'generated', 'professional'
        language = null,
        accent = null,
        age = null, // 'young', 'middle_aged', 'old'
        gender = null, // 'male', 'female'
        use_case = null // 'narration', 'news', 'conversational', etc.
      } = options;

      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category) params.append('category', category);
      if (language) params.append('language', language);
      if (accent) params.append('accent', accent);
      if (age) params.append('age', age);
      if (gender) params.append('gender', gender);
      if (use_case) params.append('use_case', use_case);

      const response = await this.client.get(`/voices/search?${params.toString()}`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      return response.data.voices || [];
    } catch (error) {
      console.error('Search Voices Error:', error.response?.data || error.message);
      // Fallback to regular getVoices if search fails
      const allVoices = await this.getVoices();
      if (query) {
        return allVoices.filter(voice =>
          voice.name.toLowerCase().includes(query.toLowerCase()) ||
          voice.voice_id.toLowerCase().includes(query.toLowerCase()) ||
          (voice.description && voice.description.toLowerCase().includes(query.toLowerCase()))
        );
      }
      return allVoices;
    }
  }

  /**
   * Get specific voice details by ID
   * @param {string} voiceId - Voice ID to get details for
   * @returns {Promise<Object>} Voice details
   */
  async getVoiceById(voiceId) {
    try {
      const response = await this.client.get(`/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get Voice By ID Error:', error.response?.data || error.message);
      throw new Error(`Failed to get voice ${voiceId}: ${error.message}`);
    }
  }

  /**
   * Test API key validity
   * @returns {Promise<boolean>} Whether the API key is valid
   */
  async testApiKey() {
    try {
      await this.getVoices();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Process text with audio tags for TTS
   * @param {string} text - Text with audio tags like [laughing] Hello there
   * @param {string} defaultTag - Default audio tag if none specified
   * @returns {string} Processed text for TTS
   */
  static processTextWithAudioTags(text, defaultTag = 'calmly') {
    // Check if text already has audio tags
    const hasAudioTag = /^\[[\w\s]+\]/.test(text.trim());

    if (!hasAudioTag && defaultTag) {
      return `[${defaultTag}] ${text}`;
    }

    return text;
  }

  /**
   * Extract audio tag from text
   * @param {string} text - Text that may contain audio tags
   * @returns {Object} { tag, cleanText }
   */
  static extractAudioTag(text) {
    const match = text.match(/^\[([\w\s]+)\]\s*(.*)$/);

    if (match) {
      return {
        tag: match[1].toLowerCase(),
        cleanText: match[2] || text
      };
    }

    return {
      tag: null,
      cleanText: text
    };
  }
}

export default ElevenLabsService;