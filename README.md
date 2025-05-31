# NSFW Content Skipper Chrome Extension

A Chrome extension that detects and skips NSFW content on OTT platforms like Netflix and YouTube. It uses the thumbnail preview feature that appears when hovering over the progress bar to analyze content before it plays.

## How It Works

1. When you hover over the video progress bar, the extension captures the thumbnail preview images
2. These images are analyzed for NSFW content
3. If NSFW content is detected, a warning overlay appears with options to skip or continue
4. If auto-skip is enabled, the NSFW scene is automatically skipped

## Features

- Detects NSFW content using thumbnail preview images
- Provides warning overlays before NSFW content plays
- Option to automatically skip NSFW scenes
- Customizable sensitivity settings
- Support for Netflix and YouTube (with more platforms coming soon)
- Privacy-focused design (processing happens locally in the browser)

## Project Structure

```
nsfw-skipper/
├── extension/               # Chrome extension files
│   ├── manifest.json        # Extension configuration
│   ├── icons/               # Extension icons
│   ├── popup/               # Extension popup UI
│   ├── content_scripts/     # Platform-specific content scripts
│   ├── background.js        # Background script for API communication
│   └── styles.css           # Shared styles
```

## Installation Instructions

### Loading the Extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click "Load unpacked" and select the `extension` folder from this repository
5. The extension should now appear in your extensions list and toolbar

### Setting Up the Local Server (For Full Functionality)

To enable full NSFW detection capabilities, you need to set up a local server with an NSFW detection model. This repository contains a mock implementation for demonstration purposes.

In a future update, we'll provide the complete server implementation.

## Usage

1. Navigate to a supported streaming platform (Netflix or YouTube)
2. Start playing a video
3. Hover over the progress bar to preview content
4. If NSFW content is detected, you'll see a warning overlay with options to skip or continue
5. Click on the extension icon in the toolbar to access settings and customize behavior

## Settings

- **Enable/Disable**: Turn the extension on or off
- **Auto-Skip**: Automatically skip NSFW scenes without showing the warning
- **Sensitivity**: Adjust how sensitive the NSFW detection should be
- **Skip Duration**: Set how many seconds to skip forward when NSFW content is detected

## Privacy

This extension is designed with privacy in mind:

- No data is sent to external servers (except for the local analysis server)
- No browsing history or personal data is collected
- All processing happens locally on your device

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.