/**
 * Base class for platform-specific implementations
 */
class PlatformManager {
  constructor(settings) {
    this.settings = settings;
    this.videoElement = null;
    this.isAnalyzing = false;
    this.warningOverlay = new WarningOverlayManager();
    this.lastAnalyzedTime = 0;
    this.ANALYSIS_COOLDOWN = 2000; // 2 seconds between analyses
  }

  initialize() {
    this.setupVideoElement();
    this.setupEventListeners();
  }

  setupVideoElement() {
    throw new Error('setupVideoElement must be implemented by platform-specific class');
  }

  setupEventListeners() {
    throw new Error('setupEventListeners must be implemented by platform-specific class');
  }

  async handleThumbnailAnalysis(thumbnailUrl, timestamp, subtitleText) {
    if (!this.settings.enabled || this.isAnalyzing) return;

    const now = Date.now();
    if (now - this.lastAnalyzedTime < this.ANALYSIS_COOLDOWN) return;

    this.isAnalyzing = true;
    this.lastAnalyzedTime = now;

    try {
      const result = await AnalysisService.analyzeThumbnail(thumbnailUrl, timestamp, subtitleText);

      if (result?.nsfw && result.confidence > this.settings.sensitivity / 100) {
        console.log(`NSFW content detected at ${timestamp}s with confidence ${result.confidence}`);

        if (this.settings.autoSkip) {
          VideoControlService.skipScene(this.videoElement, this.settings.skipDuration);
        } else {
          this.warningOverlay.showWarning(this.videoElement, this.settings.skipDuration);
        }
      }
    } catch (error) {
      console.error('Error analyzing thumbnail:', error);
    } finally {
      this.isAnalyzing = false;
    }
  }
}

export { PlatformManager };