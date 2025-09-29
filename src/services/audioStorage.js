/**
 * Audio storage service for managing local audio files
 * Uses IndexedDB for persistent storage of audio blobs
 */

class AudioStorageService {
  constructor() {
    this.dbName = 'VoiceBoardAudio';
    this.dbVersion = 1;
    this.storeName = 'audioFiles';
    this.db = null;
  }

  /**
   * Initialize the IndexedDB database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store for audio files
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Store an audio blob with metadata
   * @param {string} id - Unique identifier for the audio
   * @param {Blob} audioBlob - The audio data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<string>} Storage ID
   */
  async storeAudio(id, audioBlob, metadata = {}) {
    if (!this.db) await this.init();

    const audioData = {
      id,
      blob: audioBlob,
      type: metadata.type || 'speech',
      category: metadata.category || 'basic',
      label: metadata.label || 'Unnamed Audio',
      content: metadata.content || '',
      audioTag: metadata.audioTag || '',
      timestamp: Date.now(),
      size: audioBlob.size,
      duration: metadata.duration || 0,
      ...metadata
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.put(audioData);

      request.onsuccess = () => {
        resolve(id);
      };

      request.onerror = () => {
        reject(new Error('Failed to store audio'));
      };
    });
  }

  /**
   * Retrieve an audio blob by ID
   * @param {string} id - Audio identifier
   * @returns {Promise<Object|null>} Audio data object or null
   */
  async getAudio(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve audio'));
      };
    });
  }

  /**
   * Get all audio files for a specific category
   * @param {string} category - Category name
   * @returns {Promise<Array>} List of audio data objects
   */
  async getAudioByCategory(category) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('category');

      const request = index.getAll(category);

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve audio by category'));
      };
    });
  }

  /**
   * Delete an audio file by ID
   * @param {string} id - Audio identifier
   * @returns {Promise<boolean>} Success status
   */
  async deleteAudio(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Audio deleted: ${id}`);
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete audio'));
      };
    });
  }

  /**
   * Get all stored audio files
   * @returns {Promise<Array>} List of all audio data objects
   */
  async getAllAudio() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve all audio'));
      };
    });
  }

  /**
   * Clear all stored audio files
   * @returns {Promise<boolean>} Success status
   */
  async clearAllAudio() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.clear();

      request.onsuccess = () => {
        console.log('All audio files cleared');
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to clear audio files'));
      };
    });
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>} Storage stats
   */
  async getStorageStats() {
    const allAudio = await this.getAllAudio();

    const stats = {
      totalFiles: allAudio.length,
      totalSize: allAudio.reduce((sum, audio) => sum + (audio.size || 0), 0),
      byType: {},
      byCategory: {}
    };

    // Group by type and category
    allAudio.forEach(audio => {
      // By type
      if (!stats.byType[audio.type]) {
        stats.byType[audio.type] = { count: 0, size: 0 };
      }
      stats.byType[audio.type].count++;
      stats.byType[audio.type].size += audio.size || 0;

      // By category
      if (!stats.byCategory[audio.category]) {
        stats.byCategory[audio.category] = { count: 0, size: 0 };
      }
      stats.byCategory[audio.category].count++;
      stats.byCategory[audio.category].size += audio.size || 0;
    });

    return stats;
  }

  /**
   * Generate a unique ID for audio storage based on button ID
   * @param {string|number} buttonId - Button unique ID
   * @returns {string} Unique ID
   */
  static generateAudioId(buttonId) {
    return `button_${buttonId}`;
  }

  /**
   * Convert blob to audio URL for playback
   * @param {Blob} audioBlob - Audio blob
   * @returns {string} Object URL
   */
  static createAudioUrl(audioBlob) {
    return URL.createObjectURL(audioBlob);
  }

  /**
   * Revoke audio URL to free memory
   * @param {string} url - Object URL to revoke
   */
  static revokeAudioUrl(url) {
    URL.revokeObjectURL(url);
  }

  /**
   * Clean up any speech files that shouldn't be stored
   * Speech should always be regenerated, never cached
   */
  async cleanupSpeechFiles() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const allRecords = request.result;
        const speechRecords = allRecords.filter(record => record.type === 'speech');

        if (speechRecords.length === 0) {
          console.log('🗣️ No speech files found to clean up');
          resolve();
          return;
        }

        console.log(`🧹 Found ${speechRecords.length} speech files to remove`);

        // Delete each speech record
        const deletePromises = speechRecords.map(record => {
          return new Promise((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(record.id);
            deleteRequest.onsuccess = () => {
              console.log(`🗑️ Removed speech file: ${record.id}`);
              resolveDelete();
            };
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            console.log('✅ All speech files cleaned up');
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export default AudioStorageService;