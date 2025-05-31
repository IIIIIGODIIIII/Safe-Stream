document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  loadSettings();

  // Add event listeners
  const enableToggle = document.getElementById('enableToggle');
  const autoSkipToggle = document.getElementById('autoSkipToggle');
  const sensitivitySlider = document.getElementById('sensitivitySlider');
  const skipDuration = document.getElementById('skipDuration');

  enableToggle.addEventListener('change', function() {
    const enabled = this.checked;
    updateStatusDisplay(enabled);
    saveSettings();
  });

  autoSkipToggle.addEventListener('change', saveSettings);
  sensitivitySlider.addEventListener('input', saveSettings);
  skipDuration.addEventListener('change', saveSettings);
});

function updateStatusDisplay(enabled) {
  const status = document.getElementById('status');
  const statusText = status.querySelector('.status-text');
  
  if (enabled) {
    status.classList.remove('disabled');
    statusText.textContent = 'Enabled';
  } else {
    status.classList.add('disabled');
    statusText.textContent = 'Disabled';
  }
}

function saveSettings() {
  const settings = {
    enabled: document.getElementById('enableToggle').checked,
    autoSkip: document.getElementById('autoSkipToggle').checked,
    sensitivity: document.getElementById('sensitivitySlider').value,
    skipDuration: document.getElementById('skipDuration').value
  };

  chrome.storage.sync.set({ settings: settings }, function() {
    // Notify content scripts about settings change
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(tab => {
        if (tab.url.includes('netflix.com') || tab.url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tab.id, { 
            action: 'settingsUpdated', 
            settings: settings 
          });
        }
      });
    });
  });
}

function loadSettings() {
  chrome.storage.sync.get('settings', function(data) {
    if (data.settings) {
      const settings = data.settings;
      document.getElementById('enableToggle').checked = settings.enabled;
      document.getElementById('autoSkipToggle').checked = settings.autoSkip;
      document.getElementById('sensitivitySlider').value = settings.sensitivity;
      document.getElementById('skipDuration').value = settings.skipDuration;
      
      updateStatusDisplay(settings.enabled);
    }
  });
}