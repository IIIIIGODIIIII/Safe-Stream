import { PlatformManager } from './platform-manager.js';
import { AnalysisService, VideoControlService, WarningOverlayManager } from './utils.js';

class YouTubeManager extends PlatformManager {
  setupVideoElement() {
    const newVideoElement = document.querySelector('video.html5-main-video');
    if (newVideoElement && newVideoElement !== this.videoElement) {
      this.videoElement = newVideoElement;
      console.log('Found YouTube video player');
    }
  }

  setupEventListeners() {
    // Set up mutation observer for single-page navigation
    const observer = new MutationObserver(() => {
      this.setupVideoElement();
      this.setupPreviewListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.setupPreviewListeners();
  }

  setupPreviewListeners() {
    const progressBar = document.querySelector('.ytp-progress-bar-container');
    if (progressBar) {
      console.log('Found YouTube progress bar');
      
      // Remove any existing listener
      progressBar.removeEventListener('mousemove', this.handleProgressBarHover.bind(this));
      
      // Add the event listener
      progressBar.addEventListener('mousemove', this.handleProgressBarHover.bind(this));
    }
  }

  async handleProgressBarHover(e) {
    const previewImg = document.querySelector('.ytp-tooltip-img img');
    if (!previewImg || !previewImg.src) return;

    const timeText = document.querySelector('.ytp-tooltip-text')?.textContent;
    if (!timeText) return;

    // Parse timestamp
    const timeParts = timeText.split(':').map(Number);
    let timestamp = 0;
    if (timeParts.length === 2) { // MM:SS
      timestamp = timeParts[0] * 60 + timeParts[1];
    } else if (timeParts.length === 3) { // H:MM:SS
      timestamp = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    }

    const subtitleText = document.querySelector('.captions-text')?.textContent || '';
    await this.handleThumbnailAnalysis(previewImg.src, timestamp, subtitleText);
  }
}

// Initialize YouTube manager
let settings = {
  enabled: true,
  autoSkip: false,
  sensitivity: 70,
  skipDuration: 10
};

// Load settings
chrome.storage.sync.get('settings', function(data) {
  if (data.settings) {
    settings = data.settings;
  }
  
  const youtubeManager = new YouTubeManager(settings);
  youtubeManager.initialize();
});

// Listen for settings updates
chrome.runtime.onMessage.addListener(function(message) {
  if (message.action === 'settingsUpdated') {
    settings = message.settings;
  }
  return true;
});