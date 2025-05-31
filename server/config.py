"""Configuration settings for the NSFW detection server."""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration."""
    
    # Server settings
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # CORS settings
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'chrome-extension://*').split(',')
    
    # Model settings
    MODEL_PATH = os.getenv('MODEL_PATH', 'model/nsfw_model.h5')
    INPUT_SIZE = (224, 224)  # Model input dimensions
    
    # Detection settings
    NSFW_THRESHOLD = float(os.getenv('NSFW_THRESHOLD', 0.7))
    BATCH_SIZE = int(os.getenv('BATCH_SIZE', 32))
    
    # Cache settings
    CACHE_TIMEOUT = int(os.getenv('CACHE_TIMEOUT', 3600))  # 1 hour
    MAX_CACHE_SIZE = int(os.getenv('MAX_CACHE_SIZE', 1000))
    
    # Rate limiting
    RATE_LIMIT = int(os.getenv('RATE_LIMIT', 100))  # requests per minute
    
class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

# Export the active configuration
config = DevelopmentConfig if os.getenv('FLASK_ENV') == 'development' else ProductionConfig