// Cache to store analyzed thumbnail results
const thumbnailCache = new Map();

// Endpoint configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:5000',
  endpoints: {
    analyze: '/analyze'
  }
};

// Analytics service for tracking analysis results
class AnalyticsService {
  static logAnalysis(result, data) {
    console.log('Analysis result:', {
      timestamp: new Date().toISOString(),
      thumbnailUrl: data.thumbnailUrl.substring(0, 50) + '...',
      result
    });
  }
}

// API service for handling server communication
class ApiService {
  static async analyzeThumbnail(data) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing thumbnail:', error);
      throw error;
    }
  }
}

// Cache service for managing thumbnail analysis results
class CacheService {
  static get(key) {
    return thumbnailCache.get(key);
  }

  static set(key, value) {
    if (thumbnailCache.size > 1000) {
      thumbnailCache.clear();
    }
    thumbnailCache.set(key, value);
  }
}

// Message handler for content script communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeThumbnail') {
    handleThumbnailAnalysis(message.data)
      .then(sendResponse)
      .catch(error => {
        console.error('Error in thumbnail analysis:', error);
        sendResponse({ error: 'Analysis failed', nsfw: false });
      });
    
    return true; // Will respond asynchronously
  }
});

// Main analysis handler
async function handleThumbnailAnalysis(data) {
  const { thumbnailUrl, timestamp, subtitleText } = data;
  
  // Check cache first
  const cacheKey = `${thumbnailUrl}-${timestamp}`;
  const cachedResult = CacheService.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Send to server for analysis
    const result = await ApiService.analyzeThumbnail({
      imageUrl: thumbnailUrl,
      subtitleText
    });
    
    // Cache the result
    CacheService.set(cacheKey, result);
    
    // Log for analytics
    AnalyticsService.logAnalysis(result, data);
    
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}