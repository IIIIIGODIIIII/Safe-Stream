/**
 * Common utility functions for NSFW detection across different platforms
 */

// UI Service for managing overlays and warnings
class UiService {
  static createWarningOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'nsfw-warning-overlay';
    
    overlay.innerHTML = `
      <div class="nsfw-warning-container">
        <div class="nsfw-warning-icon">⚠️</div>
        <div class="nsfw-warning-message">
          <h3>NSFW Content Detected</h3>
          <p>Sensitive content has been detected in the upcoming scene.</p>
        </div>
        <div class="nsfw-warning-actions">
          <button id="nsfw-skip-btn" class="nsfw-btn nsfw-skip">Skip Scene</button>
          <button id="nsfw-continue-btn" class="nsfw-btn nsfw-continue">Continue Watching</button>
        </div>
      </div>
    `;
    
    return overlay;
  }

  static injectStyles() {
    if (document.querySelector('#nsfw-skipper-styles')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'nsfw-skipper-styles';
    styleSheet.textContent = `
      .nsfw-warning-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      
      .nsfw-warning-overlay.visible {
        opacity: 1;
        pointer-events: auto;
      }
      
      .nsfw-warning-container {
        background-color: #fff;
        border-radius: 8px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transform: translateY(20px);
        transition: transform 0.3s ease;
      }
      
      .nsfw-warning-overlay.visible .nsfw-warning-container {
        transform: translateY(0);
      }
      
      .nsfw-warning-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      .nsfw-warning-message h3 {
        font-size: 20px;
        margin-bottom: 8px;
        color: #1f2937;
      }
      
      .nsfw-warning-message p {
        font-size: 16px;
        color: #4b5563;
        margin-bottom: 20px;
      }
      
      .nsfw-warning-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      
      .nsfw-btn {
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      
      .nsfw-skip {
        background-color: #3b82f6;
        color: white;
      }
      
      .nsfw-skip:hover {
        background-color: #2563eb;
      }
      
      .nsfw-continue {
        background-color: #f3f4f6;
        color: #4b5563;
      }
      
      .nsfw-continue:hover {
        background-color: #e5e7eb;
      }
    `;
    
    document.head.appendChild(styleSheet);
  }
}

// Video Control Service
class VideoControlService {
  static skipScene(videoElement, skipDuration) {
    if (videoElement) {
      videoElement.currentTime += parseInt(skipDuration, 10);
    }
  }
}

// Analysis Service for communicating with background script
class AnalysisService {
  static async analyzeThumbnail(thumbnailUrl, timestamp, subtitleText = '') {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'analyzeThumbnail',
        data: { thumbnailUrl, timestamp, subtitleText }
      }, resolve);
    });
  }
}

// Warning Overlay Manager
class WarningOverlayManager {
  constructor() {
    this.overlay = null;
  }

  showWarning(videoElement, skipDuration) {
    if (!this.overlay) {
      this.overlay = UiService.createWarningOverlay();
      document.body.appendChild(this.overlay);
      UiService.injectStyles();
    }

    this.overlay.classList.add('visible');
    this.setupEventListeners(videoElement, skipDuration);
  }

  hideWarning() {
    if (this.overlay) {
      this.overlay.classList.remove('visible');
    }
  }

  setupEventListeners(videoElement, skipDuration) {
    const skipBtn = document.getElementById('nsfw-skip-btn');
    const continueBtn = document.getElementById('nsfw-continue-btn');

    const newSkipBtn = skipBtn.cloneNode(true);
    const newContinueBtn = continueBtn.cloneNode(true);
    
    skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
    continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);

    newSkipBtn.addEventListener('click', () => {
      VideoControlService.skipScene(videoElement, skipDuration);
      this.hideWarning();
    });

    newContinueBtn.addEventListener('click', () => {
      this.hideWarning();
    });
  }
}

// Export services and managers
export {
  AnalysisService,
  VideoControlService,
  WarningOverlayManager
};