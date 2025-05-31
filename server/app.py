"""Main Flask application for NSFW content detection."""
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from config import config
from services.detector_service import DetectorService
from services.image_service import ImageService
from utils.rate_limiter import RateLimiter
from utils.cache import Cache

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)
CORS(app, origins=config.ALLOWED_ORIGINS)

# Initialize services
image_service = ImageService()
detector_service = DetectorService()
rate_limiter = RateLimiter(config.RATE_LIMIT)
cache = Cache(config.MAX_CACHE_SIZE, config.CACHE_TIMEOUT)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})

@app.route('/analyze', methods=['POST'])
@rate_limiter.limit
def analyze():
    """Analyze an image for NSFW content."""
    try:
        data = request.get_json()
        
        if not data or 'imageUrl' not in data:
            return jsonify({'error': 'Missing image data'}), 400
            
        image_url = data['imageUrl']
        subtitle_text = data.get('subtitleText', '')
        
        # Check cache first
        cache_key = f"{image_url}:{subtitle_text}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return jsonify(cached_result)
        
        # Process image
        image = image_service.get_image(image_url)
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400
            
        # Analyze image
        result = detector_service.analyze(image, subtitle_text)
        
        # Cache result
        cache.set(cache_key, result)
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(port=config.PORT, debug=config.DEBUG)