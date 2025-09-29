import JSZip from 'jszip';
import AudioStorageService from './audioStorage';

/**
 * Service for handling backup and restore of all Voiceboard data
 */
class BackupService {
  constructor() {
    this.audioStorage = new AudioStorageService();
  }

  /**
   * Export all data as a downloadable zip file
   * @returns {Promise<void>}
   */
  async exportAllData() {
    try {
      console.log('🎯 Starting data export...');

      // Initialize audio storage
      await this.audioStorage.init();

      // Create ZIP instance
      const zip = new JSZip();

      // Create manifest with metadata
      const manifest = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        appVersion: 'Voiceboard v1.0',
        description: 'Complete Voiceboard backup including settings, buttons, and audio files'
      };

      // Collect all data from localStorage
      const settingsData = this.getLocalStorageData('voiceBoard_settings');
      const gridData = this.getLocalStorageData('voiceBoard_gridData');
      const categoryNames = this.getLocalStorageData('voiceBoard_categoryNames');
      const customizations = this.getLocalStorageData('voiceBoard_categoryCustomizations');

      // Get all audio files from IndexedDB
      console.log('📦 Collecting audio files...');
      const audioFiles = await this.audioStorage.getAllAudio();
      console.log(`Found ${audioFiles.length} audio files to backup`);

      // Add JSON data to zip
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      zip.file('settings.json', JSON.stringify(settingsData, null, 2));
      zip.file('gridData.json', JSON.stringify(gridData, null, 2));
      zip.file('categoryNames.json', JSON.stringify(categoryNames, null, 2));
      zip.file('customizations.json', JSON.stringify(customizations, null, 2));

      // Add audio files to zip
      if (audioFiles.length > 0) {
        const audioFolder = zip.folder('audio');

        for (const audioFile of audioFiles) {
          if (audioFile.blob) {
            // Convert blob to base64 for storage
            const audioData = await this.blobToArrayBuffer(audioFile.blob);
            const fileName = `${audioFile.id}.mp3`;
            audioFolder.file(fileName, audioData);

            // Add metadata file for each audio
            audioFolder.file(`${audioFile.id}.json`, JSON.stringify({
              id: audioFile.id,
              type: audioFile.type,
              label: audioFile.label,
              content: audioFile.content,
              audioTag: audioFile.audioTag,
              timestamp: audioFile.timestamp,
              size: audioFile.size,
              duration: audioFile.duration
            }, null, 2));
          }
        }
      }

      // Generate and download zip
      console.log('🗜️ Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Create download
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const fileName = `voiceboard-backup-${timestamp}.zip`;

      this.downloadBlob(zipBlob, fileName);

      console.log('✅ Export completed successfully');
      return {
        success: true,
        fileName,
        audioCount: audioFiles.length,
        size: this.formatFileSize(zipBlob.size)
      };

    } catch (error) {
      console.error('❌ Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Import data from a backup zip file
   * @param {File} file - The zip file to import
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Import result
   */
  async importData(file, options = { replaceExisting: false }) {
    try {
      console.log('🎯 Starting data import...');

      // Initialize audio storage
      await this.audioStorage.init();

      // Read zip file
      const zip = await JSZip.loadAsync(file);

      // Validate backup structure
      await this.validateBackup(zip);

      // Read manifest
      const manifestFile = await zip.file('manifest.json').async('text');
      const manifest = JSON.parse(manifestFile);

      console.log('📋 Backup info:', manifest);

      // Read JSON data
      const settings = await this.readJsonFile(zip, 'settings.json');
      const gridData = await this.readJsonFile(zip, 'gridData.json');
      const categoryNames = await this.readJsonFile(zip, 'categoryNames.json');
      const customizations = await this.readJsonFile(zip, 'customizations.json');

      // Clear existing data if replace mode
      if (options.replaceExisting) {
        console.log('🧹 Clearing existing data...');
        await this.audioStorage.clearAllAudio();
      }

      // Restore localStorage data
      if (settings) this.setLocalStorageData('voiceBoard_settings', settings);
      if (gridData) this.setLocalStorageData('voiceBoard_gridData', gridData);
      if (categoryNames) this.setLocalStorageData('voiceBoard_categoryNames', categoryNames);
      if (customizations) this.setLocalStorageData('voiceBoard_categoryCustomizations', customizations);

      // Restore audio files
      const audioFolder = zip.folder('audio');
      let audioCount = 0;

      if (audioFolder) {
        console.log('🎵 Restoring audio files...');

        // Get all audio files
        const audioFiles = Object.keys(audioFolder.files).filter(name => name.endsWith('.mp3'));

        for (const fileName of audioFiles) {
          const audioFile = audioFolder.files[fileName];
          const audioId = fileName.replace('.mp3', '');

          // Get metadata if available
          const metadataFileName = `${audioId}.json`;
          let metadata = {};

          if (audioFolder.files[metadataFileName]) {
            const metadataText = await audioFolder.files[metadataFileName].async('text');
            metadata = JSON.parse(metadataText);
          }

          // Get audio data
          const audioArrayBuffer = await audioFile.async('arraybuffer');
          const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });

          // Store in IndexedDB
          await this.audioStorage.storeAudio(audioId, audioBlob, metadata);
          audioCount++;
        }
      }

      console.log('✅ Import completed successfully');
      return {
        success: true,
        manifest,
        audioCount,
        settingsRestored: !!settings,
        gridDataRestored: !!gridData
      };

    } catch (error) {
      console.error('❌ Import failed:', error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Get data from localStorage
   * @param {string} key - localStorage key
   * @returns {Object|null} Parsed data or null
   */
  getLocalStorageData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Set data to localStorage
   * @param {string} key - localStorage key
   * @param {Object} data - Data to store
   */
  setLocalStorageData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to write ${key} to localStorage:`, error);
      throw error;
    }
  }

  /**
   * Validate backup file structure
   * @param {JSZip} zip - Loaded zip file
   */
  async validateBackup(zip) {
    const requiredFiles = ['manifest.json'];

    for (const file of requiredFiles) {
      if (!zip.file(file)) {
        throw new Error(`Invalid backup: Missing ${file}`);
      }
    }

    // Check manifest version compatibility
    try {
      const manifestFile = await zip.file('manifest.json').async('text');
      const manifest = JSON.parse(manifestFile);

      if (!manifest.version) {
        throw new Error('Invalid backup: Missing version in manifest');
      }

      // Could add version compatibility checks here
      console.log(`📦 Backup version: ${manifest.version}`);

    } catch (error) {
      throw new Error(`Invalid manifest: ${error.message}`);
    }
  }

  /**
   * Read and parse JSON file from zip
   * @param {JSZip} zip - Loaded zip file
   * @param {string} fileName - File name to read
   * @returns {Object|null} Parsed JSON or null
   */
  async readJsonFile(zip, fileName) {
    try {
      const file = zip.file(fileName);
      if (!file) return null;

      const text = await file.async('text');
      return JSON.parse(text);
    } catch (error) {
      console.warn(`Failed to read ${fileName}:`, error);
      return null;
    }
  }

  /**
   * Convert blob to ArrayBuffer
   * @param {Blob} blob - Blob to convert
   * @returns {Promise<ArrayBuffer>} ArrayBuffer
   */
  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Download blob as file
   * @param {Blob} blob - Blob to download
   * @param {string} fileName - File name
   */
  downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default BackupService;