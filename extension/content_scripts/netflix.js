import { PlatformManager } from './platform-manager.js';
import { AnalysisService, VideoControlService, WarningOverlayManager } from './utils.js';

class NetflixManager extends PlatformManager {
  setupVideoElement() {
    const newVideoElement = document.querySelector('video');
    if (newVideoElement && newVideoElement !== this.videoElement) {
      this.videoElement = newVideoElement;
      console.log('Found Netflix video player');
    }
  }

  setupEventListeners() {
    // Set up mutation observer for single-page navigation
    const observer = new MutationObserver(() => {
      this.setupVideoElement();
      this.setupTimelineListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.setupTimelineListeners();
  }

  setupTimelineListeners() {
    const checkInterval = setInterval(() => {
      const scrubber = document.querySelector('.timeline-preview');
      if (scrubber) {
        console.log('Found Netflix timeline scrubber');
        clearInterval(checkInterval);

        const timelineContainer = document.querySelector('.scrubber-container');
        if (timelineContainer) {
          timelineContainer.addEventListener('mousemove', this.handleScrubberHover.bind(this));
        }
      }
    }, 1000);

    // Check when mouse moves over the player
    document.addEventListener('mousemove', (e) => {
      const playerHeight = window.innerHeight;
      if (e.clientY > playerHeight - 150 && this.videoElement) {
        const timeline = document.querySelector('.timeline-preview');
        if (timeline) {
          this.handleScrubberHover(e);
        }
      }
    });
  }

  async handleScrubberHover(e) {
    const preview = document.querySelector('.timeline-preview img');
    if (!preview || !preview.src) return;

    const timeText = document.querySelector('.time-remaining')?.textContent;
    if (!timeText) return;

    // Parse timestamp
    const timeParts = timeText.split(':').map(Number);
    let timestamp = 0;
    if (timeParts.length === 2) { // MM:SS
      timestamp = timeParts[0] * 60 + timeParts[1];
    } else if (timeParts.length === 3) { // HH:MM:SS
      timestamp = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    }

    const subtitleText = document.querySelector('.player-timedtext')?.textContent || '';
    await this.handleThumbnailAnalysis(preview.src, timestamp, subtitleText);
  }
}

// Initialize Netflix manager
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
  
  const netflixManager = new NetflixManager(settings);
  netflixManager.initialize();
});

// Listen for settings updates
chrome.runtime.onMessage.addListener(function(message) {
  if (message.action === 'settingsUpdated') {
    settings = message.settings;
  }
  return true;
});