"""Service for NSFW content detection."""
import tensorflow as tf
import numpy as np
from PIL import Image

from config import config

class DetectorService:
    """Handles NSFW content detection using TensorFlow."""
    
    def __init__(self):
        """Initialize the NSFW detector service."""
        self.model = self._load_model()
        self.nsfw_keywords = self._load_keywords()
        
    def _load_model(self):
        """Load the TensorFlow model."""
        try:
            return tf.keras.models.load_model(config.MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load model, using mock implementation: {e}")
            return None
            
    def _load_keywords(self):
        """Load NSFW keywords for text analysis."""
        return [
            'explicit', 'nude', 'adult content',
            'sex', 'naked', 'intimate scene'
        ]
        
    def _preprocess_image(self, image):
        """Preprocess image for model input."""
        image = image.resize(config.INPUT_SIZE)
        image_array = np.array(image) / 255.0
        return np.expand_dims(image_array, axis=0)
        
    def _analyze_text(self, text):
        """Analyze text for NSFW content."""
        if not text:
            return 0.0
            
        text = text.lower()
        keyword_matches = sum(1 for keyword in self.nsfw_keywords if keyword in text)
        return min(keyword_matches * 0.3, 0.9)  # Cap at 0.9 confidence
        
    def analyze(self, image: Image.Image, text: str = '') -> dict:
        """
        Analyze image and text for NSFW content.
        
        Args:
            image: PIL Image object
            text: Optional subtitle text
            
        Returns:
            dict: Analysis result with NSFW probability
        """
        text_score = self._analyze_text(text)
        
        if self.model is None:
            # Mock implementation for development
            import random
            image_score = random.uniform(0.1, 0.9)
        else:
            # Real model implementation
            preprocessed = self._preprocess_image(image)
            image_score = float(self.model.predict(preprocessed)[0][0])
        
        # Combine scores, giving more weight to image analysis
        final_score = max(image_score * 0.7 + text_score * 0.3, text_score)
        
        return {
            'nsfw': final_score > config.NSFW_THRESHOLD,
            'confidence': round(final_score, 3),
            'timestamp': tf.timestamp().numpy()
        }